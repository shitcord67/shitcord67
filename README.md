# FlashCord (Discord-lookalike MVP)

A lightweight Discord-style chat client prototype with local persistence.

## Run (Linux)
1. Open `index.html` in a browser.
2. Optional local server:
   - `python3 -m http.server 8080`
   - open `http://localhost:8080`

## Implemented
- Login by username.
- Create servers and channels.
- Send messages as current user.
- Profile customization: bio, avatar color, banner color/image URL.
- Persisted state in `localStorage` (`flashcord-state-v1`).

## Files
- `index.html`: app shell and dialogs.
- `styles.css`: Discord-inspired layout and theme.
- `app.js`: state, rendering, actions, persistence.
- `TODO`: roadmap for XMPP/Matrix and advanced features.

## Debugging
- Open browser DevTools and inspect `localStorage` key `flashcord-state-v1`.
- Clear/reset state by deleting that key and refreshing.

## Next architecture step
Add a transport adapter layer so UI logic stays independent from protocol backends (local JSON, XMPP, Matrix).
