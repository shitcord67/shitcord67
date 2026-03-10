# Project Agent Instructions (Persistent)

These instructions are project-local continuity notes for future LLM instances.

## Delivery Mode
- Default to execution over discussion: implement requested features directly unless blocked.
- Minimize back-and-forth questions; ask only when a decision is truly ambiguous or high-risk.
- Keep running with follow-up improvements after tests pass.

## Continuity Logging
- First action after receiving a new user prompt: append the full prompt text to `CONTINUITY_LOG.md` with a timestamp.
- Treat `CONTINUITY_LOG.md` as a handoff journal for future LLM instances when context/token limits are hit.
- Keep entries append-only; never rewrite prior prompt entries.

## Git and Change Flow
- It is explicitly allowed to add/update local `TODO` entries during implementation.
- If `TODO` is modified, include it in the next coherent commit by default (do not leave TODO edits uncommitted).
- It is explicitly allowed to commit incremental local changes without extra confirmation.
- By default, after implementing and validating changes, create coherent local commits automatically unless the user explicitly asks not to commit.
- Do not wait for a separate "please commit" prompt after code changes.
- Use small, coherent commits with clear messages.
- Do not revert unrelated user changes.

## Product Direction
- Primary goal: Discord-like UX with strong realtime behavior.
- Prioritize transport/realtime robustness (WebSocket, HTTP/SSE, XMPP).
- Prefer feature completeness and UX polish over placeholder scaffolding.

## XMPP Direction
- Continue implementing practical XEPs where useful for UX parity.
- Favor broad compatibility and cross-platform behavior.
- Keep credentials in local ignored files when needed for testing.
- Keep `SUPPORTED_XEPS.md` updated when XMPP capability changes.

## Content and Naming Constraints
- Keep naming independent from external reference projects.
- Do not add references to Plutonium, Sweden, or Humpus in product-facing copy.

## Validation
- Run syntax/tests after changes whenever feasible.
- Perform end-to-end checks for transport-related features.
- Record meaningful outcomes in commit messages and README when behavior changes.

## XEP Docs Policy
- XEP documents in this repo may be updated anytime, but do not fetch new external sources unless explicitly asked or granted after requesting approval.

## Android Legacy Strategy
- Use git worktrees for exploratory replacement of downgraded Android libraries to keep mainline clean.
- Prefer self-written or minimal-dependency Android libraries that support the lowest feasible API levels.
- Default to API level 22 when necessary, but do not raise the project-wide minSdk above 22 unless explicitly approved.
- Split functionality into separate libraries/modules when that enables lower minSdk for apps that only need a subset.
- Keep compatibility with the latest Android target SDK (currently API 36 / Android 16) while preserving minSdk 22.
- Add replacement libraries to the repo incrementally and reassess which foreign dependencies can be removed after each step.

## Long-Term Platform Direction
- Long-term goal is native apps; Electron remains a supported delivery target for now.
- Prefer C (or C-ABI compatible) code where feasible for shared core logic.

## Dependency Policy
- When adding dependencies, always look up and prefer the latest version.
- If the latest version violates project requirements (minSdk, size, licensing, etc.), use the newest version that satisfies them.
- Where possible, replace dependency functionality step-by-step with in-house code to remove the dependency over time.
- Track any dependency that violates requirements in a running list so replacement work is visible and prioritized.
