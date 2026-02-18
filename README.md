# shitcord67 (Discord-lookalike MVP)

A lightweight Discord-style chat client prototype with local persistence.

![shitcord67 UI screenshot](Screenshot.png)

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
- GIF video attachments autoplay/loop in chat.
- Sticker picker supports image stickers plus `.apng` and `.lottie` resources.
- Ruffle and dotLottie runtimes are auto-loaded by the app (no manual user install flow).
- Guild-scoped custom emoji (image-based) and custom sticker/media resources can be added from URL or local file.
- Debug Console in Advanced settings (runtime status + recent media/ruffle logs).
- Message context menu can copy payload as JSON or Matrix-style XML.
- Message context menu shows SWF actions only when that message has SWF attachments.
- SWF message actions are grouped under a dedicated `SWF` submenu (open viewer/fullscreen/reset/save/copy URL/download).
- SWFs auto-start in chat muted and are paused/resumed based on viewport visibility.
- SWF controls include `Play`, `Pause`, `FullScreen`, `Reset` (with confirmation), `Resize`, and `Optimal Size`.
- Per-SWF audio controls are shown on the left side of each SWF player (speaker toggle + vertical volume slider).
- SWF cards include a top-right `💾` save icon in the filename row for quick save-to-shelf.
- SWF cards show a live audio status badge (`Audio Active`, `Suppressed`, `Muted`), and right-clicking the speaker pins audio to skip auto-mute.
- Advanced settings include SWF audio policy options: single-audio or multi-audio, with global or per-guild focus scope.
- SWF audio focus prefers the SWF nearest the center of the viewport, with fullscreen SWFs prioritized.
- Advanced SWF options include default autoplay/paused mode, pause-on-auto-mute behavior, and optional collapsible VU details.
- SWF top controls are in the header row (save, play/pause, fullscreen, reset, resize, optimal size, solo focus, PiP).
- Tabbed SWF PiP dock lets you keep selected SWFs open while switching guilds/channels.
- SWF picker now supports muted Ruffle previews with lightweight sampled frame playback.
- SWF link opens are configured with confirmation prompts (`openUrlMode: "confirm"`).
- Advanced settings now include dedicated `Export SWF Saves` / `Import SWF Saves` (browser local-storage based).
- SVG attachments in chat include a direct `Download SVG` action.
- Composer has a quick SWF audio toggle button (`🔇`/`🔊`) next to the media `+` button.
- Clicking an SWF player promotes it to active audio focus (unless that SWF is explicitly muted).
- Composer SWF audio button is now 3-state: `click-to-hear` (default), `auto-on`, and `force-muted` (right-click).
- SWF floppy button now downloads the SWF file; right-click on it saves to SWF shelf.
- SWF picker previews are initialized after DOM mount to avoid detached-Ruffle playback warnings.
- Hovering/focusing the media `+` button pre-warms media runtimes (Ruffle/dotLottie) for faster picker previews.
- Media picker uses a 2-column masonry-style flow with better aspect-ratio preservation for preview media.
- SWF picker previews are non-interactive (overlay captures click-to-send), and preview players are pointer-disabled/muted.
- Each SWF card top bar includes quick SWF save import/export buttons (`⇧`/`⇩`) next to the floppy control.
- SWF save import/export targets browser-local Ruffle save storage keys on this origin (web mode), not desktop file-system paths.
- SWF Shelf lets you keep selected SWFs saved for quick reopen across channels.
- In-chat SWF cards now have a `Resize` mode for drag-resizing the player area.
- Basic per-guild role and permission system (create/assign roles, channel/topic/role management gates).
- Channel settings dialog (rename/delete with permission checks).
- Profile customization: display name, bio, custom status, presence, avatar color/image URL, banner color/image URL.
- Click usernames in chat to open profile popouts.
- Click members in the right sidebar to open profile popouts.
- Right-click context menus for guilds, channels, messages, and members (quick actions).
- Context menu keyboard controls include arrow navigation, `Enter`, `Escape`, plus `Home`/`End` and `ArrowRight`/`ArrowLeft` submenu control.
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

## Ruffle Save Notes
- In browser mode, SWF save data is stored by the browser in site storage/local storage (not as normal files on disk).
- In desktop Ruffle mode, files are stored by platform:
  - Linux (Flatpak): `~/.var/app/rs.ruffle.Ruffle/data/ruffle/SharedObjects/`
  - Linux (non-Flatpak): `~/.local/share/ruffle/SharedObjects/`
  - macOS: `/Users/<username>/Library/Application Support/ruffle/SharedObjects/`
  - Windows: `C:\\Users\\<username>\\AppData\\Local\\Ruffle\\SharedObjects\\`

## Next architecture step
Add a transport adapter layer so UI logic stays independent from protocol backends (local JSON, XMPP, Matrix).
