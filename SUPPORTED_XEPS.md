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
| XEP-0071 | XHTML-IM | Partial | Incoming XHTML content is converted to chat markdown/text (basic formatting and links), and XHTML `<img src>` media hints are consumed as attachments for sticker/image rendering (including Movim-style external image URLs). |
| XEP-0231 | Bits of Binary | Partial | Inbound inline BoB payloads (`urn:xmpp:bob`) are parsed for attachment rendering (including `cid:` references and XHTML `<img src='cid:...'>` paths) to improve Movim sticker/emoji interoperability. Outbound BoB publish is not implemented. |
| XEP-0085 | Chat State Notifications | Implemented | Sends and receives composing/paused style states for MUC/DM typing indicators. |
| XEP-0184 | Message Delivery Receipts | Partial | Direct-message sends now request receipts and mark outbound DM messages as delivered when receipts arrive. Groupchat receipts are not tracked. |
| XEP-0333 | Chat Markers | Partial | DM sends now include `markable` hints, inbound markable DMs receive `received` markers, incoming `displayed`/`acknowledged` markers upgrade outbound DM status to read, and local DM read updates publish `displayed` markers. |
| XEP-0030 | Service Discovery | Partial | Responds to incoming `disco#info` queries with supported client feature set (including call/Jingle signaling), and uses `disco#items` for upload and MUC room discovery workflows. |
| XEP-0199 | XMPP Ping | Implemented | Replies to incoming ping IQs and sends periodic keepalive pings on active XMPP sessions. |
| XEP-0319 | Last User Interaction in Presence | Partial | Parses incoming `<idle xmlns='urn:xmpp:idle:1' since='...'>` hints and uses them for DM peer `Last active` metadata when available. |
| XEP-0352 | Client State Indication | Partial | Detects CSI feature support from stream features and sends `active`/`inactive` hints based on app focus/visibility while connected. |
| XEP-0153 | vCard-Based Avatars | Partial | Reads `vcard-temp:x:update` and fetches avatar via vCard. Publish/update from client is not implemented. |
| XEP-0203 | Delayed Delivery | Partial | Delay stamps are parsed and used for timeline ordering. |
| XEP-0280 | Message Carbons | Partial | Client requests carbons and processes carbon forwarded stanzas. |
| XEP-0115 | Entity Capabilities | Partial | Broadcasts caps hash in presence and answers disco#info queries with supported feature list. |
| XEP-0297 | Stanza Forwarding | Partial | Forwarded stanzas are consumed for MAM/carbons handling. |
| XEP-0313 | Message Archive Management (MAM) | Partial | Loads archived history for MUC and DM, with pagination support. |
| XEP-0066 | Out of Band Data | Partial | Inbound `jabber:x:oob` attachment payloads are parsed into message attachments with namespace/local-name tolerant matching; unsupported OOB payloads now keep a visible fallback text instead of being silently dropped. |
| XEP-0372 | References | Partial | Consumes `urn:xmpp:reference:0` attachment references (URI/name/media metadata) for DM/MUC attachment rendering with compatibility handling for prefixed stanzas. |
| XEP-0385 | Stateless Inline Media Sharing (SIMS) | Partial | Parses inbound `urn:xmpp:sims:1` `media-sharing` payloads (including Movim-style nested references/URIs) into message attachments. Outbound SIMS publish is not implemented yet. |
| XEP-0446 | File Metadata Element | Partial | Consumes `urn:xmpp:file:metadata:0` file metadata fields (name/media type/URI hints) to improve inbound attachment rendering and type detection. |
| XEP-0363 | HTTP File Upload | Partial | Outbound local DM/MUC attachments now attempt slot-based HTTP upload and send OOB/reference metadata with resulting URLs. Availability still depends on server disco/upload support and CORS/PUT policy. |
| XEP-0359 | Unique and Stable Stanza IDs | Partial | Uses stanza IDs/reference IDs for dedupe and reply matching; outbound XMPP sends now include `origin-id` hints. |
| XEP-0308 | Last Message Correction | Partial | Incoming `replace` corrections (`urn:xmpp:message-correct:0`) update matching DM/MUC messages, and local edits attempt to publish correction stanzas when a reference ID is known. |
| XEP-0444 | Message Reactions | Partial | Incoming `<reactions/>` updates now apply to DM/MUC messages, and local reaction clicks publish outbound reaction stanzas using per-user reaction sets. |
| XEP-0424 | Message Retraction | Partial | Incoming `<retract/>` (direct and `fasten:0 apply-to`) stanzas now retract matching DM/MUC messages instead of showing unsupported fallback text. |
| XEP-0482 | Call Invites | Partial | Sends and consumes `urn:xmpp:call-invites:0` for DM call invites (external URL only); accept/reject/retract are handled for web-call fallback. |
| XEP-0402 | PEP Native Bookmarks | Partial | Reads modern bookmarks via PubSub, with legacy fallback. |
| XEP-0410 | MUC Self-Ping | Partial | Joined MUC rooms now run periodic self-pings and trigger controlled rejoin attempts after repeated ping failures to improve room session continuity. |
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
| XEP-0166 | Jingle | Partial | DM call session scaffolding now sends/handles `session-initiate`, `session-accept`, `session-info`, `transport-info`, `transport-replace`, `content-modify`, `content-remove`, and `session-terminate`, with per-session peer-connection candidate apply/queue behavior. Outbound sessions now preserve SDP-derived content names and emit BUNDLE grouping metadata for stronger cross-client interop; full media transport/session negotiation is still incomplete. |
| XEP-0167 | Jingle RTP Sessions | Partial | RTP content/session-info signaling scaffolding is now handled (`session-initiate`, `session-accept`, `session-info/ringing`). Outbound RTP descriptions now include `rtcp-mux` plus richer SDP-derived content metadata, while full codec/SDP/WebRTC media negotiation remains incomplete. |
| XEP-0353 | Jingle Message Initiation | Partial | DM call signaling scaffolding now handles `propose/proceed/ringing/reject/retract` with interoperability checks and fallback; full native media session wiring is still incomplete. |
| XEP-0320 | Use of DTLS-SRTP in Jingle Sessions | Partial | DTLS fingerprint/setup metadata is now parsed/propagated in Jingle signaling and SDP priming scaffolding; full secure media establishment across clients is still incomplete. |
| XEP-0503 (Draft) | Spaces | Planned | Tracked as the target for Discord-like server-space hierarchy once implementation and server compatibility work lands. |
| Draft (vendor) | Profile Decor / Nameplates (`urn:shitcord67:profile:decor:0`) | Planned | Candidate extension for nameplate URLs, role-color hints, and client platform flags. See `XEP_DRAFT_NAMEPLATES.md`. |

## Notes

- Server feature availability varies by provider; a supported XEP may still be unavailable on a specific server.
- This list is implementation-oriented (what the client does today), not just what servers advertise in stream features.
- Current AV/screenshare in-client behavior uses a configurable web conference fallback room launcher; native Jingle signaling exists but media transport is still scaffolding-level.
- Web-conference and native-XMPP call controls now coexist in UI/commands; native signaling interop with external XMPP clients is the next protocol priority.
- Shared whiteboard currently uses a configurable web whiteboard room launcher; native XMPP whiteboard extension interop is planned.
