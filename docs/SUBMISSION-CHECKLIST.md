# Submission checklist

| Module | In the project | You still provide |
|---|---|---|
| 1. 3D portfolio | Three.js cubicle, home, about, **skills**, projects gallery with **search / filter / sort**, **achievements**, education, contact, smooth scroll camera, responsive | – |
| 2. Blender avatar | `public/models/basim-avatar.glb` with Idle / Wave / Talk animations, click to wave and talk, drag to rotate | the **.blend source file** |
| 3. After Effects video | `public/videos/intro.mp4` plays on the monitor | the **.aep project file** (and make sure the music is licensed) |
| 4. RAG chatbot | `api/chat.js`, `api/_lib/rag.js`, `api/_lib/knowledge.json`, chat window with citations; explanation in `docs/RAG-PIPELINE.md` | screenshots of grounded answers + "I don't have that" answer |
| 5. Contact system | name, email, subject, message; browser + server validation; honeypot, minimum fill time, rate limit; SMTP via env vars | **screenshot of the email arriving in the inbox** |
| 6. Deployment + docs | `README.md`, `docs/DEPLOYMENT.md` | the **live URL** |

## Extra credit already implemented
Interactive 3D objects (camera follows the mouse; click or hover the Rubik's cube) · dark/light themes · voice questions and spoken answers · multilingual site and chatbot (6 languages, RTL) · animated avatar gestures (wave, talk) · project filtering, search and sorting · website analytics (Vercel Analytics) · accessibility (skip link, keyboard focus, ARIA labels and live regions, reduced-motion support, no-JavaScript message, readable contrast, language and direction attributes) · chatbot source citations · loading screen.
