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
