const STORAGE_KEY = "shitcord67-state-v1";
const SESSION_ACCOUNT_KEY = "shitcord67-session-account-id";
const DEFAULT_REACTIONS = ["👍", "❤️", "😂"];
const SLASH_COMMANDS = [
  { name: "help", args: "", description: "List available commands." },
  { name: "shortcuts", args: "", description: "Open keyboard shortcuts dialog." },
  { name: "me", args: "<text>", description: "Send an action-style message." },
  { name: "shrug", args: "[text]", description: "Append ¯\\_(ツ)_/¯ to optional text." },
  { name: "note", args: "<text>", description: "Send a collaborative message editable by anyone in the channel." },
  { name: "nick", args: "<nickname>", description: "Set your nickname in the active guild." },
  { name: "status", args: "<text>", description: "Set your custom status message." },
  { name: "mediaprivacy", args: "[status|safe|off]", description: "Control two-click external media loading privacy mode." },
  { name: "trustdomain", args: "<domain|*.domain|/regex/>", description: "Whitelist a media domain rule for auto-loading." },
  { name: "untrustdomain", args: "<domain|*.domain|/regex/>", description: "Remove a trusted media domain rule." },
  { name: "topic", args: "<topic>", description: "Set the current channel topic." },
  { name: "clear", args: "", description: "Clear all messages in this channel." },
  { name: "markread", args: "[all]", description: "Mark current channel or all guild channels as read." }
];
const MEDIA_TABS = ["gif", "sticker", "emoji", "swf", "svg", "pdf", "text", "docs", "html"];
const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
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
      manageMessages: true
    };
  }
  if (preset === "mod") {
    return {
      administrator: false,
      manageChannels: true,
      manageRoles: false,
      manageMessages: true
    };
  }
  return {
    administrator: false,
    manageChannels: false,
    manageRoles: false,
    manageMessages: false
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
            readState: {},
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
    savedSwfs: [],
    preferences: {
      uiScale: 100,
      theme: "oled",
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
      mediaPrivacyMode: "safe",
      mediaTrustRules: [],
      mediaLastTab: "gif",
      recentEmojis: [],
      hideChannelPanel: "off",
      hideMemberPanel: "off",
      swfPipPosition: null
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
    customStatusExpiresAt: null
  };
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
      customStatusExpiresAt: account?.customStatusExpiresAt || null
    }));
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
              manageMessages: Boolean(role.permissions?.manageMessages)
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
          ? guild.channels.map((channel) => ({
              ...channel,
              type: ["text", "announcement", "forum", "media"].includes(channel.type) ? channel.type : "text",
              topic: typeof channel.topic === "string" ? channel.topic : "",
              readState: typeof channel.readState === "object" && channel.readState ? { ...channel.readState } : {},
              messages: Array.isArray(channel.messages)
                ? channel.messages.map((message) => ({
                    ...message,
                    reactions: Array.isArray(message.reactions) ? message.reactions : [],
                    pinned: Boolean(message.pinned),
                    attachments: normalizeAttachments(message.attachments)
                  }))
                : []
            }))
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
                attachments: normalizeAttachments(message.attachments)
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
    delete raw.servers;
    delete raw.activeServerId;
    return raw;
  }

  const migrated = buildInitialState();
  if (!raw || typeof raw !== "object") return migrated;
  migrated.savedSwfs = normalizeSavedSwfs(raw.savedSwfs);

  const maybeUser = typeof raw.currentUser === "string" ? normalizeUsername(raw.currentUser) : "";
  let account = null;
  if (maybeUser) {
    account = createAccount(maybeUser, raw.currentUser.trim().slice(0, 32));
    if (raw.profile && typeof raw.profile === "object") {
      account.bio = (raw.profile.bio || "").toString();
      account.banner = (raw.profile.banner || "").toString();
      account.avatarColor = (raw.profile.avatarColor || "#57f287").toString();
    }
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
                  attachments: normalizeAttachments(msg.attachments)
                }))
              : [];
            return {
              id: channel.id || createId(),
              name: channel.name || "general",
              type: ["text", "announcement", "forum", "media"].includes(channel.type) ? channel.type : "text",
              topic: "",
              readState: typeof channel.readState === "object" && channel.readState ? { ...channel.readState } : {},
              messages
            };
          })
        : [
            {
              id: createId(),
              name: "general",
              topic: "",
              readState: {},
              messages: []
            }
          ];
      return {
        id: guildId,
        name: guild.name || "Untitled Guild",
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
    const accountIds = restored.accounts.map((account) => account?.id).filter(Boolean);
    const validIds = new Set(accountIds);
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

const ui = {
  loginScreen: document.getElementById("loginScreen"),
  chatScreen: document.getElementById("chatScreen"),
  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  serverBrand: document.getElementById("serverBrand"),
  serverBrandBadge: document.getElementById("serverBrandBadge"),
  serverList: document.getElementById("serverList"),
  dmSection: document.getElementById("dmSection"),
  guildSection: document.getElementById("guildSection"),
  channelList: document.getElementById("channelList"),
  dmList: document.getElementById("dmList"),
  dmSearchInput: document.getElementById("dmSearchInput"),
  newDmBtn: document.getElementById("newDmBtn"),
  channelFilterInput: document.getElementById("channelFilterInput"),
  memberList: document.getElementById("memberList"),
  memberPanelTitle: document.getElementById("memberPanelTitle"),
  activeServerName: document.getElementById("activeServerName"),
  activeChannelName: document.getElementById("activeChannelName"),
  activeChannelTopic: document.getElementById("activeChannelTopic"),
  openChannelSettingsBtn: document.getElementById("openChannelSettingsBtn"),
  openPinsBtn: document.getElementById("openPinsBtn"),
  openRolesBtn: document.getElementById("openRolesBtn"),
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
  saveComposerAttachmentBtn: document.getElementById("saveComposerAttachmentBtn"),
  clearComposerAttachmentBtn: document.getElementById("clearComposerAttachmentBtn"),
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
  profileStatusExpiryInput: document.getElementById("profileStatusExpiryInput"),
  profileGuildNicknameInput: document.getElementById("profileGuildNicknameInput"),
  profileGuildAvatarInput: document.getElementById("profileGuildAvatarInput"),
  profileGuildAvatarUrlInput: document.getElementById("profileGuildAvatarUrlInput"),
  profileGuildBannerInput: document.getElementById("profileGuildBannerInput"),
  profileGuildStatusInput: document.getElementById("profileGuildStatusInput"),
  presenceInput: document.getElementById("presenceInput"),
  profileBannerInput: document.getElementById("profileBannerInput"),
  profileAvatarInput: document.getElementById("profileAvatarInput"),
  profileAvatarUrlInput: document.getElementById("profileAvatarUrlInput"),
  profileAvatarPreview: document.getElementById("profileAvatarPreview"),
  profileAvatarUploadBtn: document.getElementById("profileAvatarUploadBtn"),
  profileAvatarClearBtn: document.getElementById("profileAvatarClearBtn"),
  profileAvatarUploadHint: document.getElementById("profileAvatarUploadHint"),
  profileAvatarFileInput: document.getElementById("profileAvatarFileInput"),
  profileCancel: document.getElementById("profileCancel"),
  createServerDialog: document.getElementById("createServerDialog"),
  createServerForm: document.getElementById("createServerForm"),
  serverNameInput: document.getElementById("serverNameInput"),
  serverCancel: document.getElementById("serverCancel"),
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
  exportDataBtn: document.getElementById("exportDataBtn"),
  importDataBtn: document.getElementById("importDataBtn"),
  importDataInput: document.getElementById("importDataInput"),
  exportSwfSavesBtn: document.getElementById("exportSwfSavesBtn"),
  importSwfSavesBtn: document.getElementById("importSwfSavesBtn"),
  importSwfSavesInput: document.getElementById("importSwfSavesInput"),
  openDebugConsoleBtn: document.getElementById("openDebugConsoleBtn"),
  channelSettingsDialog: document.getElementById("channelSettingsDialog"),
  channelSettingsForm: document.getElementById("channelSettingsForm"),
  channelRenameInput: document.getElementById("channelRenameInput"),
  channelSettingsCancel: document.getElementById("channelSettingsCancel"),
  deleteChannelBtn: document.getElementById("deleteChannelBtn"),
  rolesDialog: document.getElementById("rolesDialog"),
  rolesForm: document.getElementById("rolesForm"),
  roleNameInput: document.getElementById("roleNameInput"),
  roleColorInput: document.getElementById("roleColorInput"),
  rolePermPresetInput: document.getElementById("rolePermPresetInput"),
  createRoleNowBtn: document.getElementById("createRoleNowBtn"),
  assignRoleMemberInput: document.getElementById("assignRoleMemberInput"),
  assignRoleRoleInput: document.getElementById("assignRoleRoleInput"),
  assignRoleBtn: document.getElementById("assignRoleBtn"),
  removeRoleBtn: document.getElementById("removeRoleBtn"),
  rolesCloseBtn: document.getElementById("rolesCloseBtn"),
  pinsDialog: document.getElementById("pinsDialog"),
  pinsForm: document.getElementById("pinsForm"),
  pinsList: document.getElementById("pinsList"),
  pinsCloseBtn: document.getElementById("pinsCloseBtn"),
  debugDialog: document.getElementById("debugDialog"),
  debugForm: document.getElementById("debugForm"),
  debugOutput: document.getElementById("debugOutput"),
  copyDebugBtn: document.getElementById("copyDebugBtn"),
  refreshDebugBtn: document.getElementById("refreshDebugBtn"),
  clearDebugBtn: document.getElementById("clearDebugBtn"),
  debugCloseBtn: document.getElementById("debugCloseBtn"),
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

function rememberAccountSession(accountId) {
  if (!accountId) return;
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

function messageMentionsAccount(messageText, account) {
  if (!account || !messageText) return false;
  const mentionPattern = new RegExp(`(^|\\s)@${escapeRegExp(account.username)}(?=\\b|\\s|$)`, "i");
  return mentionPattern.test(messageText);
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

function getGuildUnreadStats(guild, account) {
  if (!guild || !account) return { unread: 0, mentions: 0 };
  if (!Array.isArray(guild.memberIds) || !guild.memberIds.includes(account.id)) {
    return { unread: 0, mentions: 0 };
  }
  const totals = guild.channels.reduce((acc, channel) => {
    const stats = getChannelUnreadStats(channel, account);
    return {
      unread: acc.unread + stats.unread,
      mentions: acc.mentions + stats.mentions
    };
  }, { unread: 0, mentions: 0 });
  return applyGuildNotificationModeToStats(totals, getGuildNotificationMode(guild.id));
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
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  return Boolean(copied);
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

function mentionInComposer(account) {
  if (!account) return;
  const base = ui.messageInput.value.trim();
  ui.messageInput.value = `${base ? `${base} ` : ""}@${account.username} `;
  ui.messageInput.focus();
  renderSlashSuggestions();
}

function renameGuildById(guildId) {
  const guild = state.guilds.find((entry) => entry.id === guildId);
  if (!guild) return;
  const nextName = prompt("Rename guild", guild.name || "");
  if (typeof nextName !== "string") return;
  const cleaned = nextName.trim().slice(0, 40);
  if (!cleaned || cleaned === guild.name) return;
  guild.name = cleaned;
  saveState();
  render();
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
    state.activeChannelId = nextGuild?.channels[0]?.id || null;
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
    ensureChannelReadState(channel);
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
  return value === "discord" ? "discord" : "oled";
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
    mediaPrivacyMode: normalizeMediaPrivacyMode(current.mediaPrivacyMode),
    mediaTrustRules: normalizeMediaTrustRules(current.mediaTrustRules),
    mediaLastTab: normalizeMediaTab(current.mediaLastTab),
    recentEmojis: normalizeRecentEmojis(current.recentEmojis),
    hideChannelPanel: normalizeToggle(current.hideChannelPanel),
    hideMemberPanel: normalizeToggle(current.hideMemberPanel),
    swfPipPosition: current.swfPipPosition && typeof current.swfPipPosition === "object"
      ? {
          left: Number.isFinite(Number(current.swfPipPosition.left)) ? Math.max(0, Number(current.swfPipPosition.left)) : null,
          top: Number.isFinite(Number(current.swfPipPosition.top)) ? Math.max(0, Number(current.swfPipPosition.top)) : null,
          manual: Boolean(current.swfPipPosition.manual)
        }
      : null
  };
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

function channelTypePrefix(channel) {
  if (!channel || channel.type === "text") return "#";
  if (channel.type === "announcement") return "📣";
  if (channel.type === "forum") return "🗂";
  if (channel.type === "media") return "🖼";
  return "#";
}

function channelTypeSymbol(channel) {
  if (!channel || channel.type === "text") return "#";
  if (channel.type === "announcement") return "📣";
  if (channel.type === "forum") return "🧵";
  if (channel.type === "media") return "🖼";
  return "#";
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
  if (name.endsWith(".gif") || name.endsWith(".webp") || name.endsWith(".mp4") || name.endsWith(".webm")) return "gif";
  return "gif";
}

function clearComposerPendingAttachment() {
  composerPendingAttachment = null;
  if (ui.composerAttachmentBar) ui.composerAttachmentBar.classList.add("composer-reply--hidden");
  if (ui.composerAttachmentText) ui.composerAttachmentText.textContent = "";
  if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = true;
  if (ui.quickAttachInput) ui.quickAttachInput.value = "";
}

function setComposerPendingAttachment(entry) {
  composerPendingAttachment = entry || null;
  if (!composerPendingAttachment) {
    clearComposerPendingAttachment();
    return;
  }
  if (ui.composerAttachmentText) {
    const label = composerPendingAttachment.name || "file";
    const type = (composerPendingAttachment.type || "file").toUpperCase();
    const size = formatFileSize(Number(composerPendingAttachment.sizeBytes || 0));
    ui.composerAttachmentText.textContent = size
      ? `Attached ${type}: ${label} (${size})`
      : `Attached ${type}: ${label}`;
  }
  if (ui.composerAttachmentBar) ui.composerAttachmentBar.classList.remove("composer-reply--hidden");
  if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = false;
}

async function attachFileToComposer(file) {
  if (!file) return false;
  const type = inferAttachmentTypeFromFile(file);
  const allowed = new Set(["pdf", "text", "odf", "rtf", "bin"]);
  if (!allowed.has(type)) return false;
  const url = await readFileAsDataUrl(file);
  setComposerPendingAttachment({
    type,
    url,
    name: file.name || `${type}-${Date.now()}`,
    sizeBytes: Number(file.size) || 0
  });
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
  const type = composerPendingAttachment.type || "pdf";
  const tab = pickerTabForAttachmentType(type);
  const baseName = (composerPendingAttachment.name || `${type}-${Date.now()}`).toString().trim().slice(0, 64);
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
    url: composerPendingAttachment.url,
    format: "image",
    type
  };
  const saved = upsertGuildResource(tab, entry);
  if (!saved) return false;
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
    attachments: normalizeAttachments(message.attachments)
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
  return [
    `<message id="${xmlEscape(message.id)}" ts="${xmlEscape(message.ts)}"${message.editedAt ? ` editedAt="${xmlEscape(message.editedAt)}"` : ""}${message.editedByStaff ? " editedByStaff=\"true\"" : ""}>`,
    `  <author userId="${xmlEscape(message.userId || "")}">${xmlEscape(displayNameForMessage(message))}</author>`,
    `  <text>${xmlEscape(message.text || "")}</text>`,
    `  <pinned>${message.pinned ? "true" : "false"}</pinned>`,
    reactionsXml ? `  <reactions>\n${reactionsXml}\n  </reactions>` : "  <reactions />",
    attachmentsXml ? `  <attachments>\n${attachmentsXml}\n  </attachments>` : "  <attachments />",
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

function handleSlashCommand(rawText, channel, account) {
  if (!rawText.startsWith("/")) return false;
  const [command, ...rest] = rawText.slice(1).split(" ");
  const arg = rest.join(" ").trim();

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
    const summary = SLASH_COMMANDS
      .map((entry) => `/${entry.name}${entry.args ? ` ${entry.args}` : ""}`)
      .join(", ");
    addSystemMessage(channel, `Commands: ${summary}`);
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

function applyPreferencesToUI() {
  const prefs = getPreferences();
  document.body.style.setProperty("--ui-scale", `${prefs.uiScale}%`);
  document.body.dataset.theme = prefs.theme;
  document.body.dataset.compactMembers = prefs.compactMembers;
  document.body.dataset.developerMode = prefs.developerMode;
  document.body.dataset.debugOverlay = prefs.debugOverlay;
  document.body.dataset.hideChannelPanel = prefs.hideChannelPanel;
  document.body.dataset.hideMemberPanel = prefs.hideMemberPanel;
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
  const tokenPattern = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|~~[^~\n]+~~|`[^`\n]+`|\[[^\]]{1,80}\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s]+|@[a-z0-9._-]+|:[a-z0-9_-]{1,32}:)/gi;
  let lastIndex = 0;
  let match = tokenPattern.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      target.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
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
      video.playsInline = true;
      wrap.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = mediaUrl;
      img.loading = "lazy";
      img.alt = attachment.name || "GIF";
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
  wrap.appendChild(img);
  container.appendChild(wrap);
}

function renderScreens() {
  const loggedIn = Boolean(state.currentAccountId);
  ui.loginScreen.classList.toggle("screen--active", !loggedIn);
  ui.chatScreen.classList.toggle("screen--active", loggedIn);
  if (!loggedIn && ui.settingsScreen.classList.contains("settings-screen--active")) {
    closeSettingsScreen();
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
    const guildStats = getGuildUnreadStats(server, currentAccount);
    button.title = guildStats.unread > 0
      ? `${server.name} (${guildStats.unread} unread${guildStats.mentions ? `, ${guildStats.mentions} mentions` : ""})`
      : server.name;
    if (guildStats.unread > 0) {
      const dot = document.createElement("span");
      dot.className = `server-unread-pill ${guildStats.mentions > 0 ? "server-unread-pill--mention" : ""}`;
      if (guildStats.mentions > 0) {
        dot.textContent = guildStats.mentions > 9 ? "9+" : String(guildStats.mentions);
      }
      button.appendChild(dot);
    }
    button.addEventListener("click", () => {
      state.viewMode = "guild";
      state.activeGuildId = server.id;
      state.activeChannelId = server.channels[0]?.id || null;
      state.activeDmId = null;
      ensureCurrentUserInActiveServer();
      saveState();
      render();
    });
    button.addEventListener("contextmenu", (event) => {
      const currentUser = getCurrentAccount();
      const guildNotifMode = getGuildNotificationMode(server.id);
      openContextMenu(event, [
        {
          label: "Open Guild",
          action: () => {
            state.viewMode = "guild";
            state.activeGuildId = server.id;
            state.activeChannelId = server.channels[0]?.id || null;
            state.activeDmId = null;
            ensureCurrentUserInActiveServer();
            saveState();
            render();
          }
        },
        {
          label: "Copy",
          submenu: [
            { label: "Guild Name", action: () => copyText(server.name || "") },
            { label: "Guild ID", action: () => copyText(server.id) },
            { label: "First Channel ID", action: () => copyText(server.channels[0]?.id || "") }
          ]
        },
        {
          label: "Rename Guild",
          disabled: !currentUser || !hasServerPermission(server, currentUser.id, "manageChannels"),
          action: () => renameGuildById(server.id)
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
            state.activeChannelId = server.channels[0]?.id || null;
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
    if (unread.unread > 0) {
      const badge = document.createElement("span");
      badge.className = `channel-badge ${unread.mentions > 0 ? "channel-badge--mention" : ""}`;
      badge.textContent = unread.unread > 99 ? "99+" : String(unread.unread);
      button.appendChild(badge);
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
}

function renderChannels() {
  renderDmList();
  const dmMode = getViewMode() === "dm";
  ui.dmSection.classList.toggle("panel-section--hidden", !dmMode);
  ui.guildSection.classList.toggle("panel-section--hidden", dmMode);
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
  const notificationMode = getGuildNotificationMode(server.id);
  const filter = channelFilterTerm.trim().toLowerCase();
  if (ui.channelFilterInput && ui.channelFilterInput.value !== channelFilterTerm) {
    ui.channelFilterInput.value = channelFilterTerm;
  }
  ui.activeServerName.textContent = server.name;
  const channelsToRender = server.channels.filter((channel) => !filter || channel.name.toLowerCase().includes(filter));
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
    const unreadStats = applyGuildNotificationModeToStats(
      getChannelUnreadStats(channel, currentAccount),
      notificationMode
    );
    if (unreadStats.mentions > 0) {
      const mentionBadge = document.createElement("span");
      mentionBadge.className = "channel-badge channel-badge--mention";
      mentionBadge.textContent = unreadStats.mentions > 99 ? "99+" : String(unreadStats.mentions);
      button.appendChild(mentionBadge);
      button.classList.add("channel-item--unread");
    } else if (unreadStats.unread > 0) {
      const unreadBadge = document.createElement("span");
      unreadBadge.className = "channel-badge";
      unreadBadge.textContent = unreadStats.unread > 99 ? "99+" : String(unreadStats.unread);
      button.appendChild(unreadBadge);
      button.classList.add("channel-item--unread");
    }
    button.addEventListener("click", () => {
      state.viewMode = "guild";
      state.activeChannelId = channel.id;
      state.activeDmId = null;
      saveState();
      renderMessages();
      renderChannels();
    });
    button.addEventListener("contextmenu", (event) => {
      openContextMenu(event, [
        {
          label: "Open Channel",
          action: () => {
            state.viewMode = "guild";
            state.activeChannelId = channel.id;
            state.activeDmId = null;
            saveState();
            renderMessages();
            renderChannels();
          }
        },
        {
          label: "Copy",
          submenu: [
            { label: "Channel Name", action: () => copyText(`#${channel.name}`) },
            { label: "Channel Topic", action: () => copyText(channel.topic || "") },
            { label: "Channel ID", action: () => copyText(channel.id) }
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
          label: "Rename Channel",
          disabled: !canCurrentUser("manageChannels"),
          action: () => {
            state.activeChannelId = channel.id;
            ui.channelRenameInput.value = channel.name || "";
            ui.channelSettingsDialog.showModal();
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
      ]);
    });
    ui.channelList.appendChild(button);
  });
  if (channelsToRender.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No channels match your filter.";
    ui.channelList.appendChild(empty);
  }
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
  ui.userPopoutStatus.textContent = account ? displayStatus(account, guildId) : "Offline";
  ui.userPopoutBio.textContent = bio;
  applyAvatarStyle(ui.userPopoutAvatar, account, guildId);
  applyBannerStyle(ui.userPopoutBanner, resolveAccountBanner(account, guildId));
  renderRoleChips(ui.userPopoutRoles, account?.id);
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
  const topLevel = messages.filter((message) => !message.forumThreadId);
  const repliesByThread = new Map();
  const channelLastReadMs = toTimestampMs(channel?.readState?.[currentAccount?.id]);
  messages.forEach((message) => {
    if (!message.forumThreadId) return;
    if (!repliesByThread.has(message.forumThreadId)) repliesByThread.set(message.forumThreadId, []);
    repliesByThread.get(message.forumThreadId).push(message);
  });

  const threadSortMode = getForumThreadSortMode(channel?.id);
  const threadModels = topLevel.map((post) => {
    const replies = (repliesByThread.get(post.id) || []).slice().sort((a, b) => toTimestampMs(a.ts) - toTimestampMs(b.ts));
    const latestTsMs = replies.reduce((maxTs, replyMessage) => Math.max(maxTs, toTimestampMs(replyMessage.ts)), toTimestampMs(post.ts));
    return { post, replies, latestTsMs };
  });
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

    ui.messageList.appendChild(toolbar);
  }

  threadModels.forEach(({ post, replies }) => {
    const postRow = document.createElement("article");
    postRow.className = "message message--forum message--forum-root";
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
    postRow.appendChild(forumTitle);

    if (body) {
      const text = document.createElement("div");
      text.className = "message-text";
      renderMessageText(text, body);
      postRow.appendChild(text);
    }

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
        replyRow.appendChild(replyActions);

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
      openContextMenu(event, [
        {
          label: "Reply in Thread",
          action: () => setReplyTarget(conversationId, post, post.id)
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
          label: "Copy",
          submenu: [
            { label: "Thread Post ID", action: () => copyText(post.id || "") },
            { label: "Post JSON", action: () => copyText(serializeMessageAsJson(post)) }
          ]
        }
      ]);
    });

    ui.messageList.appendChild(postRow);
  });

  ui.messageList.scrollTop = ui.messageList.scrollHeight;
}

