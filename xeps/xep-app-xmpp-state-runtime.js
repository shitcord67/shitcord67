/*
 * App XMPP/relay config and runtime state extracted from app.js.
 * Loaded before app.js so top-level constants and mutable runtime bindings remain available.
 */

const STORAGE_KEY = "shitcord67-state-v1";
const SESSION_ACCOUNT_KEY = "shitcord67-session-account-id";
const SESSION_PERSIST_KEY = "shitcord67-session-persist";
const RELAY_STATUS_LABELS = {
  disconnected: "Disconnected",
  connecting: "Connecting",
  connected: "Connected",
  error: "Error"
};
const RELAY_TYPING_TTL_MS = 6500;
const RELAY_TYPING_THROTTLE_MS = 2200;
const XEP_APP_BOOTSTRAP = globalThis.SHITCORD67_XEP_APP_BOOTSTRAP || {};
const {
  XMPP_DEBUG_EVENT_LIMIT, XMPP_DEBUG_RAW_TRUNCATE, XMPP_HOST_META_TIMEOUT_MS, XMPP_LOCAL_AUTH_GATEWAY_URL,
  XMPP_ENABLE_BROWSER_HOST_META_FALLBACK, XMPP_PLAIN_ONLY_DOMAINS, XMPP_MAM_NAMESPACE, XMPP_PUBSUB_NAMESPACE,
  XMPP_BOOKMARKS_NAMESPACE, XMPP_BOOKMARKS_NOTIFY_FEATURE, XMPP_BOOKMARKS_LEGACY_NAMESPACE, XMPP_HTTP_UPLOAD_NAMESPACE,
  XMPP_HTTP_UPLOAD_LEGACY_NAMESPACE, XMPP_REACTIONS_NAMESPACE, XMPP_MESSAGE_RETRACT_NAMESPACE, XMPP_FASTEN_NAMESPACE,
  XMPP_CHAT_MARKERS_NAMESPACE, XMPP_CSI_NAMESPACE, XMPP_STREAM_MANAGEMENT_NAMESPACE, XMPP_CAPS_NAMESPACE, XMPP_IDLE_NAMESPACE, XMPP_JINGLE_NAMESPACE,
  XMPP_JINGLE_RTP_NAMESPACE, XMPP_JINGLE_GROUPING_NAMESPACE, XMPP_JINGLE_RTP_INFO_NAMESPACE, XMPP_JINGLE_ICE_UDP_NAMESPACE,
  XMPP_JINGLE_RTP_RTCP_MUX_NAMESPACE, XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE, XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE, XMPP_JINGLE_RTP_SSMA_NAMESPACE,
  XMPP_JINGLE_MESSAGE_INIT_NAMESPACE, XMPP_JINGLE_MESSAGE_INIT_NAMESPACE_V1, XMPP_JINGLE_MESSAGE_INIT_NAMESPACE_PREFIX,
  XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES, XMPP_CALL_INVITES_NAMESPACE, XMPP_CALL_INVITES_NAMESPACE_PREFIX, XMPP_JINGLE_AUDIO_NAMESPACE,
  XMPP_JINGLE_VIDEO_NAMESPACE, XMPP_SIMS_NAMESPACE, XMPP_FILE_METADATA_NAMESPACE, XMPP_BOB_NAMESPACE, XMPP_DIRECT_MUC_INVITE_NAMESPACE,
  XMPP_OCCUPANT_ID_NAMESPACE, XMPP_NS_GLOBAL, XEP_0503_SPACES_GLOBAL, xmppRegisterSpaceRecord, xmppListSpaceRecords,
  XMPP_EME_NAMESPACE, XMPP_OPENPGP_NAMESPACE, XMPP_OPENPGP_LEGACY_NAMESPACE, XMPP_OTR_PREFIX, XMPP_OMEMO_NAMESPACE,
  XMPP_OMEMO_NAMESPACE_V2, XMPP_OMEMO_NAMESPACES, XMPP_OMEMO_DEVICELIST_NODE, XMPP_OMEMO_DEVICELIST_NODE_V2,
  XMPP_OMEMO_BUNDLE_NODE_PREFIX, XMPP_OMEMO_BUNDLE_NODE_PREFIX_V2, XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE,
  XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2, XMPP_OMEMO_PREKEY_COUNT, XMPP_OMEMO_SIGNED_PREKEY_ID,
  XEP_0334_HINTS_GLOBAL, XEP_0085_CHATSTATES_GLOBAL, XMPP_HINTS_NAMESPACE, XEP_0184_0333_GLOBAL,
  XMPP_CHATSTATES_NAMESPACE, XMPP_RECEIPTS_NAMESPACE, XEP_0184_0333_MARKER_FLOW_GLOBAL, XEP_0249_DIRECT_MUC_INVITE_GLOBAL,
  XEP_0045_0402_ROSTER_BOOKMARKS_GLOBAL, XEP_0359_0424_MESSAGE_REF_UTILS_GLOBAL, XEP_0482_CALL_INVITE_PARSE_GLOBAL,
  XEP_0308_0424_0444_GLOBAL, XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL, XEP_0115_CAPS_PRESENCE_GLOBAL, XEP_0203_0319_DELAY_IDLE_GLOBAL,
  XEP_0421_0045_MUC_OCCUPANT_GLOBAL, XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL, XEP_0166_0167_JINGLE_IQ_PARSE_GLOBAL,
  XEP_0166_0167_JINGLE_SEND_GLOBAL, XEP_0320_WEBRTC_SDP_BASICS_GLOBAL, XEP_0066_0071_0231_MEDIA_GLOBAL,
  XEP_0461_0428_REPLIES_GLOBAL, XEP_0313_MAM_LOADING_GLOBAL, XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL,
  XEP_0030_0166_CALL_DISCO_GLOBAL, XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL, XEP_0199_0410_0313_PRESENCE_PING_GLOBAL,
  XEP_0198_STREAM_MANAGEMENT_GLOBAL,
  XEP_0048_0402_BOOKMARKS_OPS_GLOBAL, XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL, XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL,
  XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL, XEP_0280_0352_CSI_CARBONS_GLOBAL, XEP_0482_0503_SPACES_FLOW_GLOBAL,
  XEP_0153_PRESENCE_PHOTO_HASH_GLOBAL, XEP_0156_HOST_META_PARSE_GLOBAL, XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL,
  XEP_XMPP_COMMAND_RUNTIME_GLOBAL, XEP_DM_COMMAND_RUNTIME_GLOBAL, XEP_SLASH_COMMAND_RUNTIME_GLOBAL,
  XEP_XMPP_UI_BINDINGS_RUNTIME_GLOBAL, XMPP_XML_GLOBAL, XMPP_ENCRYPTION_PAYLOAD_GLOBAL
} = XEP_APP_BOOTSTRAP;
const CALL_ROOM_URL_UTILS_GLOBAL = globalThis.SHITCORD67_CALL_ROOM_URL_UTILS || {};
const WEB_CALL_INVITE_MAX_AGE_MS = 90_000;
const WEB_CALL_INVITE_TIMEOUT_MS = 35_000;
const WEB_CALL_INVITE_SEEN_MAX = 240;
const XMPP_CALL_DEFAULT_MEDIA = ["audio"];
const XMPP_HTTP_UPLOAD_DISCOVERY_TTL_MS = 8 * 60 * 1000;
const XMPP_HTTP_UPLOAD_SLOT_TIMEOUT_MS = 12000;
const XMPP_HTTP_UPLOAD_PUT_TIMEOUT_MS = 45000;
const XMPP_HTTP_UPLOAD_MAX_BYTES = 24 * 1024 * 1024;
const XMPP_MAM_PAGE_SIZE = 180;
const XMPP_MAM_PREFETCH_PAGES = 2;
const XMPP_MAM_LOADING_STALE_MS = 10000;
const XMPP_MAM_REQUEST_TIMEOUT_MS = 7000;
const XMPP_PING_INTERVAL_MS = 45000;
const XMPP_PING_TIMEOUT_MS = 12000;
const XMPP_SM_ACK_REQUEST_INTERVAL_MS = 15000;
const XMPP_MUC_SELF_PING_INTERVAL_MS = 75_000;
const XMPP_MUC_SELF_PING_TIMEOUT_MS = 10_000;
const XMPP_MUC_SELF_PING_REJOIN_AFTER_FAILURES = 2;
const XMPP_MUC_SELF_PING_REJOIN_COOLDOWN_MS = 25_000;
const XMPP_ROOM_DISCOVERY_TTL_MS = 6 * 60 * 1000;
const XMPP_ROOM_DISCOVERY_MAX_ITEMS = 150;
const POPOUT_PRESENCE_REFRESH_MS = 30_000;
const MESSAGE_CHAR_LIMIT_MIN = 200;
const MESSAGE_CHAR_LIMIT_DEFAULT = 2000;
const MESSAGE_CHAR_LIMIT_MAX = 20000;
const MESSAGE_CHAR_LIMIT_TEMP_BUMP = 2000;
const MESSAGE_TEXT_STORAGE_MAX = 20000;
const MESSAGE_TEXT_TRANSPORT_MAX = 8000;
const PIP_RESIZE_EDGES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
const PIP_MIN_SIZE = {
  swf: { width: 280, height: 180 },
  video: { width: 260, height: 160 }
};
const GIF_PICKER_INITIAL_PAGE_SIZE = 140;
const GIF_PICKER_PAGE_STEP = 120;
const GIF_PICKER_VISIBLE_MAX = 20000;
const GIF_PICKER_REMOTE_MAX = 20000;
const STICKER_PICKER_INITIAL_PAGE_SIZE = 140;
const STICKER_PICKER_PAGE_STEP = 120;
const STICKER_PICKER_VISIBLE_MAX = 20000;
const STICKER_PICKER_REMOTE_MAX = 12000;
const EMOJI_PICKER_INITIAL_PAGE_SIZE = 180;
const EMOJI_PICKER_PAGE_STEP = 180;
const TENOR_PUBLIC_API_KEY = "LIVDSRZULELA";
const TENOR_CLIENT_KEY = "shitcord67_web";
const TENOR_RESULTS_PAGE_SIZE = 36;
const TENOR_KEY_STORAGE_KEY = "shitcord67-tenor-api-key";
const TENOR_CLIENT_STORAGE_KEY = "shitcord67-tenor-client-key";
const EMOJI_DATASET_VERSION = "17.0.0";
const EMOJI_DATASET_CACHE_KEY = `shitcord67-emoji-dataset-v${EMOJI_DATASET_VERSION}`;
const EMOJI_DATASET_SOURCES = [
  `https://cdn.jsdelivr.net/npm/emojibase-data@${EMOJI_DATASET_VERSION}/en/compact.json`,
  `https://unpkg.com/emojibase-data@${EMOJI_DATASET_VERSION}/en/compact.json`,
  "https://unicode.org/Public/emoji/17.0/emoji-test.txt",
  "https://raw.githubusercontent.com/unicode-org/emoji/main/data/emoji-test.txt"
];
const SHITCORD_BRAND_EMOJI = "🫪";
const SHITCORD_EMOJI_FALLBACK_GLYPH = "\u{10FFFF}";
const XMPP_CAPS_NODE = "urn:shitcord67:caps";
const DM_HOME_TABS = ["friends", "library", "requests", "nitro", "shop", "quests"];
const UI_I18N = {
  en: {
    "dm.tab.friends": "Friends",
    "dm.tab.library": "Library",
    "dm.tab.requests": "Message Requests",
    "dm.tab.nitro": "Nitro",
    "dm.tab.shop": "Shop",
    "dm.tab.quests": "Quests",
    "dm.sidebar.directMessages": "Direct Messages",
    "dm.home.friends.title": "Friends",
    "dm.home.friends.subtitle": "See who is online and what they are currently doing.",
    "dm.home.library.title": "Library",
    "dm.home.library.subtitle": "Quick access to your saved media and custom packs.",
    "dm.home.library.stat.mediaItems": "custom media items",
    "dm.home.library.stat.savedSwfs": "saved SWFs",
    "dm.home.library.stat.gifFavorites": "GIF favorites",
    "dm.home.library.stat.gifGroups": "GIF groups",
    "dm.home.library.action.openPicker": "Open Media Picker",
    "dm.home.library.action.toggleShelf": "Toggle SWF Shelf",
    "dm.home.requests.title": "Message Requests",
    "dm.home.requests.subtitle": "Incoming and outgoing XMPP contact requests.",
    "dm.home.requests.stat.incoming": "incoming requests",
    "dm.home.requests.stat.outgoing": "outgoing requests",
    "dm.home.requests.bulk.noneIncoming": "No incoming requests to accept.",
    "dm.home.requests.bulk.noneOutgoing": "No outgoing requests to cancel.",
    "dm.home.requests.entry.unknown": "Unknown",
    "dm.home.nitro.title": "Nitro",
    "dm.home.nitro.subtitle": "Customize your profile and unlock cosmetic perks.",
    "dm.home.nitro.action.editProfile": "Edit Profile",
    "dm.home.nitro.action.openCosmetics": "Open Cosmetics",
    "dm.home.shop.title": "Shop",
    "dm.home.shop.subtitle": "Browse cosmetics and seasonal bundles.",
    "dm.home.shop.action.open": "Open Shop",
    "dm.home.quests.title": "Quests",
    "dm.home.quests.subtitle": "Track quest progress and earned badges.",
    "dm.home.quests.stat.badges": "quest badges",
    "dm.home.quests.placeholder.signIn": "Sign in to view quest progress.",
    "dm.search.placeholder": "Find or start DM",
    "dm.button.addFriend": "+ Add Friend",
    "dm.empty.none": "No direct messages yet.",
    "dm.empty.filtered": "No DMs or contact requests match your search.",
    "dm.requests.pendingOutgoing": "Pending outgoing requests: {count}",
    "dm.requests.none": "No message requests right now.",
    "dm.requests.incoming": "Incoming",
    "dm.requests.outgoing": "Outgoing",
    "dm.requests.filter.all": "All",
    "dm.requests.filter.incoming": "Incoming",
    "dm.requests.filter.outgoing": "Outgoing",
    "dm.requests.bulk.acceptAll": "Accept All",
    "dm.requests.bulk.declineAll": "Decline All",
    "dm.requests.bulk.cancelAll": "Cancel All",
    "common.accept": "Accept",
    "common.decline": "Decline",
    "common.cancel": "Cancel",
    "dm.home.nitro.placeholder": "Nitro-style perks are available through profile cosmetics and effects in this client.",
    "dm.home.shop.placeholder": "Browse and unlock decorations, effects, and seasonal bundles.",
    "dm.home.library.empty": "No DM friends yet. Use + Add Friend in the sidebar.",
    "settings.nav.title": "User Settings",
    "settings.tab.my-account": "My Account",
    "settings.tab.profiles": "Profiles",
    "settings.tab.notifications": "Notifications",
    "settings.tab.appearance": "Appearance",
    "settings.tab.privacy": "Privacy & Safety",
    "settings.tab.voice-video": "Voice & Video",
    "settings.tab.advanced": "Advanced",
    "settings.appearance.title": "Appearance",
    "settings.appearance.uiScale": "UI Scale",
    "settings.appearance.theme": "Theme",
    "settings.appearance.language": "Language",
    "settings.appearance.compactMembers": "Compact member list",
    "settings.appearance.save": "Save Appearance",
    "settings.theme.oled": "OLED",
    "settings.theme.discord": "Discord-like",
    "settings.theme.highContrast": "High Contrast",
    "settings.compact.off": "Off",
    "settings.compact.on": "On",
    "settings.language.auto": "Auto detect"
  },
  de: {
    "dm.tab.friends": "Freunde",
    "dm.tab.library": "Bibliothek",
    "dm.tab.requests": "Nachrichtenanfragen",
    "dm.tab.nitro": "Nitro",
    "dm.tab.shop": "Shop",
    "dm.tab.quests": "Quests",
    "dm.sidebar.directMessages": "Direktnachrichten",
    "dm.home.friends.title": "Freunde",
    "dm.home.friends.subtitle": "Sieh, wer online ist und was gerade gemacht wird.",
    "dm.home.library.title": "Bibliothek",
    "dm.home.library.subtitle": "Schneller Zugriff auf gespeicherte Medien und Packs.",
    "dm.home.library.stat.mediaItems": "benutzerdefinierte Medien",
    "dm.home.library.stat.savedSwfs": "gespeicherte SWFs",
    "dm.home.library.stat.gifFavorites": "GIF-Favoriten",
    "dm.home.library.stat.gifGroups": "GIF-Gruppen",
    "dm.home.library.action.openPicker": "Medienauswahl öffnen",
    "dm.home.library.action.toggleShelf": "SWF-Regal umschalten",
    "dm.home.requests.title": "Nachrichtenanfragen",
    "dm.home.requests.subtitle": "Eingehende und ausgehende XMPP-Kontaktanfragen.",
    "dm.home.requests.stat.incoming": "eingehende Anfragen",
    "dm.home.requests.stat.outgoing": "ausgehende Anfragen",
    "dm.home.requests.bulk.noneIncoming": "Keine eingehenden Anfragen zum Annehmen.",
    "dm.home.requests.bulk.noneOutgoing": "Keine ausgehenden Anfragen zum Abbrechen.",
    "dm.home.requests.entry.unknown": "Unbekannt",
    "dm.home.nitro.title": "Nitro",
    "dm.home.nitro.subtitle": "Profil anpassen und kosmetische Vorteile erhalten.",
    "dm.home.nitro.action.editProfile": "Profil bearbeiten",
    "dm.home.nitro.action.openCosmetics": "Kosmetik öffnen",
    "dm.home.shop.title": "Shop",
    "dm.home.shop.subtitle": "Kosmetika und saisonale Bundles durchsuchen.",
    "dm.home.shop.action.open": "Shop öffnen",
    "dm.home.quests.title": "Quests",
    "dm.home.quests.subtitle": "Quest-Fortschritt und Abzeichen verfolgen.",
    "dm.home.quests.stat.badges": "Quest-Abzeichen",
    "dm.home.quests.placeholder.signIn": "Zum Anzeigen des Quest-Fortschritts anmelden.",
    "dm.search.placeholder": "DM finden oder starten",
    "dm.button.addFriend": "+ Freund hinzufügen",
    "dm.empty.none": "Noch keine Direktnachrichten.",
    "dm.empty.filtered": "Keine DMs oder Kontaktanfragen passen zur Suche.",
    "dm.requests.pendingOutgoing": "Ausgehende Anfragen ausstehend: {count}",
    "dm.requests.none": "Aktuell keine Nachrichtenanfragen.",
    "dm.requests.incoming": "Eingehend",
    "dm.requests.outgoing": "Ausgehend",
    "dm.requests.filter.all": "Alle",
    "dm.requests.filter.incoming": "Eingehend",
    "dm.requests.filter.outgoing": "Ausgehend",
    "dm.requests.bulk.acceptAll": "Alle annehmen",
    "dm.requests.bulk.declineAll": "Alle ablehnen",
    "dm.requests.bulk.cancelAll": "Alle abbrechen",
    "common.accept": "Annehmen",
    "common.decline": "Ablehnen",
    "common.cancel": "Abbrechen",
    "dm.home.nitro.placeholder": "Nitro-ähnliche Vorteile gibt es hier über Profil-Kosmetik und Effekte.",
    "dm.home.shop.placeholder": "Durchsuche und entsperre Dekorationen, Effekte und saisonale Bundles.",
    "dm.home.library.empty": "Noch keine DM-Freunde. Nutze + Freund hinzufügen in der Seitenleiste.",
    "settings.nav.title": "Benutzereinstellungen",
    "settings.tab.my-account": "Mein Konto",
    "settings.tab.profiles": "Profile",
    "settings.tab.notifications": "Benachrichtigungen",
    "settings.tab.appearance": "Erscheinungsbild",
    "settings.tab.privacy": "Datenschutz & Sicherheit",
    "settings.tab.voice-video": "Sprache & Video",
    "settings.tab.advanced": "Erweitert",
    "settings.appearance.title": "Erscheinungsbild",
    "settings.appearance.uiScale": "UI-Skalierung",
    "settings.appearance.theme": "Design",
    "settings.appearance.language": "Sprache",
    "settings.appearance.compactMembers": "Kompakte Mitgliederliste",
    "settings.appearance.save": "Erscheinungsbild speichern",
    "settings.theme.oled": "OLED",
    "settings.theme.discord": "Discord-ähnlich",
    "settings.theme.highContrast": "Hoher Kontrast",
    "settings.compact.off": "Aus",
    "settings.compact.on": "An",
    "settings.language.auto": "Automatisch erkennen"
  }
};


