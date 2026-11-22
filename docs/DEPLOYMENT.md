# Deployment (Module 6)

1. Push the project to a GitHub repository (`node_modules`, `dist` and `.env` are git-ignored).
2. On vercel.com choose Add New → Project → import the repository. Framework: Vite (detected automatically).
3. Add these Environment Variables (Project Settings → Environment Variables), then deploy:

| Name | Value |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | a Gmail **App Password** (Google Account → Security → 2-Step Verification → App passwords) |
| `CONTACT_TO` | `muhammadbasim60@gmail.com` |
| `GEMINI_API_KEY` | key from https://aistudio.google.com/apikey |

4. Open `index.html` and change `<meta property="og:image" content="og.png">` to your full address, e.g. `https://yourname.vercel.app/og.png`, then redeploy.
5. Turn on analytics: Vercel project → Analytics → Enable (the tracking script is already in `index.html`).
6. Test on the live URL: send a contact message, ask the chatbot two questions, try Urdu/Arabic, try a phone.
7. Put the live URL in your CV, GitHub profile and LinkedIn.

Changing an environment variable only takes effect after a new deployment.

## The game
The Play button opens the game as its own website in a new tab. See `docs/HOSTING-THE-GAME.md` to host it and paste its address into `GAME_URL` in `src/config.js`.
