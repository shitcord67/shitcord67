# Local Relay and Interop Testing Guide

This is a practical test flow you can follow later without needing to remember command details.

## 1) Local Relay (two tabs) quick setup

1. Open two browser tabs with the app.
2. Log in with the same account in both tabs.
3. In tab A, set relay mode to `local` and enable auto-connect.
4. Wait until both tabs show `Local · Connected`.
5. In both tabs, run `/relay local`.
6. Confirm diagnostics look sane in both places:
   - `supported yes`
   - `channel open`
   - `mode local`
   - `status connected` (or similar connected state)
   - a non-empty `client` id

## 2) Local Relay message sync checks

1. Open the same channel in both tabs.
2. Send a message in tab A.
3. Confirm it appears in tab B in about 1 second.
4. Send a message in tab B.
5. Confirm it appears in tab A.

If either direction fails, capture:
- current channel name
- relay status line in both tabs
- `/relay local` output from both tabs

## 3) Typing indicator checks

1. Start typing in tab A (do not send yet).
2. Confirm typing indicator appears in tab B.
3. Stop typing.
4. Confirm indicator clears in tab B within about 8 seconds.

If it sticks, note exact clear time (for example, "cleared after 14s").

## 4) DM checks

1. Switch tab A to a DM with the same user visible in tab B.
2. Send a DM from tab A.
3. Confirm it appears in tab B.

## 5) Reconnect resilience check

1. Turn relay mode off.
2. Turn relay mode back to `local`.
3. Confirm both tabs reconnect.
4. Re-run one message test in each direction.

## 6) Link/media checks

### YouTube link preview

1. Post a YouTube link (normal video URL or `/shorts/` URL).
2. Confirm link card is rendered and clickable.
3. Confirm host/path look correct.

### GIF rendering

1. Post: `https://archuser.de/the-rock.gif`
2. Confirm image actually renders (not broken icon).
3. If broken, open in new tab and record HTTP error/status if visible.

### SWF message behavior

1. Post a SWF URL, for example:
   - `http://127.0.0.1:35767/swf/nanaca-crash_v110.swf`
2. Confirm SWF player/card renders.
3. Confirm the raw SWF URL text is not shown in message body.
4. Open SWF controls and scroll away from the message.
5. Confirm SWF view follows immediately without visible lag.

## 7) XMPP call interop checks (Movim + Dino)

## Basic expectation

- Invites should be received both directions.
- Accept should lead to established media.
- Ending call should terminate cleanly (no repeated protocol errors loop).

## Movim test

1. Start a call from this app to Movim.
2. Accept on Movim.
3. Check two-way audio.
4. Repeat with Movim calling this app.

Collect if failing:
- whether `propose`, `ringing`, `proceed`, `accept` were seen
- first `transport-info` / `content-modify` error stanza

## Dino test

1. Dino calls this app, accept.
2. Verify Dino does not crash.
3. Verify two-way audio.
4. Repeat with this app calling Dino.

Collect if failing:
- any `feature-not-implemented`
- any `can't process multiple content nodes`
- any `unknown-session` on terminate

## 8) Useful debug commands

- DM or channel local relay snapshot:
  - `/relay local`
- XMPP runtime console in chat:
  - `/xmppconsole here`
- Native XMPP call status snapshot:
  - `/callxmpp status`

## 9) Log template for quick bug reports

Copy and fill this block after each failed run:

```
Date/Time (UTC):
Peer client:
Scenario: (local relay | movim call | dino call | gif | youtube | swf)
Expected:
Actual:
Commands run:
First relevant error stanza/log line:
Notes:
```