function renderMessages() {
  const conversation = getActiveConversation();
  const isDm = conversation?.type === "dm";
  const channel = !isDm ? conversation?.channel : null;
  const dmThread = isDm ? conversation?.thread : null;
  const conversationId = conversation?.id || null;
  const messageBucket = isDm ? (dmThread?.messages || []) : (channel?.messages || []);
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
  if (isDm && dmThread) {
    const current = getCurrentAccount();
    const peerId = dmThread.participantIds.find((id) => id !== current?.id);
    const peer = peerId ? getAccountById(peerId) : null;
    ui.activeChannelName.textContent = peer ? `@${peer.username}` : "@dm";
    ui.activeChannelTopic.textContent = "Direct Message";
    ui.messageInput.placeholder = peer ? `Message @${peer.username}` : "Message DM";
  } else {
    ui.activeChannelName.textContent = channel ? `${channelTypePrefix(channel)} ${channel.name}` : "#none";
    ui.activeChannelTopic.textContent = channel?.topic?.trim() || "No topic";
    if (channel?.type === "forum") {
      ui.messageInput.placeholder = channel ? `New post in ${channelTypePrefix(channel)} ${channel.name} (title on first line)` : "No channel selected";
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
  if (!isDm && channel?.type === "forum") {
    renderForumThreads(conversationId, channel, messageBucket, getCurrentAccount());
    return;
  }

  const currentAccount = getCurrentAccount();
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
  }

  let lastDayKey = "";
  messageBucket.forEach((message) => {
    const currentUser = getCurrentAccount();
    const dayKey = messageDateKey(message.ts);
    if (dayKey && dayKey !== lastDayKey) {
      ui.messageList.appendChild(createMessageDayDivider(message.ts));
      lastDayKey = dayKey;
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
          label: "Copy",
          submenu: [
            {
              label: "Username",
              disabled: !author,
              action: () => copyText(author ? `@${author.username}` : "")
            },
            {
              label: "User ID",
              disabled: !author,
              action: () => copyText(author ? author.id : "")
            }
          ]
        }
      ]);
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

    const reactBtn = document.createElement("button");
    reactBtn.type = "button";
    reactBtn.className = "message-action-btn";
    reactBtn.textContent = "React";
    reactBtn.addEventListener("click", () => {
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
      if (currentUser) {
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
    if (currentUser) {
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
    head.appendChild(time);
    if (collaborativeBadge) head.appendChild(collaborativeBadge);
    if (editedBadge) head.appendChild(editedBadge);
    messageRow.appendChild(head);
    if (replyLine) messageRow.appendChild(replyLine);
    if (pinIndicator) messageRow.appendChild(pinIndicator);
    if (forumTitle) messageRow.appendChild(forumTitle);
    messageRow.appendChild(actionBar);
    messageRow.appendChild(text);
    ui.messageList.appendChild(messageRow);
    if (imagePreview) messageRow.appendChild(imagePreview);
    attachments.forEach((attachment, index) => {
      renderMessageAttachment(messageRow, attachment, { swfKey: `${message.id}:${index}` });
    });
    messageRow.appendChild(reactions);
    messageRow.appendChild(reactionPicker);
    const openMessageContextMenuAt = (event) => {
      const canManageMessages = currentUser ? canCurrentUser("manageMessages") : false;
      const isOwnMessage = currentUser && message.userId === currentUser.id;
      const canEditMessage = canEditMessageEntry(message, { isDm, canManageMessages, currentUser });
      const firstSwfAttachment = attachments.find((attachment) => attachment.type === "swf");
      const firstSwfIndex = attachments.findIndex((attachment) => attachment.type === "swf");
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
          label: "Copy",
          submenu: [
            { label: "Text", action: () => copyText(message.text || "") },
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
  userButton.addEventListener("click", () => {
    const author = message.userId ? getAccountById(message.userId) : null;
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
  head.appendChild(time);
  messageRow.appendChild(head);
  const text = document.createElement("div");
  text.className = "message-text";
  renderMessageText(text, message.text);
  messageRow.appendChild(text);
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
}

function renderMemberList() {
  const activeDm = getActiveDmThread();
  if (activeDm) {
    const current = getCurrentAccount();
    if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = `Members — ${activeDm.participantIds.length}`;
    ui.memberList.innerHTML = "";
    const title = document.createElement("div");
    title.className = "member-group-title";
    title.textContent = "Direct Message";
    ui.memberList.appendChild(title);
    activeDm.participantIds
      .map((id) => getAccountById(id))
      .filter(Boolean)
      .forEach((account) => {
        const row = document.createElement("button");
        row.className = "member-item";
        const avatar = document.createElement("div");
        avatar.className = "member-avatar";
        applyAvatarStyle(avatar, account, null);
        const dot = document.createElement("span");
        dot.className = `presence-dot presence-${normalizePresence(account.presence)}`;
        avatar.appendChild(dot);
        const label = document.createElement("span");
        label.textContent = displayNameForAccount(account, null);
        row.appendChild(avatar);
        row.appendChild(label);
        row.addEventListener("click", () => openUserPopout(account));
        row.addEventListener("contextmenu", (event) => {
          openContextMenu(event, [
            { label: "View Profile", action: () => openUserPopout(account) },
            { label: "Start DM", disabled: account.id === current?.id, action: () => openDmWithAccount(account) },
            {
              label: "Copy",
              submenu: [
                { label: "Username", action: () => copyText(`@${account.username}`) },
                { label: "User ID", action: () => copyText(account.id) }
              ]
            }
          ]);
        });
        ui.memberList.appendChild(row);
      });
    return;
  }
  const server = getActiveServer();
  ui.memberList.innerHTML = "";
  if (!server) {
    if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = "Members";
    return;
  }

  const online = [];
  const offline = [];

  server.memberIds.forEach((memberId) => {
    const account = getAccountById(memberId);
    if (!account) return;
    if (normalizePresence(account.presence) === "invisible") {
      offline.push(account);
    } else {
      online.push(account);
    }
  });

  const sortByName = (a, b) => displayNameForAccount(a, server.id).localeCompare(displayNameForAccount(b, server.id));
  online.sort(sortByName);
  offline.sort(sortByName);

  const groups = [
    { title: `Online — ${online.length}`, items: online },
    { title: `Offline — ${offline.length}`, items: offline }
  ];
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

      const dot = document.createElement("span");
      dot.className = `presence-dot presence-${normalizePresence(account.presence)}`;
      avatar.appendChild(dot);

      const label = document.createElement("span");
      label.textContent = displayNameForAccount(account, server.id);
      const roleColor = getMemberTopRoleColor(server, account.id);
      if (roleColor) label.style.color = roleColor;

      row.appendChild(avatar);
      row.appendChild(label);
      row.addEventListener("click", () => openUserPopout(account));
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
            label: "Copy",
            submenu: [
              { label: "Username", action: () => copyText(`@${account.username}`) },
              { label: "User ID", action: () => copyText(account.id) }
            ]
          }
        ]);
      });
      ui.memberList.appendChild(row);
    });
  });
}