const XMPP_PROVIDER_CATALOG = [
  {
    id: "xmpp_jp",
    name: "xmpp.jp",
    site: "https://xmpp.jp/",
    register: "https://xmpp.jp/",
    ws: "wss://api.xmpp.jp/ws",
    notes: "Public provider; verify current terms and anti-abuse limits before heavy usage."
  },
  {
    id: "disroot",
    name: "Disroot XMPP",
    site: "https://disroot.org/en/services/xmpp",
    register: "https://user.disroot.org/register",
    ws: "",
    notes: "Free account service with anti-abuse policy and moderation controls."
  },
  {
    id: "snikket",
    name: "Snikket Hosting",
    site: "https://snikket.org/",
    register: "https://snikket.org/hosting/",
    ws: "",
    notes: "Managed XMPP hosting for private groups and family-sized deployments."
  },
  {
    id: "discover_more",
    name: "Provider Discovery",
    site: "https://providers.xmpp.net/",
    register: "https://providers.xmpp.net/",
    ws: "",
    notes: "Compare providers and verify registration rules, limits, and policies."
  }
];
const DEFAULT_REACTIONS = ["👍", "❤️", "😂"];
const SLASH_COMMANDS = [
  { name: "help", args: "", description: "List available commands." },
  { name: "shortcuts", args: "", description: "Open keyboard shortcuts dialog." },
  { name: "devtools", args: "", description: "Toggle Electron DevTools." },
  { name: "logs", args: "[summary|dir|calls [session-prefix] [limit]]", description: "Inspect Electron runtime log directory and recent call-session summaries." },
  { name: "logdir", args: "", description: "Alias for /logs dir." },
  { name: "xmppconsole", args: "[all|here|dm [jid]|room [jid]|clear]", description: "Open XMPP inspector/log console (supports DM/room scoping)." },
  { name: "xmppinspect", args: "[all|here|dm [jid]|room [jid]|clear]", description: "Alias for /xmppconsole." },
  { name: "omemo", args: "[on|off|status|devices|refresh]", description: "Control OMEMO encryption for the active XMPP DM." },
  { name: "joinxmpp", args: "<room@conference.domain>", description: "Join an XMPP MUC room and map it into XMPP Spaces." },
  { name: "leavexmpp", args: "[room@conference.domain]", description: "Leave an XMPP MUC room and remove it from XMPP Spaces." },
  { name: "invitexmpp", args: "<room@conference.domain> [| reason [| password]]", description: "Send XMPP direct room invite to current DM peer." },
  { name: "spacesxmpp", args: "[list|open|sync|discover|join <room@conference.domain>|leave [room@conference.domain]]", description: "Manage mapped XMPP Spaces rooms and discovery." },
  { name: "relay", args: "[status|connect|disconnect|reconnect|mode <local|http|ws|xmpp|off>|url <http://...|ws://...>|room <name|clear>|roomsync|autoconnect <on|off|status>|ping]", description: "Control experimental realtime relay transport." },
  { name: "call", args: "[join|screen|link|copy] [room]", description: "Open/copy realtime AV call room for this conversation." },
  { name: "callweb", args: "[join|screen|link|copy] [room]", description: "Alias for web conference call flow." },
  { name: "callxmpp", args: "[start|screen|status|accept [id]|reject [id]|cancel [id]|ring [id]|transport [id]|end [id]]", description: "Native XMPP call controls and interop diagnostics." },
  { name: "callscreen", args: "[room]", description: "Open call room and start with screenshare intent." },
  { name: "whiteboard", args: "[open|copy|link|post|fallback] [room]", description: "Open/copy shared whiteboard room for this conversation." },
  { name: "spoiler", args: "<text>", description: "Send spoiler text (click to reveal)." },
  { name: "tableflip", args: "[text]", description: "Send a table-flip message." },
  { name: "unflip", args: "", description: "Send table reset emote." },
  { name: "lenny", args: "[text]", description: "Send a lenny face message." },
  { name: "roll", args: "[NdM]", description: "Roll dice, e.g. /roll 2d6." },
  { name: "timestamp", args: "[now|unix|date]", description: "Send a Discord-style timestamp token." },
  { name: "poll", args: "<question> | <option1> | <option2> [...]", description: "Create a quick poll." },
  { name: "pollm", args: "<question> | <option1> | <option2> [...]", description: "Create a multi-choice poll." },
  { name: "closepoll", args: "", description: "Close latest poll in this channel." },
  { name: "reopenpoll", args: "", description: "Reopen latest closed poll in this channel." },
  { name: "pollresults", args: "[voters]", description: "Show results for latest poll." },
  { name: "vote", args: "<option-number[,option-number...]>", description: "Vote in latest poll by option number." },
  { name: "me", args: "<text>", description: "Send an action-style message." },
  { name: "shrug", args: "[text]", description: "Append ¯\\_(ツ)_/¯ to optional text." },
  { name: "note", args: "<text>", description: "Send a collaborative message editable by anyone in the channel." },
  { name: "nick", args: "<nickname|clear>", description: "Set or clear your nickname in the active guild." },
  { name: "status", args: "<text|clear>", description: "Set or clear your custom status message." },
  { name: "presence", args: "<online|idle|dnd|invisible>", description: "Set your online presence state." },
  { name: "online", args: "", description: "Set presence to online." },
  { name: "idle", args: "", description: "Set presence to idle." },
  { name: "dnd", args: "", description: "Set presence to do-not-disturb." },
  { name: "invisible", args: "", description: "Set presence to invisible." },
  { name: "away", args: "", description: "Set presence to idle." },
  { name: "quests", args: "", description: "Show your earned quest badges and activity stats." },
  { name: "questprogress", args: "", description: "Show quest milestone progress and next goals." },
  { name: "questbadges", args: "", description: "List your unlocked quest badges." },
  { name: "profilefx", args: "<none|aurora|flame|ocean>", description: "Set your profile effect quickly." },
  { name: "guildtag", args: "[TAG|clear]", description: "Set or clear your guild tag." },
  { name: "decor", args: "[emoji|clear]", description: "Set or clear avatar decoration emoji." },
  { name: "nameplate", args: "[url|data:image/svg+xml|clear]", description: "Set or clear nameplate image for your name." },
  { name: "whoami", args: "", description: "Show your current identity summary." },
  { name: "whois", args: "<username-or-jid>", description: "Show another account identity summary." },
  { name: "profilecard", args: "", description: "Post your profile card text into chat." },
  { name: "shop", args: "[decor|nameplate|effect]", description: "Open cosmetics shop and browse collectible profile cosmetics." },
  { name: "inventory", args: "", description: "Show owned cosmetics and current shard balance." },
  { name: "mediaprivacy", args: "[status|safe|off]", description: "Control two-click external media loading privacy mode." },
  { name: "trustdomain", args: "<domain|*.domain|/regex/>", description: "Whitelist a media domain rule for auto-loading." },
  { name: "untrustdomain", args: "<domain|*.domain|/regex/>", description: "Remove a trusted media domain rule." },
  { name: "blockdomain", args: "<domain|*.domain|/regex/>", description: "Block a media domain rule for picker/media loading." },
  { name: "unblockdomain", args: "<domain|*.domain|/regex/>", description: "Remove a blocked media domain rule." },
  { name: "pins", args: "", description: "Open pinned messages for current channel." },
  { name: "unpinall", args: "", description: "Unpin all messages in current channel (manage messages)." },
  { name: "rename", args: "<channel-name>", description: "Rename current channel (manage channels)." },
  { name: "channelinfo", args: "", description: "Show current channel metadata." },
  { name: "whereami", args: "", description: "Show active guild/channel IDs and mode." },
  { name: "serverinfo", args: "", description: "Show active guild metadata summary." },
  { name: "serverroles", args: "", description: "List roles in the active guild." },
  { name: "members", args: "", description: "List members in the active guild." },
  { name: "membercount", args: "", description: "Show active guild member totals by presence." },
  { name: "channels", args: "", description: "List visible channels in this guild." },
  { name: "channeltypes", args: "", description: "Show visible channel counts by type." },
  { name: "jumpunread", args: "", description: "Jump to first unread message in current channel." },
  { name: "nextunread", args: "", description: "Switch to next unread channel in this guild." },
  { name: "prevunread", args: "", description: "Switch to previous unread channel in this guild." },
  { name: "unreadcount", args: "", description: "Show unread/mention totals for this guild." },
  { name: "mentions", args: "", description: "Show current mention summary across guild and DMs." },
  { name: "nextmention", args: "", description: "Switch to next channel with unread mentions." },
  { name: "prevmention", args: "", description: "Switch to previous channel with unread mentions." },
  { name: "drafts", args: "", description: "List current channel/DM drafts." },
  { name: "cleardrafts", args: "[all]", description: "Clear draft for this conversation or all drafts." },
  { name: "focus", args: "[search|composer]", description: "Focus channel/DM search or composer." },
  { name: "find", args: "[query]", description: "Open find-in-conversation and optionally search immediately." },
  { name: "findlinks", args: "", description: "Open find pre-filtered to messages containing links." },
  { name: "findfrom", args: "<username>", description: "Open find pre-filtered to a sender." },
  { name: "findtoday", args: "", description: "Open find pre-filtered to today." },
  { name: "findnext", args: "", description: "Jump to next find match in current conversation." },
  { name: "findprev", args: "", description: "Jump to previous find match in current conversation." },
  { name: "markunread", args: "[message-id-prefix|last]", description: "Mark conversation unread from selected message." },
  { name: "newdm", args: "<username-or-jid>", description: "Open or create a DM with a user or XMPP JID." },
  { name: "closedm", args: "", description: "Close current DM thread." },
  { name: "listdms", args: "", description: "List your DM threads by recent activity." },
  { name: "dmnext", args: "", description: "Switch to next DM thread by activity." },
  { name: "dmprev", args: "", description: "Switch to previous DM thread by activity." },
  { name: "leaveguild", args: "", description: "Leave the active guild (if more than one)." },
  { name: "newchannel", args: "<name> [type]", description: "Create a channel in the active guild (manage channels). Uses current channel category when possible." },
  { name: "newcategory", args: "<name>", description: "Create a channel category in the active guild (manage channels)." },
  { name: "dupchannel", args: "", description: "Duplicate active channel (manage channels)." },
  { name: "movechannel", args: "<up|down|top|bottom>", description: "Reorder active channel (manage channels)." },
  { name: "markdmread", args: "", description: "Mark current DM as read." },
  { name: "markallread", args: "", description: "Mark all channels and DMs as read." },
  { name: "markmentionsread", args: "", description: "Mark guild channels with mentions as read." },
  { name: "markdmmentionsread", args: "", description: "Mark DM threads with mentions as read." },
  { name: "copylink", args: "", description: "Copy link for current channel/DM." },
  { name: "copyid", args: "", description: "Copy current channel/DM ID." },
  { name: "copytopic", args: "", description: "Copy current channel topic." },
  { name: "copyguildid", args: "", description: "Copy active guild ID." },
  { name: "copyguildname", args: "", description: "Copy active guild name." },
  { name: "copychannelname", args: "", description: "Copy active channel name." },
  { name: "copyaccountid", args: "", description: "Copy your account ID." },
  { name: "copyjid", args: "", description: "Copy your XMPP JID (if set)." },
  { name: "copypresence", args: "", description: "Copy your current presence key." },
  { name: "copydisplayname", args: "", description: "Copy your current display name." },
  { name: "copyref", args: "", description: "Copy active conversation reference text." },
  { name: "copyroom", args: "", description: "Copy active relay room token." },
  { name: "notify", args: "[status|all|mentions|mute]", description: "View or set current guild notification mode." },
  { name: "schedule", args: "<when> | <text>", description: "Schedule a message for later (e.g. 10m, 2h, date)." },
  { name: "scheduled", args: "", description: "List pending scheduled messages for this conversation." },
  { name: "unschedule", args: "<id|last|all>", description: "Cancel scheduled message(s) for this conversation." },
  { name: "vc", args: "<join|leave|mute|unmute|toggle|status>", description: "Control active voice/stage channel state quickly." },
  { name: "voicewho", args: "", description: "Show connected members for current voice/stage channel." },
  { name: "voiceactivity", args: "[count]", description: "Show recent activity events in current voice/stage channel." },
  { name: "voicechannels", args: "", description: "List voice/stage channels and live occupancy in this guild." },
  { name: "voicegoto", args: "<channel>", description: "Switch to and join a voice/stage channel." },
  { name: "vcmove", args: "<member> <target-channel>", description: "Move a connected member to another voice/stage channel." },
  { name: "voicekick", args: "<member>", description: "Disconnect a connected member from current voice/stage channel." },
  { name: "hand", args: "[raise|lower|toggle]", description: "Raise/lower hand in current stage channel." },
  { name: "speaker", args: "[on|off|toggle]", description: "Toggle your speaker role in current stage channel." },
  { name: "stage", args: "<approve|dismiss|mute|unmute|promote|demote|disconnect> <member>", description: "Moderate stage participants by name/id." },
  { name: "stagequeue", args: "", description: "Show stage raised-hand queue." },
  { name: "stageclearqueue", args: "", description: "Clear all raised hands in current stage channel." },
  { name: "stageshush", args: "", description: "Mute all non-speakers in current stage channel." },
  { name: "stageaudience", args: "[keep-speaker]", description: "Demote speakers to audience (optionally keep one speaker)." },
  { name: "forumtag", args: "<add|remove|list> ...", description: "Manage forum tags in this channel (manage channels)." },
  { name: "tagthread", args: "<tag1,tag2...|clear>", description: "Assign tags to a forum thread root post." },
  { name: "topic", args: "<topic|clear>", description: "Set or clear the current channel topic." },
  { name: "slowmode", args: "<seconds|off>", description: "Set slowmode for current channel (manage channels)." },
  { name: "clear", args: "", description: "Clear all messages in this channel." },
  { name: "markread", args: "[all]", description: "Mark current channel or all guild channels as read." }
];

