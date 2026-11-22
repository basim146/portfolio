import { answer } from './_lib/rag.js';
import { rateLimit, clientIp } from './_lib/guard.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit('chat:' + clientIp(req), 20, 60_000)) return res.status(429).json({ error: 'Too many messages. Please wait a moment.' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 500) return res.status(400).json({ error: 'Message must be 1-500 characters.' });
  const history = Array.isArray(body.history)
    ? body.history.filter((m) => m && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string').slice(-6)
    : [];
  try {
    res.status(200).json(await answer(message, history, ['en', 'ur', 'fr', 'tr', 'de', 'ar'].includes(body.lang) ? body.lang : 'en'));
  } catch {
    res.status(500).json({ error: 'The assistant is unavailable right now.' });
  }
}
const safeParse = (s) => { try { return JSON.parse(s); } catch { return {}; } };
