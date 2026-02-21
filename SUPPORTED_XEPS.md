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
| XEP-0199 | XMPP Ping | Implemented | Replies to incoming ping IQs and sends periodic keepalive pings on active XMPP sessions. |
| XEP-0153 | vCard-Based Avatars | Partial | Reads `vcard-temp:x:update` and fetches avatar via vCard. Publish/update from client is not implemented. |
| XEP-0203 | Delayed Delivery | Partial | Delay stamps are parsed and used for timeline ordering. |
| XEP-0280 | Message Carbons | Partial | Client requests carbons and processes carbon forwarded stanzas. |
| XEP-0297 | Stanza Forwarding | Partial | Forwarded stanzas are consumed for MAM/carbons handling. |
| XEP-0313 | Message Archive Management (MAM) | Partial | Loads archived history for MUC and DM, with pagination support. |
| XEP-0359 | Unique and Stable Stanza IDs | Partial | Uses stanza IDs/reference IDs for dedupe and reply matching; outbound XMPP sends now include `origin-id` hints. |
| XEP-0308 | Last Message Correction | Partial | Incoming `replace` corrections (`urn:xmpp:message-correct:0`) update matching DM/MUC messages, and local edits attempt to publish correction stanzas when a reference ID is known. |
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
| XEP-0444 | Message Reactions | Planned | Local UI reactions exist, but no full XEP-0444 stanza interoperability yet. |
| XEP-0363 | HTTP File Upload | Planned | Attachments are handled as links/OOB; no integrated HTTP upload workflow yet. |
| XEP-0084 | User Avatar | Planned | Avatar PubSub (`urn:xmpp:avatar:*`) read path is incomplete. |
| Draft (vendor) | Profile Decor / Nameplates (`urn:shitcord67:profile:decor:0`) | Planned | Candidate extension for nameplate URLs, role-color hints, and client platform flags. See `XEP_DRAFT_NAMEPLATES.md`. |

## Notes

- Server feature availability varies by provider; a supported XEP may still be unavailable on a specific server.
- This list is implementation-oriented (what the client does today), not just what servers advertise in stream features.
