// Receives the PM's answers from /design-system/review and posts them to Slack.
// Needs the env var SLACK_REVIEW_WEBHOOK_URL (a Slack incoming webhook URL).
// Only the review page (served at an unguessable URL) knows this key.
const REVIEW_KEY = '002b6094c496';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });
  const hook = process.env.SLACK_REVIEW_WEBHOOK_URL;
  if (!hook) return res.status(503).json({ ok: false, error: 'not configured' });
  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
  const text = String(body.text || '').trim();
  if (body.website) return res.status(200).json({ ok: true }); // honeypot field, bots only
  if (body.key !== REVIEW_KEY) return res.status(403).json({ ok: false, error: 'forbidden' });
  if (!text || text.length > 12000) return res.status(400).json({ ok: false, error: 'bad text' });
  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: ':memo: *MyUS Design System review: answers received*\n```' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/```/g, "'''") + '```' }),
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'slack ' + r.status });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'send failed' });
  }
};
function safeParse(s) { try { return JSON.parse(s); } catch (e) { return {}; } }
