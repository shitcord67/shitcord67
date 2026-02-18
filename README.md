# FlashCord (Discord-lookalike MVP)

A lightweight Discord-style chat client prototype with local persistence.

## Run (Linux)
1. Open `index.html` in a browser.
2. Optional local server:
   - `python3 -m http.server 8080`
   - open `http://localhost:8080`

## Implemented
- Login by username (creates/switches local accounts).
- Bottom-left account dock with avatar, display name, status, and settings gear.
- Full-screen user settings page (Discord-style categories: My Account, Profiles, Appearance, Advanced).
- Create servers and channels.
- Channel topics with inline edit control in chat header.
- Send messages as current user.
- Message actions: reply, edit, delete.
- Slash commands with live autocomplete popup (`/help`, `/me`, `/shrug`, `/topic`, `/clear`, `/nick`, `/status`).
- `@mention` autocomplete popup with keyboard and mouse selection.
- Lightweight emoji reactions on messages.
- Profile customization: display name, bio, custom status, presence, avatar color/image URL, banner color/image URL.
- Click usernames in chat to open profile popouts.
- Click members in the right sidebar to open profile popouts.
- Popouts/dialogs close by clicking outside the card content.
- Server member list on the right, with presence dots.
- Member list grouped into Online/Offline sections.
- Account switching popup and logout.
- Persisted state in `localStorage` (`flashcord-state-v2`, with migration from `flashcord-state-v1`).

## Files
- `index.html`: app shell and dialogs.
- `styles.css`: Discord-inspired layout and theme.
- `app.js`: state, rendering, actions, persistence.
- `TODO`: roadmap for XMPP/Matrix and advanced features.

## Debugging
- Open browser DevTools and inspect `localStorage` key `flashcord-state-v2`.
- Clear/reset state by deleting `flashcord-state-v2` (or old `flashcord-state-v1`) and refreshing.

## Next architecture step
Add a transport adapter layer so UI logic stays independent from protocol backends (local JSON, XMPP, Matrix).
