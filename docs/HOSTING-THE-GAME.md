# Hosting "Don't Touch the Floor!" as its own website

The game is a ready-made static site (just `index.html` + an `assets` folder), so it needs no server.
It is included as `dont-touch-the-floor-site.zip` (unzip it to get the folder), and also lives in `public/games/dont-touch-the-floor/`.

## Option A: Netlify Drop (easiest, about 2 minutes)
1. Unzip `dont-touch-the-floor-site.zip`.
2. Go to https://app.netlify.com/drop (create a free account when asked, so the site is not deleted).
3. Drag the unzipped folder onto the page. You get an address like `https://random-name.netlify.app`.
4. In Site settings, change the site name to something nice, e.g. `dont-touch-the-floor`.

## Option B: Vercel
Create a new GitHub repository containing the contents of the folder (`index.html` and `assets/` at the top level), import it on vercel.com (Framework: Other), deploy.

## Connect it to the portfolio
1. Open `src/config.js` and set `GAME_URL = 'https://your-game-address'`.
2. Keep `GAME_MODE = 'tab'` (opens the game in a new tab). Use `'overlay'` to play inside the portfolio page instead.
3. Commit and redeploy the portfolio. The Play button now takes visitors to the game's own website.
