// Edit these placeholders. Everything else on the page reads from here.
export const MAIL = 'muhammadbasim60@gmail.com';
export const GH = 'https://github.com/basim146';
export const LI = 'https://www.linkedin.com/in/muhammad-basim-38a62b287/';
export const WHATSAPP = 'https://wa.me/923161337162'; // 0316-1337162
export const CV_URL = 'cv/Muhammad_Basim_CV.pdf';
export const VIDEO_URL = 'videos/intro.mp4'; // After Effects intro: put intro.mp4 in public/videos/ and use 'videos/intro.mp4'
export const AVATAR_URL = 'models/basim-avatar.glb'; // rigged 3D avatar (Idle / Wave / Talk clips)
// Where the Play button goes. Host the game as its own website (see docs/HOSTING-THE-GAME.md) and paste its address here,
// e.g. 'https://dont-touch-the-floor.netlify.app'. Until then it opens the copy that ships inside this project.
export const GAME_URL = 'https://dont-touch-the-floor.netlify.app/';
// 'tab' = open the game's website in a new browser tab (recommended). 'overlay' = play inside this page.
export const GAME_MODE = 'tab';

// Case studies. `media` = up to 3 image/video paths in public/media/ (empty slots show a placeholder).
export const PROJECTS = [
  { title: 'Don’t Touch the Floor!', tags: ['Three.js', 'WebGL', 'Vite', 'Playable'],
    text: 'The floor is lava and it keeps rising. A chaotic 3D platformer where furniture collapses, hazards fall and random chaos events strike. 3 rooms, 3 characters, 6 chaos events.',
    play: true, media: ['media/dtf-gameplay.png', 'media/dtf-menu.png', 'media/dtf-characters.png'] },
  { title: 'Neon Defender', tags: ['C++', 'OpenGL', 'Custom engine'],
    text: 'A 2D game engine written from scratch in C++ and raw OpenGL, with its own renderer and physics.', media: ['videos/neondefender.mp4', 'media/neon-menu.jpg', 'media/neon-gameplay.jpg'] },
  { title: 'Blade of Shadows', tags: ['Unity', 'C#', 'AI', 'Dialogue'],
    text: 'An action game with three enemy types, an adaptive boss and an NPC dialogue tree that drives the story.', media: ['videos/bladeofshadows.mp4', 'media/blade-menu.jpg', 'media/blade-gameplay.jpg'] },
  { title: 'Ignition X', tags: ['Unreal Engine', 'Blueprints', 'AI', 'Racing'],
    text: 'A racing game with AI opponents that overtake and recover when stuck. 3 laps, 7 cars, minimap and HUD.', media: ['videos/ignitionx.mp4', 'media/ignition-track.jpg', 'media/ignition-race.jpg'] },
  { title: 'Rage Room', tags: ['VR', 'First-person', 'Weapons', 'Destruction'],
    text: 'A first-person VR rage room: pick a weapon, step into a sci-fi chamber and smash the barrels and targets around you.', media: ['videos/rageroom.mp4', 'media/rage-menu.jpg', 'media/rage-gameplay.jpg'] },
];

export const TICKER = ['Class of 2027', 'NED University', '5 games built', 'Unity', 'Unreal Engine', 'Three.js', 'C++ & OpenGL', 'Blender'];

// chatbot source zone -> page section
export const ZONE_TO_SECTION = { home: 'top', about: 'about', skills: 'skills', projects: 'work', arcade: 'work', education: 'edu', cinema: 'top', contact: 'contact' };

// Skills section (levels come from the CV; no level = shown as a tag only)
export const SKILLS = [
  { g: 'sk_engines', items: [['Unity', 'lvl_adv', 90, 'AR/VR'], ['Unreal Engine', 'lvl_int', 65], ['Custom C++ engine', 'lvl_built', 80]] },
  { g: 'sk_langs', items: [['C#', 'lvl_adv', 90], ['C++', 'lvl_int', 65], ['Python', 'lvl_basic', 35]] },
  { g: 'sk_graphics', items: [['OpenGL'], ['Blender', 'lvl_basic', 35]] },
  { g: 'sk_core', items: [['sk_ai'], ['sk_gp'], ['sk_phys'], ['sk_oop'], ['sk_mem']], tr: true },
];
