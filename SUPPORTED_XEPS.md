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
| XEP-0071 | XHTML-IM | Partial | Incoming XHTML content is converted to chat markdown/text (formatting, links, lists, and headings), and XHTML media hints such as `<img src>` are consumed as attachments for sticker/image rendering (including Movim-style external image URLs). |
| XEP-0231 | Bits of Binary | Partial | Inbound inline BoB payloads (`urn:xmpp:bob`) are parsed for attachment rendering (including `cid:` references from XHTML `<img>`, `<source>`, and `<object>` paths), and unresolved `cid:` sticker/media references trigger BoB IQ fetch attempts to hydrate Movim-style stickers. Outbound BoB publish is not implemented. |
| XEP-0249 | Direct MUC Invitations | Partial | Parses incoming `jabber:x:conference` direct room invites in DMs, maps invited rooms into `XMPP Spaces`, and supports outbound DM invites via `/invitexmpp <room-jid> [| reason [| password [| continue [| thread-id]]]]`. |
| XEP-0156 | Discovering Alternative XMPP Connection Methods | Partial | Login/discovery flows query host-meta endpoints (local gateway first, optional browser fallback) and parse both XML XRD and JSON JRD host-meta payloads for WebSocket alt-connections. |
| XEP-0085 | Chat State Notifications | Implemented | Sends and receives composing/paused style states for MUC/DM typing indicators. |
| XEP-0184 | Message Delivery Receipts | Partial | Direct-message sends now request receipts and mark outbound DM messages as delivered when receipts arrive. Receipt-request stanza building is now centralized in XEP module helpers and avoids duplicate `<request/>` insertion on reused builders. Groupchat receipts are not tracked. |
| XEP-0333 | Chat Markers | Partial | DM sends now include `markable` hints, inbound markable DMs receive `received` markers plus immediate `displayed` markers when that DM is actively open/visible, incoming `displayed`/`acknowledged` markers upgrade outbound DM status to read, and local DM read updates publish `displayed` markers via shared marker-flow XEP logic with broader reference-id fallback compatibility. Outbound builder helpers now avoid duplicate `markable` insertion when a stanza builder is reused. |
| XEP-0334 | Message Processing Hints | Partial | Outbound DM/MUC/correction/reaction messages include `urn:xmpp:hints` processing hints (OMEMO sends `no-store`/`no-permanent-store`/`no-copy`/`no-permanent-copy`; plaintext sends `store`), disco feature responses advertise `urn:xmpp:hints`, and inbound hints are parsed for base/correction/retraction/reaction flows and surfaced on messages as hint metadata/badges. |
| XEP-0030 | Service Discovery | Partial | Responds to incoming `disco#info` queries with supported client feature set (including call/Jingle signaling plus chatstates/receipts), uses `disco#items` for upload and MUC room discovery workflows, and tolerates non-strict `max-file-size` value formats when parsing upload limits. Incoming disco reply routing and call-feature evaluation are centralized in the XEP module, including tolerant feature-set normalization for interop scoring. |
| XEP-0199 | XMPP Ping | Implemented | Replies to incoming ping IQs and sends periodic keepalive pings on active XMPP sessions. Incoming ping reply handling is now centralized in the XEP module (`xmppHandleIncomingPingGet`) for spec-consistent `iq/result` responses. |
| XEP-0319 | Last User Interaction in Presence | Partial | Parses incoming `<idle xmlns='urn:xmpp:idle:1' since='...'>` hints and uses them for DM peer `Last active` metadata when available. |
| XEP-0352 | Client State Indication | Partial | Detects CSI feature support from stream features and sends `active`/`inactive` hints based on app focus/visibility while connected. |
| XEP-0153 | vCard-Based Avatars | Partial | Reads `vcard-temp:x:update` and fetches avatar via vCard. Publish/update from client is not implemented. |
| XEP-0203 | Delayed Delivery | Partial | Delay stamps are parsed and used for timeline ordering. |
| XEP-0280 | Message Carbons | Partial | Client requests carbons and processes carbon forwarded stanzas. |
| XEP-0115 | Entity Capabilities | Partial | Broadcasts caps hash in presence and answers disco#info queries with supported feature list. |
| XEP-0297 | Stanza Forwarding | Partial | Forwarded stanzas are consumed for MAM/carbons handling. |
| XEP-0313 | Message Archive Management (MAM) | Partial | Loads archived history for MUC and DM, with module-driven paging/retry orchestration (including alternate DM archive targets), stale-load recovery, and richer page metadata parsing from `<fin/>` responses. |
| XEP-0066 | Out of Band Data | Partial | Inbound `jabber:x:oob` attachment payloads are parsed into message attachments with namespace/local-name tolerant matching, and loose attachment URLs are extracted from compatible message payloads as a fallback. Unsupported OOB payloads keep visible fallback text instead of being silently dropped. |
| XEP-0372 | References | Partial | Consumes `urn:xmpp:reference:0` attachment references (URI/name/media metadata) for DM/MUC attachment rendering with compatibility handling for prefixed stanzas. |
| XEP-0385 | Stateless Inline Media Sharing (SIMS) | Partial | Parses inbound `urn:xmpp:sims:1` `media-sharing` payloads (including Movim-style nested references/URIs) into message attachments. Outbound attachment sends now include lightweight SIMS/file metadata URL hints, but full standalone SIMS publish workflows are still incomplete. |
| XEP-0446 | File Metadata Element | Partial | Consumes `urn:xmpp:file:metadata:0` file metadata fields (name/media type/URI hints) to improve inbound attachment rendering and type detection. |
| XEP-0363 | HTTP File Upload | Partial | Outbound local DM/MUC attachments now attempt slot-based HTTP upload and send OOB/reference metadata with resulting URLs. Availability still depends on server disco/upload support and CORS/PUT policy. |
| XEP-0359 | Unique and Stable Stanza IDs | Partial | Uses stanza IDs/reference IDs for dedupe and reply matching (including namespace-prefix tolerant `stanza-id`/`origin-id` extraction), and outbound XMPP sends include `origin-id` hints. |
| XEP-0308 | Last Message Correction | Partial | Incoming `replace` corrections (`urn:xmpp:message-correct:0`) update matching DM/MUC messages with namespace-prefix tolerant parsing for compatibility stanzas, and local edits attempt to publish correction stanzas when a reference ID is known. Outbound message-builder helpers now avoid duplicate `replace` insertion on reused stanza builders. |
| XEP-0444 | Message Reactions | Partial | Incoming `<reactions/>` updates now apply to DM/MUC messages with namespace-prefix tolerant parsing, and local reaction clicks publish outbound reaction stanzas using per-user reaction sets. |
| XEP-0424 | Message Retraction | Partial | Incoming `<retract/>` (direct and `fasten:0 apply-to`) stanzas now retract matching DM/MUC messages with namespace-prefix tolerant parsing instead of showing unsupported fallback text. |
| XEP-0482 | Call Invites | Partial | Sends and consumes `urn:xmpp:call-invites:0` for DM and room flows, including Movim-style Muji room invites (`<muji room='...'>`) plus groupchat accept/reject/left handling; full native media interop is still incomplete. |
| XEP-0402 | PEP Native Bookmarks | Implemented | Reads/publishes bookmarks via PubSub, mirrors legacy storage, applies pubsub updates for XMPP Spaces, and now publishes explicit `pubsub#notify_delete` bookmark options for broader server-side propagation compatibility. |
| XEP-0410 | MUC Self-Ping | Partial | Joined MUC rooms now run periodic self-pings and trigger controlled rejoin attempts after repeated ping failures to improve room session continuity. |
| XEP-0421 | Anonymous unique occupant identifiers for MUCs | Partial | Parses `urn:xmpp:occupant-id:0` in MUC message/presence stanzas and uses it to stabilize occupant/reaction actor mapping even when nicks change or real JIDs are hidden. |
| XEP-0461 | Message Replies | Partial | Parses incoming reply metadata (including namespace-prefix tolerant fallback/reply parsing) and publishes outbound `<reply/>` metadata with fallback quote ranges for DM/MUC sends. |
| XEP-0428 | Fallback Indication | Partial | Consumes fallback ranges to clean reply fallback text for `XEP-0461` messages. |
| XEP-0059 | Result Set Management | Partial | Used with MAM paging (`max`, `before`) and now parses returned `first`/`last`/`count` metadata from MAM result sets for more robust paging state updates. |
| XEP-0048 | Bookmarks (legacy) | Partial | Legacy bookmark storage fallback is supported. |
| XEP-0054 | vcard-temp | Partial | vCard retrieval is used for avatar lookup. |
| XEP-0454 | OMEMO Media Sharing | Partial | Encrypts attachments with AES-256-GCM and shares `aesgcm://` URLs; inbound `aesgcm://` payloads can be decrypted/downloaded. |
| XEP-0384 | OMEMO Encryption | Partial | Supports OMEMO payload handling across legacy (`eu.siacs.conversations.axolotl`) and OMEMO 2 (`urn:xmpp:omemo:2`) namespaces, including dual-namespace device-list/bundle publish+fetch and namespace-aware EME markers for DM and non-anonymous MUC text payloads; anonymous-room OMEMO remains unsupported. |