function renderDock() {
  const account = getCurrentAccount();
  if (!account) return;
  const conversation = getActiveConversation();
  const guildId = conversation?.type === "channel" ? getActiveGuild()?.id || null : null;
  ui.dockName.textContent = displayNameForAccount(account, guildId);
  ui.dockStatus.textContent = displayStatus(account, guildId);
  applyAvatarStyle(ui.dockAvatar, account, guildId);
  ui.dockPresenceDot.className = `dock-presence-dot presence-${normalizePresence(account.presence)}`;
}

function renderSelfPopout() {
  const account = getCurrentAccount();
  if (!account) return;
  ui.selfPopoutName.textContent = displayNameForAccount(account, getActiveGuild()?.id || null);
  const selfRoleColor = getActiveServer() ? getMemberTopRoleColor(getActiveServer(), account.id) : "";
  ui.selfPopoutName.style.color = selfRoleColor || "";
  ui.selfPopoutStatus.textContent = displayStatus(account, getActiveGuild()?.id || null);
  ui.selfPopoutBio.textContent = account.bio?.trim() || "No bio yet.";
  applyAvatarStyle(ui.selfPopoutAvatar, account, getActiveGuild()?.id || null);
  applyBannerStyle(ui.selfPopoutBanner, resolveAccountBanner(account, getActiveGuild()?.id || null));
  renderRoleChips(ui.selfPopoutRoles, account.id);
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
}

