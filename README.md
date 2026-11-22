# Muhammad Basim · Scroll-driven 3D Portfolio (Three.js)

A single-page portfolio with a Three.js desk scene. Click the character (he waves and talks), then scroll: the camera flies into the monitor, which is meant to play your intro video, and the page continues with case studies, services, education and contact. Layout and interaction are inspired by the digitalpanda.com agency-site pattern (giant name hero, L-shaped cubicle desk, ticker, numbered case-study rows, "what we do" cards, contact form). The palette is deliberately minimal: paper, ink and one purple accent (CSS variables at the top of `src/style.css`). All copy, characters and artwork are yours.

## Run
```bash
npm install
npm run dev        # http://localhost:5173 (also serves /api locally)
npm test           # backend tests
npm run build      # production build -> dist/
```

## What is wired up
- **3D scene** (`src/scene.js`): L-shaped cubicle desk with drawers, beige CRT monitor on a PC case, keyboard, mouse + pad, lamp, plants, pinboard, posters, chair and character; scroll-driven camera; click-to-talk speech bubbles; click the monitor to jump to the intro. The monitor screen shows a placeholder until `VIDEO_URL` is set.
- **Play the game**: "Play now" opens *Don't Touch the Floor* in a full-screen overlay (`public/games/dont-touch-the-floor/`).
- **Contact form** -> `api/contact.js`: client + server validation, honeypot, minimum fill time, per-IP rate limit, SMTP via env vars.
- **Chatbot** -> `api/chat.js`: RAG over `api/_lib/knowledge.json` (Gemini embeddings + cosine retrieval + grounded answer; keyword demo mode without an API key). Cites sources with a "See:" link to the right section and says "I don't have that information" when it can't ground an answer.
- Dark/light theme, mobile menu, reduced-motion support, responsive layout.

## Fill in (all in `src/config.js`)
`GH`, `LI` (GitHub / LinkedIn), `VIDEO_URL` (put `intro.mp4` in `public/videos/`), project media (images or mp4 in `public/media/`, up to 3 per project).
Copy `.env.example` to `.env` for SMTP and Gemini keys. Never commit `.env`.

## Deploy (Vercel)
Import the repo, add the env vars from `.env.example`, deploy. `api/*.js` become serverless functions.

## 3D avatar

The seated character is a rigged GLB (`public/models/basim-avatar.glb`, clips: Idle / Wave / Talk).
- Path is set in `src/config.js` (`AVATAR_URL`). Remove it (empty string) to use the built-in primitive character.
- Loaded in `src/scene.js` with GLTFLoader + AnimationMixer. Click the avatar: Wave, then Talk on later clicks. Drag rotates the scene.
- Tunables in `scene.js`: `AV_SCALE`, `AV_Z`, chair position (`cg.position`).
- If the GLB fails to load, the built-in character is kept.
- Re-export from Blender: glTF 2.0, Animation mode "NLA Tracks", export deform bones only, JPEG textures.


## Desk and project media update

The 3D cubicle includes textured fabric panels, a cork pinboard, handwritten notes, game artwork, speakers, paper tray, succulent leaves, stationery, spring toy, and chair details. Original desk accessories are implemented in src/desk-details.js. The reference for the studio styling was https://www.digitalpanda.com/.

All four project videos and eight matching screenshots are bundled under public/videos and public/media. Edit their assignments in src/config.js. Videos have playback controls and screenshot posters, and use contain sizing to preserve the full frame.

Run npm install, then npm run dev for local editing; npm run build creates dist. Existing Vercel API routes are preserved. No hosting deployment was performed as part of this archive update.


Latest desk revision: removed the Rage Room, Ignition X, and Blade of Shadows wall pictures. Added a flowering cactus, branching plant with blossoms, a jointed white task lamp, and CRT ventilation, drive bay, control and scanline details.


Revision 9: supplied game posters replace generic wall art; the monitor shows animated gameplay code while the intro is paused. Added rear desk returns, drawer details and a digital clock. Home navigation returns to the top; the hero button reads View my projects and the technology strip is replaced by a studio message. Layout checked in the browser at desktop, 390px and 320px widths, with no horizontal overflow at the phone widths. Physical-device coverage is not exhaustive; the 3D scene requires WebGL.

## Languages (English, Urdu, French, Turkish, German, Arabic)
All visible text lives in `src/i18n.js` (one dictionary per language; missing keys fall back to English). Elements use `data-i18n` attributes. The language picker is in the top bar, the choice is saved in the browser, and Urdu and Arabic switch the page to right-to-left. The chatbot receives the chosen language and answers in it (full multilingual answers need `GEMINI_API_KEY`; without it, demo mode quotes the English CV text). To add a language: add it to `LANGS` and add a dictionary.

## Loading screen
`src/loader.js` + the `#loader` block in `index.html`: a progress bar that follows the real loading of the 3D avatar and textures, a slow-connection notice, and a 30 s safety timeout.

## Contact form
Fields: name, email, subject, message (validated in the browser and again in `api/contact.js`), honeypot, minimum fill time and per-IP rate limit.

## Project gallery, skills, achievements, voice, analytics
- **Gallery tools:** search box, technology chips and sorting (Featured / A to Z / Playable first) above the case studies (`src/main.js`).
- **Skills and achievements:** data for the skill bars is in `SKILLS` in `src/config.js`; achievement numbers are in `index.html` (`data-count`).
- **Voice:** the chat window has a microphone (speech to text) and a speaker toggle (text to speech) using the browser's Web Speech API; supported in Chrome, Edge and Safari, hidden elsewhere.
- **3D interaction:** the camera drifts with the mouse and the Rubik's cube lifts on hover and spins on click.
- **Analytics:** Vercel Analytics script in `index.html` (works after deploying on Vercel and enabling Analytics).
- More: `docs/RAG-PIPELINE.md`, `docs/DEPLOYMENT.md`, `docs/SUBMISSION-CHECKLIST.md`.
