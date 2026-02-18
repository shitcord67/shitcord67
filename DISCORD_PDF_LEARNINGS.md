# Discord PDF Learnings (Print Snapshots)

Source set: `SVGscreenshots/convertedpdfs/*.pdf` (Discord pages printed to PDF by user).

This file is intended as persistent context for future LLM runs.

## Stable UI Patterns Observed

1. Unread flow is explicit and persistent.
- Channel view often shows a "new messages since ..." marker.
- Quick "mark as read" affordance is present in channel-level UI.

2. Composer state is context-sensitive.
- Read-only channels show a clear "no permission to send" message.
- Input/footer communicates action constraints instead of silently failing.

3. Top bar utility density is high.
- Frequent access to pins, member list toggles, and channel-level actions.
- Utility actions remain visible while scrolling message history.

4. Picker and media surfaces are segmented.
- Emoji/GIF/Sticker entry points are explicit, not hidden behind one generic control.
- Recents/frequently-used surfaces are emphasized.

5. Channel semantics are strict.
- Announcement-like channels behave differently from normal chat channels.
- Moderation and role gates are surfaced in-channel.

6. Message chronology clarity.
- Day separators and unread boundaries are visually strong and easy to scan.

## Gaps Identified Against Current App

1. Rich search UX (in-channel search filters, result jumps, from/user/date scoping).
2. Better threads/forum tag workflows (create/filter tags, defaults per post).
3. More complete pinned-message UX (pin browser parity and sort/filter controls).
4. Channel permission matrix depth (view/send/thread/reaction granularity).
5. Voice/stage channel parity (states, controls, and sidebar behavior).
6. Home/friends/Nitro/shop level shells and navigation parity.

## Implemented This Run Based On PDF Cues

1. Guild unread sticky banner with quick `Mark read` and `Jump`.
2. Header `Mark Read` button for active guild channel.
3. `Pins` header button now shows live pin count.
4. Composer character counter (`0/400`) with near-limit warning states.
5. Read-only announcement behavior for non-moderators.
6. Composer system notice line for permission/slowmode context.
7. Slowmode core model (`slowmodeSec`, per-user cooldown state).
8. `/slowmode <seconds|off>` slash command.
9. Slowmode channel settings control.
10. Slowmode quick presets in channel context menu + cooldown enforcement on send.

## Implemented In Follow-up Run

1. Channel utility slash commands for quick moderation/navigation (`/pins`, `/unpinall`, `/rename`, `/channelinfo`, `/whereami`, `/jumpunread`).
2. Keyboard-first channel workflow (`Alt+R`, `Alt+I`, `Alt+N/P`, `Alt+ArrowUp/Down`) without overriding browser-reserved shortcuts.
3. Message copy menu now includes Markdown quote output for cross-posting/logging.
4. Header unread workflow extended with direct next-unread jump control and unread counters.
5. Visual fidelity pass aligned core surfaces toward Discord (typography stack, channel-row contrast, header utility buttons, message rhythm, member hover states).
6. Guild lifecycle UX improved: setup templates at creation time plus first-class guild settings (name/description/accent/delete).
7. DM mode now has a dedicated home surface instead of falling through to empty channel UI.

## Implemented In Latest Parity Pass

1. Message rows now use a Discord-like avatar column with tighter two-column rhythm.
2. Consecutive same-author messages compact/group (name hidden on grouped rows, timestamp-on-hover behavior).
3. DM home cards now include avatar + presence + time + better preview hierarchy.
4. Global surface spacing/radii updated toward Discord desktop proportions (rail/channel/header/member/composer).
5. Login/chat view switching hardened against partial render failure (`safeRender` + deterministic screen sync).
6. Channel list sections now support collapsible headers with persisted state and chevron affordances.
7. Header title now uses dedicated glyph + label slots with cleaner topic separator behavior.
8. Composer switched to textarea rhythm (`Enter` send, `Shift+Enter` newline), closer to desktop Discord typing.

## Operational Guidance

1. Prefer PDF-first reference processing (`scripts/process_pdf_references.py`) to avoid brittle SVG artifacts.
2. Use this file plus `TODO` to select next parity batches before adding net-new feature families.
