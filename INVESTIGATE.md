# User Investigation Notes

This file lists things that are likely environment- or content-specific and should be validated by the user.

## Browser / Environment Checks

1. Extension-injected scripts (`content.js`) during HTML embed viewing.
- Why: extension scripts can create noisy/false-positive console errors unrelated to app logic.
- Check: retry in a clean browser profile or disable extensions temporarily.

2. Embedded external page asset health.
- Why: some embed targets reference missing files (example: `style.css` 404), which breaks their own rendering.
- Check: open embed URL directly in browser and verify resource/network errors outside the app.

3. Runtime compatibility snapshot.
- Why: behavior may vary across Chromium/Firefox versions for iframe policy and media.
- Check: record browser name/version and whether issue reproduces there.

## Evidence To Capture If A Login/Screen Bug Reappears

1. First uncaught console error after pressing Enter in login.
2. Values in local storage:
- `shitcord67-state-v1` (especially `currentAccountId`)
- `shitcord67-session-account-id`
3. DOM class states:
- `#loginScreen.className`
- `#chatScreen.className`

## Planned Investigation Topic

1. Two-click privacy-preserving media loading.
- Goal: avoid loading third-party media/HTML until user explicitly allows it.
- Suggested direction: domain allowlist + “remember choice” + optional wildcard/regex matching.

## Design Reference Workflow

1. Prefer PDF references over SVG for Discord UI snapshots.
- Reason: some SVG exports are structurally broken or visually inconsistent.
- Tooling: run `python3 scripts/process_pdf_references.py --root SVGscreenshots` to render stable PNG previews into `SVGscreenshots/pdf-previews/`.
- Optional: `--also-svg` keeps a best-effort SVG export path only when needed.

## External Reference URLs Reviewed

1. `https://github.com/Vencord/Vesktop`
- Focus: desktop shell cues, interaction pacing, and native-feeling control placement.

2. `https://github.com/fluxerapp/fluxer`
- Focus: broad architecture scanning only.
- Constraint used here: keep naming and UX wording independent in this codebase.
