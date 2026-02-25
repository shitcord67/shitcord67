# Supported XEPs (shitcord67)

This file tracks current XMPP protocol support in `shitcord67`.

Status labels:
- `Implemented`: usable in normal flow.
- `Partial`: some parts work, but important pieces are missing.
- `Planned`: not implemented yet.

## Implemented / Partial

| XEP | Name | Status | Notes |
|---|---|---|---|
| XEP-0045 | Multi-User Chat (MUC) | Partial | Join rooms, parse occupants/presence, groupchat send/receive. Advanced moderation/config/admin flows are not complete. |
| XEP-0071 | XHTML-IM | Partial | Incoming XHTML content is converted to chat markdown/text (basic formatting and links). |
| XEP-0085 | Chat State Notifications | Implemented | Sends and receives composing/paused style states for MUC/DM typing indicators. |
| XEP-0184 | Message Delivery Receipts | Partial | Direct-message sends now request receipts and mark outbound DM messages as delivered when receipts arrive. Groupchat receipts are not tracked. |
| XEP-0333 | Chat Markers | Partial | DM sends now include `markable` hints, inbound markable DMs receive `received` markers, incoming `displayed`/`acknowledged` markers upgrade outbound DM status to read, and local DM read updates publish `displayed` markers. |
| XEP-0199 | XMPP Ping | Implemented | Replies to incoming ping IQs and sends periodic keepalive pings on active XMPP sessions. |
| XEP-0319 | Last User Interaction in Presence | Partial | Parses incoming `<idle xmlns='urn:xmpp:idle:1' since='...'>` hints and uses them for DM peer `Last active` metadata when available. |
| XEP-0352 | Client State Indication | Partial | Detects CSI feature support from stream features and sends `active`/`inactive` hints based on app focus/visibility while connected. |
| XEP-0153 | vCard-Based Avatars | Partial | Reads `vcard-temp:x:update` and fetches avatar via vCard. Publish/update from client is not implemented. |
| XEP-0203 | Delayed Delivery | Partial | Delay stamps are parsed and used for timeline ordering. |
| XEP-0280 | Message Carbons | Partial | Client requests carbons and processes carbon forwarded stanzas. |
| XEP-0297 | Stanza Forwarding | Partial | Forwarded stanzas are consumed for MAM/carbons handling. |
| XEP-0313 | Message Archive Management (MAM) | Partial | Loads archived history for MUC and DM, with pagination support. |
| XEP-0363 | HTTP File Upload | Partial | Outbound local DM/MUC attachments now attempt slot-based HTTP upload and send OOB/reference metadata with resulting URLs. Availability still depends on server disco/upload support and CORS/PUT policy. |
| XEP-0359 | Unique and Stable Stanza IDs | Partial | Uses stanza IDs/reference IDs for dedupe and reply matching; outbound XMPP sends now include `origin-id` hints. |
| XEP-0308 | Last Message Correction | Partial | Incoming `replace` corrections (`urn:xmpp:message-correct:0`) update matching DM/MUC messages, and local edits attempt to publish correction stanzas when a reference ID is known. |
| XEP-0444 | Message Reactions | Partial | Incoming `<reactions/>` updates now apply to DM/MUC messages, and local reaction clicks publish outbound reaction stanzas using per-user reaction sets. |
| XEP-0424 | Message Retraction | Partial | Incoming `<retract/>` (direct and `fasten:0 apply-to`) stanzas now retract matching DM/MUC messages instead of showing unsupported fallback text. |
| XEP-0402 | PEP Native Bookmarks | Partial | Reads modern bookmarks via PubSub, with legacy fallback. |
| XEP-0461 | Message Replies | Partial | Parses incoming reply metadata and now also publishes outbound `<reply/>` metadata with fallback quote ranges for DM/MUC sends. |
| XEP-0428 | Fallback Indication | Partial | Consumes fallback ranges to clean reply fallback text for `XEP-0461` messages. |
| XEP-0059 | Result Set Management | Partial | Used with MAM paging (`max`, `before`). |
| XEP-0048 | Bookmarks (legacy) | Partial | Legacy bookmark storage fallback is supported. |
| XEP-0054 | vcard-temp | Partial | vCard retrieval is used for avatar lookup. |

## Planned / Not Yet Implemented

| XEP | Name | Status | Notes |
|---|---|---|---|
| XEP-0384 | OMEMO Encryption | Planned | Encrypted payloads are detected but cannot be decrypted yet. |
| XEP-0084 | User Avatar | Planned | Avatar PubSub (`urn:xmpp:avatar:*`) read path is incomplete. |
| XEP-0166 | Jingle | Planned | Required signaling baseline for call setup/teardown (`session-initiate`, `session-accept`, `session-terminate`). |
| XEP-0167 | Jingle RTP Sessions | Planned | Required for real-time voice/video over RTP in Jingle sessions. |
| XEP-0353 | Jingle Message Initiation | Planned | Needed for modern out-of-band call invite/ringing UX parity with current mobile/desktop XMPP clients. |
| XEP-0320 | Use of DTLS-SRTP in Jingle Sessions | Planned | Required for secure media transport with browser/WebRTC-compatible call flows. |
| XEP-0503 (Draft) | Spaces | Planned | Tracked as the target for Discord-like server-space hierarchy once implementation and server compatibility work lands. |
| Draft (vendor) | Profile Decor / Nameplates (`urn:shitcord67:profile:decor:0`) | Planned | Candidate extension for nameplate URLs, role-color hints, and client platform flags. See `XEP_DRAFT_NAMEPLATES.md`. |

## Notes

- Server feature availability varies by provider; a supported XEP may still be unavailable on a specific server.
- This list is implementation-oriented (what the client does today), not just what servers advertise in stream features.
- Current AV/screenshare in-client behavior uses a configurable web conference fallback room launcher; native Jingle signaling XEPs above remain planned.
