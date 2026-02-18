# shitcord67 (Discord-lookalike MVP)

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
- Create guilds and channels.
- Channel topics with inline edit control in chat header.
- Send messages as current user.
- Message actions: reply, edit, delete.
- Edited-message indicator (`(edited)`).
- Slash commands with live autocomplete popup (`/help`, `/me`, `/shrug`, `/topic`, `/clear`, `/nick`, `/status`, `/markread`).
- `@mention` autocomplete popup with keyboard and mouse selection.
- Lightweight emoji reactions on messages.
- Inline image URL preview for common image links.
- Pin/unpin messages per channel, with a pinned-messages panel.
- Guild rail now scrolls as one native-feeling column (brand, guild icons, and `+` create button).
- Unread + mention badges for channels and guilds, with per-account read tracking.
- Quick channel filter input in the sidebar.
- Discord-like media picker panel in the composer (tabs: GIFs, Stickers, Emojis, SWFs, SVGs).
- Click-to-send media attachments from picker (GIF/sticker/SVG/SWF), including local SWF index support via `swf-index.json`.
- SWF message cards render with optional inline Ruffle playback when `window.RufflePlayer` is available.
- Basic per-guild role and permission system (create/assign roles, channel/topic/role management gates).
- Channel settings dialog (rename/delete with permission checks).
- Profile customization: display name, bio, custom status, presence, avatar color/image URL, banner color/image URL.
- Click usernames in chat to open profile popouts.
- Click members in the right sidebar to open profile popouts.
- Right-click context menus for guilds, channels, messages, and members (quick actions).
- Popouts/dialogs close by clicking outside the card content.
- Guild member list on the right, with presence dots.
- Member list grouped into Online/Offline sections.
- Role badges are shown on user profile popouts for the active guild.
- Account switching popup and logout.
- JSON export/import from Advanced settings for snapshot backup/restore.
- Persisted state in `localStorage` (`shitcord67-state-v1`, with migration from `flashcord-state-v2` and `flashcord-state-v1`).

## Files
- `index.html`: app shell and dialogs.
- `styles.css`: Discord-inspired layout and theme.
- `app.js`: state, rendering, actions, persistence.
- `TODO`: roadmap for XMPP/Matrix and advanced features.
- `swf-index.json`: searchable local SWF catalog for the picker.

## Debugging
- Open browser DevTools and inspect `localStorage` key `shitcord67-state-v1`.
- Clear/reset state by deleting `shitcord67-state-v1` (or old `flashcord-state-v2` / `flashcord-state-v1`) and refreshing.

## Next architecture step
Add a transport adapter layer so UI logic stays independent from protocol backends (local JSON, XMPP, Matrix).
