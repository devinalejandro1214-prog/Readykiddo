const DEFAULT_LABELS = ['feedback', 'needs-approval'];
const MAX_MESSAGE_LENGTH = 2000;
const crypto = require('crypto');

exports.handler = async function feedbackHandler(event) {
    const headers = corsHeaders(event);

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed' }, headers);
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (error) {
        return jsonResponse(400, { error: 'Invalid JSON body' }, headers);
    }

    const feedback = normalizeFeedback(payload, event);
    const validationError = validateFeedback(feedback);
    if (validationError) {
        return jsonResponse(400, { error: validationError }, headers);
    }

    if (feedback.company) {
        return jsonResponse(202, { ok: true }, headers);
    }

    try {
        const savedFeedback = await saveFeedback(feedback);
        const issue = await createGitHubIssue(feedback, savedFeedback);

        if (savedFeedback && issue && savedFeedback.id) {
            await updateFeedbackIssueUrl(savedFeedback.id, issue.html_url);
        }

        return jsonResponse(201, {
            ok: true,
            feedbackId: savedFeedback && savedFeedback.id,
            issueUrl: issue && issue.html_url
        }, headers);
    } catch (error) {
        console.error('feedback submission failed', error);
        return jsonResponse(500, { error: 'Feedback could not be saved.' }, headers);
    }
};

function normalizeFeedback(payload, event) {
    const userAgent = getHeader(event, 'user-agent');
    const ipAddress = getHeader(event, 'x-nf-client-connection-ip') || getHeader(event, 'client-ip');

    return {
        type: sanitizeText(payload.type || 'idea', 40),
        message: sanitizeText(payload.message || '', MAX_MESSAGE_LENGTH),
        email: sanitizeText(payload.email || '', 160),
        company: sanitizeText(payload.company || '', 160),
        page: sanitizeText(payload.page || '', 240),
        url: sanitizeText(payload.url || '', 500),
        userAgent: sanitizeText(payload.userAgent || userAgent || '', 500),
        ipHash: hashIp(ipAddress || '')
    };
}

function validateFeedback(feedback) {
    if (!feedback.message || feedback.message.length < 5) {
        return 'Please include at least a few words of feedback.';
    }

    if (feedback.message.length > MAX_MESSAGE_LENGTH) {
        return 'Feedback is too long.';
    }

    if (feedback.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) {
        return 'Email address is not valid.';
    }

    return null;
}

async function saveFeedback(feedback) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const tableName = process.env.FEEDBACK_TABLE || 'feedback';

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase feedback database is not configured.');
    }

    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify({
            type: feedback.type,
            message: feedback.message,
            email: feedback.email || null,
            page: feedback.page || null,
            url: feedback.url || null,
            user_agent: feedback.userAgent || null,
            ip_hash: feedback.ipHash || null,
            status: 'needs-approval',
            issue_url: null
        })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(`Supabase insert failed: ${response.status} ${JSON.stringify(data)}`);
    }

    return Array.isArray(data) ? data[0] : data;
}

async function updateFeedbackIssueUrl(feedbackId, issueUrl) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const tableName = process.env.FEEDBACK_TABLE || 'feedback';

    await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}?id=eq.${encodeURIComponent(feedbackId)}`, {
        method: 'PATCH',
        headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ issue_url: issueUrl })
    });
}

async function createGitHubIssue(feedback, savedFeedback) {
    const token = process.env.GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;

    if (!token || !repository) {
        throw new Error('GitHub issue creation is not configured.');
    }

    const title = `[Feedback] ${feedback.type}: ${truncate(feedback.message, 72)}`;
    const body = [
        '## Feedback',
        feedback.message,
        '',
        '## Metadata',
        `- Type: ${feedback.type}`,
        `- Page: ${feedback.page || 'Unknown'}`,
        `- URL: ${feedback.url || 'Unknown'}`,
        `- Email: ${feedback.email || 'Not provided'}`,
        `- Feedback ID: ${savedFeedback && savedFeedback.id ? savedFeedback.id : 'Not returned'}`,
        '',
        '## Approval Gate',
        'Add the `approved-for-agent` label only after a human has reviewed this request.',
        'The agent workflow must create a PR and must not merge or deploy production.'
    ].join('\n');

    const response = await fetch(`https://api.github.com/repos/${repository}/issues`, {
        method: 'POST',
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'readykiddo-feedback-agent'
        },
        body: JSON.stringify({ title, body, labels: DEFAULT_LABELS })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(`GitHub issue creation failed: ${response.status} ${JSON.stringify(data)}`);
    }

    return data;
}

function corsHeaders(event) {
    const origin = process.env.ALLOWED_ORIGIN || getHeader(event, 'origin') || '*';
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
}

function jsonResponse(statusCode, body, headers) {
    return { statusCode, headers, body: JSON.stringify(body) };
}

function sanitizeText(value, maxLength) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function truncate(value, maxLength) {
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function hashIp(value) {
    if (!value) return null;
    return crypto
        .createHash('sha256')
        .update(`${process.env.IP_HASH_SALT || 'readykiddo'}:${value}`)
        .digest('hex');
}

function getHeader(event, name) {
    const headers = event.headers || {};
    const target = name.toLowerCase();
    const key = Object.keys(headers).find((header) => header.toLowerCase() === target);
    return key ? headers[key] : '';
}
