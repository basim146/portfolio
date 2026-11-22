import { addDeskDetails } from './desk-details.js';
import { t as tr } from './i18n.js';
import * as T from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const $ = (s) => document.querySelector(s);
const ACC = '#6B3FE0', INK = '#17122b';

export function initScene({ videoUrl = '', avatarUrl = '' } = {}) {
  const cv = $('#c3');
  const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  R.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 2));
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
  const S = new T.Scene(), C = new T.PerspectiveCamera(30, 1, 0.1, 200);
  S.environment = new T.PMREMGenerator(R).fromScene(new RoomEnvironment(), 0.04).texture; S.environmentIntensity = 0.7;
  S.add(new T.HemisphereLight(0xffffff, 0xd9d0f0, 0.45));
  const sun = new T.DirectionalLight(0xfff3e4, 2.3);
  sun.position.set(9, 17, 15); sun.target.position.set(3, 0, 3); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 60 });
  S.add(sun, sun.target);

  // ---------- helpers ----------
  const G = new T.Group(); S.add(G);
  const mats = {};
  const M = (c, r = 0.65, m = 0) => mats[c + r + m] || (mats[c + r + m] = new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m }));
  const rb = (w, h, d, c, x, y, z, p = G, r = 0.04) => {
    const m = new T.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.max(0.002, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001))), M(c));
    m.position.set(x, y, z); p.add(m); return m;
  };
  const cyl = (rt, rbm, h, c, x, y, z, p = G, seg = 24) => { const m = new T.Mesh(new T.CylinderGeometry(rt, rbm, h, seg), M(c)); m.position.set(x, y, z); p.add(m); return m; };
  const sph = (r, c, x, y, z, p = G) => { const m = new T.Mesh(new T.SphereGeometry(r, 24, 16), M(c)); m.position.set(x, y, z); p.add(m); return m; };
  const ct = (w, h, f) => { const k = document.createElement('canvas'); k.width = w; k.height = h; f(k.getContext('2d'), w, h); const t = new T.CanvasTexture(k); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; };
  const pl = (w, h, map, x, y, z, ry = 0, p = G, extra = {}) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map, toneMapped: false, ...extra })); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
  const cable = (pts, c = '#8d8a99', r = 0.025) => { const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(...p))), 40, r, 6), M(c, 0.8)); G.add(m); return m; };
  const DS = 2.2;
  const floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; S.add(floor);

  // ---------- cubicle walls (corner at origin; wall A runs +x, wall B runs +z) ----------
  const WALL = '#a3a3ac', TRIM = '#d6d6dc';
  rb(8.6, 6, 0.4, WALL, 3.7, 3, -0.2, G, 0.05); rb(8.7, 0.14, 0.5, TRIM, 3.7, 6.07, -0.2);
  rb(0.4, 6, 8.2, WALL, -0.2, 3, 4, G, 0.05); rb(0.5, 0.14, 8.3, TRIM, -0.2, 6.07, 4);
  rb(7, 4.7, 0.3, '#b3b3bb', 3.5, 2.35, -3.2); rb(0.3, 4.7, 7, '#b3b3bb', -3.2, 2.35, 3.5); // taller back panels for depth
  rb(7.2, 0.12, 0.4, TRIM, 3.5, 4.75, -3.2); rb(0.4, 0.12, 7.2, TRIM, -3.2, 4.75, 3.5);

  // ---------- L-shaped desk with a rounded corner extension ----------
  const sh = new T.Shape();
  [[0, 0], [8, 0], [8, 2.5], [4.6, 2.5], [4.2, 3.7], [3.7, 4.2], [2.5, 4.6], [2.5, 8], [0, 8]].forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
  const dg = new T.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }); dg.rotateX(-Math.PI / 2);
  const desk = new T.Mesh(dg, M('#e9e7ee', 0.5)); desk.position.y = DS - 0.15; G.add(desk);
  rb(8, 1.9, 0.08, '#85858f', 4, 1.0, 0.16); rb(0.08, 1.9, 8, '#85858f', 0.16, 1.0, 4);          // modesty panels
  rb(0.1, 1.95, 2.4, '#dad8e0', 7.9, 1.02, 1.25);                                               // arm A end panel
  rb(2.3, 1.95, 2.55, '#dedce3', 1.3, 1.02, 6.7, G, 0.05);                                      // drawer pedestal
  [0.45, 1.05, 1.65].forEach((y) => { rb(0.05, 0.52, 2.2, '#cfcdd5', 2.47, y + 0.15, 6.7); rb(0.06, 0.07, 0.8, '#7b7a86', 2.52, y + 0.3, 6.7); });
  // ---------- CRT monitor on a PC case (screen faces the camera diagonal) ----------
  const mon = new T.Group(); mon.position.set(2.05, 0, 2.05); mon.rotation.y = Math.PI / 4; G.add(mon);
  const BEIGE = '#efeadd', BEIGE2 = '#e0dbcc';
  rb(2.3, 0.5, 2.2, BEIGE, 0, DS + 0.25, 0.1, mon, 0.08);
  rb(0.9, 0.06, 0.03, '#2a2833', 0.4, DS + 0.28, 1.215, mon, 0.01); sph(0.035, '#58d26b', -0.8, DS + 0.2, 1.215, mon);
  rb(2.3, 1.95, 1.9, BEIGE, 0, DS + 1.475, 0, mon, 0.2);
  rb(1.5, 1.3, 1.1, BEIGE2, 0, DS + 1.5, -1.35, mon, 0.2);
  for (let i = 0; i < 6; i++) rb(1.5, 0.03, 0.07, '#cdc7b6', 0, DS + 2.17, -1.0 - i * 0.14, mon, 0.01).position.y += 0.35 - i * 0.02;
  const YC = DS + 1.55;
  rb(1.95, 1.55, 0.08, BEIGE2, 0, YC, 0.93, mon, 0.06); rb(1.76, 1.36, 0.06, '#15121e', 0, YC, 0.97, mon, 0.1);
  rb(1.9, 0.18, 0.06, '#d4cebe', 0, DS + 0.62, 0.94, mon, 0.02); [0.5, 0.72].forEach((x) => cyl(0.05, 0.05, 0.05, '#bdb7a6', x, DS + 0.62, 0.99, mon, 12).rotation.x = Math.PI / 2); sph(0.04, '#58d26b', 0.86, DS + 0.62, 0.99, mon);
  rb(0.38, 0.38, 0.02, '#f1e7a8', 0.98, YC + 0.78, 1.0, mon, 0.01).rotation.z = 0.15;
  rb(0.3, 0.3, 0.02, '#d9ccf5', -1.0, YC + 0.72, 1.0, mon, 0.01).rotation.z = -0.2;
  const sc2 = document.createElement('canvas'); sc2.width = 640; sc2.height = 480; const sg = sc2.getContext('2d');
  const codingTex = new T.CanvasTexture(sc2); codingTex.colorSpace = T.SRGBColorSpace;
  let tex = codingTex, videoTex = null, vid = null;
  if (videoUrl) { vid = document.createElement('video'); Object.assign(vid, { src: videoUrl, loop: true, muted: true, playsInline: true, crossOrigin: 'anonymous' }); videoTex = new T.VideoTexture(vid); videoTex.colorSpace = T.SRGBColorSpace; } else $('#snd').style.display = 'none';
  const cinema=document.createElement('div');cinema.id='intro-player';cinema.hidden=true;
  if(vid){
    vid.id='intro-video';vid.controls=true;vid.preload='metadata';vid.poster='videos/intro-poster.jpg';
    vid.setAttribute('playsinline','');vid.setAttribute('aria-label','Portfolio introduction video');
    cinema.append(vid);$('#pin').append(cinema);
  }
  let introRequested=false, introSuppressed=false;
  const pauseIntro=()=>{if(vid){vid.pause();vid.muted=true;}introSuppressed=true;};
  document.addEventListener('pause-intro',pauseIntro);
  document.addEventListener('pause-portfolio-media',pauseIntro);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseIntro();});
  const code = ['void Update() {', '  Move(input);', '  if (OnGround) Jump();', '  UpdateAI(dt);', '}', 'class Enemy : MonoBehaviour', 'float lava = 0.4f;', 'renderer.render(scene, cam);'];
  function paint(t) {
    sg.fillStyle='#10151f';sg.fillRect(0,0,640,480);
    sg.fillStyle='#202735';sg.fillRect(0,0,640,44);
    sg.fillStyle='#b4c0d5';sg.font='18px monospace';sg.fillText('Basim / PlayerController.cs',20,28);
    const lines=['using UnityEngine;','','public class PlayerController {','  void Update() {','    Vector3 move = ReadInput();','    controller.Move(move * speed);','    if (Input.GetKeyDown("space"))','      Jump();','    UpdateEnemyAI();','  }','}'];
    const count= Math.floor(t*4)%38;
    sg.font='19px monospace';sg.textAlign='left';
    lines.forEach((line,i)=>{sg.fillStyle='#59677d';sg.fillText(String(i+1).padStart(2,' '),16,80+i*29);sg.fillStyle=i<3?'#c6a0f6':i%3===0?'#a6da95':'#cad3f5';sg.fillText(line.slice(0,Math.max(0,(count-i*2)*4)),57,80+i*29);});
    sg.fillStyle='#253429';sg.fillRect(0,436,640,44);sg.fillStyle='#a6da95';sg.font='16px monospace';sg.fillText('GAMEPLAY SYSTEMS  /  EDITING',20,464);
    if(Math.floor(t*2)%2===0){sg.fillStyle='#c6a0f6';sg.fillRect(520,389,10,20);}
    codingTex.needsUpdate=true;
  }
  const scr = new T.Mesh(new T.PlaneGeometry(1.62, 1.22), new T.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, YC, 1.005); mon.add(scr);
  const glare = pl(1.62, 1.22, ct(64, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), 0, YC, 1.012, 0, mon, { transparent: true, depthWrite: false });

  // ---------- keyboard + mouse + pad ----------
  const kb = new T.Group(); kb.position.set(3.3, DS, 3.3); kb.rotation.y = Math.PI / 4; G.add(kb);
  rb(1.7, 0.12, 0.66, BEIGE, 0, 0.06, 0, kb, 0.04);
  const keyGeo = new RoundedBoxGeometry(0.1, 0.05, 0.1, 2, 0.015), keys = []; [[13, 0.22], [13, 0.11], [12, 0], [11, -0.11]].forEach(([n, z], r) => { for (let i = 0; i < n; i++) keys.push([(i - (n - 1) / 2) * 0.118 + (r === 2 ? 0.03 : r === 3 ? 0.06 : 0), z]); });
  const km = new T.InstancedMesh(keyGeo, M('#fbf9f2', 0.5), keys.length); keys.forEach(([x, z], i) => { const m = new T.Matrix4().setPosition(x, 0.14, z); km.setMatrixAt(i, m); }); kb.add(km);
  rb(0.7, 0.05, 0.1, '#fbf9f2', 0, 0.14, -0.22, kb, 0.015);
  cable([[2.95, DS + 0.03, 2.95], [2.75, DS + 0.02, 2.85], [2.6, DS + 0.02, 2.55]]);
  rb(0.95, 0.03, 0.8, ACC, 4.55, DS + 0.015, 1.95, G, 0.02).rotation.y = Math.PI / 4;
  const mouse = new T.Group(); mouse.position.set(4.55, DS + 0.03, 1.95); mouse.rotation.y = Math.PI / 4 + 0.12; G.add(mouse);
  rb(0.34, 0.15, 0.56, '#f6f3ea', 0, 0.09, 0, mouse, 0.12); rb(0.012, 0.01, 0.24, '#b9b4a6', 0, 0.175, -0.12, mouse, 0.003); cyl(0.03, 0.03, 0.05, ACC, 0, 0.17, -0.12, mouse, 10).rotation.z = Math.PI / 2;
  cable([[4.5, DS + 0.05, 1.7], [4.2, DS + 0.02, 1.3], [3.5, DS + 0.02, 1.15], [3.0, DS + 0.15, 1.2]]);

  // ---------- desk props: arm A (right) ----------
  cyl(0.22, 0.2, 0.5, '#2b2838', 7.35, DS + 0.25, 1.7); [[ACC, 0.1], ['#d33', -0.2], ['#2b2838', 0.3]].forEach(([c, a], i) => { const p = cyl(0.02, 0.02, 0.7, c === '#d33' ? '#e8e3f7' : c, 7.35 + (i - 1) * 0.07, DS + 0.7, 1.7); p.rotation.z = a; });
  cyl(0.2, 0.2, 0.32, '#f3f1ee', 6.9, DS + 0.16, 2.1); const handle = new T.Mesh(new T.TorusGeometry(0.1, 0.03, 8, 16, Math.PI), M('#f3f1ee')); handle.position.set(7.1, DS + 0.17, 2.1); handle.rotation.z = -Math.PI / 2; G.add(handle);
  // Desk calendar: standing tent with spiral binding. Shows the real current month and highlights today.
  const calCv = document.createElement('canvas'); calCv.width = 290; calCv.height = 240; const calG2 = calCv.getContext('2d');
  const calTex = new T.CanvasTexture(calCv); calTex.colorSpace = T.SRGBColorSpace; calTex.anisotropy = 8;
  let calDay = -1;
  function paintCalendar(now) {
    const w = 290, h = 240, y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
    calG2.fillStyle = '#fff'; calG2.fillRect(0, 0, w, h);
    calG2.fillStyle = ACC; calG2.fillRect(0, 0, w, 50);
    calG2.fillStyle = '#fff'; calG2.font = '700 26px sans-serif'; calG2.textAlign = 'center';
    calG2.fillText(now.toLocaleString('en-US', { month: 'short' }).toUpperCase() + ' ' + y, w / 2, 35);
    calG2.font = '700 13px sans-serif'; calG2.fillStyle = '#8a82a3';
    'SMTWTFS'.split('').forEach((d, i) => calG2.fillText(d, 22 + i * 41, 70));
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    calG2.font = '600 17px sans-serif';
    for (let d = 1; d <= days; d++) {
      const idx = first + d - 1, cx = 22 + (idx % 7) * 41, cy = 98 + Math.floor(idx / 7) * 26;
      if (d === today) { calG2.fillStyle = ACC; calG2.beginPath(); calG2.arc(cx, cy - 6, 14, 0, 7); calG2.fill(); calG2.fillStyle = '#fff'; }
      else calG2.fillStyle = idx % 7 === 0 || idx % 7 === 6 ? '#8a82a3' : INK;
      calG2.fillText(d, cx, cy);
    }
    calTex.needsUpdate = true;
  }
  const calendar = new T.Group(); calendar.position.set(4.65, DS, 0.62); G.add(calendar);
  const calFront = new T.Group(); calFront.position.set(0, 0.02, 0.1); calFront.rotation.x = -0.3; calendar.add(calFront);
  rb(0.74, 0.6, 0.03, '#fbfaff', 0, 0.3, 0, calFront, 0.012);
  const calPage = new T.Mesh(new T.PlaneGeometry(0.7, 0.58), new T.MeshBasicMaterial({ map: calTex, toneMapped: false })); calPage.position.set(0, 0.3, 0.0165); calFront.add(calPage);
  for (let i = 0; i < 8; i++) { const ring = new T.Mesh(new T.TorusGeometry(0.024, 0.006, 6, 14), M('#8d8a99', 0.35, 0.6)); ring.rotation.y = Math.PI / 2; ring.position.set(-0.28 + i * 0.08, 0.6, 0); calFront.add(ring); }
  const calBack = new T.Group(); calBack.position.set(0, 0.02, -0.28); calBack.rotation.x = 0.455; calendar.add(calBack);
  rb(0.66, 0.5, 0.02, '#d9d6e2', 0, 0.25, 0, calBack, 0.008);

  // Digital desk clock: real local time, colon blinks each second.
  const clkCv = document.createElement('canvas'); clkCv.width = 256; clkCv.height = 80; const clkG = clkCv.getContext('2d');
  const clkTex = new T.CanvasTexture(clkCv); clkTex.colorSpace = T.SRGBColorSpace; clkTex.anisotropy = 8;
  let clkKey = '';
  function paintClock(now) {
    const colon = now.getSeconds() % 2 === 0, hh = now.getHours() % 12 || 12, mm = String(now.getMinutes()).padStart(2, '0');
    const key = hh + mm + colon + (now.getHours() < 12); if (key === clkKey) return; clkKey = key;
    clkG.fillStyle = '#24221e'; clkG.fillRect(0, 0, 256, 80);
    clkG.fillStyle = '#ffd968'; clkG.font = '700 52px monospace'; clkG.textAlign = 'center';
    clkG.fillText(hh + (colon ? ':' : ' ') + mm, 112, 58);
    clkG.font = '700 16px monospace'; clkG.textAlign = 'left'; clkG.fillText(now.getHours() < 12 ? 'AM' : 'PM', 214, 58);
    clkTex.needsUpdate = true;
  }
  rb(0.75, 0.38, 0.28, '#e1b345', 5.5, DS + 0.19, 0.6, G, 0.05);
  rb(0.62, 0.23, 0.02, '#1d1b17', 5.5, DS + 0.2, 0.741, G, 0.015);
  pl(0.6, 0.19, clkTex, 5.5, DS + 0.2, 0.753, 0);
  [-0.2, 0.2].forEach((dx) => rb(0.1, 0.03, 0.08, '#b8902c', 5.5 + dx, DS + 0.395, 0.6));
  const tickDateTime = () => { const now = new Date(); paintClock(now); if (now.getDate() !== calDay) { calDay = now.getDate(); paintCalendar(now); } };
  tickDateTime();
  rb(0.5, 0.5, 0.5, '#fff', 3.9, DS + 0.25, 0.5).rotation.y = 0.5;

  // ---------- desk props: arm B (left) ----------
  const cubeG = new T.Group(); cubeG.position.set(1.9, DS + 0.225, 4.9); cubeG.rotation.y = 0.4; G.add(cubeG);
  { const P = 0.15, STK = ['#f3eee2', '#ffd358', '#e0483f', '#ff8a3d', '#3b6fe0', '#4cae4f'];
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
      rb(0.146, 0.146, 0.146, '#15141a', i * P, j * P, k * P, cubeG, 0.02);
      const col = (f) => STK[(Math.abs(i * 5 + j * 3 + k * 7 + f * 11 + i * j * 13 + j * k * 17) + f) % 6], o = 0.0745, s = 0.118, t = 0.008;
      if (i === 1) rb(t, s, s, col(0), o + P, j * P, k * P, cubeG, 0.004);
      if (i === -1) rb(t, s, s, col(1), -o - P, j * P, k * P, cubeG, 0.004);
      if (j === 1) rb(s, t, s, col(2), i * P, o + P, k * P, cubeG, 0.004);
      if (j === -1) rb(s, t, s, col(3), i * P, -o - P, k * P, cubeG, 0.004);
      if (k === 1) rb(s, s, t, col(4), i * P, j * P, o + P, cubeG, 0.004);
      if (k === -1) rb(s, s, t, col(5), i * P, j * P, -o - P, cubeG, 0.004);
    } }
  rb(0.9, 0.06, 0.65, '#fbfaf6', 1.5, DS + 0.03, 5.5, G, 0.01).rotation.y = 0.3; rb(0.85, 0.05, 0.6, '#efeaf9', 1.52, DS + 0.09, 5.52, G, 0.01).rotation.y = 0.25;
  sph(0.1, '#d9ccf5', 2.0, DS + 0.1, 3.6);

  // ---------- wall decor ----------
  const posters = new T.TextureLoader();
  [['bladeofshadows',3.05],['ignitionx',4.85],['rageroom',6.65]].forEach(([name,z]) => {
    const map=posters.load('media/'+name+'-poster.png');map.colorSpace=T.SRGBColorSpace;
    rb(1.65,1.08,.07,'#36323e',.06,4.45,z).rotation.y=Math.PI/2;
    pl(1.53,.96,map,.105,4.45,z,Math.PI/2);
  });
  rb(5.0, 2.6, 0.08, '#d9d6e2', 5.5, 4.1, 0.05, G, 0.03); rb(4.8, 2.4, 0.04, '#f2f0f7', 5.5, 4.1, 0.09, G, 0.01);   // pinboard
  [[4.2, 4.8, '#d9ccf5'], [4.9, 4.4, '#f1e7a8'], [5.7, 4.9, '#fff'], [6.4, 4.3, '#d9ccf5'], [4.6, 3.6, '#fff'], [5.3, 3.5, '#f1e7a8'], [6.1, 3.6, '#d9ccf5'], [6.8, 4.7, '#f1e7a8']].forEach(([x, y, c], i) => rb(0.5, 0.5, 0.02, c, x, y, 0.13, G, 0.01).rotation.z = (i - 4) * 0.04);
  [[1.25, 5.15, 'PRE-PRODUCTION', 'Course Certificate'], [2.35, 5.15, 'UNREAL ENGINE', 'Course Certificate']].forEach(([x, y, title, sub]) => { rb(0.95, 0.7, 0.05, '#2b2838', x, y, 0.05, G, 0.01); pl(0.8, 0.55, ct(480, 320, (g) => { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, 480, 320); g.strokeStyle = ACC; g.lineWidth = 8; g.strokeRect(14, 14, 452, 292); g.strokeStyle = '#b9a5ee'; g.lineWidth = 2; g.strokeRect(28, 28, 424, 264); g.fillStyle = '#6b6880'; g.textAlign = 'center'; g.font = '600 20px serif'; g.fillText('CEGA INSTITUTE', 240, 82); g.fillStyle = INK; g.font = '700 44px serif'; g.fillText(title, 240, 160); g.fillStyle = ACC; g.fillRect(170, 185, 140, 4); g.fillStyle = INK; g.font = 'italic 28px serif'; g.fillText(sub, 240, 235); }), x, y, 0.09, 0); });
  const hp = new T.Group(); hp.position.set(7.0, 5.25, 0.1); G.add(hp); hp.add(new T.Mesh(new T.TorusGeometry(0.3, 0.05, 8, 24, Math.PI), M('#2b2838'))); [-0.3, 0.3].forEach((x) => { const c = cyl(0.12, 0.12, 0.14, ACC, x, -0.05, 0, hp, 16); c.rotation.z = Math.PI / 2; });

  // ---------- office chair + character ----------
  const cg = new T.Group(); cg.position.set(3.55, 0, 4.75); G.add(cg);
  const CH = ACC, DK = '#2b2838', SKIN = '#e3b592', HOOD = '#2a2540', JEANS = '#3a3d52';
  rb(1.6, 0.26, 1.6, CH, 0, 1.03, 0, cg, 0.1); rb(1.5, 1.5, 0.24, CH, 0, 1.98, -0.85, cg, 0.1).rotation.x = -0.08; rb(0.8, 0.45, 0.22, CH, 0, 2.98, -0.9, cg, 0.1);
  cyl(0.1, 0.1, 0.63, '#9a99a5', 0, 0.69, 0, cg, 12);
  [-1, 1].forEach((s) => { rb(0.12, 0.1, 1.1, DK, s * 0.92, 1.63, -0.1, cg, 0.04); rb(0.1, 0.55, 0.1, '#9a99a5', s * 0.92, 1.33, 0.1, cg, 0.03); });
  for (let i = 0; i < 5; i++) { const a = i * 1.2566, b = rb(0.12, 0.1, 1.2, '#9a99a5', Math.sin(a) * 0.6, 0.4, Math.cos(a) * 0.6, cg, 0.04); b.rotation.y = a; sph(0.14, '#222', Math.sin(a) * 1.2, 0.15, Math.cos(a) * 1.2, cg); }
  const fb = new T.Group(); cg.add(fb); // built-in fallback character, hidden once the GLB avatar loads
  const torso = cyl(0.5, 0.62, 1.7, HOOD, 0, 2.35, -0.1, fb, 20); cyl(0.17, 0.2, 0.3, SKIN, 0, 3.25, 0, fb, 12);
  pl(0.5, 0.34, ct(100, 68, (g, w, h) => { g.fillStyle = HOOD; g.fillRect(0, 0, w, h); g.fillStyle = '#EDE1FD'; g.font = '700 48px sans-serif'; g.textAlign = 'center'; g.fillText('MB', 50, 52); }), 0, 2.75, 0.5, 0, fb);
  const head2 = new T.Group(); head2.position.set(0, 3.65, 0.03); fb.add(head2);
  sph(0.5, SKIN, 0, 0, 0, head2); [-1, 1].forEach((s) => { sph(0.12, SKIN, s * 0.5, 0, 0, head2); sph(0.055, '#15110f', s * 0.18, 0.04, 0.45, head2); rb(0.2, 0.04, 0.04, '#2a1d16', s * 0.18, 0.17, 0.46, head2, 0.01); });
  sph(0.07, '#d9a07c', 0, -0.06, 0.5, head2);
  const mo = new T.Mesh(new T.TorusGeometry(0.13, 0.025, 6, 16, Math.PI), M('#8a3a3a')); mo.position.set(0, -0.12, 0.47); mo.rotation.z = Math.PI; head2.add(mo);
  const hair = new T.Mesh(new T.SphereGeometry(0.54, 24, 14, 0, 6.3, 0, 1.4), M('#2a1d16')); hair.position.set(0, 0.04, -0.04); hair.rotation.x = -0.25; head2.add(hair); rb(0.7, 0.12, 0.12, '#2a1d16', 0, 0.34, 0.36, head2, 0.05).rotation.x = 0.4;
  [-0.3, 0.3].forEach((x) => { rb(0.45, 0.45, 1.3, JEANS, x, 1.65, 0.8, fb, 0.08); rb(0.4, 1.4, 0.4, JEANS, x, 0.95, 1.4, fb, 0.08); rb(0.42, 0.22, 0.7, '#f4f2f8', x, 0.28, 1.55, fb, 0.08); rb(0.42, 0.07, 0.7, ACC, x, 0.14, 1.55, fb, 0.03); });
  const arm = (s) => { const sh2 = new T.Group(); sh2.position.set(s * 0.7, 2.95, -0.05); fb.add(sh2); sph(0.22, HOOD, 0, 0, 0, sh2); rb(0.3, 0.3, 0.9, HOOD, 0, 0, 0.45, sh2, 0.1); const fo = new T.Group(); fo.position.z = 0.9; sh2.add(fo); sph(0.17, HOOD, 0, 0, 0, fo); rb(0.26, 0.26, 0.8, SKIN, 0, 0, 0.4, fo, 0.1); sph(0.17, SKIN, 0, 0, 0.85, fo); return { sh: sh2, fo }; };
  const AL = arm(-1), AR = arm(1);
  addDeskDetails({ G, M, rb, cyl, sph, ct, pl, cable, DS, mon, cg });
  G.traverse((o) => { if (o.isMesh && o.material.type === 'MeshStandardMaterial') { o.castShadow = o.receiveShadow = true; } });
  desk.castShadow = desk.receiveShadow = true;

  // ---------- rigged GLB avatar (Idle typing / Wave / Talk clips baked in Blender) ----------
  const AV_SCALE = 3.3, AV_Z = -0.05;   // metres -> scene units; shifts the seated avatar back onto the chair
  let avatar = null, mixer = null, cur = null; const clips = {}; const clock = new T.Clock();
  const headAnchor = new T.Object3D(); headAnchor.position.set(0, 3.75, 0.05); cg.add(headAnchor);
  let headRef = head2;
  const hit = new T.Mesh(new T.BoxGeometry(1.9, 3.4, 1.9), new T.MeshBasicMaterial({ visible: false })); hit.position.set(0, 2.6, 0.2); // cheap click target
  function playClip(name, { once = false, fade = 0.35 } = {}) {
    const next = clips[name]; if (!next || next === cur) return;
    next.reset(); next.setLoop(once ? T.LoopOnce : T.LoopRepeat, Infinity); next.clampWhenFinished = once; next.enabled = true;
    if (cur && fade) next.crossFadeFrom(cur, fade, false); next.play(); cur = next;
  }
  if (avatarUrl) new GLTFLoader().load(avatarUrl, (gltf) => {
    avatar = gltf.scene; avatar.scale.setScalar(AV_SCALE); avatar.position.set(0, 0, AV_Z);
    avatar.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; o.raycast = () => {}; } });
    mixer = new T.AnimationMixer(avatar);
    gltf.animations.forEach((c) => { clips[c.name] = mixer.clipAction(c); });
    mixer.addEventListener('finished', () => playClip(mode === 1 ? 'Talk' : 'Idle'));
    cg.add(avatar, hit); fb.visible = false; headRef = headAnchor;
    playClip('Idle', { fade: 0 });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches && clips.Idle) clips.Idle.timeScale = 0;
  }, undefined, (e) => console.warn('Avatar failed to load, keeping the built-in character.', e));

  // ---------- camera ----------
  G.updateMatrixWorld(true);
  const sw = scr.getWorldPosition(new T.Vector3()), nm = new T.Vector3(0, 0, 1).transformDirection(scr.matrixWorld);
  const p0 = new T.Vector3(), l0 = new T.Vector3(3.7, 2.7, 3.7), p1 = sw.clone().addScaledVector(nm, 3.8), lk = new T.Vector3();
  const faceKb = Math.atan2(3.3 - cg.position.x, 3.3 - cg.position.z); cg.rotation.y = faceKb;
  function rs() { R.setSize(innerWidth, innerHeight, false); C.aspect = innerWidth / innerHeight; C.updateProjectionMatrix(); p1.copy(sw).addScaledVector(nm, Math.max(5.2, 3.0 / (2 * Math.tan(Math.PI / 12) * C.aspect))); const k = Math.max(1, (innerWidth < 700 ? 1.38 : 1.75) / C.aspect); p0.set(17.5 * k, 10.5 * k, 17.5 * k); }
  addEventListener('resize', rs); rs();
  const st = $('#stage'), wm = $('#wm'), hf = $('#hf'), wash = $('#wash'), snd = $('#snd'), hint = $('#hint'), bub = $('#bub');
  const ss = (x) => x * x * (3 - 2 * x), cl = (x) => Math.min(1, Math.max(0, x)), lp = (o, k, v, s = 0.12) => (o[k] += (v - o[k]) * s), prog = () => cl(scrollY / (st.offsetHeight - innerHeight));
  snd.hidden=true;
  const monitorControls=document.createElement('div');monitorControls.id='monitor-controls';monitorControls.hidden=true;
  const playback=document.createElement('button');playback.type='button';playback.className='btn';playback.textContent='Pause intro';
  const sound=document.createElement('button');sound.type='button';sound.className='btn';sound.textContent='Enable sound';
  monitorControls.append(playback,sound);$('#pin').append(monitorControls);
  playback.onclick=()=>{if(!vid)return;if(vid.paused){introSuppressed=false;vid.play().catch(()=>{playback.textContent='Play intro';});}else{vid.pause();introSuppressed=true;}};
  sound.onclick=()=>{if(!vid)return;vid.muted=!vid.muted;sound.textContent=vid.muted?'Enable sound':'Mute sound';if(vid.paused){introSuppressed=false;vid.play().catch(()=>{});}};

  // ---------- interaction ----------
  const L = () => tr('bub');
  let mode = 0, line = 0, tyaw = faceKb, hov = null, dn = null;
  let pmx = 0, pmy = 0, sx = 0, sy = 0, cubeSpin = 0, cubeY = cubeG.position.y; const camRight = new T.Vector3();
  const ray = new T.Raycaster(), mp = new T.Vector2(), hv = new T.Vector3(), ang = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  function pick(e) {
    if (prog() > 0.4) return null;
    const r = cv.getBoundingClientRect(); mp.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(mp, C);
    const h = ray.intersectObjects([cg, mon, cubeG], true)[0]; if (!h) return null;
    let o = h.object; while (o) { if (o === cg) return 'av'; if (o === mon) return 'mon'; if (o === cubeG) return 'cube'; o = o.parent; } return null;
  }
  cv.addEventListener('pointermove', (e) => { pmx = e.clientX / innerWidth - 0.5; pmy = e.clientY / innerHeight - 0.5; if (dn && dn.t === 'av') { tyaw += (e.clientX - dn.x) * 0.012; dn.x = e.clientX; dn.m = 1; return; } hov = e.pointerType === 'mouse' ? pick(e) : null; cv.style.cursor = hov ? 'pointer' : ''; });
  cv.addEventListener('pointerdown', (e) => { const t = pick(e); if (t) { dn = { t, x: e.clientX, m: 0 }; cv.setPointerCapture(e.pointerId); } });
  cv.addEventListener('pointerup', () => {
    if (!dn) return; const t = dn.t, moved = dn.m; dn = null; if (moved) return;
    if (t === 'cube') cubeSpin = 0.5;
    else if (t === 'mon') scrollTo({ top: (st.offsetHeight - innerHeight) * 0.8, behavior: 'smooth' });
    else if (mode === 0) { mode = 1; line = 0; const c = G.worldToLocal(C.position.clone()); tyaw = Math.atan2(c.x - cg.position.x, c.z - cg.position.z); playClip('Wave', { once: true }); }
    else if (++line >= L().length) { mode = 0; tyaw = faceKb; playClip('Idle'); }
    else playClip('Talk');
  });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Smoothed scroll progress: wheel notches no longer make the camera jump; it eases toward the scroll position.
  let sp = prog(), lastT = 0;
  const fillDist = () => 0.9 * Math.max((1.22 / 2) / Math.tan(Math.PI / 12), (1.62 / 2 / C.aspect) / Math.tan(Math.PI / 12)); // distance at which the CRT fills the view
  // Fade (not shrink) the chair + avatar so the camera dollies in on an intact scene. Materials are cloned once so the fade stays local to them.
  let goneLast = -1; const fadeMats = new Set();
  function prepFade(root) { root.traverse((o) => { if (!o.isMesh || o.userData.fd) return; o.userData.fd = 1; const clone = (m) => { const c = m.clone(); c.userData.base = m.opacity; fadeMats.add(c); return c; }; o.material = Array.isArray(o.material) ? o.material.map(clone) : clone(o.material); }); }
  function fadeCg(a) { if (!avatarFaded && avatar) { avatarFaded = true; prepFade(avatar); } fadeMats.forEach((m) => { m.transparent = a < 0.999 || m.userData.base < 1; m.opacity = m.userData.base * a; }); cg.visible = a > 0.01; }
  let avatarFaded = false; prepFade(cg);
  let gamePaused = false;
  document.addEventListener('game-open', () => { gamePaused = true; });
  document.addEventListener('game-close', () => { gamePaused = false; });
  function loop(t) {
    requestAnimationFrame(loop);
    if (gamePaused) return; // the game overlay needs the whole GPU
    const t1 = t / 1000, dtS = Math.min(0.1, Math.max(0, t1 - lastT)); lastT = t1;
    const target = prog(); sp = reduce ? target : sp + (target - sp) * (1 - Math.exp(-dtS * 7)); if (Math.abs(target - sp) < 0.0002) sp = target;
    const p = sp, e = ss(cl((p - 0.04) / 0.7));
    // Chair + avatar shrink away smoothly while the camera closes in, so they never block the screen or pop out.
    const gone = ss(cl((e - 0.3) / 0.3)); if (gone !== goneLast) { goneLast = gone; fadeCg(1 - gone); }
    C.position.lerpVectors(p0, p1, e);
    // Final push: glide straight into the screen until it fills the view (never crossing the glass), then dissolve to the page.
    const push = ss(cl((p - 0.7) / 0.2));
    if (push > 0) C.position.lerp(sw.clone().addScaledVector(nm, fillDist()), push);
    // Mouse parallax: the camera drifts a little with the pointer while the whole desk is in view.
    sx += (pmx - sx) * 0.06; sy += (pmy - sy) * 0.06;
    const amp = reduce ? 0 : 1 - e;
    if (amp > 0.001) { C.position.addScaledVector(camRight.setFromMatrixColumn(C.matrixWorld, 0), sx * 1.8 * amp); C.position.y -= sy * 1.0 * amp; }
    // Rubik's cube reacts: lifts on hover, spins when clicked.
    cubeG.rotation.y += cubeSpin; cubeSpin *= 0.96; if (cubeSpin < 0.002) cubeSpin = 0;
    cubeY += ((DS + 0.225 + (hov === 'cube' ? 0.1 : 0)) - cubeY) * 0.15; cubeG.position.y = cubeY;
    C.lookAt(lk.lerpVectors(l0, sw.clone().addScaledVector(nm, -2), e));
    const fadeO = 1 - cl(p / 0.14); wm.style.opacity = fadeO; hf.style.opacity = fadeO; hint.style.opacity = fadeO; wm.style.transform = `translateY(${-p * 160}px)`;
    wash.style.opacity = ss(cl((p - 0.86) / 0.13));
    if (!dn || dn.t !== 'av') cg.rotation.y += ang(tyaw - cg.rotation.y) * 0.08; else cg.rotation.y = tyaw;
    const dt = clock.getDelta(); if (mixer) mixer.update(dt);
    const tt = reduce ? 0 : t1; tickDateTime();
    if (!avatar) {
    torso.rotation.z = Math.sin(tt * 1.2) * 0.02; head2.rotation.y = mode ? Math.sin(tt * 1.5) * 0.15 : 0;
    if (mode === 0) { [AL, AR].forEach((a, i) => { lp(a.sh.rotation, 'x', 0.62 + Math.sin(tt * 8 + i * 2) * 0.04); lp(a.fo.rotation, 'x', -0.75); lp(a.fo.rotation, 'z', 0); }); }
    else { lp(AL.sh.rotation, 'x', 0.25); lp(AL.fo.rotation, 'x', -0.2); if (line === 0) { lp(AR.sh.rotation, 'x', -2.0); lp(AR.fo.rotation, 'x', -0.3); AR.fo.rotation.z = Math.sin(tt * 9) * 0.5; } else { lp(AR.sh.rotation, 'x', 0.25); lp(AR.fo.rotation, 'x', -0.2); lp(AR.fo.rotation, 'z', 0); } }
    }
    const introInView = p > .25 && p < .96 && !document.hidden && !document.body.classList.contains('menu-open');
    cinema.hidden=true;
    monitorControls.hidden=!(introInView && p>.55 && p<.86 && vid);
    playback.textContent=vid && !vid.paused?'Pause intro':'Play intro';
    sound.textContent=vid && !vid.muted?'Mute sound':'Enable sound';
    if(vid){
      if(introInView && !introRequested){introRequested=true;if(!introSuppressed)vid.play().catch(()=>{});}
      if(!introInView){vid.pause();vid.muted=true;introRequested=false;if(p<.25)introSuppressed=false;}
    }
    const showingVideo=vid && !vid.paused && vid.readyState >= 2;
    scr.material.map=codingTex;
    if(showingVideo){
      // Letterbox the entire video into the physical 4:3 CRT screen.
      sg.fillStyle='#050508';sg.fillRect(0,0,640,480);
      const scale=Math.min(640/vid.videoWidth,480/vid.videoHeight),w=vid.videoWidth*scale,h=vid.videoHeight*scale;
      sg.drawImage(vid,(640-w)/2,(480-h)/2,w,h);codingTex.needsUpdate=true;
    } else paint(tt);
    const show = p < 0.4 && (mode === 1 || hov === 'av' || p < 0.1);
    if (show) { headRef.getWorldPosition(hv); hv.y += 0.9; hv.project(C); bub.style.left = ((hv.x * 0.5 + 0.5) * innerWidth) + 'px'; bub.style.top = ((-hv.y * 0.5 + 0.5) * innerHeight) + 'px'; bub.textContent = mode ? L()[line] : tr('bub_click'); bub.style.opacity = 1; bub.style.maxWidth = mode ? '250px' : '120px'; } else bub.style.opacity = 0;
    if (scrollY < st.offsetHeight + innerHeight) R.render(S, C);
  }
  requestAnimationFrame(loop);
}