function renderPinsDialog() {
  const channel = getActiveChannel();
  ui.pinsList.innerHTML = "";
  if (!channel) return;
  const pinned = channel.messages.filter((message) => message.pinned);
  if (pinned.length === 0) {
    const empty = document.createElement("div");
    empty.className = "pin-item";
    empty.textContent = "No pinned messages yet.";
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
  if (mediaPickerOpen) renderMediaPicker();
}

function openProfileEditor() {
  const account = getCurrentAccount();
  const guild = getActiveGuild();
  if (!account) return;
  ui.displayNameInput.value = account.displayName || account.username;
  ui.profileBioInput.value = account.bio || "";
  ui.profileStatusInput.value = account.customStatus || "";
  ui.profileStatusEmojiInput.value = account.customStatusEmoji || "";
  ui.profileStatusExpiryInput.value = statusExpiryPreset(account);
  ui.profileGuildNicknameInput.value = guild ? resolveAccountGuildNickname(account, guild.id) : "";
  const guildAvatar = guild ? resolveAccountAvatar(account, guild.id) : { color: "", url: "" };
  const guildBanner = guild ? resolveAccountBanner(account, guild.id) : "";
  ui.profileGuildAvatarInput.value = guild ? (guildAvatar.color || "") : "";
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
  ui.profileAvatarUrlInput.value = account.avatarUrl || "";
  setProfileAvatarUploadHint("Accepts image files up to 2 MB.");
  renderProfileAvatarPreview();
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
  if (!channel) return;
  if (!canCurrentUser("manageChannels")) {
    notifyPermissionDenied("Manage Channels");
    return;
  }
  ui.channelRenameInput.value = channel.name || "";
  ui.channelSettingsDialog.showModal();
}

function createOrSwitchAccount(usernameInput) {
  const normalized = normalizeUsername(usernameInput);
  if (!normalized) return false;

  let account = getAccountByUsername(normalized);
  if (!account) {
    account = createAccount(normalized, usernameInput.trim().slice(0, 32));
    state.accounts.push(account);
  } else {
    if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
    if (typeof account.customStatusEmoji !== "string") account.customStatusEmoji = "";
    if (!("customStatusExpiresAt" in account)) account.customStatusExpiresAt = null;
  }

  state.currentAccountId = account.id;
  rememberAccountSession(account.id);
  if (state.viewMode !== "dm" && state.viewMode !== "guild") state.viewMode = "guild";
  if (!state.activeGuildId && state.guilds[0]) {
    state.activeGuildId = state.guilds[0].id;
  }
  if (!state.activeChannelId && state.guilds[0]?.channels[0]) {
    state.activeChannelId = state.guilds[0].channels[0].id;
  }
  ensureCurrentUserInActiveServer();
  return true;
}

ui.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const typed = ui.loginUsername.value;
  if (!createOrSwitchAccount(typed)) {
    showToast("Username must include at least one letter or number.", { tone: "error" });
    return;
  }
  ui.loginScreen.classList.remove("screen--active");
  ui.chatScreen.classList.add("screen--active");
  ui.loginUsername.value = "";
  saveState();
  try {
    render();
  } catch (error) {
    console.error("Render failed after login", error);
    showToast("Logged in, but render failed. Open DevTools for details.", { tone: "error", duration: 3000 });
  }
  closeSettingsScreen();
  requestAnimationFrame(() => {
    ui.messageInput.focus();
  });
});