let userPopoutXmppNeedsRefresh = false;
let selfPopoutXmppNeedsRefresh = false;
let userPopoutAvatarHint = "";
let cosmeticsTab = "decor";
let cosmeticsFeaturedRefreshTimer = null;
let userProfileExtendedTab = "guilds";
let userProfileExtendedAccountId = null;
let userProfileExtendedAvatarHint = "";
let pinsSearchTerm = "";
let pinsSortMode = "latest";
let loginLocalXmppProfiles = [];
let loginLocalXmppProfilesLoadedOnce = false;
let loginXmppDiscoveryToken = 0;
let relaySocket = null;
let relayEventSource = null;
let relayLocalChannel = null;
let relayLocalClientId = "";
let relayWebxdcChannel = null;
let relayWebxdcJoinInFlight = null;
let relayWebxdcJoinAttempts = 0;
let relayWebxdcJoinFailures = 0;
let relayWebxdcLastError = "";
let relayWebxdcLastErrorAt = 0;
let relayWebxdcPacketsSent = 0;
let relayWebxdcPacketsReceived = 0;
let xmppConnection = null;
let xmppRuntimeReady = false;
let xmppLoadingPromise = null;
let xmppRuntimeLastError = "";
let xmppPingTimer = null;
let xmppPingOutstandingId = "";
let xmppPingOutstandingAt = 0;
let xmppCsiSupported = false;
let xmppCsiState = "";
let xmppSmState = (typeof XEP_0198_STREAM_MANAGEMENT_GLOBAL.createXmppSmState === "function")
  ? XEP_0198_STREAM_MANAGEMENT_GLOBAL.createXmppSmState()
  : {
    supported: false,
    enabled: false,
    allowResume: false,
    resumed: false,
    failed: false,
    id: "",
    inboundHandledCount: 0,
    outboundStanzaCount: 0,
    lastAckedByServer: 0,
    lastEnableAt: 0,
    lastAckAt: 0,
    lastAckRequestAt: 0
  };
