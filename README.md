# Reframe

A sliding tile puzzle built from public-domain paintings. Next.js (App Router, TypeScript).

## Run it

```
npm install
npm run dev
```

Open http://localhost:3000.

## Where things are

- `components/Game.tsx`: all game logic and UI (shuffle, sliding, timer, undo, photo upload, theme)
- `app/globals.css`: styles and light/dark theme tokens
- `public/art/`: the square-cropped paintings. To add one, drop a square JPG here and add an entry to `ART` in `Game.tsx`.

## Ideas for next

- Personal bests per picture and grid size (localStorage)
- Optional ambient music, muted by default
- Leaderboard (needs a backend and nicknames)
- Crop/reposition step for uploaded photos
- PWA wrapper for offline play and installing on phones
