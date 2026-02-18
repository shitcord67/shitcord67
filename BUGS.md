# Bugs / Issues Log

This file tracks concrete bugs and regressions observed while working on the app.

## Fixed

1. Login screen remained visible after successful login.
- Symptom: chat rendered, but part/all of login card still visible.
- Root cause: CSS specificity (`#loginScreen { display: grid; }`) overrode `.screen { display: none; }`.
- Fix: use `#loginScreen.screen--active` so login is only displayed when active.
- Status: fixed in commit `53f1564`.

2. Login transition could silently fail on some runtimes.
- Symptom: pressing Enter in username field did not transition reliably.
- Root cause: fragile login path + potential runtime parsing issues in username normalization.
- Fixes:
  - hardened login transition/render fallback,
  - runtime-safe username normalization fallback.
- Status: fixed in commits `a850e27`, `effcb6b`.

3. Refresh (`F5`) could return user to login instead of keeping session.
- Symptom: account existed but app opened at login after reload.
- Fix: remember/restore active account id via `shitcord67-session-account-id` unless explicit logout.
- Status: fixed in commit `da57111`.

## Known / Open

1. External HTML embeds may emit console errors from third-party pages.
- Example: missing CSS (`404`) or blocked actions inside embedded document.
- Note: often upstream site behavior, not app-side failure.

2. HTML iframe sandbox is now permissive for script-enabled embeds.
- Current setting: `allow-same-origin allow-scripts allow-forms allow-popups allow-downloads`.
- Risk: broader embed capability/security tradeoff.
- Follow-up: implement trust gating (two-click load / domain allowlist).
