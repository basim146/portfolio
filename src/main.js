import './loader.js';
import { t, getLang, setLang, applyDom, onLang, LANGS } from './i18n.js';
import './style.css';
import { initScene } from './scene.js';
import { SKILLS, MAIL, GH, LI, WHATSAPP, CV_URL, VIDEO_URL, AVATAR_URL, GAME_URL, GAME_MODE, PROJECTS, TICKER, ZONE_TO_SECTION } from './config.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// footer + ticker
$('#links').innerHTML = `<a class="btn lk" href="${esc(CV_URL)}" target="_blank" rel="noopener" data-i18n="view_cv">View my CV</a><a class="btn lk wa" href="${esc(WHATSAPP)}?text=${encodeURIComponent('Hi Basim, I found your portfolio and would like to chat.')}" target="_blank" rel="noopener" data-i18n="whatsapp">Chat on WhatsApp</a><a class="btn lk" href="${esc(GH)}" target="_blank" rel="noopener">GitHub</a><a class="btn lk" href="${esc(LI)}" target="_blank" rel="noopener">LinkedIn</a>`;
const TK_KEYS = { 'Class of 2027': 'tk_class', 'NED University': 'tk_ned', '5 games built': 'tk_games' };
const tk = TICKER.map((x) => `<span${TK_KEYS[x] ? ` data-i18n="${TK_KEYS[x]}"` : ''}>${esc(x)}</span><span><b>✺</b></span>`).join('');
$('#tk').innerHTML = tk + tk;

// case studies
const slot = (src, label, poster = '') => {
  if (!src) return `<div>${label}</div>`;
  return /\.(mp4|webm)$/i.test(src)
    ? `<div><video src="${esc(src)}" poster="${esc(poster)}" aria-label="${esc(label)}" controls playsinline preload="metadata"></video></div>`
    : `<div><img src="${esc(src)}" alt="${esc(label)}" loading="lazy"></div>`;
};
$('#cs').innerHTML = PROJECTS.map((p, i) => `<article class="cs rv"><div><span class="n">0${i + 1} / 0${PROJECTS.length}</span><h3 style="margin-bottom:18px">${esc(p.title)}</h3>${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
  <p style="margin:12px 0 22px;font-size:17px" data-i18n="p${i}">${esc(p.text)}</p>
  ${p.play ? '<button class="btn" data-play data-i18n="play_now">▶ Play now</button>' : '<a class="btn o" href="#contact" data-i18n="req_source">Request source →</a>'}</div>
  <div class="imgs">${slot(p.media[0], p.title + ' gameplay video', p.media[1])}${slot(p.media[1], p.title + ' screenshot 1')}${slot(p.media[2], p.title + ' screenshot 2')}</div></article>`).join('');

// skills section
$('#sk').innerHTML = SKILLS.map((g) => `<div class="card sk"><h3 data-i18n="${g.g}"></h3>${g.items.map(([n, lvl, pct, note]) => lvl
  ? `<div class="skrow"><div class="skhead"><span>${esc(n)}${note ? ` · ${esc(note)}` : ''}</span><em data-i18n="${lvl}"></em></div><div class="bar" role="img" aria-label="${esc(n)} ${pct}%"><i style="--w:${pct}%"></i></div></div>`
  : `<span class="chip"${g.tr ? ` data-i18n="${n}"` : ''}>${g.tr ? '' : esc(n)}</span>`).join('')}</div>`).join('');
// achievement counters
const countIo = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; countIo.unobserve(e.target); const to = +e.target.dataset.count; if (matchMedia('(prefers-reduced-motion: reduce)').matches) { e.target.textContent = to; return; } let n = 0; const id = setInterval(() => { n++; e.target.textContent = n; if (n >= to) clearInterval(id); }, 140); }), { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => countIo.observe(el));

// project search, filter chips and sorting
const cards = [...document.querySelectorAll('#cs .cs')];
const CHIPS = ['Unity', 'Unreal Engine', 'C++', 'Three.js', 'VR', 'AI', 'Playable'];
let chip = 'all';
$('#pchips').innerHTML = ['all', ...CHIPS].map((c) => `<button type="button" class="pc${c === 'all' ? ' on' : ''}" data-chip="${c}" aria-pressed="${c === 'all'}"${c === 'all' ? ' data-i18n="f_all"' : ''}>${c === 'all' ? '' : esc(c)}</button>`).join('');
function applyProjects() {
  const q = $('#psearch').value.trim().toLowerCase(), sort = $('#psort').value;
  let shown = 0;
  const order = PROJECTS.map((p, i) => i);
  if (sort === 'az') order.sort((a, b) => PROJECTS[a].title.localeCompare(PROJECTS[b].title));
  if (sort === 'play') order.sort((a, b) => (PROJECTS[b].play ? 1 : 0) - (PROJECTS[a].play ? 1 : 0) || a - b);
  cards.forEach((el, i) => {
    const p = PROJECTS[i], hay = (p.title + ' ' + p.text + ' ' + p.tags.join(' ')).toLowerCase();
    const okChip = chip === 'all' || p.tags.some((tg) => tg.toLowerCase() === chip.toLowerCase()) || (chip === 'Playable' && p.play);
    const ok = okChip && (!q || hay.includes(q));
    el.hidden = !ok; el.style.order = order.indexOf(i); if (ok) { shown++; el.classList.add('in'); }
  });
  $('#pcount').textContent = t('f_count').replace('{n}', shown).replace('{m}', PROJECTS.length);
  $('#pnone').hidden = shown > 0;
}
$('#cs').style.display = 'flex'; $('#cs').style.flexDirection = 'column';
$('#psearch').addEventListener('input', applyProjects); $('#psort').addEventListener('change', applyProjects);
$('#pchips').addEventListener('click', (e) => { const b = e.target.closest('[data-chip]'); if (!b) return; chip = b.dataset.chip; document.querySelectorAll('#pchips .pc').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); applyProjects(); });

