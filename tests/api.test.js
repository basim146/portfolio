import test from 'node:test';
import assert from 'node:assert/strict';
import contact, { validate } from '../api/contact.js';
import chat from '../api/chat.js';
import { answer, keywordSearch, cosine } from '../api/_lib/rag.js';
import { _resetRateLimit } from '../api/_lib/guard.js';

const mkRes = () => { const r = { code: 200 }; r.status = (c) => { r.code = c; return r; }; r.json = (o) => { r.body = o; return r; }; return r; };
const req = (body, extra = {}) => ({ method: 'POST', body, headers: {}, socket: { remoteAddress: '1.1.1.1' }, ...extra });
const good = { name: 'Ayesha', email: 'a@b.co', subject: 'Internship', message: 'Hello Basim, nice portfolio!', elapsedMs: 5000 };

test('validate rejects bad input', () => {
  const v = validate({ name: 'A', email: 'nope', subject: '', message: 'hi' });
  assert.equal(v.ok, false);
  assert.ok(v.errors.name && v.errors.email && v.errors.subject && v.errors.message);
  assert.equal(validate(good).ok, true);
});
test('contact: bad fields -> 400, honeypot dropped, too-fast rejected, dev success', async () => {
  _resetRateLimit();
  let r = mkRes(); await contact(req({ ...good, email: 'x' }), r); assert.equal(r.code, 400);
  r = mkRes(); await contact(req({ ...good, website: 'spam.com' }), r); assert.equal(r.code, 200);
  r = mkRes(); await contact(req({ ...good, elapsedMs: 100 }), r); assert.equal(r.code, 400);
  r = mkRes(); await contact(req(good), r); assert.equal(r.code, 200); assert.equal(r.body.dev, true);
  r = mkRes(); await contact({ ...req(good), method: 'GET' }, r); assert.equal(r.code, 405);
});
test('contact: rate limit after 3 valid requests', async () => {
  _resetRateLimit();
  let last; for (let i = 0; i < 4; i++) { last = mkRes(); await contact(req(good), last); }
  assert.equal(last.code, 429);
});
test('rag: grounded answers with sources', async () => {
  const a = await answer('What skills does Basim have in Unity?');
  assert.ok(/Unity/.test(a.answer)); assert.ok(a.sources.length);
  const b = await answer('Tell me about Blade of Shadows enemies');
  assert.equal(b.sources[0].id, 'blade');
});
test('rag: refuses ungrounded questions', async () => {
  const a = await answer("What is Basim's favourite pizza topping?");
  assert.match(a.answer, /don't have that information/); assert.deepEqual(a.sources, []);
});
test('chat endpoint validates', async () => {
  _resetRateLimit();
  let r = mkRes(); await chat(req({ message: '' }), r); assert.equal(r.code, 400);
  r = mkRes(); await chat(req({ message: 'x'.repeat(600) }), r); assert.equal(r.code, 400);
  r = mkRes(); await chat(req({ message: 'Where does he study?' }), r); assert.equal(r.code, 200); assert.match(r.body.answer, /NED/);
});
test('cosine', () => { assert.ok(Math.abs(cosine([1, 0], [1, 0]) - 1) < 1e-9); assert.equal(cosine([1, 0], [0, 1]), 0); });