let xmppConnectCount = 0;
const xmppWsDiscoveryCache = new Map();
const xmppRoomByJid = new Map();
const xmppRosterByJid = new Map();
const xmppOccupantsByRoomJid = new Map();
const xmppMamStateByRoomJid = new Map();
const xmppMamStateByPeerJid = new Map();
const xmppRoomMessageIndexByJid = new Map();
const xmppDmMessageIndexByPeerJid = new Map();
const xmppPendingReceiptByStanzaId = new Map();
const xmppLastSentDisplayedMarkerByPeerJid = new Map();
const xmppLocalSentRefIdSeenAt = new Map();
const XMPP_LOCAL_SENT_REF_TTL_MS = 6 * 60 * 60 * 1000;
const XMPP_LOCAL_SENT_REF_MAX = 1600;
const xmppAvatarFetchInFlight = new Set();
const xmppAvatarHashByJid = new Map();
const xmppAvatarMissingByJid = new Set();
const xmppHttpUploadServiceCache = new Map();
const xmppHttpUploadDiscoveryInFlight = new Map();
const xmppMucAvatarByOccupantKey = new Map();
const xmppMucAvatarFetchInFlight = new Set();
const xmppKnownMucOccupantJidByKey = new Map();
const xmppSeenDirectMucInviteKeys = new Set();
const XMPP_DIRECT_MUC_INVITE_SEEN_MAX = 512;
const xmppIncomingContactRequestsByJid = new Map();
const xmppOutgoingContactRequestsByJid = new Map();
const xmppMucJoinStateByRoomJid = new Map();
const xmppMucSelfPingStateByRoomJid = new Map();
const xmppDiscoInfoCacheByJid = new Map();
const xmppDiscoInfoInFlightByJid = new Map();
const xmppRoomDiscoveryCacheByService = new Map();
const xmppRoomDiscoveryInFlightByService = new Map();
const xmppOmemoDeviceListByJid = new Map();
const xmppOmemoBundleByJidDevice = new Map();
const xmppOmemoPreferredNamespaceByJid = new Map();
const xmppOmemoSessionSetupInFlight = new Map();
const xmppOmemoDecryptInFlightByMessageId = new Map();
const XMPP_DISCO_INFO_TTL_MS = 5 * 60 * 1000;
const xmppAvailableFullJidsByBare = new Map();
const xmppCallSessionById = new Map();
const xmppCallSessionIdByInviteId = new Map();
const xmppLatestIncomingCallSessionByPeer = new Map();
const xmppLatestOutgoingCallSessionByPeer = new Map();
const XMPP_CALL_SIGNAL_TIMEOUT_MS = 15_000;
const XMPP_CALL_ICE_GATHER_TIMEOUT_MS = 4200;
const XMPP_CALL_ICE_MAX_CANDIDATES = 24;
const XMPP_CALL_TRANSPORT_NOTICE_INTERVAL_MS = 5000;
const xmppCallIceGatherInFlightBySessionId = new Map();
const xmppCallPeerConnectionBySessionId = new Map();
const xmppCallSessionTaskChainBySessionId = new Map();
const xmppCallPendingReprimeBySessionId = new Map();
const XMPP_CALL_REPRIME_DEBOUNCE_MS = 160;
const xmppCallLocalMediaStreamBySessionId = new Map();
const xmppCallLocalAuxStreamsBySessionId = new Map();
const xmppCallRemoteStreamsBySessionId = new Map();
const xmppCallRemoteTrackWaitTimerBySessionId = new Map();
const xmppCallReconnectAttemptBySessionId = new Map();
const xmppCallTransportInfoNoticeBySessionId = new Map();
const xmppCallQualitySnapshotBySessionId = new Map();
const xmppCallQualityRefreshInFlight = new Set();
const webCallInviteSeenTokens = new Set();
const webCallInvitePendingByToken = new Map();
const xmppCallInviteTokenById = new Map();
const xmppCallSpeakingStateBySessionId = new Map();
const xmppNativeCallTileSpeakingStateBySessionId = new Map();
let xmppCallSpeakingAudioContext = null;
let xmppMediaAccessToastAt = 0;
let xmppScreenShareWarningToastAt = 0;
let webCallRingtoneContext = null;
let webCallRingtoneInterval = null;
let webCallRingtoneToken = "";
let activeWebCallLightbox = null;
let xmppActiveNativeCallSessionId = "";
let nativeCallAudioTestElement = null;
let nativeCallAudioTestSessionId = "";
let nativeCallDebugDialogSessionId = "";
let xmppMediaDeviceChangeBound = false;
let xmppMediaDeviceChangeTimer = 0;
let xmppMediaDeviceChangeInFlight = false;
let xmppMediaDeviceChangeToastAt = 0;
let nativeCallSurfaceTickerId = 0;
let nativeCallSurfaceTickerSessionId = "";
let nativeCallDevicePickerLocked = false;
let nativeCallDevicePickerSessionId = "";
let nativeCallDevicePickerLockedAt = 0;
let relayStatus = "disconnected";
let relayLastError = "";
let relayJoinedRoom = "";
let relayManualDisconnect = false;
let relayReconnectTimer = null;
const relaySeenMessageIds = new Set();
const relayTypingByRoom = new Map();
let relayTypingSweepTimer = null;
const RELAY_HISTORY_RENDER_BATCH_MS = 90;
const MESSAGE_LIST_NEAR_BOTTOM_PX = 44;
let relayUiRefreshTimer = null;
const relayUiRefreshNeeds = {
  servers: false,
  channels: false,
  dms: false,
  messages: false
};
const attachmentTextPreviewCache = new Map();
const attachmentTextPreviewInFlight = new Map();
const attachmentBinaryPreviewCache = new Map();
const attachmentBinaryPreviewInFlight = new Map();
const xmppBobCacheByCid = new Map();
const xmppBobFetchInFlightByCid = new Map();
const avatarUrlRenderabilityByUrl = new Map();
const avatarUrlRenderabilityInFlight = new Set();
let avatarUrlRenderRefreshRaf = 0;
let lastRenderedConversationId = null;
const relayLocalTypingState = {
  room: "",
  active: false,
  chatState: "",
  lastSentAt: 0
};
let loginXmppProgressStartedAt = 0;
let loginXmppProgressTimerId = null;
let xmppCapsHash = "";
let xmppCapsPromise = null;
let cosmeticsSearchQuery = "";
let cosmeticsSortMode = "featured";