ui.messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = ui.messageInput.value.trim();
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  if (!conversation || !account || (!text && !composerPendingAttachment)) return;

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
      attachments: composerPendingAttachment ? [{
        type: composerPendingAttachment.type || "pdf",
        url: composerPendingAttachment.url,
        name: composerPendingAttachment.name || "file",
        format: composerPendingAttachment.format || "image"
      }] : [],
      replyTo: nextReply
    };
    if (conversation.type === "channel" && conversation.channel.type === "forum") {
      if (nextReply?.threadId) {
        nextMessage.forumThreadId = nextReply.threadId;
        nextMessage.forumParentId = nextReply.messageId || nextReply.threadId;
      } else {
        const [firstLine, ...rest] = text.split("\n");
        nextMessage.forumTitle = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
        nextMessage.text = rest.join("\n").trim();
      }
    }
    if (conversation.type === "dm") {
      conversation.thread.messages.push(nextMessage);
    } else {
      conversation.channel.messages.push(nextMessage);
    }
    replyTarget = null;
    clearComposerPendingAttachment();
    if (swfPipTabs.length > 0 && !(conversation.type === "channel" && conversation.channel.type === "forum")) {
      ui.messageInput.value = "";
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
  clearComposerPendingAttachment();
  slashSelectionIndex = 0;
  closeMediaPicker();
  saveState();
  renderMessages();
  renderMemberList();
});