// Only the visible project may keep playing. Never autoplay after leaving view.
const projectVideos=[...document.querySelectorAll('.imgs video')];
const pauseProjects=()=>projectVideos.forEach(v=>v.pause());
const mediaObserver=new IntersectionObserver(entries=>entries.forEach(({target,intersectionRatio})=>{if(intersectionRatio<.25)target.pause();}),{threshold:[0,.25]});
projectVideos.forEach(v=>{
  mediaObserver.observe(v);
  v.addEventListener('play',()=>{
    projectVideos.filter(other=>other!==v).forEach(other=>other.pause());
    document.dispatchEvent(new Event('pause-intro'));
  });
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseProjects();});
document.addEventListener('pause-portfolio-media',pauseProjects);

// reveal on scroll
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: 0.12 });
document.querySelectorAll('.rv').forEach((e) => io.observe(e));

// game overlay
const gameEl = $('#game');
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-play]') && GAME_MODE === 'tab') { document.dispatchEvent(new Event('pause-portfolio-media')); window.open(GAME_URL, '_blank', 'noopener'); }
  else if (e.target.closest('[data-play]')) { document.dispatchEvent(new Event('pause-portfolio-media')); document.dispatchEvent(new Event('game-open')); $('#game iframe').src = GAME_URL; $('#gnew').href = GAME_URL; gameEl.style.display = 'block'; }
});
const closeGame = () => { if (gameEl.style.display !== 'block') return; gameEl.style.display = 'none'; $('#game iframe').src = 'about:blank'; document.dispatchEvent(new Event('game-close')); };
$('#gx').onclick = closeGame;
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeGame(); $('#chat').style.display = 'none'; closeMenu(); } });

// theme + mobile menu + hero disc tilt
const root = document.documentElement;
try { if (localStorage.getItem('theme')) root.dataset.theme = localStorage.getItem('theme'); } catch {}
const setThemeLabel = () => { $('#th').textContent = root.dataset.theme === 'dark' ? t('light') : t('dark'); };
$('#th').onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('theme', root.dataset.theme); } catch {} setThemeLabel(); };
setThemeLabel();
// language switcher
const langSel = $('#lang');
langSel.innerHTML = Object.entries(LANGS).map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
langSel.value = getLang();
langSel.onchange = () => setLang(langSel.value);
onLang((l) => { langSel.value = l; setThemeLabel(); applyProjects(); });
addEventListener('scroll', () => $('nav').classList.toggle('solid', scrollY > 24), { passive: true });
const menu = $('#mnav'), menuButton = $('#menu-btn');
let menuReturnFocus = null;
function closeMenu() {
  if(menu.hidden) return;
  menu.hidden=true;menu.classList.remove('open');document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded','false');menuReturnFocus?.focus();
}
function openMenu() {
  menuReturnFocus=document.activeElement;menu.hidden=false;menu.classList.add('open');document.body.classList.add('menu-open');
  menuButton.setAttribute('aria-expanded','true');document.dispatchEvent(new Event('pause-portfolio-media'));$('#menu-close').focus();
}
menuButton.onclick = openMenu;
$('#menu-close').onclick = closeMenu;
menu.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const items=[...menu.querySelectorAll('a,button')],first=items[0],last=items.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
$('#mnav').onclick = (e) => { if (e.target.closest('a')) closeMenu(); };
const disc = $('#disc');
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('pointermove', (e) => { const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5; disc.style.transform = `perspective(900px) rotateY(${x * 24}deg) rotateX(${-y * 24}deg)`; });
}

