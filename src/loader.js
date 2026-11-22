// Loading screen: tracks real asset loading (3D avatar, textures) and explains when the connection is slow.
import { DefaultLoadingManager } from 'three';
import { t } from './i18n.js';

const el = document.getElementById('loader');
const fill = document.getElementById('ld-fill'), pct = document.getElementById('ld-pct'), msg = document.getElementById('ld-msg'), slow = document.getElementById('ld-slow');
const MIN_MS = 700, SLOW_MS = 5000, GIVE_UP_MS = 30000;
const t0 = performance.now();
let target = 5, shown = 0, finished = false, assetsDone = false, pageLoaded = document.readyState === 'complete';

const conn = navigator.connection;
if (conn && (['slow-2g', '2g', '3g'].includes(conn.effectiveType) || conn.saveData)) {
  slow.textContent = t('ld_slow0'); slow.classList.add('on');
}
const MSGS = [0, 30, 60, 90].map((at, i) => [at, t('ld')[i]]);
msg.textContent = MSGS[0][1];

DefaultLoadingManager.onProgress = (_u, loaded, total) => { if (total) target = Math.max(target, 8 + (loaded / total) * 87); };
DefaultLoadingManager.onLoad = () => { assetsDone = true; maybeFinish(); };
addEventListener('load', () => { pageLoaded = true; maybeFinish(); });

function maybeFinish() {
  if (finished || !assetsDone || !pageLoaded) return;
  target = 100;
}
function finish() {
  finished = true; fill.style.width = '100%'; pct.textContent = '100%';
  setTimeout(() => { el.classList.add('done'); document.body.classList.remove('loading'); setTimeout(() => el.remove(), 900); }, 250);
}
// If nothing was queued (e.g. no avatar), do not wait forever.
setTimeout(() => { if (pageLoaded && !assetsDone && target <= 8) { assetsDone = true; maybeFinish(); } }, 2500);
setTimeout(() => { if (!finished) { target = 100; assetsDone = pageLoaded = true; } }, GIVE_UP_MS);

(function tick() {
  if (finished) return;
  const elapsed = performance.now() - t0;
  if (elapsed > SLOW_MS && target < 100) { slow.textContent = t('ld_slow1'); slow.classList.add('on'); }
  // ease toward target, creeping slightly so the bar never looks frozen
  const cap = target >= 100 ? 100 : Math.min(target + 3, 96);
  shown += (cap - shown) * 0.08 + (target >= 100 ? 0.6 : 0.02);
  shown = Math.min(shown, 100);
  fill.style.width = shown + '%'; pct.textContent = Math.round(shown) + '%';
  for (const [at, t] of MSGS) if (shown >= at) msg.textContent = t;
  if (shown >= 99.5 && target >= 100 && elapsed > MIN_MS) return finish();
  requestAnimationFrame(tick);
})();
