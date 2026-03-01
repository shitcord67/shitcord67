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

## XMPP Messenger Codebase Survey (2026-03-01)

Scope and scale:
- `xmppmessengers` aggregate size: ~26k files, ~2.62M LOC (cloc sum).
- Largest repos by size: `pade` (~1.3G), `monocles_chat` (~1.4G), `Spark` (~422M), `gajim` (~236M).
- Smaller/quick-scan candidates: `convo` (~1.3M), `aparte` (~1.9M), `xmpp-web` (~3.1M), `converse-desktop` (~3.3M).

Repos reviewed (light scan):
- `xmppmessengers/convo`
  - KaiOS client built on Converse.js. README highlights this; code exposes OMEMO toggle in UI (`src/stores.ts`, `src/routes/Chat.svelte`).
- `xmppmessengers/converse-desktop`
  - Electron wrapper around Converse.js. README explicitly lists OMEMO and MAM as features.
- `xmppmessengers/xmpp-web`
  - README lists features including MUC (XEP-0045), bookmarks (XEP-0048), HTTP upload (XEP-0066/XEP-0363), chat states (XEP-0085), message formatting (XEP-0393), moderation (XEP-0425), and vCard avatars (XEP-0054).
- `xmppmessengers/aparte`
  - `doap.xml` lists XEP support: XEP-0045, XEP-0048, XEP-0392, XEP-0313, XEP-0308 (partial), XEP-0384 (partial; OMEMO in MUC not supported), XEP-0245, XEP-0280, XEP-0402.

Note:
- Heavier repos (`Conversations`, `Dino`, `Gajim`, etc.) not fully re-read due to scale; worth targeted follow-up if specific feature gaps are discovered.