ui.messageInput.addEventListener("input", () => {
  slashSelectionIndex = 0;
  mentionSelectionIndex = 0;
  renderSlashSuggestions();
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
  const file = ui.quickAttachInput.files?.[0];
  if (!file) return;
  try {
    const attached = await attachFileToComposer(file);
    if (!attached) {
      showToast("Unsupported attachment type. Use PDF/Text/Docs/BIN.", { tone: "error" });
      return;
    }
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
  if (!composerPendingAttachment) return;
  const ok = saveComposerAttachmentToPicker();
  if (!ok) {
    showToast("Could not save attachment to picker.", { tone: "error" });
    return;
  }
  const tab = pickerTabForAttachmentType(composerPendingAttachment.type || "pdf");
  showToast("Attachment saved to picker.");
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
  if (!channelFilterTerm) return;
  event.preventDefault();
  channelFilterTerm = "";
  ui.channelFilterInput.value = "";
  renderChannels();
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

ui.messageInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && !ui.messageInput.value.trim()) {
    const last = findLastEditableMessageInActiveConversation();
    if (last) {
      event.preventDefault();
      openMessageEditor(last.conversationId, last.messageId, last.text);
      return;
    }
  }

  if (event.key === "Escape" && !ui.messageInput.value.trim() && composerPendingAttachment) {
    event.preventDefault();
    clearComposerPendingAttachment();
    showToast("Attachment cleared.");
    return;
  }

  if (event.ctrlKey && event.shiftKey) {
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
      if (event.key === "Enter" && selected && raw === `/${selected.name}`) {
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
  const [file] = files;
  if (!file) return;
  const inferred = inferAttachmentTypeFromFile(file);
  const allowed = new Set(["pdf", "text", "odf", "rtf", "bin"]);
  if (!allowed.has(inferred)) return;
  event.preventDefault();
  void attachFileToComposer(file).then((attached) => {
    if (!attached) return;
    ui.messageInput.focus();
    showToast("Attachment added from clipboard.");
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
  ui.createServerDialog.showModal();
});

ui.serverBrand.addEventListener("click", () => {
  state.viewMode = "dm";
  saveState();
  render();
});

ui.serverCancel.addEventListener("click", () => ui.createServerDialog.close());

ui.createServerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = ui.serverNameInput.value.trim().slice(0, 40);
  const account = getCurrentAccount();
  if (!name) return;

  const generalId = createId();
  const everyoneRole = createRole("@everyone", "#b5bac1", "member");
  const adminRole = createRole("Admin", "#f23f43", "admin");
  const memberRoles = {};
  if (account) memberRoles[account.id] = [everyoneRole.id, adminRole.id];
  const server = {
    id: createId(),
    name,
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
    channels: [
      {
        id: generalId,
        name: "general",
        type: "text",
        topic: "General discussion",
        readState: account ? { [account.id]: new Date().toISOString() } : {},
        messages: []
      }
    ]
  };

  state.guilds.push(server);
  state.activeGuildId = server.id;
  state.activeChannelId = generalId;
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

  const channel = {
    id: createId(),
    name: sanitizeChannelName(ui.channelNameInput.value, "new-channel"),
    type: ["text", "announcement", "forum", "media"].includes(ui.channelTypeInput.value) ? ui.channelTypeInput.value : "text",
    topic: "",
    readState: state.currentAccountId ? { [state.currentAccountId]: new Date().toISOString() } : {},
    messages: []
  };

  server.channels.push(channel);
  state.activeChannelId = channel.id;
  saveState();
  ui.createChannelDialog.close();
  render();
});

ui.editTopicBtn.addEventListener("click", openTopicEditor);
ui.openChannelSettingsBtn.addEventListener("click", openChannelSettings);
ui.openShortcutsBtn?.addEventListener("click", openShortcutsDialog);
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
  ui.rolePermPresetInput.value = "member";
  ui.rolesDialog.showModal();
});

