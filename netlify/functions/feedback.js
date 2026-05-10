const DEFAULT_LABELS = ['feedback', 'needs-approval'];
const MAX_MESSAGE_LENGTH = 2000;

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
        const issue = await createGitHubIssue(feedback);

        return jsonResponse(201, {
            ok: true,
            issueUrl: issue && issue.html_url
        }, headers);
    } catch (error) {
        console.error('feedback submission failed', error);
        return jsonResponse(500, { error: 'Feedback could not be submitted.' }, headers);
    }
};

function normalizeFeedback(payload, event) {
    const userAgent = getHeader(event, 'user-agent');

    return {
        type: sanitizeText(payload.type || 'idea', 40),
        message: sanitizeText(payload.message || '', MAX_MESSAGE_LENGTH),
        email: sanitizeText(payload.email || '', 160),
        company: sanitizeText(payload.company || '', 160),
        page: sanitizeText(payload.page || '', 240),
        url: sanitizeText(payload.url || '', 500),
        userAgent: sanitizeText(payload.userAgent || userAgent || '', 500),
        timestamp: new Date().toISOString()
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

async function createGitHubIssue(feedback) {
    const token = process.env.GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;

    if (!token || !repository) {
        throw new Error('GitHub issue creation is not configured.');
    }

    await ensureGitHubLabels(repository, token);

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
        `- User agent: ${feedback.userAgent || 'Unknown'}`,
        `- Timestamp: ${feedback.timestamp}`,
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

async function ensureGitHubLabels(repository, token) {
    const labelDefinitions = [
        { name: 'feedback', color: '0e8a16', description: 'Feedback submitted from the ReadyKiddo site' },
        { name: 'needs-approval', color: 'fbca04', description: 'Needs human approval before agent work' }
    ];

    for (const label of labelDefinitions) {
        const response = await fetch(`https://api.github.com/repos/${repository}/labels`, {
            method: 'POST',
            headers: githubHeaders(token),
            body: JSON.stringify(label)
        });

        if (response.ok || response.status === 422) {
            continue;
        }

        const data = await response.json().catch(() => null);
        throw new Error(`GitHub label creation failed: ${response.status} ${JSON.stringify(data)}`);
    }
}

function githubHeaders(token) {
    return {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'readykiddo-feedback-agent'
    };
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

function getHeader(event, name) {
    const headers = event.headers || {};
    const target = name.toLowerCase();
    const key = Object.keys(headers).find((header) => header.toLowerCase() === target);
    return key ? headers[key] : '';
}
