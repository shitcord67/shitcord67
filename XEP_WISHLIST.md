# XEP Wishlist and Unsupported Prioritization

This file tracks XEPs that are currently unsupported or only partially supported, with an explicit recommendation on whether they should be implemented.

## Rating model

- `Priority score` is `0-10` (higher means stronger implementation value).
- It combines expected user impact, interop value (Movim/other clients), strategic fit for Discord-like UX, security value, and implementation cost/risk.
- `Recommendation` values:
  - `Implement`: actively build.
  - `Defer`: keep on roadmap, but do not prioritize now.
  - `Avoid`: do not invest in full support; only keep minimal compatibility where already present.

## Ranked list (highest first)

| Priority score | Recommendation | XEP | Why this rating |
|---|---|---|---|
| 10.0 | Implement | XEP-0384 OMEMO Encryption | Major trust/safety gap today; expected by modern users and clients; strong DM parity value. |
| 9.6 | Implement | XEP-0166 + XEP-0167 + XEP-0353 + XEP-0320 completion | Core native call quality/interoperability work; directly tied to current Movim/Dino call pain points. |
| 9.3 | Implement | XEP-0084 User Avatar | High UX payoff (profiles, roster, identity); widely expected and cheap relative to impact. |
| 9.0 | Implement | XEP-0357 Push Notifications | Required for reliable mobile/background messaging; important for Android path. |
| 8.8 | Implement | XEP-0343 Signaling WebRTC Datachannels in Jingle | Enables native whiteboard/control-plane features and improves call-side feature parity. |
| 8.6 | Implement | XEP-0447 Stateless File Sharing | Better modern media/file interoperability than older file transfer methods. |
| 8.2 | Implement | XEP-0503 (Draft) Spaces | Strategic product differentiation for Discord-like server/space hierarchy; already aligned with roadmap. |
| 7.9 | Implement | XEP-0198 Stream Management | Improves transport robustness and reconnect behavior; high reliability return for realtime UX. |
| 7.4 | Implement | XEP-0421 Anonymous unique occupant identifiers | Better moderation and identity continuity in MUC contexts without leaking unnecessary data. |
| 7.1 | Implement | XEP-0317 Hats | Useful for role/status labeling in rooms; maps well to richer server UX. |
| 6.8 | Implement | XEP-0249 Direct MUC Invitations | Better room onboarding/invite experience and parity with established clients. |
| 6.2 | Defer | XEP-0301 In-Band Real-Time Text | Accessibility value is real, but lower urgency than encryption/calls/reliability. |
| 5.7 | Defer | XEP-0060 PubSub (broader surface beyond current bookmark usage) | Valuable for future social/app surfaces, but broad scope and not critical for current gaps. |
| 5.1 | Defer | XEP-0054 publish/update path (vCard writes) | Nice-to-have for profile editing parity; lower impact than avatar/pubsub and OMEMO. |
| 4.8 | Defer | XEP-0153 publish/update path | Complements avatar/profile UX, but mostly incremental once 0084 is in place. |
| 2.4 | Avoid | XEP-0047 In-Band Bytestreams | Poor fit for browser/electron performance and modern media flows; inefficient transport. |
| 2.1 | Avoid | XEP-0065 SOCKS5 Bytestreams | Operationally complex and weak fit for web clients/NAT realities compared to HTTP upload/SFS. |
| 1.8 | Avoid | XEP-0096 SI File Transfer | Legacy stack superseded by HTTP upload/stateless sharing patterns. |
| 1.4 | Avoid | XEP-0095 Stream Initiation (general legacy path) | Legacy mechanism with low modern interop payoff versus newer alternatives. |
| 1.1 | Avoid | XEP-0021 Message Events | Obsoleted in practice by chat states/markers/receipts; adds complexity without meaningful upside. |

## Policy notes

- `Avoid` does not mean break compatibility; it means no major new feature investment beyond minimal parsing/fallback behavior.
- Re-score items when real-world interop pain appears (for example, Movim/Dino regressions) or when product direction changes.
- If a draft XEP matures or changes substantially, re-evaluate score and recommendation.

## Full xmpp.org coverage

- A generated, ranked list covering all rows currently published by xmpp.org is available in `XEP_WISHLIST_ALL.md`.
- A status-bucket index (including explicit deferred/deprecated/obsolete groups) is available in `XEP_STATUS_INDEX.md`.
- Source datasets used for generation:
  - `data/xep/xeps.csv`
  - `data/xep/implementation_counts.csv`
- Additional generated status CSV:
  - `data/xep/xep_status_index.csv`
- Generator:
  - `scripts/generate-xep-wishlist.mjs`

Regeneration command:

```bash
node scripts/generate-xep-wishlist.mjs
```