ui.openPinsBtn.addEventListener("click", () => {
  renderPinsDialog();
  ui.pinsDialog.showModal();
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

ui.channelSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const channel = getActiveChannel();
  if (!channel) return;
  channel.name = sanitizeChannelName(ui.channelRenameInput.value, channel.name || "general");
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
  state.activeChannelId = guild.channels[0]?.id || null;
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
  saveState();
  refreshSwfAudioFocus();
  render();
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

ui.refreshDebugBtn.addEventListener("click", () => {
  renderDebugDialog();
});

ui.copyDebugBtn.addEventListener("click", () => {
  copyText(formatDebugLogs());
});

ui.clearDebugBtn.addEventListener("click", () => {
  debugLogs.length = 0;
  addDebugLog("info", "Debug log cleared");
  renderDebugDialog();
});

ui.debugCloseBtn.addEventListener("click", () => {
  ui.debugDialog.close();
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

ui.selfSwitchAccount.addEventListener("click", () => {
  ui.selfMenuDialog.close();
  selectedSwitchAccountId = state.currentAccountId;
  renderAccountSwitchList();
  ui.newAccountInput.value = "";
  ui.accountSwitchDialog.showModal();
});

ui.selfLogout.addEventListener("click", () => {
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

ui.profileAvatarUploadBtn.addEventListener("click", () => {
  ui.profileAvatarFileInput.click();
});

ui.profileAvatarClearBtn.addEventListener("click", () => {
  ui.profileAvatarUrlInput.value = "";
  ui.profileAvatarFileInput.value = "";
  setProfileAvatarUploadHint("Avatar image cleared.");
  renderProfileAvatarPreview();
});

ui.profileAvatarInput.addEventListener("input", renderProfileAvatarPreview);
ui.profileAvatarUrlInput.addEventListener("input", renderProfileAvatarPreview);

ui.profileAvatarFileInput.addEventListener("change", async () => {
  const file = ui.profileAvatarFileInput.files?.[0];
  await applyProfileAvatarFile(file);
  ui.profileAvatarFileInput.value = "";
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
  ui.shortcutsDialog,
  ui.selfMenuDialog,
  ui.userPopoutDialog,
  ui.accountSwitchDialog,
  ui.debugDialog,
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
  const [file] = files;
  if (!file) return false;
  const inferred = inferAttachmentTypeFromFile(file);
  const allowed = new Set(["pdf", "text", "odf", "rtf", "bin"]);
  if (!allowed.has(inferred)) return false;
  event.preventDefault();
  event.stopPropagation();
  void attachFileToComposer(file).then((attached) => {
    if (!attached) return;
    ui.messageInput.focus();
    showToast(`${inferred.toUpperCase()} attached. Press Enter to send.`);
  }).catch(() => {
    showToast("Failed to attach dropped file.", { tone: "error" });
  });
  return true;
}

document.addEventListener("dragover", (event) => {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  const [file] = files;
  const inferred = inferAttachmentTypeFromFile(file);
  const allowed = new Set(["pdf", "text", "odf", "rtf", "bin"]);
  if (!allowed.has(inferred)) return;
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
  render();
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
  if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === "u") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    ui.quickAttachInput.click();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "p") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openMediaPickerWithTab("pdf");
    return;
  }
  if (event.ctrlKey && event.key.toLowerCase() === "k") {
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
      state.activeChannelId = state.guilds[0].channels[0]?.id || state.activeChannelId;
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
renderComposerMediaButtons();
render();
loadSwfLibrary();
deployMediaRuntimes();
