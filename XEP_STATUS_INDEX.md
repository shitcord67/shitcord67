# XEP Status Index (All xmpp.org Rows)

Generated from: `data/xep/xeps.csv` at 2026-02-28T02:22:26.588Z.

This file is sorted by lifecycle status buckets so deferred/deprecated/obsolete sets are easy to audit.

Status buckets present:
- Final: 11
- Stable: 78
- Active: 50
- Experimental: 86
- Proposed: 5
- Deferred: 178
- Deprecated: 15
- Obsolete: 40
- Rejected: 6
- Retracted: 37
- ProtoXEP: 183

Dormant note:
- xmpp.org export currently does not include a literal `Dormant` status bucket.
- Treat `Deferred` as the closest maintenance-planning bucket.

Implementation marker legend:
- `✅`: fully implemented in `shitcord67`.
- `🚧`: partial/in-progress in `shitcord67`.

## Final (11)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0004 | [Data Forms](https://xmpp.org/extensions/xep-0004.html) | Defer | 6.45 | Unsupported | - |
| XEP-0009 | [Jabber-RPC](https://xmpp.org/extensions/xep-0009.html) | Defer | 5.77 | Unsupported | - |
| XEP-0012 | [Last Activity](https://xmpp.org/extensions/xep-0012.html) | Defer | 6.45 | Unsupported | - |
| 🚧 XEP-0030 | [Service Discovery](https://xmpp.org/extensions/xep-0030.html) | Implement | 6.45 | Partial | - |
| XEP-0047 | [In-Band Bytestreams](https://xmpp.org/extensions/xep-0047.html) | Avoid | 3.65 | Unsupported | - |
| XEP-0077 | [In-Band Registration](https://xmpp.org/extensions/xep-0077.html) | Defer | 6.45 | Unsupported | - |
| ✅ XEP-0085 | [Chat State Notifications](https://xmpp.org/extensions/xep-0085.html) | Maintain | 8.95 | Implemented | - |
| XEP-0174 | [Serverless Messaging](https://xmpp.org/extensions/xep-0174.html) | Defer | 4.35 | Unsupported | - |
| ✅ XEP-0199 | [XMPP Ping](https://xmpp.org/extensions/xep-0199.html) | Maintain | 6.45 | Implemented | - |
| XEP-0202 | [Entity Time](https://xmpp.org/extensions/xep-0202.html) | Defer | 6.45 | Unsupported | - |
| 🚧 XEP-0203 | [Delayed Delivery](https://xmpp.org/extensions/xep-0203.html) | Implement | 6.45 | Partial | - |

## Stable (78)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0033 | [Extended Stanza Addressing](https://xmpp.org/extensions/xep-0033.html) | Defer | 6.15 | Unsupported | - |
| 🚧 XEP-0045 | [Multi-User Chat](https://xmpp.org/extensions/xep-0045.html) | Implement | 7.25 | Partial | - |
| XEP-0050 | [Ad-Hoc Commands](https://xmpp.org/extensions/xep-0050.html) | Defer | 6.15 | Unsupported | - |
| 🚧 XEP-0059 | [Result Set Management](https://xmpp.org/extensions/xep-0059.html) | Implement | 6.15 | Partial | - |
| XEP-0060 | [Publish-Subscribe](https://xmpp.org/extensions/xep-0060.html) | Defer | 6.15 | Unsupported | - |
| XEP-0065 | [SOCKS5 Bytestreams](https://xmpp.org/extensions/xep-0065.html) | Avoid | 3.35 | Unsupported | - |
| 🚧 XEP-0066 | [Out of Band Data](https://xmpp.org/extensions/xep-0066.html) | Implement | 6.15 | Partial | - |
| XEP-0070 | [Verifying HTTP Requests via XMPP](https://xmpp.org/extensions/xep-0070.html) | Defer | 6.15 | Unsupported | - |
| XEP-0072 | [SOAP Over XMPP](https://xmpp.org/extensions/xep-0072.html) | Avoid | 3.15 | Unsupported | - |
| XEP-0079 | [Advanced Message Processing](https://xmpp.org/extensions/xep-0079.html) | Defer | 6.57 | Unsupported | - |
| XEP-0080 | [User Location](https://xmpp.org/extensions/xep-0080.html) | Defer | 6.15 | Unsupported | - |
| XEP-0084 | [User Avatar](https://xmpp.org/extensions/xep-0084.html) | Implement | 7.15 | Planned | - |
| XEP-0092 | [Software Version](https://xmpp.org/extensions/xep-0092.html) | Defer | 6.15 | Unsupported | - |
| XEP-0106 | [JID Escaping](https://xmpp.org/extensions/xep-0106.html) | Defer | 6.15 | Unsupported | - |
| XEP-0107 | [User Mood](https://xmpp.org/extensions/xep-0107.html) | Defer | 6.15 | Unsupported | - |
| XEP-0108 | [User Activity](https://xmpp.org/extensions/xep-0108.html) | Defer | 6.15 | Unsupported | - |
| 🚧 XEP-0115 | [Entity Capabilities](https://xmpp.org/extensions/xep-0115.html) | Implement | 6.15 | Partial | - |
| XEP-0118 | [User Tune](https://xmpp.org/extensions/xep-0118.html) | Defer | 6.15 | Unsupported | - |
| XEP-0122 | [Data Forms Validation](https://xmpp.org/extensions/xep-0122.html) | Defer | 6.15 | Unsupported | - |
| XEP-0124 | [Bidirectional-streams Over Synchronous HTTP (BOSH)](https://xmpp.org/extensions/xep-0124.html) | Defer | 6.15 | Unsupported | - |
| XEP-0131 | [Stanza Headers and Internet Metadata](https://xmpp.org/extensions/xep-0131.html) | Defer | 5.47 | Unsupported | - |
| XEP-0141 | [Data Forms Layout](https://xmpp.org/extensions/xep-0141.html) | Avoid | 3.15 | Unsupported | - |
| XEP-0144 | [Roster Item Exchange](https://xmpp.org/extensions/xep-0144.html) | Defer | 6.57 | Unsupported | - |
| XEP-0152 | [Reachability Addresses](https://xmpp.org/extensions/xep-0152.html) | Avoid | 4.15 | Unsupported | - |
| XEP-0155 | [Stanza Session Negotiation](https://xmpp.org/extensions/xep-0155.html) | Avoid | 3.15 | Unsupported | - |
| XEP-0156 | [Discovering Alternative XMPP Connection Methods](https://xmpp.org/extensions/xep-0156.html) | Defer | 6.15 | Unsupported | - |
| XEP-0158 | [CAPTCHA Forms](https://xmpp.org/extensions/xep-0158.html) | Defer | 6.15 | Unsupported | - |
| XEP-0163 | [Personal Eventing Protocol](https://xmpp.org/extensions/xep-0163.html) | Defer | 6.15 | Unsupported | - |
| 🚧 XEP-0166 | [Jingle](https://xmpp.org/extensions/xep-0166.html) | Implement | 8.05 | Partial | - |
| 🚧 XEP-0167 | [Jingle RTP Sessions](https://xmpp.org/extensions/xep-0167.html) | Implement | 8.05 | Partial | - |
| XEP-0171 | [Language Translation](https://xmpp.org/extensions/xep-0171.html) | Avoid | 3.15 | Unsupported | - |
| XEP-0172 | [User Nickname](https://xmpp.org/extensions/xep-0172.html) | Implement | 7.15 | Unsupported | - |
| XEP-0176 | [Jingle ICE-UDP Transport Method](https://xmpp.org/extensions/xep-0176.html) | Implement | 8.05 | Unsupported | - |
| XEP-0177 | [Jingle Raw UDP Transport Method](https://xmpp.org/extensions/xep-0177.html) | Implement | 7.05 | Unsupported | - |
| 🚧 XEP-0184 | [Message Delivery Receipts](https://xmpp.org/extensions/xep-0184.html) | Implement | 7.25 | Partial | - |
| XEP-0191 | [Blocking Command](https://xmpp.org/extensions/xep-0191.html) | Defer | 6.15 | Unsupported | - |
| XEP-0198 | [Stream Management](https://xmpp.org/extensions/xep-0198.html) | Defer | 6.15 | Unsupported | - |
| XEP-0206 | [XMPP Over BOSH](https://xmpp.org/extensions/xep-0206.html) | Defer | 6.15 | Unsupported | - |
| XEP-0215 | [External Service Discovery](https://xmpp.org/extensions/xep-0215.html) | Defer | 6.15 | Unsupported | - |
| XEP-0220 | [Server Dialback](https://xmpp.org/extensions/xep-0220.html) | Implement | 7.05 | Unsupported | - |
| XEP-0221 | [Data Forms Media Element](https://xmpp.org/extensions/xep-0221.html) | Implement | 8.05 | Unsupported | - |
| XEP-0224 | [Attention](https://xmpp.org/extensions/xep-0224.html) | Defer | 6.15 | Unsupported | - |
| XEP-0227 | [Portable Import/Export Format for XMPP-IM Servers](https://xmpp.org/extensions/xep-0227.html) | Defer | 6.05 | Unsupported | - |
| 🚧 XEP-0231 | [Bits of Binary](https://xmpp.org/extensions/xep-0231.html) | Implement | 6.15 | Partial | - |
| XEP-0233 | [XMPP Server Registration for use with Kerberos V5](https://xmpp.org/extensions/xep-0233.html) | Defer | 5.63 | Unsupported | - |
| XEP-0249 | [Direct MUC Invitations](https://xmpp.org/extensions/xep-0249.html) | Implement | 7.25 | Unsupported | - |
| XEP-0258 | [Security Labels in XMPP](https://xmpp.org/extensions/xep-0258.html) | Implement | 7.87 | Unsupported | - |
| XEP-0260 | [Jingle SOCKS5 Bytestreams Transport Method](https://xmpp.org/extensions/xep-0260.html) | Avoid | 5.25 | Unsupported | - |
| XEP-0261 | [Jingle In-Band Bytestreams Transport Method](https://xmpp.org/extensions/xep-0261.html) | Avoid | 5.25 | Unsupported | - |
| XEP-0262 | [Use of ZRTP in Jingle RTP Sessions](https://xmpp.org/extensions/xep-0262.html) | Defer | 6.05 | Unsupported | - |
| XEP-0266 | [Codecs for Jingle Audio](https://xmpp.org/extensions/xep-0266.html) | Defer | 5.05 | Unsupported | - |
| 🚧 XEP-0280 | [Message Carbons](https://xmpp.org/extensions/xep-0280.html) | Implement | 7.25 | Partial | - |
| XEP-0288 | [Bidirectional Server-to-Server Connections](https://xmpp.org/extensions/xep-0288.html) | Defer | 6.37 | Unsupported | - |
| XEP-0293 | [Jingle RTP Feedback Negotiation](https://xmpp.org/extensions/xep-0293.html) | Implement | 8.05 | Unsupported | - |
| XEP-0294 | [Jingle RTP Header Extensions Negotiation](https://xmpp.org/extensions/xep-0294.html) | Implement | 8.05 | Unsupported | - |
| 🚧 XEP-0297 | [Stanza Forwarding](https://xmpp.org/extensions/xep-0297.html) | Implement | 6.15 | Partial | - |
| XEP-0300 | [Use of Cryptographic Hash Functions in XMPP](https://xmpp.org/extensions/xep-0300.html) | Implement | 8.55 | Unsupported | - |
| XEP-0301 | [In-Band Real Time Text](https://xmpp.org/extensions/xep-0301.html) | Avoid | 4.15 | Unsupported | - |
| 🚧 XEP-0308 | [Last Message Correction](https://xmpp.org/extensions/xep-0308.html) | Implement | 7.25 | Partial | - |
| 🚧 XEP-0313 | [Message Archive Management](https://xmpp.org/extensions/xep-0313.html) | Implement | 7.25 | Partial | - |
| 🚧 XEP-0319 | [Last User Interaction in Presence](https://xmpp.org/extensions/xep-0319.html) | Implement | 7.25 | Partial | - |
| 🚧 XEP-0320 | [Use of DTLS-SRTP in Jingle Sessions](https://xmpp.org/extensions/xep-0320.html) | Implement | 10.00 | Partial | - |
| 🚧 XEP-0333 | [Displayed Markers](https://xmpp.org/extensions/xep-0333.html) | Implement | 6.15 | Partial | - |
| XEP-0334 | [Message Processing Hints](https://xmpp.org/extensions/xep-0334.html) | Implement | 7.25 | Unsupported | - |
| XEP-0338 | [Jingle Grouping Framework](https://xmpp.org/extensions/xep-0338.html) | Implement | 8.05 | Unsupported | - |
| XEP-0339 | [Source-Specific Media Attributes in Jingle](https://xmpp.org/extensions/xep-0339.html) | Implement | 8.05 | Unsupported | - |
| 🚧 XEP-0352 | [Client State Indication](https://xmpp.org/extensions/xep-0352.html) | Implement | 6.15 | Partial | - |
| 🚧 XEP-0363 | [HTTP File Upload](https://xmpp.org/extensions/xep-0363.html) | Implement | 7.25 | Partial | - |
| XEP-0368 | [SRV records for XMPP over TLS](https://xmpp.org/extensions/xep-0368.html) | Implement | 8.55 | Unsupported | - |
| XEP-0386 | [Bind 2](https://xmpp.org/extensions/xep-0386.html) | Defer | 6.15 | Unsupported | - |
| XEP-0388 | [Extensible SASL Profile](https://xmpp.org/extensions/xep-0388.html) | Implement | 10.00 | Unsupported | - |
| XEP-0392 | [Consistent Color Generation](https://xmpp.org/extensions/xep-0392.html) | Defer | 6.15 | Unsupported | - |
| XEP-0393 | [Message Styling](https://xmpp.org/extensions/xep-0393.html) | Implement | 7.25 | Unsupported | - |
| XEP-0398 | [User Avatar to vCard-Based Avatars Conversion](https://xmpp.org/extensions/xep-0398.html) | Implement | 7.15 | Unsupported | - |
| 🚧 XEP-0402 | [PEP Native Bookmarks](https://xmpp.org/extensions/xep-0402.html) | Implement | 7.25 | Partial | - |
| 🚧 XEP-0410 | [MUC Self-Ping (Schrödinger's Chat)](https://xmpp.org/extensions/xep-0410.html) | Implement | 7.25 | Partial | - |
| XEP-0421 | [Occupant identifiers for semi-anonymous MUCs](https://xmpp.org/extensions/xep-0421.html) | Implement | 7.25 | Unsupported | - |
| XEP-0490 | [Message Displayed Synchronization](https://xmpp.org/extensions/xep-0490.html) | Implement | 7.25 | Unsupported | - |

## Active (50)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0001 | [XMPP Extension Protocols](https://xmpp.org/extensions/xep-0001.html) | Avoid | 2.10 | Unsupported | - |
| XEP-0002 | [Special Interest Groups (SIGs)](https://xmpp.org/extensions/xep-0002.html) | Avoid | 2.10 | Unsupported | - |
| XEP-0019 | [Streamlining the SIGs](https://xmpp.org/extensions/xep-0019.html) | Avoid | 2.10 | Unsupported | - |
| XEP-0049 | [Private XML Storage](https://xmpp.org/extensions/xep-0049.html) | Avoid | 3.85 | Unsupported | - |
| XEP-0053 | [XMPP Registrar Function](https://xmpp.org/extensions/xep-0053.html) | Avoid | 2.10 | Unsupported | - |
| 🚧 XEP-0054 | [vcard-temp](https://xmpp.org/extensions/xep-0054.html) | Implement | 4.85 | Partial | - |
| XEP-0055 | [Jabber Search](https://xmpp.org/extensions/xep-0055.html) | Avoid | 3.85 | Unsupported | - |
| XEP-0068 | [Field Standardization for Data Forms](https://xmpp.org/extensions/xep-0068.html) | Defer | 5.13 | Unsupported | - |
| XEP-0076 | [Malicious Stanzas](https://xmpp.org/extensions/xep-0076.html) | Avoid | 1.50 | Unsupported | - |
| XEP-0082 | [XMPP Date and Time Profiles](https://xmpp.org/extensions/xep-0082.html) | Implement | 7.65 | Unsupported | - |
| XEP-0083 | [Nested Roster Groups](https://xmpp.org/extensions/xep-0083.html) | Defer | 6.65 | Unsupported | - |
| XEP-0100 | [Gateway Interaction](https://xmpp.org/extensions/xep-0100.html) | Defer | 5.36 | Unsupported | - |
| XEP-0114 | [Jabber Component Protocol](https://xmpp.org/extensions/xep-0114.html) | Avoid | 3.85 | Unsupported | - |
| XEP-0127 | [Common Alerting Protocol (CAP) Over XMPP](https://xmpp.org/extensions/xep-0127.html) | Avoid | 2.55 | Unsupported | - |
| XEP-0128 | [Service Discovery Extensions](https://xmpp.org/extensions/xep-0128.html) | Defer | 5.55 | Unsupported | - |
| XEP-0132 | [Presence Obtained via Kinesthetic Excitation (POKE)](https://xmpp.org/extensions/xep-0132.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0133 | [Service Administration](https://xmpp.org/extensions/xep-0133.html) | Defer | 5.55 | Unsupported | - |
| XEP-0134 | [XMPP Design Guidelines](https://xmpp.org/extensions/xep-0134.html) | Avoid | 2.55 | Unsupported | - |
| XEP-0143 | [Guidelines for Authors of XMPP Extension Protocols](https://xmpp.org/extensions/xep-0143.html) | Defer | 4.50 | Unsupported | - |
| XEP-0145 | [Annotations](https://xmpp.org/extensions/xep-0145.html) | Avoid | 2.85 | Unsupported | - |
| XEP-0147 | [XMPP URI Scheme Query Components](https://xmpp.org/extensions/xep-0147.html) | Defer | 5.55 | Unsupported | - |
| XEP-0148 | [Instant Messaging Intelligence Quotient (IM IQ)](https://xmpp.org/extensions/xep-0148.html) | Avoid | 3.50 | Unsupported | - |
| XEP-0149 | [Time Periods](https://xmpp.org/extensions/xep-0149.html) | Avoid | 2.55 | Unsupported | - |
| 🚧 XEP-0153 | [vCard-Based Avatars](https://xmpp.org/extensions/xep-0153.html) | Implement | 4.85 | Partial | - |
| XEP-0157 | [Contact Addresses for XMPP Services](https://xmpp.org/extensions/xep-0157.html) | Defer | 5.55 | Unsupported | - |
| XEP-0160 | [Best Practices for Handling Offline Messages](https://xmpp.org/extensions/xep-0160.html) | Defer | 6.65 | Unsupported | - |
| XEP-0169 | [Twas The Night Before Christmas (Jabber Version)](https://xmpp.org/extensions/xep-0169.html) | Avoid | 1.50 | Unsupported | - |
| XEP-0170 | [Recommended Order of Stream Feature Negotiation](https://xmpp.org/extensions/xep-0170.html) | Defer | 5.36 | Unsupported | - |
| XEP-0175 | [Best Practices for Use of SASL ANONYMOUS](https://xmpp.org/extensions/xep-0175.html) | Implement | 7.95 | Unsupported | - |
| XEP-0178 | [Best Practices for Use of SASL EXTERNAL with Certificates](https://xmpp.org/extensions/xep-0178.html) | Implement | 7.95 | Unsupported | - |
| XEP-0182 | [Application-Specific Error Conditions](https://xmpp.org/extensions/xep-0182.html) | Avoid | 4.10 | Unsupported | - |
| XEP-0183 | [Jingle Telepathy Transport](https://xmpp.org/extensions/xep-0183.html) | Avoid | 3.40 | Unsupported | - |
| XEP-0185 | [Dialback Key Generation and Validation](https://xmpp.org/extensions/xep-0185.html) | Defer | 5.36 | Unsupported | - |
| XEP-0201 | [Best Practices for Message Threads](https://xmpp.org/extensions/xep-0201.html) | Defer | 4.65 | Unsupported | - |
| XEP-0205 | [Best Practices to Discourage Denial of Service Attacks](https://xmpp.org/extensions/xep-0205.html) | Defer | 5.13 | Unsupported | - |
| XEP-0207 | [XMPP Eventing via Pubsub](https://xmpp.org/extensions/xep-0207.html) | Avoid | 1.50 | Unsupported | - |
| XEP-0222 | [Persistent Storage of Public Data via PubSub](https://xmpp.org/extensions/xep-0222.html) | Defer | 4.87 | Unsupported | - |
| XEP-0223 | [Persistent Storage of Private Data via PubSub](https://xmpp.org/extensions/xep-0223.html) | Defer | 5.55 | Unsupported | - |
| XEP-0239 | [Binary XMPP](https://xmpp.org/extensions/xep-0239.html) | Avoid | 1.50 | Unsupported | - |
| XEP-0245 | [The /me Command](https://xmpp.org/extensions/xep-0245.html) | Defer | 5.55 | Unsupported | - |
| XEP-0263 | [ECO-XMPP](https://xmpp.org/extensions/xep-0263.html) | Avoid | 2.50 | Unsupported | - |
| XEP-0286 | [Mobile Considerations on LTE Networks](https://xmpp.org/extensions/xep-0286.html) | Defer | 6.27 | Unsupported | - |
| XEP-0295 | [JSON Encodings for XMPP](https://xmpp.org/extensions/xep-0295.html) | Avoid | 1.50 | Unsupported | - |
| XEP-0345 | [Form of Membership Applications](https://xmpp.org/extensions/xep-0345.html) | Avoid | 2.10 | Unsupported | - |
| XEP-0381 | [Internet of Things Special Interest Group (IoT SIG)](https://xmpp.org/extensions/xep-0381.html) | Avoid | 2.10 | Unsupported | - |
| XEP-0419 | [Improving Baseline Security in XMPP](https://xmpp.org/extensions/xep-0419.html) | Avoid | 3.90 | Unsupported | - |
| XEP-0429 | [Special Interests Group End to End Encryption](https://xmpp.org/extensions/xep-0429.html) | Defer | 4.50 | Unsupported | - |
| XEP-0457 | [Message Fancying](https://xmpp.org/extensions/xep-0457.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0458 | [Community Code of Conduct](https://xmpp.org/extensions/xep-0458.html) | Avoid | 2.10 | Unsupported | - |
| XEP-0464 | [Cookies](https://xmpp.org/extensions/xep-0464.html) | Avoid | 1.50 | Unsupported | - |

## Experimental (86)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0264 | [Jingle Content Thumbnails](https://xmpp.org/extensions/xep-0264.html) | Implement | 8.60 | Unsupported | - |
| XEP-0272 | [Multiparty Jingle (Muji)](https://xmpp.org/extensions/xep-0272.html) | Defer | 6.50 | Unsupported | - |
| XEP-0283 | [Moved](https://xmpp.org/extensions/xep-0283.html) | Avoid | 4.18 | Unsupported | - |
| XEP-0284 | [Shared XML Editing](https://xmpp.org/extensions/xep-0284.html) | Avoid | 4.18 | Unsupported | - |
| XEP-0292 | [vCard4 Over XMPP](https://xmpp.org/extensions/xep-0292.html) | Defer | 6.41 | Unsupported | - |
| XEP-0317 | [Hats](https://xmpp.org/extensions/xep-0317.html) | Defer | 5.60 | Unsupported | - |
| 🚧 XEP-0353 | [Jingle Message Initiation](https://xmpp.org/extensions/xep-0353.html) | Implement | 8.60 | Partial | - |
| XEP-0355 | [Namespace Delegation](https://xmpp.org/extensions/xep-0355.html) | Defer | 5.08 | Unsupported | - |
| XEP-0356 | [Privileged Entity](https://xmpp.org/extensions/xep-0356.html) | Defer | 4.60 | Unsupported | - |
| 🚧 XEP-0359 | [Unique and Stable Stanza IDs](https://xmpp.org/extensions/xep-0359.html) | Implement | 5.60 | Partial | - |
| XEP-0365 | [Server to Server communication over STANAG 5066 ARQ](https://xmpp.org/extensions/xep-0365.html) | Avoid | 3.50 | Unsupported | - |
| XEP-0369 | [Mediated Information eXchange (MIX)](https://xmpp.org/extensions/xep-0369.html) | Implement | 7.50 | Unsupported | - |
| 🚧 XEP-0372 | [References](https://xmpp.org/extensions/xep-0372.html) | Implement | 6.51 | Partial | - |
| XEP-0373 | [OpenPGP for XMPP](https://xmpp.org/extensions/xep-0373.html) | Defer | 4.92 | Unsupported | - |
| XEP-0377 | [Spam Reporting](https://xmpp.org/extensions/xep-0377.html) | Defer | 5.60 | Unsupported | - |
| XEP-0383 | [Burner JIDs](https://xmpp.org/extensions/xep-0383.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0384 | [OMEMO Encryption](https://xmpp.org/extensions/xep-0384.html) | Implement | 8.00 | Planned | - |
| XEP-0389 | [Extensible In-Band Registration](https://xmpp.org/extensions/xep-0389.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0394 | [Message Markup](https://xmpp.org/extensions/xep-0394.html) | Defer | 5.28 | Unsupported | - |
| XEP-0405 | [Mediated Information eXchange (MIX): Participant Server Requirements](https://xmpp.org/extensions/xep-0405.html) | Implement | 8.40 | Unsupported | - |
| XEP-0413 | [Order-By](https://xmpp.org/extensions/xep-0413.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0420 | [Stanza Content Encryption](https://xmpp.org/extensions/xep-0420.html) | Implement | 7.58 | Unsupported | - |
| XEP-0425 | [Moderated Message Retraction](https://xmpp.org/extensions/xep-0425.html) | Defer | 6.70 | Unsupported | - |
| XEP-0426 | [Character counting in message bodies](https://xmpp.org/extensions/xep-0426.html) | Defer | 4.58 | Unsupported | - |
| 🚧 XEP-0428 | [Fallback Indication](https://xmpp.org/extensions/xep-0428.html) | Implement | 5.60 | Partial | - |
| XEP-0434 | [Trust Messages (TM)](https://xmpp.org/extensions/xep-0434.html) | Defer | 5.28 | Unsupported | - |
| XEP-0438 | [Best practices for password hashing and storage](https://xmpp.org/extensions/xep-0438.html) | Avoid | 2.90 | Unsupported | - |
| XEP-0440 | [SASL Channel-Binding Type Capability](https://xmpp.org/extensions/xep-0440.html) | Implement | 8.90 | Unsupported | - |
| XEP-0441 | [Message Archive Management Preferences](https://xmpp.org/extensions/xep-0441.html) | Implement | 7.80 | Unsupported | - |
| XEP-0442 | [Pubsub Message Archive Management](https://xmpp.org/extensions/xep-0442.html) | Avoid | 3.70 | Unsupported | - |
| 🚧 XEP-0444 | [Message Reactions](https://xmpp.org/extensions/xep-0444.html) | Implement | 6.70 | Partial | - |
| 🚧 XEP-0446 | [File metadata element](https://xmpp.org/extensions/xep-0446.html) | Implement | 6.51 | Partial | - |
| XEP-0447 | [Stateless file sharing](https://xmpp.org/extensions/xep-0447.html) | Defer | 6.51 | Unsupported | - |
| XEP-0448 | [Encryption for stateless file sharing](https://xmpp.org/extensions/xep-0448.html) | Implement | 8.42 | Unsupported | - |
| XEP-0449 | [Stickers](https://xmpp.org/extensions/xep-0449.html) | Avoid | 4.18 | Unsupported | - |
| XEP-0450 | [Automatic Trust Management (ATM)](https://xmpp.org/extensions/xep-0450.html) | Avoid | 4.18 | Unsupported | - |
| XEP-0451 | [Stanza Multiplexing](https://xmpp.org/extensions/xep-0451.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0452 | [MUC Mention Notifications](https://xmpp.org/extensions/xep-0452.html) | Defer | 5.10 | Unsupported | - |
| XEP-0453 | [DOAP usage in XMPP](https://xmpp.org/extensions/xep-0453.html) | Defer | 4.71 | Unsupported | - |
| XEP-0454 | [OMEMO Media sharing](https://xmpp.org/extensions/xep-0454.html) | Avoid | 8.60 | Unsupported | - |
| XEP-0455 | [Service Outage Status](https://xmpp.org/extensions/xep-0455.html) | Avoid | 4.18 | Unsupported | - |
| XEP-0456 | [Content Rating Labels](https://xmpp.org/extensions/xep-0456.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0460 | [Pubsub Caching Hints](https://xmpp.org/extensions/xep-0460.html) | Avoid | 2.60 | Unsupported | - |
| 🚧 XEP-0461 | [Message Replies](https://xmpp.org/extensions/xep-0461.html) | Implement | 6.70 | Partial | - |
| XEP-0462 | [PubSub Type Filtering](https://xmpp.org/extensions/xep-0462.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0463 | [MUC Affiliations Versioning](https://xmpp.org/extensions/xep-0463.html) | Avoid | 3.70 | Unsupported | - |
| XEP-0465 | [Pubsub Public Subscriptions](https://xmpp.org/extensions/xep-0465.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0466 | [Ephemeral Messages](https://xmpp.org/extensions/xep-0466.html) | Avoid | 3.70 | Unsupported | - |
| XEP-0467 | [XMPP over QUIC](https://xmpp.org/extensions/xep-0467.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0468 | [WebSocket S2S](https://xmpp.org/extensions/xep-0468.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0469 | [Bookmark Pinning](https://xmpp.org/extensions/xep-0469.html) | Defer | 5.70 | Unsupported | - |
| XEP-0470 | [Pubsub Attachments](https://xmpp.org/extensions/xep-0470.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0471 | [Events](https://xmpp.org/extensions/xep-0471.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0472 | [Pubsub Social Feed](https://xmpp.org/extensions/xep-0472.html) | Avoid | 3.60 | Unsupported | - |
| XEP-0473 | [OpenPGP for XMPP Pubsub](https://xmpp.org/extensions/xep-0473.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0474 | [SASL SCRAM Downgrade Protection](https://xmpp.org/extensions/xep-0474.html) | Implement | 8.00 | Unsupported | - |
| XEP-0475 | [Pubsub Signing](https://xmpp.org/extensions/xep-0475.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0476 | [Pubsub Signing: OpenPGP Profile](https://xmpp.org/extensions/xep-0476.html) | Defer | 4.70 | Unsupported | - |
| XEP-0477 | [Pubsub Targeted Encryption](https://xmpp.org/extensions/xep-0477.html) | Defer | 5.00 | Unsupported | - |
| XEP-0478 | [Stream Limits Advertisement](https://xmpp.org/extensions/xep-0478.html) | Defer | 4.60 | Unsupported | - |
| XEP-0479 | [XMPP Compliance Suites 2023](https://xmpp.org/extensions/xep-0479.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0480 | [SASL Upgrade Tasks](https://xmpp.org/extensions/xep-0480.html) | Implement | 7.32 | Unsupported | - |
| XEP-0481 | [Content Types in Messages](https://xmpp.org/extensions/xep-0481.html) | Avoid | 3.70 | Unsupported | - |
| 🚧 XEP-0482 | [Call Invites](https://xmpp.org/extensions/xep-0482.html) | Implement | 6.82 | Partial | - |
| XEP-0483 | [HTTP Online Meetings](https://xmpp.org/extensions/xep-0483.html) | Avoid | 4.18 | Unsupported | - |
| XEP-0485 | [PubSub Server Information](https://xmpp.org/extensions/xep-0485.html) | Defer | 5.50 | Unsupported | - |
| XEP-0486 | [MUC Avatars](https://xmpp.org/extensions/xep-0486.html) | Avoid | 5.30 | Unsupported | - |
| XEP-0487 | [Host Meta 2 - One Method To Rule Them All](https://xmpp.org/extensions/xep-0487.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0488 | [MUC Token Invite](https://xmpp.org/extensions/xep-0488.html) | Avoid | 3.70 | Unsupported | - |
| XEP-0489 | [Reporting Account Affiliations](https://xmpp.org/extensions/xep-0489.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0491 | [WebXDC](https://xmpp.org/extensions/xep-0491.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0492 | [Chat notification settings](https://xmpp.org/extensions/xep-0492.html) | Implement | 7.10 | Unsupported | - |
| XEP-0493 | [OAuth Client Login](https://xmpp.org/extensions/xep-0493.html) | Defer | 4.30 | Unsupported | - |
| XEP-0494 | [Client Access Management](https://xmpp.org/extensions/xep-0494.html) | Avoid | 3.60 | Unsupported | - |
| XEP-0495 | [Happy Eyeballs](https://xmpp.org/extensions/xep-0495.html) | Avoid | 3.60 | Unsupported | - |
| XEP-0496 | [Pubsub Node Relationships](https://xmpp.org/extensions/xep-0496.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0497 | [Pubsub Extended Subscriptions](https://xmpp.org/extensions/xep-0497.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0498 | [Pubsub File Sharing](https://xmpp.org/extensions/xep-0498.html) | Avoid | 3.70 | Unsupported | - |
| XEP-0499 | [Pubsub Extended Discovery](https://xmpp.org/extensions/xep-0499.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0500 | [MUC Slow Mode](https://xmpp.org/extensions/xep-0500.html) | Avoid | 3.70 | Unsupported | - |
| XEP-0501 | [Pubsub Stories](https://xmpp.org/extensions/xep-0501.html) | Avoid | 3.60 | Unsupported | - |
| XEP-0502 | [MUC Activity Indicator](https://xmpp.org/extensions/xep-0502.html) | Defer | 4.70 | Unsupported | - |
| XEP-0503 | [Server-side spaces](https://xmpp.org/extensions/xep-0503.html) | Avoid | 3.50 | Unsupported | - |
| XEP-0504 | [Data Policy](https://xmpp.org/extensions/xep-0504.html) | Avoid | 2.60 | Unsupported | - |
| XEP-0505 | [Data Forms File Input Element](https://xmpp.org/extensions/xep-0505.html) | Avoid | 3.70 | Unsupported | - |
| ProtoXEP-55 | [Namespace Versioning in urn:xmpp](https://xmpp.org/extensions/inbox/nsver.html) | Avoid | 2.10 | Unsupported | - |

## Proposed (5)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0379 | [Pre-Authenticated Roster Subscription](https://xmpp.org/extensions/xep-0379.html) | Implement | 8.32 | Unsupported | - |
| XEP-0401 | [Ad-hoc Account Invitation Generation](https://xmpp.org/extensions/xep-0401.html) | Defer | 4.82 | Unsupported | - |
| 🚧 XEP-0424 | [Message Retraction](https://xmpp.org/extensions/xep-0424.html) | Implement | 6.60 | Partial | - |
| XEP-0445 | [Pre-Authenticated In-Band Registration](https://xmpp.org/extensions/xep-0445.html) | Defer | 6.48 | Unsupported | - |
| XEP-0484 | [Fast Authentication Streamlining Tokens](https://xmpp.org/extensions/xep-0484.html) | Implement | 7.90 | Unsupported | - |

## Deferred (178)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0031 | [A Framework For Securing Jabber Conversations](https://xmpp.org/extensions/xep-0031.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0039 | [Statistics Gathering](https://xmpp.org/extensions/xep-0039.html) | Defer | 4.22 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0044 | [Full Namespace Support for XML Streams](https://xmpp.org/extensions/xep-0044.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0056 | [Business Data Interchange](https://xmpp.org/extensions/xep-0056.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0058 | [Multi-User Text Editing](https://xmpp.org/extensions/xep-0058.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0061 | [Shared Notes](https://xmpp.org/extensions/xep-0061.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0062 | [Packet Filtering](https://xmpp.org/extensions/xep-0062.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0063 | [Basic Filtering Operations](https://xmpp.org/extensions/xep-0063.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0064 | [XPath Filtering](https://xmpp.org/extensions/xep-0064.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0067 | [Stock Data Transmission](https://xmpp.org/extensions/xep-0067.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0069 | [Compliance SIG](https://xmpp.org/extensions/xep-0069.html) | Avoid | 0.75 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0075 | [Jabber Object Access Protocol (JOAP)](https://xmpp.org/extensions/xep-0075.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0088 | [Client Webtabs](https://xmpp.org/extensions/xep-0088.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0089 | [Generic Alerts](https://xmpp.org/extensions/xep-0089.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0097 | [iCal Envelope](https://xmpp.org/extensions/xep-0097.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0098 | [Enhanced Private XML Storage](https://xmpp.org/extensions/xep-0098.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0099 | [IQ Query Action Protocol](https://xmpp.org/extensions/xep-0099.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0101 | [HTTP Authentication using Jabber Tickets](https://xmpp.org/extensions/xep-0101.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0102 | [Security Extensions](https://xmpp.org/extensions/xep-0102.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0103 | [URL Address Information](https://xmpp.org/extensions/xep-0103.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0104 | [HTTP Scheme for URL Data](https://xmpp.org/extensions/xep-0104.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0105 | [Tree Transfer Stream Initiation Profile](https://xmpp.org/extensions/xep-0105.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0109 | [Out-of-Office Messages](https://xmpp.org/extensions/xep-0109.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0110 | [Generic Maps](https://xmpp.org/extensions/xep-0110.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0113 | [Simple Whiteboarding](https://xmpp.org/extensions/xep-0113.html) | Avoid | 2.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0116 | [Encrypted Session Negotiation](https://xmpp.org/extensions/xep-0116.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0129 | [WebDAV File Transfers](https://xmpp.org/extensions/xep-0129.html) | Avoid | 4.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0135 | [File Sharing](https://xmpp.org/extensions/xep-0135.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0142 | [Workgroup Queues](https://xmpp.org/extensions/xep-0142.html) | Avoid | 3.48 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0150 | [Use of Entity Tags in XMPP Extensions](https://xmpp.org/extensions/xep-0150.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0151 | [Virtual Presence](https://xmpp.org/extensions/xep-0151.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0154 | [User Profile](https://xmpp.org/extensions/xep-0154.html) | Avoid | 4.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0159 | [Spim-Blocking Control](https://xmpp.org/extensions/xep-0159.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0161 | [Abuse Reporting](https://xmpp.org/extensions/xep-0161.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0162 | [Best Practices for Roster and Subscription Management](https://xmpp.org/extensions/xep-0162.html) | Avoid | 3.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0164 | [vCard Filtering](https://xmpp.org/extensions/xep-0164.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0165 | [Best Practices to Discourage JID Mimicking](https://xmpp.org/extensions/xep-0165.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0168 | [Resource Application Priority](https://xmpp.org/extensions/xep-0168.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0173 | [Pubsub Subscription Storage](https://xmpp.org/extensions/xep-0173.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0179 | [Jingle IAX Transport Method](https://xmpp.org/extensions/xep-0179.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0181 | [Jingle DTMF](https://xmpp.org/extensions/xep-0181.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0186 | [Invisible Command](https://xmpp.org/extensions/xep-0186.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0187 | [Offline Encrypted Sessions](https://xmpp.org/extensions/xep-0187.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0188 | [Cryptographic Design of Encrypted Sessions](https://xmpp.org/extensions/xep-0188.html) | Avoid | 3.60 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0189 | [Public Key Publishing](https://xmpp.org/extensions/xep-0189.html) | Defer | 4.22 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0194 | [User Chatting](https://xmpp.org/extensions/xep-0194.html) | Defer | 4.58 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0195 | [User Browsing](https://xmpp.org/extensions/xep-0195.html) | Avoid | 3.48 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0196 | [User Gaming](https://xmpp.org/extensions/xep-0196.html) | Defer | 4.22 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0197 | [User Viewing](https://xmpp.org/extensions/xep-0197.html) | Avoid | 3.48 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0200 | [Stanza Encryption](https://xmpp.org/extensions/xep-0200.html) | Defer | 5.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0204 | [Collaborative Data Objects](https://xmpp.org/extensions/xep-0204.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0209 | [Metacontacts](https://xmpp.org/extensions/xep-0209.html) | Avoid | 3.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0210 | [Requirements for Encrypted Sessions](https://xmpp.org/extensions/xep-0210.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0214 | [File Repository and Sharing](https://xmpp.org/extensions/xep-0214.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0217 | [Simplified Encrypted Session Negotiation](https://xmpp.org/extensions/xep-0217.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0218 | [Bootstrapping Implementation of Encrypted Sessions](https://xmpp.org/extensions/xep-0218.html) | Avoid | 3.60 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0225 | [Component Connections](https://xmpp.org/extensions/xep-0225.html) | Avoid | 3.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0226 | [Message Stanza Profiles](https://xmpp.org/extensions/xep-0226.html) | Defer | 4.40 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0228 | [Requirements for Shared Editing](https://xmpp.org/extensions/xep-0228.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0230 | [Service Discovery Notifications](https://xmpp.org/extensions/xep-0230.html) | Avoid | 3.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0232 | [Software Information](https://xmpp.org/extensions/xep-0232.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0234 | [Jingle File Transfer](https://xmpp.org/extensions/xep-0234.html) | Implement | 7.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0235 | [OAuth Over XMPP](https://xmpp.org/extensions/xep-0235.html) | Defer | 5.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0238 | [XMPP Protocol Flows for Inter-Domain Federation](https://xmpp.org/extensions/xep-0238.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0240 | [Auto-Discovery of JabberIDs](https://xmpp.org/extensions/xep-0240.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0241 | [Encryption of Archived Messages](https://xmpp.org/extensions/xep-0241.html) | Defer | 5.40 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0244 | [IO Data](https://xmpp.org/extensions/xep-0244.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0246 | [End-to-End XML Streams](https://xmpp.org/extensions/xep-0246.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0247 | [Jingle XML Streams](https://xmpp.org/extensions/xep-0247.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0248 | [PubSub Collection Nodes](https://xmpp.org/extensions/xep-0248.html) | Defer | 4.22 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0250 | [C2C Authentication Using TLS](https://xmpp.org/extensions/xep-0250.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0251 | [Jingle Session Transfer](https://xmpp.org/extensions/xep-0251.html) | Defer | 4.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0252 | [BOSH Script Syntax](https://xmpp.org/extensions/xep-0252.html) | Avoid | 0.50 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0253 | [PubSub Chaining](https://xmpp.org/extensions/xep-0253.html) | Avoid | 3.48 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0254 | [PubSub Queueing](https://xmpp.org/extensions/xep-0254.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0255 | [Location Query](https://xmpp.org/extensions/xep-0255.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0257 | [Client Certificate Management for SASL EXTERNAL](https://xmpp.org/extensions/xep-0257.html) | Defer | 6.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0259 | [Message Mine-ing](https://xmpp.org/extensions/xep-0259.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0265 | [Out-of-Band Stream Data](https://xmpp.org/extensions/xep-0265.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0267 | [Server Buddies](https://xmpp.org/extensions/xep-0267.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0268 | [Incident Handling](https://xmpp.org/extensions/xep-0268.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0269 | [Jingle Early Media](https://xmpp.org/extensions/xep-0269.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0271 | [XMPP Nodes](https://xmpp.org/extensions/xep-0271.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0273 | [Stanza Interception and Filtering Technology (SIFT)](https://xmpp.org/extensions/xep-0273.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0274 | [Design Considerations for Digital Signatures in XMPP](https://xmpp.org/extensions/xep-0274.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0275 | [Entity Reputation](https://xmpp.org/extensions/xep-0275.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0276 | [Presence Decloaking](https://xmpp.org/extensions/xep-0276.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0277 | [Microblogging over XMPP](https://xmpp.org/extensions/xep-0277.html) | Defer | 4.22 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0278 | [Jingle Relay Nodes](https://xmpp.org/extensions/xep-0278.html) | Defer | 5.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0279 | [Server IP Check](https://xmpp.org/extensions/xep-0279.html) | Defer | 5.38 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0282 | [DMUC2: Distributed MUC](https://xmpp.org/extensions/xep-0282.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0285 | [Encapsulating Digital Signatures in XMPP](https://xmpp.org/extensions/xep-0285.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0287 | [Spim Markers and Reports](https://xmpp.org/extensions/xep-0287.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0289 | [Federated MUC for Constrained Environments](https://xmpp.org/extensions/xep-0289.html) | Avoid | 4.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0290 | [Encapsulated Digital Signatures in XMPP](https://xmpp.org/extensions/xep-0290.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0291 | [Service Delegation](https://xmpp.org/extensions/xep-0291.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0296 | [Best Practices for Resource Locking](https://xmpp.org/extensions/xep-0296.html) | Avoid | 2.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0298 | [Delivering Conference Information to Jingle Participants (Coin)](https://xmpp.org/extensions/xep-0298.html) | Defer | 5.38 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0299 | [Codecs for Jingle Video](https://xmpp.org/extensions/xep-0299.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0303 | [Commenting](https://xmpp.org/extensions/xep-0303.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0304 | [Whitespace Keepalive Negotiation](https://xmpp.org/extensions/xep-0304.html) | Avoid | 2.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0305 | [XMPP Quickstart](https://xmpp.org/extensions/xep-0305.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0306 | [Extensible Status Conditions for Multi-User Chat](https://xmpp.org/extensions/xep-0306.html) | Avoid | 4.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0307 | [Unique Room Names for Multi-User Chat](https://xmpp.org/extensions/xep-0307.html) | Defer | 4.58 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0309 | [Service Directories](https://xmpp.org/extensions/xep-0309.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0310 | [Presence State Annotations](https://xmpp.org/extensions/xep-0310.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0311 | [MUC Fast Reconnect](https://xmpp.org/extensions/xep-0311.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0312 | [PubSub Since](https://xmpp.org/extensions/xep-0312.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0314 | [Security Labels in PubSub](https://xmpp.org/extensions/xep-0314.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0315 | [Data Forms XML Element](https://xmpp.org/extensions/xep-0315.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0316 | [MUC Eventing Protocol](https://xmpp.org/extensions/xep-0316.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0318 | [Best Practices for Client Initiated Presence Probes](https://xmpp.org/extensions/xep-0318.html) | Avoid | 3.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0321 | [Remote Roster Management](https://xmpp.org/extensions/xep-0321.html) | Avoid | 4.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0322 | [Efficient XML Interchange (EXI) Format](https://xmpp.org/extensions/xep-0322.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0327 | [Rayo](https://xmpp.org/extensions/xep-0327.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0328 | [JID Preparation and Validation Service](https://xmpp.org/extensions/xep-0328.html) | Defer | 4.48 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0329 | [File Information Sharing](https://xmpp.org/extensions/xep-0329.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0330 | [Pubsub Subscription](https://xmpp.org/extensions/xep-0330.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0331 | [Data Forms - Color Field Types](https://xmpp.org/extensions/xep-0331.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0332 | [HTTP over XMPP transport](https://xmpp.org/extensions/xep-0332.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0335 | [JSON Containers](https://xmpp.org/extensions/xep-0335.html) | Avoid | 3.48 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0336 | [Data Forms - Dynamic Forms](https://xmpp.org/extensions/xep-0336.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0337 | [Event Logging over XMPP](https://xmpp.org/extensions/xep-0337.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0340 | [COnferences with LIghtweight BRIdging (COLIBRI)](https://xmpp.org/extensions/xep-0340.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0341 | [Rayo CPA](https://xmpp.org/extensions/xep-0341.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0342 | [Rayo Fax](https://xmpp.org/extensions/xep-0342.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0343 | [Signaling WebRTC datachannels in Jingle](https://xmpp.org/extensions/xep-0343.html) | Defer | 6.28 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0344 | [Impact of TLS and DNSSEC on Dialback](https://xmpp.org/extensions/xep-0344.html) | Defer | 5.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0346 | [Form Discovery and Publishing](https://xmpp.org/extensions/xep-0346.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0347 | [Internet of Things - Discovery](https://xmpp.org/extensions/xep-0347.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0348 | [Signing Forms](https://xmpp.org/extensions/xep-0348.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0349 | [Rayo Clustering](https://xmpp.org/extensions/xep-0349.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0350 | [Data Forms Geolocation Element](https://xmpp.org/extensions/xep-0350.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0351 | [Recipient Server Side Notifications Filtering](https://xmpp.org/extensions/xep-0351.html) | Defer | 4.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0354 | [Customizable Message Routing](https://xmpp.org/extensions/xep-0354.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0357 | [Push Notifications](https://xmpp.org/extensions/xep-0357.html) | Defer | 6.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0358 | [Publishing Available Jingle Sessions](https://xmpp.org/extensions/xep-0358.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0361 | [Zero Handshake Server to Server Protocol](https://xmpp.org/extensions/xep-0361.html) | Avoid | 2.10 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0362 | [Raft over XMPP](https://xmpp.org/extensions/xep-0362.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0364 | [Current Off-the-Record Messaging Usage](https://xmpp.org/extensions/xep-0364.html) | Avoid | 3.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0366 | [Entity Versioning](https://xmpp.org/extensions/xep-0366.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0367 | [Message Attaching](https://xmpp.org/extensions/xep-0367.html) | Defer | 5.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0370 | [Jingle HTTP Transport Method](https://xmpp.org/extensions/xep-0370.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0371 | [Jingle ICE Transport Method](https://xmpp.org/extensions/xep-0371.html) | Defer | 6.12 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0374 | [OpenPGP for XMPP Instant Messaging](https://xmpp.org/extensions/xep-0374.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0376 | [Pubsub Account Management](https://xmpp.org/extensions/xep-0376.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0378 | [OTR Discovery](https://xmpp.org/extensions/xep-0378.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0380 | [Explicit Message Encryption](https://xmpp.org/extensions/xep-0380.html) | Implement | 8.40 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0382 | [Spoiler messages](https://xmpp.org/extensions/xep-0382.html) | Defer | 5.58 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| 🚧 XEP-0385 | [Stateless Inline Media Sharing (SIMS)](https://xmpp.org/extensions/xep-0385.html) | Implement | 7.71 | Partial | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0390 | [Entity Capabilities 2.0](https://xmpp.org/extensions/xep-0390.html) | Avoid | 3.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0391 | [Jingle Encrypted Transports](https://xmpp.org/extensions/xep-0391.html) | Implement | 8.78 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0395 | [Atomically Compare-And-Publish PubSub Items](https://xmpp.org/extensions/xep-0395.html) | Avoid | 3.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0396 | [Jingle Encrypted Transports - OMEMO](https://xmpp.org/extensions/xep-0396.html) | Implement | 8.78 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0397 | [Instant Stream Resumption](https://xmpp.org/extensions/xep-0397.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0399 | [Client Key Support](https://xmpp.org/extensions/xep-0399.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0400 | [Multi-Factor Authentication with TOTP](https://xmpp.org/extensions/xep-0400.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0403 | [Mediated Information eXchange (MIX): Presence Support.](https://xmpp.org/extensions/xep-0403.html) | Defer | 6.48 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0404 | [Mediated Information eXchange (MIX): JID Hidden Channels.](https://xmpp.org/extensions/xep-0404.html) | Defer | 5.70 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0406 | [Mediated Information eXchange (MIX): MIX Administration](https://xmpp.org/extensions/xep-0406.html) | Defer | 6.61 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0407 | [Mediated Information eXchange (MIX): Miscellaneous Capabilities](https://xmpp.org/extensions/xep-0407.html) | Defer | 6.61 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0408 | [Mediated Information eXchange (MIX): Co-existence with MUC](https://xmpp.org/extensions/xep-0408.html) | Defer | 4.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0409 | [IM Routing-NG](https://xmpp.org/extensions/xep-0409.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0414 | [Cryptographic Hash Function Recommendations for XMPP](https://xmpp.org/extensions/xep-0414.html) | Defer | 4.60 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0415 | [XMPP Over RELOAD (XOR)](https://xmpp.org/extensions/xep-0415.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0416 | [E2E Authentication in XMPP](https://xmpp.org/extensions/xep-0416.html) | Defer | 4.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0417 | [E2E Authentication in XMPP: Certificate Issuance and Revocation](https://xmpp.org/extensions/xep-0417.html) | Defer | 5.30 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0418 | [DNS Queries over XMPP (DoX)](https://xmpp.org/extensions/xep-0418.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0422 | [Message Fastening](https://xmpp.org/extensions/xep-0422.html) | Defer | 6.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0427 | [MAM Fastening Collation](https://xmpp.org/extensions/xep-0427.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0430 | [Inbox](https://xmpp.org/extensions/xep-0430.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0431 | [Full Text Search in MAM](https://xmpp.org/extensions/xep-0431.html) | Avoid | 3.48 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0432 | [Simple JSON Messaging](https://xmpp.org/extensions/xep-0432.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0433 | [Extended Channel Search](https://xmpp.org/extensions/xep-0433.html) | Defer | 4.80 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0435 | [Reminders](https://xmpp.org/extensions/xep-0435.html) | Avoid | 1.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0436 | [MUC presence versioning](https://xmpp.org/extensions/xep-0436.html) | Avoid | 3.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0437 | [Room Activity Indicators](https://xmpp.org/extensions/xep-0437.html) | Avoid | 3.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0439 | [Quick Response](https://xmpp.org/extensions/xep-0439.html) | Avoid | 2.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |

## Deprecated (15)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0013 | [Flexible Offline Message Retrieval](https://xmpp.org/extensions/xep-0013.html) | Defer | 6.26 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0016 | [Privacy Lists](https://xmpp.org/extensions/xep-0016.html) | Defer | 5.35 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0020 | [Feature Negotiation](https://xmpp.org/extensions/xep-0020.html) | Avoid | 3.93 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| 🚧 XEP-0048 | [Bookmarks](https://xmpp.org/extensions/xep-0048.html) | Implement | 6.45 | Partial | Not provided by source CSV; inspect XEP page for superseding guidance. |
| 🚧 XEP-0071 | [XHTML-IM](https://xmpp.org/extensions/xep-0071.html) | Implement | 5.35 | Partial | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0086 | [Error Condition Mappings](https://xmpp.org/extensions/xep-0086.html) | Defer | 4.65 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0093 | [Roster Item Exchange](https://xmpp.org/extensions/xep-0093.html) | Avoid | 2.05 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0095 | [Stream Initiation](https://xmpp.org/extensions/xep-0095.html) | Avoid | 2.36 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0096 | [SI File Transfer](https://xmpp.org/extensions/xep-0096.html) | Avoid | 3.65 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0126 | [Invisibility](https://xmpp.org/extensions/xep-0126.html) | Avoid | 3.97 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0130 | [Waiting Lists](https://xmpp.org/extensions/xep-0130.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0136 | [Message Archiving](https://xmpp.org/extensions/xep-0136.html) | Defer | 5.45 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0137 | [Publishing Stream Initiation Requests](https://xmpp.org/extensions/xep-0137.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0256 | [Last Activity in Presence](https://xmpp.org/extensions/xep-0256.html) | Defer | 5.45 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0411 | [Bookmarks Conversion](https://xmpp.org/extensions/xep-0411.html) | Defer | 6.45 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |

## Obsolete (40)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0003 | [Proxy Accept Socket Service (PASS)](https://xmpp.org/extensions/xep-0003.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0005 | [Jabber Interest Groups](https://xmpp.org/extensions/xep-0005.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0006 | [Profiles](https://xmpp.org/extensions/xep-0006.html) | Avoid | 0.90 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0007 | [Conferencing SIG](https://xmpp.org/extensions/xep-0007.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0008 | [IQ-Based Avatars](https://xmpp.org/extensions/xep-0008.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0010 | [Whiteboarding SIG](https://xmpp.org/extensions/xep-0010.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0011 | [Jabber Browsing](https://xmpp.org/extensions/xep-0011.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0022 | [Message Events](https://xmpp.org/extensions/xep-0022.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0023 | [Message Expiration](https://xmpp.org/extensions/xep-0023.html) | Avoid | 0.65 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0025 | [Jabber HTTP Polling](https://xmpp.org/extensions/xep-0025.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0027 | [Current Jabber OpenPGP Usage](https://xmpp.org/extensions/xep-0027.html) | Avoid | 0.55 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0038 | [Icon Styles](https://xmpp.org/extensions/xep-0038.html) | Avoid | 0.95 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0051 | [Connection Transfer](https://xmpp.org/extensions/xep-0051.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0073 | [Basic IM Protocol Suite](https://xmpp.org/extensions/xep-0073.html) | Avoid | 1.95 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0078 | [Non-SASL Authentication](https://xmpp.org/extensions/xep-0078.html) | Avoid | 5.35 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0090 | [Legacy Entity Time](https://xmpp.org/extensions/xep-0090.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0091 | [Legacy Delayed Delivery](https://xmpp.org/extensions/xep-0091.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0094 | [Agent Information](https://xmpp.org/extensions/xep-0094.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0112 | [User Physical Location](https://xmpp.org/extensions/xep-0112.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0117 | [Intermediate IM Protocol Suite](https://xmpp.org/extensions/xep-0117.html) | Avoid | 1.85 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0138 | [Stream Compression](https://xmpp.org/extensions/xep-0138.html) | Avoid | 2.95 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0146 | [Remote Controlling Clients](https://xmpp.org/extensions/xep-0146.html) | Avoid | 1.25 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0190 | [Best Practice for Closing Idle Streams](https://xmpp.org/extensions/xep-0190.html) | Avoid | 0.83 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0192 | [Proposed Stream Feature Improvements](https://xmpp.org/extensions/xep-0192.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0193 | [Proposed Resource Binding Improvements](https://xmpp.org/extensions/xep-0193.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0211 | [XMPP Basic Client 2008](https://xmpp.org/extensions/xep-0211.html) | Avoid | 0.95 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0212 | [XMPP Basic Server 2008](https://xmpp.org/extensions/xep-0212.html) | Avoid | 2.85 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0213 | [XMPP Intermediate IM Client 2008](https://xmpp.org/extensions/xep-0213.html) | Avoid | 2.85 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0216 | [XMPP Intermediate IM Server 2008](https://xmpp.org/extensions/xep-0216.html) | Avoid | 2.75 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0229 | [Stream Compression with LZW](https://xmpp.org/extensions/xep-0229.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0237 | [Roster Versioning](https://xmpp.org/extensions/xep-0237.html) | Avoid | 4.05 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0242 | [XMPP Client Compliance 2009](https://xmpp.org/extensions/xep-0242.html) | Avoid | 0.95 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0243 | [XMPP Server Compliance 2009](https://xmpp.org/extensions/xep-0243.html) | Avoid | 0.85 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0270 | [XMPP Compliance Suites 2010](https://xmpp.org/extensions/xep-0270.html) | Avoid | 0.95 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0302 | [XMPP Compliance Suites 2012](https://xmpp.org/extensions/xep-0302.html) | Avoid | 2.27 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0387 | [XMPP Compliance Suites 2018](https://xmpp.org/extensions/xep-0387.html) | Avoid | 1.53 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0412 | [XMPP Compliance Suites 2019](https://xmpp.org/extensions/xep-0412.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0423 | [XMPP Compliance Suites 2020](https://xmpp.org/extensions/xep-0423.html) | Avoid | 1.95 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0443 | [XMPP Compliance Suites 2021](https://xmpp.org/extensions/xep-0443.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0459 | [XMPP Compliance Suites 2022](https://xmpp.org/extensions/xep-0459.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |

## Rejected (6)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0014 | [Message Tone](https://xmpp.org/extensions/xep-0014.html) | Avoid | 1.05 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0015 | [Account Transfer](https://xmpp.org/extensions/xep-0015.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0017 | [Naive Packet Framing Protocol](https://xmpp.org/extensions/xep-0017.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0018 | [Invisible Presence](https://xmpp.org/extensions/xep-0018.html) | Avoid | 1.35 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0037 | [DSPS - Data Stream Proxy Service](https://xmpp.org/extensions/xep-0037.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0360 | [Nonzas (are not Stanzas)](https://xmpp.org/extensions/xep-0360.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |

## Retracted (37)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| XEP-0021 | [Jabber Event Notification Service (ENS)](https://xmpp.org/extensions/xep-0021.html) | Avoid | 1.35 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0024 | [Publish/Subscribe](https://xmpp.org/extensions/xep-0024.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0026 | [Internationalization (I18N)](https://xmpp.org/extensions/xep-0026.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0028 | [No Such XEP](https://xmpp.org/extensions/xep-0028.html) | Avoid | 0.25 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0029 | [Definition of Jabber Identifiers (JIDs)](https://xmpp.org/extensions/xep-0029.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0032 | [Jabber URI Scheme](https://xmpp.org/extensions/xep-0032.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0034 | [SASL Integration](https://xmpp.org/extensions/xep-0034.html) | Avoid | 2.35 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0035 | [SSL/TLS Integration](https://xmpp.org/extensions/xep-0035.html) | Avoid | 2.35 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0036 | [Pub-Sub Subscriptions](https://xmpp.org/extensions/xep-0036.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0040 | [Jabber Robust Publish-Subscribe](https://xmpp.org/extensions/xep-0040.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0041 | [Reliable Entity Link](https://xmpp.org/extensions/xep-0041.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0042 | [Jabber OOB Broadcast Service (JOBS)](https://xmpp.org/extensions/xep-0042.html) | Avoid | 1.05 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0043 | [Jabber Database Access](https://xmpp.org/extensions/xep-0043.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0046 | [DTCP](https://xmpp.org/extensions/xep-0046.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0052 | [File Transfer](https://xmpp.org/extensions/xep-0052.html) | Avoid | 1.05 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0057 | [Extended Roster](https://xmpp.org/extensions/xep-0057.html) | Avoid | 1.05 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0074 | [Simple Access Control](https://xmpp.org/extensions/xep-0074.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0081 | [Jabber MIME Type](https://xmpp.org/extensions/xep-0081.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0087 | [Stream Initiation](https://xmpp.org/extensions/xep-0087.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0111 | [A Transport for Initiating and Negotiating Sessions (TINS)](https://xmpp.org/extensions/xep-0111.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0119 | [Extended Presence Protocol Suite](https://xmpp.org/extensions/xep-0119.html) | Avoid | 1.05 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0120 | [Infobits](https://xmpp.org/extensions/xep-0120.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0121 | [Dublin Core Infobits Mapping](https://xmpp.org/extensions/xep-0121.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0123 | [Entity Metadata](https://xmpp.org/extensions/xep-0123.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0125 | [vCard Infobits Mapping](https://xmpp.org/extensions/xep-0125.html) | Avoid | 0.25 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0139 | [Security SIG](https://xmpp.org/extensions/xep-0139.html) | Avoid | 1.20 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0140 | [Shared Groups](https://xmpp.org/extensions/xep-0140.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0180 | [Jingle Video via RTP](https://xmpp.org/extensions/xep-0180.html) | Avoid | 1.85 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0208 | [Bootstrapping Implementation of Jingle](https://xmpp.org/extensions/xep-0208.html) | Avoid | 1.15 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0219 | [Hop Check](https://xmpp.org/extensions/xep-0219.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0236 | [Abuse Reporting](https://xmpp.org/extensions/xep-0236.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0281 | [DMUC1: Distributed Multi-User Chat](https://xmpp.org/extensions/xep-0281.html) | Avoid | 1.05 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0323 | [Internet of Things - Sensor Data](https://xmpp.org/extensions/xep-0323.html) | Avoid | 0.95 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0324 | [Internet of Things - Provisioning](https://xmpp.org/extensions/xep-0324.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0325 | [Internet of Things - Control](https://xmpp.org/extensions/xep-0325.html) | Avoid | 0.95 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0326 | [Internet of Things - Concentrators](https://xmpp.org/extensions/xep-0326.html) | Avoid | 0.00 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |
| XEP-0375 | [XMPP Compliance Suites 2016](https://xmpp.org/extensions/xep-0375.html) | Avoid | 1.53 | Unsupported | Not provided by source CSV; inspect XEP page for superseding guidance. |

## ProtoXEP (183)

| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |
|---|---|---|---|---|---|
| ProtoXEP-0 | [XMPP Transport Layer Security](https://xmpp.org/extensions/inbox/xtls.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-1 | [Jingle In-Band Bytestreams Transport](https://xmpp.org/extensions/inbox/jingle-ibb.html) | Avoid | 0.00 | Unsupported | - |
| ProtoXEP-10 | [Instant Gaming](https://xmpp.org/extensions/inbox/instant-gaming.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-100 | [Inbox](https://xmpp.org/extensions/inbox/inbox.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-101 | [Special Interests Group End to End Encryption](https://xmpp.org/extensions/inbox/sige2ee.html) | Avoid | 2.00 | Unsupported | - |
| ProtoXEP-102 | [Fallback Indication](https://xmpp.org/extensions/inbox/fallback.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-103 | [Full Text Search in MAM](https://xmpp.org/extensions/inbox/fulltext.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-104 | [Implicit XMPP WebSocket Endpoints](https://xmpp.org/extensions/inbox/xep-iwe.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-105 | [Simple JSON Messaging](https://xmpp.org/extensions/inbox/udt.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-106 | [Trust Messages](https://xmpp.org/extensions/inbox/trust-messages.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-107 | [Reminders](https://xmpp.org/extensions/inbox/reminders.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-108 | [Extended Channel Search](https://xmpp.org/extensions/inbox/extended-channel-search.html) | Avoid | 1.65 | Unsupported | - |
| ProtoXEP-109 | [MUC presence versioning](https://xmpp.org/extensions/inbox/muc-presence-versioning.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-11 | [Tic-tac-toe](https://xmpp.org/extensions/inbox/tictactoe.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-110 | [Room Activity Indicators](https://xmpp.org/extensions/inbox/room-activity-indicators.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-111 | [Best practices for password hashing and storage](https://xmpp.org/extensions/inbox/password-storage.html) | Avoid | 0.05 | Unsupported | - |
| ProtoXEP-112 | [Quick Response](https://xmpp.org/extensions/inbox/quick-response.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-113 | [Channel Binding Pseudomechanisms](https://xmpp.org/extensions/inbox/cb-pseudomechanisms.html) | Avoid | 1.65 | Unsupported | - |
| ProtoXEP-114 | [Bookmark Pinning](https://xmpp.org/extensions/inbox/bookmark-pinning.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-115 | [SASL Channel-Binding Type Capability](https://xmpp.org/extensions/inbox/xep-sasl-cb-types.html) | Avoid | 4.05 | Unsupported | - |
| ProtoXEP-116 | [XMPP Compliance Suites 2021](https://xmpp.org/extensions/inbox/cs-2021.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-117 | [Pre-Authenticated In-Band Registration](https://xmpp.org/extensions/inbox/ibr-token.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-118 | [File metadata element](https://xmpp.org/extensions/inbox/file-metadata.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-119 | [Stickers](https://xmpp.org/extensions/inbox/stickers.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-12 | [Out-of-Band Stream Data](https://xmpp.org/extensions/inbox/outofband.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-120 | [Automatic Trust Management (ATM)](https://xmpp.org/extensions/inbox/automatic-trust-management.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-121 | [Stateless file sharing](https://xmpp.org/extensions/inbox/sfs.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-122 | [Encryption for stateless file sharing](https://xmpp.org/extensions/inbox/esfs.html) | Avoid | 4.25 | Unsupported | - |
| ProtoXEP-123 | [Stanza Multiplexing](https://xmpp.org/extensions/inbox/mux.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-124 | [MUC Mention Notifications](https://xmpp.org/extensions/inbox/muc-mention-notifications.html) | Avoid | 3.25 | Unsupported | - |
| ProtoXEP-125 | [DOAP usage in XMPP](https://xmpp.org/extensions/inbox/doap-usage-in-xmpp.html) | Avoid | 0.05 | Unsupported | - |
| ProtoXEP-126 | [OMEMO Media sharing](https://xmpp.org/extensions/inbox/omemo-media-sharing.html) | Avoid | 3.75 | Unsupported | - |
| ProtoXEP-127 | [Service Outage Status](https://xmpp.org/extensions/inbox/service-outage-status.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-128 | [XMPP Compliance Suites 2022](https://xmpp.org/extensions/inbox/cs-2022.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-129 | [Content Rating Labels](https://xmpp.org/extensions/inbox/content-ratings.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-13 | [Codecs for Jingle RTP Sessions](https://xmpp.org/extensions/inbox/jingle-rtp-codecs.html) | Avoid | 1.95 | Unsupported | - |
| ProtoXEP-130 | [Moved 2.0](https://xmpp.org/extensions/inbox/moved2.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-131 | [Pre-auth Registration Key Generation and Validation](https://xmpp.org/extensions/inbox/preauth-ibr.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-132 | [Pubsub Caching Hints](https://xmpp.org/extensions/inbox/pubsub-caching-hints.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-133 | [Disco Feature Attachment](https://xmpp.org/extensions/inbox/disco-feature-attachment.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-134 | [PubSub Namespaces](https://xmpp.org/extensions/inbox/pubsub-ns.html) | Avoid | 1.65 | Unsupported | - |
| ProtoXEP-135 | [Compatibility Fallbacks](https://xmpp.org/extensions/inbox/compatibility-fallback.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-136 | [Call Invites](https://xmpp.org/extensions/inbox/call-invites.html) | Avoid | 2.65 | Unsupported | - |
| ProtoXEP-137 | [Message Replies](https://xmpp.org/extensions/inbox/replies.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-138 | [PubSub Type Filtering](https://xmpp.org/extensions/inbox/pubsub-filter.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-139 | [MUC Affiliations Versioning](https://xmpp.org/extensions/inbox/muc-affiliations-versioning.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-14 | [Stanza Forwarding](https://xmpp.org/extensions/inbox/forwarding-delivery.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-140 | [Pubsub Public Subscriptions](https://xmpp.org/extensions/inbox/pubsub-public-subscriptions.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-141 | [Ephemeral Messages](https://xmpp.org/extensions/inbox/ephemeral-messages-v2.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-142 | [XMPP over QUIC](https://xmpp.org/extensions/inbox/xmpp-over-quic.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-143 | [WebSocket S2S](https://xmpp.org/extensions/inbox/websocket-s2s.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-144 | [Pubsub Attachments](https://xmpp.org/extensions/inbox/pubsub-attachments.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-145 | [Events](https://xmpp.org/extensions/inbox/events.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-146 | [PubSub Social Feed](https://xmpp.org/extensions/inbox/pubsub-social-feed.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-147 | [SASL SCRAM Downgrade Protection](https://xmpp.org/extensions/inbox/xep-downgrade-prevention.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-148 | [OpenPGP for XMPP Pubsub](https://xmpp.org/extensions/inbox/pubsub-encryption.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-149 | [Fast Authentication Streamlining Tokens](https://xmpp.org/extensions/inbox/xep-fast.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-15 | [Problem Reporting](https://xmpp.org/extensions/inbox/problem-reporting.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-150 | [Stream Limits Advertisement](https://xmpp.org/extensions/inbox/xep-sla.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-151 | [Pubsub Signing](https://xmpp.org/extensions/inbox/pubsub-signing.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-152 | [Pubsub Signing: OpenPGP Profile](https://xmpp.org/extensions/inbox/pubsub-signing-openpgp.html) | Avoid | 2.85 | Unsupported | - |
| ProtoXEP-153 | [Pubsub Targeted Encryption](https://xmpp.org/extensions/inbox/pubsub-targeted-encryption.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-154 | [SASL Upgrade Tasks](https://xmpp.org/extensions/inbox/xep-scram-upgrade.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-155 | [XMPP Compliance Suites 2023](https://xmpp.org/extensions/inbox/cs-2023.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-156 | [MUC Avatars](https://xmpp.org/extensions/inbox/muc-avatars.html) | Avoid | 0.45 | Unsupported | - |
| ProtoXEP-157 | [Communicate & Ask to AI](https://xmpp.org/extensions/inbox/xep-ai.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-158 | [Reporting Account Affiliations](https://xmpp.org/extensions/inbox/xep-reporting-account-affiliations.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-159 | [MUC Token Invite](https://xmpp.org/extensions/inbox/muc-token-invite.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-16 | [Multi-User Gaming](https://xmpp.org/extensions/inbox/multi-user_gaming.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-160 | [HTTP Online Meetings](https://xmpp.org/extensions/inbox/xep-http_online_meetings.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-161 | [Host Meta 2 - One Method To Rule Them All](https://xmpp.org/extensions/inbox/host-meta-2.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-162 | [PubSub Server Information](https://xmpp.org/extensions/inbox/pubsub-server-info.html) | Avoid | 1.65 | Unsupported | - |
| ProtoXEP-163 | [Chat notification settings](https://xmpp.org/extensions/inbox/notification-filter.html) | Avoid | 3.25 | Unsupported | - |
| ProtoXEP-164 | [MUC Slow Mode](https://xmpp.org/extensions/inbox/xep-slow-mode.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-17 | [Incident Reporting](https://xmpp.org/extensions/inbox/incident-reporting.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-18 | [Server Rosters](https://xmpp.org/extensions/inbox/server-rosters.html) | Avoid | 2.75 | Unsupported | - |
| ProtoXEP-19 | [Shared BOSH](https://xmpp.org/extensions/inbox/shared-bosh.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-2 | [Calendaring Extensions to Publish-Subscribe](https://xmpp.org/extensions/inbox/calendaring.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-20 | [Muji](https://xmpp.org/extensions/inbox/muji.html) | Avoid | 0.00 | Unsupported | - |
| ProtoXEP-21 | [Domain Name Assertions](https://xmpp.org/extensions/inbox/dna.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-22 | [Stanza Interception and Filtering Technology](https://xmpp.org/extensions/inbox/sift.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-23 | [Design Considerations for Digital Signatures in XMPP](https://xmpp.org/extensions/inbox/dsig-design.html) | Avoid | 0.05 | Unsupported | - |
| ProtoXEP-24 | [Linked Process Protocol](https://xmpp.org/extensions/inbox/lop.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-25 | [Jingle Relay Nodes](https://xmpp.org/extensions/inbox/jingle-nodes.html) | Avoid | 2.65 | Unsupported | - |
| ProtoXEP-26 | [Entity Reputation](https://xmpp.org/extensions/inbox/reputation.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-27 | [Presence Decloaking](https://xmpp.org/extensions/inbox/decloak.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-28 | [Distributed Multi-User Chat](https://xmpp.org/extensions/inbox/distributedmuc.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-29 | [Message Carbons](https://xmpp.org/extensions/inbox/carbons.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-3 | [Jingle SOCKS5 Bytestreams Transport Method](https://xmpp.org/extensions/inbox/jingle-s5b.html) | Avoid | 0.00 | Unsupported | - |
| ProtoXEP-30 | [Digital Signatures in XMPP](https://xmpp.org/extensions/inbox/dsig.html) | Avoid | 0.00 | Unsupported | - |
| ProtoXEP-31 | [JSON Content Type support](https://xmpp.org/extensions/inbox/json.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-32 | [Federated MUC for constrained environments](https://xmpp.org/extensions/inbox/fmuc.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-33 | [Shared XML Editing](https://xmpp.org/extensions/inbox/sxe.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-34 | [Moved](https://xmpp.org/extensions/inbox/moved.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-35 | [XMPP on Mobile Devices](https://xmpp.org/extensions/inbox/mobile.html) | Avoid | 1.45 | Unsupported | - |
| ProtoXEP-36 | [Spim Markers and Reports](https://xmpp.org/extensions/inbox/spim.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-37 | [Bidirectional Server-to-Server Connections](https://xmpp.org/extensions/inbox/bidi.html) | Avoid | 1.65 | Unsupported | - |
| ProtoXEP-38 | [DMUC3: Distributed MUC](https://xmpp.org/extensions/inbox/dmuc3.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-39 | [Sensor-Over-XMPP](https://xmpp.org/extensions/inbox/sensors.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-4 | [XMPP Transport Layer Security](https://xmpp.org/extensions/inbox/jingle-xtls.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-40 | [Account Management](https://xmpp.org/extensions/inbox/account-management.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-41 | [File Transfer Metadata](https://xmpp.org/extensions/inbox/ft-metadata.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-42 | [The 'xmpp.pubsub' URI Scheme](https://xmpp.org/extensions/inbox/pubsub-uri.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-43 | [PubSub Since](https://xmpp.org/extensions/inbox/pubsub-since.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-44 | [Multi-User Chat Administration](https://xmpp.org/extensions/inbox/muc-admin.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-45 | [Jingle SDP Content](https://xmpp.org/extensions/inbox/jingle-sdp.html) | Avoid | 2.65 | Unsupported | - |
| ProtoXEP-46 | [User Time Zone](https://xmpp.org/extensions/inbox/peptzo.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-47 | [SIP/SDP Over XMPP (SoX)](https://xmpp.org/extensions/inbox/sox.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-48 | [Two-factor user authentication with a shared secret](https://xmpp.org/extensions/inbox/user-auth.html) | Avoid | 2.00 | Unsupported | - |
| ProtoXEP-49 | [Buddycloud Channels](https://xmpp.org/extensions/inbox/buddycloud-channels.html) | Avoid | 1.65 | Unsupported | - |
| ProtoXEP-5 | [Use of ZRTP in Jingle RTP Sessions](https://xmpp.org/extensions/inbox/jingle-zrtp.html) | Avoid | 2.65 | Unsupported | - |
| ProtoXEP-50 | [Recipient Server Side Notifications Filtering](https://xmpp.org/extensions/inbox/rsf.html) | Avoid | 3.05 | Unsupported | - |
| ProtoXEP-51 | [Internet of Things - Events](https://xmpp.org/extensions/inbox/iot-events.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-52 | [Client State Indication](https://xmpp.org/extensions/inbox/client-state-notification.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-53 | [Customizable Message Routing](https://xmpp.org/extensions/inbox/cmr.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-54 | [S2S Components](https://xmpp.org/extensions/inbox/s2s-components.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-56 | [REST with XMPP](https://xmpp.org/extensions/inbox/rest.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-57 | [OMEMO Encrypted Jingle File Transfer](https://xmpp.org/extensions/inbox/omemo-filetransfer.html) | Avoid | 6.15 | Unsupported | - |
| ProtoXEP-58 | [Mediated Information eXchange (MIX)](https://xmpp.org/extensions/inbox/mix.html) | Avoid | 2.65 | Unsupported | - |
| ProtoXEP-59 | [Multi-User Chat Light](https://xmpp.org/extensions/inbox/muc-light.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-6 | [Mandatory-to-Implement Technologies for Jingle RTP Sessions](https://xmpp.org/extensions/inbox/jingle-rtp-mti.html) | Avoid | 2.65 | Unsupported | - |
| ProtoXEP-60 | [Quality of Service](https://xmpp.org/extensions/inbox/qos.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-61 | [Notification Inbox](https://xmpp.org/extensions/inbox/notification-inbox.html) | Avoid | 2.15 | Unsupported | - |
| ProtoXEP-62 | [Content Types in Messages](https://xmpp.org/extensions/inbox/content-types.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-63 | [JID Mention](https://xmpp.org/extensions/inbox/jid-mention.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-64 | [Multi-stage IBR](https://xmpp.org/extensions/inbox/multistage-ibr.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-647 | [Message Displayed Synchronization](https://xmpp.org/extensions/inbox/xep-mds.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-648 | [Jingle Remote Control](https://xmpp.org/extensions/inbox/remote-control.html) | Avoid | 2.65 | Unsupported | - |
| ProtoXEP-649 | [WebXDC](https://xmpp.org/extensions/inbox/webxdc.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-65 | [Token-based reconnection](https://xmpp.org/extensions/inbox/token-reconnection.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-655 | [Jingle Audio/Video Conferences](https://xmpp.org/extensions/inbox/av_conferences.html) | Avoid | 2.65 | Unsupported | - |
| ProtoXEP-656 | [OAuth Client Login](https://xmpp.org/extensions/inbox/xep-oauth-client-login.html) | Avoid | 2.45 | Unsupported | - |
| ProtoXEP-657 | [Client Access Management](https://xmpp.org/extensions/inbox/xep-client-access-management.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-658 | [Happy Eyeballs](https://xmpp.org/extensions/inbox/xep-happy-eyeballs.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-659 | [Pubsub Node Relationships](https://xmpp.org/extensions/inbox/pubsub-node-relationships.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-66 | [Instant Stream Resumption](https://xmpp.org/extensions/inbox/isr.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-660 | [Pubsub Extended Subscriptions](https://xmpp.org/extensions/inbox/pubsub-extended-subscription.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-666 | [Pubsub Extended Discovery](https://xmpp.org/extensions/inbox/pubsub-extended-discovery.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-668 | [Pubsub File Sharing](https://xmpp.org/extensions/inbox/pubsub-file-sharing.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-67 | [User Rating](https://xmpp.org/extensions/inbox/userrating.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-672 | [MUC Activity Indicator](https://xmpp.org/extensions/inbox/muc-activity.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-673 | [Pubsub Stories](https://xmpp.org/extensions/inbox/stories.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-677 | [GRE Encrypter: OpenPGP](https://xmpp.org/extensions/inbox/gre-encrypter-openpgp.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-678 | [Gateway Relayed Encryption](https://xmpp.org/extensions/inbox/gateway-relayed-encryption.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-679 | [GRE Formatter: MIME](https://xmpp.org/extensions/inbox/gre-formatter-mime.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-68 | [Extensible SASL Profile](https://xmpp.org/extensions/inbox/sasl2.html) | Avoid | 5.25 | Unsupported | - |
| ProtoXEP-681 | [Server-side spaces](https://xmpp.org/extensions/inbox/spaces.html) | Avoid | 1.65 | Unsupported | - |
| ProtoXEP-684 | [Data Policy](https://xmpp.org/extensions/inbox/data_policy.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-685 | [Data Forms File Input Element](https://xmpp.org/extensions/inbox/data-form-file-element.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-69 | [Atomically Compare-And-Publish PubSub Items](https://xmpp.org/extensions/inbox/cap.html) | Avoid | 2.65 | Unsupported | - |
| ProtoXEP-7 | [Server IP Check](https://xmpp.org/extensions/inbox/sic.html) | Avoid | 1.65 | Unsupported | - |
| ProtoXEP-70 | [Body Markup Hints](https://xmpp.org/extensions/inbox/bmh.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-71 | [Instant Stream Resumption](https://xmpp.org/extensions/inbox/isr-sasl2.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-72 | [User Avatar to vCard-Based Avatars Conversion](https://xmpp.org/extensions/inbox/pep-vcard-conversion.html) | Avoid | 1.75 | Unsupported | - |
| ProtoXEP-73 | [Client Key Support](https://xmpp.org/extensions/inbox/client-key.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-74 | [Multi-Factor Authentication with TOTP](https://xmpp.org/extensions/inbox/totp-2fa.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-75 | [IM Routing-NG](https://xmpp.org/extensions/inbox/im-ng.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-76 | [XMPP Connections across HTTPS (HACX)](https://xmpp.org/extensions/inbox/hacx.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-77 | [Terms of Services](https://xmpp.org/extensions/inbox/tos.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-78 | [Best practices for GDPR compliant deployment of XMPP](https://xmpp.org/extensions/inbox/gdpr.html) | Avoid | 0.05 | Unsupported | - |
| ProtoXEP-79 | [MUC Self-Ping (Schrödinger's Chat)](https://xmpp.org/extensions/inbox/muc-selfping.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-8 | [File Transfer Thumbnails](https://xmpp.org/extensions/inbox/thumbs.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-80 | [File Sharing Notifications](https://xmpp.org/extensions/inbox/fsn.html) | Avoid | 3.25 | Unsupported | - |
| ProtoXEP-81 | [Bookmarks Conversion](https://xmpp.org/extensions/inbox/bookmarks-conversion.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-82 | [Simple Buttons](https://xmpp.org/extensions/inbox/buttons.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-83 | [XMPP Compliance Suites 2019](https://xmpp.org/extensions/inbox/cs-2019.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-84 | [XMPP Compliance Suites 2020](https://xmpp.org/extensions/inbox/cs-2020.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-85 | [Order-By](https://xmpp.org/extensions/inbox/order-by.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-86 | [Cryptographic Hash Function Recommendations for XMPP](https://xmpp.org/extensions/inbox/hash-recommendations.html) | Avoid | 2.45 | Unsupported | - |
| ProtoXEP-87 | [E2E Authentication in XMPP](https://xmpp.org/extensions/inbox/eax.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-88 | [E2E Authentication in XMPP: CA Requirements](https://xmpp.org/extensions/inbox/eax-car.html) | Avoid | 2.00 | Unsupported | - |
| ProtoXEP-89 | [XMPP Over RELOAD (XOR)](https://xmpp.org/extensions/inbox/xor.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-9 | [Server-based Tic-tac-toe](https://xmpp.org/extensions/inbox/tictactoe-mug.html) | Avoid | 1.65 | Unsupported | - |
| ProtoXEP-90 | [DNS Queries over XMPP (DoX)](https://xmpp.org/extensions/inbox/dox.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-91 | [E2E Authentication in XMPP: Certificate Issuance and Revocation](https://xmpp.org/extensions/inbox/eax-cir.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-92 | [Automatic Trust Transfer (ATT)](https://xmpp.org/extensions/inbox/automatic-trust-transfer.html) | Avoid | 0.75 | Unsupported | - |
| ProtoXEP-93 | [Improving Baseline Security in XMPP](https://xmpp.org/extensions/inbox/baseline-security.html) | Avoid | 1.40 | Unsupported | - |
| ProtoXEP-94 | [Stanza Content Encryption](https://xmpp.org/extensions/inbox/xep-sce.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-95 | [Anonymous unique occupant identifiers for MUCs](https://xmpp.org/extensions/inbox/occupant-id.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-96 | [Message Reactions](https://xmpp.org/extensions/inbox/reactions.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-97 | [Message Fastening](https://xmpp.org/extensions/inbox/fasten.html) | Avoid | 1.85 | Unsupported | - |
| ProtoXEP-98 | [Authorization Tokens](https://xmpp.org/extensions/inbox/auth-tokens.html) | Avoid | 3.15 | Unsupported | - |
| ProtoXEP-99 | [MAM Fastening Collation](https://xmpp.org/extensions/inbox/mamfc.html) | Avoid | 0.75 | Unsupported | - |