// contact form -> /api/contact (validated again on the server)
const startedAt = Date.now();
document.querySelectorAll('.opt').forEach((g) => g.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') { g.querySelectorAll('button').forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }); e.target.classList.add('on'); e.target.setAttribute('aria-pressed', 'true'); }
}));
$('#f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target, m = $('#cm'), btn = f.querySelector('button[type=submit]');
  const v = (n) => f[n].value.trim(), opt = (k) => (f.querySelector(`[data-k=${k}] .on`) || {}).textContent || '-';
  f.querySelectorAll('.err').forEach((s) => { s.textContent = ''; });
  m.style.display = 'block'; m.className = '';
  const errs = {};
  if (v('name').length < 2) errs.name = t('err_name');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v('email'))) errs.email = t('err_email');
  if (v('subject').length < 3 || v('subject').length > 120) errs.subject = t('err_subject');
  if (v('message').length < 10) errs.message = t('err_message');
  if (Object.keys(errs).length) {
    Object.entries(errs).forEach(([k, t]) => { f.querySelector(`.err[data-for=${k}]`).textContent = t; });
    m.className = 'e'; m.textContent = t('fix'); return;
  }
  btn.disabled = true; m.textContent = t('sending');
  try {
    const r = await fetch('api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      name: v('name'), email: v('email'), subject: v('subject'), website: f.website.value,
      message: `${v('message')}\n\nInterested in: ${opt('w')}\nTimeline: ${opt('t')}`, elapsedMs: Date.now() - startedAt }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { m.textContent = j.dev ? t('sent_dev') : t('sent'); f.reset(); f.querySelectorAll('.opt .on').forEach((b) => b.classList.remove('on')); }
    else { m.className = 'e'; m.textContent = j.error || t('generic_err'); Object.entries(j.fields || {}).forEach(([k, t]) => { const s = f.querySelector(`.err[data-for=${k}]`); if (s) s.textContent = t; }); }
  } catch { m.className = 'e'; m.textContent = t('net_err'); }
  btn.disabled = false;
});

// chat -> /api/chat (RAG)
const lg = $('#log'), ch = $('#chat'), hist = [];
function say(txt, u, sources = []) {
  const x = document.createElement('div'); x.className = 'b' + (u ? ' u' : ''); x.textContent = txt;
  const seen = new Set();
  sources.slice(0, 2).forEach((s) => {
    const sec = ZONE_TO_SECTION[s.zone]; if (!sec || seen.has(sec)) return; seen.add(sec);
    const a = document.createElement('a'); a.href = '#' + sec; a.className = 'btn o cite'; a.textContent = `${t('chat_see')} ${s.title}`;
    a.onclick = () => { ch.style.display = 'none'; }; x.append(a);
  });
  lg.append(x); lg.scrollTop = 1e5; return x;
}
const hiBubble = say(t('chat_hi'));
onLang(() => { if (lg.children.length === 1) hiBubble.textContent = t('chat_hi'); });
$('#ask').onclick = () => { ch.style.display = ch.style.display === 'flex' ? 'none' : 'flex'; if (ch.style.display === 'flex') $('#q').focus(); };
$('#cf').onsubmit = async (e) => {
  e.preventDefault();
  const raw = $('#q').value.trim(); if (!raw) return;
  say(raw, 1); $('#q').value = '';
  const wait = say('…');
  try {
    const r = await fetch('api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: raw, lang: getLang(), history: hist.slice(-6) }) });
    const j = await r.json(); wait.remove();
    if (!r.ok) say(j.error || t('generic_err'));
    else { say(j.answer, 0, j.sources || []); speak(j.answer); hist.push({ role: 'user', text: raw }, { role: 'bot', text: j.answer }); if (j.mode === 'demo') $('#chat-note').textContent = t('chat_demo'); }
  } catch { wait.remove(); say(t('chat_fail')); }
};

applyDom();
// voice interaction: speech-to-text for questions, text-to-speech for answers (browser Web Speech API)
const VOICE = { en: 'en-US', ur: 'ur-PK', fr: 'fr-FR', tr: 'tr-TR', de: 'de-DE', ar: 'ar-SA' };
const SR = window.SpeechRecognition || window.webkitSpeechRecognition, mic = $('#mic'), spk = $('#speak');
let speakOn = false;
if (!SR) mic.hidden = true;
else mic.onclick = () => {
  const rec = new SR(); rec.lang = VOICE[getLang()]; rec.interimResults = false; rec.maxAlternatives = 1;
  rec.onstart = () => { mic.classList.add('rec'); $('#chat-note').textContent = t('mic_listen'); };
  rec.onresult = (e) => { $('#q').value = e.results[0][0].transcript; $('#cf').requestSubmit(); };
  rec.onerror = () => { $('#chat-note').textContent = t('mic_unsupported'); };
  rec.onend = () => { mic.classList.remove('rec'); if ($('#chat-note').textContent === t('mic_listen')) $('#chat-note').textContent = t('chat_note'); };
  try { rec.start(); } catch { /* already listening */ }
};
if (!('speechSynthesis' in window)) spk.hidden = true;
spk.onclick = () => { speakOn = !speakOn; spk.textContent = speakOn ? '🔊' : '🔇'; spk.setAttribute('aria-pressed', speakOn); spk.setAttribute('aria-label', t(speakOn ? 'speak_off' : 'speak_on')); if (!speakOn) speechSynthesis.cancel(); };
const speak = (text) => { if (!speakOn || !('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = VOICE[getLang()]; speechSynthesis.speak(u); };
applyProjects();
initScene({ videoUrl: VIDEO_URL, avatarUrl: AVATAR_URL });
