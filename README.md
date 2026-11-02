# Ballonfly Frontend (React + Vite)

## Replit mein chalane ka tareeqa (Shell mein)
    npm install
    npm run dev

`src/App.jsx` ki line 10 par `API_BASE` mein apna backend URL rakhein.

## Mukhya files
- src/App.jsx        - poori app (login, feed, videos, profile...)
- src/WatchPage.jsx  - naya Watch Page (player, comments, up next) + uska CSS
- src/VideoControls.jsx, src/VideoPlayer.jsx - shorts/feed player

Watch Page ke colours `.wp` ke andar CSS variables mein hain (--color-background, --color-card, --color-cyan ...).

## Logo files
- src/assets/ballonfly-butterfly.png, ballonfly-wordmark.png, ballonfly-logo.png : app ke andar use hote hain (transparent)
- public/brand/ballonfly-logo-original.png : asli master logo (jaisa diya gaya tha)
- public/favicon-32.png, favicon-64.png, apple-touch-icon.png, icon-192.png, icon-512.png : browser/phone icons

## Vercel par deploy (Replit Shell se)
    npx vercel login
    npx vercel env add VITE_API_BASE production      (value: https://aapka-backend-url/api)
    npx vercel --prod
