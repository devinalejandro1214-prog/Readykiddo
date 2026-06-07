/**
 * zoey.js — ReadyKiddo Zoey AI Advisor
 * Netlify serverless function proxying Gemini 2.0 Flash.
 *
 * ENV VARS REQUIRED (set in Netlify Dashboard → Site → Environment Variables):
 *   GEMINI_API_KEY  — your Google AI Studio API key
 *
 * Endpoint: POST /api/zoey
 * Body:     { message: string, childContext: { name, ageRange, completedGames[], totalSessions } }
 * Response: { reply: string } or { error: string }
 */

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const MAX_MESSAGE_LENGTH = 500;
const DAILY_LIMIT        = 20; // soft cap per request (Gemini enforces its own)

// ── CORS ─────────────────────────────────────────────────────
function corsHeaders(event) {
  const origin = event.headers?.origin || '*';
  return {
    'Access-Control-Allow-Origin':  origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function json(statusCode, body, headers) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

// ── Build system prompt from child context ────────────────────
// NOTE: Child name is intentionally NOT sent to the Gemini API.
// Free-tier requests are used to improve Google products; sending a child's
// name would violate COPPA data minimization principles. Zoey refers to
// "your child" in all API calls. The parent sees the real name in the UI only.
function buildSystemPrompt(ctx) {
  const gameList = ctx.completedGames?.length
    ? ctx.completedGames.join(', ')
    : 'none yet';

  return `You are Zoey, a warm and encouraging early childhood learning advisor for ReadyKiddo — an educational app for children ages 3 to 5.

You are speaking with the parent of a child. Here is their child's profile:
- Age range: ${ctx.ageRange || '3-5'} years old
- Games completed (${ctx.totalSessions || 0} of 11): ${gameList}

Your role:
- Give warm, practical, specific advice based on this child's actual progress
- Keep responses to 2 to 4 sentences — parents are busy
- Refer to the child as "your child" (never use a name — the parent knows who we mean)
- Suggest simple offline activities that reinforce what the child is learning
- Use encouraging, positive, age-appropriate language
- Be specific to the 3–5 year developmental stage
- Never suggest increasing screen time as a solution
- If asked about medical or clinical concerns, warmly recommend consulting their pediatrician

You are a learning advisor, not a medical professional. Keep all advice grounded in early childhood education best practices.`;
}

// ── Handler ───────────────────────────────────────────────────
exports.handler = async function zoeyHandler(event) {
  const headers = corsHeaders(event);

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' }, headers);
  }

  // API key guard
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Zoey] GEMINI_API_KEY env var not set');
    return json(500, { error: 'Zoey is not configured yet. Ask the admin to add the API key.' }, headers);
  }

  // Parse body
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid request body' }, headers);
  }

  const { message, childContext = {} } = payload;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return json(400, { error: 'Message is required' }, headers);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return json(400, { error: 'Message too long (max 500 characters)' }, headers);
  }

  // Call Gemini
  const systemPrompt = buildSystemPrompt(childContext);

  let geminiRes;
  try {
    geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role:  'user',
            parts: [{ text: message.trim() }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 256,
          temperature:     0.7,
          topP:            0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });
  } catch (err) {
    console.error('[Zoey] Gemini fetch error:', err.message);
    return json(502, { error: 'Could not reach Zoey right now. Try again in a moment.' }, headers);
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error('[Zoey] Gemini API error:', geminiRes.status, errText);

    if (geminiRes.status === 429) {
      return json(429, { error: 'Zoey is taking a short break — too many requests. Try again in a minute.' }, headers);
    }
    return json(502, { error: 'Zoey had trouble responding. Please try again.' }, headers);
  }

  const data = await geminiRes.json();

  const reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    ?? "I'm having a little trouble right now — try asking me again!";

  return json(200, { reply }, headers);
};
