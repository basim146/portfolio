import nodemailer from 'nodemailer';
import { rateLimit, clientIp } from './_lib/guard.js';

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export function validate(b) {
  const errors = {};
  const name = String(b.name ?? '').trim();
  const email = String(b.email ?? '').trim();
  const subject = String(b.subject ?? '').trim();
  const message = String(b.message ?? '').trim();
  if (name.length < 2 || name.length > 80) errors.name = 'Please enter your name (2-80 characters).';
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Please enter a valid email address.';
  if (subject.length < 3 || subject.length > 120) errors.subject = 'Please enter a subject (3-120 characters).';
  if (message.length < 10 || message.length > 3000) errors.message = 'Message must be 10-3000 characters.';
  if (/[\r\n]/.test(name + email + subject)) errors.name = 'Invalid characters.'; // header-injection guard
  return { ok: !Object.keys(errors).length, errors, clean: { name, email, subject, message } };
}

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : req.body || {};

  // Spam protection: honeypot (bots fill it) + minimum fill time + per-IP rate limit.
  if (body.website) return res.status(200).json({ ok: true }); // silently drop bots
  if (Number(body.elapsedMs) < 2500) return res.status(400).json({ error: 'That was fast! Please try again.' });
  if (!rateLimit('contact:' + clientIp(req), 3, 10 * 60_000)) return res.status(429).json({ error: 'Too many messages. Please try again later.' });

  const { ok, errors, clean } = validate(body);
  if (!ok) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: errors });

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return res.status(503).json({ error: 'Email is not configured yet. Please email me directly.' });
    }
    console.log('[contact:dev] SMTP not configured. Message NOT sent:', { ...clean, message: clean.message.slice(0, 80) });
    return res.status(200).json({ ok: true, dev: true });
  }
  try {
    const port = Number(SMTP_PORT) || 465;
    const t = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
    await t.sendMail({
      from: `"Portfolio contact" <${SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: `"${clean.name.replace(/"/g, '')}" <${clean.email}>`,
      subject: `Portfolio: ${clean.subject} (from ${clean.name})`.slice(0, 200),
      text: `From: ${clean.name} <${clean.email}>\nSubject: ${clean.subject}\n\n${clean.message}`,
      html: `<p><b>${esc(clean.name)}</b> &lt;${esc(clean.email)}&gt;</p><p><b>${esc(clean.subject)}</b></p><p>${esc(clean.message).replace(/\n/g, '<br>')}</p>`,
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('contact send failed', e.message);
    return res.status(500).json({ error: 'Could not send your message. Please try again or email me directly.' });
  }
}
