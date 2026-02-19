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
const XMPP_DEBUG_EVENT_LIMIT = 600;
const XMPP_DEBUG_RAW_TRUNCATE = 1800;
const XMPP_HOST_META_TIMEOUT_MS = 3600;
const XMPP_LOCAL_AUTH_GATEWAY_URL = "http://localhost:8790";
const XMPP_ENABLE_BROWSER_HOST_META_FALLBACK = false;
const XMPP_PLAIN_ONLY_DOMAINS = new Set(["xmpp.jp"]);
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
  { name: "relay", args: "[status|connect|disconnect|mode <local|http|ws|xmpp|off>|url <http://...|ws://...>|room <name|clear>]", description: "Control experimental realtime relay transport." },
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
  { name: "nick", args: "<nickname>", description: "Set your nickname in the active guild." },
  { name: "status", args: "<text>", description: "Set your custom status message." },
  { name: "quests", args: "", description: "Show your earned quest badges and activity stats." },
  { name: "questprogress", args: "", description: "Show quest milestone progress and next goals." },
  { name: "questbadges", args: "", description: "List your unlocked quest badges." },
  { name: "profilefx", args: "<none|aurora|flame|ocean>", description: "Set your profile effect quickly." },
  { name: "guildtag", args: "[TAG|clear]", description: "Set or clear your guild tag." },
  { name: "decor", args: "[emoji|clear]", description: "Set or clear avatar decoration emoji." },
  { name: "nameplate", args: "[url|data:image/svg+xml|clear]", description: "Set or clear nameplate image for your name." },
  { name: "whoami", args: "", description: "Show your current identity summary." },
  { name: "profilecard", args: "", description: "Post your profile card text into chat." },
  { name: "shop", args: "[decor|nameplate|effect]", description: "Open cosmetics shop and browse collectible profile cosmetics." },
  { name: "inventory", args: "", description: "Show owned cosmetics and current shard balance." },
  { name: "mediaprivacy", args: "[status|safe|off]", description: "Control two-click external media loading privacy mode." },
  { name: "trustdomain", args: "<domain|*.domain|/regex/>", description: "Whitelist a media domain rule for auto-loading." },
  { name: "untrustdomain", args: "<domain|*.domain|/regex/>", description: "Remove a trusted media domain rule." },
  { name: "pins", args: "", description: "Open pinned messages for current channel." },
  { name: "unpinall", args: "", description: "Unpin all messages in current channel (manage messages)." },
  { name: "rename", args: "<channel-name>", description: "Rename current channel (manage channels)." },
  { name: "channelinfo", args: "", description: "Show current channel metadata." },
  { name: "whereami", args: "", description: "Show active guild/channel IDs and mode." },
  { name: "jumpunread", args: "", description: "Jump to first unread message in current channel." },
  { name: "nextunread", args: "", description: "Switch to next unread channel in this guild." },
  { name: "prevunread", args: "", description: "Switch to previous unread channel in this guild." },
  { name: "unreadcount", args: "", description: "Show unread/mention totals for this guild." },
  { name: "drafts", args: "", description: "List current channel/DM drafts." },
  { name: "cleardrafts", args: "[all]", description: "Clear draft for this conversation or all drafts." },
  { name: "focus", args: "[search|composer]", description: "Focus channel/DM search or composer." },
  { name: "find", args: "[query]", description: "Open find-in-conversation and optionally search immediately." },
  { name: "findnext", args: "", description: "Jump to next find match in current conversation." },
  { name: "findprev", args: "", description: "Jump to previous find match in current conversation." },
  { name: "markunread", args: "[message-id-prefix|last]", description: "Mark conversation unread from selected message." },
  { name: "newdm", args: "<username>", description: "Open or create a DM with a user." },
  { name: "closedm", args: "", description: "Close current DM thread." },
  { name: "leaveguild", args: "", description: "Leave the active guild (if more than one)." },
  { name: "newchannel", args: "<name> [type]", description: "Create a channel in the active guild (manage channels). Types: text/announcement/forum/media/voice/stage." },
  { name: "dupchannel", args: "", description: "Duplicate active channel (manage channels)." },
  { name: "movechannel", args: "<up|down|top|bottom>", description: "Reorder active channel (manage channels)." },
  { name: "markdmread", args: "", description: "Mark current DM as read." },
  { name: "markallread", args: "", description: "Mark all channels and DMs as read." },
  { name: "copylink", args: "", description: "Copy link for current channel/DM." },
  { name: "copyid", args: "", description: "Copy current channel/DM ID." },
  { name: "copytopic", args: "", description: "Copy current channel topic." },
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
  { name: "topic", args: "<topic>", description: "Set the current channel topic." },
  { name: "slowmode", args: "<seconds|off>", description: "Set slowmode for current channel (manage channels)." },
  { name: "clear", args: "", description: "Clear all messages in this channel." },
  { name: "markread", args: "[all]", description: "Mark current channel or all guild channels as read." }
];
const MEDIA_TABS = ["gif", "sticker", "emoji", "swf", "svg", "pdf", "text", "docs", "html"];
const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const SHARD_ECONOMY = {
  starter: 20,
  messageEvery: 5,
  reactionEvery: 3,
  pollWorth: 4,
  badgeWorth: 3
};
const COSMETIC_CATALOG = [
  { id: "decor_starlight", type: "decor", name: "Starlight", value: "✨", cost: 14, note: "Classic sparkle trim." },
  { id: "decor_flame", type: "decor", name: "Hotshot", value: "🔥", cost: 16, note: "Fire badge for high-energy profiles." },
  { id: "decor_diamond", type: "decor", name: "Rare Cut", value: "💎", cost: 18, note: "Glossy collector badge." },
  { id: "nameplate_aurora", type: "nameplate", name: "Aurora Ribbon", value: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2335c7a4'/%3E%3Cstop offset='0.5' stop-color='%233f71ff'/%3E%3Cstop offset='1' stop-color='%238f56f2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='96' rx='24' fill='url(%23g)'/%3E%3C/svg%3E", cost: 28, note: "Animated-like gradient plate." },
  { id: "nameplate_flare", type: "nameplate", name: "Solar Flare", value: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0.2' y2='0.8'%3E%3Cstop offset='0' stop-color='%23ff8a00'/%3E%3Cstop offset='0.55' stop-color='%23ff3f5f'/%3E%3Cstop offset='1' stop-color='%23a62eff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='96' rx='24' fill='url(%23g)'/%3E%3C/svg%3E", cost: 30, note: "High contrast warm palette." },
  { id: "nameplate_wave", type: "nameplate", name: "Ocean Wave", value: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%231da8ff'/%3E%3Cstop offset='0.55' stop-color='%232ed6c4'/%3E%3Cstop offset='1' stop-color='%232d5bff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='96' rx='24' fill='url(%23g)'/%3E%3C/svg%3E", cost: 30, note: "Cool-toned sea shimmer." },
  { id: "effect_aurora", type: "effect", name: "Aurora", value: "aurora", cost: 20, note: "Green-blue-purple banner motion." },
  { id: "effect_flame", type: "effect", name: "Flame", value: "flame", cost: 22, note: "Orange-pink energetic sweep." },
  { id: "effect_ocean", type: "effect", name: "Ocean", value: "ocean", cost: 22, note: "Blue-cyan depth gradient." }
];
const mediaAllowOnceUrls = new Set();
const EMOJI_LIBRARY = [
  { name: "grinning", value: "😀", aliases: ["smile"], keywords: ["happy", "face"] },
  { name: "joy", value: "😂", aliases: ["lol"], keywords: ["laugh", "tears"] },
  { name: "smile", value: "😄", aliases: ["happy"], keywords: ["grin", "face"] },
  { name: "thinking", value: "🤔", aliases: ["hmm"], keywords: ["question", "idea"] },
  { name: "sob", value: "😭", aliases: ["cry"], keywords: ["sad", "tears"] },
  { name: "fire", value: "🔥", aliases: ["lit"], keywords: ["hot", "flame"] },
  { name: "thumbsup", value: "👍", aliases: ["approve"], keywords: ["yes", "ok"] },
  { name: "heart", value: "❤️", aliases: ["love"], keywords: ["like", "favorite"] },
  { name: "party", value: "🥳", aliases: ["celebrate"], keywords: ["birthday", "yay"] },
  { name: "eyes", value: "👀", aliases: ["look"], keywords: ["watch", "seeing"] },
  { name: "skull", value: "💀", aliases: ["dead"], keywords: ["bones", "spooky"] },
  { name: "sparkles", value: "✨", aliases: ["shine"], keywords: ["star", "magic"] },
  { name: "pray", value: "🙏", aliases: ["please"], keywords: ["thanks", "hope"] },
  { name: "ok_hand", value: "👌", aliases: ["ok"], keywords: ["good", "fine"] },
  { name: "wave", value: "👋", aliases: ["hello"], keywords: ["hi", "bye"] },
  { name: "clap", value: "👏", aliases: ["applause"], keywords: ["bravo", "hands"] },
  { name: "rocket", value: "🚀", aliases: ["launch"], keywords: ["ship", "space"] },
  { name: "tada", value: "🎉", aliases: ["confetti"], keywords: ["party", "celebration"] },
  { name: "100", value: "💯", aliases: ["perfect"], keywords: ["score", "full"] },
  { name: "warning", value: "⚠️", aliases: ["alert"], keywords: ["danger", "caution"] },
  { name: "check", value: "✅", aliases: ["done"], keywords: ["complete", "ok"] },
  { name: "x", value: "❌", aliases: ["no"], keywords: ["cancel", "wrong"] },
  { name: "bulb", value: "💡", aliases: ["idea"], keywords: ["light", "think"] },
  { name: "nerd", value: "🤓", aliases: ["smart"], keywords: ["glasses", "geek"] },
  { name: "sunglasses", value: "😎", aliases: ["cool"], keywords: ["sun", "vibe"] },
  { name: "angry", value: "😠", aliases: ["mad"], keywords: ["rage", "upset"] },
  { name: "sleeping", value: "😴", aliases: ["tired"], keywords: ["zzz", "rest"] },
  { name: "poop", value: "💩", aliases: ["shit"], keywords: ["funny", "pile"] },
  { name: "cat", value: "🐱", aliases: ["kitty"], keywords: ["pet", "animal"] },
  { name: "dog", value: "🐶", aliases: ["puppy"], keywords: ["pet", "animal"] },
  { name: "star", value: "⭐", aliases: ["favorite"], keywords: ["rating", "shine"] },
  { name: "moon", value: "🌙", aliases: ["night"], keywords: ["sleep", "sky"] }
];
const STICKER_LIBRARY = [
  { name: "blob wave", url: "https://media.tenor.com/LrSL7XDKVbgAAAAC/pepe-wave.gif" },
  { name: "cat vibing", url: "https://media.tenor.com/zr6rUP8r7K8AAAAC/cat-vibe.gif" },
  { name: "ok hand", url: "https://media.tenor.com/x4hN6Q8xB0QAAAAC/okay-ok.gif" },
  { name: "sad blob", url: "https://media.tenor.com/K7V8MDFMvxQAAAAC/blob-sad.gif" }
];
const GIF_LIBRARY = [
  { name: "good morning", url: "https://media.tenor.com/6IicLfOaw1AAAAPo/tora-dora-good-morning.mp4", preview: "video" },
  { name: "k pop", url: "https://media1.giphy.com/media/v1.Y2lkPTczYjhmN2IxamQ2eHU5cmJkOXZudTVzaW92cXZleDdpbTFqZ2U1aDJ2dXA1ZTYzNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l1Ku4uzAQLocVQtUc/100w.gif" },
  { name: "jurassic park", url: "https://media0.giphy.com/media/v1.Y2lkPTczYjhmN2Ixaml2dmUzdjVoODVwOWVqZGM1enFocGMwb2ZnZzJudWw5bWlkenhzZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/37Fsl1eFxbhtu/100w.gif" },
  { name: "super bowl", url: "https://media2.giphy.com/media/v1.Y2lkPTczYjhmN2IxMjRjbDEzMDdhbGdwYzhlYnlqYmZwa2dlZzVuMG5rYjhmbXVoNHphNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/FB7yASVBqPiFy/100w.gif" }
];
const SVG_LIBRARY = [
  { name: "pulse ring", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%231a1d25'/%3E%3Ccircle cx='100' cy='60' r='12' fill='%235865f2'%3E%3Canimate attributeName='r' values='8;42;8' dur='2.2s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='1;0;1' dur='2.2s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E" },
  { name: "scan lines", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%230f1116'/%3E%3Crect x='0' y='0' width='200' height='2' fill='%2357f287'%3E%3Canimate attributeName='y' values='0;118;0' dur='1.8s' repeatCount='indefinite'/%3E%3C/rect%3E%3C/svg%3E" },
  { name: "spinning cube", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%2311161f'/%3E%3Cg transform='translate(100 60)'%3E%3Crect x='-18' y='-18' width='36' height='36' fill='none' stroke='%23f0b232' stroke-width='4'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0' to='360' dur='2s' repeatCount='indefinite'/%3E%3C/rect%3E%3C/g%3E%3C/svg%3E" }
];

function createVoiceState() {
  return {
    connectedIds: [],
    mutedIds: [],
    raisedHandIds: [],
    speakerIds: [],
    activity: []
  };
}

function createId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeUsername(value) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .slice(0, 24);
  try {
    return base.replace(new RegExp("[^\\p{L}\\p{N}._-]", "gu"), "");
  } catch {
    // Older JS engines may not support Unicode property escapes.
  }
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 24);
}

function sanitizeChannelName(value, fallback) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 40);
  return cleaned || fallback;
}

function sanitizeForumTagName(value) {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 24);
}

function normalizeComposerDrafts(value) {
  if (!value || typeof value !== "object") return {};
  const entries = Object.entries(value)
    .filter(([conversationId]) => typeof conversationId === "string" && conversationId)
    .map(([conversationId, draft]) => [conversationId, (draft || "").toString().slice(0, 400)]);
  return Object.fromEntries(entries.filter(([, draft]) => draft.length > 0));
}

function escapeRegExp(value) {
  return (value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toTimestampMs(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function rolePresetPermissions(preset) {
  if (preset === "admin") {
    return {
      administrator: true,
      manageChannels: true,
      manageRoles: true,
      manageMessages: true,
      stageModeration: true
    };
  }
  if (preset === "mod") {
    return {
      administrator: false,
      manageChannels: true,
      manageRoles: false,
      manageMessages: true,
      stageModeration: true
    };
  }
  return {
    administrator: false,
    manageChannels: false,
    manageRoles: false,
    manageMessages: false,
    stageModeration: false
  };
}

function createRole(name, color, preset = "member") {
  return {
    id: createId(),
    name,
    color,
    permissions: rolePresetPermissions(preset)
  };
}

function buildStarterChannels(template, accountId) {
  const readState = accountId ? { [accountId]: new Date().toISOString() } : {};
  const defaultForumTags = [
    { id: createId(), name: "question", color: "#5865f2" },
    { id: createId(), name: "discussion", color: "#57f287" }
  ];
  const mk = (name, type = "text", topic = "") => ({
    id: createId(),
    name,
    type,
    topic,
    forumTags: type === "forum" ? defaultForumTags.map((entry) => ({ ...entry })) : [],
    permissionOverrides: {},
    voiceState: createVoiceState(),
    readState: { ...readState },
    slowmodeSec: 0,
    slowmodeState: {},
    messages: []
  });
  if (template === "friends") {
    return [mk("general", "text", "General chat"), mk("memes"), mk("media", "media", "Photos and clips")];
  }
  if (template === "gaming") {
    return [mk("general"), mk("clips", "media"), mk("announcements", "announcement"), mk("lfg", "forum")];
  }
  if (template === "community") {
    return [mk("rules", "announcement"), mk("announcements", "announcement"), mk("general"), mk("help", "forum")];
  }
  if (template === "study") {
    return [mk("general"), mk("resources"), mk("questions", "forum"), mk("announcements", "announcement")];
  }
  return [mk("general", "text", "General discussion")];
}

function buildInitialState() {
  const guildId = createId();
  const channelId = createId();
  const everyoneRole = createRole("@everyone", "#b5bac1", "member");
  return {
    accounts: [],
    currentAccountId: null,
    guilds: [
      {
        id: guildId,
        name: "My First Guild",
        description: "General-purpose guild",
        accentColor: "#5865f2",
        memberIds: [],
        customEmojis: [],
        customStickers: [],
        customGifs: [],
        customSvgs: [],
        customPdfs: [],
        customTexts: [],
        customDocs: [],
        customSwfs: [],
        roles: [everyoneRole],
        memberRoles: {},
        channels: [
          {
            id: channelId,
            name: "general",
            type: "text",
            topic: "General discussion",
            forumTags: [],
            permissionOverrides: {},
            voiceState: createVoiceState(),
            readState: {},
            slowmodeSec: 0,
            slowmodeState: {},
            messages: [
              {
                id: createId(),
                userId: null,
                authorName: "system",
                text: "Welcome to shitcord67. Create channels and start chatting.",
                ts: new Date().toISOString(),
                reactions: [],
                pinned: false,
                attachments: []
              }
            ]
          }
        ]
      }
    ],
    activeGuildId: guildId,
    activeChannelId: channelId,
    activeDmId: null,
    viewMode: "guild",
    dmThreads: [],
    guildFolders: [],
    userNotes: {},
    composerDrafts: {},
    scheduledMessages: [],
    savedSwfs: [],
    preferences: {
      uiScale: 100,
      theme: "discord",
      compactMembers: "off",
      developerMode: "off",
      debugOverlay: "off",
      mute: "off",
      deafen: "off",
      swfAudio: "on",
      swfVolume: 20,
      swfAudioPolicy: "single",
      swfAudioScope: "global",
      swfAutoplay: "on",
      swfPauseOnMute: "off",
      swfVuMeter: "off",
      swfQuickAudioMode: "click",
      guildNotifications: {},
      forumCollapsedThreads: {},
      forumThreadReadState: {},
      forumThreadSort: {},
      forumThreadTagFilter: {},
      mediaPrivacyMode: "safe",
      mediaTrustRules: [],
      mediaLastTab: "gif",
      recentEmojis: [],
      hideChannelPanel: "off",
      hideMemberPanel: "off",
      collapseDmSection: "off",
      collapseGuildSection: "off",
      lastChannelByGuild: {},
      swfPipPosition: null,
      relayMode: "local",
      relayUrl: "ws://localhost:8787",
      relayRoom: "",
      relayAutoConnect: "on",
      relayClientId: createId(),
      rememberLogin: "on",
      xmppJid: "",
      xmppPassword: "",
      xmppWsUrl: "",
      xmppMucService: ""
    }
  };
}

function createAccount(username, displayName = "") {
  return {
    id: createId(),
    username,
    displayName: displayName || username,
    bio: "",
    banner: "",
    avatarColor: "#57f287",
    avatarUrl: "",
    guildProfiles: {},
    presence: "online",
    customStatus: "",
    customStatusEmoji: "",
    customStatusExpiresAt: null,
    avatarDecoration: "",
    guildTag: "",
    profileEffect: "none",
    profileNameplateSvg: "",
    ownedCosmetics: {
      decor: [],
      nameplate: [],
      effect: []
    },
    cosmeticPurchases: []
  };
}

function normalizeOwnedCosmetics(raw) {
  const safe = raw && typeof raw === "object" ? raw : {};
  return {
    decor: Array.isArray(safe.decor) ? [...new Set(safe.decor.map((id) => (id || "").toString()).filter(Boolean))] : [],
    nameplate: Array.isArray(safe.nameplate) ? [...new Set(safe.nameplate.map((id) => (id || "").toString()).filter(Boolean))] : [],
    effect: Array.isArray(safe.effect) ? [...new Set(safe.effect.map((id) => (id || "").toString()).filter(Boolean))] : []
  };
}

function normalizeCosmeticPurchases(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => ({
      id: (entry?.id || "").toString(),
      cost: Number(entry?.cost || 0),
      ts: (entry?.ts || "").toString()
    }))
    .filter((entry) => entry.id && Number.isFinite(entry.cost) && entry.cost > 0)
    .slice(-240);
}

function cosmeticById(id) {
  const token = (id || "").toString().trim();
  if (!token) return null;
  return COSMETIC_CATALOG.find((item) => item.id === token) || null;
}

function ensureAccountCosmetics(account) {
  if (!account) return;
  account.ownedCosmetics = normalizeOwnedCosmetics(account.ownedCosmetics);
  account.cosmeticPurchases = normalizeCosmeticPurchases(account.cosmeticPurchases);
  const freeIds = ["decor_starlight", "effect_aurora"];
  freeIds.forEach((id) => {
    const item = cosmeticById(id);
    if (!item) return;
    if (!account.ownedCosmetics[item.type].includes(id)) {
      account.ownedCosmetics[item.type].push(id);
    }
  });
  const equipped = [
    COSMETIC_CATALOG.find((item) => item.type === "decor" && item.value === accountDecorationEmoji(account)),
    COSMETIC_CATALOG.find((item) => item.type === "nameplate" && item.value === accountNameplateSvg(account)),
    COSMETIC_CATALOG.find((item) => item.type === "effect" && item.value === accountProfileEffect(account))
  ].filter(Boolean);
  equipped.forEach((item) => {
    if (!account.ownedCosmetics[item.type].includes(item.id)) {
      account.ownedCosmetics[item.type].push(item.id);
    }
  });
}

function migrateState(raw) {
  const sourceGuilds = Array.isArray(raw?.guilds) ? raw.guilds : raw?.servers;
  if (raw && Array.isArray(raw.accounts) && Array.isArray(sourceGuilds)) {
    if (!raw.preferences || typeof raw.preferences !== "object") {
      raw.preferences = buildInitialState().preferences;
    }
    raw.accounts = raw.accounts.map((account) => ({
      ...account,
      guildProfiles: account && typeof account.guildProfiles === "object" ? { ...account.guildProfiles } : {},
      customStatusEmoji: (account?.customStatusEmoji || "").toString().slice(0, 4),
      customStatusExpiresAt: account?.customStatusExpiresAt || null,
      avatarDecoration: (account?.avatarDecoration || "").toString().slice(0, 4),
      guildTag: (account?.guildTag || "").toString().trim().slice(0, 8),
      profileEffect: normalizeProfileEffect(account?.profileEffect),
      profileNameplateSvg: (account?.profileNameplateSvg || "").toString().slice(0, 280),
      ownedCosmetics: normalizeOwnedCosmetics(account?.ownedCosmetics),
      cosmeticPurchases: normalizeCosmeticPurchases(account?.cosmeticPurchases)
    })).map((account) => {
      ensureAccountCosmetics(account);
      return account;
    });
    raw.savedSwfs = normalizeSavedSwfs(raw.savedSwfs);
    raw.guilds = sourceGuilds.map((guild) => {
      const baseRole = createRole("@everyone", "#b5bac1", "member");
      const roles = Array.isArray(guild.roles) && guild.roles.length > 0
        ? guild.roles.map((role) => ({
            id: role.id || createId(),
            name: role.name || "Role",
            color: role.color || "#b5bac1",
            permissions: {
              administrator: Boolean(role.permissions?.administrator),
              manageChannels: Boolean(role.permissions?.manageChannels),
              manageRoles: Boolean(role.permissions?.manageRoles),
              manageMessages: Boolean(role.permissions?.manageMessages),
              stageModeration: Boolean(role.permissions?.stageModeration ?? role.permissions?.manageMessages)
            }
          }))
        : [baseRole];
      const everyoneId = roles[0].id;
      const memberRoles = typeof guild.memberRoles === "object" && guild.memberRoles
        ? { ...guild.memberRoles }
        : {};
      (Array.isArray(guild.memberIds) ? guild.memberIds : []).forEach((memberId) => {
        if (!Array.isArray(memberRoles[memberId])) memberRoles[memberId] = [];
        if (!memberRoles[memberId].includes(everyoneId)) memberRoles[memberId].push(everyoneId);
      });
      return {
        ...guild,
        description: typeof guild.description === "string" ? guild.description.slice(0, 180) : "",
        accentColor: (guild.accentColor || "#5865f2").toString().slice(0, 24),
        customEmojis: Array.isArray(guild.customEmojis) ? guild.customEmojis : [],
        customStickers: Array.isArray(guild.customStickers) ? guild.customStickers : [],
        customGifs: Array.isArray(guild.customGifs) ? guild.customGifs : [],
        customSvgs: Array.isArray(guild.customSvgs) ? guild.customSvgs : [],
        customPdfs: Array.isArray(guild.customPdfs) ? guild.customPdfs : [],
        customTexts: Array.isArray(guild.customTexts) ? guild.customTexts : [],
        customDocs: Array.isArray(guild.customDocs) ? guild.customDocs : [],
        customSwfs: Array.isArray(guild.customSwfs) ? guild.customSwfs : [],
        customHtmls: Array.isArray(guild.customHtmls) ? guild.customHtmls : [],
        memberIds: Array.isArray(guild.memberIds) ? guild.memberIds : [],
        roles,
        memberRoles,
        channels: Array.isArray(guild.channels)
          ? guild.channels.map((channel) => {
              const type = ["text", "announcement", "forum", "media", "voice", "stage"].includes(channel.type) ? channel.type : "text";
              const forumTags = type === "forum" ? normalizeForumTags(channel.forumTags) : [];
              return {
                ...channel,
                type,
                topic: typeof channel.topic === "string" ? channel.topic : "",
                forumTags,
                permissionOverrides: normalizeChannelPermissionOverrides(channel.permissionOverrides, roles.map((role) => role.id)),
                voiceState: normalizeVoiceState(channel.voiceState),
                readState: typeof channel.readState === "object" && channel.readState ? { ...channel.readState } : {},
                slowmodeSec: Math.max(0, Number(channel.slowmodeSec || 0)) || 0,
                slowmodeState: typeof channel.slowmodeState === "object" && channel.slowmodeState ? { ...channel.slowmodeState } : {},
                messages: Array.isArray(channel.messages)
                  ? channel.messages.map((message) => ({
                      ...message,
                      reactions: Array.isArray(message.reactions) ? message.reactions : [],
                      pinned: Boolean(message.pinned),
                      attachments: normalizeAttachments(message.attachments),
                      poll: normalizePoll(message.poll),
                      forumTagIds: normalizeThreadTagIds(message.forumTagIds, forumTags)
                    }))
                  : []
              };
            })
          : []
      };
    });
    raw.activeGuildId = raw.activeGuildId || raw.activeServerId || raw.guilds[0]?.id || null;
    raw.activeDmId = typeof raw.activeDmId === "string" ? raw.activeDmId : null;
    raw.viewMode = raw.viewMode === "dm" ? "dm" : "guild";
    raw.dmThreads = Array.isArray(raw.dmThreads)
      ? raw.dmThreads.map((thread) => ({
          id: thread.id || createId(),
          participantIds: Array.isArray(thread.participantIds) ? thread.participantIds.filter(Boolean).slice(0, 2) : [],
          readState: typeof thread.readState === "object" && thread.readState ? { ...thread.readState } : {},
          messages: Array.isArray(thread.messages)
            ? thread.messages.map((message) => ({
                ...message,
                reactions: Array.isArray(message.reactions) ? message.reactions : [],
                pinned: Boolean(message.pinned),
                attachments: normalizeAttachments(message.attachments),
                poll: normalizePoll(message.poll)
              }))
            : []
        }))
      : [];
    raw.guildFolders = Array.isArray(raw.guildFolders)
      ? raw.guildFolders.map((folder) => ({
          id: folder.id || createId(),
          name: (folder.name || "Folder").toString().slice(0, 24),
          guildIds: Array.isArray(folder.guildIds) ? folder.guildIds.filter(Boolean) : [],
          collapsed: Boolean(folder.collapsed)
        }))
      : [];
    raw.userNotes = raw.userNotes && typeof raw.userNotes === "object" ? { ...raw.userNotes } : {};
    raw.composerDrafts = normalizeComposerDrafts(raw.composerDrafts);
    raw.scheduledMessages = normalizeScheduledMessages(raw.scheduledMessages);
    delete raw.servers;
    delete raw.activeServerId;
    return raw;
  }

  const migrated = buildInitialState();
  if (!raw || typeof raw !== "object") return migrated;
  migrated.savedSwfs = normalizeSavedSwfs(raw.savedSwfs);
  migrated.composerDrafts = normalizeComposerDrafts(raw.composerDrafts);
  migrated.scheduledMessages = normalizeScheduledMessages(raw.scheduledMessages);

  const maybeUser = typeof raw.currentUser === "string" ? normalizeUsername(raw.currentUser) : "";
  let account = null;
  if (maybeUser) {
    account = createAccount(maybeUser, raw.currentUser.trim().slice(0, 32));
    if (raw.profile && typeof raw.profile === "object") {
      account.bio = (raw.profile.bio || "").toString();
      account.banner = (raw.profile.banner || "").toString();
      account.avatarColor = (raw.profile.avatarColor || "#57f287").toString();
      account.avatarDecoration = (raw.profile.avatarDecoration || "").toString().slice(0, 4);
      account.guildTag = (raw.profile.guildTag || "").toString().trim().slice(0, 8);
      account.profileEffect = normalizeProfileEffect(raw.profile.profileEffect);
      account.profileNameplateSvg = (raw.profile.profileNameplateSvg || "").toString().slice(0, 280);
    }
    ensureAccountCosmetics(account);
    migrated.accounts = [account];
    migrated.currentAccountId = account.id;
  }

  if (Array.isArray(sourceGuilds) && sourceGuilds.length > 0) {
    migrated.guilds = sourceGuilds.map((guild) => {
      const guildId = guild.id || createId();
      const everyoneRole = createRole("@everyone", "#b5bac1", "member");
      const memberIds = [];
      if (account) memberIds.push(account.id);
      const memberRoles = {};
      if (account) memberRoles[account.id] = [everyoneRole.id];
      const channels = Array.isArray(guild.channels) && guild.channels.length > 0
        ? guild.channels.map((channel) => {
            const messages = Array.isArray(channel.messages)
              ? channel.messages.map((msg) => ({
                  id: msg.id || createId(),
                  userId: account && msg.user === raw.currentUser ? account.id : null,
                  authorName: account && msg.user === raw.currentUser ? "" : (msg.user || "unknown"),
                  text: (msg.text || "").toString(),
                  ts: msg.ts || new Date().toISOString(),
                  reactions: [],
                  pinned: false,
                  attachments: normalizeAttachments(msg.attachments),
                  poll: normalizePoll(msg.poll)
                }))
              : [];
            const type = ["text", "announcement", "forum", "media", "voice", "stage"].includes(channel.type) ? channel.type : "text";
            const forumTags = type === "forum" ? normalizeForumTags(channel.forumTags) : [];
            return {
              id: channel.id || createId(),
              name: channel.name || "general",
              type,
              topic: "",
              forumTags,
              permissionOverrides: normalizeChannelPermissionOverrides(channel.permissionOverrides, [everyoneRole.id]),
              voiceState: normalizeVoiceState(channel.voiceState),
              readState: typeof channel.readState === "object" && channel.readState ? { ...channel.readState } : {},
              slowmodeSec: Math.max(0, Number(channel.slowmodeSec || 0)) || 0,
              slowmodeState: typeof channel.slowmodeState === "object" && channel.slowmodeState ? { ...channel.slowmodeState } : {},
              messages
            };
          })
        : [
            {
              id: createId(),
              name: "general",
              topic: "",
              forumTags: [],
              permissionOverrides: {},
              voiceState: createVoiceState(),
              readState: {},
              slowmodeSec: 0,
              slowmodeState: {},
              messages: []
            }
          ];
      return {
        id: guildId,
        name: guild.name || "Untitled Guild",
        description: "",
        accentColor: "#5865f2",
        customEmojis: [],
        customStickers: [],
        customGifs: [],
        customSvgs: [],
        customPdfs: [],
        customTexts: [],
        customDocs: [],
        customSwfs: [],
        customHtmls: [],
        memberIds,
        roles: [everyoneRole],
        memberRoles,
        channels
      };
    });

    migrated.activeGuildId = raw.activeGuildId || raw.activeServerId || migrated.guilds[0].id;
    const activeGuild = migrated.guilds.find((g) => g.id === migrated.activeGuildId) || migrated.guilds[0];
    migrated.activeChannelId = raw.activeChannelId || activeGuild.channels[0].id;
  }

  return migrated;
}

function loadState() {
  const applySessionRestore = (restored) => {
    if (!restored || !Array.isArray(restored.accounts)) return restored;
    const persistSession = isSessionPersistenceEnabled();
    const accountIds = restored.accounts.map((account) => account?.id).filter(Boolean);
    const validIds = new Set(accountIds);
    if (!persistSession) {
      restored.currentAccountId = null;
      localStorage.removeItem(SESSION_ACCOUNT_KEY);
      return restored;
    }
    if (restored.currentAccountId && validIds.has(restored.currentAccountId)) {
      localStorage.setItem(SESSION_ACCOUNT_KEY, restored.currentAccountId);
      return restored;
    }
    const remembered = localStorage.getItem(SESSION_ACCOUNT_KEY);
    if (remembered && validIds.has(remembered)) {
      restored.currentAccountId = remembered;
      return restored;
    }
    if (!restored.currentAccountId && accountIds.length === 1) {
      [restored.currentAccountId] = accountIds;
    }
    return restored;
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return applySessionRestore(migrateState(JSON.parse(raw)));

    const v2Raw = localStorage.getItem("flashcord-state-v2");
    if (v2Raw) {
      const migrated = applySessionRestore(migrateState(JSON.parse(v2Raw)));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    const legacyRaw = localStorage.getItem("flashcord-state-v1");
    if (legacyRaw) {
      const migrated = applySessionRestore(migrateState(JSON.parse(legacyRaw)));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return buildInitialState();
  } catch {
    return buildInitialState();
  }
}

let state = loadState();
let selectedSwitchAccountId = null;
let messageEditTarget = null;
let replyTarget = null;
let slashSelectionIndex = 0;
let mentionSelectionIndex = 0;
let contextMenuOpen = false;
let contextMenuFocusIndex = 0;
let contextMenuSubmenuAnchor = null;
let channelFilterTerm = "";
let dmSearchTerm = "";
let selectedUserPopoutId = null;
let mediaPickerOpen = false;
let mediaPickerTab = "gif";
let mediaPickerQuery = "";
let swfLibrary = [];
const debugLogs = [];
const xmppDebugEvents = [];
let xmppDebugPaused = false;
let xmppDebugFilter = "all";
let xmppDebugSearch = "";
let swfShelfOpen = false;
let currentViewerSwf = null;
let currentViewerRuntimeKey = null;
let fullscreenRuntimeKey = null;
let swfAudioFocusRuntimeKey = null;
let swfSoloRuntimeKey = null;
const swfRuntimes = new Map();
const swfPendingAudio = new Map();
const swfPendingUi = new Map();
let swfRuntimeParkingRoot = null;
const swfPipTabs = [];
let swfPipActiveKey = null;
let swfPipManuallyHidden = false;
let swfPipCollapsed = false;
let swfPreviewBootstrapInFlight = false;
let mediaPickerRenderToken = 0;
let mediaRuntimeWarmed = false;
let pipDragState = null;
let pipSuppressHeaderToggle = false;
let toastHideTimer = null;
let composerPendingAttachment = null;
let composerPendingAttachments = [];
let composerDraftConversationId = null;
let composerDraftSaveTimer = null;
let composerMetaRefreshTimer = null;
let scheduledDispatchTimer = null;
let memberSearchTerm = "";
let memberPresenceFilter = "all";
let quickSwitchQuery = "";
let quickSwitchSelectionIndex = 0;
let findQuery = "";
let findAuthorFilter = "";
let findAfterFilter = "";
let findBeforeFilter = "";
let findHasLinkOnly = false;
let findSelectionIndex = 0;
let cosmeticsTab = "decor";
let pinsSearchTerm = "";
let pinsSortMode = "latest";
let loginLocalXmppProfiles = [];
let loginLocalXmppProfilesLoadedOnce = false;
let loginXmppDiscoveryToken = 0;
let relaySocket = null;
let relayEventSource = null;
let xmppConnection = null;
let xmppRuntimeReady = false;
let xmppLoadingPromise = null;
let xmppRuntimeLastError = "";
const xmppWsDiscoveryCache = new Map();
const xmppRoomByJid = new Map();
const xmppRosterByJid = new Map();
let relayStatus = "disconnected";
let relayLastError = "";
let relayJoinedRoom = "";
let relayManualDisconnect = false;
let relayReconnectTimer = null;
const relaySeenMessageIds = new Set();
const relayTypingByRoom = new Map();
let relayTypingSweepTimer = null;
const relayLocalTypingState = {
  room: "",
  active: false,
  lastSentAt: 0
};

const ui = {
  loginScreen: document.getElementById("loginScreen"),
  chatScreen: document.getElementById("chatScreen"),
  loginForm: document.getElementById("loginForm"),
  loginLocalProfileWrap: document.getElementById("loginLocalProfileWrap"),
  loginLocalProfileSelect: document.getElementById("loginLocalProfileSelect"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginXmppServer: document.getElementById("loginXmppServer"),
  loginRememberInput: document.getElementById("loginRememberInput"),
  loginProvidersBtn: document.getElementById("loginProvidersBtn"),
  loginRegisterBtn: document.getElementById("loginRegisterBtn"),
  loginXmppConsoleBtn: document.getElementById("loginXmppConsoleBtn"),
  serverBrand: document.getElementById("serverBrand"),
  serverBrandBadge: document.getElementById("serverBrandBadge"),
  serverList: document.getElementById("serverList"),
  dmSection: document.getElementById("dmSection"),
  guildSection: document.getElementById("guildSection"),
  toggleDmSectionBtn: document.getElementById("toggleDmSectionBtn"),
  toggleGuildSectionBtn: document.getElementById("toggleGuildSectionBtn"),
  toggleDmSectionChevron: document.getElementById("toggleDmSectionChevron"),
  toggleGuildSectionChevron: document.getElementById("toggleGuildSectionChevron"),
  channelList: document.getElementById("channelList"),
  dmList: document.getElementById("dmList"),
  dmSearchInput: document.getElementById("dmSearchInput"),
  newDmBtn: document.getElementById("newDmBtn"),
  channelFilterInput: document.getElementById("channelFilterInput"),
  memberList: document.getElementById("memberList"),
  memberPanelTitle: document.getElementById("memberPanelTitle"),
  memberSearchInput: document.getElementById("memberSearchInput"),
  memberPresenceFilterButtons: [...document.querySelectorAll(".member-filter-btn")],
  activeServerName: document.getElementById("activeServerName"),
  openGuildSettingsBtn: document.getElementById("openGuildSettingsBtn"),
  activeChannelName: document.getElementById("activeChannelName"),
  activeChannelGlyph: document.getElementById("activeChannelGlyph"),
  activeChannelLabel: document.getElementById("activeChannelLabel"),
  activeChannelTopic: document.getElementById("activeChannelTopic"),
  relayHeaderBadge: document.getElementById("relayHeaderBadge"),
  markChannelReadBtn: document.getElementById("markChannelReadBtn"),
  nextUnreadBtn: document.getElementById("nextUnreadBtn"),
  openChannelSettingsBtn: document.getElementById("openChannelSettingsBtn"),
  openPinsBtn: document.getElementById("openPinsBtn"),
  openRolesBtn: document.getElementById("openRolesBtn"),
  openFindBtn: document.getElementById("openFindBtn"),
  openShortcutsBtn: document.getElementById("openShortcutsBtn"),
  toggleChannelPanelBtn: document.getElementById("toggleChannelPanelBtn"),
  toggleMemberPanelBtn: document.getElementById("toggleMemberPanelBtn"),
  toggleSwfShelfBtn: document.getElementById("toggleSwfShelfBtn"),
  editTopicBtn: document.getElementById("editTopicBtn"),
  messageList: document.getElementById("messageList"),
  jumpToBottomBtn: document.getElementById("jumpToBottomBtn"),
  channelPanel: document.getElementById("channelPanel"),
  memberPanel: document.getElementById("memberPanel"),
  swfShelf: document.getElementById("swfShelf"),
  swfShelfList: document.getElementById("swfShelfList"),
  clearSwfShelfBtn: document.getElementById("clearSwfShelfBtn"),
  messageForm: document.getElementById("messageForm"),
  messageInput: document.getElementById("messageInput"),
  composerSystemNotice: document.getElementById("composerSystemNotice"),
  composerTypingNote: document.getElementById("composerTypingNote"),
  composerCharCount: document.getElementById("composerCharCount"),
  slashCommandPopup: document.getElementById("slashCommandPopup"),
  suggestionHint: document.getElementById("suggestionHint"),
  slashCommandList: document.getElementById("slashCommandList"),
  mediaPicker: document.getElementById("mediaPicker"),
  mediaSearchInput: document.getElementById("mediaSearchInput"),
  mediaGrid: document.getElementById("mediaGrid"),
  addMediaUrlBtn: document.getElementById("addMediaUrlBtn"),
  addMediaFileBtn: document.getElementById("addMediaFileBtn"),
  mediaFileInput: document.getElementById("mediaFileInput"),
  mediaTabs: [...document.querySelectorAll(".media-picker__tab")],
  openMediaPickerBtn: document.getElementById("openMediaPickerBtn"),
  openGifPickerBtn: document.getElementById("openGifPickerBtn"),
  openStickerPickerBtn: document.getElementById("openStickerPickerBtn"),
  openEmojiPickerBtn: document.getElementById("openEmojiPickerBtn"),
  quickFileAttachBtn: document.getElementById("quickFileAttachBtn"),
  quickAttachInput: document.getElementById("quickAttachInput"),
  toggleSwfAudioBtn: document.getElementById("toggleSwfAudioBtn"),
  composerReplyBar: document.getElementById("composerReplyBar"),
  replyPreviewText: document.getElementById("replyPreviewText"),
  cancelReplyBtn: document.getElementById("cancelReplyBtn"),
  composerAttachmentBar: document.getElementById("composerAttachmentBar"),
  composerAttachmentText: document.getElementById("composerAttachmentText"),
  composerAttachmentList: document.getElementById("composerAttachmentList"),
  saveComposerAttachmentBtn: document.getElementById("saveComposerAttachmentBtn"),
  clearComposerAttachmentBtn: document.getElementById("clearComposerAttachmentBtn"),
  findDialog: document.getElementById("findDialog"),
  findForm: document.getElementById("findForm"),
  findInput: document.getElementById("findInput"),
  findAuthorInput: document.getElementById("findAuthorInput"),
  findAfterInput: document.getElementById("findAfterInput"),
  findBeforeInput: document.getElementById("findBeforeInput"),
  findHasLinkInput: document.getElementById("findHasLinkInput"),
  findMeta: document.getElementById("findMeta"),
  findList: document.getElementById("findList"),
  findPrevBtn: document.getElementById("findPrevBtn"),
  findNextBtn: document.getElementById("findNextBtn"),
  findCancel: document.getElementById("findCancel"),
  quickSwitchDialog: document.getElementById("quickSwitchDialog"),
  quickSwitchForm: document.getElementById("quickSwitchForm"),
  quickSwitchInput: document.getElementById("quickSwitchInput"),
  quickSwitchList: document.getElementById("quickSwitchList"),
  quickSwitchCancel: document.getElementById("quickSwitchCancel"),
  settingsScreen: document.getElementById("settingsScreen"),
  dockAvatar: document.getElementById("dockAvatar"),
  dockPresenceDot: document.getElementById("dockPresenceDot"),
  dockName: document.getElementById("dockName"),
  dockStatus: document.getElementById("dockStatus"),
  selfProfileBtn: document.getElementById("selfProfileBtn"),
  dockMuteBtn: document.getElementById("dockMuteBtn"),
  dockHeadphonesBtn: document.getElementById("dockHeadphonesBtn"),
  openSettingsBtn: document.getElementById("openSettingsBtn"),
  createServerBtn: document.getElementById("createServerBtn"),
  createChannelBtn: document.getElementById("createChannelBtn"),
  profileDialog: document.getElementById("profileDialog"),
  profileForm: document.getElementById("profileForm"),
  displayNameInput: document.getElementById("displayNameInput"),
  profileBioInput: document.getElementById("profileBioInput"),
  profileStatusInput: document.getElementById("profileStatusInput"),
  profileStatusEmojiInput: document.getElementById("profileStatusEmojiInput"),
  profileAvatarDecorationInput: document.getElementById("profileAvatarDecorationInput"),
  profileGuildTagInput: document.getElementById("profileGuildTagInput"),
  profileEffectInput: document.getElementById("profileEffectInput"),
  profileNameplateSvgInput: document.getElementById("profileNameplateSvgInput"),
  profileStatusExpiryInput: document.getElementById("profileStatusExpiryInput"),
  profileGuildNicknameInput: document.getElementById("profileGuildNicknameInput"),
  profileGuildAvatarInput: document.getElementById("profileGuildAvatarInput"),
  profileGuildAvatarColorPicker: document.getElementById("profileGuildAvatarColorPicker"),
  profileGuildAvatarUrlInput: document.getElementById("profileGuildAvatarUrlInput"),
  profileGuildBannerInput: document.getElementById("profileGuildBannerInput"),
  profileGuildStatusInput: document.getElementById("profileGuildStatusInput"),
  presenceInput: document.getElementById("presenceInput"),
  profileBannerInput: document.getElementById("profileBannerInput"),
  profileAvatarInput: document.getElementById("profileAvatarInput"),
  profileAvatarColorPicker: document.getElementById("profileAvatarColorPicker"),
  profileAvatarUrlInput: document.getElementById("profileAvatarUrlInput"),
  profileAvatarPreview: document.getElementById("profileAvatarPreview"),
  profileIdentityPreview: document.getElementById("profileIdentityPreview"),
  profileIdentityPreviewBanner: document.getElementById("profileIdentityPreviewBanner"),
  profileIdentityPreviewAvatar: document.getElementById("profileIdentityPreviewAvatar"),
  profileIdentityPreviewName: document.getElementById("profileIdentityPreviewName"),
  profileIdentityPreviewStatus: document.getElementById("profileIdentityPreviewStatus"),
  profileIdentityClearBtn: document.getElementById("profileIdentityClearBtn"),
  profileOpenCosmeticsBtn: document.getElementById("profileOpenCosmeticsBtn"),
  profileAvatarUploadBtn: document.getElementById("profileAvatarUploadBtn"),
  profileAvatarClearBtn: document.getElementById("profileAvatarClearBtn"),
  profileAvatarUploadHint: document.getElementById("profileAvatarUploadHint"),
  profileAvatarFileInput: document.getElementById("profileAvatarFileInput"),
  profileCancel: document.getElementById("profileCancel"),
  createServerDialog: document.getElementById("createServerDialog"),
  createServerForm: document.getElementById("createServerForm"),
  serverTemplateInput: document.getElementById("serverTemplateInput"),
  serverStarterChannelsInput: document.getElementById("serverStarterChannelsInput"),
  serverNameInput: document.getElementById("serverNameInput"),
  serverCancel: document.getElementById("serverCancel"),
  guildSettingsDialog: document.getElementById("guildSettingsDialog"),
  guildSettingsForm: document.getElementById("guildSettingsForm"),
  guildSettingsNameInput: document.getElementById("guildSettingsNameInput"),
  guildSettingsDescriptionInput: document.getElementById("guildSettingsDescriptionInput"),
  guildSettingsAccentInput: document.getElementById("guildSettingsAccentInput"),
  guildSettingsAccentPicker: document.getElementById("guildSettingsAccentPicker"),
  guildSettingsCancel: document.getElementById("guildSettingsCancel"),
  deleteGuildBtn: document.getElementById("deleteGuildBtn"),
  createChannelDialog: document.getElementById("createChannelDialog"),
  createChannelForm: document.getElementById("createChannelForm"),
  channelNameInput: document.getElementById("channelNameInput"),
  channelTypeInput: document.getElementById("channelTypeInput"),
  channelCancel: document.getElementById("channelCancel"),
  topicDialog: document.getElementById("topicDialog"),
  topicForm: document.getElementById("topicForm"),
  topicInput: document.getElementById("topicInput"),
  topicCancel: document.getElementById("topicCancel"),
  messageEditDialog: document.getElementById("messageEditDialog"),
  messageEditForm: document.getElementById("messageEditForm"),
  messageEditInput: document.getElementById("messageEditInput"),
  shortcutsDialog: document.getElementById("shortcutsDialog"),
  messageEditCancel: document.getElementById("messageEditCancel"),
  selfMenuDialog: document.getElementById("selfMenuDialog"),
  selfPopoutBanner: document.getElementById("selfPopoutBanner"),
  selfPopoutAvatar: document.getElementById("selfPopoutAvatar"),
  selfPopoutName: document.getElementById("selfPopoutName"),
  selfPopoutStatus: document.getElementById("selfPopoutStatus"),
  selfPopoutBio: document.getElementById("selfPopoutBio"),
  selfPopoutRoles: document.getElementById("selfPopoutRoles"),
  selfEditProfile: document.getElementById("selfEditProfile"),
  selfCosmeticsShop: document.getElementById("selfCosmeticsShop"),
  selfQuestStats: document.getElementById("selfQuestStats"),
  selfSwitchAccount: document.getElementById("selfSwitchAccount"),
  selfLogout: document.getElementById("selfLogout"),
  userPopoutDialog: document.getElementById("userPopoutDialog"),
  userPopoutBanner: document.getElementById("userPopoutBanner"),
  userPopoutAvatar: document.getElementById("userPopoutAvatar"),
  userPopoutName: document.getElementById("userPopoutName"),
  userPopoutStatus: document.getElementById("userPopoutStatus"),
  userPopoutBio: document.getElementById("userPopoutBio"),
  userPopoutRoles: document.getElementById("userPopoutRoles"),
  userNoteInput: document.getElementById("userNoteInput"),
  userDmInput: document.getElementById("userDmInput"),
  userStartDmBtn: document.getElementById("userStartDmBtn"),
  userSendDmBtn: document.getElementById("userSendDmBtn"),
  userSaveNoteBtn: document.getElementById("userSaveNoteBtn"),
  accountSwitchDialog: document.getElementById("accountSwitchDialog"),
  accountSwitchForm: document.getElementById("accountSwitchForm"),
  accountList: document.getElementById("accountList"),
  newAccountInput: document.getElementById("newAccountInput"),
  accountCancel: document.getElementById("accountCancel"),
  xmppProviderDialog: document.getElementById("xmppProviderDialog"),
  xmppProviderList: document.getElementById("xmppProviderList"),
  xmppProviderCloseBtn: document.getElementById("xmppProviderCloseBtn"),
  xmppRegisterDialog: document.getElementById("xmppRegisterDialog"),
  xmppRegisterForm: document.getElementById("xmppRegisterForm"),
  registerJidInput: document.getElementById("registerJidInput"),
  registerPasswordInput: document.getElementById("registerPasswordInput"),
  registerXmppServerInput: document.getElementById("registerXmppServerInput"),
  registerOpenProviderBtn: document.getElementById("registerOpenProviderBtn"),
  registerCancelBtn: document.getElementById("registerCancelBtn"),
  registerSubmitBtn: document.getElementById("registerSubmitBtn"),
  settingsTitle: document.getElementById("settingsTitle"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  settingsDisplayName: document.getElementById("settingsDisplayName"),
  settingsUsername: document.getElementById("settingsUsername"),
  settingsCurrentStatus: document.getElementById("settingsCurrentStatus"),
  settingsEditProfile: document.getElementById("settingsEditProfile"),
  settingsSwitchAccount: document.getElementById("settingsSwitchAccount"),
  settingsLogout: document.getElementById("settingsLogout"),
  settingsOpenProfileEditor: document.getElementById("settingsOpenProfileEditor"),
  guildNotifForm: document.getElementById("guildNotifForm"),
  guildNotifGuildName: document.getElementById("guildNotifGuildName"),
  guildNotifModeInput: document.getElementById("guildNotifModeInput"),
  appearanceForm: document.getElementById("appearanceForm"),
  uiScaleInput: document.getElementById("uiScaleInput"),
  themeInput: document.getElementById("themeInput"),
  compactModeInput: document.getElementById("compactModeInput"),
  advancedForm: document.getElementById("advancedForm"),
  developerModeInput: document.getElementById("developerModeInput"),
  debugOverlayInput: document.getElementById("debugOverlayInput"),
  swfAudioPolicyInput: document.getElementById("swfAudioPolicyInput"),
  swfAudioScopeInput: document.getElementById("swfAudioScopeInput"),
  swfAutoplayInput: document.getElementById("swfAutoplayInput"),
  swfPauseOnMuteInput: document.getElementById("swfPauseOnMuteInput"),
  swfVuMeterInput: document.getElementById("swfVuMeterInput"),
  relayModeInput: document.getElementById("relayModeInput"),
  relayUrlInput: document.getElementById("relayUrlInput"),
  relayRoomInput: document.getElementById("relayRoomInput"),
  relayAutoConnectInput: document.getElementById("relayAutoConnectInput"),
  relayStatusOutput: document.getElementById("relayStatusOutput"),
  relayConnectBtn: document.getElementById("relayConnectBtn"),
  relayDisconnectBtn: document.getElementById("relayDisconnectBtn"),
  xmppJidInput: document.getElementById("xmppJidInput"),
  xmppPasswordInput: document.getElementById("xmppPasswordInput"),
  xmppWsUrlInput: document.getElementById("xmppWsUrlInput"),
  xmppMucServiceInput: document.getElementById("xmppMucServiceInput"),
  exportDataBtn: document.getElementById("exportDataBtn"),
  importDataBtn: document.getElementById("importDataBtn"),
  importDataInput: document.getElementById("importDataInput"),
  exportSwfSavesBtn: document.getElementById("exportSwfSavesBtn"),
  importSwfSavesBtn: document.getElementById("importSwfSavesBtn"),
  importSwfSavesInput: document.getElementById("importSwfSavesInput"),
  openXmppConsoleBtn: document.getElementById("openXmppConsoleBtn"),
  openDebugConsoleBtn: document.getElementById("openDebugConsoleBtn"),
  channelSettingsDialog: document.getElementById("channelSettingsDialog"),
  channelSettingsForm: document.getElementById("channelSettingsForm"),
  channelRenameInput: document.getElementById("channelRenameInput"),
  channelSlowmodeInput: document.getElementById("channelSlowmodeInput"),
  channelPermRoleInput: document.getElementById("channelPermRoleInput"),
  channelPermViewInput: document.getElementById("channelPermViewInput"),
  channelPermSendInput: document.getElementById("channelPermSendInput"),
  channelPermReactInput: document.getElementById("channelPermReactInput"),
  channelPermThreadInput: document.getElementById("channelPermThreadInput"),
  channelSettingsCancel: document.getElementById("channelSettingsCancel"),
  deleteChannelBtn: document.getElementById("deleteChannelBtn"),
  rolesDialog: document.getElementById("rolesDialog"),
  rolesForm: document.getElementById("rolesForm"),
  roleNameInput: document.getElementById("roleNameInput"),
  roleColorInput: document.getElementById("roleColorInput"),
  roleColorPicker: document.getElementById("roleColorPicker"),
  rolePermPresetInput: document.getElementById("rolePermPresetInput"),
  createRoleNowBtn: document.getElementById("createRoleNowBtn"),
  assignRoleMemberInput: document.getElementById("assignRoleMemberInput"),
  assignRoleRoleInput: document.getElementById("assignRoleRoleInput"),
  assignRoleBtn: document.getElementById("assignRoleBtn"),
  removeRoleBtn: document.getElementById("removeRoleBtn"),
  rolesCloseBtn: document.getElementById("rolesCloseBtn"),
  pinsDialog: document.getElementById("pinsDialog"),
  pinsForm: document.getElementById("pinsForm"),
  pinsSearchInput: document.getElementById("pinsSearchInput"),
  pinsSortInput: document.getElementById("pinsSortInput"),
  pinsList: document.getElementById("pinsList"),
  pinsCloseBtn: document.getElementById("pinsCloseBtn"),
  debugDialog: document.getElementById("debugDialog"),
  debugForm: document.getElementById("debugForm"),
  debugOutput: document.getElementById("debugOutput"),
  copyDebugBtn: document.getElementById("copyDebugBtn"),
  refreshDebugBtn: document.getElementById("refreshDebugBtn"),
  clearDebugBtn: document.getElementById("clearDebugBtn"),
  debugCloseBtn: document.getElementById("debugCloseBtn"),
  xmppConsoleDialog: document.getElementById("xmppConsoleDialog"),
  xmppConsoleForm: document.getElementById("xmppConsoleForm"),
  xmppConsoleFilterInput: document.getElementById("xmppConsoleFilterInput"),
  xmppConsoleSearchInput: document.getElementById("xmppConsoleSearchInput"),
  xmppConsoleOutput: document.getElementById("xmppConsoleOutput"),
  copyXmppConsoleBtn: document.getElementById("copyXmppConsoleBtn"),
  refreshXmppConsoleBtn: document.getElementById("refreshXmppConsoleBtn"),
  pauseXmppConsoleBtn: document.getElementById("pauseXmppConsoleBtn"),
  clearXmppConsoleBtn: document.getElementById("clearXmppConsoleBtn"),
  xmppConsoleCloseBtn: document.getElementById("xmppConsoleCloseBtn"),
  cosmeticsDialog: document.getElementById("cosmeticsDialog"),
  cosmeticsForm: document.getElementById("cosmeticsForm"),
  cosmeticsBalance: document.getElementById("cosmeticsBalance"),
  cosmeticsProgress: document.getElementById("cosmeticsProgress"),
  cosmeticsGrid: document.getElementById("cosmeticsGrid"),
  cosmeticsCloseBtn: document.getElementById("cosmeticsCloseBtn"),
  cosmeticsTabs: [...document.querySelectorAll("[data-cosmetics-tab]")],
  swfPipDock: document.getElementById("swfPipDock"),
  swfPipTabs: document.getElementById("swfPipTabs"),
  swfPipHost: document.getElementById("swfPipHost"),
  swfPipCloseBtn: document.getElementById("swfPipCloseBtn"),
  swfViewerDialog: document.getElementById("swfViewerDialog"),
  swfViewerHost: document.getElementById("swfViewerHost"),
  swfViewerTitle: document.getElementById("swfViewerTitle"),
  swfViewerZoomInput: document.getElementById("swfViewerZoomInput"),
  swfViewerPauseBtn: document.getElementById("swfViewerPauseBtn"),
  swfViewerResumeBtn: document.getElementById("swfViewerResumeBtn"),
  swfViewerSaveBtn: document.getElementById("swfViewerSaveBtn"),
  swfViewerCloseBtn: document.getElementById("swfViewerCloseBtn"),
  contextMenu: document.getElementById("contextMenu"),
  settingsNavItems: [...document.querySelectorAll(".settings-nav__item")],
  settingsPanels: [...document.querySelectorAll(".settings-panel")]
};

if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = true;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isSessionPersistenceEnabled() {
  return localStorage.getItem(SESSION_PERSIST_KEY) !== "off";
}

function rememberAccountSession(accountId, remember = true) {
  if (!accountId) return;
  if (!remember) {
    localStorage.setItem(SESSION_PERSIST_KEY, "off");
    localStorage.removeItem(SESSION_ACCOUNT_KEY);
    return;
  }
  localStorage.setItem(SESSION_PERSIST_KEY, "on");
  localStorage.setItem(SESSION_ACCOUNT_KEY, accountId);
}

function clearRememberedAccountSession() {
  localStorage.removeItem(SESSION_ACCOUNT_KEY);
}

function getCurrentAccount() {
  return state.accounts.find((account) => account.id === state.currentAccountId) || null;
}

function getAccountById(accountId) {
  return state.accounts.find((account) => account.id === accountId) || null;
}

function getAccountByUsername(username) {
  return state.accounts.find((account) => account.username === username) || null;
}

function getActiveGuild() {
  return state.guilds.find((guild) => guild.id === state.activeGuildId) || null;
}

function getActiveServer() {
  return getActiveGuild();
}

function getActiveChannel() {
  const guild = getActiveGuild();
  if (!guild) return null;
  return guild.channels.find((channel) => channel.id === state.activeChannelId) || null;
}

function getPreferredGuildChannelId(guildId) {
  if (!guildId) return "";
  const prefs = getPreferences();
  return (prefs.lastChannelByGuild?.[guildId] || "").toString();
}

function rememberGuildChannelSelection(guildId, channelId) {
  if (!guildId || !channelId) return;
  state.preferences = getPreferences();
  state.preferences.lastChannelByGuild = {
    ...(state.preferences.lastChannelByGuild || {}),
    [guildId]: channelId
  };
}

function getActiveDmThread() {
  if (!state.activeDmId) return null;
  return state.dmThreads.find((thread) => thread.id === state.activeDmId) || null;
}

function getViewMode() {
  return state.viewMode === "dm" ? "dm" : "guild";
}

function getActiveConversation() {
  if (getViewMode() === "dm") {
    const dm = getActiveDmThread();
    if (dm) return { type: "dm", thread: dm, id: dm.id };
    return null;
  }
  const channel = getActiveChannel();
  if (!channel) return null;
  return { type: "channel", channel, id: channel.id };
}

function ensureComposerDraftsStore() {
  if (!state.composerDrafts || typeof state.composerDrafts !== "object") {
    state.composerDrafts = {};
  }
  return state.composerDrafts;
}

function setComposerDraft(conversationId, text) {
  if (!conversationId) return;
  const drafts = ensureComposerDraftsStore();
  const next = (text || "").toString().slice(0, 400);
  if (next.trim()) {
    drafts[conversationId] = next;
    return;
  }
  delete drafts[conversationId];
}

function getComposerDraft(conversationId) {
  if (!conversationId) return "";
  const drafts = ensureComposerDraftsStore();
  return (drafts[conversationId] || "").toString().slice(0, 400);
}

function hasDraftForConversation(conversationId) {
  return Boolean(getComposerDraft(conversationId).trim());
}

function countDraftsForGuildChannels(guild) {
  if (!guild || !Array.isArray(guild.channels)) return 0;
  return guild.channels.reduce((acc, channel) => acc + (hasDraftForConversation(channel.id) ? 1 : 0), 0);
}

function countDraftsForCurrentAccountDms(account) {
  if (!account) return 0;
  return state.dmThreads.reduce((acc, thread) => {
    if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(account.id)) return acc;
    return acc + (hasDraftForConversation(thread.id) ? 1 : 0);
  }, 0);
}

function queueComposerDraftSave() {
  if (composerDraftSaveTimer) clearTimeout(composerDraftSaveTimer);
  composerDraftSaveTimer = setTimeout(() => {
    composerDraftSaveTimer = null;
    saveState();
  }, 250);
}

function syncComposerDraftConversation(nextConversationId) {
  const previousId = composerDraftConversationId;
  if (previousId && previousId !== nextConversationId) {
    setComposerDraft(previousId, ui.messageInput.value);
  }
  composerDraftConversationId = nextConversationId || null;
  const nextDraft = nextConversationId ? getComposerDraft(nextConversationId) : "";
  if ((ui.messageInput.value || "") !== nextDraft) {
    ui.messageInput.value = nextDraft;
  }
  resizeComposerInput();
}

function getUserNoteKey(ownerId, targetId) {
  return `${ownerId || ""}:${targetId || ""}`;
}

function getUserNote(ownerId, targetId) {
  if (!ownerId || !targetId) return "";
  return (state.userNotes?.[getUserNoteKey(ownerId, targetId)] || "").toString();
}

function setUserNote(ownerId, targetId, text) {
  if (!ownerId || !targetId) return;
  if (!state.userNotes || typeof state.userNotes !== "object") state.userNotes = {};
  state.userNotes[getUserNoteKey(ownerId, targetId)] = (text || "").toString().trim().slice(0, 240);
}

function getDmUnreadStats(thread, account) {
  if (!thread || !account) return { unread: 0, mentions: 0 };
  const lastReadMs = toTimestampMs(thread.readState?.[account.id]);
  let unread = 0;
  let mentions = 0;
  thread.messages.forEach((message) => {
    if (toTimestampMs(message.ts) <= lastReadMs) return;
    if (message.userId && message.userId === account.id) return;
    unread += 1;
    if (messageMentionsAccount(message.text, account)) mentions += 1;
  });
  return { unread, mentions };
}

function getTotalDmUnreadStats(account) {
  if (!account) return { unread: 0, mentions: 0 };
  return state.dmThreads.reduce((acc, thread) => {
    if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(account.id)) return acc;
    const stats = getDmUnreadStats(thread, account);
    return {
      unread: acc.unread + stats.unread,
      mentions: acc.mentions + stats.mentions
    };
  }, { unread: 0, mentions: 0 });
}

function ensureDmReadState(thread) {
  if (!thread || (thread.readState && typeof thread.readState === "object")) return;
  thread.readState = {};
}

function markDmRead(thread, accountId) {
  if (!thread || !accountId) return false;
  ensureDmReadState(thread);
  const newestTs = thread.messages[thread.messages.length - 1]?.ts || new Date().toISOString();
  const currentMs = toTimestampMs(thread.readState[accountId]);
  const nextMs = toTimestampMs(newestTs);
  if (nextMs <= currentMs) return false;
  thread.readState[accountId] = newestTs;
  return true;
}

function getOrCreateDmThread(accountA, accountB) {
  if (!accountA?.id || !accountB?.id || accountA.id === accountB.id) return null;
  let thread = state.dmThreads.find((entry) => {
    if (!Array.isArray(entry.participantIds)) return false;
    return entry.participantIds.includes(accountA.id) && entry.participantIds.includes(accountB.id);
  });
  if (thread) return thread;
  thread = {
    id: createId(),
    participantIds: [accountA.id, accountB.id],
    readState: {
      [accountA.id]: new Date().toISOString(),
      [accountB.id]: new Date().toISOString()
    },
    messages: []
  };
  state.dmThreads.unshift(thread);
  return thread;
}

function openDmWithAccount(targetAccount) {
  const current = getCurrentAccount();
  if (!current || !targetAccount || current.id === targetAccount.id) return;
  const thread = getOrCreateDmThread(current, targetAccount);
  if (!thread) return;
  state.viewMode = "dm";
  state.activeDmId = thread.id;
  saveState();
  render();
}

function sendDirectMessageToAccount(targetAccount, text) {
  const current = getCurrentAccount();
  const body = (text || "").trim().slice(0, 400);
  if (!current || !targetAccount || targetAccount.id === current.id || !body) return false;
  const thread = getOrCreateDmThread(current, targetAccount);
  if (!thread) return false;
  thread.messages.push({
    id: createId(),
    userId: current.id,
    authorName: "",
    text: body,
    ts: new Date().toISOString(),
    reactions: [],
    attachments: [],
    replyTo: null
  });
  state.viewMode = "dm";
  state.activeDmId = thread.id;
  saveState();
  render();
  return true;
}

function getServerRoles(server) {
  if (!server) return [];
  return Array.isArray(server.roles) ? server.roles : [];
}

function getMemberRoleIds(server, accountId) {
  if (!server || !accountId) return [];
  if (!server.memberRoles || typeof server.memberRoles !== "object") return [];
  return Array.isArray(server.memberRoles[accountId]) ? server.memberRoles[accountId] : [];
}

function getMemberRoles(server, accountId) {
  const roleIds = getMemberRoleIds(server, accountId);
  const roles = getServerRoles(server);
  return roleIds
    .map((roleId) => roles.find((role) => role.id === roleId))
    .filter(Boolean);
}

function hasServerPermission(server, accountId, permissionKey) {
  const roles = getMemberRoles(server, accountId);
  if (roles.some((role) => role.permissions?.administrator)) return true;
  return roles.some((role) => Boolean(role.permissions?.[permissionKey]));
}

function ensureChannelPermissionOverrides(channel, server = null) {
  if (!channel || typeof channel !== "object") return;
  const roleIds = Array.isArray(server?.roles) ? server.roles.map((role) => role.id) : [];
  channel.permissionOverrides = normalizeChannelPermissionOverrides(channel.permissionOverrides, roleIds);
}

function getChannelPermissionOverride(channel, roleId, permissionKey) {
  if (!channel || !roleId || !permissionKey) return "inherit";
  const value = channel.permissionOverrides?.[roleId]?.[permissionKey];
  return normalizeChannelPermissionValue(value);
}

function setChannelPermissionOverride(channel, roleId, permissionKey, value) {
  if (!channel || !roleId || !permissionKey) return;
  ensureChannelPermissionOverrides(channel, getActiveServer());
  if (!channel.permissionOverrides || typeof channel.permissionOverrides !== "object") {
    channel.permissionOverrides = {};
  }
  const nextValue = normalizeChannelPermissionValue(value);
  if (!channel.permissionOverrides[roleId]) channel.permissionOverrides[roleId] = {};
  if (nextValue === "inherit") {
    delete channel.permissionOverrides[roleId][permissionKey];
  } else {
    channel.permissionOverrides[roleId][permissionKey] = nextValue;
  }
  if (Object.keys(channel.permissionOverrides[roleId]).length === 0) {
    delete channel.permissionOverrides[roleId];
  }
}

function hasChannelPermission(server, channel, accountId, permissionKey) {
  if (!channel || !permissionKey) return false;
  if (!server || !accountId) return true;
  if (hasServerPermission(server, accountId, "administrator")) return true;
  ensureChannelPermissionOverrides(channel, server);
  const roleIds = getMemberRoleIds(server, accountId);
  if (roleIds.length === 0) return false;
  let allow = false;
  for (const roleId of roleIds) {
    const value = getChannelPermissionOverride(channel, roleId, permissionKey);
    if (value === "deny") return false;
    if (value === "allow") allow = true;
  }
  if (allow) return true;
  return true;
}

function canAccountViewChannel(server, channel, accountId) {
  return hasChannelPermission(server, channel, accountId, "viewChannel");
}

function canCurrentUserViewChannel(channel, server = getActiveServer()) {
  const account = getCurrentAccount();
  if (!account) return false;
  return canAccountViewChannel(server, channel, account.id);
}

function canCurrentUserReactInChannel(channel, server = getActiveServer()) {
  const account = getCurrentAccount();
  if (!account) return false;
  if (!canAccountViewChannel(server, channel, account.id)) return false;
  return hasChannelPermission(server, channel, account.id, "addReactions");
}

function canCurrentUserCreateThreadsInChannel(channel, server = getActiveServer()) {
  const account = getCurrentAccount();
  if (!account) return false;
  if (!canAccountViewChannel(server, channel, account.id)) return false;
  return hasChannelPermission(server, channel, account.id, "createThreads");
}

function canCurrentUser(permissionKey) {
  const account = getCurrentAccount();
  const server = getActiveServer();
  if (!account || !server) return false;
  return hasServerPermission(server, account.id, permissionKey);
}

function notifyPermissionDenied(permissionLabel) {
  const channel = getActiveChannel();
  if (!channel) return;
  addSystemMessage(channel, `Missing permission: ${permissionLabel}`);
  saveState();
  renderMessages();
}

function findChannelById(channelId) {
  for (const server of state.guilds) {
    const found = server.channels.find((channel) => channel.id === channelId);
    if (found) return found;
  }
  return null;
}

function findGuildByChannelId(channelId) {
  for (const guild of state.guilds) {
    if (guild.channels.some((channel) => channel.id === channelId)) return guild;
  }
  return null;
}

function applyHashConversationNavigation() {
  const ref = parseHashMessageReference();
  if (!ref) return false;
  const dm = state.dmThreads.find((thread) => thread.id === ref.conversationId);
  if (dm) {
    let changed = false;
    if (state.viewMode !== "dm") {
      state.viewMode = "dm";
      changed = true;
    }
    if (state.activeDmId !== dm.id) {
      state.activeDmId = dm.id;
      changed = true;
    }
    return changed;
  }
  const channel = findChannelById(ref.conversationId);
  if (!channel) return false;
  const guild = findGuildByChannelId(channel.id);
  if (!guild) return false;
  let changed = false;
  if (state.viewMode !== "guild") {
    state.viewMode = "guild";
    changed = true;
  }
  if (state.activeGuildId !== guild.id) {
    state.activeGuildId = guild.id;
    changed = true;
  }
  if (state.activeChannelId !== channel.id) {
    state.activeChannelId = channel.id;
    changed = true;
  }
  if (state.activeDmId) {
    state.activeDmId = null;
    changed = true;
  }
  return changed;
}

function findMessageInChannel(channel, messageId) {
  if (!channel) return null;
  return channel.messages.find((message) => message.id === messageId) || null;
}

function ensureChannelReadState(channel) {
  if (!channel || (channel.readState && typeof channel.readState === "object")) return false;
  channel.readState = {};
  return true;
}

function markChannelRead(channel, accountId) {
  if (!channel || !accountId) return false;
  ensureChannelReadState(channel);
  const newestTs = channel.messages[channel.messages.length - 1]?.ts || new Date().toISOString();
  const currentMs = toTimestampMs(channel.readState[accountId]);
  const nextMs = toTimestampMs(newestTs);
  if (nextMs <= currentMs) return false;
  channel.readState[accountId] = newestTs;
  return true;
}

function markGuildRead(guild, accountId) {
  if (!guild || !accountId) return false;
  let changed = false;
  guild.channels.forEach((channel) => {
    if (markChannelRead(channel, accountId)) changed = true;
  });
  return changed;
}

function markAllReadForAccount(accountId) {
  if (!accountId) return false;
  let changed = false;
  state.guilds.forEach((guild) => {
    if (markGuildRead(guild, accountId)) changed = true;
  });
  state.dmThreads.forEach((thread) => {
    if (markDmRead(thread, accountId)) changed = true;
  });
  return changed;
}

function messageMentionsAccount(messageText, account) {
  if (!account || !messageText) return false;
  const mentionPattern = new RegExp(`(^|\\s)@${escapeRegExp(account.username)}(?=\\b|\\s|$)`, "i");
  return mentionPattern.test(messageText);
}

function messageRepliesToAccount(message, account) {
  if (!message || !account || !message.replyTo) return false;
  const replyText = (message.replyTo.authorName || "").toString().trim().toLowerCase();
  if (replyText && replyText === account.username.toLowerCase()) return true;
  if (!message.replyTo.messageId) return false;
  const conversation = getActiveConversation();
  const bucket = conversation?.type === "dm"
    ? (conversation.thread?.messages || [])
    : (conversation?.channel?.messages || []);
  const target = bucket.find((entry) => entry.id === message.replyTo.messageId);
  return Boolean(target?.userId && target.userId === account.id);
}

function isMessageHighlightedForAccount(message, account) {
  if (!message || !account) return false;
  if (message.userId && message.userId === account.id) return false;
  return messageMentionsAccount(message.text, account) || messageRepliesToAccount(message, account);
}

function searchableMessageText(message, channelType = "text") {
  if (!message) return "";
  const raw = (message.text || "").toString();
  if (channelType === "forum" && !message.forumThreadId) {
    const parts = forumMessageParts(message);
    return `${parts.title}\n${parts.body || ""}`.trim();
  }
  return raw;
}

function parseFindDateInput(value, endOfDay = false) {
  const raw = (value || "").toString().trim();
  if (!raw) return 0;
  const parsed = new Date(`${raw}T00:00:00`);
  if (!Number.isFinite(parsed.getTime())) return 0;
  if (endOfDay) parsed.setHours(23, 59, 59, 999);
  return parsed.getTime();
}

function buildFindSpec(query = findQuery) {
  return {
    term: (query || "").trim().toLowerCase(),
    author: (findAuthorFilter || "").trim().replace(/^@/, "").toLowerCase(),
    afterMs: parseFindDateInput(findAfterFilter, false),
    beforeMs: parseFindDateInput(findBeforeFilter, true),
    hasLink: Boolean(findHasLinkOnly)
  };
}

function extractFindInlineFilters(rawQuery) {
  const source = (rawQuery || "").toString().trim();
  if (!source) return { query: "", author: "", after: "", before: "", hasLink: false };
  const authorParts = [];
  const keepParts = [];
  let after = "";
  let before = "";
  let hasLink = false;
  source.split(/\s+/).forEach((part) => {
    const token = part.trim();
    if (!token) return;
    const fromMatch = token.match(/^from:(.+)$/i);
    if (fromMatch) {
      authorParts.push(fromMatch[1].replace(/^@/, ""));
      return;
    }
    const afterMatch = token.match(/^after:(\d{4}-\d{2}-\d{2})$/i);
    if (afterMatch) {
      after = afterMatch[1];
      return;
    }
    const beforeMatch = token.match(/^before:(\d{4}-\d{2}-\d{2})$/i);
    if (beforeMatch) {
      before = beforeMatch[1];
      return;
    }
    if (/^has:link$/i.test(token)) {
      hasLink = true;
      return;
    }
    keepParts.push(token);
  });
  return {
    query: keepParts.join(" "),
    author: authorParts.join(" ").slice(0, 32),
    after,
    before,
    hasLink
  };
}

function hasActiveFindSpec(spec) {
  if (!spec) return false;
  return Boolean(spec.term || spec.author || spec.afterMs || spec.beforeMs || spec.hasLink);
}

function messageHasLink(message, channelType = "text") {
  if (!message) return false;
  const text = searchableMessageText(message, channelType);
  if (/(https?:\/\/|www\.)/i.test(text)) return true;
  const attachments = normalizeAttachments(message.attachments);
  return attachments.some((attachment) => /^https?:\/\//i.test((attachment?.url || "").toString()));
}

function messageMatchesFindSpec(message, spec, channelType = "text") {
  if (!message || !spec) return false;
  const haystack = searchableMessageText(message, channelType).toLowerCase();
  if (spec.term && !haystack.includes(spec.term)) return false;
  if (spec.author) {
    const authorName = displayNameForMessage(message).toLowerCase();
    const authorAccount = message.userId ? getAccountById(message.userId) : null;
    const authorUsername = (authorAccount?.username || "").toLowerCase();
    if (!authorName.includes(spec.author) && !authorUsername.includes(spec.author)) return false;
  }
  if (spec.hasLink && !messageHasLink(message, channelType)) return false;
  const tsMs = toTimestampMs(message.ts);
  if (spec.afterMs && tsMs < spec.afterMs) return false;
  if (spec.beforeMs && tsMs > spec.beforeMs) return false;
  return true;
}

function messageMatchesFindQuery(message, query, channelType = "text", specOverride = null) {
  const spec = specOverride || buildFindSpec(query);
  if (!hasActiveFindSpec(spec)) return false;
  return messageMatchesFindSpec(message, spec, channelType);
}

function formatFindSpecSummary(spec) {
  const parts = [];
  if (spec.term) parts.push(`text "${spec.term}"`);
  if (spec.author) parts.push(`from @${spec.author}`);
  if (spec.afterMs) parts.push(`after ${new Date(spec.afterMs).toLocaleDateString()}`);
  if (spec.beforeMs) parts.push(`before ${new Date(spec.beforeMs).toLocaleDateString()}`);
  if (spec.hasLink) parts.push("has link");
  return parts.join(" · ");
}

function getFindMatchesForConversation(conversation, query) {
  const spec = buildFindSpec(query);
  if (!conversation || !hasActiveFindSpec(spec)) return [];
  const isDm = conversation.type === "dm";
  const channelType = isDm ? "text" : (conversation.channel?.type || "text");
  const bucket = isDm ? (conversation.thread?.messages || []) : (conversation.channel?.messages || []);
  return bucket
    .filter((message) => messageMatchesFindSpec(message, spec, channelType))
    .map((message) => ({
      id: message.id,
      ts: message.ts,
      author: displayNameForMessage(message),
      preview: searchableMessageText(message, channelType).replace(/\s+/g, " ").trim().slice(0, 120)
    }));
}

function getFindActiveMessageId() {
  const conversation = getActiveConversation();
  const matches = getFindMatchesForConversation(conversation, findQuery);
  const selected = matches[findSelectionIndex] || matches[0];
  return selected?.id || null;
}

function renderFindList() {
  if (!ui.findList || !ui.findMeta) return;
  const conversation = getActiveConversation();
  const spec = buildFindSpec(findQuery);
  const matches = getFindMatchesForConversation(conversation, findQuery);
  findSelectionIndex = Math.max(0, Math.min(findSelectionIndex, Math.max(0, matches.length - 1)));
  ui.findList.innerHTML = "";
  if (!hasActiveFindSpec(spec)) {
    ui.findMeta.textContent = "Type text or set filters to search this conversation.";
    return;
  }
  if (matches.length === 0) {
    ui.findMeta.textContent = `No results${formatFindSpecSummary(spec) ? ` for ${formatFindSpecSummary(spec)}` : ""}.`;
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No matching messages found.";
    ui.findList.appendChild(empty);
    return;
  }
  ui.findMeta.textContent = `${findSelectionIndex + 1} of ${matches.length} results${formatFindSpecSummary(spec) ? ` · ${formatFindSpecSummary(spec)}` : ""}`;
  matches.forEach((entry, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `quick-switch-item ${index === findSelectionIndex ? "active" : ""}`;
    const title = document.createElement("strong");
    title.textContent = entry.preview || "(empty message)";
    const meta = document.createElement("small");
    meta.textContent = `${entry.author} · ${formatFullTimestamp(entry.ts || "")}`;
    row.appendChild(title);
    row.appendChild(meta);
    row.addEventListener("mouseenter", () => {
      findSelectionIndex = index;
      renderFindList();
      renderMessages();
    });
    row.addEventListener("click", () => {
      findSelectionIndex = index;
      renderFindList();
      renderMessages();
      focusMessageById(entry.id);
    });
    ui.findList.appendChild(row);
  });
}

function openFindDialog() {
  findQuery = "";
  findAuthorFilter = "";
  findAfterFilter = "";
  findBeforeFilter = "";
  findHasLinkOnly = false;
  findSelectionIndex = 0;
  if (ui.findInput) ui.findInput.value = "";
  if (ui.findAuthorInput) ui.findAuthorInput.value = "";
  if (ui.findAfterInput) ui.findAfterInput.value = "";
  if (ui.findBeforeInput) ui.findBeforeInput.value = "";
  if (ui.findHasLinkInput) ui.findHasLinkInput.checked = false;
  renderFindList();
  ui.findDialog?.showModal();
  requestAnimationFrame(() => ui.findInput?.focus());
}

function openFindDialogWithQuery(query) {
  const inline = extractFindInlineFilters(query);
  const safeQuery = inline.query.slice(0, 120);
  findQuery = safeQuery;
  findAuthorFilter = inline.author || "";
  findAfterFilter = inline.after || "";
  findBeforeFilter = inline.before || "";
  findHasLinkOnly = Boolean(inline.hasLink);
  findSelectionIndex = 0;
  if (ui.findInput) ui.findInput.value = safeQuery;
  if (ui.findAuthorInput) ui.findAuthorInput.value = findAuthorFilter;
  if (ui.findAfterInput) ui.findAfterInput.value = findAfterFilter;
  if (ui.findBeforeInput) ui.findBeforeInput.value = findBeforeFilter;
  if (ui.findHasLinkInput) ui.findHasLinkInput.checked = findHasLinkOnly;
  renderFindList();
  ui.findDialog?.showModal();
  renderMessages();
  if (safeQuery) moveFindSelection(0);
  requestAnimationFrame(() => ui.findInput?.focus());
}

function moveFindSelection(delta) {
  const conversation = getActiveConversation();
  const matches = getFindMatchesForConversation(conversation, findQuery);
  if (matches.length === 0) return;
  findSelectionIndex = (findSelectionIndex + delta + matches.length) % matches.length;
  renderFindList();
  renderMessages();
  focusMessageById(matches[findSelectionIndex].id);
}

function markConversationUnreadFromMessage(conversation, messageId, accountId) {
  if (!conversation || !messageId || !accountId) return false;
  const bucket = conversation.type === "dm"
    ? (conversation.thread?.messages || [])
    : (conversation.channel?.messages || []);
  const index = bucket.findIndex((entry) => entry.id === messageId);
  if (index < 0) return false;
  const previousTs = bucket[index - 1]?.ts || "";
  if (conversation.type === "dm") {
    ensureDmReadState(conversation.thread);
    conversation.thread.readState[accountId] = previousTs;
    return true;
  }
  ensureChannelReadState(conversation.channel);
  conversation.channel.readState[accountId] = previousTs;
  return true;
}

function getChannelUnreadStats(channel, account) {
  if (!channel || !account) return { unread: 0, mentions: 0 };
  ensureChannelReadState(channel);
  const lastReadMs = toTimestampMs(channel.readState[account.id]);
  let unread = 0;
  let mentions = 0;
  channel.messages.forEach((message) => {
    if (toTimestampMs(message.ts) <= lastReadMs) return;
    if (message.userId && message.userId === account.id) return;
    unread += 1;
    if (messageMentionsAccount(message.text, account)) mentions += 1;
  });
  return { unread, mentions };
}

function findFirstUnreadMessageId(channel, account) {
  if (!channel || !account) return null;
  ensureChannelReadState(channel);
  const lastReadMs = toTimestampMs(channel.readState[account.id]);
  const unreadMessage = (Array.isArray(channel.messages) ? channel.messages : []).find((message) => (
    toTimestampMs(message.ts) > lastReadMs && message.userId !== account.id
  ));
  return unreadMessage?.id || null;
}

function ensureChannelSlowmodeState(channel) {
  if (!channel || (channel.slowmodeState && typeof channel.slowmodeState === "object")) return false;
  channel.slowmodeState = {};
  return true;
}

function normalizeSlowmodeSeconds(value) {
  const next = Math.round(Number(value) || 0);
  return Math.max(0, Math.min(3600, next));
}

function getChannelSlowmodeSeconds(channel) {
  return normalizeSlowmodeSeconds(channel?.slowmodeSec || 0);
}

function canCurrentUserPostInChannel(channel, account) {
  if (!channel || !account) return false;
  const server = getActiveServer();
  if (!canAccountViewChannel(server, channel, account.id)) return false;
  if (!hasChannelPermission(server, channel, account.id, "sendMessages")) return false;
  if (channel.type === "voice" || channel.type === "stage") return false;
  if (channel.type === "announcement") {
    return canCurrentUser("manageMessages") || canCurrentUser("administrator");
  }
  return true;
}

function canModerateStageChannel(channel = null) {
  if (channel && channel.type !== "stage") return false;
  return canCurrentUser("stageModeration") || canCurrentUser("manageMessages") || canCurrentUser("administrator");
}

function canModerateVoiceLikeChannel(channel = null) {
  if (channel && channel.type !== "voice" && channel.type !== "stage") return false;
  return canCurrentUser("stageModeration") || canCurrentUser("manageMessages") || canCurrentUser("administrator");
}

function ensureVoiceStateForChannel(channel) {
  if (!channel) return;
  channel.voiceState = normalizeVoiceState(channel.voiceState);
}

function addVoiceActivity(channel, accountId, action, detail = "") {
  if (!channel || !accountId || !action) return;
  ensureVoiceStateForChannel(channel);
  if (!Array.isArray(channel.voiceState.activity)) channel.voiceState.activity = [];
  channel.voiceState.activity.push({
    id: createId(),
    accountId,
    action: action.toString().slice(0, 32),
    detail: detail.toString().slice(0, 120),
    ts: new Date().toISOString()
  });
  if (channel.voiceState.activity.length > 30) {
    channel.voiceState.activity = channel.voiceState.activity.slice(-30);
  }
}

function setVoiceMuteState(channel, accountId, muted) {
  if (!channel || !accountId) return false;
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) return false;
  const hasMuted = channel.voiceState.mutedIds.includes(accountId);
  if (muted && !hasMuted) channel.voiceState.mutedIds.push(accountId);
  if (!muted && hasMuted) channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => id !== accountId);
  return hasMuted !== muted;
}

function setStageRaisedHandState(channel, accountId, raised) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) return false;
  const hasRaised = channel.voiceState.raisedHandIds.includes(accountId);
  if (raised && !hasRaised) channel.voiceState.raisedHandIds.push(accountId);
  if (!raised && hasRaised) channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
  return hasRaised !== raised;
}

function setStageSpeakerState(channel, accountId, speaker) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) return false;
  const isSpeaker = channel.voiceState.speakerIds.includes(accountId);
  if (speaker && !isSpeaker) channel.voiceState.speakerIds.push(accountId);
  if (!speaker && isSpeaker) channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => id !== accountId);
  if (speaker) {
    channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
  }
  return isSpeaker !== speaker;
}

function resolveVoiceParticipantByToken(channel, token, guild) {
  if (!channel || !guild) return null;
  ensureVoiceStateForChannel(channel);
  const needle = (token || "").trim().toLowerCase();
  if (!needle) return null;
  const connected = channel.voiceState.connectedIds
    .map((id) => getAccountById(id))
    .filter(Boolean);
  const byId = connected.find((entry) => entry.id.toLowerCase().startsWith(needle));
  if (byId) return byId;
  const exact = connected.filter((entry) => {
    const username = (entry.username || "").toLowerCase();
    const display = displayNameForAccount(entry, guild.id).toLowerCase();
    return username === needle || display === needle;
  });
  if (exact.length === 1) return exact[0];
  const partial = connected.filter((entry) => {
    const username = (entry.username || "").toLowerCase();
    const display = displayNameForAccount(entry, guild.id).toLowerCase();
    return username.includes(needle) || display.includes(needle);
  });
  return partial.length === 1 ? partial[0] : null;
}

function resolveVoiceChannelByToken(guild, token) {
  if (!guild) return null;
  const needle = (token || "").trim().replace(/^#/, "").toLowerCase();
  if (!needle) return null;
  const pool = (guild.channels || []).filter((entry) => entry.type === "voice" || entry.type === "stage");
  const byId = pool.find((entry) => (entry.id || "").toLowerCase().startsWith(needle));
  if (byId) return byId;
  const exact = pool.filter((entry) => (entry.name || "").toLowerCase() === needle);
  if (exact.length === 1) return exact[0];
  const partial = pool.filter((entry) => (entry.name || "").toLowerCase().includes(needle));
  return partial.length === 1 ? partial[0] : null;
}

function leaveAllVoiceChannelsForAccount(guild, accountId) {
  if (!guild || !accountId) return false;
  let changed = false;
  guild.channels.forEach((channel) => {
    if (channel.type !== "voice" && channel.type !== "stage") return;
    ensureVoiceStateForChannel(channel);
    const before = JSON.stringify(channel.voiceState);
    channel.voiceState.connectedIds = channel.voiceState.connectedIds.filter((id) => id !== accountId);
    channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => id !== accountId);
    channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
    channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => id !== accountId);
    if (JSON.stringify(channel.voiceState) !== before) changed = true;
  });
  return changed;
}

function joinVoiceLikeChannel(channel, accountId) {
  const guild = getActiveGuild();
  if (!guild || !channel || !accountId) return false;
  leaveAllVoiceChannelsForAccount(guild, accountId);
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) channel.voiceState.connectedIds.push(accountId);
  addVoiceActivity(channel, accountId, "join");
  return true;
}

function leaveVoiceLikeChannel(channel, accountId) {
  if (!channel || !accountId) return false;
  ensureVoiceStateForChannel(channel);
  const before = JSON.stringify(channel.voiceState);
  channel.voiceState.connectedIds = channel.voiceState.connectedIds.filter((id) => id !== accountId);
  channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => id !== accountId);
  channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
  channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => id !== accountId);
  const changed = JSON.stringify(channel.voiceState) !== before;
  if (changed) addVoiceActivity(channel, accountId, "leave");
  return changed;
}

function toggleVoiceMuteForSelf(channel, accountId) {
  if (!channel || !accountId) return false;
  ensureVoiceStateForChannel(channel);
  const nextMuted = !channel.voiceState.mutedIds.includes(accountId);
  const changed = setVoiceMuteState(channel, accountId, nextMuted);
  if (changed) addVoiceActivity(channel, accountId, nextMuted ? "mute" : "unmute");
  return changed;
}

function describeVoiceActivity(entry, guild) {
  const account = getAccountById(entry?.accountId || "");
  const who = account ? displayNameForAccount(account, guild?.id || null) : "Unknown";
  const detail = (entry?.detail || "").trim();
  const map = {
    join: "joined",
    leave: "left",
    mute: "muted",
    unmute: "unmuted",
    hand_raise: "raised hand",
    hand_lower: "lowered hand",
    speaker_on: "became speaker",
    speaker_off: "stopped speaking",
    approved: "approved speaker request",
    dismissed: "dismissed hand raise",
    promoted: "promoted to speaker",
    demoted: "demoted from speaker",
    disconnected: "disconnected member"
  };
  const verb = map[entry?.action] || (entry?.action || "updated");
  return detail ? `${who} ${verb} (${detail})` : `${who} ${verb}`;
}

function toggleRaisedHandForSelf(channel, accountId) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  const nextRaised = !channel.voiceState.raisedHandIds.includes(accountId);
  const changed = setStageRaisedHandState(channel, accountId, nextRaised);
  if (changed) addVoiceActivity(channel, accountId, nextRaised ? "hand_raise" : "hand_lower");
  return changed;
}

function toggleStageSpeaker(channel, accountId) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  const nextSpeaker = !channel.voiceState.speakerIds.includes(accountId);
  const changed = setStageSpeakerState(channel, accountId, nextSpeaker);
  if (changed) addVoiceActivity(channel, accountId, nextSpeaker ? "speaker_on" : "speaker_off");
  return changed;
}

function getChannelSlowmodeRemainingMs(channel, accountId) {
  const seconds = getChannelSlowmodeSeconds(channel);
  if (!channel || !accountId || seconds <= 0) return 0;
  ensureChannelSlowmodeState(channel);
  const lastIso = channel.slowmodeState?.[accountId];
  const lastMs = toTimestampMs(lastIso);
  if (!lastMs) return 0;
  const elapsed = Date.now() - lastMs;
  const remaining = seconds * 1000 - elapsed;
  return remaining > 0 ? remaining : 0;
}

function recordChannelSlowmodeSend(channel, accountId) {
  if (!channel || !accountId) return;
  if (getChannelSlowmodeSeconds(channel) <= 0) return;
  ensureChannelSlowmodeState(channel);
  channel.slowmodeState[accountId] = new Date().toISOString();
}

function formatSlowmodeLabel(seconds) {
  const sec = normalizeSlowmodeSeconds(seconds);
  if (sec <= 0) return "Slowmode off";
  if (sec < 60) return `Slowmode ${sec}s`;
  const mins = Math.floor(sec / 60);
  const rest = sec % 60;
  return rest === 0 ? `Slowmode ${mins}m` : `Slowmode ${mins}m ${rest}s`;
}

function getGuildUnreadStats(guild, account) {
  if (!guild || !account) return { unread: 0, mentions: 0 };
  if (!Array.isArray(guild.memberIds) || !guild.memberIds.includes(account.id)) {
    return { unread: 0, mentions: 0 };
  }
  const totals = guild.channels.reduce((acc, channel) => {
    if (!canAccountViewChannel(guild, channel, account.id)) return acc;
    const stats = getChannelUnreadStats(channel, account);
    return {
      unread: acc.unread + stats.unread,
      mentions: acc.mentions + stats.mentions
    };
  }, { unread: 0, mentions: 0 });
  return applyGuildNotificationModeToStats(totals, getGuildNotificationMode(guild.id));
}

function getGuildChannelsForNavigation() {
  const guild = getActiveGuild();
  const account = getCurrentAccount();
  if (!guild || !Array.isArray(guild.channels) || !account) return [];
  return guild.channels.filter((channel) => canAccountViewChannel(guild, channel, account.id));
}

function getFirstOpenableChannelIdForGuild(guild) {
  if (!guild || !Array.isArray(guild.channels) || guild.channels.length === 0) return null;
  const account = getCurrentAccount();
  const visible = account
    ? guild.channels.filter((channel) => canAccountViewChannel(guild, channel, account.id))
    : guild.channels;
  if (visible.length === 0) return null;
  const preferred = getPreferredGuildChannelId(guild.id);
  if (preferred && visible.some((channel) => channel.id === preferred)) return preferred;
  return visible[0]?.id || null;
}

function openGuildById(guildId) {
  const guild = state.guilds.find((entry) => entry.id === guildId);
  if (!guild) return false;
  state.viewMode = "guild";
  state.activeGuildId = guild.id;
  state.activeChannelId = getFirstOpenableChannelIdForGuild(guild);
  state.activeDmId = null;
  ensureCurrentUserInActiveServer();
  saveState();
  render();
  return true;
}

function navigateGuildChannelByOffset(delta) {
  const channels = getGuildChannelsForNavigation();
  if (channels.length === 0) return false;
  const currentIndex = channels.findIndex((channel) => channel.id === state.activeChannelId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = Math.max(0, Math.min(channels.length - 1, safeIndex + delta));
  const next = channels[nextIndex];
  if (!next || next.id === state.activeChannelId) return false;
  state.viewMode = "guild";
  state.activeDmId = null;
  state.activeChannelId = next.id;
  saveState();
  render();
  return true;
}

function moveActiveChannelByOffset(delta) {
  const guild = getActiveGuild();
  const channelId = state.activeChannelId;
  if (!guild || !channelId || !canCurrentUser("manageChannels")) return false;
  const moved = moveChannelByOffset(guild, channelId, delta);
  if (!moved) return false;
  saveState();
  renderChannels();
  return true;
}

function listUnreadGuildChannels(guild, account) {
  if (!guild || !account) return [];
  return guild.channels
    .filter((channel) => canAccountViewChannel(guild, channel, account.id))
    .map((channel) => ({ channel, stats: getChannelUnreadStats(channel, account) }))
    .filter((entry) => entry.stats.unread > 0);
}

function jumpToUnreadGuildChannel(direction = 1) {
  const guild = getActiveGuild();
  const account = getCurrentAccount();
  if (!guild || !account) return false;
  const unread = listUnreadGuildChannels(guild, account);
  if (unread.length === 0) return false;
  const unreadIds = unread.map((entry) => entry.channel.id);
  const currentIndex = unreadIds.indexOf(state.activeChannelId);
  const fallback = direction >= 0 ? 0 : unreadIds.length - 1;
  const base = currentIndex >= 0 ? currentIndex : fallback;
  const nextIndex = (base + (direction >= 0 ? 1 : -1) + unreadIds.length) % unreadIds.length;
  const nextId = unreadIds[nextIndex];
  if (!nextId) return false;
  state.viewMode = "guild";
  state.activeDmId = null;
  state.activeChannelId = nextId;
  saveState();
  render();
  return true;
}

function moveChannelByOffset(guild, channelId, delta) {
  if (!guild || !Array.isArray(guild.channels) || !channelId || !Number.isFinite(delta) || delta === 0) return false;
  const from = guild.channels.findIndex((entry) => entry.id === channelId);
  if (from < 0) return false;
  const to = Math.max(0, Math.min(guild.channels.length - 1, from + (delta > 0 ? 1 : -1)));
  if (to === from) return false;
  const [entry] = guild.channels.splice(from, 1);
  guild.channels.splice(to, 0, entry);
  return true;
}

function duplicateChannelInGuild(guild, channel) {
  if (!guild || !channel) return null;
  const forumTags = channel.type === "forum" ? forumTagsForChannel(channel).map((tag) => ({ ...tag })) : [];
  const clone = {
    id: createId(),
    name: sanitizeChannelName(`${channel.name || "channel"}-copy`, "channel-copy"),
    type: channel.type || "text",
    topic: (channel.topic || "").toString(),
    forumTags,
    permissionOverrides: normalizeChannelPermissionOverrides(channel.permissionOverrides, getServerRoles(guild).map((role) => role.id)),
    voiceState: createVoiceState(),
    readState: state.currentAccountId ? { [state.currentAccountId]: new Date().toISOString() } : {},
    slowmodeSec: normalizeSlowmodeSeconds(channel.slowmodeSec || 0),
    slowmodeState: {},
    messages: []
  };
  guild.channels.push(clone);
  return clone;
}

async function copyText(value) {
  const text = (value || "").toString();
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below.
  }
  const area = document.createElement("textarea");
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  area.value = text;
  area.setAttribute("readonly", "true");
  area.style.position = "fixed";
  area.style.top = "-9999px";
  area.style.left = "-9999px";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  document.body.appendChild(area);
  try {
    area.focus();
    area.select();
    area.setSelectionRange(0, area.value.length);
    const copied = document.execCommand("copy");
    if (copied) return true;
    // Manual fallback for browsers that block clipboard writes on non-secure origins.
    window.prompt("Copy logs manually (Ctrl/Cmd+C, Enter):", text);
    return false;
  } catch {
    window.prompt("Copy logs manually (Ctrl/Cmd+C, Enter):", text);
    return false;
  } finally {
    area.remove();
    if (active) {
      try {
        active.focus();
      } catch {
        // Ignore focus restore failures.
      }
    }
  }
}

function ensureToastHost() {
  let host = document.getElementById("appToastHost");
  if (host) return host;
  host = document.createElement("div");
  host.id = "appToastHost";
  host.className = "toast-host";
  host.setAttribute("role", "status");
  host.setAttribute("aria-live", "polite");
  document.body.appendChild(host);
  return host;
}

function showToast(message, { tone = "info", duration = 1800 } = {}) {
  if (!message) return;
  const host = ensureToastHost();
  host.textContent = message;
  host.classList.toggle("is-error", tone === "error");
  host.classList.add("is-visible");
  if (toastHideTimer) clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => {
    host.classList.remove("is-visible");
  }, Math.max(500, Number(duration) || 1800));
}

function ensureMediaLightbox() {
  let overlay = document.getElementById("mediaLightbox");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "mediaLightbox";
  overlay.className = "media-lightbox";
  overlay.hidden = true;
  overlay.innerHTML = [
    "<button type=\"button\" class=\"media-lightbox__close\" aria-label=\"Close\">✕</button>",
    "<div class=\"media-lightbox__stage\"></div>",
    "<div class=\"media-lightbox__caption\"></div>"
  ].join("");
  overlay.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest(".media-lightbox__stage video")) return;
    if (event.target.closest(".media-lightbox__close")) {
      closeMediaLightbox();
      return;
    }
    closeMediaLightbox();
  });
  document.body.appendChild(overlay);
  return overlay;
}

function closeMediaLightbox() {
  const overlay = document.getElementById("mediaLightbox");
  if (!overlay) return;
  overlay.hidden = true;
  const stage = overlay.querySelector(".media-lightbox__stage");
  if (stage) stage.innerHTML = "";
  document.body.style.removeProperty("overflow");
}

function openMediaLightbox({ url, label = "", video = false } = {}) {
  if (!url) return;
  const overlay = ensureMediaLightbox();
  const stage = overlay.querySelector(".media-lightbox__stage");
  const caption = overlay.querySelector(".media-lightbox__caption");
  if (!stage || !caption) return;
  stage.innerHTML = "";
  const media = document.createElement(video ? "video" : "img");
  if (video) {
    media.controls = true;
    media.autoplay = true;
    media.playsInline = true;
  }
  media.src = url;
  media.alt = label || "media preview";
  stage.appendChild(media);
  caption.textContent = label || "";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function mentionInComposer(account) {
  if (!account) return;
  const base = ui.messageInput.value.trim();
  ui.messageInput.value = `${base ? `${base} ` : ""}@${account.username} `;
  ui.messageInput.focus();
  renderSlashSuggestions();
}

function normalizeColorForPicker(value, fallback = "#5865f2") {
  const raw = (value || "").toString().trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
  if (/^#[0-9a-f]{8}$/i.test(raw)) return `#${raw.slice(1, 7)}`;
  if (fallback && fallback !== value) return normalizeColorForPicker(fallback, "#5865f2");
  return "#5865f2";
}

function openGuildSettingsDialog(guild = null) {
  const target = guild || getActiveGuild();
  const current = getCurrentAccount();
  if (!target) return;
  ui.guildSettingsNameInput.value = target.name || "";
  ui.guildSettingsDescriptionInput.value = (target.description || "").toString().slice(0, 180);
  ui.guildSettingsAccentInput.value = (target.accentColor || "#5865f2").toString().slice(0, 24);
  if (ui.guildSettingsAccentPicker) {
    ui.guildSettingsAccentPicker.value = normalizeColorForPicker(ui.guildSettingsAccentInput.value, "#5865f2");
  }
  if (ui.deleteGuildBtn) {
    const canDelete = Boolean(current && hasServerPermission(target, current.id, "administrator") && state.guilds.length > 1);
    ui.deleteGuildBtn.disabled = !canDelete;
  }
  ui.guildSettingsDialog.showModal();
}

function renameGuildById(guildId) {
  const guild = state.guilds.find((entry) => entry.id === guildId);
  if (!guild) return;
  openGuildSettingsDialog(guild);
}

function deleteGuildById(guildId) {
  if (state.guilds.length <= 1) return;
  const guild = state.guilds.find((entry) => entry.id === guildId);
  if (!guild) return;
  const confirmed = confirm(`Delete guild "${guild.name}"? This removes all channels and messages in it.`);
  if (!confirmed) return;
  removeGuildFromFolders(guildId);
  state.guilds = state.guilds.filter((entry) => entry.id !== guildId);
  if (state.activeGuildId === guildId) {
    const nextGuild = state.guilds[0] || null;
    state.activeGuildId = nextGuild?.id || null;
    state.activeChannelId = nextGuild ? getFirstOpenableChannelIdForGuild(nextGuild) : null;
  }
  saveState();
  render();
}

function ensureFolderState() {
  if (!Array.isArray(state.guildFolders)) state.guildFolders = [];
  state.guildFolders = state.guildFolders
    .filter((folder) => folder && typeof folder === "object")
    .map((folder) => ({
      id: folder.id || createId(),
      name: (folder.name || "Folder").toString().slice(0, 24),
      guildIds: Array.isArray(folder.guildIds) ? folder.guildIds.filter(Boolean) : [],
      collapsed: Boolean(folder.collapsed)
    }));
}

function getFolderForGuild(guildId) {
  ensureFolderState();
  return state.guildFolders.find((folder) => folder.guildIds.includes(guildId)) || null;
}

function removeGuildFromFolders(guildId) {
  ensureFolderState();
  state.guildFolders.forEach((folder) => {
    folder.guildIds = folder.guildIds.filter((id) => id !== guildId);
  });
  state.guildFolders = state.guildFolders.filter((folder) => folder.guildIds.length > 0);
}

function assignGuildToFolder(guildId, folderId) {
  ensureFolderState();
  removeGuildFromFolders(guildId);
  const folder = state.guildFolders.find((entry) => entry.id === folderId);
  if (!folder) return;
  folder.guildIds.push(guildId);
}

function closeContextMenu() {
  if (!contextMenuOpen) return;
  contextMenuOpen = false;
  contextMenuFocusIndex = 0;
  contextMenuSubmenuAnchor = null;
  ui.contextMenu.classList.add("context-menu--hidden");
  ui.contextMenu.innerHTML = "";
  document.querySelectorAll(".context-submenu").forEach((node) => node.remove());
}

function shouldUseNativeContextMenu(target) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest(".message-swf-player, ruffle-player, .ruffle-player"));
}

function openContextMenu(event, items) {
  event.preventDefault();
  event.stopPropagation();
  if (!Array.isArray(items) || items.length === 0) return;
  contextMenuSubmenuAnchor = null;
  document.querySelectorAll(".context-submenu").forEach((node) => node.remove());
  ui.contextMenu.innerHTML = "";
  const openSubmenu = (anchor, submenuItems) => {
    document.querySelectorAll(".context-submenu").forEach((node) => node.remove());
    contextMenuSubmenuAnchor = anchor;
    const submenu = document.createElement("div");
    submenu.className = "context-menu context-submenu";
    submenu.addEventListener("contextmenu", (subEvent) => {
      subEvent.preventDefault();
      subEvent.stopPropagation();
    });
    submenuItems.forEach((entry) => {
      const subButton = document.createElement("button");
      subButton.type = "button";
      subButton.textContent = entry.label;
      subButton.disabled = Boolean(entry.disabled);
      if (entry.danger) subButton.classList.add("danger");
      subButton.addEventListener("click", async () => {
        closeContextMenu();
        if (typeof entry.action === "function") await entry.action();
      });
      submenu.appendChild(subButton);
    });
    document.body.appendChild(submenu);
    const anchorRect = anchor.getBoundingClientRect();
    const subRect = submenu.getBoundingClientRect();
    const margin = 8;
    let left = anchorRect.right + 6;
    if (left + subRect.width > window.innerWidth - margin) left = anchorRect.left - subRect.width - 6;
    const top = Math.max(margin, Math.min(anchorRect.top, window.innerHeight - subRect.height - margin));
    submenu.style.left = `${Math.round(left)}px`;
    submenu.style.top = `${Math.round(top)}px`;
  };
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.disabled = Boolean(item.disabled);
    if (item.danger) button.classList.add("danger");
    if (Array.isArray(item.submenu) && item.submenu.length > 0) {
      button.classList.add("context-menu__has-submenu");
      button.textContent = `${item.label} ▸`;
      button.addEventListener("mouseenter", () => openSubmenu(button, item.submenu));
      button.addEventListener("focus", () => openSubmenu(button, item.submenu));
      button.addEventListener("click", (e) => {
        e.preventDefault();
        openSubmenu(button, item.submenu);
      });
      ui.contextMenu.appendChild(button);
      return;
    }
    button.addEventListener("click", async () => {
      closeContextMenu();
      if (typeof item.action === "function") await item.action();
    });
    ui.contextMenu.appendChild(button);
  });
  ui.contextMenu.classList.remove("context-menu--hidden");
  contextMenuOpen = true;
  contextMenuFocusIndex = 0;

  const margin = 8;
  const menuRect = ui.contextMenu.getBoundingClientRect();
  const maxLeft = window.innerWidth - menuRect.width - margin;
  const maxTop = window.innerHeight - menuRect.height - margin;
  const left = Math.max(margin, Math.min(event.clientX, maxLeft));
  const top = Math.max(margin, Math.min(event.clientY, maxTop));
  ui.contextMenu.style.left = `${left}px`;
  ui.contextMenu.style.top = `${top}px`;
  const buttons = [...ui.contextMenu.querySelectorAll("button:not(:disabled)")];
  if (buttons.length > 0) {
    buttons[0].focus();
  }
}

function ensureServerOwnerRole(server, accountId) {
  if (!server || !accountId) return false;
  if (!Array.isArray(server.roles) || server.roles.length === 0) return false;
  if (!server.memberRoles || typeof server.memberRoles !== "object") server.memberRoles = {};
  const everyoneRoleId = server.roles[0].id;
  if (!Array.isArray(server.memberRoles[accountId])) server.memberRoles[accountId] = [everyoneRoleId];
  const adminRoleIds = server.roles.filter((role) => role.permissions?.administrator).map((role) => role.id);
  const anyMemberHasAdmin = Object.values(server.memberRoles).some((roleIds) => (
    Array.isArray(roleIds) && roleIds.some((id) => adminRoleIds.includes(id))
  ));
  const accountRoleIds = server.memberRoles[accountId];
  const accountHasAdmin = accountRoleIds.some((id) => adminRoleIds.includes(id));
  if (accountHasAdmin || anyMemberHasAdmin) return false;
  const ownerRole = createRole("Owner", "#f23f43", "admin");
  server.roles.push(ownerRole);
  accountRoleIds.push(ownerRole.id);
  return true;
}

function ensureCurrentUserInActiveServer() {
  const account = getCurrentAccount();
  const server = getActiveServer();
  if (!account || !server) return false;
  let changed = false;
  if (!Array.isArray(server.roles) || server.roles.length === 0) {
    server.roles = [createRole("@everyone", "#b5bac1", "member")];
    changed = true;
  }
  if (!server.memberRoles || typeof server.memberRoles !== "object") {
    server.memberRoles = {};
    changed = true;
  }
  const everyoneRoleId = server.roles[0].id;
  if (!Array.isArray(server.memberRoles[account.id])) {
    server.memberRoles[account.id] = [];
    changed = true;
  }
  if (!server.memberRoles[account.id].includes(everyoneRoleId)) {
    server.memberRoles[account.id].push(everyoneRoleId);
    changed = true;
  }
  if (!server.memberIds.includes(account.id)) {
    server.memberIds.push(account.id);
    changed = true;
  }
  if (ensureServerOwnerRole(server, account.id)) {
    changed = true;
  }
  server.channels.forEach((channel) => {
    const beforeOverrides = JSON.stringify(channel.permissionOverrides || {});
    ensureChannelPermissionOverrides(channel, server);
    if (JSON.stringify(channel.permissionOverrides || {}) !== beforeOverrides) changed = true;
    const beforeVoice = JSON.stringify(channel.voiceState || {});
    channel.voiceState = normalizeVoiceState(channel.voiceState);
    channel.voiceState.connectedIds = channel.voiceState.connectedIds.filter((id) => server.memberIds.includes(id));
    channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => channel.voiceState.connectedIds.includes(id));
    channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => channel.voiceState.connectedIds.includes(id));
    channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => channel.voiceState.connectedIds.includes(id));
    if (!Array.isArray(channel.voiceState.activity)) channel.voiceState.activity = [];
    channel.voiceState.activity = channel.voiceState.activity
      .filter((entry) => entry && typeof entry === "object" && entry.accountId)
      .slice(-30);
    if (JSON.stringify(channel.voiceState || {}) !== beforeVoice) changed = true;
    channel.forumTags = channel.type === "forum" ? forumTagsForChannel(channel) : [];
    ensureChannelReadState(channel);
    const normalizedSlowmode = getChannelSlowmodeSeconds(channel);
    if (channel.slowmodeSec !== normalizedSlowmode) {
      channel.slowmodeSec = normalizedSlowmode;
      changed = true;
    }
    if (ensureChannelSlowmodeState(channel)) changed = true;
    if (!channel.readState[account.id]) {
      channel.readState[account.id] = new Date().toISOString();
      changed = true;
    }
  });
  return changed;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatFullTimestamp(iso) {
  return new Date(iso).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function focusMessageById(messageId) {
  if (!messageId) return false;
  const row = ui.messageList.querySelector(`[data-message-id="${messageId}"]`);
  if (!(row instanceof HTMLElement)) return false;
  row.scrollIntoView({ block: "center", behavior: "smooth" });
  row.classList.add("message--flash");
  window.setTimeout(() => {
    row.classList.remove("message--flash");
  }, 1200);
  return true;
}

function buildMessagePermalink(conversationId, messageId) {
  const origin = window.location.origin === "null" ? "" : window.location.origin;
  const base = `${origin}${window.location.pathname}`;
  const conv = encodeURIComponent((conversationId || "").toString());
  const msg = encodeURIComponent((messageId || "").toString());
  return `${base}#msg=${conv}:${msg}`;
}

function buildChannelPermalink(guildId, channelId) {
  const origin = window.location.origin === "null" ? "" : window.location.origin;
  const base = `${origin}${window.location.pathname}`;
  const gid = encodeURIComponent((guildId || "").toString());
  const cid = encodeURIComponent((channelId || "").toString());
  return `${base}#ch=${gid}:${cid}`;
}

function parseHashMessageReference() {
  const hash = (window.location.hash || "").replace(/^#/, "");
  if (!hash.startsWith("msg=")) return null;
  const payload = hash.slice(4);
  const separator = payload.indexOf(":");
  if (separator <= 0) return null;
  try {
    const conversationId = decodeURIComponent(payload.slice(0, separator));
    const messageId = decodeURIComponent(payload.slice(separator + 1));
    if (!conversationId || !messageId) return null;
    return { conversationId, messageId };
  } catch {
    return null;
  }
}

function quoteMessageInComposer(message) {
  if (!message) return;
  const quoted = (message.text || "").trim() || "(empty message)";
  const line = `> ${quoted.replace(/\n/g, "\n> ")}\n`;
  const base = ui.messageInput.value.trim();
  ui.messageInput.value = `${base ? `${base}\n` : ""}${line}`;
  ui.messageInput.focus();
  ui.messageInput.setSelectionRange(ui.messageInput.value.length, ui.messageInput.value.length);
}

function messageDateKey(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatMessageDayLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  const now = new Date();
  const todayKey = messageDateKey(now.toISOString());
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yesterdayKey = messageDateKey(y.toISOString());
  const key = messageDateKey(iso);
  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function createMessageDayDivider(iso) {
  const divider = document.createElement("div");
  divider.className = "message-day-divider";
  const lineLeft = document.createElement("span");
  lineLeft.className = "message-day-divider__line";
  const label = document.createElement("span");
  label.className = "message-day-divider__label";
  label.textContent = formatMessageDayLabel(iso);
  const lineRight = document.createElement("span");
  lineRight.className = "message-day-divider__line";
  divider.appendChild(lineLeft);
  divider.appendChild(label);
  divider.appendChild(lineRight);
  return divider;
}

function presenceLabel(presence) {
  if (presence === "idle") return "Idle";
  if (presence === "dnd") return "Do Not Disturb";
  if (presence === "invisible") return "Invisible";
  return "Online";
}

function normalizePresence(value) {
  if (value === "idle" || value === "dnd" || value === "invisible") return value;
  return "online";
}

function normalizeMemberPresenceFilter(value) {
  if (value === "online" || value === "offline") return value;
  return "all";
}

function normalizeToggle(value) {
  return value === "on" ? "on" : "off";
}

function normalizeSwfAudioPolicy(value) {
  return value === "multi" ? "multi" : "single";
}

function normalizeSwfAudioScope(value) {
  return value === "guild" ? "guild" : "global";
}

function normalizeSwfAutoplay(value) {
  return value === "off" ? "off" : "on";
}

function normalizeSwfQuickAudioMode(value) {
  if (value === "on" || value === "off" || value === "click") return value;
  return "click";
}

function normalizeTheme(value) {
  return value === "oled" ? "oled" : "discord";
}

function normalizeGuildNotificationMode(value) {
  if (value === "mentions" || value === "mute") return value;
  return "all";
}

function normalizeGuildNotificationsMap(value) {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value).reduce((acc, [guildId, mode]) => {
    if (!guildId) return acc;
    acc[guildId] = normalizeGuildNotificationMode(mode);
    return acc;
  }, {});
}

function normalizeForumCollapsedThreadsMap(value) {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value).reduce((acc, [channelId, threadMap]) => {
    if (!channelId || !threadMap || typeof threadMap !== "object") return acc;
    const normalizedThreadMap = Object.entries(threadMap).reduce((threadAcc, [threadId, collapsed]) => {
      if (!threadId) return threadAcc;
      threadAcc[threadId] = Boolean(collapsed);
      return threadAcc;
    }, {});
    if (Object.keys(normalizedThreadMap).length > 0) acc[channelId] = normalizedThreadMap;
    return acc;
  }, {});
}

function normalizeForumThreadReadStateMap(value) {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value).reduce((acc, [channelId, threadMap]) => {
    if (!channelId || !threadMap || typeof threadMap !== "object") return acc;
    const normalizedThreadMap = Object.entries(threadMap).reduce((threadAcc, [threadId, ts]) => {
      if (!threadId) return threadAcc;
      const nextTs = typeof ts === "string" ? ts : "";
      threadAcc[threadId] = nextTs;
      return threadAcc;
    }, {});
    if (Object.keys(normalizedThreadMap).length > 0) acc[channelId] = normalizedThreadMap;
    return acc;
  }, {});
}

function normalizeForumThreadSortMap(value) {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value).reduce((acc, [channelId, sortMode]) => {
    if (!channelId) return acc;
    acc[channelId] = sortMode === "created" ? "created" : "latest";
    return acc;
  }, {});
}

function normalizeForumThreadTagFilterMap(value) {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value).reduce((acc, [channelId, tagIds]) => {
    if (!channelId || !Array.isArray(tagIds)) return acc;
    const cleaned = [...new Set(tagIds.map((entry) => (entry || "").toString()).filter(Boolean))].slice(0, 8);
    if (cleaned.length > 0) acc[channelId] = cleaned;
    return acc;
  }, {});
}

function normalizeLastChannelByGuildMap(value) {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value).reduce((acc, [guildId, channelId]) => {
    if (!guildId || !channelId) return acc;
    acc[guildId] = channelId.toString();
    return acc;
  }, {});
}

function normalizeMediaPrivacyMode(value) {
  return value === "off" ? "off" : "safe";
}

function normalizeMediaTab(value) {
  const tab = (value || "").toString().toLowerCase();
  return MEDIA_TABS.includes(tab) ? tab : "gif";
}

function normalizeMediaTrustRules(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (entry || "").toString().trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 120);
}

function normalizeProfileEffect(value) {
  const effect = (value || "").toString().toLowerCase();
  return ["none", "aurora", "flame", "ocean"].includes(effect) ? effect : "none";
}

function normalizeRelayMode(value) {
  const mode = (value || "").toString().toLowerCase();
  if (mode === "ws" || mode === "http" || mode === "xmpp" || mode === "off") return mode;
  return "local";
}

function normalizeRelayUrl(value) {
  const trimmed = (value || "").toString().trim().slice(0, 180);
  if (!trimmed) return "ws://localhost:8787";
  if (!/^(wss?|https?):\/\//i.test(trimmed)) return "ws://localhost:8787";
  return trimmed;
}

function normalizeRelayRoom(value) {
  return (value || "").toString().trim().slice(0, 80);
}

function normalizeXmppJid(value) {
  return (value || "").toString().trim().slice(0, 120);
}

function normalizeXmppPassword(value) {
  return (value || "").toString().slice(0, 120);
}

function normalizeXmppWsUrl(value) {
  const raw = (value || "").toString().trim().slice(0, 180);
  if (!raw) return "";
  return /^wss?:\/\//i.test(raw) ? raw : "";
}

function normalizeXmppMucService(value) {
  return (value || "").toString().trim().toLowerCase().slice(0, 120);
}

function normalizeVoiceState(value) {
  const safe = value && typeof value === "object" ? value : {};
  const normalizeIds = (arr) => [...new Set((Array.isArray(arr) ? arr : []).map((id) => (id || "").toString()).filter(Boolean))];
  const activity = Array.isArray(safe.activity)
    ? safe.activity
      .map((entry) => ({
        id: (entry?.id || createId()).toString(),
        accountId: (entry?.accountId || "").toString(),
        action: (entry?.action || "").toString().slice(0, 32),
        detail: (entry?.detail || "").toString().slice(0, 120),
        ts: entry?.ts || new Date().toISOString()
      }))
      .filter((entry) => entry.accountId && entry.action)
      .slice(-30)
    : [];
  return {
    connectedIds: normalizeIds(safe.connectedIds),
    mutedIds: normalizeIds(safe.mutedIds),
    raisedHandIds: normalizeIds(safe.raisedHandIds),
    speakerIds: normalizeIds(safe.speakerIds),
    activity
  };
}

function normalizeChannelPermissionValue(value) {
  const token = (value || "").toString().toLowerCase();
  if (token === "allow" || token === "deny") return token;
  return "inherit";
}

function normalizeChannelPermissionOverrides(value, roleIds = []) {
  if (!value || typeof value !== "object") return {};
  const validRoleIds = new Set(Array.isArray(roleIds) ? roleIds.filter(Boolean) : []);
  const validKeys = ["viewChannel", "sendMessages", "addReactions", "createThreads"];
  return Object.entries(value).reduce((acc, [roleId, config]) => {
    if (!roleId || (validRoleIds.size > 0 && !validRoleIds.has(roleId))) return acc;
    if (!config || typeof config !== "object") return acc;
    const next = {};
    validKeys.forEach((key) => {
      const normalized = normalizeChannelPermissionValue(config[key]);
      if (normalized !== "inherit") next[key] = normalized;
    });
    if (Object.keys(next).length > 0) acc[roleId] = next;
    return acc;
  }, {});
}

function normalizeRecentEmojis(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const output = [];
  value.forEach((entry) => {
    const key = (entry || "").toString().trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    output.push(key);
  });
  return output.slice(0, 24);
}

function getPreferences() {
  const defaults = buildInitialState().preferences;
  const current = state.preferences || {};
  return {
    uiScale: Number.isFinite(Number(current.uiScale)) ? Math.min(115, Math.max(90, Number(current.uiScale))) : defaults.uiScale,
    theme: normalizeTheme(current.theme),
    compactMembers: normalizeToggle(current.compactMembers),
    developerMode: normalizeToggle(current.developerMode),
    debugOverlay: normalizeToggle(current.debugOverlay),
    mute: normalizeToggle(current.mute),
    deafen: normalizeToggle(current.deafen),
    swfAudio: normalizeToggle(current.swfAudio),
    swfVolume: Number.isFinite(Number(current.swfVolume)) ? Math.min(100, Math.max(0, Number(current.swfVolume))) : defaults.swfVolume,
    swfAudioPolicy: normalizeSwfAudioPolicy(current.swfAudioPolicy),
    swfAudioScope: normalizeSwfAudioScope(current.swfAudioScope),
    swfAutoplay: normalizeSwfAutoplay(current.swfAutoplay),
    swfPauseOnMute: normalizeToggle(current.swfPauseOnMute),
    swfVuMeter: normalizeToggle(current.swfVuMeter),
    swfQuickAudioMode: normalizeSwfQuickAudioMode(current.swfQuickAudioMode),
    guildNotifications: normalizeGuildNotificationsMap(current.guildNotifications),
    forumCollapsedThreads: normalizeForumCollapsedThreadsMap(current.forumCollapsedThreads),
    forumThreadReadState: normalizeForumThreadReadStateMap(current.forumThreadReadState),
    forumThreadSort: normalizeForumThreadSortMap(current.forumThreadSort),
    forumThreadTagFilter: normalizeForumThreadTagFilterMap(current.forumThreadTagFilter),
    mediaPrivacyMode: normalizeMediaPrivacyMode(current.mediaPrivacyMode),
    mediaTrustRules: normalizeMediaTrustRules(current.mediaTrustRules),
    mediaLastTab: normalizeMediaTab(current.mediaLastTab),
    recentEmojis: normalizeRecentEmojis(current.recentEmojis),
    hideChannelPanel: normalizeToggle(current.hideChannelPanel),
    hideMemberPanel: normalizeToggle(current.hideMemberPanel),
    collapseDmSection: normalizeToggle(current.collapseDmSection),
    collapseGuildSection: normalizeToggle(current.collapseGuildSection),
    lastChannelByGuild: normalizeLastChannelByGuildMap(current.lastChannelByGuild),
    relayMode: normalizeRelayMode(current.relayMode),
    relayUrl: normalizeRelayUrl(current.relayUrl),
    relayRoom: normalizeRelayRoom(current.relayRoom),
    relayAutoConnect: normalizeToggle(current.relayAutoConnect),
    relayClientId: (current.relayClientId || createId()).toString(),
    rememberLogin: normalizeToggle(current.rememberLogin),
    xmppJid: normalizeXmppJid(current.xmppJid),
    xmppPassword: normalizeXmppPassword(current.xmppPassword),
    xmppWsUrl: normalizeXmppWsUrl(current.xmppWsUrl),
    xmppMucService: normalizeXmppMucService(current.xmppMucService),
    swfPipPosition: current.swfPipPosition && typeof current.swfPipPosition === "object"
      ? {
          left: Number.isFinite(Number(current.swfPipPosition.left)) ? Math.max(0, Number(current.swfPipPosition.left)) : null,
          top: Number.isFinite(Number(current.swfPipPosition.top)) ? Math.max(0, Number(current.swfPipPosition.top)) : null,
          manual: Boolean(current.swfPipPosition.manual)
        }
      : null
  };
}

function relayStatusText() {
  const base = RELAY_STATUS_LABELS[relayStatus] || "Disconnected";
  const detail = relayLastError ? ` (${relayLastError.slice(0, 72)})` : "";
  return `${base}${detail}`;
}

function getTransportAdapter(mode = getPreferences().relayMode) {
  const adapters = {
    local: {
      id: "local",
      label: "Local",
      canRealtime: false,
      description: "Messages stay in local browser storage."
    },
    off: {
      id: "off",
      label: "Off",
      canRealtime: false,
      description: "Transport disabled."
    },
    http: {
      id: "http",
      label: "HTTP Relay",
      canRealtime: true,
      description: "SSE + POST relay transport."
    },
    ws: {
      id: "ws",
      label: "WebSocket Relay",
      canRealtime: true,
      description: "Bidirectional WebSocket relay transport."
    },
    xmpp: {
      id: "xmpp",
      label: "XMPP",
      canRealtime: true,
      description: "XMPP over WebSocket with MUC room mapping."
    }
  };
  return adapters[mode] || adapters.local;
}

function renderRelayStatusOutput() {
  if (!ui.relayStatusOutput) return;
  ui.relayStatusOutput.textContent = `Relay: ${relayStatusText()}`;
  if (ui.relayHeaderBadge) {
    const prefs = getPreferences();
    const adapter = getTransportAdapter(prefs.relayMode);
    ui.relayHeaderBadge.textContent = `${adapter.label} · ${RELAY_STATUS_LABELS[relayStatus] || "Disconnected"}`;
    ui.relayHeaderBadge.dataset.state = relayStatus;
  }
}

function setRelayStatus(status, errorText = "") {
  relayStatus = status;
  relayLastError = errorText || "";
  if (getPreferences().relayMode === "xmpp") {
    addXmppDebugEvent(status === "error" ? "error" : "connect", "Relay status updated", {
      status,
      error: relayLastError || ""
    });
  }
  renderRelayStatusOutput();
}

function relayClientId() {
  state.preferences = getPreferences();
  if (!state.preferences.relayClientId) state.preferences.relayClientId = createId();
  return state.preferences.relayClientId;
}

function relayRoomForActiveConversation() {
  const prefs = getPreferences();
  if (prefs.relayRoom) return prefs.relayRoom;
  const conversation = getActiveConversation();
  if (conversation?.type === "dm" && conversation.thread) {
    const usernames = (conversation.thread.participantIds || [])
      .map((id) => getAccountById(id))
      .filter(Boolean)
      .map((entry) => normalizeUsername(entry.username || ""))
      .filter(Boolean)
      .sort();
    if (usernames.length >= 2) return `dm:${usernames.slice(0, 2).join(":")}`;
  }
  if (conversation?.type === "channel" && conversation.channel) {
    if (conversation.channel.relayRoomToken) return conversation.channel.relayRoomToken.toString();
    if (conversation.channel.xmppRoomJid) return `xmpp:${normalizeXmppJid(conversation.channel.xmppRoomJid).toLowerCase()}`;
    const guild = getActiveGuild();
    const guildName = sanitizeChannelName(guild?.name || "guild", "guild");
    const channelName = sanitizeChannelName(conversation.channel.name || "general", "general");
    return `${guildName}:${channelName}`;
  }
  return "lobby:general";
}

function findRelayTargetChannelByRoom(roomToken) {
  if (!roomToken) return null;
  const room = roomToken.toString();
  for (const guild of state.guilds) {
    if (!guild || !Array.isArray(guild.channels)) continue;
    for (const channel of guild.channels) {
      if (!channel || (channel.type === "voice" || channel.type === "stage")) continue;
      if (channel.relayRoomToken && channel.relayRoomToken.toString() === room) return channel;
      if (channel.xmppRoomJid && `xmpp:${normalizeXmppJid(channel.xmppRoomJid).toLowerCase()}` === room) return channel;
      const guildName = sanitizeChannelName(guild.name || "guild", "guild");
      const channelName = sanitizeChannelName(channel.name || "general", "general");
      if (`${guildName}:${channelName}` === room) return channel;
    }
  }
  return null;
}

function clearRelayTypingState() {
  relayTypingByRoom.clear();
  if (relayTypingSweepTimer) {
    clearTimeout(relayTypingSweepTimer);
    relayTypingSweepTimer = null;
  }
  if (relayLocalTypingState.active || relayLocalTypingState.room) {
    relayLocalTypingState.active = false;
    relayLocalTypingState.room = "";
    relayLocalTypingState.lastSentAt = 0;
  }
}

function scheduleRelayTypingSweep() {
  if (relayTypingSweepTimer) {
    clearTimeout(relayTypingSweepTimer);
    relayTypingSweepTimer = null;
  }
  const now = Date.now();
  let nextExpiry = Infinity;
  relayTypingByRoom.forEach((entries, room) => {
    entries.forEach((meta, clientId) => {
      if (!meta || !Number.isFinite(meta.expiresAt) || meta.expiresAt <= now) {
        entries.delete(clientId);
        return;
      }
      if (meta.expiresAt < nextExpiry) nextExpiry = meta.expiresAt;
    });
    if (entries.size === 0) relayTypingByRoom.delete(room);
  });
  if (nextExpiry !== Infinity) {
    relayTypingSweepTimer = setTimeout(() => {
      relayTypingSweepTimer = null;
      scheduleRelayTypingSweep();
      renderComposerMeta();
    }, Math.max(100, nextExpiry - now + 20));
  }
}

function clearRelayTypingForClient(room, clientId) {
  if (!room || !clientId) return;
  const entries = relayTypingByRoom.get(room);
  if (!entries) return;
  entries.delete(clientId);
  if (entries.size === 0) relayTypingByRoom.delete(room);
  scheduleRelayTypingSweep();
}

function applyRelayIncomingTyping(packet) {
  const current = getCurrentAccount();
  if (!current || !packet || typeof packet !== "object") return;
  const remoteClientId = (packet.clientId || "").toString();
  if (!remoteClientId || remoteClientId === relayClientId()) return;
  const room = (packet.room || "").toString();
  if (!room) return;
  const typing = packet.typing && typeof packet.typing === "object" ? packet.typing : {};
  const stateText = (typing.state || "").toString().toLowerCase();
  const isTyping = !["paused", "inactive", "gone", "stopped", "false", "0"].includes(stateText) && typing.active !== false;
  if (!isTyping) {
    clearRelayTypingForClient(room, remoteClientId);
    renderComposerMeta();
    return;
  }
  const mine = normalizeUsername(current.username || "");
  const authorUsername = normalizeUsername(typing.authorUsername || packet.username || `relay_${remoteClientId.slice(0, 6)}`) || `relay_${remoteClientId.slice(0, 6)}`;
  if (mine && mine === authorUsername) return;
  const authorDisplay = (typing.authorDisplay || typing.authorUsername || packet.username || authorUsername).toString().slice(0, 32);
  let entries = relayTypingByRoom.get(room);
  if (!entries) {
    entries = new Map();
    relayTypingByRoom.set(room, entries);
  }
  entries.set(remoteClientId, {
    username: authorUsername,
    display: authorDisplay,
    expiresAt: Date.now() + RELAY_TYPING_TTL_MS
  });
  scheduleRelayTypingSweep();
  renderComposerMeta();
}

function typingNamesForRoom(room) {
  if (!room) return [];
  const entries = relayTypingByRoom.get(room);
  if (!entries) return [];
  const now = Date.now();
  const names = [];
  entries.forEach((meta, clientId) => {
    if (!meta || !Number.isFinite(meta.expiresAt) || meta.expiresAt <= now) {
      entries.delete(clientId);
      return;
    }
    const label = (meta.display || meta.username || "").toString().trim().slice(0, 32);
    if (label) names.push(label);
  });
  if (entries.size === 0) relayTypingByRoom.delete(room);
  return [...new Set(names)].slice(0, 4);
}

function formatTypingSummary(names) {
  if (!Array.isArray(names) || names.length === 0) return "";
  if (names.length === 1) return `${names[0]} is typing...`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
  if (names.length === 3) return `${names[0]}, ${names[1]}, and ${names[2]} are typing...`;
  return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`;
}

function publishRelayTypingState(active, { force = false, room: roomOverride = "" } = {}) {
  const prefs = getPreferences();
  if (!["ws", "http", "xmpp"].includes(prefs.relayMode)) return false;
  const current = getCurrentAccount();
  if (!current) return false;
  const room = roomOverride || relayRoomForActiveConversation();
  if (!room) return false;
  const now = Date.now();
  if (!force && active && relayLocalTypingState.active && relayLocalTypingState.room === room && (now - relayLocalTypingState.lastSentAt) < RELAY_TYPING_THROTTLE_MS) {
    return true;
  }
  if (!force && !active && !relayLocalTypingState.active && relayLocalTypingState.room === room) return true;
  const typingPayload = {
    state: active ? "composing" : "paused",
    active: Boolean(active),
    ts: new Date().toISOString(),
    authorUsername: current.username,
    authorDisplay: current.displayName || current.username
  };
  if (prefs.relayMode === "xmpp") {
    if (!xmppConnection) return false;
    if (relayStatus !== "connected") return false;
    const roomJid = xmppRoomJidForToken(room, prefs);
    if (!roomJid) return false;
    joinXmppRoom(room, current);
    const stateNode = active ? "composing" : "paused";
    const stanza = globalThis.$msg({ to: roomJid, type: "groupchat" }).c(stateNode, { xmlns: "http://jabber.org/protocol/chatstates" });
    xmppConnection.send(stanza);
    relayLocalTypingState.active = Boolean(active);
    relayLocalTypingState.room = room;
    relayLocalTypingState.lastSentAt = now;
    return true;
  }
  if (prefs.relayMode === "http") {
    const endpoint = new URL(normalizeRelayUrl(prefs.relayUrl).replace(/^ws:/i, "http:").replace(/^wss:/i, "https:"));
    endpoint.pathname = "/chat";
    fetch(endpoint.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "typing",
        room,
        clientId: relayClientId(),
        username: current.username,
        typing: typingPayload
      })
    }).catch(() => {
      setRelayStatus("error", "HTTP relay typing failed");
    });
    relayLocalTypingState.active = Boolean(active);
    relayLocalTypingState.room = room;
    relayLocalTypingState.lastSentAt = now;
    return true;
  }
  if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return false;
  if (relayJoinedRoom !== room) joinRelayRoom(room);
  const ok = sendRelayPacket({
    type: "typing",
    room,
    clientId: relayClientId(),
    username: current.username,
    typing: typingPayload
  });
  if (ok) {
    relayLocalTypingState.active = Boolean(active);
    relayLocalTypingState.room = room;
    relayLocalTypingState.lastSentAt = now;
  }
  return ok;
}

function updateComposerTypingPublish() {
  const text = (ui.messageInput?.value || "").toString();
  const hasContent = text.trim().length > 0;
  if (!hasContent) {
    publishRelayTypingState(false);
    return;
  }
  publishRelayTypingState(true);
}

function xmppRoomJidForToken(roomToken, prefs = getPreferences()) {
  const direct = (roomToken || "").toString();
  if (/^xmpp:/i.test(direct)) {
    return normalizeXmppJid(direct.slice(5)).toLowerCase();
  }
  const mucService = resolveXmppMucService(prefs);
  if (!mucService) return "";
  const node = sanitizeChannelName((roomToken || "lobby-general").replace(/[:]/g, "-"), "lobby-general");
  return `${node}@${mucService}`;
}

function xmppDomainFromJid(jid) {
  const raw = (jid || "").toString().trim();
  const at = raw.indexOf("@");
  if (at < 0) return "";
  return raw.slice(at + 1).toLowerCase();
}

function shouldUsePlainOnlySasl(jid, wsUrl = "") {
  const jidDomain = xmppDomainFromJid(jid);
  if (jidDomain && XMPP_PLAIN_ONLY_DOMAINS.has(jidDomain)) return true;
  try {
    const host = new URL(normalizeXmppWsUrl(wsUrl) || "").hostname.toLowerCase();
    if (!host) return false;
    for (const domain of XMPP_PLAIN_ONLY_DOMAINS.values()) {
      if (host === domain || host.endsWith(`.${domain}`)) return true;
    }
  } catch {
    // Ignore URL parse errors.
  }
  return false;
}

function stropheConnectionOptionsForXmpp({ jid, wsUrl }) {
  const options = { keepalive: true };
  const stropheApi = globalThis.Strophe;
  if (!stropheApi) return options;
  if (shouldUsePlainOnlySasl(jid, wsUrl) && stropheApi.SASLPlain) {
    options.mechanisms = [stropheApi.SASLPlain];
    addXmppDebugEvent("connect", "Using PLAIN-only SASL workaround", {
      jid: normalizeXmppJid(jid),
      wsUrl: normalizeXmppWsUrl(wsUrl)
    });
  }
  return options;
}

function resolveXmppMucService(prefs = getPreferences()) {
  const explicit = normalizeXmppMucService(prefs.xmppMucService);
  if (explicit) return explicit;
  const domain = xmppDomainFromJid(prefs.xmppJid);
  return domain ? `conference.${domain}` : "";
}

function resolveXmppServiceUrl(prefs = getPreferences()) {
  const explicit = normalizeXmppWsUrl(prefs.xmppWsUrl);
  if (explicit) return explicit;
  const domain = xmppDomainFromJid(prefs.xmppJid);
  if (!domain) return "";
  return `wss://api.${domain}/ws`;
}

async function loadXmppLibrary() {
  if (xmppRuntimeReady && globalThis.Strophe && globalThis.$msg && globalThis.$pres) return true;
  if (xmppLoadingPromise) return xmppLoadingPromise;
  xmppRuntimeLastError = "";
  addXmppDebugEvent("runtime", "Loading XMPP runtime", {
    sources: ["./vendor/strophe.umd.min.js", "./node_modules/strophe.js/dist/strophe.umd.min.js", "cdn fallbacks"]
  });
  xmppLoadingPromise = (async () => {
    const errors = [];
    const urls = [
      "./vendor/strophe.umd.min.js",
      "vendor/strophe.umd.min.js",
      "./node_modules/strophe.js/dist/strophe.umd.min.js",
      "node_modules/strophe.js/dist/strophe.umd.min.js",
      "https://cdn.jsdelivr.net/npm/strophe.js@1.6.2/dist/strophe.min.js",
      "https://unpkg.com/strophe.js@1.6.2/dist/strophe.min.js"
    ];
    for (const url of urls) {
      addXmppDebugEvent("runtime", "Trying runtime source", { url });
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = url;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`failed: ${url}`));
          document.head.appendChild(script);
        });
        if (globalThis.Strophe && globalThis.$msg && globalThis.$pres) {
          xmppRuntimeReady = true;
          xmppRuntimeLastError = "";
          xmppLoadingPromise = null;
          addXmppDebugEvent("runtime", "XMPP runtime loaded", { url });
          return true;
        }
      } catch (error) {
        addXmppDebugEvent("runtime", "Runtime source failed", { url, error: String(error?.message || error) });
        errors.push(error?.message || String(error) || `failed: ${url}`);
      }
    }
    xmppRuntimeLastError = errors.length > 0 ? errors.join(" | ") : "Unknown XMPP runtime load failure.";
    xmppLoadingPromise = null;
    addXmppDebugEvent("error", "XMPP runtime load failed", { error: xmppRuntimeLastError });
    return false;
  })();
  return xmppLoadingPromise;
}

function joinXmppRoom(roomToken, account = getCurrentAccount()) {
  if (!xmppConnection || !account) return false;
  if (relayStatus !== "connected") return false;
  if (xmppConnection.authenticated === false || xmppConnection.connected === false) return false;
  const prefs = getPreferences();
  const roomJid = xmppRoomJidForToken(roomToken, prefs);
  if (!roomJid) return false;
  if (xmppRoomByJid.has(roomJid)) return true;
  const nick = sanitizeChannelName(account.username || "user", "user");
  const presence = globalThis.$pres({ to: `${roomJid}/${nick}` })
    .c("x", { xmlns: "http://jabber.org/protocol/muc" });
  xmppConnection.send(presence);
  xmppRoomByJid.set(roomJid, roomToken);
  addXmppDebugEvent("presence", "Joined MUC room", { roomToken, roomJid, nick });
  return true;
}

function teardownXmppConnection() {
  addXmppDebugEvent("connect", "Tearing down XMPP connection");
  if (xmppConnection) {
    try {
      xmppConnection.disconnect();
    } catch {
      // Ignore disconnect errors.
    }
  }
  xmppConnection = null;
  xmppRoomByJid.clear();
}

function sendRelayPacket(packet) {
  if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return false;
  try {
    relaySocket.send(JSON.stringify(packet));
    return true;
  } catch {
    return false;
  }
}

function joinRelayRoom(room) {
  if (!room) return false;
  const current = getCurrentAccount();
  if (!current) return false;
  const prefs = getPreferences();
  if (prefs.relayMode === "http") {
    relayJoinedRoom = room;
    connectRelaySocket({ force: true });
    return true;
  }
  const ok = sendRelayPacket({
    type: "join",
    room,
    clientId: relayClientId(),
    username: current.username
  });
  if (ok) relayJoinedRoom = room;
  return ok;
}

function clearRelayReconnectTimer() {
  if (!relayReconnectTimer) return;
  clearTimeout(relayReconnectTimer);
  relayReconnectTimer = null;
}

function scheduleRelayReconnect() {
  const prefs = getPreferences();
  if (prefs.relayAutoConnect !== "on") return;
  if (!["ws", "http", "xmpp"].includes(prefs.relayMode)) return;
  clearRelayReconnectTimer();
  relayReconnectTimer = setTimeout(() => {
    relayReconnectTimer = null;
    connectRelaySocket();
  }, 1600);
}

function disconnectRelaySocket({ manual = true } = {}) {
  if (relayLocalTypingState.active && relayLocalTypingState.room) {
    publishRelayTypingState(false, { force: true, room: relayLocalTypingState.room });
  }
  relayManualDisconnect = manual;
  clearRelayReconnectTimer();
  relayJoinedRoom = "";
  if (relayEventSource) {
    try {
      relayEventSource.close();
    } catch {
      // Ignore close errors for stale EventSource.
    }
  }
  relayEventSource = null;
  if (relaySocket) {
    try {
      relaySocket.close();
    } catch {
      // Ignore close errors for stale sockets.
    }
  }
  relaySocket = null;
  teardownXmppConnection();
  clearRelayTypingState();
  setRelayStatus("disconnected");
}

function resolveRelayTargetChannel() {
  const conversation = getActiveConversation();
  if (conversation?.type === "channel" && conversation.channel) return conversation.channel;
  const guild = getActiveGuild();
  if (!guild) return null;
  return guild.channels.find((entry) => ["text", "announcement", "forum", "media"].includes(entry.type)) || guild.channels[0] || null;
}

function applyRelayIncomingMessage(packet) {
  const current = getCurrentAccount();
  if (!current) return;
  const remoteClientId = (packet.clientId || "").toString();
  if (!remoteClientId || remoteClientId === relayClientId()) return;
  const room = (packet.room || "").toString();
  clearRelayTypingForClient(room, remoteClientId);
  const remoteMessage = packet.message;
  if (!remoteMessage || typeof remoteMessage !== "object") return;
  if (remoteClientId.startsWith("xmpp:")) {
    const mine = normalizeUsername(getCurrentAccount()?.username || "");
    const theirs = normalizeUsername(remoteMessage.authorUsername || "");
    if (mine && theirs && mine === theirs) return;
  }
  const relayId = `${remoteClientId}:${(remoteMessage.id || createId()).toString()}`;
  if (relaySeenMessageIds.has(relayId)) return;
  relaySeenMessageIds.add(relayId);
  if (relaySeenMessageIds.size > 280) {
    const first = relaySeenMessageIds.values().next().value;
    relaySeenMessageIds.delete(first);
  }
  const username = normalizeUsername(remoteMessage.authorUsername || `relay_${remoteClientId.slice(0, 6)}`) || `relay_${remoteClientId.slice(0, 6)}`;
  let remoteAccount = getAccountByUsername(username);
  if (!remoteAccount) {
    remoteAccount = createAccount(username, remoteMessage.authorDisplay || username);
    state.accounts.push(remoteAccount);
  }
  if (remoteMessage.authorDisplay) {
    remoteAccount.displayName = remoteMessage.authorDisplay.toString().slice(0, 32) || remoteAccount.displayName;
  }
  const entry = {
    id: createId(),
    relayId,
    userId: remoteAccount.id,
    authorName: "",
    text: (remoteMessage.text || "").toString().slice(0, 400),
    ts: remoteMessage.ts || new Date().toISOString(),
    reactions: [],
    attachments: Array.isArray(remoteMessage.attachments) ? remoteMessage.attachments.slice(0, 4) : []
  };
  if (room.startsWith("dm:")) {
    const thread = getOrCreateDmThread(current, remoteAccount);
    if (!thread) return;
    thread.messages.push(entry);
    ensureDmReadState(thread);
    saveState();
    renderDmList();
    if (state.viewMode === "dm" && state.activeDmId === thread.id) renderMessages();
    return;
  }
  const targetChannel = findRelayTargetChannelByRoom(room) || resolveRelayTargetChannel();
  if (!targetChannel || targetChannel.type === "voice" || targetChannel.type === "stage") return;
  ensureChannelReadState(targetChannel);
  targetChannel.messages.push(entry);
  saveState();
  renderChannels();
  renderServers();
  if (state.activeChannelId === targetChannel.id) renderMessages();
}

function connectRelaySocket({ force = false } = {}) {
  const prefs = getPreferences();
  const current = getCurrentAccount();
  if (!current) {
    disconnectRelaySocket({ manual: true });
    return false;
  }
  if (prefs.relayMode === "xmpp") {
    const jid = normalizeXmppJid(prefs.xmppJid);
    const wsUrl = resolveXmppServiceUrl(prefs);
    const mucService = resolveXmppMucService(prefs);
    addXmppDebugEvent("connect", "Relay connect requested (XMPP)", { jid, wsUrl, mucService, force });
    if (!jid || !wsUrl || !mucService) {
      addXmppDebugEvent("error", "XMPP connect blocked: missing required fields", {
        jid: Boolean(jid),
        wsUrl: Boolean(wsUrl),
        mucService: Boolean(mucService)
      });
      setRelayStatus("error", "XMPP requires JID, WebSocket URL, and MUC service.");
      return false;
    }
    if (xmppConnection && !force) return true;
    disconnectRelaySocket({ manual: false });
    relayManualDisconnect = false;
    setRelayStatus("connecting");
    loadXmppLibrary().then((ok) => {
      if (!ok) {
        addXmppDebugEvent("error", "Failed to load runtime during XMPP relay connect", { error: xmppRuntimeLastError || "" });
        setRelayStatus("error", `Failed to load Strophe runtime. ${xmppRuntimeLastError || ""}`.trim());
        scheduleRelayReconnect();
        return;
      }
      try {
        xmppConnection = new globalThis.Strophe.Connection(wsUrl, stropheConnectionOptionsForXmpp({
          jid,
          wsUrl
        }));
        addXmppDebugEvent("connect", "Created Strophe connection", { wsUrl });
      } catch (error) {
        addXmppDebugEvent("error", "Failed to construct Strophe connection", { wsUrl, error: String(error) });
        setRelayStatus("error", String(error));
        scheduleRelayReconnect();
        return;
      }
      xmppConnection.rawInput = (raw) => {
        addXmppDebugEvent("raw", "RX", trimXmppRaw(raw));
      };
      xmppConnection.rawOutput = (raw) => {
        addXmppDebugEvent("raw", "TX", trimXmppRaw(raw));
      };
      const originalSend = xmppConnection.send.bind(xmppConnection);
      xmppConnection.send = (stanza) => {
        addXmppDebugEvent("stanza", "send()", trimXmppRaw(xmppSerializePayload(stanza)));
        return originalSend(stanza);
      };
      const originalSendIQ = xmppConnection.sendIQ.bind(xmppConnection);
      xmppConnection.sendIQ = (stanza, success, error, timeout) => {
        addXmppDebugEvent("iq", "sendIQ()", trimXmppRaw(xmppSerializePayload(stanza)));
        return originalSendIQ(stanza, success, error, timeout);
      };
      xmppConnection.addHandler((stanza) => {
        try {
          addXmppDebugEvent("message", "Incoming stanza", trimXmppRaw(xmppSerializePayload(stanza)));
          const from = stanza.getAttribute("from") || "";
          const type = stanza.getAttribute("type") || "";
          if (type && !["groupchat", "chat", "normal", ""].includes(type)) return true;
          const roomJid = from.split("/")[0] || "";
          const nick = from.split("/")[1] || "";
          const roomToken = xmppRoomByJid.get(roomJid) || `xmpp:${roomJid}`;
          const hasComposing = stanza.getElementsByTagName("composing").length > 0;
          const hasPaused = stanza.getElementsByTagName("paused").length > 0;
          const hasInactive = stanza.getElementsByTagName("inactive").length > 0;
          const hasGone = stanza.getElementsByTagName("gone").length > 0;
          const hasActive = stanza.getElementsByTagName("active").length > 0;
          if (hasComposing || hasPaused || hasInactive || hasGone || hasActive) {
            applyRelayIncomingTyping({
              type: "typing",
              room: roomToken,
              clientId: `xmpp:${from}`,
              username: nick || roomJid.split("@")[0] || "xmpp",
              typing: {
                state: hasComposing ? "composing" : "paused",
                active: hasComposing,
                authorUsername: nick || roomJid.split("@")[0] || "xmpp",
                authorDisplay: nick || ""
              }
            });
          }
          const bodyNode = stanza.getElementsByTagName("body")[0];
          if (!bodyNode) return true;
          const text = globalThis.Strophe.getText(bodyNode) || "";
          if (!text.trim()) return true;
          applyRelayIncomingMessage({
            type: "chat",
            room: roomToken,
            clientId: `xmpp:${from}`,
            message: {
              id: createId(),
              text,
              ts: new Date().toISOString(),
              authorUsername: nick || roomJid.split("@")[0] || "xmpp",
              authorDisplay: nick || ""
            }
          });
        } catch {
          addXmppDebugEvent("error", "Malformed incoming XMPP stanza");
          // Ignore malformed XMPP messages.
        }
        return true;
      }, null, "message", null, null, null);
      xmppConnection.connect(jid, prefs.xmppPassword || "", (status) => {
        const S = globalThis.Strophe.Status;
        const statusName = Object.entries(S || {}).find(([, value]) => value === status)?.[0] || String(status);
        addXmppDebugEvent("connect", "Relay status callback", { status: statusName, wsUrl, jid });
        if (status === S.CONNECTING) {
          setRelayStatus("connecting");
          return;
        }
        if (status === S.AUTHENTICATING) {
          setRelayStatus("connecting", "Authenticating");
          return;
        }
        if (status === S.CONNECTED) {
          setRelayStatus("connected");
          xmppConnection.send(globalThis.$pres());
          Promise.allSettled([
            fetchXmppRoster(xmppConnection),
            fetchXmppBookmarks(xmppConnection)
          ]).then((results) => {
            const rosterItems = results[0]?.status === "fulfilled" ? results[0].value : [];
            const bookmarkItems = results[1]?.status === "fulfilled" ? results[1].value : [];
            addXmppDebugEvent("connect", "XMPP sync complete", {
              rosterCount: rosterItems.length,
              bookmarkCount: bookmarkItems.length
            });
            syncXmppRosterIntoState(rosterItems, getPreferences(), current);
            upsertXmppSpaceChannels(bookmarkItems, getPreferences(), current);
            saveState();
            renderServers();
            renderDmList();
            renderChannels();
          }).catch(() => {
            // Keep transport connected even if roster/bookmark sync fails.
          });
          const room = relayRoomForActiveConversation();
          joinXmppRoom(room, current);
          relayJoinedRoom = room;
          addXmppDebugEvent("presence", "Joined initial relay room", { room });
          return;
        }
        if (status === S.DISCONNECTED) {
          xmppConnection = null;
          if (relayManualDisconnect) {
            setRelayStatus("disconnected");
            return;
          }
          setRelayStatus("error", "XMPP disconnected");
          scheduleRelayReconnect();
          return;
        }
        if (status === S.AUTHFAIL) {
          addXmppDebugEvent("error", "Relay auth failed; auto-reconnect suppressed after AUTHFAIL", {
            wsUrl,
            jid
          });
          setRelayStatus("error", "XMPP authentication failed");
          return;
        }
        if (status === S.CONNFAIL || status === S.ERROR) {
          addXmppDebugEvent("error", "Relay connect/auth failed", {
            status: statusName,
            wsUrl,
            jid
          });
          setRelayStatus("error", status === S.AUTHFAIL ? "XMPP authentication failed" : "XMPP connection failed");
          scheduleRelayReconnect();
        }
      });
    }).catch((error) => {
      addXmppDebugEvent("error", "Relay connect promise rejected", { error: String(error) });
      setRelayStatus("error", String(error));
      scheduleRelayReconnect();
    });
    return true;
  }
  if (prefs.relayMode === "http") {
    if (relayEventSource && !force) return true;
    if (relayEventSource) relayEventSource.close();
    relayEventSource = null;
    relayManualDisconnect = false;
    const room = relayRoomForActiveConversation();
    relayJoinedRoom = room;
    const url = new URL(normalizeRelayUrl(prefs.relayUrl).replace(/^ws:/i, "http:").replace(/^wss:/i, "https:"));
    url.pathname = "/events";
    url.searchParams.set("room", room);
    url.searchParams.set("clientId", relayClientId());
    url.searchParams.set("username", current.username);
    setRelayStatus("connecting");
    try {
      relayEventSource = new EventSource(url.toString());
    } catch (error) {
      setRelayStatus("error", String(error));
      scheduleRelayReconnect();
      return false;
    }
    relayEventSource.addEventListener("open", () => {
      setRelayStatus("connected");
    });
    relayEventSource.addEventListener("message", (event) => {
      let data = null;
      try {
        data = JSON.parse(event.data || "{}");
      } catch {
        return;
      }
      if (!data || typeof data !== "object") return;
      if (data.type === "chat") applyRelayIncomingMessage(data);
      if (data.type === "typing") applyRelayIncomingTyping(data);
    });
    relayEventSource.addEventListener("error", () => {
      if (relayManualDisconnect) return;
      setRelayStatus("error", "HTTP relay stream error");
      scheduleRelayReconnect();
    });
    return true;
  }
  if (prefs.relayMode !== "ws") {
    disconnectRelaySocket({ manual: true });
    return false;
  }
  if (relaySocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(relaySocket.readyState) && !force) {
    return true;
  }
  if (relaySocket) disconnectRelaySocket({ manual: false });
  relayManualDisconnect = false;
  const url = normalizeRelayUrl(prefs.relayUrl);
  try {
    relaySocket = new WebSocket(url);
  } catch (error) {
    setRelayStatus("error", String(error));
    scheduleRelayReconnect();
    return false;
  }
  setRelayStatus("connecting");
  relaySocket.addEventListener("open", () => {
    setRelayStatus("connected");
    const room = relayRoomForActiveConversation();
    joinRelayRoom(room);
  });
  relaySocket.addEventListener("message", (event) => {
    let data = null;
    try {
      data = JSON.parse(event.data || "{}");
    } catch {
      return;
    }
    if (!data || typeof data !== "object") return;
    if (data.type === "chat") applyRelayIncomingMessage(data);
    if (data.type === "typing") applyRelayIncomingTyping(data);
    if (data.type === "joined" && data.room) relayJoinedRoom = data.room.toString();
  });
  relaySocket.addEventListener("error", () => {
    setRelayStatus("error", "WebSocket error");
  });
  relaySocket.addEventListener("close", () => {
    relaySocket = null;
    if (relayManualDisconnect) {
      setRelayStatus("disconnected");
      return;
    }
    setRelayStatus("error", "Connection closed");
    scheduleRelayReconnect();
  });
  return true;
}

function syncRelayRoomForActiveConversation() {
  const prefs = getPreferences();
  if (!["ws", "http", "xmpp"].includes(prefs.relayMode)) return;
  const nextRoom = relayRoomForActiveConversation();
  if (relayLocalTypingState.active && relayLocalTypingState.room && relayLocalTypingState.room !== nextRoom) {
    publishRelayTypingState(false, { force: true, room: relayLocalTypingState.room });
  }
  if (prefs.relayMode === "xmpp") {
    if (!xmppConnection) return;
    if (!nextRoom || nextRoom === relayJoinedRoom) return;
    const ok = joinXmppRoom(nextRoom, getCurrentAccount());
    if (!ok) return;
    relayJoinedRoom = nextRoom;
    return;
  }
  if (prefs.relayMode === "http") {
    if (!nextRoom || nextRoom === relayJoinedRoom) return;
    joinRelayRoom(nextRoom);
    return;
  }
  if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return;
  if (!nextRoom || nextRoom === relayJoinedRoom) return;
  joinRelayRoom(nextRoom);
}

function relayMessageBodyText(message) {
  const text = (message?.text || "").toString().slice(0, 400);
  const links = (Array.isArray(message?.attachments) ? message.attachments : [])
    .filter((entry) => entry && typeof entry === "object" && entry.url)
    .slice(0, 3)
    .map((entry) => (entry.url || "").toString().slice(0, 640))
    .filter(Boolean);
  if (links.length === 0) return text;
  return [text, ...links].filter(Boolean).join("\n");
}

function publishRelayChannelMessage(channel, message, account) {
  const prefs = getPreferences();
  if (!["ws", "http", "xmpp"].includes(prefs.relayMode)) return false;
  if (!channel || !message || !account) return false;
  const guild = getActiveGuild();
  const room = relayRoomForActiveConversation();
  if (!room) return false;
  if (prefs.relayMode === "xmpp") {
    if (!xmppConnection) return false;
    if (relayStatus !== "connected") return false;
    const roomJid = xmppRoomJidForToken(room, prefs);
    if (!roomJid) {
      setRelayStatus("error", "XMPP MUC service not configured.");
      return false;
    }
    joinXmppRoom(room, account);
    const body = relayMessageBodyText(message);
    if (!body) return false;
    const stanza = globalThis.$msg({ to: roomJid, type: "groupchat" }).c("body").t(body);
    xmppConnection.send(stanza);
    return true;
  }
  if (prefs.relayMode === "http") {
    const endpoint = new URL(normalizeRelayUrl(prefs.relayUrl).replace(/^ws:/i, "http:").replace(/^wss:/i, "https:"));
    endpoint.pathname = "/chat";
    const payload = {
      type: "chat",
      room,
      clientId: relayClientId(),
      guildName: guild?.name || "",
      channelName: channel.name || "",
      message: {
        id: message.id,
        text: (message.text || "").toString().slice(0, 400),
        ts: message.ts || new Date().toISOString(),
        authorUsername: account.username,
        authorDisplay: displayNameForAccount(account, guild?.id || null),
        attachments: (Array.isArray(message.attachments) ? message.attachments : [])
          .filter((entry) => entry && typeof entry === "object" && entry.url)
          .slice(0, 4)
          .map((entry) => ({
            type: (entry.type || "image").toString().slice(0, 16),
            url: (entry.url || "").toString().slice(0, 640),
            name: (entry.name || "file").toString().slice(0, 80),
            format: (entry.format || "image").toString().slice(0, 24)
          }))
      }
    };
    fetch(endpoint.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {
      setRelayStatus("error", "HTTP relay post failed");
    });
    return true;
  }
  if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return false;
  if (relayJoinedRoom !== room) joinRelayRoom(room);
  return sendRelayPacket({
    type: "chat",
    room,
    clientId: relayClientId(),
    guildName: guild?.name || "",
    channelName: channel.name || "",
    message: {
      id: message.id,
      text: (message.text || "").toString().slice(0, 400),
      ts: message.ts || new Date().toISOString(),
      authorUsername: account.username,
      authorDisplay: displayNameForAccount(account, guild?.id || null),
      attachments: (Array.isArray(message.attachments) ? message.attachments : [])
        .filter((entry) => entry && typeof entry === "object" && entry.url)
        .slice(0, 4)
        .map((entry) => ({
          type: (entry.type || "image").toString().slice(0, 16),
          url: (entry.url || "").toString().slice(0, 640),
          name: (entry.name || "file").toString().slice(0, 80),
          format: (entry.format || "image").toString().slice(0, 24)
        }))
    }
  });
}

function publishRelayDirectMessage(thread, message, account) {
  const prefs = getPreferences();
  if (!["ws", "http", "xmpp"].includes(prefs.relayMode)) return false;
  if (!thread || !message || !account) return false;
  const participants = (thread.participantIds || [])
    .map((id) => getAccountById(id))
    .filter(Boolean)
    .map((entry) => normalizeUsername(entry.username || ""))
    .filter(Boolean)
    .sort();
  if (participants.length < 2) return false;
  const room = `dm:${participants.slice(0, 2).join(":")}`;
  if (prefs.relayMode === "xmpp") {
    if (!xmppConnection) return false;
    if (relayStatus !== "connected") return false;
    const roomJid = xmppRoomJidForToken(room, prefs);
    if (!roomJid) {
      setRelayStatus("error", "XMPP MUC service not configured.");
      return false;
    }
    joinXmppRoom(room, account);
    const body = relayMessageBodyText(message);
    if (!body) return false;
    const stanza = globalThis.$msg({ to: roomJid, type: "groupchat" }).c("body").t(body);
    xmppConnection.send(stanza);
    return true;
  }
  if (prefs.relayMode === "http") {
    const endpoint = new URL(normalizeRelayUrl(prefs.relayUrl).replace(/^ws:/i, "http:").replace(/^wss:/i, "https:"));
    endpoint.pathname = "/chat";
    fetch(endpoint.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "chat",
        room,
        clientId: relayClientId(),
        guildName: "",
        channelName: "dm",
        message: {
          id: message.id,
          text: (message.text || "").toString().slice(0, 400),
          ts: message.ts || new Date().toISOString(),
          authorUsername: account.username,
          authorDisplay: account.displayName || account.username,
          attachments: (Array.isArray(message.attachments) ? message.attachments : []).slice(0, 4)
        }
      })
    }).catch(() => {
      setRelayStatus("error", "HTTP relay post failed");
    });
    return true;
  }
  if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return false;
  if (relayJoinedRoom !== room) joinRelayRoom(room);
  return sendRelayPacket({
    type: "chat",
    room,
    clientId: relayClientId(),
    guildName: "",
    channelName: "dm",
    message: {
      id: message.id,
      text: (message.text || "").toString().slice(0, 400),
      ts: message.ts || new Date().toISOString(),
      authorUsername: account.username,
      authorDisplay: account.displayName || account.username,
      attachments: (Array.isArray(message.attachments) ? message.attachments : []).slice(0, 4)
    }
  });
}

function getGuildNotificationMode(guildId) {
  if (!guildId) return "all";
  const prefs = getPreferences();
  return prefs.guildNotifications[guildId] || "all";
}

function setGuildNotificationMode(guildId, mode) {
  if (!guildId) return;
  state.preferences = getPreferences();
  state.preferences.guildNotifications = {
    ...state.preferences.guildNotifications,
    [guildId]: normalizeGuildNotificationMode(mode)
  };
}

function applyGuildNotificationModeToStats(stats, mode) {
  if (mode === "mute") return { unread: 0, mentions: 0 };
  if (mode === "mentions") return { unread: 0, mentions: stats.mentions };
  return stats;
}

function isForumThreadCollapsed(channelId, threadId) {
  if (!channelId || !threadId) return false;
  const prefs = getPreferences();
  return Boolean(prefs.forumCollapsedThreads?.[channelId]?.[threadId]);
}

function setForumThreadCollapsed(channelId, threadId, collapsed) {
  if (!channelId || !threadId) return;
  state.preferences = getPreferences();
  const current = state.preferences.forumCollapsedThreads || {};
  state.preferences.forumCollapsedThreads = {
    ...current,
    [channelId]: {
      ...(current[channelId] || {}),
      [threadId]: Boolean(collapsed)
    }
  };
}

function getForumThreadReadTimestamp(channelId, threadId) {
  if (!channelId || !threadId) return "";
  const prefs = getPreferences();
  return prefs.forumThreadReadState?.[channelId]?.[threadId] || "";
}

function setForumThreadReadTimestamp(channelId, threadId, tsValue) {
  if (!channelId || !threadId) return;
  state.preferences = getPreferences();
  const current = state.preferences.forumThreadReadState || {};
  state.preferences.forumThreadReadState = {
    ...current,
    [channelId]: {
      ...(current[channelId] || {}),
      [threadId]: typeof tsValue === "string" ? tsValue : new Date().toISOString()
    }
  };
}

function getForumThreadSortMode(channelId) {
  if (!channelId) return "latest";
  const prefs = getPreferences();
  return prefs.forumThreadSort?.[channelId] === "created" ? "created" : "latest";
}

function setForumThreadSortMode(channelId, mode) {
  if (!channelId) return;
  state.preferences = getPreferences();
  state.preferences.forumThreadSort = {
    ...(state.preferences.forumThreadSort || {}),
    [channelId]: mode === "created" ? "created" : "latest"
  };
}

function getForumThreadTagFilter(channelId) {
  if (!channelId) return [];
  const prefs = getPreferences();
  return Array.isArray(prefs.forumThreadTagFilter?.[channelId]) ? prefs.forumThreadTagFilter[channelId] : [];
}

function setForumThreadTagFilter(channelId, tagIds) {
  if (!channelId) return;
  state.preferences = getPreferences();
  const current = state.preferences.forumThreadTagFilter || {};
  const normalized = [...new Set((Array.isArray(tagIds) ? tagIds : []).map((id) => (id || "").toString()).filter(Boolean))].slice(0, 8);
  if (normalized.length === 0) {
    const next = { ...current };
    delete next[channelId];
    state.preferences.forumThreadTagFilter = next;
    return;
  }
  state.preferences.forumThreadTagFilter = {
    ...current,
    [channelId]: normalized
  };
}

function toggleForumThreadTagFilter(channelId, tagId) {
  if (!channelId || !tagId) return;
  const current = getForumThreadTagFilter(channelId);
  const has = current.includes(tagId);
  const next = has ? current.filter((entry) => entry !== tagId) : [...current, tagId];
  setForumThreadTagFilter(channelId, next);
}

function forumTagsForChannel(channel) {
  return normalizeForumTags(channel?.forumTags || []);
}

function resolveForumTagByName(channel, name) {
  const normalizedName = sanitizeForumTagName(name);
  if (!normalizedName) return null;
  const tags = forumTagsForChannel(channel);
  return tags.find((tag) => tag.name === normalizedName) || null;
}

function swfAutoplayFromPreferences() {
  return getPreferences().swfAutoplay === "off" ? "off" : "on";
}

function resolveAccountGuildNickname(account, guildId) {
  if (!account || !guildId) return "";
  if (!account.guildProfiles || typeof account.guildProfiles !== "object") return "";
  const profile = account.guildProfiles[guildId];
  return (profile?.nickname || "").toString().trim().slice(0, 32);
}

function displayNameForAccount(account, guildId = null) {
  if (!account) return "Unknown";
  const nick = resolveAccountGuildNickname(account, guildId);
  if (nick) return nick;
  return account.displayName || account.username;
}

function resolveAccountAvatar(account, guildId = null) {
  const fallback = {
    color: account?.avatarColor || "#57f287",
    url: account?.avatarUrl || ""
  };
  if (!account || !guildId || !account.guildProfiles || typeof account.guildProfiles !== "object") {
    return fallback;
  }
  const profile = account.guildProfiles[guildId];
  if (!profile || typeof profile !== "object") return fallback;
  return {
    color: (profile.avatarColor || fallback.color || "#57f287").toString(),
    url: (profile.avatarUrl || fallback.url || "").toString()
  };
}

function resolveAccountBanner(account, guildId = null) {
  const fallback = (account?.banner || "").toString();
  if (!account || !guildId || !account.guildProfiles || typeof account.guildProfiles !== "object") return fallback;
  const profile = account.guildProfiles[guildId];
  if (!profile || typeof profile !== "object") return fallback;
  return (profile.banner || fallback || "").toString();
}

function getMemberTopRoleColor(server, accountId) {
  const roles = getMemberRoles(server, accountId).filter((role) => role.name !== "@everyone");
  if (roles.length === 0) return "";
  const top = roles[roles.length - 1];
  return (top?.color || "").toString();
}

function getMemberTopRoleName(server, accountId) {
  const roles = getMemberRoles(server, accountId).filter((role) => role.name !== "@everyone");
  if (roles.length === 0) return "";
  return (roles[roles.length - 1]?.name || "").toString();
}

function parseStatusExpiryAt(value) {
  const now = new Date();
  if (value === "30m") return new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  if (value === "1h") return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  if (value === "4h") return new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
  if (value === "today") {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }
  return null;
}

function statusExpiryPreset(account) {
  if (!account?.customStatusExpiresAt) return "never";
  const expiry = new Date(account.customStatusExpiresAt).getTime();
  const now = Date.now();
  const delta = Math.max(0, expiry - now);
  if (delta <= 35 * 60 * 1000) return "30m";
  if (delta <= 65 * 60 * 1000) return "1h";
  if (delta <= 4.5 * 60 * 60 * 1000) return "4h";
  return "today";
}

function resolveAccountStatus(account, guildId = null) {
  if (!account) return { text: "", emoji: "" };
  if (guildId && account.guildProfiles && typeof account.guildProfiles === "object") {
    const profile = account.guildProfiles[guildId];
    const guildStatus = (profile?.status || "").toString().trim().slice(0, 80);
    if (guildStatus) {
      return {
        text: guildStatus,
        emoji: (profile?.statusEmoji || account.customStatusEmoji || "").toString().trim().slice(0, 4)
      };
    }
  }
  return {
    text: (account.customStatus || "").trim(),
    emoji: (account.customStatusEmoji || "").trim().slice(0, 4)
  };
}

function pruneExpiredStatuses() {
  let changed = false;
  const now = Date.now();
  state.accounts.forEach((account) => {
    if (!account?.customStatusExpiresAt) return;
    const expiry = Date.parse(account.customStatusExpiresAt);
    if (!Number.isFinite(expiry) || expiry > now) return;
    account.customStatus = "";
    account.customStatusEmoji = "";
    account.customStatusExpiresAt = null;
    changed = true;
  });
  return changed;
}

function displayStatus(account, guildId = null) {
  if (!account) return "Offline";
  const status = resolveAccountStatus(account, guildId);
  const statusText = status.text;
  if (statusText) {
    const emoji = status.emoji;
    return emoji ? `${emoji} ${statusText}` : statusText;
  }
  return presenceLabel(account.presence);
}

function accountDecorationEmoji(account) {
  return (account?.avatarDecoration || "").toString().trim().slice(0, 4);
}

function accountGuildTag(account) {
  return (account?.guildTag || "").toString().trim().slice(0, 8);
}

function accountProfileEffect(account) {
  return normalizeProfileEffect(account?.profileEffect);
}

function accountNameplateSvg(account) {
  const raw = (account?.profileNameplateSvg || "").toString().trim().slice(0, 280);
  if (!raw) return "";
  if (/^data:image\/svg\+xml/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
}

function showGuildTagInfo(account) {
  if (!account) return;
  const tag = accountGuildTag(account);
  if (!tag) return;
  const guild = getActiveGuild();
  const details = guild
    ? `${tag} · ${guild.name}`
    : `${tag} · no active guild`;
  showToast(details);
}

function channelTypePrefix(channel) {
  if (!channel || channel.type === "text") return "#";
  if (channel.type === "announcement") return "📣";
  if (channel.type === "forum") return "🗂";
  if (channel.type === "media") return "🖼";
  if (channel.type === "voice") return "🔊";
  if (channel.type === "stage") return "🎙";
  return "#";
}

function channelTypeSymbol(channel) {
  if (!channel || channel.type === "text") return "#";
  if (channel.type === "announcement") return "📣";
  if (channel.type === "forum") return "🧵";
  if (channel.type === "media") return "🖼";
  if (channel.type === "voice") return "🔊";
  if (channel.type === "stage") return "🎙";
  return "#";
}

function channelHeaderGlyph(channel, mode = "channel") {
  if (mode === "dm") return "@";
  if (!channel || channel.type === "text") return "#";
  if (channel.type === "announcement") return "!";
  if (channel.type === "forum") return "≡";
  if (channel.type === "media") return "▦";
  if (channel.type === "voice") return "◉";
  if (channel.type === "stage") return "◎";
  return "#";
}

function setActiveChannelHeader(label, glyph = "#", title = "") {
  if (ui.activeChannelLabel) ui.activeChannelLabel.textContent = label || "";
  if (ui.activeChannelGlyph) ui.activeChannelGlyph.textContent = glyph || "#";
  if (ui.activeChannelName) {
    ui.activeChannelName.title = title || label || "";
  }
}

function setActiveChannelTopic(text) {
  const nextText = (text || "").toString().trim();
  if (ui.activeChannelTopic) {
    ui.activeChannelTopic.textContent = nextText;
    ui.activeChannelTopic.classList.toggle("chat-topic--empty", !nextText);
  }
}

function activeConversationReferenceText() {
  const conversation = getActiveConversation();
  if (!conversation) return "";
  if (conversation.type === "dm") {
    const current = getCurrentAccount();
    const peerId = conversation.thread?.participantIds?.find((id) => id !== current?.id);
    const peer = peerId ? getAccountById(peerId) : null;
    return peer ? `@${peer.username}` : "@dm";
  }
  const channel = conversation.channel;
  return channel ? `#${channel.name}` : "";
}

function resizeComposerInput() {
  if (!(ui.messageInput instanceof HTMLTextAreaElement)) return;
  ui.messageInput.style.height = "0px";
  const next = Math.max(40, Math.min(160, ui.messageInput.scrollHeight));
  ui.messageInput.style.height = `${next}px`;
}

function isLikelyUrl(value) {
  return /^https?:\/\//i.test((value || "").trim());
}

function isLikelyImageDataUrl(value) {
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test((value || "").trim());
}

function isRenderableAvatarUrl(value) {
  return isLikelyUrl(value) || isLikelyImageDataUrl(value);
}

function applyBannerStyle(element, bannerValue) {
  const value = (bannerValue || "").trim();
  if (!value) {
    element.style.background = "linear-gradient(120deg, #5160f7, #2b45d4)";
    element.style.backgroundImage = "";
    return;
  }
  if (isLikelyUrl(value)) {
    element.style.background = "#2f3136";
    element.style.backgroundImage = `url(${value})`;
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center";
    return;
  }
  element.style.backgroundImage = "";
  element.style.background = value;
}

function applyAvatarStyle(element, account, guildId = null) {
  const avatar = resolveAccountAvatar(account, guildId);
  element.style.backgroundImage = "";
  element.style.backgroundColor = avatar.color || "#57f287";
  if (isRenderableAvatarUrl(avatar.url || "")) {
    element.style.backgroundImage = `url(${avatar.url})`;
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center";
  }
}

function applyAvatarDecoration(element, account) {
  if (!(element instanceof HTMLElement)) return;
  element.classList.toggle("has-decoration", false);
  const existing = element.querySelector(".avatar-decoration");
  if (existing) existing.remove();
  const emoji = accountDecorationEmoji(account);
  if (!emoji) return;
  const badge = document.createElement("span");
  badge.className = "avatar-decoration";
  badge.textContent = emoji;
  badge.title = "Avatar decoration";
  element.appendChild(badge);
  element.classList.toggle("has-decoration", true);
}

function applyNameplateStyle(element, account) {
  if (!(element instanceof HTMLElement)) return;
  const image = accountNameplateSvg(account);
  if (!image) {
    element.style.removeProperty("--nameplate-image");
    element.classList.remove("has-nameplate");
    return;
  }
  element.style.setProperty("--nameplate-image", `url(${image})`);
  element.classList.add("has-nameplate");
}

function renderProfileAvatarPreview() {
  if (!ui.profileAvatarPreview) return;
  ui.profileAvatarPreview.style.backgroundImage = "";
  ui.profileAvatarPreview.style.backgroundColor = ui.profileAvatarInput.value.trim() || "#57f287";
  const avatarUrl = ui.profileAvatarUrlInput.value.trim();
  if (isRenderableAvatarUrl(avatarUrl)) {
    ui.profileAvatarPreview.style.backgroundImage = `url(${avatarUrl})`;
    ui.profileAvatarPreview.style.backgroundSize = "cover";
    ui.profileAvatarPreview.style.backgroundPosition = "center";
  }
}

function renderProfileIdentityPreview() {
  if (!ui.profileIdentityPreview) return;
  const previewAccount = {
    username: "preview",
    displayName: ui.displayNameInput?.value?.trim() || "Preview User",
    avatarColor: ui.profileAvatarInput?.value?.trim() || "#57f287",
    avatarUrl: ui.profileAvatarUrlInput?.value?.trim() || "",
    banner: ui.profileBannerInput?.value?.trim() || "",
    customStatus: ui.profileStatusInput?.value?.trim() || "",
    customStatusEmoji: ui.profileStatusEmojiInput?.value?.trim() || "",
    presence: ui.presenceInput?.value || "online",
    avatarDecoration: ui.profileAvatarDecorationInput?.value?.trim() || "",
    guildTag: ui.profileGuildTagInput?.value?.trim().slice(0, 8).toUpperCase() || "",
    profileEffect: normalizeProfileEffect(ui.profileEffectInput?.value),
    profileNameplateSvg: ui.profileNameplateSvgInput?.value?.trim() || ""
  };
  applyAvatarStyle(ui.profileIdentityPreviewAvatar, previewAccount, null);
  applyAvatarDecoration(ui.profileIdentityPreviewAvatar, previewAccount);
  applyBannerStyle(ui.profileIdentityPreviewBanner, previewAccount.banner);
  ui.profileIdentityPreviewName.textContent = previewAccount.displayName;
  applyNameplateStyle(ui.profileIdentityPreviewName, previewAccount);
  const tag = accountGuildTag(previewAccount);
  if (tag) {
    ui.profileIdentityPreviewName.appendChild(document.createTextNode(" "));
    const chip = document.createElement("span");
    chip.className = "guild-tag-chip";
    chip.textContent = tag;
    ui.profileIdentityPreviewName.appendChild(chip);
  }
  ui.profileIdentityPreviewStatus.textContent = displayStatus(previewAccount, null);
  ui.profileIdentityPreview.classList.remove("profile-effect-aurora", "profile-effect-flame", "profile-effect-ocean");
  const effect = accountProfileEffect(previewAccount);
  if (effect !== "none") ui.profileIdentityPreview.classList.add(`profile-effect-${effect}`);
}

function setProfileAvatarUploadHint(text, isError = false) {
  if (!ui.profileAvatarUploadHint) return;
  ui.profileAvatarUploadHint.textContent = text;
  ui.profileAvatarUploadHint.style.color = isError ? "#f28b82" : "#aeb4bf";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("file_read_failed"));
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${bytes} B`;
}

function inferAttachmentTypeFromFile(file) {
  if (!file) return null;
  const name = (file.name || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  if (name.endsWith(".pdf") || mime === "application/pdf") return "pdf";
  if (name.endsWith(".rtf") || mime === "application/rtf" || mime === "text/rtf") return "rtf";
  if (name.endsWith(".odt") || name.endsWith(".ods") || name.endsWith(".odp")
    || mime.includes("vnd.oasis.opendocument")) return "odf";
  if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(name) || mime.includes("officedocument") || mime === "application/msword") return "odf";
  if (/\.(mp3|ogg|wav|m4a|flac)$/i.test(name) || /^audio\//i.test(mime)) return "audio";
  if (/\.(txt|md|log|json|js|ts|css|xml|yml|yaml|ini|toml)$/i.test(name) || /^text\//i.test(mime)) return "text";
  if (name.endsWith(".swf")) return "swf";
  if (name.endsWith(".svg") || mime === "image/svg+xml") return "svg";
  if (name.endsWith(".html") || name.endsWith(".htm") || mime === "text/html") return "html";
  if (name.endsWith(".bin")) return "bin";
  if (name.endsWith(".gif") || name.endsWith(".webp") || name.endsWith(".mp4") || name.endsWith(".webm") || /^image\//i.test(mime) || /^video\//i.test(mime)) return "gif";
  return "gif";
}

function getComposerAttachAllowedTypes() {
  return new Set(["pdf", "text", "odf", "rtf", "bin", "gif", "audio", "swf", "svg", "html"]);
}

function syncPrimaryComposerAttachment() {
  composerPendingAttachment = composerPendingAttachments[0] || null;
}

function composerAttachmentPreviewLabel(entry) {
  if (!entry) return "file";
  const label = entry.name || "file";
  const type = (entry.type || "file").toUpperCase();
  const size = formatFileSize(Number(entry.sizeBytes || 0));
  return size ? `${type}: ${label} (${size})` : `${type}: ${label}`;
}

function renderComposerAttachmentList() {
  if (!ui.composerAttachmentList) return;
  ui.composerAttachmentList.innerHTML = "";
  composerPendingAttachments.forEach((entry, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "composer-attachment-chip";
    row.title = composerAttachmentPreviewLabel(entry);
    const label = document.createElement("span");
    label.textContent = `${index === 0 ? "• " : ""}${entry.name || "file"}`;
    const remove = document.createElement("span");
    remove.className = "composer-attachment-chip__remove";
    remove.textContent = "✕";
    row.appendChild(label);
    row.appendChild(remove);
    row.addEventListener("click", () => {
      composerPendingAttachments.splice(index, 1);
      syncPrimaryComposerAttachment();
      if (composerPendingAttachments.length === 0) {
        clearComposerPendingAttachment();
        return;
      }
      setComposerPendingAttachment(null);
      renderComposerMeta();
    });
    ui.composerAttachmentList.appendChild(row);
  });
}

function clearComposerPendingAttachment() {
  composerPendingAttachments = [];
  composerPendingAttachment = null;
  if (ui.composerAttachmentBar) ui.composerAttachmentBar.classList.add("composer-reply--hidden");
  if (ui.composerAttachmentText) ui.composerAttachmentText.textContent = "";
  if (ui.composerAttachmentList) ui.composerAttachmentList.innerHTML = "";
  if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = true;
  if (ui.quickAttachInput) ui.quickAttachInput.value = "";
  renderComposerMeta();
}

function setComposerPendingAttachment(entry, { append = true } = {}) {
  if (entry) {
    if (!append) composerPendingAttachments = [];
    composerPendingAttachments.push(entry);
    composerPendingAttachments = composerPendingAttachments.slice(-6);
  }
  syncPrimaryComposerAttachment();
  if (!composerPendingAttachment) {
    clearComposerPendingAttachment();
    return;
  }
  if (ui.composerAttachmentText) {
    ui.composerAttachmentText.textContent = composerPendingAttachments.length > 1
      ? `Attached ${composerPendingAttachments.length} files`
      : `Attached ${composerAttachmentPreviewLabel(composerPendingAttachment)}`;
  }
  renderComposerAttachmentList();
  if (ui.composerAttachmentBar) ui.composerAttachmentBar.classList.remove("composer-reply--hidden");
  if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = false;
  renderComposerMeta();
}

async function attachFileToComposer(file) {
  if (!file) return false;
  const type = inferAttachmentTypeFromFile(file);
  const allowed = getComposerAttachAllowedTypes();
  if (!allowed.has(type)) return false;
  const url = await readFileAsDataUrl(file);
  setComposerPendingAttachment({
    type,
    url,
    name: file.name || `${type}-${Date.now()}`,
    sizeBytes: Number(file.size) || 0
  }, { append: true });
  return true;
}

function pickerTabForAttachmentType(type) {
  if (type === "pdf") return "pdf";
  if (type === "text") return "text";
  if (type === "rtf" || type === "odf" || type === "bin") return "docs";
  if (type === "html") return "html";
  if (type === "swf") return "swf";
  if (type === "svg") return "svg";
  return "gif";
}

function saveComposerAttachmentToPicker() {
  if (!composerPendingAttachment) return false;
  const guild = getActiveGuild();
  if (!guild) return false;
  let savedAny = false;
  composerPendingAttachments.forEach((pending, index) => {
    const type = pending.type || "pdf";
    const tab = pickerTabForAttachmentType(type);
    const baseName = (pending.name || `${type}-${Date.now()}-${index}`).toString().trim().slice(0, 64);
    const extension = type === "pdf"
      ? ".pdf"
      : type === "text"
        ? ".txt"
        : type === "rtf"
          ? ".rtf"
          : type === "odf"
            ? ".odt"
            : type === "bin"
              ? ".bin"
              : "";
    const resolvedName = baseName.includes(".") || !extension ? baseName : `${baseName}${extension}`;
    const entry = {
      name: sanitizeMediaName(resolvedName, `${tab}-${Date.now().toString().slice(-4)}`),
      url: pending.url,
      format: "image",
      type
    };
    if (upsertGuildResource(tab, entry)) savedAny = true;
  });
  if (!savedAny) return false;
  saveState();
  return true;
}

async function applyProfileAvatarFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setProfileAvatarUploadHint("Invalid file type. Please choose an image.", true);
    return;
  }
  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    setProfileAvatarUploadHint("Image is too large. Max size is 2 MB.", true);
    return;
  }
  try {
    const dataUrl = await readFileAsDataUrl(file);
    if (!isLikelyImageDataUrl(dataUrl)) {
      setProfileAvatarUploadHint("Unsupported image format.", true);
      return;
    }
    ui.profileAvatarUrlInput.value = dataUrl;
    renderProfileAvatarPreview();
    setProfileAvatarUploadHint(`Loaded ${file.name} (${Math.ceil(file.size / 1024)} KB).`);
  } catch {
    setProfileAvatarUploadHint("Failed to load image file.", true);
  }
}

function normalizeReactions(reactions) {
  if (!Array.isArray(reactions)) return [];
  return reactions
    .filter((item) => item && typeof item.emoji === "string")
    .map((item) => ({
      emoji: item.emoji,
      userIds: Array.isArray(item.userIds) ? item.userIds : []
    }))
    .filter((item) => item.userIds.length > 0);
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  const allowedTypes = new Set(["gif", "sticker", "svg", "swf", "html", "pdf", "audio", "text", "odf", "rtf", "bin"]);
  const allowedFormats = new Set(["image", "dotlottie", "apng"]);
  return attachments
    .filter((item) => item && typeof item.type === "string" && typeof item.url === "string")
    .map((item) => ({
      type: allowedTypes.has(item.type) ? item.type : "gif",
      url: item.url,
      name: (item.name || "").toString().slice(0, 120),
      format: allowedFormats.has(item.format) ? item.format : "image"
    }))
    .slice(0, 6);
}

function normalizePoll(poll) {
  if (!poll || typeof poll !== "object") return null;
  const question = (poll.question || "").toString().trim().slice(0, 220);
  if (!question) return null;
  const options = Array.isArray(poll.options)
    ? poll.options
        .map((option) => ({
          id: (option?.id || createId()).toString().slice(0, 64),
          label: (option?.label || "").toString().trim().slice(0, 120),
          voterIds: Array.isArray(option?.voterIds) ? option.voterIds.filter(Boolean) : []
        }))
        .filter((option) => option.label)
    : [];
  if (options.length < 2) return null;
  return {
    question,
    options: options.slice(0, 12),
    allowsMulti: Boolean(poll.allowsMulti),
    closed: Boolean(poll.closed),
    createdBy: (poll.createdBy || "").toString().slice(0, 64)
  };
}

function normalizeForumTags(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .map((tag) => {
      const name = sanitizeForumTagName(tag?.name || "");
      if (!name || seen.has(name)) return null;
      seen.add(name);
      const color = /^#[0-9a-f]{3,8}$/i.test((tag?.color || "").toString()) ? tag.color : "#5865f2";
      return {
        id: (tag?.id || createId()).toString().slice(0, 64),
        name,
        color
      };
    })
    .filter(Boolean)
    .slice(0, 24);
}

function normalizeThreadTagIds(value, forumTags) {
  if (!Array.isArray(value) || !Array.isArray(forumTags) || forumTags.length === 0) return [];
  const valid = new Set(forumTags.map((tag) => tag.id));
  return [...new Set(value.map((entry) => (entry || "").toString()).filter((id) => valid.has(id)))].slice(0, 8);
}

function normalizeScheduledMessages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const conversationType = entry?.conversationType === "dm" ? "dm" : "channel";
      const conversationId = (entry?.conversationId || "").toString();
      const authorId = (entry?.authorId || "").toString();
      const text = (entry?.text || "").toString().slice(0, 400);
      const sendAt = typeof entry?.sendAt === "string" ? entry.sendAt : "";
      if (!conversationId || !authorId || !text.trim()) return null;
      if (!toTimestampMs(sendAt)) return null;
      return {
        id: (entry?.id || createId()).toString().slice(0, 64),
        conversationType,
        conversationId,
        guildId: (entry?.guildId || "").toString().slice(0, 64),
        authorId,
        text,
        createdAt: typeof entry?.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
        sendAt,
        replyTo: entry?.replyTo && typeof entry.replyTo === "object"
          ? {
              messageId: (entry.replyTo.messageId || "").toString().slice(0, 64),
              authorName: (entry.replyTo.authorName || "").toString().slice(0, 60),
              text: (entry.replyTo.text || "").toString().slice(0, 180),
              threadId: (entry.replyTo.threadId || "").toString().slice(0, 64)
            }
          : null
      };
    })
    .filter(Boolean)
    .slice(0, 300);
}

function normalizeSavedSwfs(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((entry) => entry && typeof entry.url === "string")
    .map((entry) => ({
      name: (entry.name || "swf").toString().slice(0, 120),
      url: entry.url
    }))
    .slice(0, 24);
}

function sanitizeMediaName(value, fallback = "resource") {
  const cleaned = (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
  return cleaned || fallback;
}

function ensureGuildMediaCollections(guild) {
  if (!guild) return;
  if (!Array.isArray(guild.customEmojis)) guild.customEmojis = [];
  if (!Array.isArray(guild.customStickers)) guild.customStickers = [];
  if (!Array.isArray(guild.customGifs)) guild.customGifs = [];
  if (!Array.isArray(guild.customSvgs)) guild.customSvgs = [];
  if (!Array.isArray(guild.customPdfs)) guild.customPdfs = [];
  if (!Array.isArray(guild.customTexts)) guild.customTexts = [];
  if (!Array.isArray(guild.customDocs)) guild.customDocs = [];
  if (!Array.isArray(guild.customSwfs)) guild.customSwfs = [];
  if (!Array.isArray(guild.customHtmls)) guild.customHtmls = [];
}

function getGuildResourceBucket(guild, tab) {
  ensureGuildMediaCollections(guild);
  if (tab === "emoji") return guild.customEmojis;
  if (tab === "sticker") return guild.customStickers;
  if (tab === "gif") return guild.customGifs;
  if (tab === "svg") return guild.customSvgs;
  if (tab === "pdf") return guild.customPdfs;
  if (tab === "text") return guild.customTexts;
  if (tab === "docs") return guild.customDocs;
  if (tab === "swf") return guild.customSwfs;
  if (tab === "html") return guild.customHtmls;
  return [];
}

function upsertGuildResource(tab, entry) {
  const guild = getActiveGuild();
  if (!guild || !entry?.url) return false;
  const bucket = getGuildResourceBucket(guild, tab);
  const name = sanitizeMediaName(entry.name || `${tab}-${bucket.length + 1}`);
  const normalized = {
    id: entry.id || createId(),
    name,
    url: entry.url,
    format: entry.format || "image",
    type: (entry.type || "").toString()
  };
  const existingIndex = bucket.findIndex((item) => item.name === normalized.name);
  if (existingIndex >= 0) {
    bucket[existingIndex] = { ...bucket[existingIndex], ...normalized };
  } else {
    bucket.unshift(normalized);
  }
  return true;
}

function loadScriptTag(src, type = "text/javascript") {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      if (existing.dataset.loaded === "1") resolve();
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.dataset.src = src;
    if (type === "module") script.type = "module";
    script.src = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "1";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

async function localRuntimeExists(src) {
  try {
    const response = await fetch(src, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

async function deployMediaRuntimes() {
  const allowLocalRuntime = new URLSearchParams(window.location.search).get("localRuntime") === "1";
  let shouldRerender = false;
  if (allowLocalRuntime) {
    try {
      const hasLocalRuffle = await localRuntimeExists("ruffle/ruffle.js");
      if (hasLocalRuffle) {
        await loadScriptTag("ruffle/ruffle.js");
        shouldRerender = true;
        addDebugLog("info", "Loaded local Ruffle runtime", { src: "ruffle/ruffle.js" });
      } else {
        addDebugLog("info", "Local Ruffle runtime not found, using CDN fallback");
      }
    } catch {
      addDebugLog("warn", "Local Ruffle runtime probe failed, using CDN fallback");
    }
  } else {
    addDebugLog("info", "Skipping local Ruffle runtime probe (use ?localRuntime=1 to enable)");
  }
  if (!window.RufflePlayer?.newest) {
    try {
      await loadScriptTag("https://unpkg.com/@ruffle-rs/ruffle");
      shouldRerender = true;
      addDebugLog("info", "Loaded CDN Ruffle runtime", { src: "https://unpkg.com/@ruffle-rs/ruffle" });
    } catch {
      addDebugLog("warn", "Failed to load Ruffle runtime (local and CDN)");
      // SWF fallback card remains available.
    }
  }
  if (allowLocalRuntime) {
    try {
      const hasLocalDotLottie = await localRuntimeExists("dotlottie/dotlottie-player.mjs");
      if (hasLocalDotLottie) {
        await loadScriptTag("dotlottie/dotlottie-player.mjs", "module");
        shouldRerender = true;
        addDebugLog("info", "Loaded local dotLottie runtime", { src: "dotlottie/dotlottie-player.mjs" });
      } else {
        addDebugLog("info", "Local dotLottie runtime not found, using CDN fallback");
      }
    } catch {
      addDebugLog("warn", "Local dotLottie runtime probe failed, using CDN fallback");
    }
  } else {
    addDebugLog("info", "Skipping local dotLottie runtime probe (use ?localRuntime=1 to enable)");
  }
  if (!(typeof customElements !== "undefined" && customElements.get("dotlottie-player"))) {
    try {
      await loadScriptTag("https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs", "module");
      shouldRerender = true;
      addDebugLog("info", "Loaded CDN dotLottie runtime", { src: "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs" });
    } catch {
      addDebugLog("warn", "Failed to load dotLottie runtime (local and CDN)");
      // dotLottie falls back to link/file preview behavior.
    }
  }
  if (shouldRerender && state.currentAccountId) {
    renderMessages();
    if (mediaPickerOpen && mediaPickerTab === "swf") renderMediaPicker();
  }
}

function resolveMediaUrl(url) {
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}

function mediaUrlHost(url) {
  try {
    return new URL(url, window.location.href).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isExternalMediaUrl(url) {
  try {
    const resolved = new URL(url, window.location.href);
    if (!/^https?:$/i.test(resolved.protocol)) return false;
    return resolved.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function doesMediaRuleMatchHost(rule, host) {
  if (!rule || !host) return false;
  if (rule.startsWith("/") && rule.endsWith("/") && rule.length > 2) {
    try {
      return new RegExp(rule.slice(1, -1), "i").test(host);
    } catch {
      return false;
    }
  }
  if (rule.startsWith("*.")) {
    const suffix = rule.slice(2);
    return host === suffix || host.endsWith(`.${suffix}`);
  }
  return host === rule;
}

function isTrustedMediaUrl(url) {
  if (mediaAllowOnceUrls.has(url)) return true;
  const host = mediaUrlHost(url);
  if (!host) return false;
  const prefs = getPreferences();
  return prefs.mediaTrustRules.some((rule) => doesMediaRuleMatchHost(rule, host));
}

function shouldGateMediaUrl(url) {
  const prefs = getPreferences();
  if (prefs.mediaPrivacyMode === "off") return false;
  if (!isExternalMediaUrl(url)) return false;
  return !isTrustedMediaUrl(url);
}

function addMediaTrustRule(rule) {
  const cleaned = (rule || "").toString().trim().toLowerCase();
  if (!cleaned) return false;
  state.preferences = getPreferences();
  const current = normalizeMediaTrustRules(state.preferences.mediaTrustRules);
  if (current.includes(cleaned)) return false;
  state.preferences.mediaTrustRules = [cleaned, ...current].slice(0, 120);
  return true;
}

function removeMediaTrustRule(rule) {
  const cleaned = (rule || "").toString().trim().toLowerCase();
  if (!cleaned) return false;
  state.preferences = getPreferences();
  const current = normalizeMediaTrustRules(state.preferences.mediaTrustRules);
  if (!current.includes(cleaned)) return false;
  state.preferences.mediaTrustRules = current.filter((entry) => entry !== cleaned);
  return true;
}

function addDebugLog(level, message, data = null) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    data
  };
  debugLogs.push(entry);
  if (debugLogs.length > 220) debugLogs.shift();
}

function xmppSerializePayload(payload) {
  if (!payload) return "";
  try {
    if (typeof payload === "string") return payload;
    if (typeof payload.tree === "function") {
      const node = payload.tree();
      if (node) return new XMLSerializer().serializeToString(node);
    }
    if (payload.nodeType) return new XMLSerializer().serializeToString(payload);
    if (typeof payload.toString === "function") return payload.toString();
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

function trimXmppRaw(value, limit = XMPP_DEBUG_RAW_TRUNCATE) {
  const text = (value || "").toString();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)} ... [truncated ${text.length - limit} chars]`;
}

function addXmppDebugEvent(category, message, data = null) {
  const entry = {
    ts: new Date().toISOString(),
    category: (category || "misc").toString(),
    message: (message || "").toString(),
    data
  };
  xmppDebugEvents.push(entry);
  if (xmppDebugEvents.length > XMPP_DEBUG_EVENT_LIMIT) xmppDebugEvents.shift();
  if (ui.xmppConsoleDialog?.open && !xmppDebugPaused) renderXmppConsoleDialog();
}

function formatXmppConsoleLogs() {
  const normalizedFilter = (xmppDebugFilter || "all").toString();
  const searchToken = (xmppDebugSearch || "").toString().trim().toLowerCase();
  const filtered = xmppDebugEvents.filter((entry) => {
    const category = (entry.category || "").toLowerCase();
    const message = (entry.message || "").toLowerCase();
    let dataText = "";
    if (entry.data != null) {
      try {
        dataText = JSON.stringify(entry.data).toLowerCase();
      } catch {
        dataText = String(entry.data).toLowerCase();
      }
    }
    if (normalizedFilter !== "all") {
      if (normalizedFilter === "message" && !["message", "stanza"].includes(category)) return false;
      else if (normalizedFilter === "raw" && category !== "raw") return false;
      else if (normalizedFilter !== "message" && normalizedFilter !== "raw" && category !== normalizedFilter) return false;
    }
    if (!searchToken) return true;
    return message.includes(searchToken) || dataText.includes(searchToken) || category.includes(searchToken);
  });
  const runtime = {
    relayMode: getPreferences().relayMode,
    relayStatus,
    xmppConnected: Boolean(xmppConnection),
    xmppRuntimeReady,
    xmppRuntimeLastError: xmppRuntimeLastError || "",
    filter: normalizedFilter,
    search: searchToken || "",
    paused: xmppDebugPaused,
    eventsTotal: xmppDebugEvents.length,
    eventsShown: filtered.length
  };
  const lines = filtered.map((entry) => {
    const head = `[${entry.ts}] [${entry.category}] ${entry.message}`;
    if (entry.data == null) return head;
    let body = "";
    try {
      body = typeof entry.data === "string" ? entry.data : JSON.stringify(entry.data, null, 2);
    } catch {
      body = String(entry.data);
    }
    return `${head}\n${trimXmppRaw(body)}`;
  });
  return `${JSON.stringify(runtime, null, 2)}\n\n${lines.join("\n\n") || "(no XMPP events yet)"}`;
}

function renderXmppConsoleDialog() {
  if (!ui.xmppConsoleOutput) return;
  if (ui.xmppConsoleFilterInput) ui.xmppConsoleFilterInput.value = xmppDebugFilter;
  if (ui.xmppConsoleSearchInput && ui.xmppConsoleSearchInput.value !== xmppDebugSearch) ui.xmppConsoleSearchInput.value = xmppDebugSearch;
  if (ui.pauseXmppConsoleBtn) ui.pauseXmppConsoleBtn.textContent = xmppDebugPaused ? "Resume" : "Pause";
  ui.xmppConsoleOutput.textContent = formatXmppConsoleLogs();
}

function openXmppConsoleDialog() {
  renderXmppConsoleDialog();
  ui.xmppConsoleDialog?.showModal();
}

function formatDebugLogs() {
  const runtime = {
    location: window.location.href,
    ruffleReady: Boolean(window.RufflePlayer?.newest),
    dotLottieReady: typeof customElements !== "undefined" && Boolean(customElements.get("dotlottie-player")),
    activeGuildId: state.activeGuildId || null,
    activeChannelId: state.activeChannelId || null
  };
  return JSON.stringify({ runtime, logs: debugLogs }, null, 2);
}

function renderDebugDialog() {
  ui.debugOutput.textContent = formatDebugLogs();
}

function openDebugDialog() {
  renderDebugDialog();
  ui.debugDialog.showModal();
}

function serializeMessageAsJson(message) {
  return JSON.stringify({
    id: message.id,
    userId: message.userId || null,
    authorName: message.authorName || "",
    text: message.text || "",
    ts: message.ts,
    editedAt: message.editedAt || null,
    editedByUserId: message.editedByUserId || null,
    editedByName: message.editedByName || "",
    editedByStaff: Boolean(message.editedByStaff),
    collaborative: Boolean(message.collaborative),
    editHistory: messageEditHistory(message),
    replyTo: message.replyTo || null,
    pinned: Boolean(message.pinned),
    reactions: normalizeReactions(message.reactions),
    attachments: normalizeAttachments(message.attachments),
    poll: normalizePoll(message.poll)
  }, null, 2);
}

function xmlEscape(value) {
  return (value || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function serializeMessageAsXml(message) {
  const reactionsXml = normalizeReactions(message.reactions)
    .map((reaction) => `    <reaction emoji="${xmlEscape(reaction.emoji)}" count="${reaction.userIds.length}" />`)
    .join("\n");
  const attachmentsXml = normalizeAttachments(message.attachments)
    .map((attachment) => `    <attachment type="${xmlEscape(attachment.type)}" format="${xmlEscape(attachment.format || "image")}" name="${xmlEscape(attachment.name || "")}" url="${xmlEscape(attachment.url)}" />`)
    .join("\n");
  const poll = normalizePoll(message.poll);
  const pollXml = poll
    ? `  <poll question="${xmlEscape(poll.question)}" closed="${poll.closed ? "true" : "false"}" allowsMulti="${poll.allowsMulti ? "true" : "false"}">\n${poll.options.map((option) => `    <option id="${xmlEscape(option.id)}" votes="${option.voterIds.length}">${xmlEscape(option.label)}</option>`).join("\n")}\n  </poll>`
    : "  <poll />";
  return [
    `<message id="${xmlEscape(message.id)}" ts="${xmlEscape(message.ts)}"${message.editedAt ? ` editedAt="${xmlEscape(message.editedAt)}"` : ""}${message.editedByStaff ? " editedByStaff=\"true\"" : ""}>`,
    `  <author userId="${xmlEscape(message.userId || "")}">${xmlEscape(displayNameForMessage(message))}</author>`,
    `  <text>${xmlEscape(message.text || "")}</text>`,
    `  <pinned>${message.pinned ? "true" : "false"}</pinned>`,
    reactionsXml ? `  <reactions>\n${reactionsXml}\n  </reactions>` : "  <reactions />",
    attachmentsXml ? `  <attachments>\n${attachmentsXml}\n  </attachments>` : "  <attachments />",
    pollXml,
    `</message>`
  ].join("\n");
}

function toggleReaction(message, emoji, userId) {
  if (emoji) rememberRecentEmoji(emoji);
  message.reactions = normalizeReactions(message.reactions);
  let reaction = message.reactions.find((item) => item.emoji === emoji);
  if (!reaction) {
    reaction = { emoji, userIds: [userId] };
    message.reactions.push(reaction);
    return;
  }
  const idx = reaction.userIds.indexOf(userId);
  if (idx === -1) {
    reaction.userIds.push(userId);
  } else {
    reaction.userIds.splice(idx, 1);
  }
  message.reactions = message.reactions.filter((item) => item.userIds.length > 0);
}

function parsePollFromCommandArg(arg) {
  const parts = (arg || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 3) return null;
  const [question, ...optionParts] = parts;
  const options = optionParts
    .slice(0, 12)
    .map((label) => ({ id: createId(), label: label.slice(0, 120), voterIds: [] }))
    .filter((option) => option.label);
  if (!question || options.length < 2) return null;
  return {
    question: question.slice(0, 220),
    options,
    allowsMulti: false,
    closed: false
  };
}

function findLatestPollMessage(channel) {
  if (!channel || !Array.isArray(channel.messages)) return null;
  for (let i = channel.messages.length - 1; i >= 0; i -= 1) {
    const message = channel.messages[i];
    if (normalizePoll(message?.poll)) return message;
  }
  return null;
}

function getPollTotalVotes(poll) {
  const normalized = normalizePoll(poll);
  if (!normalized) return 0;
  const voters = new Set();
  normalized.options.forEach((option) => {
    option.voterIds.forEach((voterId) => voters.add(voterId));
  });
  return voters.size;
}

function setPollVotesForUser(message, optionIds, userId) {
  const poll = normalizePoll(message?.poll);
  if (!poll || poll.closed || !poll.allowsMulti || !userId) return false;
  const allowed = new Set(poll.options.map((option) => option.id));
  const requested = [...new Set((Array.isArray(optionIds) ? optionIds : []).filter((id) => allowed.has(id)))];
  const before = poll.options
    .filter((option) => option.voterIds.includes(userId))
    .map((option) => option.id)
    .sort()
    .join(",");
  poll.options.forEach((option) => {
    option.voterIds = option.voterIds.filter((voterId) => voterId !== userId);
    if (requested.includes(option.id)) option.voterIds.push(userId);
  });
  message.poll = poll;
  const after = poll.options
    .filter((option) => option.voterIds.includes(userId))
    .map((option) => option.id)
    .sort()
    .join(",");
  return before !== after;
}

function togglePollVote(message, optionId, userId) {
  const poll = normalizePoll(message?.poll);
  if (!poll || poll.closed || !optionId || !userId) return false;
  const target = poll.options.find((option) => option.id === optionId);
  if (!target) return false;
  if (poll.allowsMulti) {
    const wasSelected = target.voterIds.includes(userId);
    if (wasSelected) {
      target.voterIds = target.voterIds.filter((voterId) => voterId !== userId);
    } else {
      target.voterIds.push(userId);
    }
  } else {
    const wasSelected = target.voterIds.includes(userId);
    poll.options.forEach((option) => {
      option.voterIds = option.voterIds.filter((voterId) => voterId !== userId);
    });
    if (!wasSelected) {
      target.voterIds.push(userId);
    }
  }
  message.poll = poll;
  return true;
}

function closeOrOpenLatestPoll(channel, closed) {
  const pollMessage = findLatestPollMessage(channel);
  if (!pollMessage) return false;
  const poll = normalizePoll(pollMessage.poll);
  if (!poll) return false;
  if (poll.closed === closed) return false;
  pollMessage.poll = { ...poll, closed };
  return true;
}

function formatPollResultsText(message, { includeVoters = false } = {}) {
  const poll = normalizePoll(message?.poll);
  if (!poll) return "No poll.";
  const total = getPollTotalVotes(poll);
  const lines = poll.options.map((option) => {
    const votes = option.voterIds.length;
    const percent = total > 0 ? Math.round((votes / total) * 100) : 0;
    const voterSuffix = includeVoters ? ` [${formatPollOptionVoters(option)}]` : "";
    return `- ${option.label}: ${votes} vote${votes === 1 ? "" : "s"} (${percent}%)${voterSuffix}`;
  });
  return `${poll.question}\n${lines.join("\n")}\nTotal voters: ${total}`;
}

function formatPollOptionVoters(option) {
  const ids = Array.isArray(option?.voterIds) ? option.voterIds : [];
  if (ids.length === 0) return "No votes yet.";
  const labels = ids
    .slice(0, 8)
    .map((id) => {
      const account = getAccountById(id);
      return account ? `@${account.username}` : id.slice(0, 8);
    });
  const suffix = ids.length > labels.length ? ` +${ids.length - labels.length} more` : "";
  return `${labels.join(", ")}${suffix}`;
}

function canManagePollMessage(message, { isDm = false, canManageMessages = false, currentUser = null } = {}) {
  if (!message?.poll || !currentUser) return false;
  if (message.userId && message.userId === currentUser.id) return true;
  return !isDm && canManageMessages;
}

function renderMessagePoll(container, message, { currentUser = null, isDm = false, canManageMessages = false, onChanged = null } = {}) {
  const poll = normalizePoll(message?.poll);
  if (!poll) return;
  const wrap = document.createElement("div");
  wrap.className = "message-poll";
  const question = document.createElement("div");
  question.className = "message-poll__question";
  question.textContent = poll.question;
  wrap.appendChild(question);
  const total = getPollTotalVotes(poll);
  poll.options.forEach((option) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "message-poll__option";
    const votes = option.voterIds.length;
    const percent = total > 0 ? Math.round((votes / total) * 100) : 0;
    const isSelected = currentUser ? option.voterIds.includes(currentUser.id) : false;
    row.classList.toggle("is-selected", isSelected);
    if (poll.closed) row.disabled = true;
    row.style.setProperty("--poll-fill", `${percent}%`);
    row.title = formatPollOptionVoters(option);
    row.innerHTML = `<span>${index + 1}. ${option.label}</span><small>${votes} · ${percent}%</small>`;
    row.addEventListener("click", () => {
      if (!currentUser) return;
      const changed = togglePollVote(message, option.id, currentUser.id);
      if (!changed) return;
      if (typeof onChanged === "function") onChanged();
    });
    wrap.appendChild(row);
  });
  const foot = document.createElement("div");
  foot.className = "message-poll__meta";
  foot.textContent = `${total} voter${total === 1 ? "" : "s"} · ${poll.allowsMulti ? "multi-choice" : "single-choice"}${poll.closed ? " · closed" : ""}`;
  if (canManagePollMessage(message, { isDm, canManageMessages, currentUser })) {
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "message-poll__close";
    closeBtn.textContent = poll.closed ? "Reopen poll" : "Close poll";
    closeBtn.addEventListener("click", () => {
      message.poll = { ...poll, closed: !poll.closed };
      if (typeof onChanged === "function") onChanged();
    });
    foot.appendChild(closeBtn);
  }
  wrap.appendChild(foot);
  container.appendChild(wrap);
}

function addSystemMessage(channel, text) {
  channel.messages.push({
    id: createId(),
    userId: null,
    authorName: "system",
    text,
    ts: new Date().toISOString(),
    reactions: [],
    attachments: []
  });
}

function ensureScheduledMessagesStore() {
  if (!Array.isArray(state.scheduledMessages)) {
    state.scheduledMessages = [];
  }
  state.scheduledMessages = normalizeScheduledMessages(state.scheduledMessages);
  return state.scheduledMessages;
}

function parseScheduleWhen(rawWhen) {
  const cleaned = (rawWhen || "").trim().toLowerCase();
  if (!cleaned) return 0;
  const rel = cleaned.match(/^(\d{1,5})\s*([smhd])$/i);
  if (rel) {
    const amount = Number(rel[1]);
    const unit = rel[2].toLowerCase();
    const factor = unit === "s" ? 1000 : unit === "m" ? 60000 : unit === "h" ? 3600000 : 86400000;
    return Date.now() + (amount * factor);
  }
  const parsed = Date.parse(rawWhen);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRelativeMs(targetMs) {
  const delta = targetMs - Date.now();
  if (delta <= 0) return "due now";
  const sec = Math.ceil(delta / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.ceil(sec / 60);
  if (min < 60) return `${min}m`;
  const hour = Math.ceil(min / 60);
  if (hour < 48) return `${hour}h`;
  const day = Math.ceil(hour / 24);
  return `${day}d`;
}

function queueScheduledMessage(conversation, account, whenRaw, textBody) {
  const whenMs = parseScheduleWhen(whenRaw);
  if (!whenMs || whenMs < Date.now() + 2000) return { ok: false, error: "Choose a time at least 2s in the future." };
  const messageText = (textBody || "").toString().trim().slice(0, 400);
  if (!messageText) return { ok: false, error: "Scheduled message cannot be empty." };
  const queue = ensureScheduledMessagesStore();
  const entry = {
    id: createId(),
    conversationType: conversation.type === "dm" ? "dm" : "channel",
    conversationId: conversation.id,
    guildId: conversation.type === "channel" ? (getActiveGuild()?.id || "") : "",
    authorId: account.id,
    text: messageText,
    createdAt: new Date().toISOString(),
    sendAt: new Date(whenMs).toISOString(),
    replyTo: replyTarget && replyTarget.channelId === conversation.id
      ? {
          messageId: replyTarget.messageId,
          authorName: replyTarget.authorName,
          text: replyTarget.text,
          threadId: replyTarget.threadId || null
        }
      : null
  };
  queue.push(entry);
  queue.sort((a, b) => toTimestampMs(a.sendAt) - toTimestampMs(b.sendAt));
  return { ok: true, entry };
}

function listScheduledMessagesForConversation(conversationId) {
  const queue = ensureScheduledMessagesStore();
  return queue
    .filter((entry) => entry.conversationId === conversationId)
    .sort((a, b) => toTimestampMs(a.sendAt) - toTimestampMs(b.sendAt));
}

function removeScheduledMessageByToken(conversationId, token) {
  const queue = ensureScheduledMessagesStore();
  if (!token) return 0;
  const cleaned = token.toLowerCase();
  if (cleaned === "all") {
    const keep = queue.filter((entry) => entry.conversationId !== conversationId);
    const removed = queue.length - keep.length;
    state.scheduledMessages = keep;
    return removed;
  }
  if (cleaned === "last") {
    for (let i = queue.length - 1; i >= 0; i -= 1) {
      if (queue[i].conversationId !== conversationId) continue;
      queue.splice(i, 1);
      return 1;
    }
    return 0;
  }
  const index = queue.findIndex((entry) => (
    entry.conversationId === conversationId
    && (entry.id === token || entry.id.startsWith(token))
  ));
  if (index < 0) return 0;
  queue.splice(index, 1);
  return 1;
}

function runScheduledDispatch() {
  const queue = ensureScheduledMessagesStore();
  if (queue.length === 0) return false;
  const now = Date.now();
  const due = queue.filter((entry) => toTimestampMs(entry.sendAt) <= now);
  if (due.length === 0) return false;
  let changed = false;
  due.forEach((entry) => {
    const author = getAccountById(entry.authorId);
    if (!author) {
      changed = true;
      return;
    }
    if (entry.conversationType === "dm") {
      const thread = state.dmThreads.find((candidate) => candidate.id === entry.conversationId);
      if (!thread) {
        changed = true;
        return;
      }
      thread.messages.push({
        id: createId(),
        userId: author.id,
        authorName: "",
        text: entry.text,
        ts: new Date().toISOString(),
        reactions: [],
        attachments: [],
        replyTo: entry.replyTo || null
      });
      changed = true;
      return;
    }
    const channel = findChannelById(entry.conversationId);
    if (!channel) {
      changed = true;
      return;
    }
    const nextMessage = {
      id: createId(),
      userId: author.id,
      authorName: "",
      text: entry.text,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: [],
      replyTo: entry.replyTo || null
    };
    if (channel.type === "forum") {
      if (entry.replyTo?.threadId) {
        nextMessage.forumThreadId = entry.replyTo.threadId;
        nextMessage.forumParentId = entry.replyTo.messageId || entry.replyTo.threadId;
      } else {
        const [firstLine, ...rest] = entry.text.split("\n");
        nextMessage.forumTitle = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
        nextMessage.text = rest.join("\n").trim();
      }
    }
    channel.messages.push(nextMessage);
    changed = true;
  });
  state.scheduledMessages = queue.filter((entry) => toTimestampMs(entry.sendAt) > now);
  if (changed) {
    saveState();
    safeRender("scheduled-dispatch");
  }
  return changed;
}

function ensureScheduledDispatchTimer() {
  if (scheduledDispatchTimer) return;
  scheduledDispatchTimer = window.setInterval(() => {
    runScheduledDispatch();
  }, 1000);
}

function parseRollExpression(arg) {
  const cleaned = (arg || "").trim().toLowerCase();
  if (!cleaned) return { count: 1, sides: 6, label: "1d6" };
  const direct = Number(cleaned);
  if (Number.isInteger(direct) && direct >= 2 && direct <= 1000) {
    return { count: 1, sides: direct, label: `1d${direct}` };
  }
  const match = cleaned.match(/^(\d{1,2})d(\d{1,4})$/i);
  if (!match) return null;
  const count = Number(match[1]);
  const sides = Number(match[2]);
  if (!Number.isInteger(count) || !Number.isInteger(sides)) return null;
  if (count < 1 || count > 30 || sides < 2 || sides > 1000) return null;
  return { count, sides, label: `${count}d${sides}` };
}

function parseTimestampArg(arg) {
  const cleaned = (arg || "").trim();
  if (!cleaned || cleaned.toLowerCase() === "now") {
    return Math.floor(Date.now() / 1000);
  }
  if (/^\d{10,13}$/.test(cleaned)) {
    const raw = Number(cleaned);
    if (!Number.isFinite(raw)) return null;
    return cleaned.length === 13 ? Math.floor(raw / 1000) : raw;
  }
  const parsed = Date.parse(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor(parsed / 1000);
}

function handleSlashCommand(rawText, channel, account) {
  if (!rawText.startsWith("/")) return false;
  const [command, ...rest] = rawText.slice(1).split(" ");
  const arg = rest.join(" ").trim();
  const conversationId = channel?.id || null;

  if (command === "me") {
    if (!arg) return true;
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `*${account.displayName || account.username} ${arg}*`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "shrug") {
    const suffix = arg ? `${arg} ` : "";
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `${suffix}¯\\_(ツ)_/¯`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "note") {
    if (!arg) return true;
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: arg,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: [],
      collaborative: true
    });
    return true;
  }

  if (command === "spoiler") {
    if (!arg) {
      addSystemMessage(channel, "Usage: /spoiler <text>");
      return true;
    }
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `||${arg.slice(0, 340)}||`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "tableflip") {
    const prefix = arg ? `${arg} ` : "";
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `${prefix}(ノಠ益ಠ)ノ彡┻━┻`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "unflip") {
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: "┬─┬ ノ( ゜-゜ノ)",
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "lenny") {
    const suffix = arg ? ` ${arg}` : "";
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `( ͡° ͜ʖ ͡°)${suffix}`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "roll") {
    const roll = parseRollExpression(arg);
    if (!roll) {
      addSystemMessage(channel, "Usage: /roll [NdM], e.g. /roll 2d6");
      return true;
    }
    const values = Array.from({ length: roll.count }, () => Math.floor(Math.random() * roll.sides) + 1);
    const total = values.reduce((sum, value) => sum + value, 0);
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `🎲 rolled ${roll.label}: [${values.join(", ")}] = ${total}`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "timestamp") {
    const unix = parseTimestampArg(arg);
    if (!unix || unix < 0) {
      addSystemMessage(channel, "Usage: /timestamp [now|unix|date], e.g. /timestamp 2026-02-18 13:30");
      return true;
    }
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `<t:${unix}:F> (<t:${unix}:R>)`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "poll") {
    const poll = parsePollFromCommandArg(arg);
    if (!poll) {
      addSystemMessage(channel, "Usage: /poll <question> | <option1> | <option2> [...options]");
      return true;
    }
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: "",
      ts: new Date().toISOString(),
      reactions: [],
      attachments: [],
      poll: {
        ...poll,
        allowsMulti: false,
        createdBy: account.id
      }
    });
    return true;
  }

  if (command === "pollm") {
    const poll = parsePollFromCommandArg(arg);
    if (!poll) {
      addSystemMessage(channel, "Usage: /pollm <question> | <option1> | <option2> [...options]");
      return true;
    }
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: "",
      ts: new Date().toISOString(),
      reactions: [],
      attachments: [],
      poll: {
        ...poll,
        allowsMulti: true,
        createdBy: account.id
      }
    });
    return true;
  }

  if (command === "closepoll") {
    const changed = closeOrOpenLatestPoll(channel, true);
    addSystemMessage(channel, changed ? "Latest poll closed." : "No open poll found.");
    return true;
  }

  if (command === "reopenpoll") {
    const changed = closeOrOpenLatestPoll(channel, false);
    addSystemMessage(channel, changed ? "Latest poll reopened." : "No closed poll found.");
    return true;
  }

  if (command === "pollresults") {
    const pollMessage = findLatestPollMessage(channel);
    if (!pollMessage) {
      addSystemMessage(channel, "No poll found in this channel.");
      return true;
    }
    const includeVoters = arg.toLowerCase() === "voters";
    addSystemMessage(channel, formatPollResultsText(pollMessage, { includeVoters }));
    return true;
  }

  if (command === "vote") {
    const pollMessage = findLatestPollMessage(channel);
    if (!pollMessage) {
      addSystemMessage(channel, "No poll found in this channel.");
      return true;
    }
    const poll = normalizePoll(pollMessage.poll);
    if (!poll || poll.closed) {
      addSystemMessage(channel, "Latest poll is closed.");
      return true;
    }
    const indexes = (arg || "")
      .split(/[,\s]+/)
      .map((part) => Number(part))
      .filter((value) => Number.isInteger(value) && value > 0)
      .map((value) => value - 1);
    const uniqueIndexes = [...new Set(indexes)];
    if (uniqueIndexes.length === 0) {
      addSystemMessage(channel, "Usage: /vote <option-number> (for latest poll)");
      return true;
    }
    if (poll.allowsMulti && uniqueIndexes.length > 1) {
      const optionIds = uniqueIndexes
        .map((index) => poll.options[index]?.id)
        .filter(Boolean);
      if (optionIds.length === 0) {
        addSystemMessage(channel, "Usage: /vote <option-number[,option-number...]>");
        return true;
      }
      const changed = setPollVotesForUser(pollMessage, optionIds, account.id);
      addSystemMessage(channel, changed ? `Voted: ${optionIds.length} option(s).` : "Vote unchanged.");
      return true;
    }
    const option = poll.options[uniqueIndexes[0]];
    if (!option) {
      addSystemMessage(channel, "Usage: /vote <option-number> (for latest poll)");
      return true;
    }
    const changed = togglePollVote(pollMessage, option.id, account.id);
    addSystemMessage(channel, changed ? `Voted: ${option.label}` : "Vote failed.");
    return true;
  }

  if (command === "clear") {
    channel.messages = [];
    addSystemMessage(channel, "Channel history cleared.");
    return true;
  }

  if (command === "markread") {
    const guild = getActiveGuild();
    if (!guild) return true;
    if (arg.toLowerCase() === "all") {
      const changed = markGuildRead(guild, account.id);
      if (changed) addSystemMessage(channel, "Marked all channels in this guild as read.");
    } else {
      const changed = markChannelRead(channel, account.id);
      if (changed) addSystemMessage(channel, "Marked this channel as read.");
    }
    return true;
  }

  if (command === "topic") {
    channel.topic = arg.slice(0, 140);
    addSystemMessage(channel, channel.topic ? `Topic updated: ${channel.topic}` : "Topic cleared.");
    return true;
  }

  if (command === "slowmode") {
    if (!canCurrentUser("manageChannels")) {
      addSystemMessage(channel, "You need Manage Channels permission to change slowmode.");
      return true;
    }
    const raw = arg.trim().toLowerCase();
    if (!raw) {
      addSystemMessage(channel, `Current ${formatSlowmodeLabel(getChannelSlowmodeSeconds(channel)).toLowerCase()}.`);
      return true;
    }
    const parsed = raw === "off" ? 0 : normalizeSlowmodeSeconds(raw);
    if (!Number.isFinite(parsed) || (raw !== "off" && !/^\d+$/.test(raw))) {
      addSystemMessage(channel, "Usage: /slowmode <seconds|off>");
      return true;
    }
    channel.slowmodeSec = parsed;
    ensureChannelSlowmodeState(channel);
    addSystemMessage(channel, parsed > 0 ? `Slowmode set to ${parsed}s.` : "Slowmode disabled.");
    return true;
  }

  if (command === "pins") {
    renderPinsDialog();
    ui.pinsDialog.showModal();
    return true;
  }

  if (command === "unpinall") {
    if (!canCurrentUser("manageMessages")) {
      addSystemMessage(channel, "You need Manage Messages permission to unpin all messages.");
      return true;
    }
    let changed = 0;
    channel.messages.forEach((message) => {
      if (!message.pinned) return;
      message.pinned = false;
      changed += 1;
    });
    addSystemMessage(channel, changed > 0 ? `Unpinned ${changed} message${changed === 1 ? "" : "s"}.` : "No pinned messages to unpin.");
    return true;
  }

  if (command === "rename") {
    if (!canCurrentUser("manageChannels")) {
      addSystemMessage(channel, "You need Manage Channels permission to rename channels.");
      return true;
    }
    const nextName = sanitizeChannelName(arg, channel.name || "general");
    if (!nextName) {
      addSystemMessage(channel, "Usage: /rename <channel-name>");
      return true;
    }
    channel.name = nextName;
    addSystemMessage(channel, `Channel renamed to #${nextName}.`);
    return true;
  }

  if (command === "channelinfo") {
    const pinnedCount = channel.messages.filter((message) => message.pinned).length;
    const slowmode = getChannelSlowmodeSeconds(channel);
    const info = [
      `#${channel.name}`,
      `Type: ${channel.type || "text"}`,
      `Topic: ${(channel.topic || "No topic").slice(0, 140)}`,
      `Slowmode: ${slowmode > 0 ? `${slowmode}s` : "off"}`,
      `Messages: ${channel.messages.length}`,
      `Pinned: ${pinnedCount}`
    ];
    addSystemMessage(channel, info.join(" · "));
    return true;
  }

  if (command === "whereami") {
    const guild = getActiveGuild();
    const mode = getViewMode();
    const link = guild ? buildChannelPermalink(guild.id, channel.id) : "";
    addSystemMessage(channel, [
      `Mode: ${mode}`,
      `Guild: ${guild?.name || "n/a"} (${guild?.id || "n/a"})`,
      `Channel: #${channel.name} (${channel.id})`,
      link ? `Link: ${link}` : ""
    ].filter(Boolean).join("\n"));
    return true;
  }

  if (command === "jumpunread") {
    const unreadMessageId = findFirstUnreadMessageId(channel, account);
    if (!unreadMessageId) {
      addSystemMessage(channel, "No unread messages in this channel.");
      return true;
    }
    requestAnimationFrame(() => {
      focusMessageById(unreadMessageId);
    });
    return true;
  }

  if (command === "nextunread") {
    const moved = jumpToUnreadGuildChannel(1);
    if (!moved) addSystemMessage(channel, "No other unread channels in this guild.");
    return true;
  }

  if (command === "prevunread") {
    const moved = jumpToUnreadGuildChannel(-1);
    if (!moved) addSystemMessage(channel, "No other unread channels in this guild.");
    return true;
  }

  if (command === "unreadcount") {
    const guild = getActiveGuild();
    if (!guild) return true;
    const totals = getGuildUnreadStats(guild, account);
    addSystemMessage(
      channel,
      `Unread in ${guild.name}: ${totals.unread} message${totals.unread === 1 ? "" : "s"}, ${totals.mentions} mention${totals.mentions === 1 ? "" : "s"}.`
    );
    return true;
  }

  if (command === "drafts") {
    const guild = getActiveGuild();
    const channelDrafts = guild?.channels
      ?.filter((entry) => hasDraftForConversation(entry.id))
      ?.map((entry) => `#${entry.name}`) || [];
    const dmDrafts = state.dmThreads
      .filter((thread) => hasDraftForConversation(thread.id))
      .map((thread) => {
        const peerId = thread.participantIds.find((id) => id !== account.id);
        const peer = peerId ? getAccountById(peerId) : null;
        return peer ? `@${peer.username}` : "(unknown DM)";
      });
    const parts = [];
    if (channelDrafts.length > 0) parts.push(`Channels: ${channelDrafts.join(", ")}`);
    if (dmDrafts.length > 0) parts.push(`DMs: ${dmDrafts.join(", ")}`);
    addSystemMessage(channel, parts.length > 0 ? parts.join("\n") : "No saved drafts.");
    return true;
  }

  if (command === "cleardrafts") {
    const scope = arg.toLowerCase();
    if (scope === "all") {
      state.composerDrafts = {};
      if (conversationId) setComposerDraft(conversationId, "");
      addSystemMessage(channel, "Cleared all saved drafts.");
      renderChannels();
      return true;
    }
    if (conversationId) setComposerDraft(conversationId, "");
    ui.messageInput.value = "";
    resizeComposerInput();
    addSystemMessage(channel, "Cleared draft for this conversation.");
    renderChannels();
    renderComposerMeta();
    return true;
  }

  if (command === "focus") {
    const target = arg.toLowerCase();
    if (!target || target === "search") {
      const input = getViewMode() === "dm" ? ui.dmSearchInput : ui.channelFilterInput;
      input?.focus();
      input?.select?.();
      return true;
    }
    if (target === "composer") {
      ui.messageInput.focus();
      return true;
    }
    addSystemMessage(channel, "Usage: /focus [search|composer]");
    return true;
  }

  if (command === "find") {
    openFindDialogWithQuery(arg);
    return true;
  }

  if (command === "findnext") {
    if (!findQuery.trim()) {
      openFindDialog();
      return true;
    }
    moveFindSelection(1);
    return true;
  }

  if (command === "findprev") {
    if (!findQuery.trim()) {
      openFindDialog();
      return true;
    }
    moveFindSelection(-1);
    return true;
  }

  if (command === "markunread") {
    const conversation = getActiveConversation();
    if (!conversation || !account?.id) return true;
    const bucket = conversation.type === "dm"
      ? (conversation.thread?.messages || [])
      : (conversation.channel?.messages || []);
    if (bucket.length === 0) {
      addSystemMessage(channel, "No messages available to mark unread from.");
      return true;
    }
    const needle = arg.trim().toLowerCase();
    const targetMessage = !needle || needle === "last"
      ? bucket[bucket.length - 1]
      : bucket.find((entry) => (entry.id || "").toLowerCase().startsWith(needle));
    if (!targetMessage) {
      addSystemMessage(channel, "Usage: /markunread [message-id-prefix|last]");
      return true;
    }
    const changed = markConversationUnreadFromMessage(conversation, targetMessage.id, account.id);
    if (!changed) {
      addSystemMessage(channel, "Could not mark unread from that message.");
      return true;
    }
    saveState();
    renderServers();
    renderDmList();
    renderChannels();
    renderMessages();
    showToast(`Marked unread from ${targetMessage.id.slice(0, 8)}.`);
    return true;
  }

  if (command === "newdm") {
    const targetName = normalizeUsername(arg);
    if (!targetName) {
      addSystemMessage(channel, "Usage: /newdm <username>");
      return true;
    }
    let target = getAccountByUsername(targetName);
    if (!target) {
      target = createAccount(targetName, targetName);
      state.accounts.push(target);
    }
    if (target.id === account.id) {
      addSystemMessage(channel, "Cannot open DM with yourself.");
      return true;
    }
    openDmWithAccount(target);
    return true;
  }

  if (command === "closedm") {
    if (getViewMode() !== "dm" || !state.activeDmId) {
      addSystemMessage(channel, "No active DM to close.");
      return true;
    }
    const closingId = state.activeDmId;
    state.dmThreads = state.dmThreads.filter((entry) => entry.id !== closingId);
    state.activeDmId = null;
    saveState();
    render();
    return true;
  }

  if (command === "leaveguild") {
    if (getViewMode() !== "guild") {
      addSystemMessage(channel, "Switch to a guild channel to use /leaveguild.");
      return true;
    }
    const guild = getActiveGuild();
    if (!guild || state.guilds.length <= 1) {
      addSystemMessage(channel, "You cannot leave the last remaining guild.");
      return true;
    }
    const accountId = account.id;
    guild.memberIds = (guild.memberIds || []).filter((id) => id !== accountId);
    if (guild.memberRoles && typeof guild.memberRoles === "object") delete guild.memberRoles[accountId];
    if (guild.memberIds.length === 0) {
      removeGuildFromFolders(guild.id);
      state.guilds = state.guilds.filter((entry) => entry.id !== guild.id);
    }
    const nextGuild = state.guilds.find((entry) => entry.id !== guild.id) || state.guilds[0] || null;
    state.activeGuildId = nextGuild?.id || null;
    state.activeChannelId = nextGuild?.channels?.[0]?.id || null;
    state.viewMode = "guild";
    state.activeDmId = null;
    saveState();
    render();
    return true;
  }

  if (command === "newchannel") {
    if (!canCurrentUser("manageChannels")) {
      notifyPermissionDenied("Manage Channels");
      return true;
    }
    const guild = getActiveGuild();
    if (!guild) return true;
    const parts = arg.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      addSystemMessage(channel, "Usage: /newchannel <name> [text|announcement|forum|media|voice|stage]");
      return true;
    }
    const maybeType = (parts[parts.length - 1] || "").toLowerCase();
    const allowedTypes = new Set(["text", "announcement", "forum", "media", "voice", "stage"]);
    const type = allowedTypes.has(maybeType) ? maybeType : "text";
    const namePart = allowedTypes.has(maybeType) ? parts.slice(0, -1).join("-") : parts.join("-");
    const next = {
      id: createId(),
      name: sanitizeChannelName(namePart, "new-channel"),
      type,
      topic: "",
      forumTags: [],
      permissionOverrides: {},
      voiceState: createVoiceState(),
      readState: state.currentAccountId ? { [state.currentAccountId]: new Date().toISOString() } : {},
      slowmodeSec: 0,
      slowmodeState: {},
      messages: []
    };
    guild.channels.push(next);
    state.activeChannelId = next.id;
    saveState();
    render();
    return true;
  }

  if (command === "dupchannel") {
    if (!canCurrentUser("manageChannels")) {
      notifyPermissionDenied("Manage Channels");
      return true;
    }
    const guild = getActiveGuild();
    if (!guild) return true;
    const clone = duplicateChannelInGuild(guild, channel);
    if (!clone) return true;
    state.activeChannelId = clone.id;
    saveState();
    render();
    return true;
  }

  if (command === "movechannel") {
    if (!canCurrentUser("manageChannels")) {
      notifyPermissionDenied("Manage Channels");
      return true;
    }
    const guild = getActiveGuild();
    if (!guild) return true;
    const direction = arg.toLowerCase();
    let moved = false;
    if (direction === "up") moved = moveChannelByOffset(guild, channel.id, -1);
    else if (direction === "down") moved = moveChannelByOffset(guild, channel.id, 1);
    else if (direction === "top") {
      while (moveChannelByOffset(guild, channel.id, -1)) moved = true;
    } else if (direction === "bottom") {
      while (moveChannelByOffset(guild, channel.id, 1)) moved = true;
    } else {
      addSystemMessage(channel, "Usage: /movechannel <up|down|top|bottom>");
      return true;
    }
    if (!moved) {
      addSystemMessage(channel, "Channel already at requested position.");
      return true;
    }
    saveState();
    renderChannels();
    return true;
  }

  if (command === "markdmread") {
    const dm = getActiveDmThread();
    if (!dm) {
      addSystemMessage(channel, "No active DM thread.");
      return true;
    }
    const changed = markDmRead(dm, account.id);
    if (!changed) {
      addSystemMessage(channel, "DM already read.");
      return true;
    }
    saveState();
    render();
    return true;
  }

  if (command === "markallread") {
    const changed = markAllReadForAccount(account.id);
    if (!changed) {
      addSystemMessage(channel, "Everything is already read.");
      return true;
    }
    saveState();
    render();
    return true;
  }

  if (command === "copylink") {
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const link = conversation.type === "channel"
      ? buildChannelPermalink(getActiveGuild()?.id || "", conversation.channel.id)
      : buildMessagePermalink(conversation.thread.id, "");
    void copyText(link).then((ok) => {
      addSystemMessage(channel, ok ? "Copied current link." : "Failed to copy link.");
    });
    return true;
  }

  if (command === "copyid") {
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const id = conversation.type === "channel" ? conversation.channel.id : conversation.thread.id;
    void copyText(id).then((ok) => {
      addSystemMessage(channel, ok ? "Copied current ID." : "Failed to copy ID.");
    });
    return true;
  }

  if (command === "copytopic") {
    const topic = (channel?.topic || "").toString();
    void copyText(topic).then((ok) => {
      addSystemMessage(channel, ok ? "Copied channel topic." : "Failed to copy topic.");
    });
    return true;
  }

  if (command === "notify") {
    const guild = getActiveGuild();
    if (!guild) {
      addSystemMessage(channel, "No active guild.");
      return true;
    }
    const raw = arg.toLowerCase();
    if (!raw || raw === "status") {
      addSystemMessage(channel, `Guild notifications: ${getGuildNotificationMode(guild.id)}`);
      return true;
    }
    if (!["all", "mentions", "mute"].includes(raw)) {
      addSystemMessage(channel, "Usage: /notify [status|all|mentions|mute]");
      return true;
    }
    setGuildNotificationMode(guild.id, raw);
    addSystemMessage(channel, `Guild notifications set to: ${raw}`);
    renderServers();
    renderChannels();
    return true;
  }

  if (command === "schedule") {
    const splitAt = arg.indexOf("|");
    if (splitAt < 0) {
      addSystemMessage(channel, "Usage: /schedule <when> | <text>");
      return true;
    }
    const whenRaw = arg.slice(0, splitAt).trim();
    const textRaw = arg.slice(splitAt + 1).trim();
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const queued = queueScheduledMessage(conversation, account, whenRaw, textRaw);
    if (!queued.ok) {
      addSystemMessage(channel, queued.error || "Could not schedule message.");
      return true;
    }
    const eta = formatRelativeMs(toTimestampMs(queued.entry.sendAt));
    addSystemMessage(channel, `Scheduled ${queued.entry.id.slice(0, 8)} for ${new Date(queued.entry.sendAt).toLocaleString()} (${eta}).`);
    return true;
  }

  if (command === "scheduled") {
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const rows = listScheduledMessagesForConversation(conversation.id);
    if (rows.length === 0) {
      addSystemMessage(channel, "No scheduled messages in this conversation.");
      return true;
    }
    addSystemMessage(channel, rows.slice(0, 12).map((entry) => (
      `${entry.id.slice(0, 8)} · ${new Date(entry.sendAt).toLocaleString()} · ${entry.text.slice(0, 80)}`
    )).join("\n"));
    return true;
  }

  if (command === "unschedule") {
    if (!arg) {
      addSystemMessage(channel, "Usage: /unschedule <id|last|all>");
      return true;
    }
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const removed = removeScheduledMessageByToken(conversation.id, arg.trim());
    addSystemMessage(channel, removed > 0 ? `Removed ${removed} scheduled message${removed === 1 ? "" : "s"}.` : "No scheduled message matched.");
    return true;
  }

  if (command === "vc" || command === "voice") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    const action = (arg || "status").toLowerCase();
    const connected = channel.voiceState.connectedIds.includes(account.id);
    if (action === "status") {
      const muted = channel.voiceState.mutedIds.includes(account.id);
      const speakers = channel.type === "stage" ? channel.voiceState.speakerIds.length : 0;
      const raised = channel.type === "stage" ? channel.voiceState.raisedHandIds.length : 0;
      addSystemMessage(
        channel,
        [
          `Connected: ${connected ? "yes" : "no"}`,
          `Muted: ${muted ? "yes" : "no"}`,
          `Listeners: ${channel.voiceState.connectedIds.length}`,
          channel.type === "stage" ? `Speakers: ${speakers}` : "",
          channel.type === "stage" ? `Queue: ${raised}` : ""
        ].filter(Boolean).join(" · ")
      );
      return true;
    }
    if (action === "join") {
      if (connected) {
        addSystemMessage(channel, "Already connected.");
        return true;
      }
      joinVoiceLikeChannel(channel, account.id);
      addSystemMessage(channel, "Joined channel.");
      renderMemberList();
      renderMessages();
      return true;
    }
    if (action === "leave") {
      if (!connected) {
        addSystemMessage(channel, "Not connected.");
        return true;
      }
      leaveVoiceLikeChannel(channel, account.id);
      addSystemMessage(channel, "Left channel.");
      renderMemberList();
      renderMessages();
      return true;
    }
    if (action === "toggle") {
      const changed = connected
        ? leaveVoiceLikeChannel(channel, account.id)
        : joinVoiceLikeChannel(channel, account.id);
      if (changed) addSystemMessage(channel, connected ? "Left channel." : "Joined channel.");
      renderMemberList();
      renderMessages();
      return true;
    }
    if (action === "mute" || action === "unmute") {
      if (!connected) {
        addSystemMessage(channel, "Join first, then use mute controls.");
        return true;
      }
      const changed = setVoiceMuteState(channel, account.id, action === "mute");
      if (changed) {
        addVoiceActivity(channel, account.id, action);
        addSystemMessage(channel, action === "mute" ? "Muted." : "Unmuted.");
      } else {
        addSystemMessage(channel, action === "mute" ? "Already muted." : "Already unmuted.");
      }
      renderMemberList();
      renderMessages();
      return true;
    }
    addSystemMessage(channel, "Usage: /vc <join|leave|mute|unmute|toggle|status>");
    return true;
  }

  if (command === "voicewho") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    const guild = getActiveGuild();
    ensureVoiceStateForChannel(channel);
    const rows = channel.voiceState.connectedIds
      .map((id) => getAccountById(id))
      .filter(Boolean)
      .map((member) => {
        const flags = [];
        if (channel.voiceState.mutedIds.includes(member.id)) flags.push("Muted");
        if (channel.type === "stage" && channel.voiceState.speakerIds.includes(member.id)) flags.push("Speaker");
        if (channel.type === "stage" && channel.voiceState.raisedHandIds.includes(member.id)) flags.push("Hand Raised");
        return `${displayNameForAccount(member, guild?.id || null)}${flags.length > 0 ? ` (${flags.join(", ")})` : ""}`;
      });
    addSystemMessage(channel, rows.length > 0 ? `Connected: ${rows.join(" · ")}` : "Nobody is connected.");
    return true;
  }

  if (command === "voiceactivity") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    const guild = getActiveGuild();
    ensureVoiceStateForChannel(channel);
    const countRaw = Number(arg.trim());
    const limit = Number.isFinite(countRaw) ? Math.max(1, Math.min(20, Math.floor(countRaw))) : 8;
    const rows = (channel.voiceState.activity || [])
      .slice(-limit)
      .reverse()
      .map((entry) => `${formatTime(entry.ts)} · ${describeVoiceActivity(entry, guild)}`);
    addSystemMessage(channel, rows.length > 0 ? rows.join("\n") : "No voice activity yet.");
    return true;
  }

  if (command === "voicechannels") {
    const guild = getActiveGuild();
    if (!guild) return true;
    const current = getCurrentAccount();
    const rows = (guild.channels || [])
      .filter((entry) => entry.type === "voice" || entry.type === "stage")
      .map((entry) => {
        ensureVoiceStateForChannel(entry);
        const connected = entry.voiceState.connectedIds.length;
        const speakers = entry.type === "stage" ? ` S${entry.voiceState.speakerIds.length}` : "";
        const queue = entry.type === "stage" ? ` Q${entry.voiceState.raisedHandIds.length}` : "";
        const me = current && entry.voiceState.connectedIds.includes(current.id) ? " (joined)" : "";
        return `#${entry.name}: ${connected}${speakers}${queue}${me}`;
      });
    addSystemMessage(channel, rows.length > 0 ? rows.join("\n") : "No voice/stage channels in this guild.");
    return true;
  }

  if (command === "voicegoto") {
    const guild = getActiveGuild();
    if (!guild) return true;
    const targetChannel = resolveVoiceChannelByToken(guild, arg);
    if (!targetChannel) {
      addSystemMessage(channel, "Usage: /voicegoto <channel>");
      return true;
    }
    state.activeChannelId = targetChannel.id;
    const changed = joinVoiceLikeChannel(targetChannel, account.id);
    saveState();
    render();
    addSystemMessage(targetChannel, changed ? "Joined channel." : "Already connected.");
    return true;
  }

  if (command === "vcmove") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    if (!canModerateVoiceLikeChannel(channel)) {
      addSystemMessage(channel, "Voice moderation permission required.");
      return true;
    }
    const guild = getActiveGuild();
    const parts = arg.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      addSystemMessage(channel, "Usage: /vcmove <member> <target-channel>");
      return true;
    }
    const memberToken = parts[0];
    const targetToken = parts.slice(1).join(" ");
    const targetMember = resolveVoiceParticipantByToken(channel, memberToken, guild);
    if (!targetMember) {
      addSystemMessage(channel, "Member not found in this call.");
      return true;
    }
    const targetChannel = resolveVoiceChannelByToken(guild, targetToken);
    if (!targetChannel) {
      addSystemMessage(channel, "Target voice/stage channel not found.");
      return true;
    }
    if (targetChannel.id === channel.id) {
      addSystemMessage(channel, "Member is already in that channel.");
      return true;
    }
    const changed = joinVoiceLikeChannel(targetChannel, targetMember.id);
    if (!changed) {
      addSystemMessage(channel, "Could not move member.");
      return true;
    }
    addVoiceActivity(channel, account.id, "disconnected", `${displayNameForAccount(targetMember, guild?.id || null)} -> #${targetChannel.name}`);
    addVoiceActivity(targetChannel, account.id, "promoted", `${displayNameForAccount(targetMember, guild?.id || null)} from #${channel.name}`);
    addSystemMessage(channel, `Moved ${displayNameForAccount(targetMember, guild?.id || null)} to #${targetChannel.name}.`);
    renderMemberList();
    renderChannels();
    renderMessages();
    return true;
  }

  if (command === "voicekick") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    if (!canModerateVoiceLikeChannel(channel)) {
      addSystemMessage(channel, "Voice moderation permission required.");
      return true;
    }
    const guild = getActiveGuild();
    const target = resolveVoiceParticipantByToken(channel, arg, guild);
    if (!target) {
      addSystemMessage(channel, "Usage: /voicekick <member>");
      return true;
    }
    const changed = leaveVoiceLikeChannel(channel, target.id);
    if (!changed) {
      addSystemMessage(channel, "No change applied.");
      return true;
    }
    addVoiceActivity(channel, account.id, "disconnected", displayNameForAccount(target, guild?.id || null));
    addSystemMessage(channel, `Disconnected ${displayNameForAccount(target, guild?.id || null)}.`);
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "hand") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    if (!channel.voiceState.connectedIds.includes(account.id)) {
      addSystemMessage(channel, "Join the stage first.");
      return true;
    }
    const action = (arg || "toggle").toLowerCase();
    const changed = action === "raise"
      ? setStageRaisedHandState(channel, account.id, true)
      : action === "lower"
        ? setStageRaisedHandState(channel, account.id, false)
        : action === "toggle"
          ? toggleRaisedHandForSelf(channel, account.id)
          : null;
    if (changed === null) {
      addSystemMessage(channel, "Usage: /hand [raise|lower|toggle]");
      return true;
    }
    if (changed && action !== "toggle") addVoiceActivity(channel, account.id, action === "raise" ? "hand_raise" : "hand_lower");
    addSystemMessage(channel, channel.voiceState.raisedHandIds.includes(account.id) ? "Hand raised." : "Hand lowered.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "speaker") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    if (!channel.voiceState.connectedIds.includes(account.id)) {
      addSystemMessage(channel, "Join the stage first.");
      return true;
    }
    const action = (arg || "toggle").toLowerCase();
    const changed = action === "on"
      ? setStageSpeakerState(channel, account.id, true)
      : action === "off"
        ? setStageSpeakerState(channel, account.id, false)
        : action === "toggle"
          ? toggleStageSpeaker(channel, account.id)
          : null;
    if (changed === null) {
      addSystemMessage(channel, "Usage: /speaker [on|off|toggle]");
      return true;
    }
    if (changed && action !== "toggle") addVoiceActivity(channel, account.id, action === "on" ? "speaker_on" : "speaker_off");
    addSystemMessage(channel, channel.voiceState.speakerIds.includes(account.id) ? "You are now a speaker." : "You are now a listener.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "stagequeue") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    const guild = getActiveGuild();
    ensureVoiceStateForChannel(channel);
    const queueRows = channel.voiceState.raisedHandIds
      .map((id) => getAccountById(id))
      .filter(Boolean)
      .map((member, idx) => `${idx + 1}. ${displayNameForAccount(member, guild?.id || null)}`);
    addSystemMessage(channel, queueRows.length > 0 ? `Queue:\n${queueRows.join("\n")}` : "No raised hands.");
    return true;
  }

  if (command === "stageclearqueue") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    if (!canModerateStageChannel(channel)) {
      addSystemMessage(channel, "Stage Moderation permission required.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    const removed = channel.voiceState.raisedHandIds.length;
    if (removed <= 0) {
      addSystemMessage(channel, "Queue already empty.");
      return true;
    }
    channel.voiceState.raisedHandIds = [];
    addVoiceActivity(channel, account.id, "dismissed", `${removed} queue item(s) cleared`);
    addSystemMessage(channel, `Cleared ${removed} raised hand${removed === 1 ? "" : "s"}.`);
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "stageshush") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    if (!canModerateStageChannel(channel)) {
      addSystemMessage(channel, "Stage Moderation permission required.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    const listeners = channel.voiceState.connectedIds.filter((id) => !channel.voiceState.speakerIds.includes(id));
    let changed = 0;
    listeners.forEach((id) => {
      if (setVoiceMuteState(channel, id, true)) changed += 1;
    });
    if (changed > 0) addVoiceActivity(channel, account.id, "mute", `${changed} listener(s)`);
    addSystemMessage(channel, changed > 0 ? `Muted ${changed} listener${changed === 1 ? "" : "s"}.` : "No listeners to mute.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "stageaudience") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    if (!canModerateStageChannel(channel)) {
      addSystemMessage(channel, "Stage Moderation permission required.");
      return true;
    }
    const guild = getActiveGuild();
    const keep = arg.trim() ? resolveVoiceParticipantByToken(channel, arg, guild) : null;
    ensureVoiceStateForChannel(channel);
    const originalSpeakers = [...channel.voiceState.speakerIds];
    channel.voiceState.speakerIds = keep ? [keep.id] : [];
    const changed = originalSpeakers.length !== channel.voiceState.speakerIds.length
      || originalSpeakers.some((id) => !channel.voiceState.speakerIds.includes(id));
    if (changed) addVoiceActivity(channel, account.id, "demoted", keep ? `${originalSpeakers.length} -> keep ${displayNameForAccount(keep, guild?.id || null)}` : "all speakers demoted");
    addSystemMessage(channel, changed ? (keep ? `Moved all but ${displayNameForAccount(keep, guild?.id || null)} to audience.` : "Moved all speakers to audience.") : "No change applied.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "stage") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    if (!canModerateStageChannel(channel)) {
      addSystemMessage(channel, "Stage Moderation permission required.");
      return true;
    }
    const guild = getActiveGuild();
    const [rawAction, ...restToken] = arg.split(" ");
    const action = (rawAction || "").toLowerCase();
    const token = restToken.join(" ").trim();
    if (!action || !token) {
      addSystemMessage(channel, "Usage: /stage <approve|dismiss|mute|unmute|promote|demote|disconnect> <member>");
      return true;
    }
    const target = resolveVoiceParticipantByToken(channel, token, guild);
    if (!target) {
      addSystemMessage(channel, "Member not found (use username/display name or id prefix).");
      return true;
    }
    let changed = false;
    if (action === "approve" || action === "promote") {
      changed = setStageSpeakerState(channel, target.id, true);
      if (changed) addVoiceActivity(channel, account.id, action === "approve" ? "approved" : "promoted", displayNameForAccount(target, guild?.id || null));
    } else if (action === "dismiss") {
      changed = setStageRaisedHandState(channel, target.id, false);
      if (changed) addVoiceActivity(channel, account.id, "dismissed", displayNameForAccount(target, guild?.id || null));
    } else if (action === "mute") {
      changed = setVoiceMuteState(channel, target.id, true);
      if (changed) addVoiceActivity(channel, account.id, "mute", displayNameForAccount(target, guild?.id || null));
    } else if (action === "unmute") {
      changed = setVoiceMuteState(channel, target.id, false);
      if (changed) addVoiceActivity(channel, account.id, "unmute", displayNameForAccount(target, guild?.id || null));
    } else if (action === "demote") {
      changed = setStageSpeakerState(channel, target.id, false);
      if (changed) addVoiceActivity(channel, account.id, "demoted", displayNameForAccount(target, guild?.id || null));
    } else if (action === "disconnect") {
      changed = leaveVoiceLikeChannel(channel, target.id);
      if (changed) addVoiceActivity(channel, account.id, "disconnected", displayNameForAccount(target, guild?.id || null));
    } else {
      addSystemMessage(channel, "Usage: /stage <approve|dismiss|mute|unmute|promote|demote|disconnect> <member>");
      return true;
    }
    addSystemMessage(channel, changed ? `Updated ${displayNameForAccount(target, guild?.id || null)}.` : "No change applied.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "forumtag") {
    if (channel.type !== "forum") {
      addSystemMessage(channel, "This command only works in forum channels.");
      return true;
    }
    const [sub, ...restTag] = arg.split(" ");
    const action = (sub || "").toLowerCase();
    const payload = restTag.join(" ").trim();
    channel.forumTags = forumTagsForChannel(channel);
    if (!action || action === "list") {
      if (channel.forumTags.length === 0) {
        addSystemMessage(channel, "No forum tags configured.");
      } else {
        addSystemMessage(channel, `Forum tags: ${channel.forumTags.map((tag) => tag.name).join(", ")}`);
      }
      return true;
    }
    if (!canCurrentUser("manageChannels")) {
      addSystemMessage(channel, "Manage Channels permission required.");
      return true;
    }
    if (action === "add") {
      const colorMatch = payload.match(/\s+(#[0-9a-f]{3,8})$/i);
      const color = colorMatch ? colorMatch[1] : "#5865f2";
      const nameRaw = colorMatch ? payload.slice(0, -colorMatch[0].length) : payload;
      const name = sanitizeForumTagName(nameRaw);
      if (!name) {
        addSystemMessage(channel, "Usage: /forumtag add <name> [#color]");
        return true;
      }
      if (resolveForumTagByName(channel, name)) {
        addSystemMessage(channel, `Forum tag already exists: ${name}`);
        return true;
      }
      channel.forumTags.push({ id: createId(), name, color });
      addSystemMessage(channel, `Added forum tag: ${name}`);
      return true;
    }
    if (action === "remove") {
      const name = sanitizeForumTagName(payload);
      if (!name) {
        addSystemMessage(channel, "Usage: /forumtag remove <name>");
        return true;
      }
      const tag = resolveForumTagByName(channel, name);
      if (!tag) {
        addSystemMessage(channel, `Forum tag not found: ${name}`);
        return true;
      }
      channel.forumTags = channel.forumTags.filter((entry) => entry.id !== tag.id);
      channel.messages.forEach((message) => {
        message.forumTagIds = normalizeThreadTagIds(message.forumTagIds, channel.forumTags);
      });
      setForumThreadTagFilter(channel.id, getForumThreadTagFilter(channel.id).filter((id) => id !== tag.id));
      addSystemMessage(channel, `Removed forum tag: ${name}`);
      renderMessages();
      return true;
    }
    addSystemMessage(channel, "Usage: /forumtag <add|remove|list> ...");
    return true;
  }

  if (command === "tagthread") {
    if (channel.type !== "forum") {
      addSystemMessage(channel, "This command only works in forum channels.");
      return true;
    }
    channel.forumTags = forumTagsForChannel(channel);
    const roots = channel.messages.filter((entry) => !entry.forumThreadId);
    const targetRoot = replyTarget?.threadId
      ? roots.find((entry) => entry.id === replyTarget.threadId)
      : roots[roots.length - 1];
    if (!targetRoot) {
      addSystemMessage(channel, "No forum thread found. Create a post first.");
      return true;
    }
    const raw = arg.trim();
    if (!raw) {
      const currentTags = normalizeThreadTagIds(targetRoot.forumTagIds, channel.forumTags)
        .map((id) => channel.forumTags.find((tag) => tag.id === id)?.name)
        .filter(Boolean);
      addSystemMessage(channel, currentTags.length > 0 ? `Thread tags: ${currentTags.join(", ")}` : "Thread has no tags.");
      return true;
    }
    if (raw.toLowerCase() === "clear") {
      targetRoot.forumTagIds = [];
      addSystemMessage(channel, "Cleared thread tags.");
      return true;
    }
    const names = [...new Set(raw.split(",").map((entry) => sanitizeForumTagName(entry)).filter(Boolean))];
    if (names.length === 0) {
      addSystemMessage(channel, "Usage: /tagthread <tag1,tag2...|clear>");
      return true;
    }
    const resolved = names.map((name) => resolveForumTagByName(channel, name)).filter(Boolean);
    if (resolved.length === 0) {
      addSystemMessage(channel, "No matching forum tags. Use /forumtag add first.");
      return true;
    }
    targetRoot.forumTagIds = normalizeThreadTagIds(resolved.map((tag) => tag.id), channel.forumTags);
    addSystemMessage(channel, `Thread tags set: ${resolved.map((tag) => tag.name).join(", ")}`);
    renderMessages();
    return true;
  }

  if (command === "nick") {
    if (arg) {
      const guild = getActiveGuild();
      const nextNick = arg.slice(0, 32);
      if (guild) {
        if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
        account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), nickname: nextNick };
        addSystemMessage(channel, `Guild nickname changed to ${nextNick}.`);
      } else {
        account.displayName = nextNick;
        addSystemMessage(channel, `Display name changed to ${account.displayName}.`);
      }
    }
    return true;
  }

  if (command === "status") {
    const guild = getActiveGuild();
    if (guild) {
      if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
      const scoped = arg.slice(0, 80);
      if (scoped) {
        account.guildProfiles[guild.id] = {
          ...(account.guildProfiles[guild.id] || {}),
          status: scoped,
          statusEmoji: account.customStatusEmoji || ""
        };
        addSystemMessage(channel, `Guild status set to: ${scoped}`);
      } else if (account.guildProfiles[guild.id]) {
        delete account.guildProfiles[guild.id].status;
        delete account.guildProfiles[guild.id].statusEmoji;
        if (Object.keys(account.guildProfiles[guild.id]).length === 0) delete account.guildProfiles[guild.id];
        addSystemMessage(channel, "Guild status cleared.");
      }
    } else {
      account.customStatus = arg.slice(0, 80);
      addSystemMessage(channel, account.customStatus ? `Status set to: ${account.customStatus}` : "Status cleared.");
    }
    return true;
  }

  if (command === "quests") {
    addSystemMessage(channel, formatQuestSummaryText(account.id));
    return true;
  }

  if (command === "questprogress") {
    addSystemMessage(channel, formatQuestSummaryText(account.id));
    return true;
  }

  if (command === "questbadges") {
    const badges = resolveQuestBadgesForAccount(account.id);
    addSystemMessage(channel, badges.length > 0 ? `Badges: ${badges.join(", ")}` : "No badges unlocked yet.");
    return true;
  }

  if (command === "profilefx") {
    const nextEffect = normalizeProfileEffect(arg);
    if (!arg) {
      addSystemMessage(channel, `Current profile effect: ${accountProfileEffect(account)}`);
      return true;
    }
    if (!["none", "aurora", "flame", "ocean"].includes(arg.toLowerCase())) {
      addSystemMessage(channel, "Usage: /profilefx <none|aurora|flame|ocean>");
      return true;
    }
    account.profileEffect = nextEffect;
    addSystemMessage(channel, `Profile effect set to: ${nextEffect}`);
    return true;
  }

  if (command === "guildtag") {
    const rawTag = arg.trim();
    if (!rawTag) {
      addSystemMessage(channel, `Current guild tag: ${accountGuildTag(account) || "(none)"}`);
      return true;
    }
    if (rawTag.toLowerCase() === "clear") {
      account.guildTag = "";
      addSystemMessage(channel, "Guild tag cleared.");
      return true;
    }
    account.guildTag = rawTag.slice(0, 8).toUpperCase();
    addSystemMessage(channel, `Guild tag set to: ${account.guildTag}`);
    return true;
  }

  if (command === "decor") {
    const rawDecor = arg.trim();
    if (!rawDecor) {
      addSystemMessage(channel, `Current avatar decoration: ${accountDecorationEmoji(account) || "(none)"}`);
      return true;
    }
    if (rawDecor.toLowerCase() === "clear") {
      account.avatarDecoration = "";
      addSystemMessage(channel, "Avatar decoration cleared.");
      return true;
    }
    account.avatarDecoration = rawDecor.slice(0, 4);
    addSystemMessage(channel, `Avatar decoration set to: ${account.avatarDecoration}`);
    return true;
  }

  if (command === "nameplate") {
    const rawNameplate = arg.trim();
    if (!rawNameplate) {
      addSystemMessage(channel, `Current nameplate: ${accountNameplateSvg(account) || "(none)"}`);
      return true;
    }
    if (rawNameplate.toLowerCase() === "clear") {
      account.profileNameplateSvg = "";
      addSystemMessage(channel, "Nameplate cleared.");
      return true;
    }
    if (!/^https?:\/\//i.test(rawNameplate) && !/^data:image\/svg\+xml/i.test(rawNameplate)) {
      addSystemMessage(channel, "Usage: /nameplate <https://...|data:image/svg+xml...|clear>");
      return true;
    }
    account.profileNameplateSvg = rawNameplate.slice(0, 280);
    addSystemMessage(channel, "Nameplate updated.");
    return true;
  }

  if (command === "whoami") {
    const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
    addSystemMessage(channel, formatIdentitySummaryText(account, guildId));
    return true;
  }

  if (command === "profilecard") {
    const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `🪪 ${formatIdentitySummaryText(account, guildId)}`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "shop") {
    openCosmeticsDialog(arg);
    return true;
  }

  if (command === "inventory") {
    addSystemMessage(channel, formatCosmeticInventorySummary(account.id));
    return true;
  }

  if (command === "mediaprivacy") {
    const mode = arg.toLowerCase();
    state.preferences = getPreferences();
    if (!mode || mode === "status") {
      addSystemMessage(channel, `Media privacy mode: ${state.preferences.mediaPrivacyMode === "off" ? "off" : "safe"}`);
      return true;
    }
    if (mode === "safe" || mode === "off") {
      state.preferences.mediaPrivacyMode = mode;
      saveState();
      addSystemMessage(channel, `Media privacy mode set to: ${mode}`);
      renderMessages();
      return true;
    }
    addSystemMessage(channel, "Usage: /mediaprivacy [status|safe|off]");
    return true;
  }

  if (command === "relay") {
    const [subRaw, ...restRelay] = arg.split(" ");
    const sub = (subRaw || "status").toLowerCase();
    const payload = restRelay.join(" ").trim();
    state.preferences = getPreferences();
    if (sub === "status") {
      const prefs = getPreferences();
      const adapter = getTransportAdapter(prefs.relayMode);
      addSystemMessage(channel, [
        `Mode: ${prefs.relayMode}`,
        `Adapter: ${adapter.label}`,
        `Status: ${relayStatusText()}`,
        `URL: ${prefs.relayMode === "xmpp" ? (resolveXmppServiceUrl(prefs) || "(unset)") : prefs.relayUrl}`,
        prefs.relayMode === "xmpp" ? `MUC: ${resolveXmppMucService(prefs) || "(unset)"}` : "",
        `Room: ${prefs.relayRoom || relayRoomForActiveConversation()}`
      ].join(" · "));
      return true;
    }
    if (sub === "connect") {
      if (/^xmpp$/i.test(payload)) state.preferences.relayMode = "xmpp";
      else state.preferences.relayMode = payload.toLowerCase().startsWith("http") ? "http" : "ws";
      if (payload) state.preferences.relayUrl = normalizeRelayUrl(payload);
      saveState();
      const ok = connectRelaySocket({ force: true });
      addSystemMessage(channel, ok ? "Relay connect requested." : "Relay connection failed to start.");
      return true;
    }
    if (sub === "disconnect") {
      disconnectRelaySocket({ manual: true });
      addSystemMessage(channel, "Relay disconnected.");
      return true;
    }
    if (sub === "mode") {
      const mode = normalizeRelayMode(payload);
      state.preferences.relayMode = mode;
      saveState();
      if (mode === "ws" || mode === "http") connectRelaySocket({ force: true });
      else disconnectRelaySocket({ manual: true });
      addSystemMessage(channel, `Relay mode set to: ${mode}`);
      return true;
    }
    if (sub === "url") {
      if (!payload) {
        addSystemMessage(channel, `Relay URL: ${state.preferences.relayUrl}`);
        return true;
      }
      state.preferences.relayUrl = normalizeRelayUrl(payload);
      saveState();
      addSystemMessage(channel, `Relay URL set to: ${state.preferences.relayUrl}`);
      return true;
    }
    if (sub === "room") {
      if (!payload || payload.toLowerCase() === "clear") {
        state.preferences.relayRoom = "";
        saveState();
        syncRelayRoomForActiveConversation();
        addSystemMessage(channel, "Relay room override cleared.");
        return true;
      }
      state.preferences.relayRoom = normalizeRelayRoom(payload);
      saveState();
      syncRelayRoomForActiveConversation();
      addSystemMessage(channel, `Relay room set to: ${state.preferences.relayRoom}`);
      return true;
    }
    addSystemMessage(channel, "Usage: /relay [status|connect|disconnect|mode <local|http|ws|xmpp|off>|url <http://...|ws://...>|room <name|clear>]");
    return true;
  }

  if (command === "trustdomain") {
    const lowered = arg.toLowerCase();
    if (!arg || lowered === "list") {
      const rules = getPreferences().mediaTrustRules;
      addSystemMessage(channel, rules.length > 0 ? `Trusted media rules: ${rules.join(", ")}` : "No trusted media rules.");
      return true;
    }
    const added = addMediaTrustRule(arg);
    if (added) {
      saveState();
      addSystemMessage(channel, `Added media trust rule: ${arg}`);
      renderMessages();
    } else {
      addSystemMessage(channel, `Media trust rule already exists or invalid: ${arg}`);
    }
    return true;
  }

  if (command === "untrustdomain") {
    if (!arg) {
      addSystemMessage(channel, "Usage: /untrustdomain <domain|*.domain|/regex/>");
      return true;
    }
    const removed = removeMediaTrustRule(arg);
    if (!removed) {
      addSystemMessage(channel, `Media trust rule not found: ${arg}`);
      return true;
    }
    saveState();
    addSystemMessage(channel, `Removed media trust rule: ${arg}`);
    renderMessages();
    return true;
  }

  if (command === "help") {
    const filter = arg.toLowerCase();
    const entries = filter
      ? SLASH_COMMANDS.filter((entry) => entry.name.includes(filter) || entry.description.toLowerCase().includes(filter))
      : SLASH_COMMANDS;
    const summary = entries
      .map((entry) => `/${entry.name}${entry.args ? ` ${entry.args}` : ""}`)
      .join(", ");
    addSystemMessage(channel, entries.length > 0 ? `Commands: ${summary}` : `No commands match "${arg}".`);
    return true;
  }

  if (command === "shortcuts") {
    openShortcutsDialog();
    return true;
  }

  addSystemMessage(channel, `Unknown command: /${command}`);
  return true;
}

function canEditMessageEntry(message, { isDm = false, canManageMessages = false, currentUser = null } = {}) {
  if (!message || !currentUser) return false;
  if (message.collaborative) return true;
  if (message.userId && message.userId === currentUser.id) return true;
  if (!isDm && canManageMessages) return true;
  return false;
}

function messageEditHistory(message) {
  return Array.isArray(message?.editHistory) ? message.editHistory : [];
}

function formatMessageEditHistory(message) {
  const history = messageEditHistory(message);
  if (history.length === 0) return "No edit history.";
  return history
    .map((entry, index) => {
      const editor = entry?.editorName || "Unknown";
      const when = entry?.editedAt || "";
      const text = (entry?.previousText || "").toString();
      return `${index + 1}. ${when} by ${editor}\n${text}`;
    })
    .join("\n\n");
}

function openMessageEditor(conversationId, messageId, messageText) {
  messageEditTarget = { conversationId, messageId };
  ui.messageEditInput.value = messageText || "";
  ui.messageEditDialog.showModal();
  requestAnimationFrame(() => {
    ui.messageEditInput.focus();
    ui.messageEditInput.select();
  });
}

function openShortcutsDialog() {
  ui.shortcutsDialog?.showModal();
}

function quickSwitchHaystackForItem(item) {
  return [
    item.label || "",
    item.meta || "",
    item.guildName || "",
    item.username || "",
    item.type || ""
  ].join(" ").toLowerCase();
}

function getQuickSwitchItems(rawQuery = "") {
  const query = (rawQuery || "").trim().toLowerCase();
  const current = getCurrentAccount();
  const items = [];
  state.guilds.forEach((guild) => {
    if (current && Array.isArray(guild.memberIds) && !guild.memberIds.includes(current.id)) return;
    items.push({
      id: `guild:${guild.id}`,
      type: "guild",
      label: guild.name,
      meta: "Guild",
      guildId: guild.id,
      guildName: guild.name
    });
    (guild.channels || []).forEach((channel) => {
      if (current && !canAccountViewChannel(guild, channel, current.id)) return;
      items.push({
        id: `channel:${guild.id}:${channel.id}`,
        type: "channel",
        label: `#${channel.name}`,
        meta: guild.name,
        guildId: guild.id,
        guildName: guild.name,
        channelId: channel.id
      });
    });
  });
  if (current) {
    state.dmThreads
      .filter((thread) => Array.isArray(thread.participantIds) && thread.participantIds.includes(current.id))
      .forEach((thread) => {
        const peerId = thread.participantIds.find((id) => id !== current.id);
        const peer = peerId ? getAccountById(peerId) : null;
        items.push({
          id: `dm:${thread.id}`,
          type: "dm",
          label: peer ? `@${peer.username}` : "Unknown DM",
          meta: "Direct Message",
          threadId: thread.id,
          username: peer?.username || ""
        });
      });
  }
  const scored = items
    .map((item) => {
      const haystack = quickSwitchHaystackForItem(item);
      if (!query) return { item, score: 10 };
      if (haystack.startsWith(query)) return { item, score: 0 };
      if (item.label.toLowerCase().startsWith(query)) return { item, score: 1 };
      if (haystack.includes(query)) return { item, score: 4 };
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.item.label.localeCompare(b.item.label))
    .slice(0, 40)
    .map((entry) => entry.item);
  return scored;
}

function activateQuickSwitchItem(item) {
  if (!item) return false;
  if (item.type === "dm" && item.threadId) {
    state.viewMode = "dm";
    state.activeDmId = item.threadId;
    saveState();
    render();
    return true;
  }
  if (item.type === "guild" && item.guildId) {
    return openGuildById(item.guildId);
  }
  if (item.type === "channel" && item.guildId && item.channelId) {
    const guild = state.guilds.find((entry) => entry.id === item.guildId);
    const current = getCurrentAccount();
    const channel = guild?.channels?.find((entry) => entry.id === item.channelId);
    if (!guild || !channel || (current && !canAccountViewChannel(guild, channel, current.id))) return false;
    state.viewMode = "guild";
    state.activeGuildId = guild.id;
    state.activeChannelId = item.channelId;
    state.activeDmId = null;
    rememberGuildChannelSelection(guild.id, item.channelId);
    saveState();
    render();
    return true;
  }
  return false;
}

function renderQuickSwitchList() {
  if (!ui.quickSwitchList) return;
  const items = getQuickSwitchItems(quickSwitchQuery);
  quickSwitchSelectionIndex = Math.max(0, Math.min(quickSwitchSelectionIndex, Math.max(0, items.length - 1)));
  ui.quickSwitchList.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No matches.";
    ui.quickSwitchList.appendChild(empty);
    return;
  }
  items.forEach((item, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `quick-switch-item ${index === quickSwitchSelectionIndex ? "active" : ""}`;
    const title = document.createElement("strong");
    title.textContent = item.label;
    const meta = document.createElement("small");
    meta.textContent = item.meta;
    row.appendChild(title);
    row.appendChild(meta);
    row.addEventListener("mouseenter", () => {
      quickSwitchSelectionIndex = index;
      renderQuickSwitchList();
    });
    row.addEventListener("click", () => {
      const ok = activateQuickSwitchItem(item);
      if (ok) ui.quickSwitchDialog?.close();
    });
    ui.quickSwitchList.appendChild(row);
  });
}

function openQuickSwitcher() {
  quickSwitchQuery = "";
  quickSwitchSelectionIndex = 0;
  if (ui.quickSwitchInput) ui.quickSwitchInput.value = "";
  renderQuickSwitchList();
  ui.quickSwitchDialog?.showModal();
  requestAnimationFrame(() => {
    ui.quickSwitchInput?.focus();
  });
}

function findLastEditableMessageInActiveConversation() {
  const conversation = getActiveConversation();
  const currentUser = getCurrentAccount();
  if (!conversation || !currentUser) return null;
  const isDm = conversation.type === "dm";
  const canManageMessages = !isDm && canCurrentUser("manageMessages");
  const bucket = isDm ? (conversation.thread?.messages || []) : (conversation.channel?.messages || []);
  for (let i = bucket.length - 1; i >= 0; i -= 1) {
    const candidate = bucket[i];
    if (canEditMessageEntry(candidate, { isDm, canManageMessages, currentUser })) {
      return {
        conversationId: conversation.id,
        messageId: candidate.id,
        text: candidate.text || ""
      };
    }
  }
  return null;
}

function getSlashMatches(inputValue) {
  if (!inputValue.startsWith("/")) return [];
  const term = inputValue.slice(1).split(" ")[0].toLowerCase();
  if (!term) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter((command) => command.name.startsWith(term));
}

function applySlashCompletion(commandName) {
  ui.messageInput.value = `/${commandName} `;
  slashSelectionIndex = 0;
  renderSlashSuggestions();
}

function getMentionContext(inputValue) {
  const caret = ui.messageInput.selectionStart ?? inputValue.length;
  const beforeCaret = inputValue.slice(0, caret);
  const match = beforeCaret.match(/(^|\s)@([a-z0-9._-]*)$/i);
  if (!match) return null;
  return {
    query: match[2].toLowerCase(),
    tokenStart: caret - match[2].length - 1,
    tokenEnd: caret
  };
}

function getMentionMatches(query) {
  const dm = getActiveDmThread();
  if (dm) {
    return dm.participantIds
      .map((memberId) => getAccountById(memberId))
      .filter(Boolean)
      .filter((account) => {
        const username = account.username.toLowerCase();
        const displayName = (account.displayName || "").toLowerCase();
        return !query || username.startsWith(query) || displayName.startsWith(query);
      })
      .slice(0, 8);
  }
  const server = getActiveServer();
  if (!server) return [];
  const accounts = server.memberIds
    .map((memberId) => getAccountById(memberId))
    .filter(Boolean);
  return accounts
    .filter((account) => {
      const username = account.username.toLowerCase();
      const displayName = (account.displayName || "").toLowerCase();
      const nickname = resolveAccountGuildNickname(account, server.id).toLowerCase();
      return !query || username.startsWith(query) || displayName.startsWith(query) || nickname.startsWith(query);
    })
    .slice(0, 8);
}

function applyMentionCompletion(account) {
  const raw = ui.messageInput.value;
  const context = getMentionContext(raw);
  if (!context) return;
  const prefix = raw.slice(0, context.tokenStart);
  const suffix = raw.slice(context.tokenEnd);
  ui.messageInput.value = `${prefix}@${account.username} ${suffix}`.replace(/\s{2,}/g, " ");
  mentionSelectionIndex = 0;
  renderSlashSuggestions();
}

function getComposerSuggestionState() {
  const raw = ui.messageInput.value;
  const trimmedStart = raw.trimStart();
  const slashFirstChunk = trimmedStart.slice(1);
  const slashHasWhitespace = /\s/.test(slashFirstChunk);
  if (trimmedStart.startsWith("/") && !slashHasWhitespace) {
    const slashMatches = getSlashMatches(trimmedStart);
    if (slashMatches.length > 0) {
      return { type: "slash", items: slashMatches };
    }
  }

  const mentionContext = getMentionContext(raw);
  if (mentionContext) {
    const mentionMatches = getMentionMatches(mentionContext.query);
    if (mentionMatches.length > 0) {
      return { type: "mention", items: mentionMatches };
    }
  }
  return { type: "none", items: [] };
}

function renderSlashSuggestions() {
  const suggestion = getComposerSuggestionState();
  const shouldShow = suggestion.type !== "none";
  ui.slashCommandPopup.classList.toggle("slash-popup--hidden", !shouldShow);
  ui.slashCommandList.innerHTML = "";
  if (!shouldShow) return;

  if (suggestion.type === "slash") {
    ui.suggestionHint.textContent = "Commands: use ↑↓ and Enter/Tab";
    slashSelectionIndex = Math.max(0, Math.min(slashSelectionIndex, suggestion.items.length - 1));
    suggestion.items.forEach((command, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = `slash-item ${index === slashSelectionIndex ? "active" : ""}`;
      const args = command.args ? ` ${command.args}` : "";
      item.innerHTML = `<strong>/${command.name}${args}</strong><small>${command.description}</small>`;
      item.addEventListener("mouseenter", () => {
        slashSelectionIndex = index;
        renderSlashSuggestions();
      });
      item.addEventListener("mousedown", (event) => {
        event.preventDefault();
        applySlashCompletion(command.name);
      });
      ui.slashCommandList.appendChild(item);
    });
    return;
  }

  ui.suggestionHint.textContent = "Mentions: use ↑↓ and Enter/Tab";
  mentionSelectionIndex = Math.max(0, Math.min(mentionSelectionIndex, suggestion.items.length - 1));
  suggestion.items.forEach((account, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `slash-item ${index === mentionSelectionIndex ? "active" : ""}`;
    const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
    item.innerHTML = `<strong>@${account.username}</strong><small>${displayNameForAccount(account, guildId)} · ${displayStatus(account, guildId)}</small>`;
    item.addEventListener("mouseenter", () => {
      mentionSelectionIndex = index;
      renderSlashSuggestions();
    });
    item.addEventListener("mousedown", (event) => {
      event.preventDefault();
      applyMentionCompletion(account);
    });
    ui.slashCommandList.appendChild(item);
  });
}

function renderComposerMeta() {
  if (composerMetaRefreshTimer) {
    clearTimeout(composerMetaRefreshTimer);
    composerMetaRefreshTimer = null;
  }
  const rawValue = (ui.messageInput.value || "").toString();
  const used = rawValue.length;
  if (ui.composerCharCount) {
    ui.composerCharCount.textContent = `${used}/400`;
    ui.composerCharCount.classList.toggle("is-near-limit", used >= 320);
    ui.composerCharCount.classList.toggle("is-at-limit", used >= 390);
  }

  const submitBtn = ui.messageForm?.querySelector?.("button[type=\"submit\"]");
  if (!(submitBtn instanceof HTMLButtonElement)) return;
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  const room = relayRoomForActiveConversation();
  const typingSummary = formatTypingSummary(typingNamesForRoom(room));
  if (ui.composerTypingNote) {
    ui.composerTypingNote.textContent = typingSummary;
    ui.composerTypingNote.hidden = !typingSummary;
  }
  if (!conversation || !account) {
    submitBtn.disabled = true;
    if (ui.composerSystemNotice) ui.composerSystemNotice.hidden = true;
    return;
  }

  if (conversation.type === "dm") {
    submitBtn.disabled = false;
    if (ui.composerSystemNotice) ui.composerSystemNotice.hidden = true;
    return;
  }

  const channel = conversation.channel;
  const canPost = canCurrentUserPostInChannel(channel, account);
  const remainingMs = getChannelSlowmodeRemainingMs(channel, account.id);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  if (ui.composerSystemNotice) {
    let notice = "";
    if (channel.type === "voice") {
      notice = "Voice channels use live call controls. Join voice to participate.";
    } else if (channel.type === "stage") {
      notice = "Stage channels are listen-first. Join stage and request speaking access.";
    } else if (!canPost) {
      notice = "You do not have permission to send messages in this channel.";
    } else if (remainingSeconds > 0) {
      notice = `Slowmode active. Wait ${remainingSeconds}s before sending again.`;
    } else {
      const slow = getChannelSlowmodeSeconds(channel);
      if (slow > 0) notice = `${formatSlowmodeLabel(slow)} is enabled.`;
    }
    ui.composerSystemNotice.textContent = notice;
    ui.composerSystemNotice.hidden = !notice;
  }

  const hasPayload = rawValue.trim().length > 0 || composerPendingAttachments.length > 0;
  submitBtn.disabled = channel.type === "voice" || channel.type === "stage" || !canPost || remainingSeconds > 0 || !hasPayload;
  if (remainingSeconds > 0) {
    composerMetaRefreshTimer = setTimeout(() => {
      composerMetaRefreshTimer = null;
      renderComposerMeta();
    }, 400);
  }
}

function renderReplyComposer() {
  if (!replyTarget) {
    ui.composerReplyBar.classList.add("composer-reply--hidden");
    ui.replyPreviewText.textContent = "";
    return;
  }
  const previewText = replyTarget.text.trim().slice(0, 100);
  const threadHint = replyTarget.threadId ? " in thread" : "";
  ui.replyPreviewText.textContent = `Replying to ${replyTarget.authorName}${threadHint}: ${previewText || "(empty message)"}`;
  ui.composerReplyBar.classList.remove("composer-reply--hidden");
}

function renderRoleChips(container, accountId) {
  const server = getActiveServer();
  container.innerHTML = "";
  if (!server || !accountId) return;
  const roles = getMemberRoles(server, accountId).filter((role) => role.name !== "@everyone");
  roles.forEach((role) => {
    const chip = document.createElement("span");
    chip.className = "role-chip";
    chip.textContent = role.name;
    chip.style.borderColor = role.color || "#4b4f59";
    chip.style.color = role.color || "#e3e6eb";
    container.appendChild(chip);
  });
}

function collectAccountActivityStats(accountId) {
  const stats = {
    sentMessages: 0,
    reactionsGiven: 0,
    pollsCreated: 0
  };
  if (!accountId) return stats;
  state.guilds.forEach((guild) => {
    (guild.channels || []).forEach((channel) => {
      (channel.messages || []).forEach((message) => {
        if (message.userId === accountId) {
          stats.sentMessages += 1;
          if (message.poll) stats.pollsCreated += 1;
        }
        normalizeReactions(message.reactions).forEach((reaction) => {
          if (reaction.userIds.includes(accountId)) stats.reactionsGiven += 1;
        });
      });
    });
  });
  state.dmThreads.forEach((thread) => {
    (thread.messages || []).forEach((message) => {
      if (message.userId === accountId) {
        stats.sentMessages += 1;
        if (message.poll) stats.pollsCreated += 1;
      }
      normalizeReactions(message.reactions).forEach((reaction) => {
        if (reaction.userIds.includes(accountId)) stats.reactionsGiven += 1;
      });
    });
  });
  return stats;
}

function resolveQuestBadgesForAccount(accountId) {
  const stats = collectAccountActivityStats(accountId);
  const badges = [];
  if (stats.sentMessages >= 1) badges.push("First Message");
  if (stats.sentMessages >= 25) badges.push("Regular");
  if (stats.sentMessages >= 100) badges.push("Power Chatter");
  if (stats.reactionsGiven >= 10) badges.push("Reactor");
  if (stats.pollsCreated >= 1) badges.push("Poll Starter");
  return badges.slice(0, 4);
}

function questMilestoneProgress(accountId) {
  const stats = collectAccountActivityStats(accountId);
  const nextMessageGoal = [1, 25, 100, 250].find((value) => stats.sentMessages < value) || null;
  const nextReactionGoal = [10, 50, 200].find((value) => stats.reactionsGiven < value) || null;
  const nextPollGoal = [1, 5, 20].find((value) => stats.pollsCreated < value) || null;
  return {
    stats,
    badges: resolveQuestBadgesForAccount(accountId),
    nextGoals: {
      messages: nextMessageGoal,
      reactions: nextReactionGoal,
      polls: nextPollGoal
    }
  };
}

function formatQuestSummaryText(accountId) {
  const progress = questMilestoneProgress(accountId);
  const { stats, badges, nextGoals } = progress;
  const nextParts = [];
  if (nextGoals.messages) nextParts.push(`next messages: ${stats.sentMessages}/${nextGoals.messages}`);
  if (nextGoals.reactions) nextParts.push(`next reactions: ${stats.reactionsGiven}/${nextGoals.reactions}`);
  if (nextGoals.polls) nextParts.push(`next polls: ${stats.pollsCreated}/${nextGoals.polls}`);
  return [
    `Badges: ${badges.length > 0 ? badges.join(", ") : "none yet"}`,
    `Messages: ${stats.sentMessages}`,
    `Reactions: ${stats.reactionsGiven}`,
    `Polls: ${stats.pollsCreated}`,
    nextParts.length > 0 ? `Progress: ${nextParts.join(" · ")}` : "Progress: all tracked milestones reached"
  ].join(" · ");
}

function formatIdentitySummaryText(account, guildId = null) {
  if (!account) return "Unknown identity.";
  const name = displayNameForAccount(account, guildId);
  const status = displayStatus(account, guildId);
  const tag = accountGuildTag(account) || "(none)";
  const decor = accountDecorationEmoji(account) || "(none)";
  const effect = accountProfileEffect(account);
  const hasNameplate = accountNameplateSvg(account) ? "yes" : "no";
  return `Name: ${name} · Status: ${status} · Tag: ${tag} · Decor: ${decor} · Effect: ${effect} · Nameplate: ${hasNameplate}`;
}

function resolveShardWallet(accountId) {
  const stats = collectAccountActivityStats(accountId);
  const badges = resolveQuestBadgesForAccount(accountId).length;
  const earned = SHARD_ECONOMY.starter
    + Math.floor(stats.sentMessages / SHARD_ECONOMY.messageEvery)
    + Math.floor(stats.reactionsGiven / SHARD_ECONOMY.reactionEvery)
    + (stats.pollsCreated * SHARD_ECONOMY.pollWorth)
    + (badges * SHARD_ECONOMY.badgeWorth);
  const account = getAccountById(accountId);
  ensureAccountCosmetics(account);
  const spent = (account?.cosmeticPurchases || []).reduce((acc, entry) => acc + Math.max(0, Number(entry.cost || 0)), 0);
  return {
    earned,
    spent,
    balance: Math.max(0, earned - spent),
    stats
  };
}

function accountOwnsCosmetic(account, cosmetic) {
  if (!account || !cosmetic) return false;
  ensureAccountCosmetics(account);
  return account.ownedCosmetics[cosmetic.type]?.includes(cosmetic.id) || false;
}

function isCosmeticEquipped(account, cosmetic) {
  if (!account || !cosmetic) return false;
  if (cosmetic.type === "decor") return accountDecorationEmoji(account) === cosmetic.value;
  if (cosmetic.type === "nameplate") return accountNameplateSvg(account) === cosmetic.value;
  if (cosmetic.type === "effect") return accountProfileEffect(account) === cosmetic.value;
  return false;
}

function equipCosmetic(account, cosmetic) {
  if (!account || !cosmetic || !accountOwnsCosmetic(account, cosmetic)) return false;
  if (cosmetic.type === "decor") account.avatarDecoration = cosmetic.value;
  if (cosmetic.type === "nameplate") account.profileNameplateSvg = cosmetic.value;
  if (cosmetic.type === "effect") account.profileEffect = normalizeProfileEffect(cosmetic.value);
  return true;
}

function buyCosmetic(account, cosmetic) {
  if (!account || !cosmetic || cosmetic.cost <= 0) return { ok: false, reason: "Invalid cosmetic." };
  ensureAccountCosmetics(account);
  if (accountOwnsCosmetic(account, cosmetic)) return { ok: false, reason: "You already own this cosmetic." };
  const wallet = resolveShardWallet(account.id);
  if (wallet.balance < cosmetic.cost) return { ok: false, reason: "Not enough shards yet." };
  account.ownedCosmetics[cosmetic.type].push(cosmetic.id);
  account.cosmeticPurchases.push({
    id: cosmetic.id,
    cost: cosmetic.cost,
    ts: new Date().toISOString()
  });
  account.cosmeticPurchases = normalizeCosmeticPurchases(account.cosmeticPurchases);
  equipCosmetic(account, cosmetic);
  return { ok: true };
}

function formatCosmeticInventorySummary(accountId) {
  const account = getAccountById(accountId);
  if (!account) return "No active account.";
  ensureAccountCosmetics(account);
  const wallet = resolveShardWallet(accountId);
  const listFor = (type) => {
    const owned = account.ownedCosmetics[type]
      .map((id) => cosmeticById(id))
      .filter(Boolean)
      .map((item) => item.name);
    return owned.length > 0 ? owned.join(", ") : "none";
  };
  return `Shards: ${wallet.balance} (earned ${wallet.earned}, spent ${wallet.spent}) · Decorations: ${listFor("decor")} · Nameplates: ${listFor("nameplate")} · Effects: ${listFor("effect")}`;
}

function normalizeCosmeticsTab(rawTab) {
  const token = (rawTab || "").toString().trim().toLowerCase();
  if (token === "decor" || token === "decoration" || token === "decorations") return "decor";
  if (token === "nameplate" || token === "nameplates") return "nameplate";
  if (token === "effect" || token === "effects" || token === "profilefx") return "effect";
  return "decor";
}

function renderCosmeticsDialog() {
  const account = getCurrentAccount();
  if (!account || !ui.cosmeticsDialog?.open) return;
  ensureAccountCosmetics(account);
  const wallet = resolveShardWallet(account.id);
  if (ui.cosmeticsBalance) ui.cosmeticsBalance.textContent = `${wallet.balance} shards`;
  if (ui.cosmeticsProgress) {
    ui.cosmeticsProgress.textContent = `Earned ${wallet.earned} · Spent ${wallet.spent} · Messages ${wallet.stats.sentMessages} · Reactions ${wallet.stats.reactionsGiven} · Polls ${wallet.stats.pollsCreated}`;
  }
  ui.cosmeticsTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.cosmeticsTab === cosmeticsTab);
  });
  if (!ui.cosmeticsGrid) return;
  ui.cosmeticsGrid.innerHTML = "";
  const items = COSMETIC_CATALOG.filter((item) => item.type === cosmeticsTab);
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "cosmetic-card";
    const owned = accountOwnsCosmetic(account, item);
    const equipped = isCosmeticEquipped(account, item);
    const canAfford = wallet.balance >= item.cost;

    const preview = document.createElement("div");
    preview.className = "cosmetic-card__preview";
    if (item.type === "decor") {
      preview.classList.add("cosmetic-card__preview--decor");
      preview.textContent = item.value;
    } else if (item.type === "nameplate") {
      preview.classList.add("cosmetic-card__preview--nameplate");
      preview.style.backgroundImage = `url(${item.value})`;
    } else {
      preview.classList.add("cosmetic-card__preview--effect");
      if (item.value === "flame") preview.classList.add("cosmetic-card__preview--effect-flame");
      if (item.value === "ocean") preview.classList.add("cosmetic-card__preview--effect-ocean");
    }
    card.appendChild(preview);

    const meta = document.createElement("div");
    meta.className = "cosmetic-card__meta";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const info = document.createElement("small");
    info.textContent = `${item.cost} shards · ${item.note}`;
    meta.appendChild(name);
    meta.appendChild(info);
    card.appendChild(meta);

    const action = document.createElement("button");
    action.type = "button";
    action.className = "cosmetic-card__action";
    if (equipped) {
      action.textContent = "Equipped";
      action.disabled = true;
      action.classList.add("is-owned");
    } else if (owned) {
      action.textContent = "Equip";
      action.classList.add("is-owned");
      action.addEventListener("click", () => {
        if (!equipCosmetic(account, item)) return;
        saveState();
        render();
        renderCosmeticsDialog();
      });
    } else {
      action.textContent = canAfford ? "Buy" : "Locked";
      action.disabled = !canAfford;
      action.addEventListener("click", () => {
        const result = buyCosmetic(account, item);
        if (!result.ok) {
          showToast(result.reason, { tone: "error" });
          return;
        }
        saveState();
        render();
        renderCosmeticsDialog();
        showToast(`Purchased ${item.name}.`);
      });
    }
    card.appendChild(action);
    ui.cosmeticsGrid.appendChild(card);
  });
}

function openCosmeticsDialog(tab = "decor") {
  if (!ui.cosmeticsDialog) return;
  cosmeticsTab = normalizeCosmeticsTab(tab);
  if (!ui.cosmeticsDialog.open) ui.cosmeticsDialog.showModal();
  renderCosmeticsDialog();
}

function renderQuestBadges(container, accountId) {
  if (!(container instanceof HTMLElement) || !accountId) return;
  const badges = resolveQuestBadgesForAccount(accountId);
  if (badges.length === 0) return;
  const wrap = document.createElement("div");
  wrap.className = "quest-badges";
  badges.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "quest-badge";
    chip.textContent = label;
    wrap.appendChild(chip);
  });
  container.appendChild(wrap);
}

function applyPreferencesToUI() {
  const prefs = getPreferences();
  document.body.style.setProperty("--ui-scale", `${prefs.uiScale}%`);
  document.body.dataset.theme = prefs.theme;
  document.body.dataset.compactMembers = prefs.compactMembers;
  document.body.dataset.developerMode = prefs.developerMode;
  document.body.dataset.debugOverlay = prefs.debugOverlay;
  document.body.dataset.hideChannelPanel = prefs.hideChannelPanel;
  document.body.dataset.hideMemberPanel = prefs.hideMemberPanel;
  document.body.dataset.collapseDmSection = prefs.collapseDmSection;
  document.body.dataset.collapseGuildSection = prefs.collapseGuildSection;
  ui.dockMuteBtn.style.opacity = prefs.mute === "on" ? "1" : "0.7";
  ui.dockHeadphonesBtn.style.opacity = prefs.deafen === "on" ? "1" : "0.7";
  if (ui.toggleChannelPanelBtn) {
    const hidden = prefs.hideChannelPanel === "on";
    ui.toggleChannelPanelBtn.classList.toggle("chat-topic-edit--active", !hidden);
    ui.toggleChannelPanelBtn.textContent = hidden ? "Channels Off" : "Channels";
  }
  if (ui.toggleMemberPanelBtn) {
    const hidden = prefs.hideMemberPanel === "on";
    ui.toggleMemberPanelBtn.classList.toggle("chat-topic-edit--active", !hidden);
    ui.toggleMemberPanelBtn.textContent = hidden ? "Members Off" : "Members";
  }
  if (ui.toggleDmSectionBtn) {
    const collapsed = prefs.collapseDmSection === "on";
    ui.toggleDmSectionBtn.title = collapsed ? "Expand Direct Messages" : "Collapse Direct Messages";
    ui.toggleDmSectionBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
  if (ui.toggleGuildSectionBtn) {
    const collapsed = prefs.collapseGuildSection === "on";
    ui.toggleGuildSectionBtn.title = collapsed ? "Expand Channels" : "Collapse Channels";
    ui.toggleGuildSectionBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
  if (ui.toggleDmSectionChevron) ui.toggleDmSectionChevron.textContent = prefs.collapseDmSection === "on" ? "▸" : "▾";
  if (ui.toggleGuildSectionChevron) ui.toggleGuildSectionChevron.textContent = prefs.collapseGuildSection === "on" ? "▸" : "▾";
  if (ui.toggleSwfAudioBtn) {
    const mode = prefs.swfQuickAudioMode;
    const icon = mode === "on" ? "🔊" : mode === "click" ? "🔉" : "🔇";
    const title = mode === "on"
      ? "SWF audio auto on. Click: switch to click-to-hear. Right-click: force mute."
      : mode === "click"
        ? "SWF click-to-hear mode. Click a SWF to hear it. Click: switch to auto on. Right-click: force mute."
        : "SWF forced mute. Click: switch to click-to-hear.";
    ui.toggleSwfAudioBtn.textContent = icon;
    ui.toggleSwfAudioBtn.title = title;
    ui.toggleSwfAudioBtn.setAttribute("aria-label", title);
    ui.toggleSwfAudioBtn.classList.toggle("message-form__media-btn--active", mode === "on");
    ui.toggleSwfAudioBtn.classList.toggle("message-form__media-btn--force-muted", mode === "off");
  }
  swfRuntimes.forEach((runtime) => {
    runtime.audioEnabled = prefs.swfQuickAudioMode !== "off";
    if (prefs.swfQuickAudioMode === "on") runtime.audioClickAllowed = true;
  });
  applySwfAudioToAllRuntimes();
  resizeComposerInput();
}

function toggleChannelPanelVisibility() {
  state.preferences = getPreferences();
  state.preferences.hideChannelPanel = state.preferences.hideChannelPanel === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
}

function toggleMemberPanelVisibility() {
  state.preferences = getPreferences();
  state.preferences.hideMemberPanel = state.preferences.hideMemberPanel === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
}

function toggleDmSectionCollapsed() {
  state.preferences = getPreferences();
  state.preferences.collapseDmSection = state.preferences.collapseDmSection === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
  renderChannels();
}

function toggleGuildSectionCollapsed() {
  state.preferences = getPreferences();
  state.preferences.collapseGuildSection = state.preferences.collapseGuildSection === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
  renderChannels();
}

function setSwfQuickAudioMode(mode) {
  state.preferences = getPreferences();
  state.preferences.swfQuickAudioMode = normalizeSwfQuickAudioMode(mode);
  state.preferences.swfAudio = state.preferences.swfQuickAudioMode === "off" ? "off" : "on";
  if (state.preferences.swfQuickAudioMode === "on") {
    swfRuntimes.forEach((runtime) => {
      runtime.audioClickAllowed = true;
      runtime.audioEnabled = true;
    });
  } else if (state.preferences.swfQuickAudioMode === "click") {
    swfRuntimes.forEach((runtime) => {
      runtime.audioEnabled = true;
    });
  } else {
    swfRuntimes.forEach((runtime) => {
      runtime.audioEnabled = false;
    });
  }
  saveState();
  applyPreferencesToUI();
}

function refreshSwfAudioFocus(preferredKey = null) {
  const prefs = getPreferences();
  const mode = prefs.swfQuickAudioMode;
  if (mode === "off") {
    swfAudioFocusRuntimeKey = null;
    swfRuntimes.forEach((runtime, key) => {
      runtime.audioSuppressed = true;
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  const canUse = (key, runtime) => {
    if (!key || !runtime?.playing || !runtime.audioEnabled || runtime.audioPinned) return false;
    if (mode === "click" && !runtime.audioClickAllowed) return false;
    return true;
  };
  if (swfSoloRuntimeKey) {
    const soloRuntime = swfRuntimes.get(swfSoloRuntimeKey);
    const allowSolo = canUse(swfSoloRuntimeKey, soloRuntime);
    swfAudioFocusRuntimeKey = allowSolo ? swfSoloRuntimeKey : null;
    swfRuntimes.forEach((runtime, key) => {
      runtime.audioSuppressed = Boolean(
        !runtime.audioPinned
        && allowSolo
        && key !== swfSoloRuntimeKey
        && runtime.playing
        && runtime.audioEnabled
      );
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  if (prefs.swfAudioPolicy === "multi") {
    swfAudioFocusRuntimeKey = null;
    swfRuntimes.forEach((runtime, key) => {
      runtime.audioSuppressed = mode === "click" ? !runtime.audioClickAllowed : false;
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  if (prefs.swfAudioScope === "guild") {
    const focusByGuild = new Map();
    swfRuntimes.forEach((runtime) => {
      const guildKey = runtime?.guildId || "__ungrouped__";
      if (focusByGuild.has(guildKey)) return;
      const centered = pickCenteredRuntimeKey(canUse, {
        guildId: guildKey,
        preferredKey: preferredKey
      });
      if (centered) focusByGuild.set(guildKey, centered);
    });
    swfAudioFocusRuntimeKey = null;
    swfRuntimes.forEach((runtime, key) => {
      const guildKey = runtime.guildId || "__ungrouped__";
      runtime.audioSuppressed = Boolean(
        !runtime.audioPinned
        && runtime.playing
        && runtime.audioEnabled
        && (mode !== "click" || runtime.audioClickAllowed)
        && focusByGuild.get(guildKey)
        && focusByGuild.get(guildKey) !== key
      );
      if (mode === "click" && !runtime.audioClickAllowed) runtime.audioSuppressed = true;
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  const centeredGlobal = pickCenteredRuntimeKey(canUse, { preferredKey });
  swfAudioFocusRuntimeKey = centeredGlobal;
  swfRuntimes.forEach((runtime, key) => {
    runtime.audioSuppressed = Boolean(
      !runtime.audioPinned
      && swfAudioFocusRuntimeKey
      && key !== swfAudioFocusRuntimeKey
      && runtime.playing
      && runtime.audioEnabled
    );
    if (mode === "click" && !runtime.audioClickAllowed) runtime.audioSuppressed = true;
    applySwfAudioToRuntime(key);
    updateSwfAudioUi(key);
  });
}

function displayNameForMessage(message) {
  if (message.userId) {
    const account = getAccountById(message.userId);
    if (account) {
      const conversation = getActiveConversation();
      const guildId = conversation?.type === "channel" ? getActiveGuild()?.id || null : null;
      return displayNameForAccount(account, guildId);
    }
  }
  return message.authorName || "Unknown";
}

function initialsForName(name) {
  const cleaned = (name || "").replace(/[^a-z0-9 ]/gi, " ").trim();
  if (!cleaned) return "?";
  const chunks = cleaned.split(/\s+/).filter(Boolean).slice(0, 2);
  return chunks.map((part) => part[0]?.toUpperCase() || "").join("") || cleaned.slice(0, 1).toUpperCase();
}

function shouldGroupMessageWithPrevious(currentMessage, previousMessage) {
  if (!currentMessage || !previousMessage) return false;
  if (!currentMessage.userId || !previousMessage.userId) return false;
  if (currentMessage.userId !== previousMessage.userId) return false;
  if (currentMessage.replyTo || previousMessage.replyTo) return false;
  if (currentMessage.poll || previousMessage.poll) return false;
  const currentTs = toTimestampMs(currentMessage.ts);
  const previousTs = toTimestampMs(previousMessage.ts);
  if (!currentTs || !previousTs) return false;
  return (currentTs - previousTs) <= (6 * 60 * 1000);
}

function appendMentionOrEmoji(target, token, context) {
  const mentionMatch = token.match(/^@([a-z0-9._-]+)$/i);
  if (mentionMatch) {
    const username = mentionMatch[1].toLowerCase();
    const account = getAccountByUsername(username);
    if (!account) {
      target.appendChild(document.createTextNode(token));
      return;
    }
    const mention = document.createElement("span");
    mention.className = `mention ${context.current && context.current.id === account.id ? "mention--self" : ""}`;
    mention.textContent = `@${account.username}`;
    mention.addEventListener("click", () => openUserPopout(account));
    target.appendChild(mention);
    return;
  }
  const emojiMatch = token.match(/^:([a-z0-9_-]{1,32}):$/i);
  if (emojiMatch) {
    const emojiUrl = context.customEmojiMap.get(emojiMatch[1].toLowerCase());
    if (!emojiUrl) {
      target.appendChild(document.createTextNode(token));
      return;
    }
    const emojiImage = document.createElement("img");
    emojiImage.className = "inline-custom-emoji";
    emojiImage.src = emojiUrl;
    emojiImage.alt = token;
    emojiImage.loading = "lazy";
    target.appendChild(emojiImage);
    return;
  }
  target.appendChild(document.createTextNode(token));
}

function appendInlineRichText(target, text, context) {
  const tokenPattern = /(\|\|[^|\n]+\|\||\*\*[^*\n]+\*\*|\*[^*\n]+\*|~~[^~\n]+~~|`[^`\n]+`|\[[^\]]{1,80}\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s]+|@[a-z0-9._-]+|:[a-z0-9_-]{1,32}:)/gi;
  let lastIndex = 0;
  let match = tokenPattern.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      target.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const token = match[0];
    if (token.startsWith("||") && token.endsWith("||")) {
      const spoiler = document.createElement("span");
      spoiler.className = "message-spoiler";
      spoiler.textContent = token.slice(2, -2);
      spoiler.title = "Click to reveal spoiler";
      spoiler.addEventListener("click", () => {
        spoiler.classList.toggle("is-revealed");
      });
      target.appendChild(spoiler);
    } else if (token.startsWith("**") && token.endsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = token.slice(2, -2);
      target.appendChild(strong);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      const em = document.createElement("em");
      em.textContent = token.slice(1, -1);
      target.appendChild(em);
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      const strike = document.createElement("s");
      strike.textContent = token.slice(2, -2);
      target.appendChild(strike);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      const code = document.createElement("code");
      code.textContent = token.slice(1, -1);
      target.appendChild(code);
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const parts = token.match(/^\[([^\]]{1,80})\]\((https?:\/\/[^\s)]+)\)$/i);
      if (parts) {
        const link = document.createElement("a");
        link.href = parts[2];
        link.textContent = parts[1];
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        target.appendChild(link);
      } else {
        target.appendChild(document.createTextNode(token));
      }
    } else if (isLikelyUrl(token)) {
      const link = document.createElement("a");
      link.href = token;
      link.textContent = token;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      target.appendChild(link);
    } else {
      appendMentionOrEmoji(target, token, context);
    }
    lastIndex = tokenPattern.lastIndex;
    match = tokenPattern.exec(text);
  }
  if (lastIndex < text.length) {
    target.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function renderMessageText(container, rawText) {
  const current = getCurrentAccount();
  const guild = getActiveGuild();
  ensureGuildMediaCollections(guild);
  const context = {
    current,
    customEmojiMap: new Map((guild?.customEmojis || []).map((emoji) => [emoji.name, emoji.url]))
  };
  const lines = (rawText || "").split("\n");
  lines.forEach((line, index) => {
    if (line.startsWith("> ")) {
      const quote = document.createElement("span");
      quote.className = "message-quote";
      appendInlineRichText(quote, line.slice(2), context);
      container.appendChild(quote);
    } else {
      appendInlineRichText(container, line, context);
    }
    if (index < lines.length - 1) container.appendChild(document.createElement("br"));
  });
}

function extractImageUrl(text) {
  if (!text) return null;
  const matches = text.match(/https?:\/\/\S+/gi);
  if (!matches) return null;
  const imageUrl = matches.find((url) => /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url));
  return imageUrl || null;
}

function inferAttachmentTypeFromUrl(url) {
  const clean = (url || "").toLowerCase();
  if (clean.endsWith(".swf") || clean.includes(".swf?")) return "swf";
  if (clean.endsWith(".svg") || clean.includes(".svg?")) return "svg";
  if (clean.endsWith(".html") || clean.includes(".html?") || clean.endsWith(".htm") || clean.includes(".htm?")) return "html";
  if (clean.endsWith(".pdf") || clean.includes(".pdf?")) return "pdf";
  if (clean.endsWith(".rtf") || clean.includes(".rtf?")) return "rtf";
  if (/\.(odt|ods|odp|doc|docx|xls|xlsx|ppt|pptx)(\?|$)/i.test(clean)) return "odf";
  if (/\.(mp3|ogg|wav|m4a|flac)(\?|$)/i.test(clean)) return "audio";
  if (/\.(txt|md|log|json|js|ts|css|html|xml|yml|yaml|ini|toml)(\?|$)/i.test(clean)) return "text";
  if (clean.endsWith(".bin") || clean.includes(".bin?")) return "bin";
  if (clean.endsWith(".apng") || clean.includes(".apng?")) return "sticker";
  if (clean.endsWith(".lottie") || clean.includes(".lottie?")) return "sticker";
  if (/\.(gif|webp|mp4|webm)(\?|$)/i.test(clean)) return "gif";
  return null;
}

function inferAttachmentFormat(type, url) {
  if (type !== "sticker") return "image";
  return stickerFormatFromName("", url);
}

function extractInlineAttachmentsFromText(text) {
  if (!text) return [];
  const results = [];
  const matches = text.match(/(?:https?:\/\/\S+|(?:\.?\/)?[a-z0-9._%+-]+\.(?:swf|svg|html?|pdf|rtf|odt|ods|odp|docx?|xlsx?|pptx?|apng|lottie|gif|webp|mp4|webm|mp3|ogg|wav|m4a|flac|txt|md|log|json|js|ts|css|xml|yml|yaml|ini|toml|bin))/gi) || [];
  const seen = new Set();
  matches.forEach((raw) => {
    const cleaned = raw.replace(/[),.!?]+$/, "");
    if (seen.has(cleaned)) return;
    const type = inferAttachmentTypeFromUrl(cleaned);
    if (!type) return;
    seen.add(cleaned);
    results.push({
      type,
      url: cleaned,
      name: cleaned.split("/").pop() || cleaned,
      format: inferAttachmentFormat(type, cleaned)
    });
  });
  return results.slice(0, 4);
}

async function loadTextAttachmentPreview(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const clipped = lines.slice(0, 40).join("\n").slice(0, 3500);
  const truncated = lines.length > 40 || text.length > clipped.length;
  return `${clipped}${truncated ? "\n… (truncated)" : ""}`;
}

async function loadBinaryPreview(url, limit = 512) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, Math.min(limit, buffer.byteLength)));
  const lines = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const hex = [...chunk].map((b) => b.toString(16).padStart(2, "0")).join(" ");
    const ascii = [...chunk].map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ".")).join("");
    lines.push(`${i.toString(16).padStart(4, "0")}  ${hex.padEnd(47, " ")}  ${ascii}`);
  }
  const suffix = buffer.byteLength > bytes.length ? `\n… (${buffer.byteLength - bytes.length} bytes more)` : "";
  return lines.join("\n") + suffix;
}

function rtfToPlainText(rtf) {
  if (!rtf) return "";
  return rtf
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\tab/g, "\t")
    .replace(/\\'[0-9a-f]{2}/gi, " ")
    .replace(/\\[a-z]+-?\d* ?/gi, "")
    .replace(/[{}]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadSwfLibrary() {
  try {
    const response = await fetch("swf-index.json", { cache: "no-cache" });
    if (!response.ok) return;
    const parsed = await response.json();
    if (!Array.isArray(parsed)) return;
    swfLibrary = parsed
      .filter((entry) => entry && typeof entry.url === "string" && typeof entry.name === "string")
      .map((entry) => ({ name: entry.name, url: entry.url }))
      .slice(0, 600);
    if (mediaPickerOpen && mediaPickerTab === "swf") {
      renderMediaPicker();
    }
  } catch {
    // SWF picker still works with fallback list only.
  }
}

function mediaEntriesForActiveTab() {
  const guild = getActiveGuild();
  ensureGuildMediaCollections(guild);
  if (mediaPickerTab === "emoji") {
    const prefs = getPreferences();
    const recents = normalizeRecentEmojis(prefs.recentEmojis);
    const builtIn = EMOJI_LIBRARY
      .map((entry) => {
        const recentIndex = recents.indexOf(entry.value);
        return { ...entry, source: "builtin", recentIndex };
      })
      .sort((a, b) => {
        const aRecent = a.recentIndex >= 0;
        const bRecent = b.recentIndex >= 0;
        if (aRecent && bRecent) return a.recentIndex - b.recentIndex;
        if (aRecent) return -1;
        if (bRecent) return 1;
        return a.name.localeCompare(b.name);
      });
    const custom = (guild?.customEmojis || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...builtIn];
  }
  if (mediaPickerTab === "gif") {
    const custom = (guild?.customGifs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...GIF_LIBRARY];
  }
  if (mediaPickerTab === "sticker") {
    const custom = (guild?.customStickers || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...STICKER_LIBRARY];
  }
  if (mediaPickerTab === "svg") {
    const custom = (guild?.customSvgs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...SVG_LIBRARY];
  }
  if (mediaPickerTab === "pdf") {
    const custom = (guild?.customPdfs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  if (mediaPickerTab === "text") {
    const custom = (guild?.customTexts || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  if (mediaPickerTab === "docs") {
    const custom = (guild?.customDocs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  if (mediaPickerTab === "swf") {
    const custom = (guild?.customSwfs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...swfLibrary];
  }
  if (mediaPickerTab === "html") {
    const custom = (guild?.customHtmls || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  return [];
}

function filteredMediaEntries() {
  const term = mediaPickerQuery.trim().toLowerCase();
  const normalizedTerm = term.replace(/^:+|:+$/g, "");
  if (!term) return mediaEntriesForActiveTab();
  return mediaEntriesForActiveTab().filter((entry) => {
    const name = (entry.name || "").toLowerCase();
    if (name.includes(term) || name.includes(normalizedTerm)) return true;
    if (mediaPickerTab === "emoji") {
      const aliases = Array.isArray(entry.aliases) ? entry.aliases.join(" ").toLowerCase() : "";
      const keywords = Array.isArray(entry.keywords) ? entry.keywords.join(" ").toLowerCase() : "";
      const value = (entry.value || "").toString();
      if (aliases.includes(term) || aliases.includes(normalizedTerm)) return true;
      if (keywords.includes(term) || keywords.includes(normalizedTerm)) return true;
      if (value.includes(term) || value.includes(normalizedTerm)) return true;
    }
    return false;
  });
}

function rememberMediaPickerTab(tab) {
  if (!MEDIA_TABS.includes(tab)) return;
  state.preferences = getPreferences();
  state.preferences.mediaLastTab = tab;
}

function renderComposerMediaButtons() {
  ui.openMediaPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen);
  ui.openGifPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen && mediaPickerTab === "gif");
  ui.openStickerPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen && mediaPickerTab === "sticker");
  ui.openEmojiPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen && mediaPickerTab === "emoji");
}

function closeMediaPicker() {
  mediaPickerOpen = false;
  ui.mediaPicker.classList.add("media-picker--hidden");
  renderComposerMediaButtons();
}

function openMediaPicker() {
  mediaPickerOpen = true;
  ui.mediaPicker.classList.remove("media-picker--hidden");
  rememberMediaPickerTab(mediaPickerTab);
  renderMediaPicker();
  renderComposerMediaButtons();
  ui.mediaSearchInput.focus();
}

function openMediaPickerWithTab(tab, { resetQuery = false } = {}) {
  if (MEDIA_TABS.includes(tab)) {
    mediaPickerTab = tab;
    rememberMediaPickerTab(tab);
  }
  if (resetQuery) mediaPickerQuery = "";
  openMediaPicker();
}

function toggleMediaPicker() {
  if (mediaPickerOpen) {
    closeMediaPicker();
  } else {
    openMediaPicker();
  }
}

function warmMediaPickerRuntimes() {
  if (mediaRuntimeWarmed) return;
  mediaRuntimeWarmed = true;
  void deployMediaRuntimes();
}

function mediaPlaceholderForTab(tab) {
  if (tab === "gif") return "Search GIFs";
  if (tab === "sticker") return "Search stickers";
  if (tab === "emoji") return "Search emojis";
  if (tab === "swf") return "Search SWFs";
  if (tab === "svg") return "Search SVGs";
  if (tab === "pdf") return "Search PDFs";
  if (tab === "text") return "Search text files";
  if (tab === "docs") return "Search documents";
  if (tab === "html") return "Search HTML embeds";
  return "Search media";
}

function insertTextAtCursor(text) {
  const input = ui.messageInput;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = `${input.value.slice(0, start)}${text}${input.value.slice(end)}`;
  const cursor = start + text.length;
  input.setSelectionRange(cursor, cursor);
  input.focus();
}

function findEmojiEntryByValue(value) {
  return EMOJI_LIBRARY.find((entry) => entry.value === value) || null;
}

function rememberRecentEmoji(value) {
  const emoji = (value || "").toString().trim();
  if (!emoji) return;
  state.preferences = getPreferences();
  const current = normalizeRecentEmojis(state.preferences.recentEmojis);
  state.preferences.recentEmojis = [emoji, ...current.filter((item) => item !== emoji)].slice(0, 24);
}

function stickerFormatFromName(name, url) {
  const value = `${name || ""} ${url || ""}`.toLowerCase();
  if (value.includes(".lottie")) return "dotlottie";
  if (value.includes(".apng")) return "apng";
  return "image";
}

function sendMediaAttachment(entry, type) {
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  if (!conversation || !account || !entry || !entry.url) return;
  const text = ui.messageInput.value.trim().slice(0, 400);
  const nextReply = replyTarget && replyTarget.channelId === conversation.id
    ? { messageId: replyTarget.messageId, authorName: replyTarget.authorName, text: replyTarget.text }
    : null;
  const nextMessage = {
    id: createId(),
    userId: account.id,
    authorName: "",
    text,
    ts: new Date().toISOString(),
    reactions: [],
    attachments: [{
      type,
      url: entry.url,
      name: entry.name || type,
      format: entry.format || (type === "sticker" ? stickerFormatFromName(entry.name, entry.url) : "image")
    }],
    replyTo: nextReply
  };
  const messageBucket = conversation.type === "dm" ? conversation.thread.messages : conversation.channel.messages;
  messageBucket.push(nextMessage);
  if (type === "swf") {
    addDebugLog("info", "Sent SWF attachment message", { url: entry.url, name: entry.name || "" });
  }
  replyTarget = null;
  ui.messageInput.value = "";
  saveState();
  closeMediaPicker();
  if (swfPipTabs.length > 0) {
    appendMessageRowLite(conversation.type === "dm" ? conversation.thread : conversation.channel, nextMessage);
    renderChannels();
    renderMemberList();
  } else {
    render();
  }
}

function addMediaFromUrlFlow() {
  const tab = mediaPickerTab;
  const nameLabel = tab === "emoji" ? "emoji short name" : `${tab} name`;
  const typedName = prompt(`Add ${nameLabel}`, "");
  if (typedName === null) return;
  const typedUrl = prompt(`Add ${tab.toUpperCase()} URL`, "https://");
  if (!typedUrl) return;
  const name = sanitizeMediaName(typedName, `${tab}-${Date.now().toString().slice(-4)}`);
  const url = typedUrl.trim();
  if (!/^https?:\/\//i.test(url) && !/^data:/i.test(url)) return;
  const inferredType = inferAttachmentTypeFromUrl(url);
  const resolvedType = tab === "docs"
    ? (inferredType === "rtf" ? "rtf" : "odf")
    : tab === "text"
      ? "text"
      : tab === "pdf"
        ? "pdf"
        : inferredType;
  if (upsertGuildResource(tab, {
    name,
    url,
    format: tab === "sticker" ? stickerFormatFromName(name, url) : "image",
    type: resolvedType || tab
  })) {
    saveState();
    renderMediaPicker();
  }
}

function fileAcceptForTab(tab) {
  if (tab === "gif") return "image/gif,image/webp,video/mp4,video/webm";
  if (tab === "sticker") return "image/png,image/apng,image/gif,image/webp,image/svg+xml,.apng,.lottie";
  if (tab === "emoji") return "image/png,image/gif,image/webp,image/svg+xml";
  if (tab === "swf") return ".swf,application/x-shockwave-flash";
  if (tab === "svg") return "image/svg+xml,.svg";
  if (tab === "pdf") return ".pdf,application/pdf";
  if (tab === "text") return ".txt,.md,.log,.json,.js,.ts,.css,.xml,.yml,.yaml,.ini,.toml,text/plain,application/json,text/markdown";
  if (tab === "docs") return ".odt,.ods,.odp,.rtf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation,application/rtf,text/rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (tab === "html") return "text/html,.html,.htm";
  return "*/*";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

async function addMediaFromFileFlow(file) {
  if (!file) return;
  const tab = mediaPickerTab;
  const name = sanitizeMediaName(file.name.replace(/\.[^/.]+$/, ""), `${tab}-${Date.now().toString().slice(-4)}`);
  try {
    const url = await readFileAsDataUrl(file);
    const inferredType = inferAttachmentTypeFromFile(file);
    const inferredTab = inferredType === "odf" || inferredType === "rtf"
      ? "docs"
      : inferredType === "text"
        ? "text"
        : inferredType === "pdf"
          ? "pdf"
          : inferredType;
    const targetTab = tab === "docs" || tab === "text" || tab === "pdf" || inferredTab === tab ? tab : inferredTab;
    const format = targetTab === "sticker" ? stickerFormatFromName(file.name, url) : "image";
    if (upsertGuildResource(targetTab, { name, url, format, type: inferredType })) {
      saveState();
      if (targetTab !== mediaPickerTab) {
        mediaPickerTab = targetTab;
      }
      renderMediaPicker();
    }
  } catch {
    // Ignore failed local resource import.
  } finally {
    ui.mediaFileInput.value = "";
  }
}

function renderSwfPickerPreview(host, entry, index = 0, renderToken = mediaPickerRenderToken) {
  host.innerHTML = "";
  host.style.display = "grid";
  host.style.placeItems = "center";
  host.style.color = "#c4ccd8";
  host.style.fontSize = "0.76rem";
  host.textContent = "SWF";
  if (!window.RufflePlayer?.newest) {
    host.textContent = "Ruffle…";
    if (!swfPreviewBootstrapInFlight) {
      swfPreviewBootstrapInFlight = true;
      void deployMediaRuntimes().finally(() => {
        swfPreviewBootstrapInFlight = false;
        if (mediaPickerOpen && mediaPickerTab === "swf") renderMediaPicker();
      });
    }
    return;
  }
  try {
    const player = window.RufflePlayer.newest().createPlayer();
    player.style.pointerEvents = "none";
    if ("volume" in player) player.volume = 0;
    if ("muted" in player) player.muted = true;
    if (typeof player.set_volume === "function") player.set_volume(0);
    player.style.width = "100%";
    player.style.height = "100%";
    host.innerHTML = "";
    host.appendChild(player);
    if (!host.isConnected || renderToken !== mediaPickerRenderToken) return;
    const mediaUrl = resolveMediaUrl(entry.url);
    Promise.resolve(player.load({
      url: mediaUrl,
      autoplay: "off",
      unmuteOverlay: "hidden",
      scale: "showAll",
      forceScale: true,
      letterbox: "on",
      openUrlMode: "deny"
    })).then(() => {
      if (!host.isConnected || renderToken !== mediaPickerRenderToken) return;
      try {
        if ("volume" in player) player.volume = 0;
        if ("muted" in player) player.muted = true;
        if (typeof player.set_volume === "function") player.set_volume(0);
        if (typeof player.play === "function") player.play();
        const pulse = window.setInterval(() => {
          if (!host.isConnected || renderToken !== mediaPickerRenderToken) {
            clearInterval(pulse);
            return;
          }
          if ("volume" in player) player.volume = 0;
          if ("muted" in player) player.muted = true;
          if (typeof player.set_volume === "function") player.set_volume(0);
          if (typeof player.play === "function") player.play();
        }, 650);
      } catch {
        // Ignore preview sampling failures.
      }
    }).catch((error) => {
      addDebugLog("warn", "SWF picker preview failed", { name: entry?.name || "", url: mediaUrl, error: String(error) });
      host.innerHTML = "";
      host.textContent = "SWF";
    });
  } catch {
    host.innerHTML = "";
    host.textContent = "SWF";
  }
}

function renderMediaPicker() {
  const renderToken = ++mediaPickerRenderToken;
  renderComposerMediaButtons();
  ui.mediaTabs.forEach((tabBtn) => {
    tabBtn.classList.toggle("active", tabBtn.dataset.mediaTab === mediaPickerTab);
  });
  ui.mediaSearchInput.placeholder = mediaPlaceholderForTab(mediaPickerTab);
  if (ui.mediaSearchInput.value !== mediaPickerQuery) {
    ui.mediaSearchInput.value = mediaPickerQuery;
  }
  ui.mediaGrid.innerHTML = "";
  const entries = filteredMediaEntries();
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "media-card--empty";
    empty.textContent = mediaPickerTab === "swf"
      ? "No SWFs found. Run a local server and keep swf-index.json available."
      : "No media found for this query.";
    ui.mediaGrid.appendChild(empty);
    return;
  }

  const visibleEntries = mediaPickerTab === "swf" ? entries : entries.slice(0, 140);
  visibleEntries.forEach((entry, index) => {
    const useSwfCard = mediaPickerTab === "swf";
    const card = document.createElement(useSwfCard ? "div" : "button");
    if (card instanceof HTMLButtonElement) card.type = "button";
    card.className = `media-card${useSwfCard ? " media-card--swf" : ""}`;
    if (useSwfCard) {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
    }
    if (mediaPickerTab === "emoji") {
      card.classList.add("media-card--emoji");
      if (entry.recentIndex >= 0) card.classList.add("media-card--emoji-recent");
      if (entry.value) {
        card.textContent = entry.value;
      } else if (entry.url) {
        const emojiImage = document.createElement("img");
        emojiImage.className = "media-card__preview";
        emojiImage.style.height = "80px";
        emojiImage.src = entry.url;
        emojiImage.alt = entry.name || "emoji";
        card.appendChild(emojiImage);
      }
      card.title = `:${entry.name || "emoji"}:`;
      card.addEventListener("click", () => {
        if (entry.value) {
          insertTextAtCursor(entry.value);
          rememberRecentEmoji(entry.value);
          saveState();
        } else {
          insertTextAtCursor(`:${sanitizeMediaName(entry.name || "emoji")}:`);
        }
      });
      ui.mediaGrid.appendChild(card);
      return;
    }

    const label = document.createElement("span");
    label.className = "media-card__label";
    label.textContent = entry.name || "media";
    if (entry.source === "guild-custom") {
      const kind = document.createElement("span");
      kind.className = "media-card__kind";
      kind.textContent = "guild";
      label.appendChild(kind);
    }

    if (mediaPickerTab === "swf") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      const previewMedia = document.createElement("div");
      previewMedia.className = "media-card__preview-media";
      const overlay = document.createElement("span");
      overlay.className = "media-card__overlay";
      overlay.textContent = "";
      preview.appendChild(previewMedia);
      preview.appendChild(overlay);
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, "swf"));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        sendMediaAttachment(entry, "swf");
      });
      ui.mediaGrid.appendChild(card);
      requestAnimationFrame(() => {
        if (!previewMedia.isConnected) return;
        renderSwfPickerPreview(previewMedia, entry, index, renderToken);
      });
      return;
    }

    if (mediaPickerTab === "html") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = "HTML";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, "html"));
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "pdf") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = "PDF";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, "pdf"));
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "text") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = "TXT";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, "text"));
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "docs") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = entry.type === "rtf" ? "RTF" : "DOC";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => {
        const docType = entry.type === "rtf" ? "rtf" : "odf";
        sendMediaAttachment(entry, docType);
      });
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "gif" && entry.preview === "video") {
      const video = document.createElement("video");
      video.className = "media-card__preview";
      video.src = entry.url;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      card.appendChild(video);
    } else if (mediaPickerTab === "sticker" && stickerFormatFromName(entry.name, entry.url) === "dotlottie") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.color = "#c4ccd8";
      preview.style.fontSize = "0.72rem";
      preview.textContent = ".lottie";
      card.appendChild(preview);
    } else {
      const img = document.createElement("img");
      img.className = "media-card__preview";
      img.loading = "lazy";
      img.src = entry.url;
      img.alt = entry.name || "media";
      card.appendChild(img);
    }
    card.appendChild(label);
    card.addEventListener("click", () => {
      const type = mediaPickerTab === "gif"
        ? "gif"
        : mediaPickerTab === "sticker"
          ? "sticker"
          : mediaPickerTab === "html"
            ? "html"
            : mediaPickerTab === "pdf"
              ? "pdf"
              : mediaPickerTab === "text"
                ? "text"
                : mediaPickerTab === "docs"
                  ? "odf"
              : "svg";
      sendMediaAttachment(entry, type);
    });
    ui.mediaGrid.appendChild(card);
  });
}

function saveSwfToShelf(entry) {
  if (!entry?.url) return false;
  const exists = state.savedSwfs.find((item) => item.url === entry.url);
  if (exists) return false;
  state.savedSwfs.unshift({
    name: (entry.name || "swf").toString().slice(0, 120),
    url: entry.url
  });
  state.savedSwfs = normalizeSavedSwfs(state.savedSwfs);
  saveState();
  renderSwfShelf();
  return true;
}

async function downloadAttachmentFile(attachment, fallbackExt = "bin") {
  if (!attachment?.url) return false;
  const rawName = (attachment.name || `download.${fallbackExt}`).trim();
  const fileName = rawName.includes(".") ? rawName : `${rawName}.${fallbackExt}`;
  const sourceUrl = resolveMediaUrl(attachment.url);
  try {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    try {
      const link = document.createElement("a");
      link.href = sourceUrl;
      link.download = fileName;
      link.click();
      return true;
    } catch {
      addDebugLog("warn", "Attachment download failed", { url: sourceUrl, name: fileName });
      return false;
    }
  }
}

function renderSwfShelf() {
  ui.swfShelf.classList.toggle("swf-shelf--hidden", !swfShelfOpen);
  ui.swfShelfList.innerHTML = "";
  if (!swfShelfOpen) return;
  if (!Array.isArray(state.savedSwfs) || state.savedSwfs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No saved SWFs yet.";
    ui.swfShelfList.appendChild(empty);
    return;
  }
  state.savedSwfs.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "swf-shelf-item";
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "FullScreen";
    openBtn.title = entry.name;
    openBtn.addEventListener("click", () => {
      void openSavedSwfFromShelf(entry);
    });
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "✕";
    removeBtn.title = "Remove from shelf";
    removeBtn.addEventListener("click", () => {
      state.savedSwfs = state.savedSwfs.filter((itemEntry) => itemEntry.url !== entry.url);
      saveState();
      renderSwfShelf();
    });
    item.appendChild(openBtn);
    item.appendChild(removeBtn);
    ui.swfShelfList.appendChild(item);
  });
}

function activateSwfPipTab(runtimeKey) {
  if (!runtimeKey) return;
  if (!swfPipTabs.includes(runtimeKey)) swfPipTabs.push(runtimeKey);
  swfPipActiveKey = runtimeKey;
  swfPipManuallyHidden = false;
  renderSwfPipDock();
}

function removeSwfPipTab(runtimeKey) {
  const index = swfPipTabs.indexOf(runtimeKey);
  if (index >= 0) swfPipTabs.splice(index, 1);
  if (swfPipActiveKey === runtimeKey) {
    swfPipActiveKey = swfPipTabs[swfPipTabs.length - 1] || null;
  }
  renderSwfPipDock();
}

function collectLiveSwfRuntimeKeys() {
  const keys = new Set();
  state.guilds.forEach((guild) => {
    guild.channels.forEach((channel) => {
      channel.messages.forEach((message) => {
        (message.attachments || []).forEach((attachment, index) => {
          if (attachment?.type === "swf") keys.add(`${message.id}:${index}`);
        });
      });
    });
  });
  return keys;
}

function getSwfRuntimeParkingRoot() {
  if (swfRuntimeParkingRoot?.isConnected) return swfRuntimeParkingRoot;
  const root = document.createElement("div");
  root.id = "swf-runtime-parking";
  root.style.position = "fixed";
  root.style.left = "-30000px";
  root.style.top = "-30000px";
  root.style.width = "1px";
  root.style.height = "1px";
  root.style.overflow = "hidden";
  root.style.pointerEvents = "none";
  root.style.opacity = "0";
  document.body.appendChild(root);
  swfRuntimeParkingRoot = root;
  return root;
}

function parkSwfRuntimeHost(runtime) {
  if (!(runtime?.host instanceof HTMLElement)) return;
  const root = getSwfRuntimeParkingRoot();
  if (runtime.host.parentElement === root) return;
  root.appendChild(runtime.host);
}

function attachExistingSwfRuntime(runtimeKey, hostElement) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player || !(hostElement instanceof HTMLElement)) return false;
  const liveHost = runtime.host instanceof HTMLElement ? runtime.host : null;
  if (!liveHost) return false;
  if (liveHost !== hostElement) {
    hostElement.replaceWith(liveHost);
  }
  runtime.host = liveHost;
  runtime.originHost = liveHost;
  bindSwfVisibilityObserver(runtimeKey);
  return liveHost;
}

function setSwfRuntimePip(runtimeKey, enabled) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player || !(runtime.host instanceof HTMLElement)) return false;
  if (enabled) {
    if (runtime.observer) {
      runtime.observer.disconnect();
      runtime.observer = null;
    }
    if (runtime.inPip) {
      activateSwfPipTab(runtimeKey);
      setSwfPlayback(runtimeKey, true, "user");
      return true;
    }
    runtime.pipTransitioning = true;
    runtime.inPip = true;
    runtime.pipHost = runtime.host;
    runtime.pipHost.classList.add("swf-pip-player", "message-swf-player--pip-floating");
    runtime.pipTransitioning = false;
    activateSwfPipTab(runtimeKey);
    setSwfPlayback(runtimeKey, true, "user");
    return true;
  }
  runtime.pipTransitioning = true;
  runtime.inPip = false;
  runtime.host.classList.remove("swf-pip-player", "message-swf-player--pip-floating");
  runtime.host.style.left = "";
  runtime.host.style.top = "";
  runtime.host.style.width = "";
  runtime.host.style.height = "";
  runtime.pipHost = null;
  runtime.pipTransitioning = false;
  bindSwfVisibilityObserver(runtimeKey);
  removeSwfPipTab(runtimeKey);
  setSwfPlayback(runtimeKey, true, "user");
  return true;
}

function renderSwfPipDock() {
  const hasTabs = swfPipTabs.length > 0;
  ui.swfPipDock.classList.toggle("swf-pip--hidden", !hasTabs || swfPipManuallyHidden);
  ui.swfPipDock.classList.toggle("swf-pip--collapsed", swfPipCollapsed);
  ui.swfPipTabs.innerHTML = "";
  if (!hasTabs) return;
  updateSwfPipDockLayout();
  if (!swfPipActiveKey || !swfPipTabs.includes(swfPipActiveKey)) swfPipActiveKey = swfPipTabs[0];
  // Render tabs first so host geometry is accurate before placing floating players.
  swfPipTabs.forEach((runtimeKey) => {
    const runtime = swfRuntimes.get(runtimeKey);
    if (!runtime) return;
    const tabBtn = document.createElement("button");
    tabBtn.type = "button";
    tabBtn.className = "swf-pip__tab";
    tabBtn.classList.toggle("active", runtimeKey === swfPipActiveKey);
    tabBtn.textContent = runtime.attachment?.name || "SWF";
    tabBtn.title = runtime.attachment?.name || "SWF";
    tabBtn.addEventListener("click", () => {
      swfPipActiveKey = runtimeKey;
      renderSwfPipDock();
      refreshSwfAudioFocus(runtimeKey);
    });
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "swf-pip__tab-close";
    closeBtn.textContent = "✕";
    closeBtn.title = "Remove from PiP";
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      setSwfRuntimePip(runtimeKey, false);
      refreshSwfAudioFocus();
    });
    tabBtn.appendChild(closeBtn);
    ui.swfPipTabs.appendChild(tabBtn);
  });
  // Keep live Ruffle nodes attached to avoid destroy/recreate cycles.
  positionSwfPipRuntimeHosts();
  const activeRuntime = swfRuntimes.get(swfPipActiveKey);
  if (!activeRuntime?.pipHost) return;
  setSwfPlayback(swfPipActiveKey, true, "user");
}

function positionSwfPipRuntimeHosts() {
  const pipRect = ui.swfPipHost.getBoundingClientRect();
  const dockRect = ui.swfPipDock.getBoundingClientRect();
  const collapsedAnchorLeft = Math.max(8, dockRect.right - 2);
  const collapsedAnchorTop = Math.max(8, dockRect.bottom - 2);
  swfPipTabs.forEach((runtimeKey) => {
    const runtime = swfRuntimes.get(runtimeKey);
    if (!runtime?.pipHost) return;
    const visible = (
      runtimeKey === swfPipActiveKey
      && !ui.swfPipDock.classList.contains("swf-pip--hidden")
      && !swfPipCollapsed
    );
    runtime.pipHost.style.display = "block";
    runtime.pipHost.style.pointerEvents = visible ? "auto" : "none";
    runtime.pipHost.style.opacity = visible ? "1" : "0";
    runtime.pipHost.style.visibility = visible ? "visible" : "hidden";
    if (visible) {
      runtime.pipHost.style.borderColor = "";
      runtime.pipHost.style.background = "";
      runtime.pipHost.style.boxShadow = "";
      runtime.pipHost.style.left = `${Math.max(8, pipRect.left)}px`;
      runtime.pipHost.style.top = `${Math.max(8, pipRect.top)}px`;
      runtime.pipHost.style.width = `${Math.max(260, pipRect.width)}px`;
      runtime.pipHost.style.height = `${Math.max(180, pipRect.height)}px`;
    } else {
      runtime.pipHost.style.borderColor = "transparent";
      runtime.pipHost.style.background = "transparent";
      runtime.pipHost.style.boxShadow = "none";
      runtime.pipHost.style.left = `${collapsedAnchorLeft}px`;
      runtime.pipHost.style.top = `${collapsedAnchorTop}px`;
      runtime.pipHost.style.width = "1px";
      runtime.pipHost.style.height = "1px";
    }
  });
}

function updateSwfPipDockLayout() {
  if (!(ui.swfPipDock instanceof HTMLElement)) return;
  if (pipDragState?.dragging) return;
  const prefs = getPreferences();
  if (
    prefs.swfPipPosition?.manual
    && Number.isFinite(prefs.swfPipPosition.left)
    && Number.isFinite(prefs.swfPipPosition.top)
  ) {
    const rect = ui.swfPipDock.getBoundingClientRect();
    const width = rect.width || 420;
    const height = rect.height || 320;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, prefs.swfPipPosition.left));
    const top = Math.max(8, Math.min(window.innerHeight - 48, prefs.swfPipPosition.top));
    ui.swfPipDock.style.left = `${Math.round(left)}px`;
    ui.swfPipDock.style.top = `${Math.round(top)}px`;
    ui.swfPipDock.style.right = "auto";
    ui.swfPipDock.style.bottom = "auto";
    return;
  }
  const composerRect = ui.messageForm?.getBoundingClientRect?.();
  if (!composerRect) {
    ui.swfPipDock.style.maxHeight = `${Math.max(160, window.innerHeight - 24)}px`;
    ui.swfPipDock.style.left = `${Math.max(10, window.innerWidth - 420 - 14)}px`;
    ui.swfPipDock.style.top = `${Math.max(10, window.innerHeight - 420)}px`;
    ui.swfPipDock.style.right = "auto";
    ui.swfPipDock.style.bottom = "auto";
    return;
  }
  const maxHeight = Math.max(140, composerRect.top - 12);
  ui.swfPipDock.style.maxHeight = `${Math.round(maxHeight)}px`;
  const rect = ui.swfPipDock.getBoundingClientRect();
  const width = rect.width || 420;
  const height = rect.height || 320;
  const left = Math.max(10, Math.min(window.innerWidth - width - 10, composerRect.right - width));
  const maxTopAboveComposer = composerRect.top - height - 8;
  const top = Math.max(8, maxTopAboveComposer);
  ui.swfPipDock.style.left = `${Math.round(left)}px`;
  ui.swfPipDock.style.top = `${Math.round(top)}px`;
  ui.swfPipDock.style.right = "auto";
  ui.swfPipDock.style.bottom = "auto";
}

async function openSavedSwfFromShelf(entry) {
  const key = `shelf:${entry.url}`;
  let runtime = swfRuntimes.get(key);
  if (!runtime?.host) {
    const host = document.createElement("div");
    host.className = "message-swf-player";
    host.style.position = "fixed";
    host.style.left = "-2000px";
    host.style.top = "-2000px";
    host.style.width = "640px";
    host.style.height = "480px";
    document.body.appendChild(host);
    attachRufflePlayer(host, entry, { autoplay: "on", runtimeKey: key });
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await nextFrame();
      runtime = swfRuntimes.get(key);
      if (runtime?.host) break;
    }
  }
  const host = runtime?.host || null;
  if (!host) return;
  await openSwfFullscreen(key, host, entry);
}

function setSwfPlayback(runtimeKey, shouldPlay, reason = "system") {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player) return false;
  if (shouldPlay && reason === "system" && !runtime.allowAutoPlay && !runtime.manualPlay) return false;
  try {
    if (shouldPlay) {
      if (typeof runtime.player.play === "function") runtime.player.play();
      runtime.playing = true;
      if (reason !== "system") runtime.manualPlay = true;
    } else {
      if (typeof runtime.player.pause === "function") runtime.player.pause();
      runtime.playing = false;
      runtime.autoPausedByMute = false;
    }
    refreshSwfAudioFocus(shouldPlay ? runtimeKey : null);
    return true;
  } catch (error) {
    addDebugLog("warn", "SWF playback toggle failed", { key: runtimeKey, shouldPlay, error: String(error) });
    return false;
  }
}

function runtimeIsVisible(runtime) {
  if (!runtime?.host || !runtime.host.isConnected) return false;
  const rect = runtime.host.getBoundingClientRect();
  if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return false;
  if (rect.width <= 2 || rect.height <= 2) return false;
  return rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
}

function runtimeDistanceToViewportCenter(runtime) {
  if (!runtimeIsVisible(runtime)) return Number.POSITIVE_INFINITY;
  const rect = runtime.host.getBoundingClientRect();
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const runtimeX = rect.left + rect.width / 2;
  const runtimeY = rect.top + rect.height / 2;
  return Math.hypot(centerX - runtimeX, centerY - runtimeY);
}

function pickCenteredRuntimeKey(canUse, { guildId = null, preferredKey = null } = {}) {
  const candidates = [];
  swfRuntimes.forEach((runtime, key) => {
    if (!canUse(key, runtime)) return;
    if (guildId !== null && (runtime.guildId || "__ungrouped__") !== guildId) return;
    candidates.push({ key, runtime, dist: runtimeDistanceToViewportCenter(runtime) });
  });
  if (candidates.length === 0) return null;
  const fullscreenEntry = candidates.find(({ runtime }) => document.fullscreenElement && runtime.host === document.fullscreenElement);
  if (fullscreenEntry) return fullscreenEntry.key;
  const preferred = preferredKey ? candidates.find((entry) => entry.key === preferredKey) : null;
  if (preferred && Number.isFinite(preferred.dist)) return preferred.key;
  const visible = candidates.filter((entry) => Number.isFinite(entry.dist));
  if (visible.length === 0) return candidates[0].key;
  visible.sort((a, b) => a.dist - b.dist);
  return visible[0].key;
}

function updateSwfAudioUi(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) return;
  const prefs = getPreferences();
  if (runtime.audioToggleEl instanceof HTMLElement) {
    const muted = !runtime.audioEnabled;
    const pinSuffix = runtime.audioPinned ? " (Pinned)" : "";
    const titleText = `${muted ? "Unmute SWF audio" : "Mute SWF audio"}${pinSuffix}. Right-click to ${runtime.audioPinned ? "unpin" : "pin"} (skip auto-mute).`;
    runtime.audioToggleEl.textContent = muted ? "🔇" : "🔊";
    runtime.audioToggleEl.title = titleText;
    runtime.audioToggleEl.setAttribute("aria-label", titleText);
    runtime.audioToggleEl.classList.toggle("is-pinned", Boolean(runtime.audioPinned));
    runtime.audioToggleEl.dataset.pinned = runtime.audioPinned ? "on" : "off";
  }
  if (runtime.audioIndicatorEl instanceof HTMLElement) {
    const audible = runtime.playing && runtime.audioEnabled && !runtime.audioSuppressed;
    if (!runtime.audioEnabled) {
      runtime.audioIndicatorEl.textContent = "Muted";
      runtime.audioIndicatorEl.title = "Muted";
    } else if (runtime.audioSuppressed) {
      if (prefs.swfQuickAudioMode === "click" && !runtime.audioClickAllowed) {
        runtime.audioIndicatorEl.textContent = "Click to hear";
        runtime.audioIndicatorEl.title = "Click this SWF to route audio focus to it";
      } else {
        runtime.audioIndicatorEl.textContent = "Suppressed";
        runtime.audioIndicatorEl.title = "Suppressed by audio focus";
      }
    } else if (audible) {
      runtime.audioIndicatorEl.textContent = "Audio Active";
      runtime.audioIndicatorEl.title = "Audio active";
    } else {
      runtime.audioIndicatorEl.textContent = "Audio Idle";
      runtime.audioIndicatorEl.title = "Audio idle";
    }
    runtime.audioIndicatorEl.classList.toggle("is-active", audible);
    runtime.audioIndicatorEl.classList.toggle("is-pinned", Boolean(runtime.audioPinned));
  }
  if (runtime.vuMeterFillEl instanceof HTMLElement) {
    const audible = runtime.playing && runtime.audioEnabled && !runtime.audioSuppressed;
    runtime.vuMeterFillEl.classList.toggle("is-active", audible);
    runtime.vuMeterFillEl.style.width = audible ? `${42 + Math.round(Math.random() * 54)}%` : "0%";
  }
}


function applySwfAudioToRuntime(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player) return;
  const prefs = getPreferences();
  const audioEnabled = typeof runtime.audioEnabled === "boolean"
    ? runtime.audioEnabled
    : prefs.swfAudio === "on";
  const volumePercent = Number.isFinite(runtime.audioVolume)
    ? runtime.audioVolume
    : prefs.swfVolume;
  const effectiveAudioEnabled = audioEnabled && !runtime.audioSuppressed;
  const volume = effectiveAudioEnabled ? Math.min(100, Math.max(0, volumePercent)) / 100 : 0;
  const shouldPauseOnSuppressed = prefs.swfPauseOnMute === "on" && runtime.audioSuppressed;
  try {
    if ("volume" in runtime.player) runtime.player.volume = volume;
    if (typeof runtime.player.set_volume === "function") runtime.player.set_volume(volume);
    if ("muted" in runtime.player) runtime.player.muted = !effectiveAudioEnabled;
    if (shouldPauseOnSuppressed && runtime.playing && typeof runtime.player.pause === "function") {
      runtime.player.pause();
      runtime.autoPausedByMute = true;
    }
    if (!shouldPauseOnSuppressed && runtime.autoPausedByMute && runtime.playing && typeof runtime.player.play === "function") {
      runtime.player.play();
      runtime.autoPausedByMute = false;
    }
    if (!shouldPauseOnSuppressed && runtime.playing && typeof runtime.player.play === "function") {
      runtime.player.play();
    }
  } catch (error) {
    addDebugLog("warn", "Failed to apply SWF audio settings", { key: runtimeKey, error: String(error) });
  }
}

function applySwfAudioToAllRuntimes() {
  refreshSwfAudioFocus();
}

function updateSwfRuntimeAudio(runtimeKey, { enabled, volume } = {}) {
  if (!runtimeKey) return;
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) {
    const nextPending = swfPendingAudio.get(runtimeKey) || {};
    if (typeof enabled === "boolean") nextPending.enabled = enabled;
    if (Number.isFinite(volume)) nextPending.volume = Math.min(100, Math.max(0, volume));
    swfPendingAudio.set(runtimeKey, nextPending);
    return;
  }
  if (typeof enabled === "boolean") runtime.audioEnabled = enabled;
  if (Number.isFinite(volume)) runtime.audioVolume = Math.min(100, Math.max(0, volume));
  refreshSwfAudioFocus(enabled ? runtimeKey : null);
}

function setSwfRuntimeAudioPinned(runtimeKey, pinned) {
  if (!runtimeKey) return;
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) {
    const nextPending = swfPendingAudio.get(runtimeKey) || {};
    nextPending.pinned = Boolean(pinned);
    swfPendingAudio.set(runtimeKey, nextPending);
    return;
  }
  runtime.audioPinned = Boolean(pinned);
  refreshSwfAudioFocus(runtimeKey);
}

function getSwfRuntimeMetadata(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player || typeof runtime.player.ruffle !== "function") return null;
  try {
    const api = runtime.player.ruffle();
    if (!api?.metadata) return null;
    runtime.metadata = api.metadata;
    return runtime.metadata;
  } catch {
    return runtime?.metadata || null;
  }
}

function computeFittedSwfSize(width, height, {
  minWidth = 240,
  minHeight = 160,
  maxWidth = 1200,
  maxHeight = 900
} = {}) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const aspect = width / height;
  let targetWidth = width;
  let targetHeight = height;
  if (targetWidth > maxWidth) {
    targetWidth = maxWidth;
    targetHeight = targetWidth / aspect;
  }
  if (targetHeight > maxHeight) {
    targetHeight = maxHeight;
    targetWidth = targetHeight * aspect;
  }
  if (targetWidth < minWidth) {
    targetWidth = minWidth;
    targetHeight = targetWidth / aspect;
  }
  if (targetHeight < minHeight) {
    targetHeight = minHeight;
    targetWidth = targetHeight * aspect;
  }
  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight)
  };
}

function applySwfMetadataSize(runtimeKey, hostElement) {
  if (!runtimeKey || !hostElement) return false;
  const metadata = getSwfRuntimeMetadata(runtimeKey);
  if (!metadata) return false;
  const width = Number(metadata.width);
  const height = Number(metadata.height);
  const fitted = computeFittedSwfSize(width, height, {
    minWidth: 260,
    minHeight: 180,
    maxWidth: 760,
    maxHeight: 520
  });
  if (!fitted) return false;
  hostElement.style.width = `${fitted.width}px`;
  hostElement.style.height = `${fitted.height}px`;
  hostElement.style.aspectRatio = `${Math.round(width)} / ${Math.round(height)}`;
  return true;
}

function applySwfOptimalSize(runtimeKey, hostElement) {
  if (!hostElement) return false;
  const metadata = runtimeKey ? getSwfRuntimeMetadata(runtimeKey) : null;
  if (!metadata) {
    addDebugLog("info", "SWF metadata unavailable for optimal size", { key: runtimeKey || null });
    return false;
  }
  const width = Number(metadata.width);
  const height = Number(metadata.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    addDebugLog("info", "SWF metadata missing dimensions for optimal size", { key: runtimeKey || null, metadata });
    return false;
  }
  const fitted = computeFittedSwfSize(width, height);
  if (!fitted) return false;
  hostElement.style.width = `${fitted.width}px`;
  hostElement.style.height = `${fitted.height}px`;
  hostElement.style.aspectRatio = `${Math.round(width)} / ${Math.round(height)}`;
  hostElement.classList.add("message-swf-player--resizable");
  addDebugLog("info", "Applied SWF optimal size", { key: runtimeKey || null, width: fitted.width, height: fitted.height });
  return true;
}

async function openSwfFullscreen(runtimeKey, hostElement, attachment) {
  let runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
  if (!runtime && hostElement && attachment) {
    attachRufflePlayer(hostElement, attachment, { autoplay: "on", runtimeKey });
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await nextFrame();
      runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
      if (runtime?.host) break;
    }
  }
  const target = runtime?.host || hostElement;
  if (!target || typeof target.requestFullscreen !== "function") return;
  try {
    await target.requestFullscreen();
    fullscreenRuntimeKey = runtimeKey;
    if (runtimeKey) setSwfPlayback(runtimeKey, true, "user");
  } catch (error) {
    addDebugLog("warn", "SWF fullscreen request failed", { key: runtimeKey, error: String(error) });
  }
}

function resetSwfRuntime(runtimeKey, hostElement, attachment) {
  if (!confirm("Reset this SWF to the beginning?")) return;
  const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
  if (runtimeKey && runtime) {
    swfPendingUi.set(runtimeKey, {
      audioToggleEl: runtime.audioToggleEl || null,
      audioIndicatorEl: runtime.audioIndicatorEl || null,
      vuMeterFillEl: runtime.vuMeterFillEl || null
    });
  }
  if (runtime?.observer) runtime.observer.disconnect();
  if (runtimeKey) {
    swfRuntimes.delete(runtimeKey);
    removeSwfPipTab(runtimeKey);
    if (swfSoloRuntimeKey === runtimeKey) swfSoloRuntimeKey = null;
    refreshSwfAudioFocus();
  }
  if (hostElement) {
    hostElement.innerHTML = "";
    hostElement.textContent = "Resetting SWF...";
  }
  attachRufflePlayer(hostElement, attachment, { autoplay: swfAutoplayFromPreferences(), runtimeKey });
}

function bindSwfVisibilityObserver(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.host || !runtime.player) return;
  if (runtime.observer) {
    runtime.observer.disconnect();
    runtime.observer = null;
  }
  runtime.observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target !== runtime.host) return;
      if (currentViewerRuntimeKey === runtimeKey) return;
      if (document.fullscreenElement && runtime.host === document.fullscreenElement) return;
      setSwfPlayback(runtimeKey, entry.isIntersecting, "system");
    });
  }, { threshold: 0.22 });
  runtime.observer.observe(runtime.host);
}

function attachRufflePlayer(playerWrap, attachment, { autoplay = "on", runtimeKey = null } = {}) {
  const mediaUrl = resolveMediaUrl(attachment.url);
  const hasRuffle = Boolean(window.RufflePlayer?.newest);
  if (!hasRuffle) {
    playerWrap.style.display = "grid";
    playerWrap.style.placeItems = "center";
    playerWrap.style.color = "#a6aeb9";
    playerWrap.style.fontSize = "0.78rem";
    playerWrap.textContent = "Ruffle loading or unavailable. Falling back to file link.";
    addDebugLog("warn", "Ruffle runtime unavailable for SWF message", { url: mediaUrl, name: attachment.name || "" });
    return;
  }
  try {
    const ruffle = window.RufflePlayer.newest();
    const player = ruffle.createPlayer();
    player.style.width = "100%";
    player.style.height = "100%";
    if (typeof player.ruffle === "function") {
      try {
        player.ruffle().config = {
          ...(player.ruffle().config || {}),
          scale: "showAll",
          forceScale: true,
          letterbox: "on",
          openUrlMode: "confirm"
        };
      } catch {
        // Ignore config API failures and fall back to load options.
      }
    }
    if (runtimeKey) {
      player.addEventListener("loadedmetadata", () => {
        const metadata = getSwfRuntimeMetadata(runtimeKey);
        if (metadata) {
          applySwfMetadataSize(runtimeKey, playerWrap);
          addDebugLog("info", "SWF metadata loaded", { key: runtimeKey, metadata });
        }
      });
    }
    playerWrap.innerHTML = "";
    playerWrap.appendChild(player);
    const urlCandidates = [mediaUrl];
    try {
      const decoded = decodeURI(mediaUrl);
      if (!urlCandidates.includes(decoded)) urlCandidates.push(decoded);
    } catch {
      // ignore
    }
    const loadWithFallback = async () => {
      let mounted = playerWrap.isConnected && ui.messageList.isConnected;
      if (!mounted) {
        for (let attempt = 0; attempt < 6; attempt += 1) {
          await nextFrame();
          mounted = playerWrap.isConnected && (ui.messageList.isConnected || ui.swfViewerDialog.open);
          if (mounted) break;
        }
      }
      if (!mounted) {
        addDebugLog("info", "Skipped SWF load because player never mounted", { url: mediaUrl });
        return;
      }
      let loaded = false;
      for (const candidate of urlCandidates) {
        if (!playerWrap.isConnected) {
          addDebugLog("info", "Aborted SWF load because player became detached", { url: candidate });
          return;
        }
        try {
          await Promise.resolve(player.load({
            url: candidate,
            autoplay,
            unmuteOverlay: "hidden",
            scale: "showAll",
            forceScale: true,
            letterbox: "on",
            openUrlMode: "confirm"
          }));
          addDebugLog("info", "Ruffle loaded SWF via object payload", { url: candidate, name: attachment.name || "" });
          loaded = true;
          break;
        } catch (errorObjectMode) {
          addDebugLog("warn", "Ruffle object payload load failed", { url: candidate, error: String(errorObjectMode) });
          try {
            await Promise.resolve(player.load(candidate));
            addDebugLog("info", "Ruffle loaded SWF via string payload", { url: candidate, name: attachment.name || "" });
            loaded = true;
            break;
          } catch (errorStringMode) {
            addDebugLog("warn", "Ruffle string payload load failed", { url: candidate, error: String(errorStringMode) });
          }
        }
      }
      if (!loaded && playerWrap.isConnected) {
        playerWrap.textContent = "Ruffle could not load this SWF. Open Debug Console for details.";
        if (runtimeKey) {
          swfRuntimes.delete(runtimeKey);
          removeSwfPipTab(runtimeKey);
          if (swfSoloRuntimeKey === runtimeKey) swfSoloRuntimeKey = null;
          swfPendingUi.delete(runtimeKey);
          refreshSwfAudioFocus();
        }
        return;
      }
      if (runtimeKey) {
        const activeGuildId = getActiveGuild()?.id || null;
        swfRuntimes.set(runtimeKey, {
          key: runtimeKey,
          attachment: { ...attachment },
          player,
          host: playerWrap,
          originHost: playerWrap,
          guildId: activeGuildId,
          playing: autoplay !== "off",
          allowAutoPlay: autoplay !== "off",
          manualPlay: false,
          autoPausedByMute: false,
          observer: null,
          floating: false,
          restoreStyle: "",
          audioEnabled: getPreferences().swfAudio === "on",
          audioVolume: getPreferences().swfVolume,
          audioSuppressed: false,
          audioPinned: false,
          audioClickAllowed: getPreferences().swfQuickAudioMode === "on",
          audioToggleEl: null,
          audioIndicatorEl: null,
          vuMeterFillEl: null
        });
        const pendingUi = swfPendingUi.get(runtimeKey);
        if (pendingUi) {
          const runtime = swfRuntimes.get(runtimeKey);
          if (runtime) {
            runtime.audioToggleEl = pendingUi.audioToggleEl || null;
            runtime.audioIndicatorEl = pendingUi.audioIndicatorEl || null;
            runtime.vuMeterFillEl = pendingUi.vuMeterFillEl || null;
          }
          swfPendingUi.delete(runtimeKey);
        }
        const pendingAudio = swfPendingAudio.get(runtimeKey);
        if (pendingAudio) {
          const runtime = swfRuntimes.get(runtimeKey);
          if (runtime) {
            if (typeof pendingAudio.enabled === "boolean") runtime.audioEnabled = pendingAudio.enabled;
            if (Number.isFinite(pendingAudio.volume)) runtime.audioVolume = pendingAudio.volume;
            if (typeof pendingAudio.pinned === "boolean") runtime.audioPinned = pendingAudio.pinned;
          }
          swfPendingAudio.delete(runtimeKey);
        }
        refreshSwfAudioFocus();
        bindSwfVisibilityObserver(runtimeKey);
      }
    };
    void loadWithFallback();
  } catch {
    addDebugLog("error", "Ruffle player creation failed", { url: mediaUrl, name: attachment.name || "" });
    playerWrap.textContent = "Ruffle failed to load this SWF.";
  }
}

function openSwfViewer(attachment, runtimeKey = null) {
  currentViewerSwf = { name: attachment.name || "SWF file", url: attachment.url };
  currentViewerRuntimeKey = runtimeKey;
  ui.swfViewerTitle.textContent = currentViewerSwf.name;
  ui.swfViewerZoomInput.value = "100";
  ui.swfViewerDialog.showModal();
  ui.swfViewerHost.innerHTML = "";
  ui.swfViewerHost.style.display = "block";
  const host = document.createElement("div");
  host.className = "message-swf-player";
  host.style.width = "960px";
  host.style.height = "70vh";
  host.style.transformOrigin = "top left";
  ui.swfViewerHost.appendChild(host);
  const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
  if (runtime?.player instanceof HTMLElement && runtime.host instanceof HTMLElement) {
    runtime.floating = true;
    runtime.restoreStyle = runtime.host.getAttribute("style") || "";
    runtime.host.classList.add("message-swf-player--floating");
    positionFloatingSwfHost(runtime);
    ui.swfViewerHost.innerHTML = "<div class=\"channel-empty\">Using the live running SWF instance.</div>";
    setSwfPlayback(runtimeKey, true, "user");
  } else {
    attachRufflePlayer(host, currentViewerSwf, { autoplay: "on", runtimeKey });
  }
  host.style.transform = "scale(1)";
}

function applySwfViewerZoom() {
  const floatingRuntime = currentViewerRuntimeKey ? swfRuntimes.get(currentViewerRuntimeKey) : null;
  const host = floatingRuntime?.floating
    ? floatingRuntime.host
    : ui.swfViewerHost.firstElementChild;
  if (!(host instanceof HTMLElement)) return;
  const zoomPercent = Math.max(50, Math.min(200, Number(ui.swfViewerZoomInput.value) || 100));
  const factor = zoomPercent / 100;
  if (floatingRuntime?.floating) {
    host.dataset.zoom = String(factor);
    applyFloatingTransform(floatingRuntime);
  } else {
    host.style.transform = `scale(${factor})`;
    host.style.transformOrigin = "top left";
  }
}

function applyFloatingTransform(runtime) {
  if (!runtime?.host) return;
  const factor = Number(runtime.host.dataset.zoom || "1");
  runtime.host.style.transform = `scale(${factor})`;
  runtime.host.style.transformOrigin = "top left";
}

function positionFloatingSwfHost(runtime) {
  if (!runtime?.host || !ui.swfViewerDialog.open) return;
  const rect = ui.swfViewerHost.getBoundingClientRect();
  runtime.host.style.left = `${Math.max(8, rect.left)}px`;
  runtime.host.style.top = `${Math.max(8, rect.top)}px`;
  runtime.host.style.width = `${Math.max(280, rect.width)}px`;
  runtime.host.style.height = `${Math.max(220, rect.height)}px`;
  applyFloatingTransform(runtime);
}

function closeSwfViewerAndRestore() {
  const runtimeKey = currentViewerRuntimeKey;
  currentViewerRuntimeKey = null;
  const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
  if (runtime?.player instanceof HTMLElement && runtime.originHost?.isConnected) {
    if (runtime.floating && runtime.host instanceof HTMLElement) {
      runtime.host.classList.remove("message-swf-player--floating");
      runtime.host.setAttribute("style", runtime.restoreStyle || "");
      delete runtime.host.dataset.zoom;
      runtime.floating = false;
    } else if (runtime.host !== runtime.originHost) {
      runtime.originHost.innerHTML = "";
      runtime.originHost.appendChild(runtime.player);
      runtime.host = runtime.originHost;
    }
    bindSwfVisibilityObserver(runtimeKey);
  }
  if (ui.swfViewerDialog.open) ui.swfViewerDialog.close();
}

function renderMessageAttachment(container, attachment, { swfKey = null } = {}) {
  if (!attachment || !attachment.url) return;
  const type = attachment.type || "gif";
  const mediaUrl = resolveMediaUrl(attachment.url);
  const wrap = document.createElement("div");
  wrap.className = `message-attachment message-attachment--${type}`;

  if (type !== "swf" && shouldGateMediaUrl(mediaUrl)) {
    const host = mediaUrlHost(mediaUrl) || "external host";
    const gate = document.createElement("div");
    gate.className = "message-swf";
    const title = document.createElement("strong");
    title.textContent = `External ${type.toUpperCase()} hidden`;
    const info = document.createElement("div");
    info.className = "message-swf-meta";
    info.textContent = `Host: ${host}`;
    const armBtn = document.createElement("button");
    armBtn.type = "button";
    armBtn.className = "message-swf-top-btn";
    armBtn.textContent = "Show load options";
    const controls = document.createElement("div");
    controls.className = "settings-inline-actions";
    controls.hidden = true;
    const onceBtn = document.createElement("button");
    onceBtn.type = "button";
    onceBtn.textContent = "Load once";
    onceBtn.addEventListener("click", () => {
      mediaAllowOnceUrls.add(mediaUrl);
      renderMessages();
    });
    const trustBtn = document.createElement("button");
    trustBtn.type = "button";
    trustBtn.textContent = "Always trust host";
    trustBtn.addEventListener("click", () => {
      const added = addMediaTrustRule(host);
      if (added) {
        saveState();
        showToast(`Added trusted host: ${host}`);
      } else {
        showToast(`Host already trusted: ${host}`);
      }
      renderMessages();
    });
    const customRuleBtn = document.createElement("button");
    customRuleBtn.type = "button";
    customRuleBtn.textContent = "Add custom rule";
    customRuleBtn.addEventListener("click", () => {
      const nextRule = prompt("Media trust rule (domain, *.domain, or /regex/)", host);
      if (typeof nextRule !== "string") return;
      const added = addMediaTrustRule(nextRule);
      if (!added) {
        showToast("Rule already exists or invalid.");
        return;
      }
      saveState();
      showToast(`Added trust rule: ${nextRule}`);
      renderMessages();
    });
    const allowAllBtn = document.createElement("button");
    allowAllBtn.type = "button";
    allowAllBtn.textContent = "Disable privacy gate";
    allowAllBtn.addEventListener("click", () => {
      state.preferences = getPreferences();
      state.preferences.mediaPrivacyMode = "off";
      saveState();
      renderMessages();
      showToast("Media privacy gate disabled.");
    });
    controls.appendChild(onceBtn);
    controls.appendChild(trustBtn);
    controls.appendChild(customRuleBtn);
    controls.appendChild(allowAllBtn);
    armBtn.addEventListener("click", () => {
      controls.hidden = !controls.hidden;
      armBtn.textContent = controls.hidden ? "Show load options" : "Hide load options";
    });
    gate.appendChild(title);
    gate.appendChild(info);
    gate.appendChild(armBtn);
    gate.appendChild(controls);
    wrap.appendChild(gate);
    container.appendChild(wrap);
    return;
  }

  if (type === "swf") {
    const card = document.createElement("div");
    card.className = "message-swf";
    const header = document.createElement("div");
    header.className = "message-swf-header";
    const title = document.createElement("strong");
    title.textContent = attachment.name || "SWF file";
    const meta = document.createElement("div");
    meta.className = "message-swf-meta";
    const controlRow = document.createElement("div");
    controlRow.className = "message-swf-top-controls";
    const saveIconBtn = document.createElement("button");
    saveIconBtn.type = "button";
    saveIconBtn.className = "message-swf-save-icon";
    saveIconBtn.title = "Download SWF";
    saveIconBtn.setAttribute("aria-label", "Download SWF");
    saveIconBtn.textContent = "💾";
    saveIconBtn.addEventListener("click", () => {
      void downloadAttachmentFile(attachment, "swf");
    });
    saveIconBtn.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      saveSwfToShelf(attachment);
    });
    const exportSavesBtn = document.createElement("button");
    exportSavesBtn.type = "button";
    exportSavesBtn.className = "message-swf-top-btn";
    exportSavesBtn.textContent = "Save↓";
    exportSavesBtn.title = "Export SWF saves";
    exportSavesBtn.addEventListener("click", () => exportSwfSavesNow());
    const importSavesBtn = document.createElement("button");
    importSavesBtn.type = "button";
    importSavesBtn.className = "message-swf-top-btn";
    importSavesBtn.textContent = "Save↑";
    importSavesBtn.title = "Import SWF saves";
    importSavesBtn.addEventListener("click", () => triggerImportSwfSaves());
    const audioIndicator = document.createElement("span");
    audioIndicator.className = "message-swf-audio-indicator";
    audioIndicator.textContent = "Audio Idle";
    audioIndicator.title = "Audio idle";
    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "message-swf-top-btn";
    playBtn.textContent = "▶";
    playBtn.title = "Play";
    const pauseBtn = document.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className = "message-swf-top-btn";
    pauseBtn.textContent = "⏸";
    pauseBtn.title = "Pause";
    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.type = "button";
    fullscreenBtn.className = "message-swf-top-btn";
    fullscreenBtn.textContent = "⛶";
    fullscreenBtn.title = "Fullscreen";
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "message-swf-top-btn";
    resetBtn.textContent = "↺";
    resetBtn.title = "Reset SWF";
    const resizeBtn = document.createElement("button");
    resizeBtn.type = "button";
    resizeBtn.className = "message-swf-top-btn";
    resizeBtn.textContent = "⇲";
    resizeBtn.title = "Resize player";
    const optimalBtn = document.createElement("button");
    optimalBtn.type = "button";
    optimalBtn.className = "message-swf-top-btn";
    optimalBtn.textContent = "◎";
    optimalBtn.title = "Optimal size";
    const soloBtn = document.createElement("button");
    soloBtn.type = "button";
    soloBtn.className = "message-swf-top-btn";
    soloBtn.textContent = "🎯";
    soloBtn.title = "Solo audio focus";
    const pipBtn = document.createElement("button");
    pipBtn.type = "button";
    pipBtn.className = "message-swf-top-btn";
    pipBtn.textContent = "📺";
    pipBtn.title = "Pin to PiP";
    header.appendChild(title);
    controlRow.appendChild(saveIconBtn);
    controlRow.appendChild(exportSavesBtn);
    controlRow.appendChild(importSavesBtn);
    controlRow.appendChild(playBtn);
    controlRow.appendChild(pauseBtn);
    controlRow.appendChild(fullscreenBtn);
    controlRow.appendChild(resetBtn);
    controlRow.appendChild(resizeBtn);
    controlRow.appendChild(optimalBtn);
    controlRow.appendChild(soloBtn);
    controlRow.appendChild(pipBtn);
    controlRow.appendChild(audioIndicator);
    meta.appendChild(controlRow);
    header.appendChild(meta);
    card.appendChild(header);

    const body = document.createElement("div");
    body.className = "message-swf-body";
    const audioRail = document.createElement("div");
    audioRail.className = "message-swf-audio-rail";
    let playerWrap = document.createElement("div");
    playerWrap.className = "message-swf-player";
    playerWrap.style.display = "grid";
    playerWrap.style.placeItems = "center";
    playerWrap.style.color = "#a6aeb9";
    playerWrap.style.fontSize = "0.78rem";
    playerWrap.textContent = "Loading SWF...";
    playerWrap.addEventListener("click", () => {
      if (!swfKey) return;
      const runtime = swfRuntimes.get(swfKey);
      if (!runtime) return;
      setSwfPlayback(swfKey, true, "user");
      const prefs = getPreferences();
      if (prefs.swfQuickAudioMode === "click") {
        swfRuntimes.forEach((entry) => {
          entry.audioClickAllowed = false;
        });
        runtime.audioClickAllowed = true;
      }
      if (runtime.audioEnabled) refreshSwfAudioFocus(swfKey);
    });
    const audioToggleBtn = document.createElement("button");
    audioToggleBtn.type = "button";
    audioToggleBtn.className = "message-swf-audio-toggle";
    const prefs = getPreferences();
    const initialEnabled = prefs.swfAudio === "on";
    let audioEnabled = initialEnabled;
    audioToggleBtn.textContent = audioEnabled ? "🔊" : "🔇";
    audioToggleBtn.title = `${audioEnabled ? "Mute SWF audio" : "Unmute SWF audio"}. Right-click to pin (skip auto-mute).`;
    audioToggleBtn.setAttribute("aria-label", `${audioEnabled ? "Mute SWF audio" : "Unmute SWF audio"}. Right-click to pin (skip auto-mute).`);
    audioToggleBtn.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      audioToggleBtn.textContent = audioEnabled ? "🔊" : "🔇";
      audioToggleBtn.title = `${audioEnabled ? "Mute SWF audio" : "Unmute SWF audio"}. Right-click to pin (skip auto-mute).`;
      audioToggleBtn.setAttribute("aria-label", `${audioEnabled ? "Mute SWF audio" : "Unmute SWF audio"}. Right-click to pin (skip auto-mute).`);
      updateSwfRuntimeAudio(swfKey, { enabled: audioEnabled });
    });
    audioToggleBtn.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const runtime = swfKey ? swfRuntimes.get(swfKey) : null;
      const pinned = !(runtime?.audioPinned || false);
      setSwfRuntimeAudioPinned(swfKey, pinned);
      addDebugLog("info", pinned ? "Pinned SWF audio (skip auto-mute)" : "Unpinned SWF audio (auto-mute applies)", {
        key: swfKey || null,
        name: attachment.name || "SWF file"
      });
    });
    const audioSlider = document.createElement("input");
    audioSlider.type = "range";
    audioSlider.min = "0";
    audioSlider.max = "100";
    audioSlider.step = "1";
    audioSlider.value = String(Math.round(prefs.swfVolume));
    audioSlider.className = "message-swf-audio-slider";
    audioSlider.title = "SWF volume";
    audioSlider.setAttribute("aria-label", "SWF volume");
    audioSlider.addEventListener("input", () => {
      updateSwfRuntimeAudio(swfKey, { volume: Number(audioSlider.value) });
    });
    const jumpBtn = document.createElement("button");
    jumpBtn.type = "button";
    jumpBtn.className = "message-swf-jump";
    jumpBtn.textContent = "↑";
    jumpBtn.title = "Jump to this SWF controls";
    jumpBtn.addEventListener("click", () => {
      header.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    audioRail.appendChild(audioToggleBtn);
    audioRail.appendChild(audioSlider);
    body.appendChild(audioRail);
    body.appendChild(playerWrap);
    body.appendChild(jumpBtn);
    card.appendChild(body);
    let vuMeterFill = null;
    if (prefs.swfVuMeter === "on") {
      const details = document.createElement("details");
      details.className = "message-swf-vu";
      const summary = document.createElement("summary");
      summary.textContent = "Audio details";
      const meter = document.createElement("div");
      meter.className = "message-swf-vu__meter";
      vuMeterFill = document.createElement("div");
      vuMeterFill.className = "message-swf-vu__fill";
      meter.appendChild(vuMeterFill);
      details.appendChild(summary);
      details.appendChild(meter);
      card.appendChild(details);
    }
    if (swfKey) {
      swfPendingUi.set(swfKey, {
        audioToggleEl: audioToggleBtn,
        audioIndicatorEl: audioIndicator,
        vuMeterFillEl: vuMeterFill
      });
    }
    const runtimeInMap = swfKey ? swfRuntimes.get(swfKey) : null;
    soloBtn.classList.toggle("is-active", swfKey && swfSoloRuntimeKey === swfKey);
    pipBtn.classList.toggle("is-active", Boolean(runtimeInMap?.inPip));
    if (runtimeInMap?.inPip) {
      runtimeInMap.originHost = playerWrap;
      playerWrap.innerHTML = "<div class=\"channel-empty\">Running in PiP tab.</div>";
    } else if (runtimeInMap?.player instanceof HTMLElement) {
      const reusedHost = attachExistingSwfRuntime(swfKey, playerWrap);
      if (reusedHost instanceof HTMLElement) playerWrap = reusedHost;
    } else if (swfKey) {
      attachRufflePlayer(playerWrap, attachment, { autoplay: swfAutoplayFromPreferences(), runtimeKey: swfKey });
    }

    playBtn.addEventListener("click", () => {
      const runtime = swfKey ? swfRuntimes.get(swfKey) : null;
      if (runtime) {
        setSwfPlayback(swfKey, true, "user");
      } else {
        attachRufflePlayer(playerWrap, attachment, { autoplay: swfAutoplayFromPreferences(), runtimeKey: swfKey });
      }
    });
    pauseBtn.addEventListener("click", () => {
      if (!swfKey) return;
      setSwfPlayback(swfKey, false, "user");
    });
    fullscreenBtn.addEventListener("click", () => {
      void openSwfFullscreen(swfKey, playerWrap, attachment);
    });
    resizeBtn.addEventListener("click", () => {
      playerWrap.classList.toggle("message-swf-player--resizable");
      resizeBtn.classList.toggle("is-active", playerWrap.classList.contains("message-swf-player--resizable"));
    });
    optimalBtn.addEventListener("click", () => {
      const ok = applySwfOptimalSize(swfKey, playerWrap);
      if (!ok) {
        addDebugLog("info", "Optimal size not available yet; SWF metadata pending", { key: swfKey || null });
      }
    });
    resetBtn.addEventListener("click", () => {
      resetSwfRuntime(swfKey, playerWrap, attachment);
    });
    soloBtn.addEventListener("click", () => {
      if (!swfKey) return;
      swfSoloRuntimeKey = swfSoloRuntimeKey === swfKey ? null : swfKey;
      soloBtn.classList.toggle("is-active", swfSoloRuntimeKey === swfKey);
      refreshSwfAudioFocus(swfKey);
    });
    pipBtn.addEventListener("click", () => {
      if (!swfKey) return;
      const runtime = swfRuntimes.get(swfKey);
      if (!runtime) return;
      const nextEnabled = !runtime.inPip;
      setSwfRuntimePip(swfKey, nextEnabled);
      pipBtn.classList.toggle("is-active", nextEnabled);
      refreshSwfAudioFocus(swfKey);
    });
    wrap.appendChild(card);
    container.appendChild(wrap);
    return;
  }

  if (type === "gif") {
    const videoLike = /\.(mp4|webm)(\?.*)?$/i.test(mediaUrl);
    if (videoLike) {
      const video = document.createElement("video");
      video.src = mediaUrl;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.controls = true;
      video.playsInline = true;
      video.addEventListener("dblclick", () => {
        openMediaLightbox({ url: mediaUrl, label: attachment.name || "Video", video: true });
      });
      wrap.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = mediaUrl;
      img.loading = "lazy";
      img.alt = attachment.name || "GIF";
      img.addEventListener("click", () => {
        openMediaLightbox({ url: mediaUrl, label: attachment.name || "GIF" });
      });
      wrap.appendChild(img);
    }
    container.appendChild(wrap);
    return;
  }

  if (type === "sticker" && attachment.format === "dotlottie") {
    const canRenderDotLottie = typeof customElements !== "undefined" && customElements.get("dotlottie-player");
    if (canRenderDotLottie) {
      const lottie = document.createElement("dotlottie-player");
      lottie.setAttribute("src", mediaUrl);
      lottie.setAttribute("autoplay", "");
      lottie.setAttribute("loop", "");
      lottie.style.width = "180px";
      lottie.style.height = "180px";
      wrap.appendChild(lottie);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "message-swf";
      fallback.textContent = "dotLottie runtime loading or unavailable.";
      const link = document.createElement("a");
      link.className = "message-swf-link";
      link.href = mediaUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open .lottie file";
      fallback.appendChild(link);
      wrap.appendChild(fallback);
    }
    container.appendChild(wrap);
    return;
  }

  if (type === "svg") {
    const img = document.createElement("img");
    img.src = mediaUrl;
    img.loading = "lazy";
    img.alt = attachment.name || "SVG";
    img.addEventListener("click", () => {
      openMediaLightbox({ url: mediaUrl, label: attachment.name || "SVG" });
    });
    wrap.appendChild(img);
    const downloadBtn = document.createElement("a");
    downloadBtn.className = "message-swf-link";
    downloadBtn.href = mediaUrl;
    const baseName = (attachment.name || "image").replace(/\.[a-z0-9]+$/i, "");
    downloadBtn.download = `${baseName}.svg`;
    downloadBtn.textContent = "Download SVG";
    wrap.appendChild(downloadBtn);
    container.appendChild(wrap);
    return;
  }

  if (type === "html") {
    const frame = document.createElement("iframe");
    frame.className = "message-html-frame";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer";
    frame.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups allow-downloads";
    frame.src = mediaUrl;
    wrap.appendChild(frame);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open HTML in new tab";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    return;
  }

  if (type === "pdf") {
    const note = document.createElement("div");
    note.className = "message-embed-note";
    note.textContent = "If the PDF preview is blank, your browser PDF viewer may be disabled. Use open/download.";
    wrap.appendChild(note);
    const frame = document.createElement("iframe");
    frame.className = "message-pdf-frame";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer";
    frame.src = mediaUrl;
    wrap.appendChild(frame);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open PDF in new tab";
    wrap.appendChild(openBtn);
    const downloadBtn = document.createElement("a");
    downloadBtn.className = "message-swf-link";
    downloadBtn.href = mediaUrl;
    downloadBtn.download = attachment.name || "document.pdf";
    downloadBtn.textContent = "Download PDF";
    wrap.appendChild(downloadBtn);
    container.appendChild(wrap);
    return;
  }

  if (type === "audio") {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "none";
    audio.src = mediaUrl;
    audio.className = "message-audio";
    wrap.appendChild(audio);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open audio file";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    return;
  }

  if (type === "odf") {
    const frame = document.createElement("iframe");
    frame.className = "message-pdf-frame";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer";
    frame.src = mediaUrl;
    wrap.appendChild(frame);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open document in new tab";
    wrap.appendChild(openBtn);
    const downloadBtn = document.createElement("a");
    downloadBtn.className = "message-swf-link";
    downloadBtn.href = mediaUrl;
    downloadBtn.download = attachment.name || "document";
    downloadBtn.textContent = "Download document";
    wrap.appendChild(downloadBtn);
    container.appendChild(wrap);
    return;
  }

  if (type === "rtf") {
    const pre = document.createElement("pre");
    pre.className = "message-text-file";
    pre.textContent = "Loading RTF preview…";
    wrap.appendChild(pre);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open RTF file";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    void loadTextAttachmentPreview(mediaUrl)
      .then((preview) => {
        pre.textContent = rtfToPlainText(preview) || "(empty file)";
      })
      .catch(() => {
        pre.textContent = "Could not load RTF preview.";
      });
    return;
  }

  if (type === "text") {
    const pre = document.createElement("pre");
    pre.className = "message-text-file";
    pre.textContent = "Loading text preview…";
    wrap.appendChild(pre);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open text file";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    void loadTextAttachmentPreview(mediaUrl)
      .then((preview) => {
        pre.textContent = preview || "(empty file)";
      })
      .catch(() => {
        pre.textContent = "Could not load preview.";
      });
    return;
  }

  if (type === "bin") {
    const pre = document.createElement("pre");
    pre.className = "message-text-file";
    pre.textContent = "Loading HEX preview…";
    wrap.appendChild(pre);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open binary file";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    void loadBinaryPreview(mediaUrl)
      .then((preview) => {
        pre.textContent = preview || "(empty file)";
      })
      .catch(() => {
        pre.textContent = "Could not load HEX preview.";
      });
    return;
  }

  const img = document.createElement("img");
  img.src = mediaUrl;
  img.loading = "lazy";
  img.alt = attachment.name || type.toUpperCase();
  img.addEventListener("click", () => {
    openMediaLightbox({ url: mediaUrl, label: attachment.name || type.toUpperCase() });
  });
  wrap.appendChild(img);
  container.appendChild(wrap);
}

function renderScreens() {
  const loggedIn = Boolean(state.currentAccountId);
  ui.loginScreen.classList.toggle("screen--active", !loggedIn);
  ui.chatScreen.classList.toggle("screen--active", loggedIn);
  if (!loggedIn) {
    syncLoginFieldsFromSessionPrefs();
    if (!loginLocalXmppProfilesLoadedOnce) {
      loginLocalXmppProfilesLoadedOnce = true;
      void loadLocalXmppProfiles();
    }
  }
  if (!loggedIn && ui.settingsScreen.classList.contains("settings-screen--active")) {
    closeSettingsScreen();
  }
}

function safeRender(reason = "runtime") {
  try {
    render();
  } catch (error) {
    console.error(`Render failed (${reason})`, error);
    renderScreens();
    showToast("UI refresh failed. Check console for details.", { tone: "error", duration: 2800 });
  }
}

function renderServers() {
  ui.serverList.innerHTML = "";
  ui.serverBrand.classList.toggle("active", getViewMode() === "dm");
  const currentAccount = getCurrentAccount();
  const dmStats = getTotalDmUnreadStats(currentAccount);
  if (ui.serverBrandBadge) {
    const count = dmStats.mentions > 0 ? dmStats.mentions : dmStats.unread;
    if (count > 0) {
      ui.serverBrandBadge.hidden = false;
      ui.serverBrandBadge.textContent = count > 99 ? "99+" : String(count);
      ui.serverBrandBadge.title = dmStats.mentions > 0
        ? `${dmStats.mentions} DM mention${dmStats.mentions === 1 ? "" : "s"}`
        : `${dmStats.unread} unread DM${dmStats.unread === 1 ? "" : "s"}`;
    } else {
      ui.serverBrandBadge.hidden = true;
      ui.serverBrandBadge.textContent = "";
      ui.serverBrandBadge.title = "";
    }
  }
  ensureFolderState();
  const renderGuildButton = (server) => {
    const button = document.createElement("button");
    button.className = `server-item ${server.id === state.activeGuildId ? "active" : ""}`;
    button.textContent = server.name.slice(0, 2).toUpperCase();
    const accent = (server.accentColor || "").trim();
    if (/^#[0-9a-f]{3,8}$/i.test(accent)) {
      button.style.background = server.id === state.activeGuildId ? accent : "";
    }
    const guildStats = getGuildUnreadStats(server, currentAccount);
    button.title = guildStats.unread > 0
      ? `${server.name} (${guildStats.unread} unread${guildStats.mentions ? `, ${guildStats.mentions} mentions` : ""})`
      : [server.name, (server.description || "").trim()].filter(Boolean).join(" • ");
    if (guildStats.unread > 0) {
      const dot = document.createElement("span");
      dot.className = `server-unread-pill ${guildStats.mentions > 0 ? "server-unread-pill--mention" : ""}`;
      if (guildStats.mentions > 0) {
        dot.textContent = guildStats.mentions > 9 ? "9+" : String(guildStats.mentions);
      }
      button.appendChild(dot);
    }
    button.addEventListener("click", () => {
      openGuildById(server.id);
    });
    button.addEventListener("contextmenu", (event) => {
      const currentUser = getCurrentAccount();
      const guildNotifMode = getGuildNotificationMode(server.id);
      openContextMenu(event, [
        {
          label: "Open Guild",
          action: () => {
            openGuildById(server.id);
          }
        },
        {
          label: "Copy",
          submenu: [
            { label: "Guild Name", action: () => copyText(server.name || "") },
            { label: "Guild ID", action: () => copyText(server.id) },
            { label: "First Channel ID", action: () => copyText(getFirstOpenableChannelIdForGuild(server) || "") },
            { label: "Guild Link", action: () => copyText(buildChannelPermalink(server.id, getFirstOpenableChannelIdForGuild(server) || "")) }
          ]
        },
        {
          label: "Rename Guild",
          disabled: !currentUser || !hasServerPermission(server, currentUser.id, "manageChannels"),
          action: () => renameGuildById(server.id)
        },
        {
          label: "Guild Settings",
          disabled: !currentUser || !hasServerPermission(server, currentUser.id, "manageChannels"),
          action: () => openGuildSettingsDialog(server)
        },
        {
          label: "Create Folder With Guild",
          action: () => {
            const folderName = prompt("Folder name", "New Folder");
            if (typeof folderName !== "string") return;
            const cleaned = folderName.trim().slice(0, 24);
            if (!cleaned) return;
            const folder = { id: createId(), name: cleaned, guildIds: [], collapsed: false };
            state.guildFolders.push(folder);
            assignGuildToFolder(server.id, folder.id);
            saveState();
            renderServers();
          }
        },
        {
          label: "Move To Folder…",
          disabled: state.guildFolders.length === 0,
          action: () => {
            const folderNames = state.guildFolders.map((folder, index) => `${index + 1}. ${folder.name}`).join("\n");
            const pick = prompt(`Choose folder number:\n${folderNames}`, "1");
            const index = Math.max(1, Number(pick || 0)) - 1;
            const folder = state.guildFolders[index];
            if (!folder) return;
            assignGuildToFolder(server.id, folder.id);
            saveState();
            renderServers();
          }
        },
        {
          label: "Remove From Folder",
          disabled: !getFolderForGuild(server.id),
          action: () => {
            removeGuildFromFolders(server.id);
            saveState();
            renderServers();
          }
        },
        {
          label: "Create Channel",
          disabled: !currentUser || !hasServerPermission(server, currentUser.id, "manageChannels"),
          action: () => {
            state.activeGuildId = server.id;
            state.activeChannelId = getFirstOpenableChannelIdForGuild(server);
            ui.channelNameInput.value = "";
            ui.channelTypeInput.value = "text";
            ui.createChannelDialog.showModal();
          }
        },
        {
          label: "Mark Guild Read",
          disabled: !currentUser || getGuildUnreadStats(server, currentUser).unread === 0,
          action: () => {
            if (!currentUser) return;
            if (!markGuildRead(server, currentUser.id)) return;
            saveState();
            renderServers();
            renderChannels();
          }
        },
        {
          label: `Notifications: ${guildNotifMode === "mute" ? "Muted" : guildNotifMode === "mentions" ? "Mentions" : "All"}`,
          disabled: true,
          action: () => {}
        },
        {
          label: "Notify: All Messages",
          action: () => {
            setGuildNotificationMode(server.id, "all");
            saveState();
            renderServers();
            renderChannels();
            renderSettingsScreen();
          }
        },
        {
          label: "Notify: Mentions Only",
          action: () => {
            setGuildNotificationMode(server.id, "mentions");
            saveState();
            renderServers();
            renderChannels();
            renderSettingsScreen();
          }
        },
        {
          label: "Notify: Mute Guild",
          action: () => {
            setGuildNotificationMode(server.id, "mute");
            saveState();
            renderServers();
            renderChannels();
            renderSettingsScreen();
          }
        },
        {
          label: "Delete Guild",
          danger: true,
          disabled: state.guilds.length <= 1 || !currentUser || !hasServerPermission(server, currentUser.id, "administrator"),
          action: () => deleteGuildById(server.id)
        }
      ]);
    });
    ui.serverList.appendChild(button);
  };

  state.guildFolders.forEach((folder) => {
    const label = document.createElement("button");
    label.type = "button";
    label.className = "server-folder-label";
    label.textContent = `${folder.collapsed ? "▸" : "▾"} ${folder.name}`;
    label.title = folder.name;
    label.addEventListener("click", () => {
      folder.collapsed = !folder.collapsed;
      saveState();
      renderServers();
    });
    ui.serverList.appendChild(label);
    if (folder.collapsed) return;
    folder.guildIds
      .map((guildId) => state.guilds.find((guild) => guild.id === guildId))
      .filter(Boolean)
      .forEach((guild) => renderGuildButton(guild));
  });

  const folderGuildIds = new Set(state.guildFolders.flatMap((folder) => folder.guildIds));
  state.guilds
    .filter((guild) => !folderGuildIds.has(guild.id))
    .forEach((guild) => renderGuildButton(guild));
}

function renderDmList() {
  ui.dmList.innerHTML = "";
  const currentAccount = getCurrentAccount();
  if (!currentAccount) return;
  if (ui.toggleDmSectionBtn) {
    const heading = ui.toggleDmSectionBtn.querySelector("span");
    const unreadTotals = getTotalDmUnreadStats(currentAccount);
    const draftCount = countDraftsForCurrentAccountDms(currentAccount);
    const chunks = ["Direct Messages"];
    if (unreadTotals.unread > 0) chunks.push(unreadTotals.unread > 99 ? "99+" : String(unreadTotals.unread));
    if (draftCount > 0) chunks.push(`${draftCount} drafts`);
    if (heading) heading.textContent = chunks.join(" • ");
  }
  const filter = dmSearchTerm.trim().toLowerCase();
  if (ui.dmSearchInput && ui.dmSearchInput.value !== dmSearchTerm) ui.dmSearchInput.value = dmSearchTerm;
  const threads = state.dmThreads
    .filter((thread) => Array.isArray(thread.participantIds) && thread.participantIds.includes(currentAccount.id))
    .filter((thread) => {
      if (!filter) return true;
      const peerId = thread.participantIds.find((id) => id !== currentAccount.id);
      const peer = peerId ? getAccountById(peerId) : null;
      const username = (peer?.username || "").toLowerCase();
      const display = (peer?.displayName || "").toLowerCase();
      const nick = resolveAccountGuildNickname(peer, getActiveGuild()?.id || "").toLowerCase();
      return username.includes(filter) || display.includes(filter) || nick.includes(filter);
    })
    .sort((a, b) => {
      const aTs = toTimestampMs(a.messages?.[a.messages.length - 1]?.ts || 0);
      const bTs = toTimestampMs(b.messages?.[b.messages.length - 1]?.ts || 0);
      return bTs - aTs;
    })
    .slice(0, 80);
  if (threads.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = filter ? "No DMs match your search." : "No direct messages yet.";
    ui.dmList.appendChild(empty);
    return;
  }
  threads.forEach((thread) => {
    const peerId = thread.participantIds.find((id) => id !== currentAccount.id);
    const peer = peerId ? getAccountById(peerId) : null;
    const button = document.createElement("button");
    button.className = `channel-item channel-item--dm ${state.activeDmId === thread.id ? "active" : ""}`;
    const avatar = document.createElement("div");
    avatar.className = "channel-dm-avatar";
    if (peer) {
      applyAvatarStyle(avatar, peer, null);
      const dot = document.createElement("span");
      dot.className = `presence-dot presence-${normalizePresence(peer.presence)}`;
      avatar.appendChild(dot);
    } else {
      avatar.textContent = "?";
    }
    button.appendChild(avatar);
    const label = document.createElement("span");
    label.className = "channel-item__name";
    label.textContent = peer ? `@${peer.username}` : "Unknown DM";
    const content = document.createElement("span");
    content.className = "channel-item__meta";
    content.appendChild(label);
    const lastMessage = thread.messages?.[thread.messages.length - 1] || null;
    const preview = document.createElement("span");
    preview.className = "channel-item__preview";
    if (!lastMessage) {
      preview.textContent = "No messages yet.";
    } else {
      const sender = lastMessage.userId === currentAccount.id ? "You" : (peer ? peer.username : "Unknown");
      const text = (lastMessage.text || "").replace(/\s+/g, " ").trim();
      preview.textContent = `${sender}: ${text || "(attachment)"}`.slice(0, 66);
    }
    content.appendChild(preview);
    button.appendChild(content);
    const unread = getDmUnreadStats(thread, currentAccount);
    const hasDraft = hasDraftForConversation(thread.id);
    if (unread.unread > 0) {
      const badge = document.createElement("span");
      badge.className = `channel-badge ${unread.mentions > 0 ? "channel-badge--mention" : ""}`;
      badge.textContent = unread.unread > 99 ? "99+" : String(unread.unread);
      button.appendChild(badge);
    } else if (hasDraft) {
      const draftBadge = document.createElement("span");
      draftBadge.className = "channel-badge channel-badge--draft";
      draftBadge.textContent = "Draft";
      button.appendChild(draftBadge);
      button.classList.add("channel-item--draft");
    }
    if (hasDraft) {
      button.title = `${button.title ? `${button.title} • ` : ""}Has unsent draft`;
    }
    button.addEventListener("click", () => {
      state.viewMode = "dm";
      state.activeDmId = thread.id;
      saveState();
      renderMessages();
      renderChannels();
      renderMemberList();
    });
    button.addEventListener("contextmenu", (event) => {
      openContextMenu(event, [
        {
          label: "Open DM",
          action: () => {
            state.viewMode = "dm";
            state.activeDmId = thread.id;
            saveState();
            renderMessages();
            renderChannels();
          }
        },
        {
          label: "Mark DM Read",
          disabled: unread.unread === 0,
          action: () => {
            if (!markDmRead(thread, currentAccount.id)) return;
            saveState();
            renderDmList();
            renderChannels();
          }
        },
        {
          label: "Copy",
          submenu: [
            { label: "Peer Username", action: () => copyText(peer ? `@${peer.username}` : "") },
            { label: "Thread ID", action: () => copyText(thread.id) },
            { label: "Peer User ID", action: () => copyText(peer?.id || "") }
          ]
        },
        {
          label: "Close DM",
          danger: true,
          action: () => {
            state.dmThreads = state.dmThreads.filter((entry) => entry.id !== thread.id);
            if (state.activeDmId === thread.id) state.activeDmId = null;
            saveState();
            render();
          }
        }
      ]);
    });
    ui.dmList.appendChild(button);
  });
  updateDocumentTitle();
}

function renderChannels() {
  renderDmList();
  const dmMode = getViewMode() === "dm";
  const prefs = getPreferences();
  ui.dmSection.classList.toggle("panel-section--hidden", !dmMode);
  ui.guildSection.classList.toggle("panel-section--hidden", dmMode);
  ui.dmSection.classList.toggle("panel-section--collapsed", prefs.collapseDmSection === "on");
  ui.guildSection.classList.toggle("panel-section--collapsed", prefs.collapseGuildSection === "on");
  if (ui.openGuildSettingsBtn) ui.openGuildSettingsBtn.hidden = dmMode;
  const server = getActiveServer();
  ui.channelList.innerHTML = "";
  if (dmMode) {
    ui.activeServerName.textContent = "Direct Messages";
    return;
  }
  if (!server) {
    ui.activeServerName.textContent = "No guild";
    return;
  }
  const currentAccount = getCurrentAccount();
  if (ui.toggleGuildSectionBtn) {
    const heading = ui.toggleGuildSectionBtn.querySelector("span");
    const guildStats = getGuildUnreadStats(server, currentAccount);
    const draftCount = countDraftsForGuildChannels(server);
    const chunks = ["Channels"];
    if (guildStats.unread > 0) chunks.push(guildStats.unread > 99 ? "99+" : String(guildStats.unread));
    if (draftCount > 0) chunks.push(`${draftCount} drafts`);
    if (heading) heading.textContent = chunks.join(" • ");
  }

  const notificationMode = getGuildNotificationMode(server.id);
  const filter = channelFilterTerm.trim().toLowerCase();
  if (ui.channelFilterInput && ui.channelFilterInput.value !== channelFilterTerm) {
    ui.channelFilterInput.value = channelFilterTerm;
  }
  ui.activeServerName.textContent = server.name;
  ui.activeServerName.title = [server.name, (server.description || "").trim()].filter(Boolean).join(" • ");
  if (ui.openGuildSettingsBtn) {
    const current = getCurrentAccount();
    const canManage = Boolean(current && hasServerPermission(server, current.id, "manageChannels"));
    ui.openGuildSettingsBtn.disabled = !canManage;
    ui.openGuildSettingsBtn.title = canManage ? "Guild settings" : "Manage Channels permission required";
  }
  if (!currentAccount) return;
  const visibleChannels = server.channels.filter((channel) => canAccountViewChannel(server, channel, currentAccount.id));
  if (!visibleChannels.some((entry) => entry.id === state.activeChannelId)) {
    state.activeChannelId = visibleChannels[0]?.id || null;
  }
  const channelsToRender = visibleChannels.filter((channel) => !filter || channel.name.toLowerCase().includes(filter));
  if (channelsToRender.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = filter ? "No channels match your filter." : "No accessible channels in this guild.";
    ui.channelList.appendChild(empty);
  }
  channelsToRender.forEach((channel) => {
    const button = document.createElement("button");
    button.className = `channel-item ${channel.id === state.activeChannelId ? "active" : ""}`;
    const icon = document.createElement("span");
    icon.className = "channel-item__icon";
    icon.textContent = channelTypeSymbol(channel);
    button.appendChild(icon);
    const label = document.createElement("span");
    label.className = "channel-item__name";
    label.textContent = channel.name;
    button.appendChild(label);
    const hasDraft = hasDraftForConversation(channel.id);
    const unreadStats = applyGuildNotificationModeToStats(
      getChannelUnreadStats(channel, currentAccount),
      notificationMode
    );
    if (channel.type === "voice" || channel.type === "stage") {
      ensureVoiceStateForChannel(channel);
      const connectedCount = channel.voiceState.connectedIds.length;
      if (connectedCount > 0) {
        const liveBadge = document.createElement("span");
        liveBadge.className = "channel-badge channel-badge--live";
        if (channel.type === "stage") {
          const speakerCount = channel.voiceState.speakerIds.length;
          const raisedCount = channel.voiceState.raisedHandIds.length;
          liveBadge.textContent = `${connectedCount} · S${speakerCount} Q${raisedCount}`;
        } else {
          liveBadge.textContent = `${connectedCount} live`;
        }
        button.appendChild(liveBadge);
      }
    }
    if (unreadStats.mentions > 0) {
      const mentionBadge = document.createElement("span");
      mentionBadge.className = "channel-badge channel-badge--mention";
      mentionBadge.textContent = unreadStats.mentions > 99 ? "99+" : String(unreadStats.mentions);
      button.appendChild(mentionBadge);
      button.classList.add("channel-item--unread");
    } else if (unreadStats.unread > 0) {
      const unreadBadge = document.createElement("span");
      unreadBadge.className = "channel-badge channel-badge--dot";
      unreadBadge.textContent = "";
      button.appendChild(unreadBadge);
      button.classList.add("channel-item--unread");
    } else if (hasDraft) {
      const draftBadge = document.createElement("span");
      draftBadge.className = "channel-badge channel-badge--draft";
      draftBadge.textContent = "Draft";
      button.appendChild(draftBadge);
      button.classList.add("channel-item--draft");
    }
    if (hasDraft) {
      button.title = `${button.title ? `${button.title} • ` : ""}Has unsent draft`;
    }
    button.addEventListener("click", () => {
      state.viewMode = "guild";
      state.activeChannelId = channel.id;
      state.activeDmId = null;
      rememberGuildChannelSelection(server.id, channel.id);
      saveState();
      renderMessages();
      renderChannels();
    });
    button.addEventListener("contextmenu", (event) => {
      const menuItems = [
        {
          label: "Open Channel",
          action: () => {
            state.viewMode = "guild";
            state.activeChannelId = channel.id;
            state.activeDmId = null;
            rememberGuildChannelSelection(server.id, channel.id);
            saveState();
            renderMessages();
            renderChannels();
          }
        },
        ...(channel.type === "voice" || channel.type === "stage"
          ? [
            {
              label: (() => {
                const current = getCurrentAccount();
                ensureVoiceStateForChannel(channel);
                const joined = Boolean(current && channel.voiceState.connectedIds.includes(current.id));
                return joined ? "Leave Call" : "Join Call";
              })(),
              disabled: !getCurrentAccount(),
              action: () => {
                const current = getCurrentAccount();
                if (!current) return;
                ensureVoiceStateForChannel(channel);
                const joined = channel.voiceState.connectedIds.includes(current.id);
                const changed = joined
                  ? leaveVoiceLikeChannel(channel, current.id)
                  : joinVoiceLikeChannel(channel, current.id);
                if (!changed) return;
                state.activeChannelId = channel.id;
                saveState();
                render();
              }
            },
            {
              label: (() => {
                const current = getCurrentAccount();
                ensureVoiceStateForChannel(channel);
                if (!current || !channel.voiceState.connectedIds.includes(current.id)) return "Mute Self";
                return channel.voiceState.mutedIds.includes(current.id) ? "Unmute Self" : "Mute Self";
              })(),
              disabled: (() => {
                const current = getCurrentAccount();
                if (!current) return true;
                ensureVoiceStateForChannel(channel);
                return !channel.voiceState.connectedIds.includes(current.id);
              })(),
              action: () => {
                const current = getCurrentAccount();
                if (!current) return;
                if (!toggleVoiceMuteForSelf(channel, current.id)) return;
                saveState();
                render();
              }
            },
            {
              label: "Voice Status",
              action: () => {
                ensureVoiceStateForChannel(channel);
                const speakers = channel.type === "stage" ? channel.voiceState.speakerIds.length : 0;
                const queue = channel.type === "stage" ? channel.voiceState.raisedHandIds.length : 0;
                showToast([
                  `${channel.voiceState.connectedIds.length} connected`,
                  channel.type === "stage" ? `${speakers} speakers` : "",
                  channel.type === "stage" ? `${queue} queue` : ""
                ].filter(Boolean).join(" · "));
              }
            }
          ]
          : []),
        {
          label: "Copy",
          submenu: [
            { label: "Channel Name", action: () => copyText(`#${channel.name}`) },
            { label: "Channel Topic", action: () => copyText(channel.topic || "") },
            { label: "Channel ID", action: () => copyText(channel.id) },
            { label: "Channel Link", action: () => copyText(buildChannelPermalink(server.id, channel.id)) }
          ]
        },
        {
          label: "Mark Channel Read",
          disabled: !currentAccount || unreadStats.unread === 0,
          action: () => {
            if (!currentAccount) return;
            if (!markChannelRead(channel, currentAccount.id)) return;
            saveState();
            renderServers();
            renderChannels();
          }
        },
        {
          label: "Slowmode",
          disabled: !canCurrentUser("manageChannels"),
          submenu: [
            { label: "Off", action: () => { channel.slowmodeSec = 0; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } },
            { label: "5s", action: () => { channel.slowmodeSec = 5; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } },
            { label: "15s", action: () => { channel.slowmodeSec = 15; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } },
            { label: "30s", action: () => { channel.slowmodeSec = 30; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } },
            { label: "60s", action: () => { channel.slowmodeSec = 60; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } }
          ]
        },
        {
          label: "Rename Channel",
          disabled: !canCurrentUser("manageChannels"),
          action: () => {
            state.activeChannelId = channel.id;
            openChannelSettings();
          }
        },
        {
          label: "Duplicate Channel",
          disabled: !canCurrentUser("manageChannels"),
          action: () => {
            const clone = duplicateChannelInGuild(server, channel);
            if (!clone) return;
            state.activeChannelId = clone.id;
            saveState();
            render();
          }
        },
        {
          label: "Move Up",
          disabled: !canCurrentUser("manageChannels") || server.channels[0]?.id === channel.id,
          action: () => {
            if (!moveChannelByOffset(server, channel.id, -1)) return;
            saveState();
            renderChannels();
          }
        },
        {
          label: "Move Down",
          disabled: !canCurrentUser("manageChannels") || server.channels[server.channels.length - 1]?.id === channel.id,
          action: () => {
            if (!moveChannelByOffset(server, channel.id, 1)) return;
            saveState();
            renderChannels();
          }
        },
        {
          label: "Delete Channel",
          danger: true,
          disabled: !canCurrentUser("manageChannels") || server.channels.length <= 1,
          action: () => {
            state.activeChannelId = channel.id;
            ui.deleteChannelBtn.click();
          }
        }
      ];
      if (channel.type === "forum") {
        menuItems.splice(menuItems.length - 1, 0, {
          label: "Forum Tags",
          disabled: !canCurrentUser("manageChannels"),
          submenu: [
            {
              label: "Add Tag…",
              action: () => {
                const raw = prompt("Forum tag name", "discussion");
                if (typeof raw !== "string") return;
                const name = sanitizeForumTagName(raw);
                if (!name) return;
                channel.forumTags = forumTagsForChannel(channel);
                if (resolveForumTagByName(channel, name)) return;
                channel.forumTags.push({ id: createId(), name, color: "#5865f2" });
                saveState();
                renderMessages();
              }
            },
            ...forumTagsForChannel(channel).map((tag) => ({
              label: `Remove ${tag.name}`,
              action: () => {
                channel.forumTags = forumTagsForChannel(channel).filter((entry) => entry.id !== tag.id);
                channel.messages.forEach((message) => {
                  message.forumTagIds = normalizeThreadTagIds(message.forumTagIds, channel.forumTags);
                });
                saveState();
                renderMessages();
              }
            }))
          ]
        });
      }
      openContextMenu(event, menuItems);
    });
    ui.channelList.appendChild(button);
  });
  if (channelsToRender.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No channels match your filter.";
    ui.channelList.appendChild(empty);
  }
  updateDocumentTitle();
}

function hiddenMessagesBelowCount() {
  const rows = [...ui.messageList.querySelectorAll(".message")];
  if (rows.length === 0) return 0;
  const listRect = ui.messageList.getBoundingClientRect();
  let hidden = 0;
  rows.forEach((row) => {
    const rect = row.getBoundingClientRect();
    if (rect.top > listRect.bottom - 8) hidden += 1;
  });
  return hidden;
}

function updateJumpToBottomButton() {
  if (!ui.jumpToBottomBtn) return;
  const distanceFromBottom = ui.messageList.scrollHeight - ui.messageList.scrollTop - ui.messageList.clientHeight;
  const nearBottom = distanceFromBottom < 36;
  if (nearBottom) {
    ui.jumpToBottomBtn.classList.add("jump-to-bottom--hidden");
    ui.jumpToBottomBtn.textContent = "Jump to present";
    return;
  }
  const hiddenCount = hiddenMessagesBelowCount();
  ui.jumpToBottomBtn.textContent = hiddenCount > 0
    ? `${hiddenCount > 99 ? "99+" : hiddenCount} below`
    : "Jump to present";
  ui.jumpToBottomBtn.classList.remove("jump-to-bottom--hidden");
}

function openUserPopout(account, fallbackName = "Unknown") {
  const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
  const displayName = account ? displayNameForAccount(account, guildId) : fallbackName;
  const bio = account?.bio?.trim() || "No bio yet.";
  const current = getCurrentAccount();
  selectedUserPopoutId = account?.id || null;

  ui.userPopoutName.textContent = displayName;
  const activeServer = getActiveConversation()?.type === "channel" ? getActiveServer() : null;
  const userRoleColor = account?.id && activeServer ? getMemberTopRoleColor(activeServer, account.id) : "";
  ui.userPopoutName.style.color = userRoleColor || "";
  applyNameplateStyle(ui.userPopoutName, account);
  const userTag = accountGuildTag(account);
  if (userTag) {
    ui.userPopoutName.appendChild(document.createTextNode(" "));
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "guild-tag-chip";
    chip.textContent = userTag;
    chip.title = "Guild tag";
    chip.addEventListener("click", () => showGuildTagInfo(account));
    ui.userPopoutName.appendChild(chip);
  }
  ui.userPopoutStatus.textContent = account ? displayStatus(account, guildId) : "Offline";
  ui.userPopoutBio.textContent = bio;
  applyAvatarStyle(ui.userPopoutAvatar, account, guildId);
  applyAvatarDecoration(ui.userPopoutAvatar, account);
  applyBannerStyle(ui.userPopoutBanner, resolveAccountBanner(account, guildId));
  ui.userPopoutDialog.classList.remove("profile-effect-aurora", "profile-effect-flame", "profile-effect-ocean");
  const userEffect = accountProfileEffect(account);
  if (userEffect !== "none") ui.userPopoutDialog.classList.add(`profile-effect-${userEffect}`);
  renderRoleChips(ui.userPopoutRoles, account?.id);
  renderQuestBadges(ui.userPopoutRoles, account?.id);
  if (ui.userNoteInput) {
    ui.userNoteInput.value = current && selectedUserPopoutId ? getUserNote(current.id, selectedUserPopoutId) : "";
    ui.userNoteInput.disabled = !selectedUserPopoutId;
  }
  if (ui.userStartDmBtn) ui.userStartDmBtn.disabled = !account?.id || account.id === current?.id;
  if (ui.userSaveNoteBtn) ui.userSaveNoteBtn.disabled = !selectedUserPopoutId || !current;
  if (ui.userSendDmBtn) ui.userSendDmBtn.disabled = !account?.id || account.id === current?.id || !current;
  if (ui.userDmInput) ui.userDmInput.value = "";
  if (account?.id && current && account.id !== current.id && ui.userDmInput) ui.userDmInput.focus();
  ui.userPopoutDialog.showModal();
}

function forumMessageParts(message) {
  const rawText = typeof message?.text === "string" ? message.text : "";
  if (message?.forumTitle) {
    return { title: message.forumTitle, body: rawText };
  }
  const [firstLine, ...rest] = rawText.split("\n");
  const title = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
  const body = rest.join("\n").trim();
  return { title, body: body || firstLine || "" };
}

function setReplyTarget(conversationId, message, threadId = null) {
  replyTarget = {
    channelId: conversationId,
    messageId: message.id,
    authorName: displayNameForMessage(message),
    text: message.text || "",
    threadId: threadId || null
  };
  renderReplyComposer();
  ui.messageInput.focus();
}

function renderForumThreads(conversationId, channel, messages, currentAccount) {
  const currentUser = currentAccount;
  const activeFindId = getFindActiveMessageId();
  const activeConversation = getActiveConversation();
  channel.forumTags = forumTagsForChannel(channel);
  const forumTags = channel.forumTags;
  const activeTagFilter = getForumThreadTagFilter(channel?.id).filter((id) => forumTags.some((tag) => tag.id === id));
  const topLevel = messages.filter((message) => !message.forumThreadId);
  const repliesByThread = new Map();
  const channelLastReadMs = toTimestampMs(channel?.readState?.[currentAccount?.id]);
  messages.forEach((message) => {
    if (!message.forumThreadId) return;
    if (!repliesByThread.has(message.forumThreadId)) repliesByThread.set(message.forumThreadId, []);
    repliesByThread.get(message.forumThreadId).push(message);
  });

  const threadSortMode = getForumThreadSortMode(channel?.id);
  let threadModels = topLevel.map((post) => {
    const replies = (repliesByThread.get(post.id) || []).slice().sort((a, b) => toTimestampMs(a.ts) - toTimestampMs(b.ts));
    const latestTsMs = replies.reduce((maxTs, replyMessage) => Math.max(maxTs, toTimestampMs(replyMessage.ts)), toTimestampMs(post.ts));
    const postTagIds = normalizeThreadTagIds(post.forumTagIds, forumTags);
    return { post, replies, latestTsMs, postTagIds };
  });
  if (activeTagFilter.length > 0) {
    threadModels = threadModels.filter((entry) => activeTagFilter.some((tagId) => entry.postTagIds.includes(tagId)));
  }
  threadModels.sort((a, b) => {
    if (threadSortMode === "created") return toTimestampMs(b.post.ts) - toTimestampMs(a.post.ts);
    return b.latestTsMs - a.latestTsMs;
  });

  if (threadModels.length > 0) {
    const toolbar = document.createElement("div");
    toolbar.className = "forum-thread-toolbar";

    const sortBtn = document.createElement("button");
    sortBtn.type = "button";
    sortBtn.className = "forum-thread-toolbar__btn";
    sortBtn.textContent = threadSortMode === "created" ? "Sort: Created time" : "Sort: Latest activity";
    sortBtn.addEventListener("click", () => {
      const nextMode = threadSortMode === "created" ? "latest" : "created";
      setForumThreadSortMode(channel?.id, nextMode);
      saveState();
      renderMessages();
    });
    toolbar.appendChild(sortBtn);

    const collapseAllBtn = document.createElement("button");
    collapseAllBtn.type = "button";
    collapseAllBtn.className = "forum-thread-toolbar__btn";
    collapseAllBtn.textContent = "Collapse all";
    collapseAllBtn.addEventListener("click", () => {
      threadModels.forEach(({ post, replies }) => {
        if (replies.length > 0) setForumThreadCollapsed(channel?.id, post.id, true);
      });
      saveState();
      renderMessages();
    });
    toolbar.appendChild(collapseAllBtn);

    const expandAllBtn = document.createElement("button");
    expandAllBtn.type = "button";
    expandAllBtn.className = "forum-thread-toolbar__btn";
    expandAllBtn.textContent = "Expand all";
    expandAllBtn.addEventListener("click", () => {
      threadModels.forEach(({ post, replies }) => {
        if (replies.length > 0) setForumThreadCollapsed(channel?.id, post.id, false);
      });
      saveState();
      renderMessages();
    });
    toolbar.appendChild(expandAllBtn);

    const markAllReadBtn = document.createElement("button");
    markAllReadBtn.type = "button";
    markAllReadBtn.className = "forum-thread-toolbar__btn";
    markAllReadBtn.textContent = "Mark all threads read";
    markAllReadBtn.addEventListener("click", () => {
      threadModels.forEach(({ post, replies }) => {
        const latestThreadTs = replies[replies.length - 1]?.ts || post.ts || new Date().toISOString();
        setForumThreadReadTimestamp(channel?.id, post.id, latestThreadTs);
      });
      saveState();
      renderMessages();
      renderChannels();
    });
    toolbar.appendChild(markAllReadBtn);

    if (forumTags.length > 0) {
      const tagWrap = document.createElement("div");
      tagWrap.className = "forum-tag-filter";
      forumTags.forEach((tag) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = `forum-tag-chip ${activeTagFilter.includes(tag.id) ? "active" : ""}`;
        chip.textContent = tag.name;
        chip.style.setProperty("--tag-color", tag.color || "#5865f2");
        chip.title = `Filter by ${tag.name}`;
        chip.addEventListener("click", () => {
          toggleForumThreadTagFilter(channel?.id, tag.id);
          saveState();
          renderMessages();
        });
        tagWrap.appendChild(chip);
      });
      if (activeTagFilter.length > 0) {
        const clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.className = "forum-thread-toolbar__btn";
        clearBtn.textContent = "Clear Tag Filter";
        clearBtn.addEventListener("click", () => {
          setForumThreadTagFilter(channel?.id, []);
          saveState();
          renderMessages();
        });
        tagWrap.appendChild(clearBtn);
      }
      toolbar.appendChild(tagWrap);
    }

    ui.messageList.appendChild(toolbar);
  }

  if (threadModels.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = activeTagFilter.length > 0
      ? "No threads match selected tags."
      : "No forum posts yet. Start with a post title on the first line.";
    ui.messageList.appendChild(empty);
  }

  threadModels.forEach(({ post, replies, postTagIds }) => {
    const postRow = document.createElement("article");
    postRow.className = "message message--forum message--forum-root";
    if (messageMatchesFindQuery(post, findQuery, "forum")) {
      postRow.classList.add("message--find-hit");
    }
    if (activeFindId && post.id === activeFindId) {
      postRow.classList.add("message--find-active");
    }
    if (isMessageHighlightedForAccount(post, currentAccount)) {
      postRow.classList.add("message--mentioned");
    }
    postRow.dataset.messageId = post.id;

    const head = document.createElement("div");
    head.className = "message-head";

    const userButton = document.createElement("button");
    userButton.className = "message-user";
    userButton.textContent = displayNameForMessage(post);
    if (channel && post.userId) {
      const roleColor = getMemberTopRoleColor(getActiveServer(), post.userId);
      if (roleColor) userButton.style.color = roleColor;
    }
    userButton.addEventListener("click", () => {
      const author = post.userId ? getAccountById(post.userId) : null;
      openUserPopout(author, post.authorName || "Unknown");
    });

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = formatTime(post.ts);
    time.title = formatFullTimestamp(post.ts);
    time.addEventListener("click", (event) => {
      if (!event.shiftKey) return;
      event.preventDefault();
      void copyText(post.ts || "").then((copied) => {
        showToast(copied ? "Timestamp copied." : "Failed to copy timestamp.", { tone: copied ? "info" : "error" });
      });
    });
    head.appendChild(userButton);
    head.appendChild(time);
    postRow.appendChild(head);

    const { title, body } = forumMessageParts(post);
    const forumTitle = document.createElement("div");
    forumTitle.className = "forum-post-title";
    forumTitle.textContent = "";
    const collapsed = isForumThreadCollapsed(channel?.id, post.id);
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "forum-thread-toggle";
    toggleBtn.textContent = collapsed ? "▸" : "▾";
    toggleBtn.title = collapsed ? "Expand thread" : "Collapse thread";
    const titleText = document.createElement("span");
    titleText.textContent = title;
    forumTitle.appendChild(toggleBtn);
    forumTitle.appendChild(titleText);
    if (postTagIds.length > 0) {
      const tagInline = document.createElement("span");
      tagInline.className = "forum-thread-tags";
      postTagIds.forEach((tagId) => {
        const tag = forumTags.find((entry) => entry.id === tagId);
        if (!tag) return;
        const chip = document.createElement("span");
        chip.className = "forum-tag-pill";
        chip.textContent = tag.name;
        chip.style.setProperty("--tag-color", tag.color || "#5865f2");
        tagInline.appendChild(chip);
      });
      forumTitle.appendChild(tagInline);
    }
    postRow.appendChild(forumTitle);

    if (body) {
      const text = document.createElement("div");
      text.className = "message-text";
      renderMessageText(text, body);
      postRow.appendChild(text);
    }
    renderMessagePoll(postRow, post, {
      currentUser,
      isDm: false,
      canManageMessages: canCurrentUser("manageMessages"),
      onChanged: () => {
        saveState();
        renderMessages();
      }
    });

    const postAttachments = normalizeAttachments([
      ...normalizeAttachments(post.attachments),
      ...extractInlineAttachmentsFromText(post.text)
    ]);
    postAttachments.forEach((attachment, index) => {
      renderMessageAttachment(postRow, attachment, { swfKey: `${post.id}:${index}` });
    });

    const postActions = document.createElement("div");
    postActions.className = "message-actions";
    const replyBtn = document.createElement("button");
    replyBtn.type = "button";
    replyBtn.className = "message-action-btn";
    replyBtn.textContent = "Reply";
    replyBtn.addEventListener("click", () => setReplyTarget(conversationId, post, post.id));
    postActions.appendChild(replyBtn);
    const quoteBtn = document.createElement("button");
    quoteBtn.type = "button";
    quoteBtn.className = "message-action-btn";
    quoteBtn.textContent = "Quote";
    quoteBtn.addEventListener("click", () => quoteMessageInComposer(post));
    postActions.appendChild(quoteBtn);
    const markUnreadBtn = document.createElement("button");
    markUnreadBtn.type = "button";
    markUnreadBtn.className = "message-action-btn";
    markUnreadBtn.textContent = "Mark Unread";
    markUnreadBtn.disabled = !currentAccount?.id;
    markUnreadBtn.addEventListener("click", () => {
      if (!currentAccount?.id) return;
      if (!markConversationUnreadFromMessage(activeConversation, post.id, currentAccount.id)) return;
      saveState();
      renderDmList();
      renderChannels();
      renderMessages();
    });
    postActions.appendChild(markUnreadBtn);
    const markReadBtn = document.createElement("button");
    markReadBtn.type = "button";
    markReadBtn.className = "message-action-btn";
    markReadBtn.textContent = "Mark Thread Read";
    markReadBtn.addEventListener("click", () => {
      const latestThreadTs = replies[replies.length - 1]?.ts || post.ts || new Date().toISOString();
      setForumThreadReadTimestamp(channel?.id, post.id, latestThreadTs);
      saveState();
      renderMessages();
      renderChannels();
    });
    postActions.appendChild(markReadBtn);
    postRow.appendChild(postActions);

    const threadReadMs = toTimestampMs(getForumThreadReadTimestamp(channel?.id, post.id));
    const effectiveReadMs = Math.max(channelLastReadMs, threadReadMs);
    const unreadReplies = replies.reduce((count, replyMessage) => {
      if (toTimestampMs(replyMessage.ts) <= effectiveReadMs) return count;
      if (replyMessage.userId && replyMessage.userId === currentAccount?.id) return count;
      return count + 1;
    }, 0);
    if (unreadReplies > 0) {
      const unreadBadge = document.createElement("span");
      unreadBadge.className = "forum-thread-unread";
      unreadBadge.textContent = unreadReplies > 99 ? "99+" : `${unreadReplies}`;
      unreadBadge.title = `${unreadReplies} unread replies`;
      forumTitle.appendChild(unreadBadge);
    }
    if (replies.length > 0) {
      const repliesWrap = document.createElement("div");
      repliesWrap.className = "forum-thread-replies";
      repliesWrap.hidden = collapsed;
      replies.forEach((replyMessage) => {
        const replyRow = document.createElement("article");
        replyRow.className = "message message--forum-reply";
        if (messageMatchesFindQuery(replyMessage, findQuery, "forum")) {
          replyRow.classList.add("message--find-hit");
        }
        if (activeFindId && replyMessage.id === activeFindId) {
          replyRow.classList.add("message--find-active");
        }
        if (isMessageHighlightedForAccount(replyMessage, currentAccount)) {
          replyRow.classList.add("message--mentioned");
        }
        replyRow.dataset.messageId = replyMessage.id;

        const replyHead = document.createElement("div");
        replyHead.className = "message-head";

        const replyUserButton = document.createElement("button");
        replyUserButton.className = "message-user";
        replyUserButton.textContent = displayNameForMessage(replyMessage);
        if (channel && replyMessage.userId) {
          const roleColor = getMemberTopRoleColor(getActiveServer(), replyMessage.userId);
          if (roleColor) replyUserButton.style.color = roleColor;
        }
        replyUserButton.addEventListener("click", () => {
          const author = replyMessage.userId ? getAccountById(replyMessage.userId) : null;
          openUserPopout(author, replyMessage.authorName || "Unknown");
        });

        const replyTime = document.createElement("span");
        replyTime.className = "message-time";
        replyTime.textContent = formatTime(replyMessage.ts);
        replyTime.title = formatFullTimestamp(replyMessage.ts);
        replyTime.addEventListener("click", (event) => {
          if (!event.shiftKey) return;
          event.preventDefault();
          void copyText(replyMessage.ts || "").then((copied) => {
            showToast(copied ? "Timestamp copied." : "Failed to copy timestamp.", { tone: copied ? "info" : "error" });
          });
        });
        replyHead.appendChild(replyUserButton);
        replyHead.appendChild(replyTime);
        replyRow.appendChild(replyHead);

        if (replyMessage.replyTo && typeof replyMessage.replyTo === "object") {
          const replyLine = document.createElement("div");
          replyLine.className = "message-reply";
          const replyName = document.createElement("strong");
          replyName.textContent = replyMessage.replyTo.authorName || "Unknown";
          const replyText = document.createElement("span");
          replyText.textContent = replyMessage.replyTo.text?.trim()?.slice(0, 90) || "(empty message)";
          replyLine.appendChild(document.createTextNode("Replying to "));
          replyLine.appendChild(replyName);
          replyLine.appendChild(document.createTextNode(": "));
          replyLine.appendChild(replyText);
          if (replyMessage.replyTo.messageId) {
            replyLine.title = "Jump to referenced message";
            replyLine.classList.add("message-reply--jump");
            replyLine.addEventListener("click", () => {
              const ok = focusMessageById(replyMessage.replyTo.messageId);
              if (!ok) showToast("Referenced message is not visible in this view.");
            });
          }
          replyRow.appendChild(replyLine);
        }

        const replyText = document.createElement("div");
        replyText.className = "message-text";
        renderMessageText(replyText, replyMessage.text || "");
        replyRow.appendChild(replyText);
        renderMessagePoll(replyRow, replyMessage, {
          currentUser,
          isDm: false,
          canManageMessages: canCurrentUser("manageMessages"),
          onChanged: () => {
            saveState();
            renderMessages();
          }
        });

        const replyAttachments = normalizeAttachments([
          ...normalizeAttachments(replyMessage.attachments),
          ...extractInlineAttachmentsFromText(replyMessage.text)
        ]);
        replyAttachments.forEach((attachment, index) => {
          renderMessageAttachment(replyRow, attachment, { swfKey: `${replyMessage.id}:${index}` });
        });

        const replyActions = document.createElement("div");
        replyActions.className = "message-actions";
        const replyReplyBtn = document.createElement("button");
        replyReplyBtn.type = "button";
        replyReplyBtn.className = "message-action-btn";
        replyReplyBtn.textContent = "Reply";
        replyReplyBtn.addEventListener("click", () => setReplyTarget(conversationId, replyMessage, post.id));
        replyActions.appendChild(replyReplyBtn);
        const replyQuoteBtn = document.createElement("button");
        replyQuoteBtn.type = "button";
        replyQuoteBtn.className = "message-action-btn";
        replyQuoteBtn.textContent = "Quote";
        replyQuoteBtn.addEventListener("click", () => quoteMessageInComposer(replyMessage));
        replyActions.appendChild(replyQuoteBtn);
        const replyUnreadBtn = document.createElement("button");
        replyUnreadBtn.type = "button";
        replyUnreadBtn.className = "message-action-btn";
        replyUnreadBtn.textContent = "Mark Unread";
        replyUnreadBtn.disabled = !currentAccount?.id;
        replyUnreadBtn.addEventListener("click", () => {
          if (!currentAccount?.id) return;
          if (!markConversationUnreadFromMessage(activeConversation, replyMessage.id, currentAccount.id)) return;
          saveState();
          renderDmList();
          renderChannels();
          renderMessages();
        });
        replyActions.appendChild(replyUnreadBtn);
        replyRow.appendChild(replyActions);
        replyRow.addEventListener("contextmenu", (event) => {
          openContextMenu(event, [
            {
              label: "Reply in Thread",
              action: () => setReplyTarget(conversationId, replyMessage, post.id)
            },
            {
              label: "Quote in Composer",
              action: () => quoteMessageInComposer(replyMessage)
            },
            {
              label: "Mark Unread From Here",
              disabled: !currentAccount?.id,
              action: () => {
                if (!currentAccount?.id) return;
                if (!markConversationUnreadFromMessage(activeConversation, replyMessage.id, currentAccount.id)) return;
                saveState();
                renderDmList();
                renderChannels();
                renderMessages();
              }
            },
            {
              label: "Copy Reply ID",
              action: () => copyText(replyMessage.id || "")
            }
          ]);
        });

        repliesWrap.appendChild(replyRow);
      });
      postRow.appendChild(repliesWrap);
      toggleBtn.addEventListener("click", () => {
        const nextCollapsed = !repliesWrap.hidden;
        repliesWrap.hidden = nextCollapsed;
        toggleBtn.textContent = nextCollapsed ? "▸" : "▾";
        toggleBtn.title = nextCollapsed ? "Expand thread" : "Collapse thread";
        setForumThreadCollapsed(channel?.id, post.id, nextCollapsed);
        saveState();
      });
    } else {
      toggleBtn.disabled = true;
      toggleBtn.classList.add("forum-thread-toggle--disabled");
    }
    postRow.addEventListener("contextmenu", (event) => {
      const canManageMessages = currentUser ? canCurrentUser("manageMessages") : false;
      openContextMenu(event, [
        {
          label: "Reply in Thread",
          action: () => setReplyTarget(conversationId, post, post.id)
        },
        {
          label: "Quote in Composer",
          action: () => quoteMessageInComposer(post)
        },
        {
          label: "Mark Thread Read",
          action: () => {
            const latestThreadTs = replies[replies.length - 1]?.ts || post.ts || new Date().toISOString();
            setForumThreadReadTimestamp(channel?.id, post.id, latestThreadTs);
            saveState();
            renderMessages();
            renderChannels();
          }
        },
        {
          label: "Mark Unread From Here",
          disabled: !currentAccount?.id,
          action: () => {
            if (!currentAccount?.id) return;
            if (!markConversationUnreadFromMessage(activeConversation, post.id, currentAccount.id)) return;
            saveState();
            renderDmList();
            renderChannels();
            renderMessages();
          }
        },
        {
          label: replies.length > 0 && !isForumThreadCollapsed(channel?.id, post.id) ? "Collapse Thread" : "Expand Thread",
          disabled: replies.length === 0,
          action: () => {
            if (replies.length === 0) return;
            const nextCollapsed = !isForumThreadCollapsed(channel?.id, post.id);
            setForumThreadCollapsed(channel?.id, post.id, nextCollapsed);
            saveState();
            renderMessages();
          }
        },
        {
          label: "Thread Tags",
          submenu: [
            {
              label: "Clear Tags",
              action: () => {
                post.forumTagIds = [];
                saveState();
                renderMessages();
              }
            },
            ...forumTags.map((tag) => ({
              label: `${postTagIds.includes(tag.id) ? "✓ " : ""}${tag.name}`,
              action: () => {
                const next = postTagIds.includes(tag.id)
                  ? postTagIds.filter((id) => id !== tag.id)
                  : [...postTagIds, tag.id];
                post.forumTagIds = normalizeThreadTagIds(next, forumTags);
                saveState();
                renderMessages();
              }
            }))
          ]
        },
        {
          label: normalizePoll(post.poll)?.closed ? "Reopen Poll" : "Close Poll",
          disabled: !canManagePollMessage(post, { isDm: false, canManageMessages, currentUser }),
          action: () => {
            const next = normalizePoll(post.poll);
            if (!next) return;
            post.poll = { ...next, closed: !next.closed };
            saveState();
            renderMessages();
          }
        },
        {
          label: "Copy Poll Results",
          disabled: !normalizePoll(post.poll),
          action: () => copyText(formatPollResultsText(post))
        },
        {
          label: "Copy",
          submenu: [
            { label: "Thread Post ID", action: () => copyText(post.id || "") },
            { label: "Markdown Quote", action: () => copyText(`> ${(post.text || "").replace(/\n/g, "\n> ")}`) },
            { label: "Post JSON", action: () => copyText(serializeMessageAsJson(post)) }
          ]
        }
      ]);
    });

    ui.messageList.appendChild(postRow);
  });

  ui.messageList.scrollTop = ui.messageList.scrollHeight;
}

function renderDmHome() {
  const current = getCurrentAccount();
  setActiveChannelHeader("Friends", "@", "Friends");
  setActiveChannelTopic("Direct Messages");
  ui.messageInput.placeholder = "Pick a DM to start chatting";
  if (ui.markChannelReadBtn) ui.markChannelReadBtn.hidden = true;
  if (ui.nextUnreadBtn) ui.nextUnreadBtn.hidden = true;
  if (ui.openPinsBtn) ui.openPinsBtn.textContent = "Pins";
  if (ui.openGuildSettingsBtn) ui.openGuildSettingsBtn.hidden = true;
  ui.messageList.innerHTML = "";
  const shell = document.createElement("section");
  shell.className = "dm-home";
  const title = document.createElement("h3");
  title.textContent = "Direct Messages";
  shell.appendChild(title);
  const subtitle = document.createElement("p");
  subtitle.textContent = "Pick a conversation or start a new DM.";
  shell.appendChild(subtitle);
  const list = document.createElement("div");
  list.className = "dm-home__list";
  const threads = state.dmThreads
    .filter((thread) => Array.isArray(thread.participantIds) && current && thread.participantIds.includes(current.id))
    .slice()
    .sort((a, b) => {
      const aTs = toTimestampMs(a.messages[a.messages.length - 1]?.ts || "");
      const bTs = toTimestampMs(b.messages[b.messages.length - 1]?.ts || "");
      return bTs - aTs;
    });
  if (threads.length === 0) {
    const empty = document.createElement("div");
    empty.className = "dm-home__empty";
    empty.textContent = "No DMs yet. Use + New DM in the sidebar.";
    list.appendChild(empty);
  } else {
    threads.forEach((thread) => {
      const peerId = thread.participantIds.find((id) => id !== current?.id);
      const peer = peerId ? getAccountById(peerId) : null;
      const card = document.createElement("button");
      card.type = "button";
      card.className = "dm-home__item";
      const last = thread.messages[thread.messages.length - 1];
      const avatar = document.createElement("div");
      avatar.className = "dm-home__avatar";
      if (peer) {
        applyAvatarStyle(avatar, peer, null);
        applyAvatarDecoration(avatar, peer);
        const dot = document.createElement("span");
        dot.className = `presence-dot presence-${normalizePresence(peer.presence)}`;
        avatar.appendChild(dot);
      } else {
        avatar.textContent = "?";
      }
      const body = document.createElement("div");
      body.className = "dm-home__body";
      const top = document.createElement("div");
      top.className = "dm-home__top";
      const name = document.createElement("strong");
      name.textContent = `@${peer?.username || "unknown"}`;
      const ts = document.createElement("small");
      ts.className = "dm-home__time";
      ts.textContent = last?.ts ? formatTime(last.ts) : "";
      top.appendChild(name);
      top.appendChild(ts);
      const preview = document.createElement("small");
      preview.textContent = (last?.text || "(no messages)").slice(0, 80);
      body.appendChild(top);
      body.appendChild(preview);
      card.appendChild(avatar);
      card.appendChild(body);
      card.addEventListener("click", () => {
        state.viewMode = "dm";
        state.activeDmId = thread.id;
        saveState();
        render();
      });
      list.appendChild(card);
    });
  }
  shell.appendChild(list);
  ui.messageList.appendChild(shell);
  updateJumpToBottomButton();
  renderComposerMeta();
}

function renderVoiceStageSurface(channel) {
  if (!channel) return;
  const guild = getActiveGuild();
  const current = getCurrentAccount();
  if (!guild || !current) return;
  ensureVoiceStateForChannel(channel);
  const isConnected = channel.voiceState.connectedIds.includes(current.id);
  const isMuted = channel.voiceState.mutedIds.includes(current.id);
  const hasRaised = channel.voiceState.raisedHandIds.includes(current.id);
  const isSpeaker = channel.voiceState.speakerIds.includes(current.id);
  const canModerateStage = channel.type === "stage" && canModerateStageChannel(channel);

  const shell = document.createElement("section");
  shell.className = "voice-stage";
  const title = document.createElement("h3");
  title.textContent = channel.type === "stage" ? "Stage Channel" : "Voice Channel";
  const subtitle = document.createElement("p");
  subtitle.textContent = channel.type === "stage"
    ? "Join the stage to listen. Raise your hand to request speaking."
    : "Join voice and use mute controls for this channel.";
  shell.appendChild(title);
  shell.appendChild(subtitle);

  const stats = document.createElement("div");
  stats.className = "voice-stage__stats";
  const listenersChip = document.createElement("span");
  listenersChip.textContent = `${channel.voiceState.connectedIds.length} connected`;
  stats.appendChild(listenersChip);
  if (channel.type === "stage") {
    const speakersChip = document.createElement("span");
    speakersChip.textContent = `${channel.voiceState.speakerIds.length} speakers`;
    stats.appendChild(speakersChip);
    const queueChip = document.createElement("span");
    queueChip.textContent = `${channel.voiceState.raisedHandIds.length} queue`;
    stats.appendChild(queueChip);
  }
  shell.appendChild(stats);

  const controls = document.createElement("div");
  controls.className = "voice-stage__controls";

  const joinBtn = document.createElement("button");
  joinBtn.type = "button";
  joinBtn.textContent = isConnected ? "Leave Channel" : "Join Channel";
  joinBtn.addEventListener("click", () => {
    const changed = isConnected
      ? leaveVoiceLikeChannel(channel, current.id)
      : joinVoiceLikeChannel(channel, current.id);
    if (!changed) return;
    saveState();
    renderMessages();
    renderMemberList();
  });
  controls.appendChild(joinBtn);

  const muteBtn = document.createElement("button");
  muteBtn.type = "button";
  muteBtn.textContent = isMuted ? "Unmute" : "Mute";
  muteBtn.disabled = !isConnected;
  muteBtn.addEventListener("click", () => {
    if (!toggleVoiceMuteForSelf(channel, current.id)) return;
    saveState();
    renderMessages();
    renderMemberList();
  });
  controls.appendChild(muteBtn);

  const copyLinkBtn = document.createElement("button");
  copyLinkBtn.type = "button";
  copyLinkBtn.textContent = "Copy Channel Link";
  copyLinkBtn.addEventListener("click", () => {
    const guild = getActiveGuild();
    if (!guild) return;
    const link = buildChannelPermalink(guild.id, channel.id);
    void copyText(link).then((ok) => {
      showToast(ok ? "Channel link copied." : "Failed to copy channel link.", { tone: ok ? "info" : "error" });
    });
  });
  controls.appendChild(copyLinkBtn);

  if (channel.type === "stage") {
    const handBtn = document.createElement("button");
    handBtn.type = "button";
    handBtn.textContent = hasRaised ? "Lower Hand" : "Raise Hand";
    handBtn.disabled = !isConnected;
    handBtn.addEventListener("click", () => {
      if (!toggleRaisedHandForSelf(channel, current.id)) return;
      saveState();
      renderMessages();
      renderMemberList();
    });
    controls.appendChild(handBtn);

    if (canModerateStage) {
      const speakerBtn = document.createElement("button");
      speakerBtn.type = "button";
      speakerBtn.textContent = isSpeaker ? "Leave Speaker" : "Become Speaker";
      speakerBtn.disabled = !isConnected;
      speakerBtn.addEventListener("click", () => {
        if (!toggleStageSpeaker(channel, current.id)) return;
        saveState();
        renderMessages();
        renderMemberList();
      });
      controls.appendChild(speakerBtn);
    }
  }
  shell.appendChild(controls);

  const list = document.createElement("div");
  list.className = "voice-stage__list";
  const connected = channel.voiceState.connectedIds
    .map((id) => getAccountById(id))
    .filter(Boolean);
  if (connected.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "Nobody is connected yet.";
    list.appendChild(empty);
  } else {
    connected.forEach((account) => {
      const row = document.createElement("div");
      row.className = "voice-stage__member";
      const name = document.createElement("strong");
      name.textContent = displayNameForAccount(account, guild.id);
      const flags = [];
      if (channel.voiceState.mutedIds.includes(account.id)) flags.push("Muted");
      if (channel.type === "stage" && channel.voiceState.speakerIds.includes(account.id)) flags.push("Speaker");
      if (channel.type === "stage" && channel.voiceState.raisedHandIds.includes(account.id)) flags.push("Hand Raised");
      const meta = document.createElement("small");
      meta.textContent = flags.length > 0 ? flags.join(" · ") : "Listening";
      row.appendChild(name);
      row.appendChild(meta);
      list.appendChild(row);
    });
  }
  shell.appendChild(list);

  if (channel.type === "stage" && canModerateStage) {
    const mod = document.createElement("section");
    mod.className = "voice-stage__moderation";
    const modTitle = document.createElement("h4");
    modTitle.textContent = "Stage Moderation";
    mod.appendChild(modTitle);

    const raised = channel.voiceState.raisedHandIds
      .map((id) => getAccountById(id))
      .filter(Boolean);
    const queue = document.createElement("div");
    queue.className = "voice-stage__queue";
    if (raised.length === 0) {
      const empty = document.createElement("small");
      empty.textContent = "No raised hands.";
      queue.appendChild(empty);
    } else {
      raised.forEach((account) => {
        const row = document.createElement("div");
        row.className = "voice-stage__queue-row";
        const label = document.createElement("strong");
        label.textContent = displayNameForAccount(account, guild.id);
        row.appendChild(label);

        const approve = document.createElement("button");
        approve.type = "button";
        approve.textContent = "Approve";
        approve.addEventListener("click", () => {
          ensureVoiceStateForChannel(channel);
          const changed = setStageSpeakerState(channel, account.id, true);
          if (!changed) return;
          addVoiceActivity(channel, current.id, "approved", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(approve);

        const deny = document.createElement("button");
        deny.type = "button";
        deny.textContent = "Dismiss";
        deny.addEventListener("click", () => {
          ensureVoiceStateForChannel(channel);
          const changed = setStageRaisedHandState(channel, account.id, false);
          if (!changed) return;
          addVoiceActivity(channel, current.id, "dismissed", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(deny);
        queue.appendChild(row);
      });
    }
    mod.appendChild(queue);

    const participants = connected.filter((account) => account.id !== current.id);
    const people = document.createElement("div");
    people.className = "voice-stage__queue";
    if (participants.length > 0) {
      participants.forEach((account) => {
        const row = document.createElement("div");
        row.className = "voice-stage__queue-row";
        const label = document.createElement("strong");
        label.textContent = displayNameForAccount(account, guild.id);
        row.appendChild(label);

        const memberMuted = channel.voiceState.mutedIds.includes(account.id);
        const memberSpeaker = channel.voiceState.speakerIds.includes(account.id);

        const muteBtnMember = document.createElement("button");
        muteBtnMember.type = "button";
        muteBtnMember.textContent = memberMuted ? "Unmute" : "Mute";
        muteBtnMember.addEventListener("click", () => {
          const changed = setVoiceMuteState(channel, account.id, !memberMuted);
          if (!changed) return;
          addVoiceActivity(channel, current.id, memberMuted ? "unmute" : "mute", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(muteBtnMember);

        const speakerBtnMember = document.createElement("button");
        speakerBtnMember.type = "button";
        speakerBtnMember.textContent = memberSpeaker ? "Demote" : "Promote";
        speakerBtnMember.addEventListener("click", () => {
          const changed = setStageSpeakerState(channel, account.id, !memberSpeaker);
          if (!changed) return;
          addVoiceActivity(channel, current.id, memberSpeaker ? "demoted" : "promoted", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(speakerBtnMember);

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "Disconnect";
        removeBtn.addEventListener("click", () => {
          if (!leaveVoiceLikeChannel(channel, account.id)) return;
          addVoiceActivity(channel, current.id, "disconnected", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(removeBtn);
        people.appendChild(row);
      });
    }
    mod.appendChild(people);
    shell.appendChild(mod);
  }

  const activityRows = (channel.voiceState.activity || []).slice(-6).reverse();
  if (activityRows.length > 0) {
    const activity = document.createElement("section");
    activity.className = "voice-stage__activity";
    const activityTitle = document.createElement("h4");
    activityTitle.textContent = "Live Activity";
    activity.appendChild(activityTitle);
    const activityList = document.createElement("div");
    activityList.className = "voice-stage__activity-list";
    activityRows.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "voice-stage__activity-row";
      const label = document.createElement("small");
      label.textContent = describeVoiceActivity(entry, guild);
      const ts = document.createElement("span");
      ts.textContent = formatTime(entry.ts);
      row.appendChild(label);
      row.appendChild(ts);
      activityList.appendChild(row);
    });
    activity.appendChild(activityList);
    shell.appendChild(activity);
  }
  ui.messageList.appendChild(shell);
  updateJumpToBottomButton();
  renderComposerMeta();
}

function renderMessages() {
  const conversation = getActiveConversation();
  const isDm = conversation?.type === "dm";
  const channel = !isDm ? conversation?.channel : null;
  const dmThread = isDm ? conversation?.thread : null;
  syncRelayRoomForActiveConversation();
  const conversationId = conversation?.id || null;
  syncComposerDraftConversation(conversationId);
  const messageBucket = isDm ? (dmThread?.messages || []) : (channel?.messages || []);
  const activeFindId = getFindActiveMessageId();
  const liveSwfKeys = collectLiveSwfRuntimeKeys();
  swfRuntimes.forEach((runtime, key) => {
    if (key === currentViewerRuntimeKey) return;
    if (runtime.inPip || runtime.pipTransitioning) return;
    if (liveSwfKeys.has(key)) {
      parkSwfRuntimeHost(runtime);
      return;
    }
    if (runtime.observer) runtime.observer.disconnect();
    if (runtime.host instanceof HTMLElement) runtime.host.remove();
    swfRuntimes.delete(key);
    removeSwfPipTab(key);
    if (swfSoloRuntimeKey === key) swfSoloRuntimeKey = null;
    swfPendingUi.delete(key);
    swfPendingAudio.delete(key);
  });
  refreshSwfAudioFocus();
  ui.messageList.innerHTML = "";
  if (getViewMode() === "dm" && !dmThread) {
    renderDmHome();
    return;
  }
  if (isDm && dmThread) {
    const current = getCurrentAccount();
    const peerId = dmThread.participantIds.find((id) => id !== current?.id);
    const peer = peerId ? getAccountById(peerId) : null;
    setActiveChannelHeader(peer ? peer.username : "dm", "@", peer ? `@${peer.username}` : "@dm");
    setActiveChannelTopic("Direct Message");
    ui.messageInput.placeholder = peer ? `Message @${peer.username}` : "Message DM";
  } else {
    const guild = getActiveGuild();
    const current = getCurrentAccount();
    if (channel && guild && current && !canAccountViewChannel(guild, channel, current.id)) {
      const fallbackId = getFirstOpenableChannelIdForGuild(guild);
      state.activeChannelId = fallbackId;
      if (fallbackId && fallbackId !== channel.id) {
        saveState();
        renderMessages();
        renderChannels();
        return;
      }
      setActiveChannelHeader("no-access", "#", "No accessible channels");
      setActiveChannelTopic("You do not have access to view channels in this guild.");
      ui.messageList.innerHTML = "";
      const empty = document.createElement("div");
      empty.className = "channel-empty";
      empty.textContent = "No accessible channels. Ask an admin to allow View Channel.";
      ui.messageList.appendChild(empty);
      ui.messageInput.placeholder = "No channel access";
      updateJumpToBottomButton();
      renderComposerMeta();
      return;
    }
    setActiveChannelHeader(channel ? channel.name : "none", channelHeaderGlyph(channel, "channel"), channel ? `#${channel.name}` : "#none");
    setActiveChannelTopic(channel?.topic?.trim() || "");
    if (channel?.type === "forum") {
      ui.messageInput.placeholder = channel ? `New post in ${channelTypePrefix(channel)} ${channel.name} (title on first line)` : "No channel selected";
    } else if (channel?.type === "announcement") {
      ui.messageInput.placeholder = channel ? `Announcement ${channelTypePrefix(channel)} ${channel.name}` : "No channel selected";
    } else if (channel?.type === "voice") {
      ui.messageInput.placeholder = channel ? `Voice controls in ${channelTypePrefix(channel)} ${channel.name}` : "No channel selected";
    } else if (channel?.type === "stage") {
      ui.messageInput.placeholder = channel ? `Stage controls in ${channelTypePrefix(channel)} ${channel.name}` : "No channel selected";
    } else {
      ui.messageInput.placeholder = channel ? `Message ${channelTypePrefix(channel)} ${channel.name}` : "No channel selected";
    }
  }
  if (!conversationId || (replyTarget && replyTarget.channelId !== conversationId)) {
    replyTarget = null;
  }
  renderReplyComposer();
  renderSlashSuggestions();

  if (!conversationId) {
    updateJumpToBottomButton();
    return;
  }
  if (!isDm && (channel?.type === "voice" || channel?.type === "stage")) {
    renderVoiceStageSurface(channel);
    return;
  }
  if (!isDm && channel?.type === "forum") {
    renderForumThreads(conversationId, channel, messageBucket, getCurrentAccount());
    return;
  }

  const currentAccount = getCurrentAccount();
  const unreadStats = !isDm ? getChannelUnreadStats(channel, currentAccount) : { unread: 0, mentions: 0 };
  const dmUnreadStats = isDm && dmThread && currentAccount ? getDmUnreadStats(dmThread, currentAccount) : { unread: 0, mentions: 0 };
  const firstUnreadMessageId = !isDm ? findFirstUnreadMessageId(channel, currentAccount) : null;
  const guildUnreadChannels = !isDm ? listUnreadGuildChannels(getActiveGuild(), currentAccount) : [];
  const channelPinnedCount = !isDm ? messageBucket.filter((message) => message.pinned).length : 0;
  if (ui.openPinsBtn) {
    ui.openPinsBtn.textContent = channelPinnedCount > 0 ? `Pins (${channelPinnedCount})` : "Pins";
  }
  if (ui.markChannelReadBtn) {
    ui.markChannelReadBtn.hidden = false;
    const canMark = isDm ? dmUnreadStats.unread > 0 : unreadStats.unread > 0;
    ui.markChannelReadBtn.disabled = !currentAccount || !canMark;
    ui.markChannelReadBtn.classList.toggle("chat-topic-edit--active", canMark);
    if (isDm && dmUnreadStats.unread > 0) {
      ui.markChannelReadBtn.textContent = `Mark DM Read (${dmUnreadStats.unread > 99 ? "99+" : dmUnreadStats.unread})`;
    } else if (!isDm && unreadStats.unread > 0) {
      ui.markChannelReadBtn.textContent = `Mark Read (${unreadStats.unread > 99 ? "99+" : unreadStats.unread})`;
    } else if (isDm) {
      ui.markChannelReadBtn.textContent = "Mark DM Read";
    } else {
      ui.markChannelReadBtn.textContent = "Mark Read";
    }
  }
  if (ui.nextUnreadBtn) {
    ui.nextUnreadBtn.hidden = isDm;
    ui.nextUnreadBtn.disabled = isDm || guildUnreadChannels.length === 0;
    ui.nextUnreadBtn.classList.toggle("chat-topic-edit--active", !isDm && guildUnreadChannels.length > 0);
    ui.nextUnreadBtn.textContent = guildUnreadChannels.length > 0
      ? `Next Unread (${guildUnreadChannels.length > 99 ? "99+" : guildUnreadChannels.length})`
      : "Next Unread";
  }
  const channelSlowmode = !isDm ? getChannelSlowmodeSeconds(channel) : 0;
  if (!isDm && channelSlowmode > 0) {
    const baseTopic = channel?.topic?.trim() || "";
    setActiveChannelTopic(baseTopic ? `${baseTopic} · ${formatSlowmodeLabel(channelSlowmode)}` : `${formatSlowmodeLabel(channelSlowmode)}`);
  }
  let unreadDividerMessageId = null;
  if (currentAccount && isDm && dmThread) {
    const lastReadMs = toTimestampMs(dmThread.readState?.[currentAccount.id]);
    const unreadMessage = messageBucket.find((message) => (
      toTimestampMs(message.ts) > lastReadMs && message.userId !== currentAccount.id
    ));
    unreadDividerMessageId = unreadMessage?.id || null;
  }
  let unreadDividerEl = null;
  if (isDm) {
    const tools = document.createElement("div");
    tools.className = "dm-thread-tools";
    const jumpNewestBtn = document.createElement("button");
    jumpNewestBtn.type = "button";
    jumpNewestBtn.textContent = "Jump to newest";
    jumpNewestBtn.addEventListener("click", () => {
      ui.messageList.scrollTop = ui.messageList.scrollHeight;
    });
    tools.appendChild(jumpNewestBtn);
    ui.messageList.appendChild(tools);
  } else if (currentAccount && unreadStats.unread > 0 && firstUnreadMessageId) {
    const divider = document.createElement("div");
    divider.className = "channel-unread-banner";
    const mentionPart = unreadStats.mentions > 0 ? `, ${unreadStats.mentions} mention${unreadStats.mentions === 1 ? "" : "s"}` : "";
    divider.textContent = `${unreadStats.unread} new message${unreadStats.unread === 1 ? "" : "s"}${mentionPart}`;
    const markBtn = document.createElement("button");
    markBtn.type = "button";
    markBtn.textContent = "Mark read";
    markBtn.addEventListener("click", () => {
      if (!markChannelRead(channel, currentAccount.id)) return;
      saveState();
      renderServers();
      renderChannels();
      renderMessages();
    });
    const jumpBtn = document.createElement("button");
    jumpBtn.type = "button";
    jumpBtn.textContent = "Jump";
    jumpBtn.addEventListener("click", () => {
      focusMessageById(firstUnreadMessageId);
    });
    divider.appendChild(markBtn);
    divider.appendChild(jumpBtn);
    ui.messageList.appendChild(divider);
  }

  let lastDayKey = "";
  let previousThreadMessage = null;
  messageBucket.forEach((message) => {
    const currentUser = getCurrentAccount();
    const dayKey = messageDateKey(message.ts);
    if (dayKey && dayKey !== lastDayKey) {
      ui.messageList.appendChild(createMessageDayDivider(message.ts));
      lastDayKey = dayKey;
      previousThreadMessage = null;
    }
    if (isDm && unreadDividerMessageId && unreadDividerMessageId === message.id) {
      const divider = document.createElement("div");
      divider.className = "dm-unread-divider";
      divider.textContent = "New messages";
      ui.messageList.appendChild(divider);
      unreadDividerEl = divider;
    }
    const messageRow = document.createElement("article");
    messageRow.className = `message ${!isDm && channel?.type === "forum" ? "message--forum" : ""}`;
    if (messageMatchesFindQuery(message, findQuery, isDm ? "dm" : "channel")) {
      messageRow.classList.add("message--find-hit");
    }
    if (activeFindId && message.id === activeFindId) {
      messageRow.classList.add("message--find-active");
    }
    if (isMessageHighlightedForAccount(message, currentAccount)) {
      messageRow.classList.add("message--mentioned");
    }
    const groupedWithPrevious = !(!isDm && channel?.type === "forum") && shouldGroupMessageWithPrevious(message, previousThreadMessage);
    if (groupedWithPrevious) messageRow.classList.add("message--grouped");
    messageRow.dataset.messageId = message.id;
    messageRow.dataset.ts = message.ts;
    messageRow.tabIndex = -1;
    messageRow.addEventListener("mousedown", () => {
      messageRow.focus({ preventScroll: true });
    });
    messageRow.addEventListener("dblclick", (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.target.closest("button, a, input, textarea, iframe, video, audio, .reaction-chip")) return;
      setReplyTarget(conversationId, message, message.forumThreadId || null);
    });
    let replyLine = null;

    const avatar = document.createElement("div");
    avatar.className = `message-avatar ${groupedWithPrevious ? "message-avatar--hidden" : ""}`;
    const author = message.userId ? getAccountById(message.userId) : null;
    const guildId = !isDm ? getActiveGuild()?.id || null : null;
    if (author) {
      applyAvatarStyle(avatar, author, guildId);
      applyAvatarDecoration(avatar, author);
    } else {
      avatar.textContent = initialsForName(displayNameForMessage(message));
    }
    avatar.title = displayNameForMessage(message);
    messageRow.appendChild(avatar);

    const head = document.createElement("div");
    head.className = "message-head";

    const userButton = document.createElement("button");
    userButton.className = "message-user";
    userButton.textContent = displayNameForMessage(message);
    if (!isDm && channel && message.userId) {
      const roleColor = getMemberTopRoleColor(getActiveServer(), message.userId);
      if (roleColor) userButton.style.color = roleColor;
    }
    userButton.addEventListener("click", () => {
      const author = message.userId ? getAccountById(message.userId) : null;
      openUserPopout(author, message.authorName || "Unknown");
    });
    userButton.addEventListener("contextmenu", (event) => {
      const author = message.userId ? getAccountById(message.userId) : null;
      openContextMenu(event, [
        {
          label: "View Profile",
          action: () => openUserPopout(author, message.authorName || "Unknown")
        },
        {
          label: "Start DM",
          disabled: !author || author.id === getCurrentAccount()?.id,
          action: () => {
            if (!author) return;
            openDmWithAccount(author);
          }
        },
        {
          label: "Mention User",
          disabled: !author,
          action: () => mentionInComposer(author)
        },
        {
          label: "Show Quest Summary",
          disabled: !author,
          action: () => {
            if (!author) return;
            showToast(formatQuestSummaryText(author.id));
          }
        },
        {
          label: "Copy",
          submenu: [
            {
              label: "Display Name",
              disabled: !author,
              action: () => copyText(author ? displayNameForAccount(author, getActiveGuild()?.id || null) : "")
            },
            {
              label: "Username",
              disabled: !author,
              action: () => copyText(author ? `@${author.username}` : "")
            },
            {
              label: "User ID",
              disabled: !author,
              action: () => copyText(author ? author.id : "")
            },
            {
              label: "Guild Tag",
              disabled: !author || !accountGuildTag(author),
              action: () => copyText(author ? accountGuildTag(author) : "")
            },
            {
              label: "Avatar Decoration",
              disabled: !author || !accountDecorationEmoji(author),
              action: () => copyText(author ? accountDecorationEmoji(author) : "")
            },
            {
              label: "Nameplate URL",
              disabled: !author || !accountNameplateSvg(author),
              action: () => copyText(author ? accountNameplateSvg(author) : "")
            }
          ]
        }
      ]);
    });
    if (author) {
      applyNameplateStyle(userButton, author);
    }
    const messageTag = accountGuildTag(author);
    let userTagButton = null;
    if (messageTag) {
      userTagButton = document.createElement("button");
      userTagButton.type = "button";
      userTagButton.className = "guild-tag-chip";
      userTagButton.textContent = messageTag;
      userTagButton.title = "Guild tag";
      userTagButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        showGuildTagInfo(author);
      });
    }

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = formatTime(message.ts);
    time.title = formatFullTimestamp(message.ts);
    time.addEventListener("click", (event) => {
      if (!event.shiftKey) return;
      event.preventDefault();
      void copyText(message.ts || "").then((copied) => {
        showToast(copied ? "Timestamp copied." : "Failed to copy timestamp.", { tone: copied ? "info" : "error" });
      });
    });
    let editedBadge = null;
    if (message.editedAt) {
      editedBadge = document.createElement("span");
      editedBadge.className = "message-edited";
      editedBadge.textContent = message.editedByStaff ? "(edited by staff)" : "(edited)";
      if (message.editedByName || message.editedByUserId) {
        editedBadge.title = `Last edited by ${message.editedByName || message.editedByUserId} at ${message.editedAt}`;
      }
    }
    let collaborativeBadge = null;
    if (message.collaborative) {
      collaborativeBadge = document.createElement("span");
      collaborativeBadge.className = "message-edited";
      collaborativeBadge.textContent = "✍ shared";
      collaborativeBadge.title = "Collaborative message: members can edit this message";
    }

    let forumTitle = null;
    let renderedText = message.text;
    if (!isDm && channel?.type === "forum") {
      const [firstLine, ...rest] = (message.text || "").split("\n");
      forumTitle = document.createElement("div");
      forumTitle.className = "forum-post-title";
      forumTitle.textContent = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
      const body = rest.join("\n").trim();
      renderedText = body || firstLine || "";
    }
    const text = document.createElement("div");
    text.className = "message-text";
    renderMessageText(text, renderedText);

    const imageUrl = extractImageUrl(message.text);
    let imagePreview = null;
    if (imageUrl) {
      imagePreview = document.createElement("img");
      imagePreview.className = "message-image-preview";
      imagePreview.src = imageUrl;
      imagePreview.alt = "shared image";
      imagePreview.loading = "lazy";
      imagePreview.addEventListener("click", () => {
        openMediaLightbox({ url: imageUrl, label: "Shared image" });
      });
    }
    const attachments = normalizeAttachments([
      ...normalizeAttachments(message.attachments),
      ...extractInlineAttachmentsFromText(message.text)
    ]);

    let pinIndicator = null;
    if (message.pinned) {
      pinIndicator = document.createElement("div");
      pinIndicator.className = "pin-indicator";
      pinIndicator.textContent = "Pinned message";
    }

    if (message.replyTo && typeof message.replyTo === "object") {
      replyLine = document.createElement("div");
      replyLine.className = "message-reply";
      const replyName = document.createElement("strong");
      replyName.textContent = message.replyTo.authorName || "Unknown";
      const replyText = document.createElement("span");
      replyText.textContent = message.replyTo.text?.trim()?.slice(0, 90) || "(empty message)";
      replyLine.appendChild(document.createTextNode("Replying to "));
      replyLine.appendChild(replyName);
      replyLine.appendChild(document.createTextNode(": "));
      replyLine.appendChild(replyText);
      if (message.replyTo.messageId) {
        replyLine.title = "Jump to referenced message";
        replyLine.classList.add("message-reply--jump");
        replyLine.addEventListener("click", () => {
          const ok = focusMessageById(message.replyTo.messageId);
          if (!ok) showToast("Referenced message is not visible in this view.");
        });
      }
    }

    const actionBar = document.createElement("div");
    actionBar.className = "message-actions";
    const canReact = isDm || canCurrentUserReactInChannel(channel, getActiveGuild());

    const reactBtn = document.createElement("button");
    reactBtn.type = "button";
    reactBtn.className = "message-action-btn";
    reactBtn.textContent = "React";
    reactBtn.disabled = !canReact;
    reactBtn.addEventListener("click", () => {
      if (!canReact) return;
      const pickerBtn = reactionPicker.querySelector("button");
      if (pickerBtn) pickerBtn.click();
    });
    actionBar.appendChild(reactBtn);

    const replyBtn = document.createElement("button");
    replyBtn.type = "button";
    replyBtn.className = "message-action-btn";
    replyBtn.textContent = "Reply";
    replyBtn.addEventListener("click", () => {
      setReplyTarget(conversationId, message, message.forumThreadId || null);
    });
    actionBar.appendChild(replyBtn);

    const quoteBtn = document.createElement("button");
    quoteBtn.type = "button";
    quoteBtn.className = "message-action-btn";
    quoteBtn.textContent = "Quote";
    quoteBtn.addEventListener("click", () => {
      quoteMessageInComposer(message);
    });
    actionBar.appendChild(quoteBtn);
    const markUnreadBtn = document.createElement("button");
    markUnreadBtn.type = "button";
    markUnreadBtn.className = "message-action-btn";
    markUnreadBtn.textContent = "Mark Unread";
    markUnreadBtn.disabled = !currentAccount?.id;
    markUnreadBtn.addEventListener("click", () => {
      if (!currentAccount?.id) return;
      if (!markConversationUnreadFromMessage(conversation, message.id, currentAccount.id)) return;
      saveState();
      renderDmList();
      renderChannels();
      renderMessages();
    });
    actionBar.appendChild(markUnreadBtn);

    const canPin = !isDm && currentUser && (message.userId === currentUser.id || canCurrentUser("manageMessages"));
    if (canPin) {
      const pinBtn = document.createElement("button");
      pinBtn.type = "button";
      pinBtn.className = "message-action-btn";
      pinBtn.textContent = message.pinned ? "Unpin" : "Pin";
      pinBtn.addEventListener("click", () => {
        const scopedChannel = findChannelById(channel.id);
        const scopedMessage = findMessageInChannel(scopedChannel, message.id);
        if (!scopedChannel || !scopedMessage) return;
        scopedMessage.pinned = !scopedMessage.pinned;
        saveState();
        renderMessages();
      });
      actionBar.appendChild(pinBtn);
    }

    const canManageMessages = isDm ? false : (currentUser ? canCurrentUser("manageMessages") : false);
    const isOwnMessage = currentUser && message.userId === currentUser.id;
    const canEditMessage = canEditMessageEntry(message, { isDm, canManageMessages, currentUser });
    if (canEditMessage) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "message-action-btn";
      editBtn.textContent = message.collaborative ? "Edit Shared" : "Edit";
      editBtn.addEventListener("click", () => openMessageEditor(conversationId, message.id, message.text));
      actionBar.appendChild(editBtn);

    }

    if (isOwnMessage || canManageMessages) {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "message-action-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        if (isDm && dmThread) {
          dmThread.messages = dmThread.messages.filter((entry) => entry.id !== message.id);
        } else {
          const scopedChannel = findChannelById(channel.id);
          if (!scopedChannel) return;
          scopedChannel.messages = scopedChannel.messages.filter((entry) => entry.id !== message.id);
        }
        saveState();
        renderMessages();
      });
      actionBar.appendChild(deleteBtn);
    }

    const reactions = document.createElement("div");
    reactions.className = "message-reactions";
    const normalizedReactions = normalizeReactions(message.reactions);
    normalizedReactions.forEach((item) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `reaction-chip ${currentUser && item.userIds.includes(currentUser.id) ? "active" : ""}`;
      chip.textContent = `${item.emoji} ${item.userIds.length}`;
      chip.disabled = !canReact;
      if (currentUser && canReact) {
        chip.addEventListener("click", () => {
          toggleReaction(message, item.emoji, currentUser.id);
          saveState();
          renderMessages();
        });
      }
      reactions.appendChild(chip);
    });

    const reactionPicker = document.createElement("div");
    reactionPicker.className = "reaction-picker";
    if (currentUser && canReact) {
      DEFAULT_REACTIONS.forEach((emoji) => {
        const pickerBtn = document.createElement("button");
        pickerBtn.type = "button";
        pickerBtn.textContent = emoji;
        pickerBtn.title = `React with ${emoji}`;
        pickerBtn.addEventListener("click", () => {
          toggleReaction(message, emoji, currentUser.id);
          saveState();
          renderMessages();
        });
        reactionPicker.appendChild(pickerBtn);
      });
    }

    head.appendChild(userButton);
    if (userTagButton) head.appendChild(userTagButton);
    head.appendChild(time);
    if (collaborativeBadge) head.appendChild(collaborativeBadge);
    if (editedBadge) head.appendChild(editedBadge);
    messageRow.appendChild(head);
    if (replyLine) messageRow.appendChild(replyLine);
    if (pinIndicator) messageRow.appendChild(pinIndicator);
    if (forumTitle) messageRow.appendChild(forumTitle);
    messageRow.appendChild(actionBar);
    messageRow.appendChild(text);
    renderMessagePoll(messageRow, message, {
      currentUser,
      isDm,
      canManageMessages,
      onChanged: () => {
        saveState();
        renderMessages();
      }
    });
    ui.messageList.appendChild(messageRow);
    if (imagePreview) messageRow.appendChild(imagePreview);
    attachments.forEach((attachment, index) => {
      renderMessageAttachment(messageRow, attachment, { swfKey: `${message.id}:${index}` });
    });
    messageRow.appendChild(reactions);
    messageRow.appendChild(reactionPicker);
    previousThreadMessage = message;
    const openMessageContextMenuAt = (event) => {
      const canManageMessages = currentUser ? canCurrentUser("manageMessages") : false;
      const isOwnMessage = currentUser && message.userId === currentUser.id;
      const canEditMessage = canEditMessageEntry(message, { isDm, canManageMessages, currentUser });
      const firstSwfAttachment = attachments.find((attachment) => attachment.type === "swf");
      const firstSwfIndex = attachments.findIndex((attachment) => attachment.type === "swf");
      const poll = normalizePoll(message.poll);
      const pollVoteSubmenu = poll && !poll.closed && currentUser
        ? poll.options.map((option, index) => ({
            label: `${index + 1}. ${option.label}`,
            action: () => {
              const changed = togglePollVote(message, option.id, currentUser.id);
              if (!changed) return;
              saveState();
              renderMessages();
            }
          }))
        : [];
      const menuItems = [
        {
          label: "Reply",
          action: () => {
            setReplyTarget(conversationId, message, message.forumThreadId || null);
          }
        },
        {
          label: "Quote in Composer",
          action: () => quoteMessageInComposer(message)
        },
        {
          label: "Poll",
          disabled: !poll,
          submenu: [
            {
              label: poll?.closed ? "Reopen Poll" : "Close Poll",
              disabled: !canManagePollMessage(message, { isDm, canManageMessages, currentUser }),
              action: () => {
                const next = normalizePoll(message.poll);
                if (!next) return;
                message.poll = { ...next, closed: !next.closed };
                saveState();
                renderMessages();
              }
            },
            {
              label: "Copy Poll Results",
              disabled: !poll,
              action: () => copyText(formatPollResultsText(message))
            },
            ...pollVoteSubmenu
          ]
        },
        {
          label: "Copy",
          submenu: [
            { label: "Text", action: () => copyText(message.text || "") },
            { label: "Markdown Quote", action: () => copyText(`> ${(message.text || "").replace(/\n/g, "\n> ")}`) },
            { label: "Author Username", action: () => {
              const author = message.userId ? getAccountById(message.userId) : null;
              copyText(author ? `@${author.username}` : "");
            } },
            { label: "Timestamp", action: () => copyText(message.ts || "") },
            { label: "Timestamp (local)", action: () => copyText(formatFullTimestamp(message.ts || "")) },
            { label: "Message Link", action: () => copyText(buildMessagePermalink(conversationId, message.id)) },
            { label: "Message ID", action: () => copyText(message.id || "") },
            { label: "First Attachment URL", action: () => copyText(attachments[0]?.url ? resolveMediaUrl(attachments[0].url) : "") },
            { label: "Edit History JSON", action: () => copyText(JSON.stringify(messageEditHistory(message), null, 2)) },
            { label: "JSON", action: () => copyText(serializeMessageAsJson(message)) },
            { label: "XML", action: () => copyText(serializeMessageAsXml(message)) }
          ]
        },
        {
          label: message.pinned ? "Unpin Message" : "Pin Message",
          disabled: isDm || !(currentUser && (message.userId === currentUser.id || canManageMessages)),
          action: () => {
            const scopedChannel = findChannelById(channel.id);
            const scopedMessage = findMessageInChannel(scopedChannel, message.id);
            if (!scopedChannel || !scopedMessage) return;
            scopedMessage.pinned = !scopedMessage.pinned;
            saveState();
            renderMessages();
          }
        },
        {
          label: "Mark Unread From Here",
          disabled: !currentAccount?.id,
          action: () => {
            if (!currentAccount?.id) return;
            if (!markConversationUnreadFromMessage(conversation, message.id, currentAccount.id)) return;
            saveState();
            renderDmList();
            renderChannels();
            renderMessages();
          }
        },
        {
          label: message.collaborative ? "Edit Shared Message" : "Edit Message",
          disabled: !canEditMessage,
          action: () => openMessageEditor(conversationId, message.id, message.text)
        },
        {
          label: "View Edit History",
          disabled: messageEditHistory(message).length === 0,
          action: () => {
            alert(formatMessageEditHistory(message));
          }
        },
        {
          label: "Delete Message",
          danger: true,
          disabled: !(isOwnMessage || canManageMessages),
          action: () => {
            if (isDm && dmThread) {
              dmThread.messages = dmThread.messages.filter((entry) => entry.id !== message.id);
            } else {
              const scopedChannel = findChannelById(channel.id);
              if (!scopedChannel) return;
              scopedChannel.messages = scopedChannel.messages.filter((entry) => entry.id !== message.id);
            }
            saveState();
            renderMessages();
          }
        }
      ];
      if (firstSwfAttachment) {
        menuItems.splice(2, 0, {
          label: "SWF",
          submenu: [
            {
              label: "Open in Viewer",
              action: () => {
                const runtimeKey = firstSwfIndex >= 0 ? `${message.id}:${firstSwfIndex}` : null;
                openSwfViewer(firstSwfAttachment, runtimeKey);
              }
            },
            {
              label: "FullScreen",
              action: async () => {
                const runtimeKey = firstSwfIndex >= 0 ? `${message.id}:${firstSwfIndex}` : null;
                const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
                const host = runtime?.host || messageRow.querySelector(".message-attachment--swf .message-swf-player");
                if (!host) return;
                await openSwfFullscreen(runtimeKey, host, firstSwfAttachment);
              }
            },
            {
              label: "Reset",
              action: () => {
                const runtimeKey = firstSwfIndex >= 0 ? `${message.id}:${firstSwfIndex}` : null;
                const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
                const host = runtime?.host || messageRow.querySelector(".message-attachment--swf .message-swf-player");
                if (!host) return;
                resetSwfRuntime(runtimeKey, host, firstSwfAttachment);
              }
            },
            {
              label: "Save to Shelf",
              action: () => {
                const saved = saveSwfToShelf(firstSwfAttachment);
                showToast(saved ? "SWF saved to shelf" : "SWF is already in shelf");
              }
            },
            {
              label: "Copy URL",
              action: async () => {
                const copied = await copyText(resolveMediaUrl(firstSwfAttachment.url));
                showToast(copied ? "SWF URL copied" : "Failed to copy SWF URL", { tone: copied ? "info" : "error" });
              }
            },
            {
              label: "Download",
              action: async () => {
                const ok = await downloadAttachmentFile(firstSwfAttachment, "swf");
                showToast(ok ? "SWF download started" : "SWF download failed", { tone: ok ? "info" : "error" });
              }
            }
          ]
        });
      }
      openContextMenu(event, menuItems);
    };
    messageRow.addEventListener("contextmenu", (event) => {
      if (shouldUseNativeContextMenu(event.target)) return;
      openMessageContextMenuAt(event);
    });
    messageRow.addEventListener("keydown", (event) => {
      const wantsContextMenu = event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);
      if (!wantsContextMenu) return;
      if (shouldUseNativeContextMenu(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = messageRow.getBoundingClientRect();
      const syntheticEvent = {
        preventDefault() {},
        stopPropagation() {},
        clientX: Math.max(8, Math.min(window.innerWidth - 8, Math.round(rect.left + 24))),
        clientY: Math.max(8, Math.min(window.innerHeight - 8, Math.round(rect.top + Math.min(rect.height, 30))))
      };
      openMessageContextMenuAt(syntheticEvent);
    });
  });

  if (isDm && unreadDividerEl) {
    unreadDividerEl.scrollIntoView({ block: "center" });
  } else {
    ui.messageList.scrollTop = ui.messageList.scrollHeight;
  }
  const hashRef = parseHashMessageReference();
  if (hashRef && hashRef.conversationId === conversationId) {
    focusMessageById(hashRef.messageId);
  }
  updateJumpToBottomButton();
  const didMarkRead = isDm ? markDmRead(dmThread, currentAccount?.id) : markChannelRead(channel, currentAccount?.id);
  if (currentAccount && didMarkRead) {
    saveState();
    renderServers();
    renderDmList();
    renderChannels();
  }
}

function appendMessageRowLite(channel, message) {
  if (!channel || !message) return;
  const currentUser = getCurrentAccount();
  const isDm = Boolean(channel.participantIds);
  const canManageMessages = !isDm && canCurrentUser("manageMessages");
  const previous = [...ui.messageList.querySelectorAll(".message")].at(-1);
  const previousTs = previous?.dataset?.ts || "";
  const prevKey = previousTs ? messageDateKey(previousTs) : "";
  const nextKey = messageDateKey(message.ts);
  if (nextKey && nextKey !== prevKey) {
    ui.messageList.appendChild(createMessageDayDivider(message.ts));
  }
  const messageRow = document.createElement("article");
  messageRow.className = "message";
  messageRow.dataset.messageId = message.id;
  messageRow.dataset.ts = message.ts;
  const head = document.createElement("div");
  head.className = "message-head";
  const userButton = document.createElement("button");
  userButton.className = "message-user";
  userButton.textContent = displayNameForMessage(message);
  const author = message.userId ? getAccountById(message.userId) : null;
  if (author) applyNameplateStyle(userButton, author);
  userButton.addEventListener("click", () => {
    openUserPopout(author, message.authorName || "Unknown");
  });
  const time = document.createElement("span");
  time.className = "message-time";
  time.textContent = formatTime(message.ts);
  time.title = formatFullTimestamp(message.ts);
  time.addEventListener("click", (event) => {
    if (!event.shiftKey) return;
    event.preventDefault();
    void copyText(message.ts || "").then((copied) => {
      showToast(copied ? "Timestamp copied." : "Failed to copy timestamp.", { tone: copied ? "info" : "error" });
    });
  });
  head.appendChild(userButton);
  const tag = accountGuildTag(author);
  if (tag) {
    const tagChip = document.createElement("button");
    tagChip.type = "button";
    tagChip.className = "guild-tag-chip";
    tagChip.textContent = tag;
    tagChip.title = "Guild tag";
    tagChip.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showGuildTagInfo(author);
    });
    head.appendChild(tagChip);
  }
  head.appendChild(time);
  messageRow.appendChild(head);
  const text = document.createElement("div");
  text.className = "message-text";
  renderMessageText(text, message.text);
  messageRow.appendChild(text);
  renderMessagePoll(messageRow, message, {
    currentUser,
    isDm,
    canManageMessages,
    onChanged: () => {
      saveState();
      renderMessages();
    }
  });
  const attachments = normalizeAttachments([
    ...normalizeAttachments(message.attachments),
    ...extractInlineAttachmentsFromText(message.text)
  ]);
  attachments.forEach((attachment, index) => {
    renderMessageAttachment(messageRow, attachment, { swfKey: `${message.id}:${index}` });
  });
  ui.messageList.appendChild(messageRow);
  ui.messageList.scrollTop = ui.messageList.scrollHeight;
  updateJumpToBottomButton();
  renderComposerMeta();
}

function renderMemberList() {
  const filter = memberSearchTerm.trim().toLowerCase();
  const presenceFilter = normalizeMemberPresenceFilter(memberPresenceFilter);
  if (ui.memberSearchInput && ui.memberSearchInput.value !== memberSearchTerm) {
    ui.memberSearchInput.value = memberSearchTerm;
  }
  ui.memberPresenceFilterButtons?.forEach((button) => {
    const active = button.dataset.memberFilter === presenceFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  const matchesMemberFilter = (account, guildId = null) => {
    if (!account) return false;
    const presence = normalizePresence(account.presence);
    if (presenceFilter === "online" && presence === "invisible") return false;
    if (presenceFilter === "offline" && presence !== "invisible") return false;
    if (!filter) return true;
    const haystack = [
      account.username,
      account.displayName,
      displayNameForAccount(account, guildId),
      displayStatus(account, guildId),
      presenceLabel(account.presence)
    ].join(" ").toLowerCase();
    return haystack.includes(filter);
  };
  const activeDm = getActiveDmThread();
  if (activeDm) {
    const current = getCurrentAccount();
    const dmAccounts = activeDm.participantIds
      .map((id) => getAccountById(id))
      .filter((account) => matchesMemberFilter(account, null));
    if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = `Members — ${dmAccounts.length}`;
    ui.memberList.innerHTML = "";
    const title = document.createElement("div");
    title.className = "member-group-title";
    title.textContent = "Direct Message";
    ui.memberList.appendChild(title);
    dmAccounts.forEach((account) => {
        const row = document.createElement("button");
        row.className = "member-item";
        const avatar = document.createElement("div");
        avatar.className = "member-avatar";
        applyAvatarStyle(avatar, account, null);
        applyAvatarDecoration(avatar, account);
        const dot = document.createElement("span");
        dot.className = `presence-dot presence-${normalizePresence(account.presence)}`;
        avatar.appendChild(dot);
        const meta = document.createElement("span");
        meta.className = "member-meta";
        const label = document.createElement("span");
        label.className = "member-meta__name";
        label.textContent = displayNameForAccount(account, null);
        applyNameplateStyle(label, account);
        const tag = accountGuildTag(account);
        if (tag) {
          const tagChip = document.createElement("span");
          tagChip.className = "guild-tag-chip";
          tagChip.textContent = tag;
          tagChip.title = "Guild tag";
          tagChip.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            showGuildTagInfo(account);
          });
          label.appendChild(document.createTextNode(" "));
          label.appendChild(tagChip);
        }
        const status = document.createElement("small");
        status.className = "member-meta__status";
        status.textContent = presenceLabel(account.presence);
        meta.appendChild(label);
        meta.appendChild(status);
        row.appendChild(avatar);
        row.appendChild(meta);
        row.addEventListener("click", () => openUserPopout(account));
        row.addEventListener("dblclick", () => mentionInComposer(account));
        row.addEventListener("contextmenu", (event) => {
          openContextMenu(event, [
            { label: "View Profile", action: () => openUserPopout(account) },
            { label: "Start DM", disabled: account.id === current?.id, action: () => openDmWithAccount(account) },
            { label: "Show Quest Summary", action: () => showToast(formatQuestSummaryText(account.id)) },
            {
              label: "Copy",
              submenu: [
                { label: "Display Name", action: () => copyText(displayNameForAccount(account, null)) },
                { label: "Username", action: () => copyText(`@${account.username}`) },
                { label: "User ID", action: () => copyText(account.id) },
                { label: "Guild Tag", disabled: !accountGuildTag(account), action: () => copyText(accountGuildTag(account)) },
                { label: "Avatar Decoration", disabled: !accountDecorationEmoji(account), action: () => copyText(accountDecorationEmoji(account)) },
                { label: "Nameplate URL", disabled: !accountNameplateSvg(account), action: () => copyText(accountNameplateSvg(account)) }
              ]
            }
          ]);
        });
        ui.memberList.appendChild(row);
      });
    if (dmAccounts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "channel-empty";
      empty.textContent = "No members match your filter.";
      ui.memberList.appendChild(empty);
    }
    return;
  }
  const server = getActiveServer();
  ui.memberList.innerHTML = "";
  if (!server) {
    if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = "Members";
    return;
  }
  const activeChannel = getActiveChannel();
  if (activeChannel && (activeChannel.type === "voice" || activeChannel.type === "stage")) {
    ensureVoiceStateForChannel(activeChannel);
    const connectedIds = activeChannel.voiceState.connectedIds.filter((id) => server.memberIds.includes(id));
    const connectedAccounts = connectedIds
      .map((id) => getAccountById(id))
      .filter((account) => account && matchesMemberFilter(account, server.id));
    if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = `In Channel — ${connectedAccounts.length}`;
    const title = document.createElement("div");
    title.className = "member-group-title";
    title.textContent = activeChannel.type === "stage" ? "Audience / Speakers" : "Connected";
    ui.memberList.appendChild(title);
    if (connectedAccounts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "channel-empty";
      empty.textContent = "No one connected.";
      ui.memberList.appendChild(empty);
      return;
    }
    connectedAccounts.forEach((account) => {
      const row = document.createElement("button");
      row.className = "member-item";
      const avatar = document.createElement("div");
      avatar.className = "member-avatar";
      applyAvatarStyle(avatar, account, server.id);
      applyAvatarDecoration(avatar, account);
      const dot = document.createElement("span");
      dot.className = `presence-dot presence-${normalizePresence(account.presence)}`;
      avatar.appendChild(dot);
      const meta = document.createElement("span");
      meta.className = "member-meta";
      const label = document.createElement("span");
      label.className = "member-meta__name";
      label.textContent = displayNameForAccount(account, server.id);
      const status = document.createElement("small");
      status.className = "member-meta__status";
      const flags = [];
      if (activeChannel.voiceState.mutedIds.includes(account.id)) flags.push("Muted");
      if (activeChannel.type === "stage" && activeChannel.voiceState.speakerIds.includes(account.id)) flags.push("Speaker");
      if (activeChannel.type === "stage" && activeChannel.voiceState.raisedHandIds.includes(account.id)) flags.push("Hand Raised");
      status.textContent = flags.length > 0 ? flags.join(" · ") : "Connected";
      meta.appendChild(label);
      meta.appendChild(status);
      row.appendChild(avatar);
      row.appendChild(meta);
      row.addEventListener("click", () => openUserPopout(account));
      ui.memberList.appendChild(row);
    });
    return;
  }

  const online = [];
  const offline = [];

  server.memberIds.forEach((memberId) => {
    const account = getAccountById(memberId);
    if (!account) return;
    if (!matchesMemberFilter(account, server.id)) return;
    if (normalizePresence(account.presence) === "invisible") {
      offline.push(account);
    } else {
      online.push(account);
    }
  });

  const sortByName = (a, b) => displayNameForAccount(a, server.id).localeCompare(displayNameForAccount(b, server.id));
  online.sort(sortByName);
  offline.sort(sortByName);

  const groups = [];
  if (presenceFilter !== "offline") groups.push({ title: `Online — ${online.length}`, items: online });
  if (presenceFilter !== "online") groups.push({ title: `Offline — ${offline.length}`, items: offline });
  if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = `Members — ${online.length + offline.length}`;

  groups.forEach((group) => {
    const title = document.createElement("div");
    title.className = "member-group-title";
    title.textContent = group.title;
    ui.memberList.appendChild(title);

    group.items.forEach((account) => {
      const row = document.createElement("button");
      row.className = "member-item";

      const avatar = document.createElement("div");
      avatar.className = "member-avatar";
      applyAvatarStyle(avatar, account, server.id);
      applyAvatarDecoration(avatar, account);

      const dot = document.createElement("span");
      dot.className = `presence-dot presence-${normalizePresence(account.presence)}`;
      avatar.appendChild(dot);

      const meta = document.createElement("span");
      meta.className = "member-meta";
      const label = document.createElement("span");
      label.className = "member-meta__name";
      label.textContent = displayNameForAccount(account, server.id);
      applyNameplateStyle(label, account);
      const roleColor = getMemberTopRoleColor(server, account.id);
      if (roleColor) label.style.color = roleColor;
      const tag = accountGuildTag(account);
      if (tag) {
        const tagChip = document.createElement("span");
        tagChip.className = "guild-tag-chip";
        tagChip.textContent = tag;
        tagChip.title = "Guild tag";
        tagChip.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          showGuildTagInfo(account);
        });
        label.appendChild(document.createTextNode(" "));
        label.appendChild(tagChip);
      }
      const status = document.createElement("small");
      status.className = "member-meta__status";
      status.textContent = displayStatus(account, server.id);
      meta.appendChild(label);
      const topRole = getMemberTopRoleName(server, account.id);
      if (topRole) {
        const roleTag = document.createElement("span");
        roleTag.className = "member-meta__role";
        roleTag.textContent = topRole;
        meta.appendChild(roleTag);
      }
      meta.appendChild(status);

      row.appendChild(avatar);
      row.appendChild(meta);
      row.addEventListener("click", () => openUserPopout(account));
      row.addEventListener("dblclick", () => mentionInComposer(account));
      row.addEventListener("contextmenu", (event) => {
        openContextMenu(event, [
          {
            label: "View Profile",
            action: () => openUserPopout(account)
          },
          {
            label: "Start DM",
            disabled: account.id === getCurrentAccount()?.id,
            action: () => openDmWithAccount(account)
          },
          {
            label: "Mention User",
            action: () => mentionInComposer(account)
          },
          {
            label: "Show Quest Summary",
            action: () => showToast(formatQuestSummaryText(account.id))
          },
          {
            label: "Copy",
            submenu: [
              { label: "Display Name", action: () => copyText(displayNameForAccount(account, server.id)) },
              { label: "Username", action: () => copyText(`@${account.username}`) },
              { label: "User ID", action: () => copyText(account.id) },
              { label: "Guild Tag", disabled: !accountGuildTag(account), action: () => copyText(accountGuildTag(account)) },
              { label: "Avatar Decoration", disabled: !accountDecorationEmoji(account), action: () => copyText(accountDecorationEmoji(account)) },
              { label: "Nameplate URL", disabled: !accountNameplateSvg(account), action: () => copyText(accountNameplateSvg(account)) }
            ]
          }
        ]);
      });
      ui.memberList.appendChild(row);
    });
  });
  if (online.length + offline.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No members match your filter.";
    ui.memberList.appendChild(empty);
  }
}

function renderDock() {
  const account = getCurrentAccount();
  if (!account) return;
  const conversation = getActiveConversation();
  const guildId = conversation?.type === "channel" ? getActiveGuild()?.id || null : null;
  ui.dockName.textContent = displayNameForAccount(account, guildId);
  applyNameplateStyle(ui.dockName, account);
  const dockTag = accountGuildTag(account);
  if (dockTag) {
    ui.dockName.appendChild(document.createTextNode(" "));
    const chip = document.createElement("span");
    chip.className = "guild-tag-chip";
    chip.textContent = dockTag;
    chip.title = "Guild tag";
    chip.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showGuildTagInfo(account);
    });
    ui.dockName.appendChild(chip);
  }
  ui.dockStatus.textContent = displayStatus(account, guildId);
  applyAvatarStyle(ui.dockAvatar, account, guildId);
  applyAvatarDecoration(ui.dockAvatar, account);
  ui.dockPresenceDot.className = `dock-presence-dot presence-${normalizePresence(account.presence)}`;
}

function renderSelfPopout() {
  const account = getCurrentAccount();
  if (!account) return;
  ui.selfPopoutName.textContent = displayNameForAccount(account, getActiveGuild()?.id || null);
  const selfRoleColor = getActiveServer() ? getMemberTopRoleColor(getActiveServer(), account.id) : "";
  ui.selfPopoutName.style.color = selfRoleColor || "";
  applyNameplateStyle(ui.selfPopoutName, account);
  const selfTag = accountGuildTag(account);
  if (selfTag) {
    ui.selfPopoutName.appendChild(document.createTextNode(" "));
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "guild-tag-chip";
    chip.textContent = selfTag;
    chip.title = "Guild tag";
    chip.addEventListener("click", () => showGuildTagInfo(account));
    ui.selfPopoutName.appendChild(chip);
  }
  ui.selfPopoutStatus.textContent = displayStatus(account, getActiveGuild()?.id || null);
  ui.selfPopoutBio.textContent = account.bio?.trim() || "No bio yet.";
  applyAvatarStyle(ui.selfPopoutAvatar, account, getActiveGuild()?.id || null);
  applyAvatarDecoration(ui.selfPopoutAvatar, account);
  applyBannerStyle(ui.selfPopoutBanner, resolveAccountBanner(account, getActiveGuild()?.id || null));
  ui.selfMenuDialog.classList.remove("profile-effect-aurora", "profile-effect-flame", "profile-effect-ocean");
  const selfEffect = accountProfileEffect(account);
  if (selfEffect !== "none") ui.selfMenuDialog.classList.add(`profile-effect-${selfEffect}`);
  renderRoleChips(ui.selfPopoutRoles, account.id);
  renderQuestBadges(ui.selfPopoutRoles, account.id);
}

function renderAccountSwitchList() {
  ui.accountList.innerHTML = "";
  state.accounts.forEach((account) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `account-option ${selectedSwitchAccountId === account.id ? "active" : ""}`;
    const label = document.createElement("span");
    label.textContent = account.displayName || account.username;
    const tag = document.createElement("small");
    tag.textContent = `@${account.username}`;
    row.appendChild(label);
    row.appendChild(tag);
    row.addEventListener("click", () => {
      selectedSwitchAccountId = account.id;
      renderAccountSwitchList();
    });
    ui.accountList.appendChild(row);
  });
}

function renderRolesDialog() {
  const server = getActiveServer();
  if (!server) return;

  ui.assignRoleMemberInput.innerHTML = "";
  server.memberIds.forEach((memberId) => {
    const account = getAccountById(memberId);
    if (!account) return;
    const option = document.createElement("option");
    option.value = account.id;
    option.textContent = `${account.displayName || account.username} (@${account.username})`;
    ui.assignRoleMemberInput.appendChild(option);
  });

  ui.assignRoleRoleInput.innerHTML = "";
  getServerRoles(server).forEach((role) => {
    if (role.name === "@everyone") return;
    const option = document.createElement("option");
    option.value = role.id;
    option.textContent = role.name;
    ui.assignRoleRoleInput.appendChild(option);
  });
  if (ui.roleColorPicker) {
    ui.roleColorPicker.value = normalizeColorForPicker(ui.roleColorInput.value || "#b5bac1", "#b5bac1");
  }
}

function renderPinsDialog() {
  const channel = getActiveChannel();
  if (ui.pinsSearchInput && ui.pinsSearchInput.value !== pinsSearchTerm) {
    ui.pinsSearchInput.value = pinsSearchTerm;
  }
  if (ui.pinsSortInput && ui.pinsSortInput.value !== pinsSortMode) {
    ui.pinsSortInput.value = pinsSortMode;
  }
  ui.pinsList.innerHTML = "";
  if (!channel) return;
  let pinned = channel.messages.filter((message) => message.pinned);
  const term = (pinsSearchTerm || "").trim().toLowerCase();
  if (term) {
    pinned = pinned.filter((message) => {
      const author = displayNameForMessage(message).toLowerCase();
      const text = (message.text || "").toString().toLowerCase();
      const stamp = formatFullTimestamp(message.ts || "").toLowerCase();
      return author.includes(term) || text.includes(term) || stamp.includes(term);
    });
  }
  pinned.sort((a, b) => {
    if (pinsSortMode === "oldest") return toTimestampMs(a.ts) - toTimestampMs(b.ts);
    if (pinsSortMode === "author-asc") return displayNameForMessage(a).localeCompare(displayNameForMessage(b));
    if (pinsSortMode === "author-desc") return displayNameForMessage(b).localeCompare(displayNameForMessage(a));
    return toTimestampMs(b.ts) - toTimestampMs(a.ts);
  });
  if (pinned.length === 0) {
    const empty = document.createElement("div");
    empty.className = "pin-item";
    empty.textContent = term ? "No pinned messages match your filter." : "No pinned messages yet.";
    ui.pinsList.appendChild(empty);
    return;
  }
  pinned.forEach((message) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "pin-item";
    const author = displayNameForMessage(message);
    item.innerHTML = `<strong>${author}</strong><small>${formatTime(message.ts)}</small>${message.text}`;
    item.addEventListener("click", () => {
      ui.pinsDialog.close();
      const target = ui.messageList.querySelector(`[data-message-id=\"${message.id}\"]`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    ui.pinsList.appendChild(item);
  });
}

function setSettingsTab(tabId) {
  const tabTitles = {
    "my-account": "My Account",
    profiles: "Profiles",
    notifications: "Notifications",
    appearance: "Appearance",
    advanced: "Advanced"
  };
  ui.settingsTitle.textContent = tabTitles[tabId] || "User Settings";
  ui.settingsNavItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.settingsTab === tabId);
  });
  ui.settingsPanels.forEach((panel) => {
    panel.classList.toggle("settings-panel--active", panel.dataset.settingsPanel === tabId);
  });
}

function renderSettingsScreen() {
  const account = getCurrentAccount();
  const guild = getActiveGuild();
  const prefs = getPreferences();
  if (!account) return;
  ui.settingsDisplayName.textContent = displayNameForAccount(account, guild?.id || null);
  ui.settingsUsername.textContent = `@${account.username}`;
  ui.settingsCurrentStatus.textContent = displayStatus(account, guild?.id || null);
  ui.uiScaleInput.value = String(prefs.uiScale);
  ui.themeInput.value = prefs.theme;
  ui.compactModeInput.value = prefs.compactMembers;
  ui.developerModeInput.value = prefs.developerMode;
  ui.debugOverlayInput.value = prefs.debugOverlay;
  ui.swfAudioPolicyInput.value = prefs.swfAudioPolicy;
  ui.swfAudioScopeInput.value = prefs.swfAudioScope;
  ui.swfAutoplayInput.value = prefs.swfAutoplay;
  ui.swfPauseOnMuteInput.value = prefs.swfPauseOnMute;
  ui.swfVuMeterInput.value = prefs.swfVuMeter;
  if (ui.relayModeInput) ui.relayModeInput.value = prefs.relayMode;
  if (ui.relayUrlInput) ui.relayUrlInput.value = prefs.relayUrl;
  if (ui.relayRoomInput) ui.relayRoomInput.value = prefs.relayRoom;
  if (ui.relayAutoConnectInput) ui.relayAutoConnectInput.value = prefs.relayAutoConnect;
  if (ui.xmppJidInput) ui.xmppJidInput.value = prefs.xmppJid;
  if (ui.xmppPasswordInput) ui.xmppPasswordInput.value = prefs.xmppPassword;
  if (ui.xmppWsUrlInput) ui.xmppWsUrlInput.value = prefs.xmppWsUrl;
  if (ui.xmppMucServiceInput) ui.xmppMucServiceInput.value = prefs.xmppMucService;
  renderRelayStatusOutput();
  if (ui.guildNotifGuildName) {
    ui.guildNotifGuildName.textContent = guild ? guild.name : "No guild selected";
  }
  if (ui.guildNotifModeInput) {
    ui.guildNotifModeInput.value = guild ? getGuildNotificationMode(guild.id) : "all";
    ui.guildNotifModeInput.disabled = !guild;
  }
}

function openSettingsScreen() {
  renderSettingsScreen();
  setSettingsTab("my-account");
  ui.settingsScreen.classList.add("settings-screen--active");
}

function closeSettingsScreen() {
  ui.settingsScreen.classList.remove("settings-screen--active");
}

function wireDialogBackdropClose(dialog) {
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const inDialog = (
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom
    );
    if (!inDialog) dialog.close();
  });
}

function isTypingInputTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("input, textarea, [contenteditable='true']")) return true;
  return false;
}

function hardenInputAutocompleteNoise() {
  const targets = [
    ui.loginUsername,
    ui.loginPassword,
    ui.loginXmppServer,
    ui.dmSearchInput,
    ui.channelFilterInput,
    ui.memberSearchInput,
    ui.mediaSearchInput,
    ui.findInput,
    ui.findAuthorInput,
    ui.pinsSearchInput,
    ui.quickSwitchInput,
    ui.messageInput
  ].filter(Boolean);
  targets.forEach((field) => {
    field.setAttribute("autocomplete", "off");
    field.setAttribute("autocapitalize", "off");
    field.setAttribute("autocorrect", "off");
    field.setAttribute("spellcheck", "false");
  });
}

function render() {
  closeContextMenu();
  if (pruneExpiredStatuses()) saveState();
  renderScreens();
  applyPreferencesToUI();
  if (!state.currentAccountId) {
    closeMediaPicker();
    clearComposerPendingAttachment();
    return;
  }
  if (ensureCurrentUserInActiveServer()) {
    saveState();
  }
  if (applyHashConversationNavigation()) {
    saveState();
  }
  if (getViewMode() === "guild" && state.activeGuildId && state.activeChannelId) {
    rememberGuildChannelSelection(state.activeGuildId, state.activeChannelId);
  }
  renderServers();
  renderDmList();
  renderChannels();
  renderMessages();
  renderSwfShelf();
  renderSwfPipDock();
  renderMemberList();
  renderDock();
  renderSettingsScreen();
  renderReplyComposer();
  renderSlashSuggestions();
  renderComposerMeta();
  updateDocumentTitle();
  if (mediaPickerOpen) renderMediaPicker();
  if (ui.cosmeticsDialog?.open) renderCosmeticsDialog();
}

function updateDocumentTitle() {
  const base = "shitcord67";
  const current = getCurrentAccount();
  if (!current) {
    document.title = base;
    return;
  }
  const dmStats = getTotalDmUnreadStats(current);
  const guildStats = state.guilds.reduce((acc, guild) => {
    const stats = getGuildUnreadStats(guild, current);
    return { unread: acc.unread + stats.unread, mentions: acc.mentions + stats.mentions };
  }, { unread: 0, mentions: 0 });
  const mentions = dmStats.mentions + guildStats.mentions;
  const unread = dmStats.unread + guildStats.unread;
  const badge = mentions > 0 ? `@${mentions > 99 ? "99+" : mentions}` : (unread > 0 ? `${unread > 99 ? "99+" : unread}` : "");
  document.title = badge ? `(${badge}) ${base}` : base;
}

function hasPendingComposerChanges() {
  if (!state.currentAccountId) return false;
  const text = (ui.messageInput?.value || "").trim();
  if (text.length > 0) return true;
  if (composerPendingAttachments.length > 0) return true;
  if (replyTarget) return true;
  return false;
}

function openProfileEditor() {
  const account = getCurrentAccount();
  const guild = getActiveGuild();
  if (!account) return;
  ensureAccountCosmetics(account);
  ui.displayNameInput.value = account.displayName || account.username;
  ui.profileBioInput.value = account.bio || "";
  ui.profileStatusInput.value = account.customStatus || "";
  ui.profileStatusEmojiInput.value = account.customStatusEmoji || "";
  ui.profileAvatarDecorationInput.value = account.avatarDecoration || "";
  ui.profileGuildTagInput.value = account.guildTag || "";
  ui.profileEffectInput.value = accountProfileEffect(account);
  ui.profileNameplateSvgInput.value = account.profileNameplateSvg || "";
  ui.profileStatusExpiryInput.value = statusExpiryPreset(account);
  ui.profileGuildNicknameInput.value = guild ? resolveAccountGuildNickname(account, guild.id) : "";
  const guildAvatar = guild ? resolveAccountAvatar(account, guild.id) : { color: "", url: "" };
  const guildBanner = guild ? resolveAccountBanner(account, guild.id) : "";
  ui.profileGuildAvatarInput.value = guild ? (guildAvatar.color || "") : "";
  if (ui.profileGuildAvatarColorPicker) {
    ui.profileGuildAvatarColorPicker.value = normalizeColorForPicker(ui.profileGuildAvatarInput.value || "#57f287", "#57f287");
    ui.profileGuildAvatarColorPicker.disabled = !guild;
  }
  ui.profileGuildAvatarUrlInput.value = guild ? (guildAvatar.url || "") : "";
  ui.profileGuildBannerInput.value = guild ? guildBanner : "";
  ui.profileGuildStatusInput.value = guild ? ((account.guildProfiles?.[guild.id]?.status || "").toString()) : "";
  ui.profileGuildNicknameInput.disabled = !guild;
  ui.profileGuildAvatarInput.disabled = !guild;
  ui.profileGuildAvatarUrlInput.disabled = !guild;
  ui.profileGuildBannerInput.disabled = !guild;
  ui.profileGuildStatusInput.disabled = !guild;
  ui.presenceInput.value = account.presence || "online";
  ui.profileBannerInput.value = account.banner || "";
  ui.profileAvatarInput.value = account.avatarColor || "#57f287";
  if (ui.profileAvatarColorPicker) {
    ui.profileAvatarColorPicker.value = normalizeColorForPicker(ui.profileAvatarInput.value || "#57f287", "#57f287");
  }
  ui.profileAvatarUrlInput.value = account.avatarUrl || "";
  setProfileAvatarUploadHint("Accepts image files up to 2 MB.");
  renderProfileAvatarPreview();
  renderProfileIdentityPreview();
  ui.profileDialog.showModal();
}

function openTopicEditor() {
  const channel = getActiveChannel();
  if (!channel) return;
  if (!canCurrentUser("manageChannels")) {
    notifyPermissionDenied("Manage Channels");
    return;
  }
  ui.topicInput.value = channel.topic || "";
  ui.topicDialog.showModal();
}

function openChannelSettings() {
  const channel = getActiveChannel();
  const server = getActiveServer();
  if (!channel) return;
  if (!canCurrentUser("manageChannels")) {
    notifyPermissionDenied("Manage Channels");
    return;
  }
  ui.channelRenameInput.value = channel.name || "";
  if (ui.channelSlowmodeInput) {
    ui.channelSlowmodeInput.value = String(getChannelSlowmodeSeconds(channel));
  }
  if (server && ui.channelPermRoleInput) {
    ensureChannelPermissionOverrides(channel, server);
    ui.channelPermRoleInput.innerHTML = "";
    getServerRoles(server).forEach((role) => {
      const option = document.createElement("option");
      option.value = role.id;
      option.textContent = role.name;
      ui.channelPermRoleInput.appendChild(option);
    });
    if (!ui.channelPermRoleInput.value) {
      ui.channelPermRoleInput.value = getServerRoles(server)[0]?.id || "";
    }
    renderChannelPermissionEditor();
  }
  ui.channelSettingsDialog.showModal();
}

function renderChannelPermissionEditor() {
  const channel = getActiveChannel();
  const server = getActiveServer();
  if (!channel || !server) return;
  const roleId = ui.channelPermRoleInput?.value || "";
  if (!roleId) return;
  ensureChannelPermissionOverrides(channel, server);
  if (ui.channelPermViewInput) ui.channelPermViewInput.value = getChannelPermissionOverride(channel, roleId, "viewChannel");
  if (ui.channelPermSendInput) ui.channelPermSendInput.value = getChannelPermissionOverride(channel, roleId, "sendMessages");
  if (ui.channelPermReactInput) ui.channelPermReactInput.value = getChannelPermissionOverride(channel, roleId, "addReactions");
  if (ui.channelPermThreadInput) ui.channelPermThreadInput.value = getChannelPermissionOverride(channel, roleId, "createThreads");
}

function extractXmppAltConnectionUrls(links) {
  if (!Array.isArray(links)) return [];
  const urls = [];
  links.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const rel = (entry.rel || "").toString().toLowerCase();
    if (!rel.includes("xmpp:alt-connections") || !rel.includes("websocket")) return;
    const href = normalizeXmppWsUrl(entry.href || entry.url || "");
    if (!href) return;
    if (!urls.includes(href)) urls.push(href);
  });
  return urls;
}

function parseXmppHostMetaXml(rawXml) {
  const xml = (rawXml || "").toString().trim();
  if (!xml) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    if (!doc) return [];
    const links = [...doc.getElementsByTagName("Link")].map((node) => ({
      rel: node.getAttribute("rel") || "",
      href: node.getAttribute("href") || ""
    }));
    return extractXmppAltConnectionUrls(links);
  } catch {
    return [];
  }
}

async function fetchWithTimeout(url, timeoutMs = XMPP_HOST_META_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), Math.max(1200, timeoutMs));
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function discoverXmppWsViaHostMeta(jid, { force = false, timeoutMs = XMPP_HOST_META_TIMEOUT_MS } = {}) {
  const cleanJid = normalizeXmppJid(jid);
  const domain = xmppDomainFromJid(cleanJid);
  if (!domain || !looksLikeCompleteJid(cleanJid)) return [];
  if (XMPP_PLAIN_ONLY_DOMAINS.has(domain)) {
    addXmppDebugEvent("runtime", "Skipping host-meta discovery for known-cert-mismatch domain", { domain });
    return [];
  }
  const cacheKey = domain.toLowerCase();
  const cacheEntry = xmppWsDiscoveryCache.get(cacheKey);
  const now = Date.now();
  if (!force && cacheEntry && (now - cacheEntry.ts) < (15 * 60 * 1000)) return cacheEntry.urls.slice();
  try {
    const gatewayResponse = await fetch(`${XMPP_LOCAL_AUTH_GATEWAY_URL}/discover`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jid: cleanJid,
        timeoutMs: Math.max(2000, Math.min(9000, Number(timeoutMs) || XMPP_HOST_META_TIMEOUT_MS))
      })
    });
    if (gatewayResponse.ok) {
      const payload = await gatewayResponse.json().catch(() => ({}));
      const urls = Array.isArray(payload?.urls)
        ? payload.urls.map((entry) => normalizeXmppWsUrl(entry)).filter(Boolean)
        : [];
      xmppWsDiscoveryCache.set(cacheKey, { ts: now, urls: urls.slice(0, 8) });
      addXmppDebugEvent("runtime", "Host-meta discovery via local gateway", {
        domain,
        found: urls.length,
        source: `${XMPP_LOCAL_AUTH_GATEWAY_URL}/discover`
      });
      if (urls.length === 0) {
        addXmppDebugEvent("runtime", "No WebSocket endpoints found in host-meta (gateway)", { domain });
      }
      return urls.slice(0, 8);
    }
    addXmppDebugEvent("runtime", "Local gateway discovery returned non-OK status", {
      domain,
      status: gatewayResponse.status
    });
    if (!XMPP_ENABLE_BROWSER_HOST_META_FALLBACK) {
      addXmppDebugEvent("runtime", "Skipping browser host-meta fetch to avoid CORS noise", { domain });
      return [];
    }
  } catch (error) {
    addXmppDebugEvent("runtime", "Local gateway discovery unavailable; falling back to browser fetch", {
      domain,
      error: String(error?.message || error)
    });
    if (!XMPP_ENABLE_BROWSER_HOST_META_FALLBACK) {
      addXmppDebugEvent("runtime", "Browser host-meta fallback disabled", { domain });
      return [];
    }
  }
  const endpoints = [];
  const sources = [
    `https://${domain}/.well-known/host-meta.json`,
    `https://${domain}/.well-known/host-meta`
  ];
  addXmppDebugEvent("runtime", "Discovering XMPP endpoints via host-meta", { domain, sources });
  for (const url of sources) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetchWithTimeout(url, timeoutMs);
      if (!response.ok) {
        addXmppDebugEvent("runtime", "Host-meta source returned non-OK status", { url, status: response.status });
        continue;
      }
      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      if (contentType.includes("json")) {
        // eslint-disable-next-line no-await-in-loop
        const payload = await response.json();
        const links = Array.isArray(payload?.links) ? payload.links : [];
        extractXmppAltConnectionUrls(links).forEach((candidate) => {
          if (!endpoints.includes(candidate)) endpoints.push(candidate);
        });
      } else {
        // eslint-disable-next-line no-await-in-loop
        const text = await response.text();
        parseXmppHostMetaXml(text).forEach((candidate) => {
          if (!endpoints.includes(candidate)) endpoints.push(candidate);
        });
      }
      addXmppDebugEvent("runtime", "Host-meta source parsed", {
        url,
        contentType,
        found: endpoints.length
      });
    } catch (error) {
      addXmppDebugEvent("runtime", "Host-meta source failed", { url, error: String(error?.message || error) });
    }
  }
  xmppWsDiscoveryCache.set(cacheKey, { ts: now, urls: endpoints.slice(0, 8) });
  if (endpoints.length === 0) {
    addXmppDebugEvent("runtime", "No WebSocket endpoints found in host-meta", { domain });
  } else {
    addXmppDebugEvent("runtime", "Discovered XMPP WebSocket endpoints", { domain, endpoints });
  }
  return endpoints.slice(0, 8);
}

async function validateXmppViaLocalGateway({ jid, password, candidates, timeoutMs = 10000 }) {
  const cleanJid = normalizeXmppJid(jid);
  const cleanPass = normalizeXmppPassword(password);
  const wsCandidates = Array.isArray(candidates)
    ? candidates.map((entry) => normalizeXmppWsUrl(entry)).filter(Boolean)
    : [];
  if (!cleanJid || !cleanPass || wsCandidates.length === 0) return null;
  const gatewayUrl = XMPP_LOCAL_AUTH_GATEWAY_URL;
  addXmppDebugEvent("connect", "Attempting local Node XMPP auth gateway", {
    gatewayUrl,
    jid: cleanJid,
    candidates: wsCandidates
  });
  try {
    const response = await fetch(`${gatewayUrl}/auth-check`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jid: cleanJid,
        password: cleanPass,
        candidates: wsCandidates,
        timeoutMs: Math.max(3000, Math.min(15000, Number(timeoutMs) || 10000))
      })
    });
    if (!response.ok) {
      addXmppDebugEvent("runtime", "Local auth gateway returned non-OK status", {
        gatewayUrl,
        status: response.status
      });
      return null;
    }
    const payload = await response.json();
    if (payload?.ok && normalizeXmppWsUrl(payload.wsUrl || "")) {
      addXmppDebugEvent("connect", "Local auth gateway succeeded", {
        gatewayUrl,
        wsUrl: normalizeXmppWsUrl(payload.wsUrl || "")
      });
      return {
        ok: true,
        wsUrl: normalizeXmppWsUrl(payload.wsUrl || "")
      };
    }
    addXmppDebugEvent("runtime", "Local auth gateway rejected credentials", {
      gatewayUrl,
      error: (payload?.error || "").toString().slice(0, 160),
      failures: Array.isArray(payload?.failures) ? payload.failures.slice(0, 4) : []
    });
    const failures = Array.isArray(payload?.failures) ? payload.failures.slice(0, 6) : [];
    const noWsHint = classifyNoWebsocketEndpointHint(failures);
    return {
      ok: false,
      error: [
        (payload?.error || "Local gateway rejected login.").toString(),
        noWsHint.trim(),
        Array.isArray(payload?.failures) && payload.failures.length > 0
          ? `Details: ${payload.failures.map((entry) => `${entry.wsUrl || "?"} ${entry.reason || "connect"}${entry.error ? ` (${entry.error})` : ""}`).join("; ")}`
          : ""
      ].filter(Boolean).join(" ").slice(0, 480)
    };
  } catch (error) {
    addXmppDebugEvent("runtime", "Local auth gateway unavailable", {
      gatewayUrl,
      error: String(error?.message || error)
    });
    return null;
  }
}

async function registerXmppViaLocalGateway({ jid, password, wsUrl = "", timeoutMs = 12000 }) {
  const cleanJid = normalizeXmppJid(jid);
  const cleanPass = normalizeXmppPassword(password);
  if (!cleanJid || !cleanPass) {
    return { ok: false, error: "JID and password are required for registration.", wsUrl: "" };
  }
  const explicitWs = normalizeXmppWsUrl(wsUrl);
  const domain = xmppDomainFromJid(cleanJid);
  let candidates = resolveXmppWsCandidates(cleanJid, explicitWs);
  if (candidates.length === 0 && explicitWs) candidates = [explicitWs];
  if (!XMPP_PLAIN_ONLY_DOMAINS.has(domain)) {
    try {
      const discovered = await discoverXmppWsViaHostMeta(cleanJid);
      if (discovered.length > 0) {
        const merged = [];
        const push = (value) => {
          const normalized = normalizeXmppWsUrl(value);
          if (!normalized) return;
          if (!merged.includes(normalized)) merged.push(normalized);
        };
        push(explicitWs);
        discovered.forEach((entry) => push(entry));
        candidates.forEach((entry) => push(entry));
        candidates = merged;
      }
    } catch {
      // Continue with fallback candidates only.
    }
  }
  if (candidates.length === 0) {
    return { ok: false, error: "Could not determine a valid XMPP WebSocket endpoint for registration.", wsUrl: "" };
  }
  addXmppDebugEvent("connect", "Attempting in-client registration via local gateway", {
    jid: cleanJid,
    gatewayUrl: XMPP_LOCAL_AUTH_GATEWAY_URL,
    candidates
  });
  try {
    const response = await fetch(`${XMPP_LOCAL_AUTH_GATEWAY_URL}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jid: cleanJid,
        password: cleanPass,
        candidates,
        timeoutMs: Math.max(5000, Math.min(20000, Number(timeoutMs) || 12000))
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        wsUrl: normalizeXmppWsUrl(payload?.wsUrl || "") || candidates[0] || "",
        error: (payload?.error || `Registration gateway returned HTTP ${response.status}.`).toString().slice(0, 420)
      };
    }
    return {
      ok: Boolean(payload?.ok),
      wsUrl: normalizeXmppWsUrl(payload?.wsUrl || "") || candidates[0] || "",
      error: [
        (payload?.error || "").toString(),
        classifyNoWebsocketEndpointHint(Array.isArray(payload?.failures) ? payload.failures : []).trim()
      ].filter(Boolean).join(" ").slice(0, 420),
      failures: Array.isArray(payload?.failures) ? payload.failures.slice(0, 5) : []
    };
  } catch (error) {
    return {
      ok: false,
      wsUrl: candidates[0] || "",
      error: `Registration gateway unavailable at ${XMPP_LOCAL_AUTH_GATEWAY_URL}: ${String(error?.message || error)}`
    };
  }
}

function classifyNoWebsocketEndpointHint(failures = []) {
  const list = Array.isArray(failures) ? failures : [];
  if (list.length === 0) return "";
  const connectOnly = list.every((entry) => (entry?.reason || "connect") === "connect");
  if (!connectOnly) return "";
  const signals = list.map((entry) => (entry?.error || "").toString().toLowerCase());
  const hasRedirect = signals.some((text) => text.includes("unexpected server response: 301") || text.includes("unexpected server response: 302"));
  const hasNotFound = signals.some((text) => text.includes("unexpected server response: 404"));
  const hasDns = signals.some((text) => text.includes("enotfound"));
  const hasTimeout = signals.some((text) => text.includes("timeout"));
  if (hasRedirect || hasNotFound || hasDns || hasTimeout) {
    return " Provider likely does not expose a usable XMPP WebSocket endpoint for this client path.";
  }
  return "";
}

function looksLikeCompleteJid(jid) {
  const raw = normalizeXmppJid(jid);
  if (!raw || raw.includes(" ")) return false;
  const at = raw.indexOf("@");
  if (at <= 0 || at >= raw.length - 1) return false;
  const local = raw.slice(0, at);
  const domain = raw.slice(at + 1).toLowerCase();
  if (!local || domain.startsWith(".") || domain.endsWith(".")) return false;
  const labels = domain.split(".");
  if (labels.length === 0 || labels.some((label) => !label)) return false;
  try {
    return labels.every((label) => /^[\p{L}\p{N}-]{1,63}$/u.test(label) && !label.startsWith("-") && !label.endsWith("-"));
  } catch {
    return labels.every((label) => /^[a-z0-9-]{1,63}$/i.test(label) && !label.startsWith("-") && !label.endsWith("-"));
  }
}

function knownXmppWsForDomain(domain) {
  const normalized = (domain || "").toString().trim().toLowerCase();
  const known = {
    "xmpp.jp": "wss://api.xmpp.jp/ws"
  };
  return known[normalized] || "";
}

function resolveXmppWsCandidates(jid, explicitWs = "") {
  const candidates = [];
  const push = (url) => {
    const normalized = normalizeXmppWsUrl(url);
    if (!normalized) return;
    if (!candidates.includes(normalized)) candidates.push(normalized);
  };
  push(explicitWs);
  const domain = xmppDomainFromJid(jid);
  if (!domain || !looksLikeCompleteJid(jid)) return candidates;
  const knownWs = knownXmppWsForDomain(domain);
  if (knownWs) {
    push(knownWs);
    return candidates;
  }
  push(`wss://api.${domain}/ws`);
  push(`wss://${domain}/ws`);
  push(`wss://${domain}/xmpp-websocket`);
  push(`wss://${domain}/xmpp-websocket/`);
  push(`wss://ws.${domain}/ws`);
  push(`wss://ws.${domain}/xmpp-websocket`);
  push(`wss://ws.${domain}/xmpp-websocket/`);
  push(`wss://xmpp.${domain}/ws`);
  push(`wss://xmpp.${domain}/xmpp-websocket`);
  push(`wss://xmpp.${domain}/xmpp-websocket/`);
  push(`wss://chat.${domain}/ws`);
  push(`wss://chat.${domain}/xmpp-websocket`);
  push(`wss://chat.${domain}/xmpp-websocket/`);
  push(`wss://${domain}:5281/ws`);
  push(`wss://${domain}:5281/xmpp-websocket`);
  return candidates.slice(0, 14);
}

function inferXmppWsUrlFromJid(jid) {
  const [first] = resolveXmppWsCandidates(jid, "");
  return first || "";
}

async function maybeDiscoverLoginXmppWsUrl(jid) {
  const cleanJid = normalizeXmppJid(jid);
  if (!looksLikeCompleteJid(cleanJid)) return;
  const token = ++loginXmppDiscoveryToken;
  const discovered = await discoverXmppWsViaHostMeta(cleanJid);
  if (token !== loginXmppDiscoveryToken) return;
  if (!ui.loginXmppServer) return;
  const currentWs = normalizeXmppWsUrl(ui.loginXmppServer.value || "");
  const first = discovered[0] || "";
  if (!first) return;
  if (!currentWs || ui.loginXmppServer.dataset.autofill === "1") {
    ui.loginXmppServer.value = first;
    ui.loginXmppServer.dataset.autofill = "1";
    addXmppDebugEvent("connect", "Applied discovered login WebSocket endpoint", { jid: cleanJid, wsUrl: first });
  }
}

function parseLoginIdentity(rawUsername, explicitJid = "") {
  const userRaw = (rawUsername || "").toString().trim();
  const jidRaw = (explicitJid || "").toString().trim();
  const effectiveJid = jidRaw || (userRaw.includes("@") ? userRaw : "");
  const baseUsernameRaw = userRaw.includes("@") ? userRaw.split("@")[0] : userRaw;
  const fallbackFromJid = effectiveJid.includes("@") ? effectiveJid.split("@")[0] : "";
  const accountSeed = baseUsernameRaw || fallbackFromJid;
  return {
    accountUsername: normalizeUsername(accountSeed),
    accountDisplay: accountSeed.trim().slice(0, 32),
    xmppJid: normalizeXmppJid(effectiveJid)
  };
}

function xmppUserLabelFromJid(jid, fallback = "") {
  const raw = (jid || "").toString().trim().toLowerCase();
  const [local = "", domain = ""] = raw.split("@");
  const localSafe = local.replace(/[^a-z0-9._-]/g, "_");
  const domainSafe = domain.replace(/[^a-z0-9.-]/g, "").replace(/[.]/g, "_");
  const seed = [localSafe, domainSafe].filter(Boolean).join("_") || fallback || "xmpp_user";
  return normalizeUsername(seed).slice(0, 24);
}

function ensureAccountByXmppJid(jid, displayName = "") {
  const bare = normalizeXmppJid(jid).toLowerCase();
  if (!bare) return null;
  const mapped = xmppRosterByJid.get(bare);
  if (mapped) {
    const account = getAccountById(mapped.accountId);
    if (account) {
      if (displayName) account.displayName = displayName.toString().slice(0, 32) || account.displayName;
      account.xmppJid = bare;
      return account;
    }
  }
  const existing = state.accounts.find((account) => normalizeXmppJid(account.xmppJid || "").toLowerCase() === bare) || null;
  if (existing) {
    if (displayName) existing.displayName = displayName.toString().slice(0, 32) || existing.displayName;
    existing.xmppJid = bare;
    xmppRosterByJid.set(bare, { accountId: existing.id, groups: [] });
    return existing;
  }
  const username = xmppUserLabelFromJid(bare, bare.split("@")[0] || "xmpp");
  let account = getAccountByUsername(username);
  if (!account) {
    account = createAccount(username, displayName || bare.split("@")[0] || username);
    account.xmppJid = bare;
    state.accounts.push(account);
  } else {
    account.xmppJid = bare;
    if (displayName) account.displayName = displayName.toString().slice(0, 32) || account.displayName;
  }
  xmppRosterByJid.set(bare, { accountId: account.id, groups: [] });
  return account;
}

function ensureXmppSpacesGuild(prefs = getPreferences(), account = getCurrentAccount()) {
  const domain = xmppDomainFromJid(prefs.xmppJid) || "xmpp";
  const guildId = `xmpp-spaces:${domain}`;
  let guild = state.guilds.find((entry) => entry.id === guildId) || null;
  if (guild) {
    if (account && !guild.memberIds.includes(account.id)) guild.memberIds.push(account.id);
    return guild;
  }
  const everyoneRole = createRole("@everyone", "#b5bac1", "member");
  guild = {
    id: guildId,
    name: "XMPP Spaces",
    description: `Synced from ${domain}`,
    accentColor: "#3f71ff",
    memberIds: account ? [account.id] : [],
    customEmojis: [],
    customStickers: [],
    customGifs: [],
    customSvgs: [],
    customPdfs: [],
    customTexts: [],
    customDocs: [],
    customSwfs: [],
    customHtmls: [],
    roles: [everyoneRole],
    memberRoles: account ? { [account.id]: [everyoneRole.id] } : {},
    channels: [
      {
        id: createId(),
        name: "general",
        type: "text",
        topic: "XMPP mapped channels",
        forumTags: [],
        permissionOverrides: {},
        voiceState: createVoiceState(),
        readState: account ? { [account.id]: new Date().toISOString() } : {},
        slowmodeSec: 0,
        slowmodeState: {},
        messages: []
      }
    ]
  };
  state.guilds.push(guild);
  return guild;
}

function upsertXmppSpaceChannels(bookmarks, prefs = getPreferences(), account = getCurrentAccount()) {
  if (!Array.isArray(bookmarks) || bookmarks.length === 0) return;
  const guild = ensureXmppSpacesGuild(prefs, account);
  if (!guild) return;
  let changed = false;
  bookmarks.forEach((entry) => {
    const roomJid = normalizeXmppJid(entry?.jid || "").toLowerCase();
    if (!roomJid) return;
    const roomNameSeed = (entry?.name || roomJid.split("@")[0] || "space").toString();
    const roomName = sanitizeChannelName(roomNameSeed, "space");
    let channel = guild.channels.find((item) => item?.xmppRoomJid === roomJid) || null;
    if (!channel) {
      channel = {
        id: createId(),
        name: roomName,
        type: "text",
        topic: `XMPP MUC ${roomJid}`,
        forumTags: [],
        permissionOverrides: {},
        voiceState: createVoiceState(),
        readState: account ? { [account.id]: new Date().toISOString() } : {},
        slowmodeSec: 0,
        slowmodeState: {},
        messages: [],
        xmppRoomJid: roomJid,
        relayRoomToken: `xmpp:${roomJid}`
      };
      guild.channels.push(channel);
      changed = true;
      return;
    }
    channel.name = roomName || channel.name;
    channel.xmppRoomJid = roomJid;
    channel.relayRoomToken = `xmpp:${roomJid}`;
  });
  if (changed) saveState();
}

function syncXmppRosterIntoState(items, prefs = getPreferences(), account = getCurrentAccount()) {
  if (!Array.isArray(items) || !account) return;
  const guild = ensureXmppSpacesGuild(prefs, account);
  const groupMembers = new Map();
  items.forEach((item) => {
    const bare = normalizeXmppJid(item?.jid || "").toLowerCase();
    if (!bare) return;
    const accountEntry = ensureAccountByXmppJid(bare, item?.name || bare.split("@")[0] || "");
    if (!accountEntry || accountEntry.id === account.id) return;
    getOrCreateDmThread(account, accountEntry);
    const groups = Array.isArray(item?.groups)
      ? item.groups.map((entry) => (entry || "").toString().trim()).filter(Boolean).slice(0, 8)
      : [];
    xmppRosterByJid.set(bare, { accountId: accountEntry.id, groups });
    groups.forEach((groupName) => {
      if (!groupMembers.has(groupName)) groupMembers.set(groupName, 0);
      groupMembers.set(groupName, (groupMembers.get(groupName) || 0) + 1);
    });
  });
  if (guild) {
    groupMembers.forEach((memberCount, groupName) => {
      const channelName = sanitizeChannelName(groupName, "group");
      let channel = guild.channels.find((entry) => entry?.xmppGroupName === groupName) || null;
      if (!channel) {
        channel = {
          id: createId(),
          name: channelName,
          type: "text",
          topic: `${memberCount} XMPP contacts`,
          forumTags: [],
          permissionOverrides: {},
          voiceState: createVoiceState(),
          readState: { [account.id]: new Date().toISOString() },
          slowmodeSec: 0,
          slowmodeState: {},
          messages: [],
          xmppGroupName: groupName
        };
        guild.channels.push(channel);
      } else {
        channel.topic = `${memberCount} XMPP contacts`;
      }
    });
  }
}

function fetchXmppRoster(connection) {
  return new Promise((resolve) => {
    if (!connection || !globalThis.$iq) {
      addXmppDebugEvent("iq", "Roster request skipped (missing connection/runtime)");
      resolve([]);
      return;
    }
    const iq = globalThis.$iq({ type: "get" }).c("query", { xmlns: "jabber:iq:roster" });
    addXmppDebugEvent("iq", "Requesting roster");
    connection.sendIQ(
      iq,
      (stanza) => {
        try {
          const items = [...stanza.getElementsByTagName("item")].map((node) => ({
            jid: node.getAttribute("jid") || "",
            name: node.getAttribute("name") || "",
            subscription: node.getAttribute("subscription") || "",
            groups: [...node.getElementsByTagName("group")].map((group) => globalThis.Strophe.getText(group) || "")
          })).filter((entry) => entry.jid && entry.subscription !== "remove");
          addXmppDebugEvent("iq", "Roster response received", { count: items.length });
          resolve(items);
        } catch {
          addXmppDebugEvent("error", "Roster parse failed");
          resolve([]);
        }
      },
      () => {
        addXmppDebugEvent("error", "Roster request failed or timed out");
        resolve([]);
      },
      7000
    );
  });
}

function fetchXmppBookmarks(connection) {
  return new Promise((resolve) => {
    if (!connection || !globalThis.$iq) {
      addXmppDebugEvent("iq", "Bookmarks request skipped (missing connection/runtime)");
      resolve([]);
      return;
    }
    const iq = globalThis.$iq({ type: "get" })
      .c("query", { xmlns: "jabber:iq:private" })
      .c("storage", { xmlns: "storage:bookmarks" });
    addXmppDebugEvent("iq", "Requesting bookmarks");
    connection.sendIQ(
      iq,
      (stanza) => {
        try {
          const list = [...stanza.getElementsByTagName("conference")]
            .map((node) => ({
              jid: node.getAttribute("jid") || "",
              name: node.getAttribute("name") || ""
            }))
            .filter((entry) => entry.jid);
          addXmppDebugEvent("iq", "Bookmarks response received", { count: list.length });
          resolve(list);
        } catch {
          addXmppDebugEvent("error", "Bookmarks parse failed");
          resolve([]);
        }
      },
      () => {
        addXmppDebugEvent("error", "Bookmarks request failed or timed out");
        resolve([]);
      },
      7000
    );
  });
}

function validateXmppLoginCredentials({ jid, password, wsUrl, timeoutMs = 10000 }) {
  return new Promise((resolve) => {
    const cleanJid = normalizeXmppJid(jid);
    const cleanPass = normalizeXmppPassword(password);
    const explicitWs = normalizeXmppWsUrl(wsUrl);
    let candidates = resolveXmppWsCandidates(cleanJid, explicitWs);
    addXmppDebugEvent("connect", "Login validation started", {
      jid: cleanJid,
      explicitWs,
      candidates
    });
    if (!cleanJid || !cleanPass || candidates.length === 0) {
      addXmppDebugEvent("error", "Login validation rejected before connect", {
        jidValid: Boolean(cleanJid),
        passwordProvided: Boolean(cleanPass),
        candidates
      });
      resolve({ ok: false, error: "XMPP login requires JID, password, and a valid WebSocket URL.", wsUrl: normalizeXmppWsUrl(wsUrl) || "" });
      return;
    }
    const tryCandidate = (candidateWs) => new Promise((doneAttempt) => {
      let connection = null;
      let finished = false;
      addXmppDebugEvent("connect", "Trying login endpoint", { wsUrl: candidateWs });
      const done = (result) => {
        if (finished) return;
        finished = true;
        try {
          if (connection) connection.disconnect();
        } catch {
          // Ignore cleanup errors.
        }
        doneAttempt(result);
      };
      let timeoutHandle = setTimeout(() => {
        timeoutHandle = null;
        addXmppDebugEvent("error", "Login endpoint timed out", { wsUrl: candidateWs });
        done({ ok: false, reason: "timeout", wsUrl: candidateWs });
      }, Math.max(2500, Math.min(10000, timeoutMs)));
      try {
        connection = new globalThis.Strophe.Connection(candidateWs, stropheConnectionOptionsForXmpp({
          jid: cleanJid,
          wsUrl: candidateWs
        }));
      } catch (error) {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        addXmppDebugEvent("error", "Failed to create Strophe connection for endpoint", {
          wsUrl: candidateWs,
          error: String(error)
        });
        done({ ok: false, reason: String(error), wsUrl: candidateWs });
        return;
      }
      connection.connect(cleanJid, cleanPass, (status) => {
        const S = globalThis.Strophe.Status;
        const statusName = Object.entries(S || {}).find(([, value]) => value === status)?.[0] || String(status);
        addXmppDebugEvent("connect", "Login endpoint status", { wsUrl: candidateWs, status: statusName });
        if (status === S.CONNECTED) {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          done({ ok: true, wsUrl: candidateWs });
          return;
        }
        if (status === S.AUTHFAIL) {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          done({ ok: false, reason: "auth", wsUrl: candidateWs });
          return;
        }
        if (status === S.CONNFAIL || status === S.ERROR || status === S.DISCONNECTED) {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          done({ ok: false, reason: "connect", wsUrl: candidateWs });
        }
      });
    });
    const runBrowserValidation = () => {
      loadXmppLibrary().then(async (ready) => {
        if (!ready || !globalThis.Strophe) {
          addXmppDebugEvent("error", "Login validation could not load runtime", { error: xmppRuntimeLastError || "" });
          resolve({ ok: false, error: `Failed to load XMPP runtime. ${xmppRuntimeLastError || ""}`.trim(), wsUrl: candidates[0] || "" });
          return;
        }
        try {
          const discovered = await discoverXmppWsViaHostMeta(cleanJid);
          if (discovered.length > 0) {
            const merged = [];
            const push = (value) => {
              const normalized = normalizeXmppWsUrl(value);
              if (!normalized) return;
              if (!merged.includes(normalized)) merged.push(normalized);
            };
            push(explicitWs);
            discovered.forEach((entry) => push(entry));
            candidates.forEach((entry) => push(entry));
            candidates = merged;
            addXmppDebugEvent("connect", "Merged host-meta endpoints into candidate list", { candidates });
          }
        } catch (error) {
          addXmppDebugEvent("runtime", "Host-meta discovery failed during login validation", { error: String(error?.message || error) });
        }
        let sawAuthFail = false;
        for (const candidateWs of candidates) {
          // eslint-disable-next-line no-await-in-loop
          const attempt = await tryCandidate(candidateWs);
          if (attempt.ok) {
            addXmppDebugEvent("connect", "Login validation succeeded", { wsUrl: candidateWs });
            resolve({ ok: true, wsUrl: candidateWs });
            return;
          }
          if (attempt.reason === "auth") {
            sawAuthFail = true;
            break;
          }
        }
        const localGateway = await validateXmppViaLocalGateway({
          jid: cleanJid,
          password: cleanPass,
          candidates,
          timeoutMs
        });
        if (localGateway?.ok) {
          resolve({ ok: true, wsUrl: localGateway.wsUrl || candidates[0] || "", via: "local-gateway" });
          return;
        }
        const gatewayHint = localGateway && localGateway.ok === false
          ? ` Local gateway check also failed: ${localGateway.error || "unknown error"}`
          : ` Local gateway unavailable at ${XMPP_LOCAL_AUTH_GATEWAY_URL}; start it with: node scripts/xmpp-auth-gateway.mjs`;
        resolve({
          ok: false,
          error: sawAuthFail
            ? `XMPP authentication failed. Tried: ${candidates.join(", ")}.${gatewayHint}`
            : `XMPP connection failed for WebSocket endpoints. Tried: ${candidates.join(", ")}.${gatewayHint}`,
          wsUrl: candidates[0] || ""
        });
      }).catch((error) => {
        addXmppDebugEvent("error", "Login validation crashed", { error: String(error) });
        resolve({ ok: false, error: String(error), wsUrl: candidates[0] || "" });
      });
    };

    if (shouldUsePlainOnlySasl(cleanJid, explicitWs || candidates[0] || "")) {
      addXmppDebugEvent("connect", "Using local gateway-first login validation strategy", {
        jid: cleanJid,
        gatewayUrl: XMPP_LOCAL_AUTH_GATEWAY_URL
      });
      validateXmppViaLocalGateway({
        jid: cleanJid,
        password: cleanPass,
        candidates,
        timeoutMs
      }).then((gatewayFirst) => {
        if (gatewayFirst?.ok) {
          resolve({ ok: true, wsUrl: gatewayFirst.wsUrl || candidates[0] || "", via: "local-gateway-first" });
          return;
        }
        addXmppDebugEvent("runtime", "Gateway-first path unavailable; falling back to browser validation", {
          hasGatewayResult: gatewayFirst !== null,
          gatewayError: gatewayFirst?.error || ""
        });
        runBrowserValidation();
      }).catch((error) => {
        addXmppDebugEvent("runtime", "Gateway-first check crashed; falling back to browser validation", {
          error: String(error?.message || error)
        });
        runBrowserValidation();
      });
      return;
    }

    runBrowserValidation();
  });
}

function renderXmppProviderList() {
  if (!ui.xmppProviderList) return;
  ui.xmppProviderList.innerHTML = "";
  XMPP_PROVIDER_CATALOG.forEach((provider) => {
    const row = document.createElement("div");
    row.className = "quick-switch-item";
    const title = document.createElement("strong");
    title.textContent = provider.name;
    const detail = document.createElement("small");
    const wsHint = provider.ws ? `WS: ${provider.ws}` : "WS endpoint depends on provider config.";
    detail.textContent = `${provider.notes} ${wsHint}`;
    const actions = document.createElement("div");
    actions.className = "settings-inline-actions";
    actions.style.marginTop = "0.35rem";
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "Open Site";
    openBtn.addEventListener("click", () => {
      window.open(provider.site, "_blank", "noopener,noreferrer");
    });
    actions.appendChild(openBtn);
    const registerBtn = document.createElement("button");
    registerBtn.type = "button";
    registerBtn.textContent = "Register";
    registerBtn.addEventListener("click", () => {
      window.open(provider.register || provider.site, "_blank", "noopener,noreferrer");
    });
    actions.appendChild(registerBtn);
    if (provider.ws) {
      const useBtn = document.createElement("button");
      useBtn.type = "button";
      useBtn.textContent = "Use Server";
      useBtn.addEventListener("click", () => {
        if (ui.loginXmppServer) ui.loginXmppServer.value = provider.ws;
        ui.xmppProviderDialog?.close();
        ui.loginUsername?.focus();
      });
      actions.appendChild(useBtn);
    }
    row.append(title, detail, actions);
    ui.xmppProviderList.appendChild(row);
  });
}

function syncLoginFieldsFromSessionPrefs() {
  const prefs = getPreferences();
  if (ui.loginRememberInput) {
    ui.loginRememberInput.checked = prefs.rememberLogin === "on" && isSessionPersistenceEnabled();
  }
  if (ui.loginUsername && !ui.loginUsername.value && prefs.xmppJid) {
    ui.loginUsername.value = prefs.xmppJid;
  }
  if (ui.loginXmppServer && !ui.loginXmppServer.value && prefs.xmppWsUrl) {
    ui.loginXmppServer.value = prefs.xmppWsUrl;
  }
}

function openXmppRegisterDialog() {
  const jidSeed = normalizeXmppJid(ui.loginUsername?.value || "");
  const wsSeed = normalizeXmppWsUrl(ui.loginXmppServer?.value || "") || inferXmppWsUrlFromJid(jidSeed);
  if (ui.registerJidInput) ui.registerJidInput.value = jidSeed || "";
  if (ui.registerPasswordInput) ui.registerPasswordInput.value = "";
  if (ui.registerXmppServerInput) {
    ui.registerXmppServerInput.value = wsSeed || "";
    ui.registerXmppServerInput.dataset.autofill = wsSeed ? "1" : "0";
  }
  ui.xmppRegisterDialog?.showModal();
  requestAnimationFrame(() => ui.registerJidInput?.focus());
}

function normalizeLocalXmppProfiles(raw) {
  const entries = [];
  if (raw?.account && typeof raw.account === "object") entries.push(raw.account);
  if (Array.isArray(raw?.accounts)) entries.push(...raw.accounts);
  const out = [];
  entries.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;
    const jid = normalizeXmppJid(entry.jid || entry.username || "");
    if (!jid) return;
    const ws = normalizeXmppWsUrl(entry.service || entry.ws || entry.xmppWsUrl || "");
    const password = normalizeXmppPassword(entry.password || "");
    const label = (entry.label || entry.name || jid).toString().slice(0, 80);
    out.push({
      id: `${index}:${jid}`,
      label,
      jid,
      password,
      ws
    });
  });
  const seen = new Set();
  return out.filter((entry) => {
    const key = entry.jid.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderLocalXmppProfileSelect() {
  if (!ui.loginLocalProfileWrap || !ui.loginLocalProfileSelect) return;
  ui.loginLocalProfileSelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select profile from .xmpp.local.json";
  ui.loginLocalProfileSelect.appendChild(defaultOption);
  if (!Array.isArray(loginLocalXmppProfiles) || loginLocalXmppProfiles.length === 0) {
    ui.loginLocalProfileWrap.hidden = true;
    return;
  }
  loginLocalXmppProfiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.label;
    ui.loginLocalProfileSelect.appendChild(option);
  });
  ui.loginLocalProfileWrap.hidden = false;
}

function applyLocalXmppProfileById(profileId) {
  if (!profileId) return false;
  const profile = loginLocalXmppProfiles.find((entry) => entry.id === profileId);
  if (!profile) return false;
  if (ui.loginUsername) ui.loginUsername.value = profile.jid;
  if (ui.loginPassword) ui.loginPassword.value = profile.password || "";
  if (ui.loginXmppServer && profile.ws) {
    ui.loginXmppServer.value = profile.ws;
    ui.loginXmppServer.dataset.autofill = "0";
  }
  return true;
}

async function loadLocalXmppProfiles() {
  const candidates = [".xmpp.local.json", "./.xmpp.local.json"];
  for (const path of candidates) {
    try {
      // Try to load local secret profiles if static server exposes dotfiles.
      // Hidden when unavailable.
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) continue;
      // eslint-disable-next-line no-await-in-loop
      const json = await response.json();
      const parsed = normalizeLocalXmppProfiles(json);
      if (parsed.length > 0) {
        loginLocalXmppProfiles = parsed;
        renderLocalXmppProfileSelect();
        return true;
      }
    } catch {
      // Try next fetch path variant.
    }
  }
  loginLocalXmppProfiles = [];
  renderLocalXmppProfileSelect();
  return false;
}

function createOrSwitchAccount(usernameInput, options = {}) {
  const normalized = normalizeUsername(usernameInput);
  if (!normalized) return false;

  let account = getAccountByUsername(normalized);
  if (!account) {
    const displayName = (options.displayName || usernameInput || "").toString().trim().slice(0, 32);
    account = createAccount(normalized, displayName);
    ensureAccountCosmetics(account);
    state.accounts.push(account);
  } else {
    if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
    if (typeof account.customStatusEmoji !== "string") account.customStatusEmoji = "";
    if (!("customStatusExpiresAt" in account)) account.customStatusExpiresAt = null;
    ensureAccountCosmetics(account);
  }

  state.preferences = getPreferences();
  const rememberRequested = typeof options.rememberLogin === "boolean"
    ? options.rememberLogin
    : state.preferences.rememberLogin !== "off";
  const rememberLogin = rememberRequested ? "on" : "off";
  state.preferences.rememberLogin = rememberLogin;
  state.currentAccountId = account.id;
  rememberAccountSession(account.id, rememberLogin === "on");
  const xmpp = options.xmpp && typeof options.xmpp === "object" ? options.xmpp : null;
  if (xmpp) {
    const jid = normalizeXmppJid(xmpp.jid || "");
    const password = normalizeXmppPassword(xmpp.password || "");
    const wsInput = normalizeXmppWsUrl(xmpp.wsUrl || "") || inferXmppWsUrlFromJid(jid);
    if (jid) state.preferences.xmppJid = jid;
    if (typeof xmpp.password === "string") state.preferences.xmppPassword = password;
    if (wsInput) state.preferences.xmppWsUrl = wsInput;
    if (jid && !state.preferences.xmppMucService) {
      const domain = xmppDomainFromJid(jid);
      if (domain) state.preferences.xmppMucService = `conference.${domain}`;
    }
    if (jid && password) {
      state.preferences.relayMode = "xmpp";
      state.preferences.relayAutoConnect = "on";
    }
  }
  if (state.viewMode !== "dm" && state.viewMode !== "guild") state.viewMode = "guild";
  if (!state.activeGuildId && state.guilds[0]) {
    state.activeGuildId = state.guilds[0].id;
  }
  if (!state.activeChannelId && state.guilds[0]) {
    state.activeChannelId = getFirstOpenableChannelIdForGuild(state.guilds[0]) || state.guilds[0]?.channels?.[0]?.id || null;
  }
  ensureCurrentUserInActiveServer();
  const prefs = getPreferences();
  if (["ws", "http", "xmpp"].includes(prefs.relayMode) && prefs.relayAutoConnect === "on") connectRelaySocket({ force: true });
  return true;
}

ui.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const typed = ui.loginUsername.value;
  const explicitJid = "";
  const password = ui.loginPassword?.value || "";
  const wsServer = ui.loginXmppServer?.value || "";
  const rememberLogin = ui.loginRememberInput?.checked !== false;
  const parsed = parseLoginIdentity(typed, explicitJid);
  if (!parsed.accountUsername) {
    showToast("Username must include at least one letter or number.", { tone: "error" });
    return;
  }
  const wantsXmpp = Boolean(parsed.xmppJid || password || wsServer);
  if (wantsXmpp && (!parsed.xmppJid || !password)) {
    showToast("For XMPP login, provide both JID (or JID in username) and password.", { tone: "error" });
    return;
  }
  const submitBtn = ui.loginForm.querySelector("button[type=\"submit\"]");
  if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
  try {
    let validatedWsUrl = normalizeXmppWsUrl(wsServer);
    if (wantsXmpp) {
      const check = await validateXmppLoginCredentials({
        jid: parsed.xmppJid,
        password,
        wsUrl: wsServer
      });
      validatedWsUrl = check.wsUrl || validatedWsUrl;
      if (!check.ok) {
        showToast(check.error || "XMPP login failed.", { tone: "error" });
        return;
      }
    }
    const xmppConfig = parsed.xmppJid || password || wsServer
      ? {
        jid: parsed.xmppJid,
        password,
        wsUrl: validatedWsUrl || wsServer
      }
      : null;
    if (!createOrSwitchAccount(parsed.accountUsername, {
      displayName: parsed.accountDisplay,
      rememberLogin,
      xmpp: xmppConfig
    })) {
      showToast("Could not create or switch account.", { tone: "error" });
      return;
    }
    renderScreens();
    ui.loginUsername.value = "";
    if (ui.loginPassword) ui.loginPassword.value = "";
    saveState();
    safeRender("login-submit");
    closeSettingsScreen();
    requestAnimationFrame(() => {
      ui.messageInput.focus();
    });
  } finally {
    if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
  }
});

ui.loginUsername?.addEventListener("input", () => {
  const raw = (ui.loginUsername.value || "").trim();
  if (!looksLikeCompleteJid(raw)) {
    loginXmppDiscoveryToken += 1;
    return;
  }
  if (ui.loginXmppServer && (!ui.loginXmppServer.value.trim() || ui.loginXmppServer.dataset.autofill === "1")) {
    const inferred = inferXmppWsUrlFromJid(raw);
    if (inferred) {
      ui.loginXmppServer.value = inferred;
      ui.loginXmppServer.dataset.autofill = "1";
    }
  }
  void maybeDiscoverLoginXmppWsUrl(raw);
});

ui.loginLocalProfileSelect?.addEventListener("change", () => {
  const selectedId = (ui.loginLocalProfileSelect?.value || "").toString();
  if (!selectedId) return;
  const applied = applyLocalXmppProfileById(selectedId);
  if (!applied) return;
  ui.loginUsername?.focus();
});

ui.loginXmppServer?.addEventListener("input", () => {
  if (!ui.loginXmppServer) return;
  const normalized = normalizeXmppWsUrl(ui.loginXmppServer.value || "");
  const inferred = inferXmppWsUrlFromJid(ui.loginUsername?.value || "");
  ui.loginXmppServer.dataset.autofill = normalized && inferred && normalized === inferred ? "1" : "0";
});

ui.loginProvidersBtn?.addEventListener("click", () => {
  renderXmppProviderList();
  ui.xmppProviderDialog?.showModal();
});

ui.loginRegisterBtn?.addEventListener("click", () => {
  openXmppRegisterDialog();
});

ui.loginXmppConsoleBtn?.addEventListener("click", () => {
  openXmppConsoleDialog();
});

ui.xmppProviderCloseBtn?.addEventListener("click", () => {
  ui.xmppProviderDialog?.close();
});

ui.registerOpenProviderBtn?.addEventListener("click", () => {
  renderXmppProviderList();
  ui.xmppProviderDialog?.showModal();
});

ui.registerCancelBtn?.addEventListener("click", () => {
  ui.xmppRegisterDialog?.close();
});

ui.registerJidInput?.addEventListener("input", () => {
  const raw = normalizeXmppJid(ui.registerJidInput?.value || "");
  if (!looksLikeCompleteJid(raw)) return;
  if (!ui.registerXmppServerInput) return;
  if (!ui.registerXmppServerInput.value.trim() || ui.registerXmppServerInput.dataset.autofill === "1") {
    const inferred = inferXmppWsUrlFromJid(raw);
    if (inferred) {
      ui.registerXmppServerInput.value = inferred;
      ui.registerXmppServerInput.dataset.autofill = "1";
    }
  }
});

ui.registerXmppServerInput?.addEventListener("input", () => {
  if (!ui.registerXmppServerInput) return;
  const normalized = normalizeXmppWsUrl(ui.registerXmppServerInput.value || "");
  const inferred = inferXmppWsUrlFromJid(ui.registerJidInput?.value || "");
  ui.registerXmppServerInput.dataset.autofill = normalized && inferred && normalized === inferred ? "1" : "0";
});

ui.xmppRegisterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const jid = normalizeXmppJid(ui.registerJidInput?.value || "");
  const password = normalizeXmppPassword(ui.registerPasswordInput?.value || "");
  const wsUrl = normalizeXmppWsUrl(ui.registerXmppServerInput?.value || "");
  if (!looksLikeCompleteJid(jid)) {
    showToast("Enter a valid XMPP JID for registration.", { tone: "error" });
    return;
  }
  if (!password) {
    showToast("Password is required for registration.", { tone: "error" });
    return;
  }
  if (ui.registerSubmitBtn instanceof HTMLButtonElement) ui.registerSubmitBtn.disabled = true;
  try {
    const result = await registerXmppViaLocalGateway({
      jid,
      password,
      wsUrl
    });
    if (!result.ok) {
      addXmppDebugEvent("error", "In-client registration failed", {
        jid,
        wsUrl: result.wsUrl || wsUrl || "",
        error: result.error || "",
        failures: result.failures || []
      });
      showToast(result.error || "Registration failed.", { tone: "error", duration: 3400 });
      return;
    }
    addXmppDebugEvent("connect", "In-client registration succeeded", {
      jid,
      wsUrl: result.wsUrl || wsUrl || ""
    });
    if (ui.loginUsername) ui.loginUsername.value = jid;
    if (ui.loginPassword) ui.loginPassword.value = password;
    if (ui.loginXmppServer) {
      ui.loginXmppServer.value = result.wsUrl || wsUrl || inferXmppWsUrlFromJid(jid);
      ui.loginXmppServer.dataset.autofill = "1";
    }
    ui.xmppRegisterDialog?.close();
    showToast("Account registered. Log in with the prefilled credentials.");
  } finally {
    if (ui.registerSubmitBtn instanceof HTMLButtonElement) ui.registerSubmitBtn.disabled = false;
  }
});

ui.messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  publishRelayTypingState(false, { force: true });
  const text = ui.messageInput.value.trim();
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  if (!conversation || !account || (!text && composerPendingAttachments.length === 0)) return;
  if (conversation.type === "dm" && text.startsWith("/")) {
    const [rawCommand, ...rawRest] = text.slice(1).split(" ");
    const dmCommand = rawCommand.toLowerCase();
    const dmArg = rawRest.join(" ").trim();
    if (dmCommand === "closedm") {
      const closingId = state.activeDmId;
      if (closingId) {
        state.dmThreads = state.dmThreads.filter((entry) => entry.id !== closingId);
        state.activeDmId = null;
        ui.messageInput.value = "";
        resizeComposerInput();
        saveState();
        render();
      }
      return;
    }
    if (dmCommand === "newdm") {
      const targetName = normalizeUsername(dmArg);
      if (!targetName) {
        showToast("Usage: /newdm <username>", { tone: "error" });
        return;
      }
      let target = getAccountByUsername(targetName);
      if (!target) {
        target = createAccount(targetName, targetName);
        state.accounts.push(target);
      }
      if (target.id === account.id) {
        showToast("Cannot open DM with yourself.", { tone: "error" });
        return;
      }
      openDmWithAccount(target);
      ui.messageInput.value = "";
      resizeComposerInput();
      return;
    }
    if (dmCommand === "markdmread") {
      if (!markDmRead(conversation.thread, account.id)) return;
      saveState();
      render();
      return;
    }
    if (dmCommand === "markallread") {
      if (!markAllReadForAccount(account.id)) return;
      saveState();
      render();
      return;
    }
    if (dmCommand === "copyid") {
      void copyText(conversation.thread.id).then((ok) => {
        showToast(ok ? "DM ID copied." : "Failed to copy DM ID.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "copylink") {
      const link = `${window.location.href.split("#")[0]}#msg=${conversation.thread.id}:`;
      void copyText(link).then((ok) => {
        showToast(ok ? "DM link copied." : "Failed to copy DM link.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "focus") {
      if (!dmArg || dmArg.toLowerCase() === "search") {
        ui.dmSearchInput?.focus();
        ui.dmSearchInput?.select?.();
      } else {
        ui.messageInput.focus();
      }
      return;
    }
    if (dmCommand === "relay") {
      state.preferences = getPreferences();
      const [subRaw, ...restRelay] = dmArg.split(" ");
      const sub = (subRaw || "status").toLowerCase();
      const payload = restRelay.join(" ").trim();
      if (sub === "status") {
        const adapter = getTransportAdapter(state.preferences.relayMode);
        showToast(`Relay: ${relayStatusText()} · ${state.preferences.relayMode}/${adapter.label} · ${state.preferences.relayUrl}`);
        return;
      }
      if (sub === "connect") {
        if (/^xmpp$/i.test(payload)) state.preferences.relayMode = "xmpp";
        else state.preferences.relayMode = payload.toLowerCase().startsWith("http") ? "http" : "ws";
        if (payload) state.preferences.relayUrl = normalizeRelayUrl(payload);
        saveState();
        connectRelaySocket({ force: true });
        showToast("Relay connect requested.");
        return;
      }
      if (sub === "disconnect") {
        disconnectRelaySocket({ manual: true });
        showToast("Relay disconnected.");
        return;
      }
      if (sub === "mode") {
        state.preferences.relayMode = normalizeRelayMode(payload);
        saveState();
        if (["ws", "http"].includes(state.preferences.relayMode)) connectRelaySocket({ force: true });
        else disconnectRelaySocket({ manual: true });
        showToast(`Relay mode: ${state.preferences.relayMode}`);
        return;
      }
      if (sub === "url") {
        state.preferences.relayUrl = normalizeRelayUrl(payload);
        saveState();
        showToast(`Relay URL set: ${state.preferences.relayUrl}`);
        return;
      }
      if (sub === "room") {
        state.preferences.relayRoom = !payload || payload.toLowerCase() === "clear" ? "" : normalizeRelayRoom(payload);
        saveState();
        syncRelayRoomForActiveConversation();
        showToast(state.preferences.relayRoom ? `Relay room: ${state.preferences.relayRoom}` : "Relay room override cleared.");
        return;
      }
      showToast("Usage: /relay [status|connect|disconnect|mode <local|http|ws|xmpp|off>|url|room]", { tone: "error" });
      return;
    }
    if (dmCommand === "quests") {
      showToast(formatQuestSummaryText(account.id));
      return;
    }
    if (dmCommand === "questprogress") {
      showToast(formatQuestSummaryText(account.id));
      return;
    }
    if (dmCommand === "questbadges") {
      const badges = resolveQuestBadgesForAccount(account.id);
      showToast(badges.length > 0 ? `Badges: ${badges.join(", ")}` : "No badges unlocked yet.");
      return;
    }
    if (dmCommand === "profilefx") {
      if (!dmArg) {
        showToast(`Current profile effect: ${accountProfileEffect(account)}`);
        return;
      }
      if (!["none", "aurora", "flame", "ocean"].includes(dmArg.toLowerCase())) {
        showToast("Usage: /profilefx <none|aurora|flame|ocean>", { tone: "error" });
        return;
      }
      account.profileEffect = normalizeProfileEffect(dmArg);
      saveState();
      render();
      showToast(`Profile effect set to: ${account.profileEffect}`);
      return;
    }
    if (dmCommand === "guildtag") {
      const rawTag = dmArg.trim();
      if (!rawTag) {
        showToast(`Current guild tag: ${accountGuildTag(account) || "(none)"}`);
        return;
      }
      if (rawTag.toLowerCase() === "clear") {
        account.guildTag = "";
        saveState();
        render();
        showToast("Guild tag cleared.");
        return;
      }
      account.guildTag = rawTag.slice(0, 8).toUpperCase();
      saveState();
      render();
      showToast(`Guild tag set to: ${account.guildTag}`);
      return;
    }
    if (dmCommand === "decor") {
      const rawDecor = dmArg.trim();
      if (!rawDecor) {
        showToast(`Current avatar decoration: ${accountDecorationEmoji(account) || "(none)"}`);
        return;
      }
      if (rawDecor.toLowerCase() === "clear") {
        account.avatarDecoration = "";
        saveState();
        render();
        showToast("Avatar decoration cleared.");
        return;
      }
      account.avatarDecoration = rawDecor.slice(0, 4);
      saveState();
      render();
      showToast(`Avatar decoration set to: ${account.avatarDecoration}`);
      return;
    }
    if (dmCommand === "nameplate") {
      const rawNameplate = dmArg.trim();
      if (!rawNameplate) {
        showToast(`Current nameplate: ${accountNameplateSvg(account) || "(none)"}`);
        return;
      }
      if (rawNameplate.toLowerCase() === "clear") {
        account.profileNameplateSvg = "";
        saveState();
        render();
        showToast("Nameplate cleared.");
        return;
      }
      if (!/^https?:\/\//i.test(rawNameplate) && !/^data:image\/svg\+xml/i.test(rawNameplate)) {
        showToast("Usage: /nameplate <https://...|data:image/svg+xml...|clear>", { tone: "error" });
        return;
      }
      account.profileNameplateSvg = rawNameplate.slice(0, 280);
      saveState();
      render();
      showToast("Nameplate updated.");
      return;
    }
    if (dmCommand === "whoami") {
      showToast(formatIdentitySummaryText(account, null));
      return;
    }
    if (dmCommand === "profilecard") {
      conversation.thread.messages.push({
        id: createId(),
        userId: account.id,
        authorName: "",
        text: `🪪 ${formatIdentitySummaryText(account, null)}`,
        ts: new Date().toISOString(),
        reactions: [],
        attachments: []
      });
      saveState();
      renderMessages();
      return;
    }
    if (dmCommand === "shop") {
      openCosmeticsDialog(dmArg);
      return;
    }
    if (dmCommand === "inventory") {
      showToast(formatCosmeticInventorySummary(account.id));
      return;
    }
    if (dmCommand === "find") {
      openFindDialogWithQuery(dmArg);
      return;
    }
    if (dmCommand === "findnext") {
      if (!findQuery.trim()) {
        openFindDialog();
        return;
      }
      moveFindSelection(1);
      return;
    }
    if (dmCommand === "findprev") {
      if (!findQuery.trim()) {
        openFindDialog();
        return;
      }
      moveFindSelection(-1);
      return;
    }
    if (dmCommand === "markunread") {
      const bucket = conversation.thread?.messages || [];
      if (bucket.length === 0) {
        showToast("No messages to mark unread from.", { tone: "error" });
        return;
      }
      const needle = dmArg.trim().toLowerCase();
      const targetMessage = !needle || needle === "last"
        ? bucket[bucket.length - 1]
        : bucket.find((entry) => (entry.id || "").toLowerCase().startsWith(needle));
      if (!targetMessage) {
        showToast("Usage: /markunread [message-id-prefix|last]", { tone: "error" });
        return;
      }
      if (!markConversationUnreadFromMessage(conversation, targetMessage.id, account.id)) return;
      saveState();
      render();
      showToast(`Marked unread from ${targetMessage.id.slice(0, 8)}.`);
      return;
    }
    if (dmCommand === "schedule") {
      const splitAt = dmArg.indexOf("|");
      if (splitAt < 0) {
        showToast("Usage: /schedule <when> | <text>", { tone: "error" });
        return;
      }
      const queued = queueScheduledMessage(
        conversation,
        account,
        dmArg.slice(0, splitAt).trim(),
        dmArg.slice(splitAt + 1).trim()
      );
      if (!queued.ok) {
        showToast(queued.error || "Could not schedule message.", { tone: "error" });
        return;
      }
      ui.messageInput.value = "";
      resizeComposerInput();
      saveState();
      renderMessages();
      showToast(`Scheduled ${queued.entry.id.slice(0, 8)} for ${new Date(queued.entry.sendAt).toLocaleString()}.`);
      return;
    }
    if (dmCommand === "scheduled") {
      const rows = listScheduledMessagesForConversation(conversation.id);
      showToast(rows.length > 0 ? `${rows.length} scheduled message${rows.length === 1 ? "" : "s"} in this DM.` : "No scheduled messages in this DM.");
      return;
    }
    if (dmCommand === "unschedule") {
      const removed = removeScheduledMessageByToken(conversation.id, dmArg.trim() || "last");
      if (removed > 0) {
        saveState();
        showToast(`Removed ${removed} scheduled message${removed === 1 ? "" : "s"}.`);
      } else {
        showToast("No scheduled message matched.", { tone: "error" });
      }
      return;
    }
  }
  if (conversation.type === "channel" && !canCurrentUserPostInChannel(conversation.channel, account)) {
    if (conversation.channel.type === "voice" || conversation.channel.type === "stage") {
      showToast("This channel uses voice controls instead of text messages.", { tone: "error" });
    } else {
      showToast("You do not have permission to send messages in this channel.", { tone: "error" });
    }
    renderComposerMeta();
    return;
  }
  if (conversation.type === "channel") {
    const remainingMs = getChannelSlowmodeRemainingMs(conversation.channel, account.id);
    if (remainingMs > 0) {
      const waitSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
      showToast(`Slowmode active: wait ${waitSeconds}s`, { tone: "error" });
      renderComposerMeta();
      return;
    }
  }

  if (conversation.type === "channel" && text) ensureCurrentUserInActiveServer();
  if (!(conversation.type === "channel" && text && handleSlashCommand(text, conversation.channel, account))) {
    const nextReply = replyTarget && replyTarget.channelId === conversation.id
      ? {
        messageId: replyTarget.messageId,
        authorName: replyTarget.authorName,
        text: replyTarget.text,
        threadId: replyTarget.threadId || null
      }
      : null;
    const nextMessage = {
      id: createId(),
      userId: account.id,
      authorName: "",
      text,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: composerPendingAttachments.map((entry) => ({
        type: entry.type || "pdf",
        url: entry.url,
        name: entry.name || "file",
        format: entry.format || "image"
      })),
      replyTo: nextReply
    };
    if (conversation.type === "channel" && conversation.channel.type === "forum") {
      if (nextReply?.threadId) {
        nextMessage.forumThreadId = nextReply.threadId;
        nextMessage.forumParentId = nextReply.messageId || nextReply.threadId;
      } else {
        if (!canCurrentUserCreateThreadsInChannel(conversation.channel, getActiveGuild())) {
          showToast("You do not have permission to create forum posts in this channel.", { tone: "error" });
          renderComposerMeta();
          return;
        }
        const [firstLine, ...rest] = text.split("\n");
        nextMessage.forumTitle = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
        nextMessage.text = rest.join("\n").trim();
        const defaultTags = normalizeThreadTagIds(
          getForumThreadTagFilter(conversation.channel.id),
          forumTagsForChannel(conversation.channel)
        );
        if (defaultTags.length > 0) nextMessage.forumTagIds = defaultTags;
      }
    }
    if (conversation.type === "dm") {
      conversation.thread.messages.push(nextMessage);
      publishRelayDirectMessage(conversation.thread, nextMessage, account);
    } else {
      conversation.channel.messages.push(nextMessage);
      recordChannelSlowmodeSend(conversation.channel, account.id);
      publishRelayChannelMessage(conversation.channel, nextMessage, account);
    }
    replyTarget = null;
    clearComposerPendingAttachment();
    if (swfPipTabs.length > 0 && !(conversation.type === "channel" && conversation.channel.type === "forum")) {
      ui.messageInput.value = "";
      setComposerDraft(conversation.id, "");
      resizeComposerInput();
      slashSelectionIndex = 0;
      closeMediaPicker();
      saveState();
      appendMessageRowLite(conversation.type === "dm" ? conversation.thread : conversation.channel, nextMessage);
      renderChannels();
      renderMemberList();
      return;
    }
  }

  ui.messageInput.value = "";
  setComposerDraft(conversation.id, "");
  clearComposerPendingAttachment();
  slashSelectionIndex = 0;
  closeMediaPicker();
  resizeComposerInput();
  saveState();
  renderMessages();
  renderMemberList();
  renderComposerMeta();
});

ui.messageInput.addEventListener("input", () => {
  setComposerDraft(composerDraftConversationId, ui.messageInput.value);
  queueComposerDraftSave();
  resizeComposerInput();
  renderChannels();
  slashSelectionIndex = 0;
  mentionSelectionIndex = 0;
  renderSlashSuggestions();
  updateComposerTypingPublish();
  renderComposerMeta();
});

ui.messageInput.addEventListener("blur", () => {
  publishRelayTypingState(false, { force: true });
});

ui.openMediaPickerBtn.addEventListener("click", () => {
  toggleMediaPicker();
});
ui.openMediaPickerBtn.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  ui.quickAttachInput.click();
});
ui.openMediaPickerBtn.addEventListener("mouseenter", warmMediaPickerRuntimes);
ui.openMediaPickerBtn.addEventListener("focus", warmMediaPickerRuntimes);

ui.openGifPickerBtn?.addEventListener("click", () => {
  openMediaPickerWithTab("gif");
});
ui.openStickerPickerBtn?.addEventListener("click", () => {
  openMediaPickerWithTab("sticker");
});
ui.openEmojiPickerBtn?.addEventListener("click", () => {
  openMediaPickerWithTab("emoji");
});

ui.quickFileAttachBtn.addEventListener("click", () => {
  ui.quickAttachInput.click();
});

ui.quickFileAttachBtn.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  openMediaPickerWithTab("pdf");
});

ui.quickAttachInput.addEventListener("change", async () => {
  const files = [...(ui.quickAttachInput.files || [])];
  if (files.length === 0) return;
  try {
    let attachedCount = 0;
    for (const file of files.slice(0, 6)) {
      const attached = await attachFileToComposer(file);
      if (!attached) continue;
      attachedCount += 1;
    }
    if (attachedCount === 0) {
      showToast("Unsupported attachment type for selected files.", { tone: "error" });
      return;
    }
    showToast(attachedCount > 1 ? `${attachedCount} files attached.` : "Attachment added.");
    ui.messageInput.focus();
  } catch {
    showToast("Failed to attach file.", { tone: "error" });
  } finally {
    ui.quickAttachInput.value = "";
  }
});

ui.clearComposerAttachmentBtn.addEventListener("click", () => {
  clearComposerPendingAttachment();
});

ui.saveComposerAttachmentBtn?.addEventListener("click", () => {
  if (composerPendingAttachments.length === 0) return;
  const ok = saveComposerAttachmentToPicker();
  if (!ok) {
    showToast("Could not save attachment to picker.", { tone: "error" });
    return;
  }
  const tab = pickerTabForAttachmentType(composerPendingAttachments[0]?.type || "pdf");
  showToast(composerPendingAttachments.length > 1 ? "Attachments saved to picker." : "Attachment saved to picker.");
  openMediaPickerWithTab(tab);
});

ui.toggleSwfAudioBtn.addEventListener("click", () => {
  const mode = getPreferences().swfQuickAudioMode;
  if (mode === "off") {
    setSwfQuickAudioMode("click");
    return;
  }
  if (mode === "click") {
    setSwfQuickAudioMode("on");
    return;
  }
  setSwfQuickAudioMode("click");
});

ui.toggleSwfAudioBtn.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const mode = getPreferences().swfQuickAudioMode;
  if (mode === "off") {
    setSwfQuickAudioMode("click");
    return;
  }
  setSwfQuickAudioMode("off");
});

ui.mediaTabs.forEach((tabBtn) => {
  tabBtn.addEventListener("click", () => {
    const nextTab = tabBtn.dataset.mediaTab;
    if (!MEDIA_TABS.includes(nextTab)) return;
    mediaPickerTab = nextTab;
    mediaPickerQuery = "";
    renderMediaPicker();
    ui.mediaSearchInput.focus();
  });
});

ui.mediaSearchInput.addEventListener("input", () => {
  mediaPickerQuery = ui.mediaSearchInput.value.slice(0, 80);
  renderMediaPicker();
});

ui.mediaSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (mediaPickerQuery) {
      event.preventDefault();
      mediaPickerQuery = "";
      renderMediaPicker();
      return;
    }
    closeMediaPicker();
    return;
  }
  if (event.key !== "Enter") return;
  event.preventDefault();
  const [first] = filteredMediaEntries();
  if (!first) return;
  if (mediaPickerTab === "emoji") {
    const value = first.value || "";
    insertTextAtCursor(value);
    if (value) {
      rememberRecentEmoji(value);
      saveState();
    }
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "docs") {
    sendMediaAttachment(first, first.type === "rtf" ? "rtf" : "odf");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "html") {
    sendMediaAttachment(first, "html");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "pdf") {
    sendMediaAttachment(first, "pdf");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "text") {
    sendMediaAttachment(first, "text");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "swf") {
    sendMediaAttachment(first, "swf");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "sticker") {
    sendMediaAttachment(first, "sticker");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "gif") {
    sendMediaAttachment(first, "gif");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "svg") {
    sendMediaAttachment(first, "svg");
    closeMediaPicker();
  }
});

ui.addMediaUrlBtn.addEventListener("click", () => {
  addMediaFromUrlFlow();
});

ui.addMediaFileBtn.addEventListener("click", () => {
  ui.mediaFileInput.accept = fileAcceptForTab(mediaPickerTab);
  ui.mediaFileInput.click();
});

ui.mediaFileInput.addEventListener("change", async () => {
  const file = ui.mediaFileInput.files?.[0];
  await addMediaFromFileFlow(file);
});

ui.channelFilterInput.addEventListener("input", () => {
  channelFilterTerm = ui.channelFilterInput.value.trim().slice(0, 40);
  renderChannels();
});

ui.channelFilterInput.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  if (channelFilterTerm) {
    channelFilterTerm = "";
    ui.channelFilterInput.value = "";
    renderChannels();
    return;
  }
  ui.channelFilterInput.blur();
});

ui.dmSearchInput.addEventListener("input", () => {
  dmSearchTerm = ui.dmSearchInput.value.trim().slice(0, 40);
  renderDmList();
});

ui.dmSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dmSearchTerm) {
    event.preventDefault();
    dmSearchTerm = "";
    ui.dmSearchInput.value = "";
    renderDmList();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    ui.dmSearchInput.blur();
    return;
  }
  if (event.key !== "Enter") return;
  event.preventDefault();
  const current = getCurrentAccount();
  if (!current) return;
  const query = dmSearchTerm.trim().toLowerCase();
  if (!query) return;
  const candidate = state.accounts.find((account) => {
    if (!account || account.id === current.id) return false;
    const username = (account.username || "").toLowerCase();
    const display = (account.displayName || "").toLowerCase();
    return username.startsWith(query) || display.startsWith(query);
  });
  if (!candidate) return;
  openDmWithAccount(candidate);
});

ui.memberSearchInput?.addEventListener("input", () => {
  memberSearchTerm = ui.memberSearchInput.value.trim().slice(0, 40);
  renderMemberList();
});

ui.memberSearchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  if (memberSearchTerm) {
    memberSearchTerm = "";
    ui.memberSearchInput.value = "";
    renderMemberList();
    return;
  }
  ui.memberSearchInput.blur();
});

ui.memberPresenceFilterButtons?.forEach((button) => {
  button.addEventListener("click", () => {
    const next = normalizeMemberPresenceFilter(button.dataset.memberFilter);
    if (memberPresenceFilter === next) return;
    memberPresenceFilter = next;
    renderMemberList();
  });
});

ui.toggleDmSectionBtn?.addEventListener("click", () => {
  toggleDmSectionCollapsed();
});
ui.toggleDmSectionBtn?.addEventListener("contextmenu", (event) => {
  const current = getCurrentAccount();
  const unread = getTotalDmUnreadStats(current);
  openContextMenu(event, [
    {
      label: "New DM",
      action: () => ui.newDmBtn.click()
    },
    {
      label: "Mark All DMs Read",
      disabled: !current || unread.unread === 0,
      action: () => {
        if (!current) return;
        let changed = false;
        state.dmThreads.forEach((thread) => {
          if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(current.id)) return;
          if (markDmRead(thread, current.id)) changed = true;
        });
        if (!changed) return;
        saveState();
        render();
      }
    }
  ]);
});

ui.toggleGuildSectionBtn?.addEventListener("click", () => {
  toggleGuildSectionCollapsed();
});
ui.toggleGuildSectionBtn?.addEventListener("contextmenu", (event) => {
  const current = getCurrentAccount();
  const guild = getActiveGuild();
  openContextMenu(event, [
    {
      label: "Create Channel",
      disabled: !canCurrentUser("manageChannels"),
      action: () => ui.createChannelBtn.click()
    },
    {
      label: "Mark Guild Read",
      disabled: !guild || !current || getGuildUnreadStats(guild, current).unread === 0,
      action: () => {
        if (!guild || !current) return;
        if (!markGuildRead(guild, current.id)) return;
        saveState();
        renderServers();
        renderChannels();
      }
    }
  ]);
});

ui.messageInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && !ui.messageInput.value.trim()) {
    const last = findLastEditableMessageInActiveConversation();
    if (last) {
      event.preventDefault();
      openMessageEditor(last.conversationId, last.messageId, last.text);
      return;
    }
  }

  if (event.key === "Escape" && !ui.messageInput.value.trim() && composerPendingAttachments.length > 0) {
    event.preventDefault();
    clearComposerPendingAttachment();
    showToast("Attachment cleared.");
    return;
  }

  if (event.ctrlKey && event.shiftKey) {
    if (event.key === "Backspace") {
      event.preventDefault();
      ui.messageInput.value = "";
      clearComposerPendingAttachment();
      replyTarget = null;
      renderReplyComposer();
      setComposerDraft(composerDraftConversationId, "");
      queueComposerDraftSave();
      resizeComposerInput();
      renderComposerMeta();
      renderChannels();
      showToast("Composer cleared.");
      return;
    }
    if (event.key.toLowerCase() === "o") {
      event.preventDefault();
      const start = ui.messageInput.selectionStart ?? 0;
      const end = ui.messageInput.selectionEnd ?? 0;
      const selected = ui.messageInput.value.slice(start, end);
      if (selected) {
        ui.messageInput.setRangeText(`||${selected}||`, start, end, "end");
        return;
      }
      const source = ui.messageInput.value;
      let wordStart = start;
      let wordEnd = end;
      while (wordStart > 0 && !/\s/.test(source[wordStart - 1])) wordStart -= 1;
      while (wordEnd < source.length && !/\s/.test(source[wordEnd])) wordEnd += 1;
      const word = source.slice(wordStart, wordEnd);
      if (word) {
        ui.messageInput.setRangeText(`||${word}||`, wordStart, wordEnd, "end");
      } else {
        ui.messageInput.setRangeText("||||", start, end, "end");
        const caret = start + 2;
        ui.messageInput.setSelectionRange(caret, caret);
      }
      setComposerDraft(composerDraftConversationId, ui.messageInput.value);
      queueComposerDraftSave();
      renderComposerMeta();
      return;
    }
    if (event.key.toLowerCase() === "g") {
      event.preventDefault();
      openMediaPickerWithTab("gif");
      return;
    }
    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      openMediaPickerWithTab("sticker");
      return;
    }
    if (event.key.toLowerCase() === "e") {
      event.preventDefault();
      openMediaPickerWithTab("emoji");
      return;
    }
  }

  const suggestion = getComposerSuggestionState();
  const popupVisible = suggestion.type !== "none";

  if (event.key === "Escape") {
    if (!ui.messageInput.value.trim() && replyTarget) {
      replyTarget = null;
      renderReplyComposer();
      showToast("Reply canceled.");
      return;
    }
    if (mediaPickerOpen) closeMediaPicker();
    slashSelectionIndex = 0;
    mentionSelectionIndex = 0;
    ui.slashCommandPopup.classList.add("slash-popup--hidden");
    return;
  }
  if (
    event.key === "Enter"
    && (event.ctrlKey || event.metaKey)
    && !event.shiftKey
    && !event.altKey
  ) {
    event.preventDefault();
    ui.messageForm.requestSubmit();
    return;
  }
  if (
    event.key === "Enter"
    && !event.shiftKey
    && !event.ctrlKey
    && !event.metaKey
    && !event.altKey
    && !popupVisible
  ) {
    event.preventDefault();
    ui.messageForm.requestSubmit();
    return;
  }
  if (!popupVisible) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (suggestion.type === "slash") {
      slashSelectionIndex = (slashSelectionIndex + 1) % suggestion.items.length;
    } else {
      mentionSelectionIndex = (mentionSelectionIndex + 1) % suggestion.items.length;
    }
    renderSlashSuggestions();
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (suggestion.type === "slash") {
      slashSelectionIndex = (slashSelectionIndex - 1 + suggestion.items.length) % suggestion.items.length;
    } else {
      mentionSelectionIndex = (mentionSelectionIndex - 1 + suggestion.items.length) % suggestion.items.length;
    }
    renderSlashSuggestions();
    return;
  }
  if (event.key === "Tab" || event.key === "Enter") {
    if (suggestion.type === "slash") {
      const selected = suggestion.items[slashSelectionIndex] || suggestion.items[0];
      const raw = ui.messageInput.value.trim();
      if (
        event.key === "Enter"
        && /^\/[a-z0-9-]+$/i.test(raw)
        && SLASH_COMMANDS.some((entry) => `/${entry.name}` === raw.toLowerCase())
      ) {
        event.preventDefault();
        ui.messageForm.requestSubmit();
        return;
      }
      if (event.key === "Enter" && selected && raw === `/${selected.name}`) {
        event.preventDefault();
        ui.messageForm.requestSubmit();
        return;
      }
      event.preventDefault();
      if (selected) applySlashCompletion(selected.name);
    } else {
      event.preventDefault();
      const selected = suggestion.items[mentionSelectionIndex] || suggestion.items[0];
      if (selected) applyMentionCompletion(selected);
    }
  }
});

ui.messageInput.addEventListener("paste", (event) => {
  const files = event.clipboardData?.files;
  if (!files || files.length === 0) return;
  event.preventDefault();
  const list = [...files].slice(0, 6);
  void (async () => {
    let attachedCount = 0;
    for (const file of list) {
      const inferred = inferAttachmentTypeFromFile(file);
      const allowed = getComposerAttachAllowedTypes();
      if (!allowed.has(inferred)) continue;
      // eslint-disable-next-line no-await-in-loop
      const attached = await attachFileToComposer(file);
      if (attached) attachedCount += 1;
    }
    if (attachedCount <= 0) return;
    ui.messageInput.focus();
    showToast(attachedCount > 1 ? `${attachedCount} attachments added from clipboard.` : "Attachment added from clipboard.");
  }).catch(() => {
    showToast("Failed to attach clipboard file.", { tone: "error" });
  });
});

ui.messageList.addEventListener("scroll", () => {
  updateJumpToBottomButton();
});

ui.jumpToBottomBtn?.addEventListener("click", () => {
  ui.messageList.scrollTop = ui.messageList.scrollHeight;
  updateJumpToBottomButton();
});

ui.cancelReplyBtn.addEventListener("click", () => {
  replyTarget = null;
  renderReplyComposer();
  ui.messageInput.focus();
});

ui.createServerBtn.addEventListener("click", () => {
  ui.serverNameInput.value = "";
  if (ui.serverTemplateInput) ui.serverTemplateInput.value = "blank";
  if (ui.serverStarterChannelsInput) ui.serverStarterChannelsInput.checked = true;
  ui.createServerDialog.showModal();
});

ui.serverBrand.addEventListener("click", () => {
  state.viewMode = "dm";
  state.activeDmId = null;
  saveState();
  render();
});

ui.serverBrand.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const current = getCurrentAccount();
  const dmStats = getTotalDmUnreadStats(current);
  openContextMenu(event, [
    {
      label: "Open DM Home",
      action: () => {
        state.viewMode = "dm";
        state.activeDmId = null;
        saveState();
        render();
      }
    },
    {
      label: "Mark All DMs Read",
      disabled: !current || dmStats.unread === 0,
      action: () => {
        if (!current) return;
        let changed = false;
        state.dmThreads.forEach((thread) => {
          if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(current.id)) return;
          if (markDmRead(thread, current.id)) changed = true;
        });
        if (!changed) return;
        saveState();
        render();
      }
    }
  ]);
});

ui.activeChannelName?.addEventListener("click", () => {
  const ref = activeConversationReferenceText();
  if (!ref) return;
  copyText(ref);
  showToast(`Copied ${ref}`);
});

ui.activeServerName.addEventListener("dblclick", () => {
  if (getViewMode() !== "guild") return;
  const guild = getActiveGuild();
  const current = getCurrentAccount();
  if (!guild || !current || !hasServerPermission(guild, current.id, "manageChannels")) return;
  openGuildSettingsDialog(guild);
});

ui.serverCancel.addEventListener("click", () => ui.createServerDialog.close());

ui.createServerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = ui.serverNameInput.value.trim().slice(0, 40);
  const template = (ui.serverTemplateInput?.value || "blank").trim().toLowerCase();
  const withStarterChannels = Boolean(ui.serverStarterChannelsInput?.checked);
  const account = getCurrentAccount();
  if (!name) return;

  const everyoneRole = createRole("@everyone", "#b5bac1", "member");
  const adminRole = createRole("Admin", "#f23f43", "admin");
  const memberRoles = {};
  if (account) memberRoles[account.id] = [everyoneRole.id, adminRole.id];
  const channels = withStarterChannels
    ? buildStarterChannels(template, account?.id || null)
    : buildStarterChannels("blank", account?.id || null);
  const server = {
    id: createId(),
    name,
    description: `${template[0] ? template[0].toUpperCase() + template.slice(1) : "Blank"} guild`,
    accentColor: "#5865f2",
    memberIds: account ? [account.id] : [],
    customEmojis: [],
    customStickers: [],
    customGifs: [],
    customSvgs: [],
    customPdfs: [],
    customTexts: [],
    customDocs: [],
    customSwfs: [],
    customHtmls: [],
    roles: [everyoneRole, adminRole],
    memberRoles,
    channels
  };

  state.guilds.push(server);
  state.activeGuildId = server.id;
  state.activeChannelId = channels[0]?.id || null;
  saveState();
  ui.createServerDialog.close();
  render();
});

ui.createChannelBtn.addEventListener("click", () => {
  if (!canCurrentUser("manageChannels")) {
    notifyPermissionDenied("Manage Channels");
    return;
  }
  ui.channelNameInput.value = "";
  ui.channelTypeInput.value = "text";
  ui.createChannelDialog.showModal();
});

ui.newDmBtn.addEventListener("click", () => {
  const current = getCurrentAccount();
  if (!current) return;
  const typed = prompt("Start DM with username", dmSearchTerm || "");
  if (typeof typed !== "string") return;
  const normalized = normalizeUsername(typed);
  if (!normalized) return;
  const target = getAccountByUsername(normalized);
  if (!target || target.id === current.id) return;
  openDmWithAccount(target);
});

ui.channelCancel.addEventListener("click", () => ui.createChannelDialog.close());

ui.createChannelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const server = getActiveServer();
  if (!server) return;
  const nextType = ["text", "announcement", "forum", "media", "voice", "stage"].includes(ui.channelTypeInput.value) ? ui.channelTypeInput.value : "text";

  const channel = {
    id: createId(),
    name: sanitizeChannelName(ui.channelNameInput.value, "new-channel"),
    type: nextType,
    topic: "",
    forumTags: nextType === "forum" ? [] : [],
    permissionOverrides: {},
    voiceState: createVoiceState(),
    readState: state.currentAccountId ? { [state.currentAccountId]: new Date().toISOString() } : {},
    slowmodeSec: 0,
    slowmodeState: {},
    messages: []
  };

  server.channels.push(channel);
  state.activeChannelId = channel.id;
  saveState();
  ui.createChannelDialog.close();
  render();
});

ui.editTopicBtn.addEventListener("click", openTopicEditor);
ui.openGuildSettingsBtn?.addEventListener("click", () => {
  const guild = getActiveGuild();
  const current = getCurrentAccount();
  if (!guild || !current || !hasServerPermission(guild, current.id, "manageChannels")) {
    notifyPermissionDenied("Manage Channels");
    return;
  }
  openGuildSettingsDialog(guild);
});
ui.openChannelSettingsBtn.addEventListener("click", openChannelSettings);
ui.openShortcutsBtn?.addEventListener("click", openShortcutsDialog);
ui.openFindBtn?.addEventListener("click", () => {
  if (!state.currentAccountId) return;
  openFindDialog();
});
ui.quickSwitchCancel?.addEventListener("click", () => ui.quickSwitchDialog?.close());
ui.quickSwitchInput?.addEventListener("input", () => {
  quickSwitchQuery = ui.quickSwitchInput.value.slice(0, 80);
  quickSwitchSelectionIndex = 0;
  renderQuickSwitchList();
});
ui.quickSwitchInput?.addEventListener("keydown", (event) => {
  const items = getQuickSwitchItems(quickSwitchQuery);
  if (event.key === "ArrowDown" && items.length > 0) {
    event.preventDefault();
    quickSwitchSelectionIndex = (quickSwitchSelectionIndex + 1) % items.length;
    renderQuickSwitchList();
    return;
  }
  if (event.key === "ArrowUp" && items.length > 0) {
    event.preventDefault();
    quickSwitchSelectionIndex = (quickSwitchSelectionIndex - 1 + items.length) % items.length;
    renderQuickSwitchList();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    ui.quickSwitchDialog?.close();
  }
});
ui.quickSwitchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const items = getQuickSwitchItems(quickSwitchQuery);
  const selected = items[quickSwitchSelectionIndex] || items[0];
  if (!selected) return;
  if (activateQuickSwitchItem(selected)) {
    ui.quickSwitchDialog?.close();
  }
});
ui.findCancel?.addEventListener("click", () => ui.findDialog?.close());
ui.contextMenu?.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  event.stopPropagation();
});
ui.findInput?.addEventListener("input", () => {
  findQuery = ui.findInput.value.slice(0, 120);
  findSelectionIndex = 0;
  renderFindList();
  renderMessages();
});
ui.findAuthorInput?.addEventListener("input", () => {
  findAuthorFilter = ui.findAuthorInput.value.slice(0, 32);
  findSelectionIndex = 0;
  renderFindList();
  renderMessages();
});
ui.findAfterInput?.addEventListener("input", () => {
  findAfterFilter = ui.findAfterInput.value;
  findSelectionIndex = 0;
  renderFindList();
  renderMessages();
});
ui.findBeforeInput?.addEventListener("input", () => {
  findBeforeFilter = ui.findBeforeInput.value;
  findSelectionIndex = 0;
  renderFindList();
  renderMessages();
});
ui.findHasLinkInput?.addEventListener("change", () => {
  findHasLinkOnly = Boolean(ui.findHasLinkInput.checked);
  findSelectionIndex = 0;
  renderFindList();
  renderMessages();
});
ui.findInput?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveFindSelection(1);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveFindSelection(-1);
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    ui.findDialog?.close();
  }
});
ui.findPrevBtn?.addEventListener("click", () => moveFindSelection(-1));
ui.findNextBtn?.addEventListener("click", () => moveFindSelection(1));
ui.findForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const conversation = getActiveConversation();
  const matches = getFindMatchesForConversation(conversation, findQuery);
  const selected = matches[findSelectionIndex] || matches[0];
  if (!selected) return;
  focusMessageById(selected.id);
});
ui.findDialog?.addEventListener("close", () => {
  findQuery = "";
  findAuthorFilter = "";
  findAfterFilter = "";
  findBeforeFilter = "";
  findHasLinkOnly = false;
  findSelectionIndex = 0;
  if (ui.findInput) ui.findInput.value = "";
  if (ui.findAuthorInput) ui.findAuthorInput.value = "";
  if (ui.findAfterInput) ui.findAfterInput.value = "";
  if (ui.findBeforeInput) ui.findBeforeInput.value = "";
  if (ui.findHasLinkInput) ui.findHasLinkInput.checked = false;
  renderFindList();
  renderMessages();
});
ui.toggleChannelPanelBtn?.addEventListener("click", toggleChannelPanelVisibility);
ui.toggleMemberPanelBtn?.addEventListener("click", toggleMemberPanelVisibility);
ui.toggleSwfShelfBtn.addEventListener("click", () => {
  swfShelfOpen = !swfShelfOpen;
  renderSwfShelf();
});
ui.swfPipCloseBtn.addEventListener("click", () => {
  swfPipManuallyHidden = true;
  renderSwfPipDock();
});

const swfPipHeader = ui.swfPipDock.querySelector(".swf-pip__header");
if (swfPipHeader) {
  swfPipHeader.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;
    const dockRect = ui.swfPipDock.getBoundingClientRect();
    pipDragState = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - dockRect.left,
      offsetY: event.clientY - dockRect.top,
      moved: false
    };
    event.preventDefault();
  });
  swfPipHeader.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;
    if (pipSuppressHeaderToggle) {
      pipSuppressHeaderToggle = false;
      return;
    }
    swfPipCollapsed = !swfPipCollapsed;
    renderSwfPipDock();
  });
}

document.addEventListener("mousemove", (event) => {
  if (!pipDragState?.dragging) return;
  const moveDistance = Math.hypot(event.clientX - pipDragState.startX, event.clientY - pipDragState.startY);
  if (moveDistance > 10) pipDragState.moved = true;
  const dockRect = ui.swfPipDock.getBoundingClientRect();
  const composerRect = ui.messageForm?.getBoundingClientRect?.();
  const maxTop = composerRect
    ? Math.max(8, composerRect.top - dockRect.height - 8)
    : Math.max(8, window.innerHeight - dockRect.height - 8);
  const nextLeft = Math.max(8, Math.min(window.innerWidth - dockRect.width - 8, event.clientX - pipDragState.offsetX));
  const nextTop = Math.max(8, Math.min(maxTop, event.clientY - pipDragState.offsetY));
  ui.swfPipDock.style.left = `${Math.round(nextLeft)}px`;
  ui.swfPipDock.style.top = `${Math.round(nextTop)}px`;
  ui.swfPipDock.style.right = "auto";
  ui.swfPipDock.style.bottom = "auto";
  positionSwfPipRuntimeHosts();
});

document.addEventListener("mouseup", () => {
  if (!pipDragState?.dragging) return;
  if (pipDragState.moved) pipSuppressHeaderToggle = true;
  pipDragState.dragging = false;
  const rect = ui.swfPipDock.getBoundingClientRect();
  state.preferences = getPreferences();
  state.preferences.swfPipPosition = { left: Math.round(rect.left), top: Math.round(rect.top), manual: true };
  saveState();
});
ui.clearSwfShelfBtn.addEventListener("click", () => {
  state.savedSwfs = [];
  saveState();
  renderSwfShelf();
});
ui.swfViewerZoomInput.addEventListener("input", applySwfViewerZoom);
ui.swfViewerPauseBtn.addEventListener("click", () => {
  if (!currentViewerRuntimeKey) return;
  setSwfPlayback(currentViewerRuntimeKey, false, "user");
});
ui.swfViewerResumeBtn.addEventListener("click", () => {
  if (!currentViewerRuntimeKey) return;
  setSwfPlayback(currentViewerRuntimeKey, true, "user");
});
ui.swfViewerSaveBtn.addEventListener("click", () => {
  if (!currentViewerSwf) return;
  saveSwfToShelf(currentViewerSwf);
});
ui.swfViewerCloseBtn.addEventListener("click", closeSwfViewerAndRestore);
ui.swfViewerDialog.addEventListener("close", () => {
  if (currentViewerRuntimeKey) {
    closeSwfViewerAndRestore();
  }
});
ui.userPopoutDialog.addEventListener("close", () => {
  selectedUserPopoutId = null;
});

ui.openRolesBtn.addEventListener("click", () => {
  if (!canCurrentUser("manageRoles")) {
    notifyPermissionDenied("Manage Roles");
    return;
  }
  renderRolesDialog();
  ui.roleNameInput.value = "";
  ui.roleColorInput.value = "";
  if (ui.roleColorPicker) ui.roleColorPicker.value = normalizeColorForPicker("#b5bac1", "#b5bac1");
  ui.rolePermPresetInput.value = "member";
  ui.rolesDialog.showModal();
});

ui.openPinsBtn.addEventListener("click", () => {
  pinsSearchTerm = "";
  pinsSortMode = "latest";
  if (ui.pinsSearchInput) ui.pinsSearchInput.value = "";
  if (ui.pinsSortInput) ui.pinsSortInput.value = "latest";
  renderPinsDialog();
  ui.pinsDialog.showModal();
});
ui.pinsSearchInput?.addEventListener("input", () => {
  pinsSearchTerm = ui.pinsSearchInput.value.slice(0, 80);
  renderPinsDialog();
});
ui.pinsSortInput?.addEventListener("change", () => {
  const next = (ui.pinsSortInput.value || "").toString();
  pinsSortMode = ["latest", "oldest", "author-asc", "author-desc"].includes(next) ? next : "latest";
  renderPinsDialog();
});

ui.markChannelReadBtn?.addEventListener("click", () => {
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  if (!conversation || !account) return;
  if (conversation.type === "dm") {
    if (!markDmRead(conversation.thread, account.id)) return;
    saveState();
    renderServers();
    renderDmList();
    renderMessages();
    return;
  }
  const channel = getActiveChannel();
  if (!channel || !account) return;
  if (!markChannelRead(channel, account.id)) return;
  saveState();
  renderServers();
  renderChannels();
  renderMessages();
});

ui.markChannelReadBtn?.addEventListener("contextmenu", (event) => {
  const account = getCurrentAccount();
  const guild = getActiveGuild();
  const dm = getActiveDmThread();
  openContextMenu(event, [
    {
      label: "Mark Current Read",
      disabled: !account || (!guild && !dm),
      action: () => {
        if (!account) return;
        if (dm) {
          if (!markDmRead(dm, account.id)) return;
        } else {
          const channel = getActiveChannel();
          if (!channel || !markChannelRead(channel, account.id)) return;
        }
        saveState();
        render();
      }
    },
    {
      label: "Mark Guild Read",
      disabled: !account || !guild,
      action: () => {
        if (!account || !guild) return;
        if (!markGuildRead(guild, account.id)) return;
        saveState();
        render();
      }
    },
    {
      label: "Mark All Read",
      disabled: !account,
      action: () => {
        if (!account) return;
        if (!markAllReadForAccount(account.id)) return;
        saveState();
        render();
      }
    }
  ]);
});

ui.nextUnreadBtn?.addEventListener("click", () => {
  jumpToUnreadGuildChannel(1);
});

ui.topicCancel.addEventListener("click", () => ui.topicDialog.close());

ui.topicForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const channel = getActiveChannel();
  if (!channel) return;
  channel.topic = ui.topicInput.value.trim().slice(0, 140);
  saveState();
  ui.topicDialog.close();
  renderMessages();
});

ui.channelSettingsCancel.addEventListener("click", () => ui.channelSettingsDialog.close());

ui.guildSettingsCancel?.addEventListener("click", () => ui.guildSettingsDialog.close());
ui.guildSettingsAccentInput?.addEventListener("input", () => {
  if (ui.guildSettingsAccentPicker) {
    ui.guildSettingsAccentPicker.value = normalizeColorForPicker(ui.guildSettingsAccentInput.value || "#5865f2", "#5865f2");
  }
});
ui.guildSettingsAccentPicker?.addEventListener("input", () => {
  ui.guildSettingsAccentInput.value = ui.guildSettingsAccentPicker.value;
});
ui.channelPermRoleInput?.addEventListener("change", () => {
  renderChannelPermissionEditor();
});
ui.guildSettingsForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const guild = getActiveGuild();
  if (!guild) return;
  const nextName = ui.guildSettingsNameInput.value.trim().slice(0, 40);
  if (nextName) guild.name = nextName;
  guild.description = ui.guildSettingsDescriptionInput.value.trim().slice(0, 180);
  const rawAccent = ui.guildSettingsAccentInput.value.trim();
  guild.accentColor = /^#[0-9a-f]{3,8}$/i.test(rawAccent) ? rawAccent : "#5865f2";
  saveState();
  ui.guildSettingsDialog.close();
  render();
});
ui.deleteGuildBtn?.addEventListener("click", () => {
  const guild = getActiveGuild();
  const current = getCurrentAccount();
  if (!guild) return;
  if (!current || !hasServerPermission(guild, current.id, "administrator")) {
    notifyPermissionDenied("Administrator");
    return;
  }
  const guildId = guild.id;
  ui.guildSettingsDialog.close();
  deleteGuildById(guildId);
});

ui.channelSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const server = getActiveServer();
  const channel = getActiveChannel();
  if (!channel || !server) return;
  channel.name = sanitizeChannelName(ui.channelRenameInput.value, channel.name || "general");
  if (ui.channelSlowmodeInput) {
    channel.slowmodeSec = normalizeSlowmodeSeconds(ui.channelSlowmodeInput.value);
    ensureChannelSlowmodeState(channel);
  }
  const roleId = (ui.channelPermRoleInput?.value || "").toString();
  if (roleId) {
    setChannelPermissionOverride(channel, roleId, "viewChannel", ui.channelPermViewInput?.value || "inherit");
    setChannelPermissionOverride(channel, roleId, "sendMessages", ui.channelPermSendInput?.value || "inherit");
    setChannelPermissionOverride(channel, roleId, "addReactions", ui.channelPermReactInput?.value || "inherit");
    setChannelPermissionOverride(channel, roleId, "createThreads", ui.channelPermThreadInput?.value || "inherit");
  }
  saveState();
  ui.channelSettingsDialog.close();
  render();
});

ui.deleteChannelBtn.addEventListener("click", () => {
  const guild = getActiveGuild();
  const channel = getActiveChannel();
  if (!guild || !channel) return;
  if (guild.channels.length <= 1) {
    notifyPermissionDenied("Cannot delete the last channel");
    return;
  }
  guild.channels = guild.channels.filter((entry) => entry.id !== channel.id);
  state.activeChannelId = getFirstOpenableChannelIdForGuild(guild);
  saveState();
  ui.channelSettingsDialog.close();
  render();
});

ui.rolesCloseBtn.addEventListener("click", () => ui.rolesDialog.close());
ui.pinsCloseBtn.addEventListener("click", () => ui.pinsDialog.close());

ui.createRoleNowBtn.addEventListener("click", () => {
  const server = getActiveServer();
  if (!server) return;
  const name = ui.roleNameInput.value.trim().slice(0, 28);
  if (!name) return;
  const color = ui.roleColorInput.value.trim() || "#b5bac1";
  const preset = ui.rolePermPresetInput.value;
  server.roles.push(createRole(name, color, preset));
  saveState();
  renderRolesDialog();
  ui.roleNameInput.value = "";
  ui.roleColorInput.value = "";
  if (ui.roleColorPicker) ui.roleColorPicker.value = normalizeColorForPicker("#b5bac1", "#b5bac1");
});
ui.roleColorInput?.addEventListener("input", () => {
  if (ui.roleColorPicker) {
    ui.roleColorPicker.value = normalizeColorForPicker(ui.roleColorInput.value || "#b5bac1", "#b5bac1");
  }
});
ui.roleColorPicker?.addEventListener("input", () => {
  ui.roleColorInput.value = ui.roleColorPicker.value;
});

ui.assignRoleBtn.addEventListener("click", () => {
  const server = getActiveServer();
  if (!server) return;
  const memberId = ui.assignRoleMemberInput.value;
  const roleId = ui.assignRoleRoleInput.value;
  if (!memberId || !roleId) return;
  if (!server.memberRoles || typeof server.memberRoles !== "object") {
    server.memberRoles = {};
  }
  if (!Array.isArray(server.memberRoles[memberId])) server.memberRoles[memberId] = [];
  if (!server.memberRoles[memberId].includes(roleId)) {
    server.memberRoles[memberId].push(roleId);
  }
  saveState();
});

ui.removeRoleBtn.addEventListener("click", () => {
  const server = getActiveServer();
  if (!server) return;
  const memberId = ui.assignRoleMemberInput.value;
  const roleId = ui.assignRoleRoleInput.value;
  if (!memberId || !roleId) return;
  if (!Array.isArray(server.memberRoles?.[memberId])) return;
  server.memberRoles[memberId] = server.memberRoles[memberId].filter((id) => id !== roleId);
  saveState();
});

ui.messageEditCancel.addEventListener("click", () => {
  messageEditTarget = null;
  ui.messageEditDialog.close();
});

ui.messageEditInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    messageEditTarget = null;
    ui.messageEditDialog.close();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    ui.messageEditForm.requestSubmit();
  }
});

ui.messageEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!messageEditTarget) return;
  const editor = getCurrentAccount();
  if (!editor) return;
  const nextText = ui.messageEditInput.value.trim().slice(0, 400);
  let scopedMessage = null;
  let scopedChannel = null;
  let isDmConversation = false;
  const scopedThread = state.dmThreads.find((thread) => thread.id === messageEditTarget.conversationId) || null;
  if (scopedThread) {
    scopedMessage = findMessageInChannel(scopedThread, messageEditTarget.messageId);
    isDmConversation = true;
  } else {
    scopedChannel = findChannelById(messageEditTarget.conversationId);
    scopedMessage = findMessageInChannel(scopedChannel, messageEditTarget.messageId);
  }
  if (!scopedMessage) return;
  const canManage = !isDmConversation && scopedChannel && hasServerPermission(getActiveServer(), editor.id, "manageMessages");
  const canEdit = canEditMessageEntry(scopedMessage, {
    isDm: isDmConversation,
    canManageMessages: Boolean(canManage),
    currentUser: editor
  });
  if (!canEdit) {
    showToast("You cannot edit this message.", { tone: "error" });
    return;
  }
  const previousText = (scopedMessage.text || "").toString();
  if (previousText !== nextText) {
    if (!Array.isArray(scopedMessage.editHistory)) scopedMessage.editHistory = [];
    scopedMessage.editHistory.unshift({
      editedAt: new Date().toISOString(),
      editorUserId: editor.id,
      editorName: editor.username,
      previousText
    });
    if (scopedMessage.editHistory.length > 25) scopedMessage.editHistory = scopedMessage.editHistory.slice(0, 25);
  }
  scopedMessage.text = nextText;
  scopedMessage.editedAt = new Date().toISOString();
  scopedMessage.editedByUserId = editor.id;
  scopedMessage.editedByName = editor.username;
  scopedMessage.editedByStaff = Boolean(!isDmConversation && canManage && scopedMessage.userId && scopedMessage.userId !== editor.id);
  saveState();
  messageEditTarget = null;
  ui.messageEditDialog.close();
  renderMessages();
});

ui.selfProfileBtn.addEventListener("click", () => {
  renderSelfPopout();
  ui.selfMenuDialog.showModal();
});

ui.openSettingsBtn.addEventListener("click", openSettingsScreen);

ui.closeSettingsBtn.addEventListener("click", closeSettingsScreen);

ui.settingsNavItems.forEach((item) => {
  item.addEventListener("click", () => setSettingsTab(item.dataset.settingsTab));
});

ui.settingsEditProfile.addEventListener("click", () => {
  closeSettingsScreen();
  openProfileEditor();
});

ui.settingsOpenProfileEditor.addEventListener("click", () => {
  closeSettingsScreen();
  openProfileEditor();
});

ui.settingsSwitchAccount.addEventListener("click", () => {
  closeSettingsScreen();
  selectedSwitchAccountId = state.currentAccountId;
  renderAccountSwitchList();
  ui.newAccountInput.value = "";
  ui.accountSwitchDialog.showModal();
});

ui.settingsLogout.addEventListener("click", () => {
  disconnectRelaySocket({ manual: true });
  state.currentAccountId = null;
  clearRememberedAccountSession();
  closeSettingsScreen();
  saveState();
  render();
});

ui.guildNotifForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const guild = getActiveGuild();
  if (!guild) return;
  setGuildNotificationMode(guild.id, ui.guildNotifModeInput.value);
  saveState();
  renderServers();
  renderChannels();
  renderSettingsScreen();
});

ui.appearanceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.preferences = getPreferences();
  state.preferences.uiScale = Math.min(115, Math.max(90, Number(ui.uiScaleInput.value) || 100));
  state.preferences.theme = normalizeTheme(ui.themeInput.value);
  state.preferences.compactMembers = normalizeToggle(ui.compactModeInput.value);
  saveState();
  render();
});

ui.advancedForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.preferences = getPreferences();
  state.preferences.developerMode = normalizeToggle(ui.developerModeInput.value);
  state.preferences.debugOverlay = normalizeToggle(ui.debugOverlayInput.value);
  state.preferences.swfAudioPolicy = normalizeSwfAudioPolicy(ui.swfAudioPolicyInput.value);
  state.preferences.swfAudioScope = normalizeSwfAudioScope(ui.swfAudioScopeInput.value);
  state.preferences.swfAutoplay = normalizeSwfAutoplay(ui.swfAutoplayInput.value);
  state.preferences.swfPauseOnMute = normalizeToggle(ui.swfPauseOnMuteInput.value);
  state.preferences.swfVuMeter = normalizeToggle(ui.swfVuMeterInput.value);
  state.preferences.relayMode = normalizeRelayMode(ui.relayModeInput?.value || "local");
  state.preferences.relayUrl = normalizeRelayUrl(ui.relayUrlInput?.value || "");
  state.preferences.relayRoom = normalizeRelayRoom(ui.relayRoomInput?.value || "");
  state.preferences.relayAutoConnect = normalizeToggle(ui.relayAutoConnectInput?.value || "on");
  if (!state.preferences.relayClientId) state.preferences.relayClientId = createId();
  state.preferences.xmppJid = normalizeXmppJid(ui.xmppJidInput?.value || "");
  state.preferences.xmppPassword = normalizeXmppPassword(ui.xmppPasswordInput?.value || "");
  state.preferences.xmppWsUrl = normalizeXmppWsUrl(ui.xmppWsUrlInput?.value || "");
  state.preferences.xmppMucService = normalizeXmppMucService(ui.xmppMucServiceInput?.value || "");
  saveState();
  if (["ws", "http", "xmpp"].includes(state.preferences.relayMode) && state.preferences.relayAutoConnect === "on") {
    connectRelaySocket({ force: true });
  } else if (!["ws", "http", "xmpp"].includes(state.preferences.relayMode)) {
    disconnectRelaySocket({ manual: true });
  }
  renderRelayStatusOutput();
  refreshSwfAudioFocus();
  render();
});

ui.relayConnectBtn?.addEventListener("click", () => {
  state.preferences = getPreferences();
  state.preferences.relayMode = normalizeRelayMode(ui.relayModeInput?.value || "ws");
  state.preferences.relayUrl = normalizeRelayUrl(ui.relayUrlInput?.value || "");
  state.preferences.relayRoom = normalizeRelayRoom(ui.relayRoomInput?.value || "");
  state.preferences.relayAutoConnect = normalizeToggle(ui.relayAutoConnectInput?.value || "on");
  if (!state.preferences.relayClientId) state.preferences.relayClientId = createId();
  state.preferences.xmppJid = normalizeXmppJid(ui.xmppJidInput?.value || "");
  state.preferences.xmppPassword = normalizeXmppPassword(ui.xmppPasswordInput?.value || "");
  state.preferences.xmppWsUrl = normalizeXmppWsUrl(ui.xmppWsUrlInput?.value || "");
  state.preferences.xmppMucService = normalizeXmppMucService(ui.xmppMucServiceInput?.value || "");
  saveState();
  connectRelaySocket({ force: true });
});

ui.relayDisconnectBtn?.addEventListener("click", () => {
  disconnectRelaySocket({ manual: true });
});

ui.exportDataBtn.addEventListener("click", () => {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shitcord67-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

ui.importDataBtn.addEventListener("click", () => ui.importDataInput.click());
function triggerImportSwfSaves() {
  ui.importSwfSavesInput.click();
}
ui.importSwfSavesBtn.addEventListener("click", triggerImportSwfSaves);

function collectRuffleSaveEntries() {
  const entries = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (!/(ruffle|sharedobject|flash|\.sol)/i.test(key)) continue;
    const value = localStorage.getItem(key);
    if (value === null) continue;
    entries.push({ key, value });
  }
  return entries;
}

function exportSwfSavesNow() {
  const payload = {
    exportedAt: new Date().toISOString(),
    origin: location.origin,
    entries: collectRuffleSaveEntries()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shitcord67-swf-saves-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

ui.exportSwfSavesBtn.addEventListener("click", exportSwfSavesNow);

ui.openDebugConsoleBtn.addEventListener("click", () => {
  openDebugDialog();
});

ui.openXmppConsoleBtn?.addEventListener("click", () => {
  openXmppConsoleDialog();
});

ui.refreshDebugBtn.addEventListener("click", () => {
  renderDebugDialog();
});

ui.copyDebugBtn.addEventListener("click", () => {
  void copyText(formatDebugLogs()).then((ok) => {
    showToast(ok ? "Debug logs copied." : "Clipboard blocked. Manual copy prompt opened.", { tone: ok ? "info" : "error" });
  });
});

ui.clearDebugBtn.addEventListener("click", () => {
  debugLogs.length = 0;
  addDebugLog("info", "Debug log cleared");
  renderDebugDialog();
});

ui.debugCloseBtn.addEventListener("click", () => {
  ui.debugDialog.close();
});

ui.refreshXmppConsoleBtn?.addEventListener("click", () => {
  renderXmppConsoleDialog();
});

ui.copyXmppConsoleBtn?.addEventListener("click", () => {
  void copyText(formatXmppConsoleLogs()).then((ok) => {
    showToast(ok ? "XMPP logs copied." : "Clipboard blocked. Manual copy prompt opened.", { tone: ok ? "info" : "error" });
  });
});

ui.clearXmppConsoleBtn?.addEventListener("click", () => {
  xmppDebugEvents.length = 0;
  addXmppDebugEvent("runtime", "XMPP console log cleared");
  renderXmppConsoleDialog();
});

ui.pauseXmppConsoleBtn?.addEventListener("click", () => {
  xmppDebugPaused = !xmppDebugPaused;
  renderXmppConsoleDialog();
});

ui.xmppConsoleFilterInput?.addEventListener("change", () => {
  xmppDebugFilter = (ui.xmppConsoleFilterInput?.value || "all").toString();
  renderXmppConsoleDialog();
});

ui.xmppConsoleSearchInput?.addEventListener("input", () => {
  xmppDebugSearch = (ui.xmppConsoleSearchInput?.value || "").toString();
  renderXmppConsoleDialog();
});

ui.xmppConsoleCloseBtn?.addEventListener("click", () => {
  ui.xmppConsoleDialog?.close();
});

ui.importDataInput.addEventListener("change", async () => {
  const file = ui.importDataInput.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    state = migrateState(parsed);
    saveState();
    render();
    closeSettingsScreen();
  } catch {
    const channel = getActiveChannel();
    if (channel) {
      addSystemMessage(channel, "Import failed: invalid JSON snapshot.");
      saveState();
      renderMessages();
    }
  } finally {
    ui.importDataInput.value = "";
  }
});

ui.importSwfSavesInput.addEventListener("change", async () => {
  const file = ui.importSwfSavesInput.files?.[0];
  if (!file) return;
  try {
    const content = await file.text();
    const parsed = JSON.parse(content);
    const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
    let imported = 0;
    entries.forEach((entry) => {
      if (!entry || typeof entry.key !== "string" || typeof entry.value !== "string") return;
      localStorage.setItem(entry.key, entry.value);
      imported += 1;
    });
    addDebugLog("info", "Imported SWF save entries", { imported });
    alert(`Imported ${imported} SWF save entr${imported === 1 ? "y" : "ies"}.`);
  } catch {
    alert("Failed to import SWF saves JSON.");
  } finally {
    ui.importSwfSavesInput.value = "";
  }
});

ui.dockMuteBtn.addEventListener("click", () => {
  state.preferences = getPreferences();
  state.preferences.mute = state.preferences.mute === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
});

ui.dockHeadphonesBtn.addEventListener("click", () => {
  state.preferences = getPreferences();
  state.preferences.deafen = state.preferences.deafen === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
});

ui.selfEditProfile.addEventListener("click", () => {
  ui.selfMenuDialog.close();
  openProfileEditor();
});

ui.selfCosmeticsShop?.addEventListener("click", () => {
  ui.selfMenuDialog.close();
  openCosmeticsDialog("decor");
});

ui.selfQuestStats?.addEventListener("click", () => {
  const account = getCurrentAccount();
  if (!account) return;
  showToast(formatQuestSummaryText(account.id));
  ui.selfMenuDialog.close();
});

ui.selfSwitchAccount.addEventListener("click", () => {
  ui.selfMenuDialog.close();
  selectedSwitchAccountId = state.currentAccountId;
  renderAccountSwitchList();
  ui.newAccountInput.value = "";
  ui.accountSwitchDialog.showModal();
});

ui.selfLogout.addEventListener("click", () => {
  disconnectRelaySocket({ manual: true });
  state.currentAccountId = null;
  clearRememberedAccountSession();
  ui.selfMenuDialog.close();
  saveState();
  render();
});

ui.userStartDmBtn.addEventListener("click", () => {
  const target = selectedUserPopoutId ? getAccountById(selectedUserPopoutId) : null;
  if (!target) return;
  ui.userPopoutDialog.close();
  openDmWithAccount(target);
});

ui.userSendDmBtn.addEventListener("click", () => {
  const target = selectedUserPopoutId ? getAccountById(selectedUserPopoutId) : null;
  if (!target) return;
  const sent = sendDirectMessageToAccount(target, ui.userDmInput.value);
  if (!sent) return;
  ui.userDmInput.value = "";
  ui.userPopoutDialog.close();
});

ui.userDmInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  ui.userSendDmBtn.click();
});

ui.userSaveNoteBtn.addEventListener("click", () => {
  const current = getCurrentAccount();
  if (!current || !selectedUserPopoutId) return;
  setUserNote(current.id, selectedUserPopoutId, ui.userNoteInput.value);
  saveState();
});

ui.profileCancel.addEventListener("click", () => ui.profileDialog.close());
ui.profileOpenCosmeticsBtn?.addEventListener("click", () => openCosmeticsDialog("decor"));

ui.cosmeticsTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    cosmeticsTab = normalizeCosmeticsTab(tab.dataset.cosmeticsTab);
    renderCosmeticsDialog();
  });
});

ui.cosmeticsCloseBtn?.addEventListener("click", () => ui.cosmeticsDialog?.close());

ui.profileAvatarUploadBtn.addEventListener("click", () => {
  ui.profileAvatarFileInput.click();
});

ui.profileAvatarClearBtn.addEventListener("click", () => {
  ui.profileAvatarUrlInput.value = "";
  ui.profileAvatarFileInput.value = "";
  setProfileAvatarUploadHint("Avatar image cleared.");
  renderProfileAvatarPreview();
  renderProfileIdentityPreview();
});

ui.profileAvatarInput.addEventListener("input", renderProfileAvatarPreview);
ui.profileAvatarInput.addEventListener("input", () => {
  if (ui.profileAvatarColorPicker) {
    ui.profileAvatarColorPicker.value = normalizeColorForPicker(ui.profileAvatarInput.value || "#57f287", "#57f287");
  }
  renderProfileIdentityPreview();
});
ui.profileAvatarColorPicker?.addEventListener("input", () => {
  ui.profileAvatarInput.value = ui.profileAvatarColorPicker.value;
  renderProfileAvatarPreview();
  renderProfileIdentityPreview();
});
ui.profileGuildAvatarInput?.addEventListener("input", () => {
  if (ui.profileGuildAvatarColorPicker) {
    ui.profileGuildAvatarColorPicker.value = normalizeColorForPicker(ui.profileGuildAvatarInput.value || "#57f287", "#57f287");
  }
});
ui.profileGuildAvatarColorPicker?.addEventListener("input", () => {
  ui.profileGuildAvatarInput.value = ui.profileGuildAvatarColorPicker.value;
});
ui.profileAvatarUrlInput.addEventListener("input", renderProfileAvatarPreview);
ui.profileAvatarUrlInput.addEventListener("input", renderProfileIdentityPreview);
ui.displayNameInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileStatusInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileStatusEmojiInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileBannerInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileAvatarDecorationInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileGuildTagInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileEffectInput?.addEventListener("change", renderProfileIdentityPreview);
ui.profileNameplateSvgInput?.addEventListener("input", renderProfileIdentityPreview);
ui.presenceInput?.addEventListener("change", renderProfileIdentityPreview);
ui.profileIdentityClearBtn?.addEventListener("click", () => {
  if (ui.profileAvatarDecorationInput) ui.profileAvatarDecorationInput.value = "";
  if (ui.profileGuildTagInput) ui.profileGuildTagInput.value = "";
  if (ui.profileEffectInput) ui.profileEffectInput.value = "none";
  if (ui.profileNameplateSvgInput) ui.profileNameplateSvgInput.value = "";
  renderProfileIdentityPreview();
});

ui.profileAvatarFileInput.addEventListener("change", async () => {
  const file = ui.profileAvatarFileInput.files?.[0];
  await applyProfileAvatarFile(file);
  ui.profileAvatarFileInput.value = "";
  renderProfileIdentityPreview();
});

ui.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const account = getCurrentAccount();
  const guild = getActiveGuild();
  if (!account) return;

  account.displayName = ui.displayNameInput.value.trim().slice(0, 32) || account.username;
  account.bio = ui.profileBioInput.value.trim().slice(0, 180);
  account.customStatus = ui.profileStatusInput.value.trim().slice(0, 80);
  account.customStatusEmoji = ui.profileStatusEmojiInput.value.trim().slice(0, 4);
  account.avatarDecoration = ui.profileAvatarDecorationInput.value.trim().slice(0, 4);
  account.guildTag = ui.profileGuildTagInput.value.trim().slice(0, 8).toUpperCase();
  account.profileEffect = normalizeProfileEffect(ui.profileEffectInput.value);
  account.profileNameplateSvg = ui.profileNameplateSvgInput.value.trim().slice(0, 280);
  account.customStatusExpiresAt = account.customStatus
    ? parseStatusExpiryAt(ui.profileStatusExpiryInput.value)
    : null;
  if (!account.customStatus) account.customStatusEmoji = "";
  account.presence = normalizePresence(ui.presenceInput.value);
  account.banner = ui.profileBannerInput.value.trim();
  account.avatarColor = ui.profileAvatarInput.value.trim() || "#57f287";
  const avatarUrl = ui.profileAvatarUrlInput.value.trim();
  account.avatarUrl = isRenderableAvatarUrl(avatarUrl) ? avatarUrl : "";
  if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
  if (guild) {
    const guildNickname = ui.profileGuildNicknameInput.value.trim().slice(0, 32);
    const guildAvatarColor = ui.profileGuildAvatarInput.value.trim();
    const guildAvatarUrlRaw = ui.profileGuildAvatarUrlInput.value.trim();
    const guildAvatarUrl = isRenderableAvatarUrl(guildAvatarUrlRaw) ? guildAvatarUrlRaw : "";
    const guildBanner = ui.profileGuildBannerInput.value.trim();
    const guildStatus = ui.profileGuildStatusInput.value.trim().slice(0, 80);
    if (guildNickname) {
      account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), nickname: guildNickname };
    }
    if (guildAvatarColor) {
      account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), avatarColor: guildAvatarColor };
    }
    if (guildAvatarUrl) {
      account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), avatarUrl: guildAvatarUrl };
    } else if (account.guildProfiles[guild.id]) {
      delete account.guildProfiles[guild.id].avatarUrl;
    }
    if (guildBanner) {
      account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), banner: guildBanner };
    } else if (account.guildProfiles[guild.id]) {
      delete account.guildProfiles[guild.id].banner;
    }
    if (guildStatus) {
      account.guildProfiles[guild.id] = {
        ...(account.guildProfiles[guild.id] || {}),
        status: guildStatus,
        statusEmoji: account.customStatusEmoji || ""
      };
    } else if (account.guildProfiles[guild.id]) {
      delete account.guildProfiles[guild.id].status;
      delete account.guildProfiles[guild.id].statusEmoji;
    }
    if (!guildNickname && account.guildProfiles[guild.id]) delete account.guildProfiles[guild.id].nickname;
    if (!guildAvatarColor && account.guildProfiles[guild.id]) delete account.guildProfiles[guild.id].avatarColor;
    if (account.guildProfiles[guild.id] && Object.keys(account.guildProfiles[guild.id]).length === 0) {
      delete account.guildProfiles[guild.id];
    }
  }

  saveState();
  ui.profileDialog.close();
  render();
});

ui.accountCancel.addEventListener("click", () => ui.accountSwitchDialog.close());

ui.accountSwitchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const typed = ui.newAccountInput.value.trim();

  if (typed) {
    createOrSwitchAccount(typed);
  } else if (selectedSwitchAccountId) {
    state.currentAccountId = selectedSwitchAccountId;
    rememberAccountSession(selectedSwitchAccountId);
    const prefs = getPreferences();
    if (["ws", "http", "xmpp"].includes(prefs.relayMode) && prefs.relayAutoConnect === "on") connectRelaySocket({ force: true });
  }

  ensureCurrentUserInActiveServer();
  saveState();
  ui.accountSwitchDialog.close();
  render();
});

[
  ui.profileDialog,
  ui.createServerDialog,
  ui.createChannelDialog,
  ui.topicDialog,
  ui.rolesDialog,
  ui.pinsDialog,
  ui.channelSettingsDialog,
  ui.messageEditDialog,
  ui.findDialog,
  ui.shortcutsDialog,
  ui.quickSwitchDialog,
  ui.selfMenuDialog,
  ui.userPopoutDialog,
  ui.accountSwitchDialog,
  ui.xmppProviderDialog,
  ui.xmppRegisterDialog,
  ui.debugDialog,
  ui.xmppConsoleDialog,
  ui.cosmeticsDialog,
  ui.swfViewerDialog
].forEach(wireDialogBackdropClose);

document.addEventListener("click", (event) => {
  if (contextMenuOpen) {
    if (!ui.contextMenu.contains(event.target)) closeContextMenu();
  }
  if (mediaPickerOpen) {
    const inPicker = ui.mediaPicker.contains(event.target);
    const onToggle = ui.openMediaPickerBtn.contains(event.target)
      || ui.toggleSwfAudioBtn.contains(event.target)
      || ui.quickFileAttachBtn.contains(event.target)
      || ui.openGifPickerBtn?.contains(event.target)
      || ui.openStickerPickerBtn?.contains(event.target)
      || ui.openEmojiPickerBtn?.contains(event.target);
    if (!inPicker && !onToggle) closeMediaPicker();
  }
});

function maybeHandleComposerDrop(event) {
  if (!state.currentAccountId) return false;
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return false;
  event.preventDefault();
  event.stopPropagation();
  const list = [...files].slice(0, 6);
  void (async () => {
    let attachedCount = 0;
    for (const file of list) {
      const inferred = inferAttachmentTypeFromFile(file);
      const allowed = getComposerAttachAllowedTypes();
      if (!allowed.has(inferred)) continue;
      // eslint-disable-next-line no-await-in-loop
      const attached = await attachFileToComposer(file);
      if (attached) attachedCount += 1;
    }
    if (attachedCount <= 0) return;
    ui.messageInput.focus();
    showToast(attachedCount > 1 ? `${attachedCount} files attached. Press Enter to send.` : "Attachment added. Press Enter to send.");
  }).catch(() => {
    showToast("Failed to attach dropped file.", { tone: "error" });
  });
  return list.length > 0;
}

document.addEventListener("dragover", (event) => {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  const allowed = getComposerAttachAllowedTypes();
  const hasSupported = [...files].some((file) => allowed.has(inferAttachmentTypeFromFile(file)));
  if (!hasSupported) return;
  event.preventDefault();
  ui.messageForm.classList.add("message-form--drop");
});

document.addEventListener("dragleave", () => {
  ui.messageForm.classList.remove("message-form--drop");
});

document.addEventListener("drop", (event) => {
  ui.messageForm.classList.remove("message-form--drop");
  maybeHandleComposerDrop(event);
});

document.addEventListener("contextmenu", (event) => {
  if (event.defaultPrevented) return;
  const target = event.target;
  if (target instanceof HTMLElement && target.closest("#contextMenu, .context-submenu")) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (target instanceof HTMLElement) {
    const isEditable = target.closest("input, textarea, [contenteditable='true']");
    const insideApp = Boolean(target.closest("#app"));
    const allowNativeMenu = shouldUseNativeContextMenu(target);
    if (insideApp && !isEditable && !allowNativeMenu) {
      event.preventDefault();
      if (!contextMenuOpen) return;
      if (ui.contextMenu.contains(target)) return;
      closeContextMenu();
      return;
    }
    if (allowNativeMenu && contextMenuOpen && !ui.contextMenu.contains(target)) {
      closeContextMenu();
      return;
    }
  }
  if (!contextMenuOpen) return;
  if (ui.contextMenu.contains(event.target)) return;
  closeContextMenu();
});

document.addEventListener("keydown", (event) => {
  if (!contextMenuOpen) return;
  const activeEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const activeMenu = activeEl?.closest(".context-submenu, #contextMenu");
  const menuRoot = activeMenu instanceof HTMLElement ? activeMenu : ui.contextMenu;
  const buttons = [...menuRoot.querySelectorAll("button:not(:disabled)")];
  let focusIndex = activeEl ? buttons.indexOf(activeEl) : -1;
  if (focusIndex < 0) {
    focusIndex = menuRoot === ui.contextMenu
      ? Math.max(0, Math.min(contextMenuFocusIndex, buttons.length - 1))
      : 0;
  }
  if (buttons.length === 0) {
    if (event.key === "Escape") closeContextMenu();
    return;
  }
  const focusButton = (index) => {
    const nextIndex = Math.max(0, Math.min(index, buttons.length - 1));
    if (menuRoot === ui.contextMenu) contextMenuFocusIndex = nextIndex;
    buttons[nextIndex]?.focus();
  };
  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusButton((focusIndex + 1) % buttons.length);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    focusButton((focusIndex - 1 + buttons.length) % buttons.length);
    return;
  }
  if (event.key === "ArrowRight") {
    const focused = buttons[focusIndex];
    if (!focused?.classList.contains("context-menu__has-submenu")) return;
    event.preventDefault();
    focused.click();
    const submenuButtons = [...document.querySelectorAll(".context-submenu button:not(:disabled)")];
    if (submenuButtons.length > 0) submenuButtons[0].focus();
    return;
  }
  if (event.key === "ArrowLeft") {
    if (!(menuRoot instanceof HTMLElement) || !menuRoot.classList.contains("context-submenu")) return;
    event.preventDefault();
    document.querySelectorAll(".context-submenu").forEach((node) => node.remove());
    if (contextMenuSubmenuAnchor instanceof HTMLButtonElement) {
      const mainButtons = [...ui.contextMenu.querySelectorAll("button:not(:disabled)")];
      const anchorIndex = mainButtons.indexOf(contextMenuSubmenuAnchor);
      if (anchorIndex >= 0) contextMenuFocusIndex = anchorIndex;
      contextMenuSubmenuAnchor.focus();
    }
    return;
  }
  if (event.key === "Home") {
    event.preventDefault();
    focusButton(0);
    return;
  }
  if (event.key === "End") {
    event.preventDefault();
    focusButton(buttons.length - 1);
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    buttons[focusIndex]?.click();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeContextMenu();
  }
});

window.addEventListener("resize", () => {
  closeContextMenu();
  closeMediaPicker();
  if (currentViewerRuntimeKey) {
    const runtime = swfRuntimes.get(currentViewerRuntimeKey);
    if (runtime?.floating) positionFloatingSwfHost(runtime);
  }
  updateSwfPipDockLayout();
  renderSwfPipDock();
});
window.addEventListener("hashchange", () => {
  if (!state.currentAccountId) return;
  safeRender("hashchange");
});
window.addEventListener("beforeunload", (event) => {
  if (!hasPendingComposerChanges()) return;
  event.preventDefault();
  event.returnValue = "";
});
document.addEventListener("scroll", closeContextMenu, true);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    updateSwfPipDockLayout();
    renderSwfPipDock();
  });
  window.visualViewport.addEventListener("scroll", () => {
    updateSwfPipDockLayout();
    renderSwfPipDock();
  });
}

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    let foundKey = null;
    swfRuntimes.forEach((runtime, key) => {
      if (runtime.host === document.fullscreenElement) foundKey = key;
    });
    fullscreenRuntimeKey = foundKey;
    if (foundKey) setSwfPlayback(foundKey, true, "user");
    return;
  }
  if (!fullscreenRuntimeKey) return;
  setSwfPlayback(fullscreenRuntimeKey, false, "system");
  fullscreenRuntimeKey = null;
});

document.addEventListener("keydown", (event) => {
  const lightbox = document.getElementById("mediaLightbox");
  if (event.key === "Escape" && lightbox && !lightbox.hidden) {
    event.preventDefault();
    closeMediaLightbox();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "/") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openShortcutsDialog();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === "0" || event.code === "Digit0")) {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openShortcutsDialog();
    return;
  }
  if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey) {
    if (!state.currentAccountId) return;
    const key = event.key.toLowerCase();
    if (key === "d") {
      event.preventDefault();
      toggleDmSectionCollapsed();
      return;
    }
    if (key === "c") {
      event.preventDefault();
      toggleGuildSectionCollapsed();
      return;
    }
    if (key === "r") {
      event.preventDefault();
      ui.markChannelReadBtn?.click();
      return;
    }
    if (key === "a") {
      event.preventDefault();
      const account = getCurrentAccount();
      if (!account) return;
      if (!markAllReadForAccount(account.id)) {
        showToast("Everything already read.");
        return;
      }
      saveState();
      render();
      return;
    }
    if (key === "g") {
      event.preventDefault();
      const guild = getActiveGuild();
      if (!guild) return;
      const current = getGuildNotificationMode(guild.id);
      const next = current === "all" ? "mentions" : current === "mentions" ? "mute" : "all";
      setGuildNotificationMode(guild.id, next);
      saveState();
      renderServers();
      renderChannels();
      showToast(`Guild notifications: ${next}`);
      return;
    }
  }
  if (event.altKey && event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    event.preventDefault();
    const moved = moveActiveChannelByOffset(event.key === "ArrowUp" ? -1 : 1);
    if (!moved) showToast("Cannot move channel further.");
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    if (!state.currentAccountId) return;
    const altDigit = (event.code || "").startsWith("Digit")
      ? (event.code || "").slice(5)
      : event.key;
    if (altDigit === "1") {
      event.preventDefault();
      openMediaPickerWithTab("gif");
      return;
    }
    if (altDigit === "2") {
      event.preventDefault();
      openMediaPickerWithTab("sticker");
      return;
    }
    if (altDigit === "3") {
      event.preventDefault();
      openMediaPickerWithTab("emoji");
      return;
    }
    if (altDigit === "4") {
      event.preventDefault();
      openMediaPickerWithTab("pdf");
      return;
    }
    if (altDigit === "5") {
      event.preventDefault();
      openMediaPickerWithTab("text");
      return;
    }
    if (altDigit === "6") {
      event.preventDefault();
      openMediaPickerWithTab("docs");
      return;
    }
    if (altDigit === "7") {
      event.preventDefault();
      openMediaPickerWithTab("html");
      return;
    }
    if (altDigit === "8") {
      event.preventDefault();
      openMediaPickerWithTab("swf");
      return;
    }
    if (altDigit === "9") {
      event.preventDefault();
      openMediaPickerWithTab("svg");
      return;
    }
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "f") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    const target = getViewMode() === "dm" ? ui.dmSearchInput : ui.channelFilterInput;
    target?.focus();
    target?.select?.();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "f") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openFindDialog();
    return;
  }
  if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "F3") {
    if (!state.currentAccountId) return;
    if (!findQuery.trim()) {
      event.preventDefault();
      openFindDialog();
      return;
    }
    event.preventDefault();
    moveFindSelection(event.shiftKey ? -1 : 1);
    return;
  }
  if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "g") {
    if (!state.currentAccountId) return;
    if (!findQuery.trim()) {
      event.preventDefault();
      openFindDialog();
      return;
    }
    event.preventDefault();
    moveFindSelection(event.shiftKey ? -1 : 1);
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "n") {
    if (!state.currentAccountId) return;
    if (!canCurrentUser("manageChannels")) {
      showToast("Manage Channels required.", { tone: "error" });
      return;
    }
    event.preventDefault();
    ui.channelNameInput.value = "";
    ui.channelTypeInput.value = "text";
    ui.createChannelDialog.showModal();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "d") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    ui.newDmBtn.click();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "k") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openQuickSwitcher();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "b") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    toggleChannelPanelVisibility();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "m") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    toggleMemberPanelVisibility();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "l") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    ui.messageInput.focus();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "u") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    ui.memberSearchInput?.focus();
    ui.memberSearchInput?.select?.();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    const delta = event.key === "ArrowUp" ? -1 : 1;
    navigateGuildChannelByOffset(delta);
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === "Home" || event.key === "End")) {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    event.preventDefault();
    const channels = getGuildChannelsForNavigation();
    if (channels.length === 0) return;
    const target = event.key === "Home" ? channels[0] : channels[channels.length - 1];
    if (!target || target.id === state.activeChannelId) return;
    state.viewMode = "guild";
    state.activeDmId = null;
    state.activeChannelId = target.id;
    saveState();
    render();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "i") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    renderPinsDialog();
    ui.pinsDialog.showModal();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "r") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() === "dm") return;
    event.preventDefault();
    const channel = getActiveChannel();
    const account = getCurrentAccount();
    if (!channel || !account) return;
    if (!markChannelRead(channel, account.id)) return;
    saveState();
    render();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "q") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    const account = getCurrentAccount();
    if (!account) return;
    showToast(formatQuestSummaryText(account.id));
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "y") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    openProfileEditor();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "n") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    jumpToUnreadGuildChannel(1);
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "p") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    jumpToUnreadGuildChannel(-1);
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "u") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    ui.quickAttachInput.click();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "o") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    openMediaPickerWithTab("pdf");
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "v") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    const channel = getActiveChannel();
    const current = getCurrentAccount();
    if (!channel || !current) return;
    if (!(channel.type === "voice" || channel.type === "stage")) return;
    ensureVoiceStateForChannel(channel);
    event.preventDefault();
    const isConnected = channel.voiceState.connectedIds.includes(current.id);
    const changed = isConnected
      ? leaveVoiceLikeChannel(channel, current.id)
      : joinVoiceLikeChannel(channel, current.id);
    if (!changed) return;
    saveState();
    render();
    showToast(isConnected ? "Left channel." : "Joined channel.");
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "j") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    const guild = getActiveGuild();
    const current = getCurrentAccount();
    if (!guild || !current) return;
    const voices = (guild.channels || []).filter((entry) => entry.type === "voice" || entry.type === "stage");
    if (voices.length === 0) return;
    voices.forEach((entry) => ensureVoiceStateForChannel(entry));
    const connected = voices.find((entry) => entry.voiceState.connectedIds.includes(current.id));
    const target = connected || voices
      .slice()
      .sort((a, b) => b.voiceState.connectedIds.length - a.voiceState.connectedIds.length)[0];
    if (!target) return;
    event.preventDefault();
    state.activeChannelId = target.id;
    const changed = connected
      ? leaveVoiceLikeChannel(target, current.id)
      : joinVoiceLikeChannel(target, current.id);
    saveState();
    render();
    showToast(changed
      ? (connected ? `Left #${target.name}.` : `Joined #${target.name}.`)
      : `Already in #${target.name}.`);
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "m") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    const channel = getActiveChannel();
    const current = getCurrentAccount();
    if (!channel || !current) return;
    if (!(channel.type === "voice" || channel.type === "stage")) return;
    ensureVoiceStateForChannel(channel);
    if (!channel.voiceState.connectedIds.includes(current.id)) return;
    event.preventDefault();
    const changed = toggleVoiceMuteForSelf(channel, current.id);
    if (!changed) return;
    const isMuted = channel.voiceState.mutedIds.includes(current.id);
    saveState();
    render();
    showToast(isMuted ? "Muted." : "Unmuted.");
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "k") {
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    const dmMode = getViewMode() === "dm";
    const focusTarget = dmMode ? ui.dmSearchInput : ui.channelFilterInput;
    focusTarget?.focus();
    focusTarget?.select?.();
    return;
  }
  if (event.ctrlKey && event.key === ",") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openSettingsScreen();
    return;
  }
  if (event.altKey && event.key.toLowerCase() === "d") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    state.viewMode = getViewMode() === "dm" ? "guild" : "dm";
    if (state.viewMode === "guild" && !state.activeGuildId && state.guilds[0]) {
      state.activeGuildId = state.guilds[0].id;
      state.activeChannelId = getFirstOpenableChannelIdForGuild(state.guilds[0]) || state.activeChannelId;
    }
    saveState();
    render();
    return;
  }
  if (event.key === "Escape" && contextMenuOpen) {
    closeContextMenu();
    return;
  }
  if (event.key === "Escape" && mediaPickerOpen) {
    closeMediaPicker();
    return;
  }
  if (event.key === "Escape" && ui.settingsScreen.classList.contains("settings-screen--active")) {
    closeSettingsScreen();
  }
});

document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id !== "virtual-keyboard") return;
  if (target.getAttribute("aria-hidden") !== "true") return;
  target.blur();
  addDebugLog("info", "Blurred hidden virtual-keyboard input to avoid aria-hidden focus warning");
});

mediaPickerTab = getPreferences().mediaLastTab;
hardenInputAutocompleteNoise();
renderComposerMediaButtons();
runScheduledDispatch();
ensureScheduledDispatchTimer();
safeRender("startup");
loadSwfLibrary();
deployMediaRuntimes();
if (state.currentAccountId && ["ws", "http", "xmpp"].includes(getPreferences().relayMode) && getPreferences().relayAutoConnect === "on") {
  connectRelaySocket();
}