## Planned / Not Yet Implemented

| XEP | Name | Status | Notes |
|---|---|---|---|
| XEP-0084 | User Avatar | Planned | Avatar PubSub (`urn:xmpp:avatar:*`) read path is incomplete. |
| XEP-0166 | Jingle | Partial | DM call session scaffolding now sends/handles `session-initiate`, `session-accept`, `session-info`, `transport-info`, `transport-replace`, `content-modify`, `content-remove`, and `session-terminate`, with per-session peer-connection candidate apply/queue behavior. Outbound sessions preserve SDP-derived content names, emit BUNDLE grouping metadata, align answer content naming to inbound remote content order, emit `transport-info` per discovered content (instead of a single primary content), and now normalize session-info/content-modify/session-terminate IQ payloads (including spec reason tokens) via shared XEP send helpers for stronger cross-client interop; full media transport/session negotiation is still incomplete. |
| XEP-0167 | Jingle RTP Sessions | Partial | RTP content/session-info signaling scaffolding is now handled (`session-initiate`, `session-accept`, `session-info/ringing`). Outbound RTP descriptions now include `rtcp-mux` plus richer SDP-derived content metadata, while full codec/SDP/WebRTC media negotiation remains incomplete. |
| XEP-0353 | Jingle Message Initiation | Partial | DM call signaling scaffolding now handles `propose/proceed/ringing/reject/retract` with interoperability checks and fallback; full native media session wiring is still incomplete. |
| XEP-0320 | Use of DTLS-SRTP in Jingle Sessions | Partial | DTLS fingerprint/setup metadata is now parsed/propagated in Jingle signaling and SDP priming scaffolding; full secure media establishment across clients is still incomplete. |
| XEP-0503 (Draft) | Spaces | Partial | Maintains a local registry of XMPP Spaces mappings and room metadata while full server-backed hierarchy support is under development. |
| Draft (vendor) | Profile Decor / Nameplates (`urn:shitcord67:profile:decor:0`) | Planned | Candidate extension for nameplate URLs, role-color hints, and client platform flags. See `XEP_DRAFT_NAMEPLATES.md`. |

## Notes

- Server feature availability varies by provider; a supported XEP may still be unavailable on a specific server.
- This list is implementation-oriented (what the client does today), not just what servers advertise in stream features.
- Prioritized unsupported/partial-XEP roadmap decisions are tracked in `XEP_WISHLIST.md` (scored `Implement` / `Defer` / `Avoid` with rationale).
- Full generated coverage across all current xmpp.org XEP rows is in `XEP_WISHLIST_ALL.md`.
- Lifecycle status-sorted coverage (including deferred/deprecated/obsolete buckets) is in `XEP_STATUS_INDEX.md`.
- Current AV/screenshare in-client behavior uses a configurable web conference fallback room launcher; native Jingle signaling exists but media transport is still scaffolding-level.
- Web-conference and native-XMPP call controls now coexist in UI/commands; native signaling interop with external XMPP clients is the next protocol priority.
- Shared whiteboard currently uses a configurable web whiteboard room launcher; native XMPP whiteboard extension interop is planned.
