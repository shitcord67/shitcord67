const STORAGE_KEY = "shitcord67-state-v1";
const DEFAULT_REACTIONS = ["👍", "❤️", "😂"];
const SLASH_COMMANDS = [
  { name: "help", args: "", description: "List available commands." },
  { name: "me", args: "<text>", description: "Send an action-style message." },
  { name: "shrug", args: "[text]", description: "Append ¯\\_(ツ)_/¯ to optional text." },
  { name: "nick", args: "<display name>", description: "Set your display name for this account." },
  { name: "status", args: "<text>", description: "Set your custom status message." },
  { name: "topic", args: "<topic>", description: "Set the current channel topic." },
  { name: "clear", args: "", description: "Clear all messages in this channel." },
  { name: "markread", args: "[all]", description: "Mark current channel or all guild channels as read." }
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
        roles: [everyoneRole],
        memberRoles: {},
        channels: [
          {
            id: channelId,
            name: "general",
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
                pinned: false
              }
            ]
          }
        ]
      }
    ],
    activeGuildId: guildId,
    activeChannelId: channelId,
    preferences: {
      uiScale: 100,
      compactMembers: "off",
      developerMode: "off",
      debugOverlay: "off",
      mute: "off",
      deafen: "off"
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
    presence: "online",
    customStatus: ""
  };
}

function migrateState(raw) {
  const sourceGuilds = Array.isArray(raw?.guilds) ? raw.guilds : raw?.servers;
  if (raw && Array.isArray(raw.accounts) && Array.isArray(sourceGuilds)) {
    if (!raw.preferences || typeof raw.preferences !== "object") {
      raw.preferences = buildInitialState().preferences;
    }
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
        memberIds: Array.isArray(guild.memberIds) ? guild.memberIds : [],
        roles,
        memberRoles,
        channels: Array.isArray(guild.channels)
          ? guild.channels.map((channel) => ({
              ...channel,
              topic: typeof channel.topic === "string" ? channel.topic : "",
              readState: typeof channel.readState === "object" && channel.readState ? { ...channel.readState } : {},
              messages: Array.isArray(channel.messages)
                ? channel.messages.map((message) => ({
                    ...message,
                    reactions: Array.isArray(message.reactions) ? message.reactions : [],
                    pinned: Boolean(message.pinned)
                  }))
                : []
            }))
          : []
      };
    });
    raw.activeGuildId = raw.activeGuildId || raw.activeServerId || raw.guilds[0]?.id || null;
    delete raw.servers;
    delete raw.activeServerId;
    return raw;
  }

  const migrated = buildInitialState();
  if (!raw || typeof raw !== "object") return migrated;

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
                  pinned: false
                }))
              : [];
            return {
              id: channel.id || createId(),
              name: channel.name || "general",
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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw));

    const v2Raw = localStorage.getItem("flashcord-state-v2");
    if (v2Raw) {
      const migrated = migrateState(JSON.parse(v2Raw));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    const legacyRaw = localStorage.getItem("flashcord-state-v1");
    if (legacyRaw) {
      const migrated = migrateState(JSON.parse(legacyRaw));
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
let channelFilterTerm = "";

const ui = {
  loginScreen: document.getElementById("loginScreen"),
  chatScreen: document.getElementById("chatScreen"),
  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  serverList: document.getElementById("serverList"),
  channelList: document.getElementById("channelList"),
  channelFilterInput: document.getElementById("channelFilterInput"),
  memberList: document.getElementById("memberList"),
  activeServerName: document.getElementById("activeServerName"),
  activeChannelName: document.getElementById("activeChannelName"),
  activeChannelTopic: document.getElementById("activeChannelTopic"),
  openChannelSettingsBtn: document.getElementById("openChannelSettingsBtn"),
  openPinsBtn: document.getElementById("openPinsBtn"),
  openRolesBtn: document.getElementById("openRolesBtn"),
  editTopicBtn: document.getElementById("editTopicBtn"),
  messageList: document.getElementById("messageList"),
  messageForm: document.getElementById("messageForm"),
  messageInput: document.getElementById("messageInput"),
  slashCommandPopup: document.getElementById("slashCommandPopup"),
  suggestionHint: document.getElementById("suggestionHint"),
  slashCommandList: document.getElementById("slashCommandList"),
  composerReplyBar: document.getElementById("composerReplyBar"),
  replyPreviewText: document.getElementById("replyPreviewText"),
  cancelReplyBtn: document.getElementById("cancelReplyBtn"),
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
  presenceInput: document.getElementById("presenceInput"),
  profileBannerInput: document.getElementById("profileBannerInput"),
  profileAvatarInput: document.getElementById("profileAvatarInput"),
  profileAvatarUrlInput: document.getElementById("profileAvatarUrlInput"),
  profileCancel: document.getElementById("profileCancel"),
  createServerDialog: document.getElementById("createServerDialog"),
  createServerForm: document.getElementById("createServerForm"),
  serverNameInput: document.getElementById("serverNameInput"),
  serverCancel: document.getElementById("serverCancel"),
  createChannelDialog: document.getElementById("createChannelDialog"),
  createChannelForm: document.getElementById("createChannelForm"),
  channelNameInput: document.getElementById("channelNameInput"),
  channelCancel: document.getElementById("channelCancel"),
  topicDialog: document.getElementById("topicDialog"),
  topicForm: document.getElementById("topicForm"),
  topicInput: document.getElementById("topicInput"),
  topicCancel: document.getElementById("topicCancel"),
  messageEditDialog: document.getElementById("messageEditDialog"),
  messageEditForm: document.getElementById("messageEditForm"),
  messageEditInput: document.getElementById("messageEditInput"),
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
  appearanceForm: document.getElementById("appearanceForm"),
  uiScaleInput: document.getElementById("uiScaleInput"),
  compactModeInput: document.getElementById("compactModeInput"),
  advancedForm: document.getElementById("advancedForm"),
  developerModeInput: document.getElementById("developerModeInput"),
  debugOverlayInput: document.getElementById("debugOverlayInput"),
  exportDataBtn: document.getElementById("exportDataBtn"),
  importDataBtn: document.getElementById("importDataBtn"),
  importDataInput: document.getElementById("importDataInput"),
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
  contextMenu: document.getElementById("contextMenu"),
  settingsNavItems: [...document.querySelectorAll(".settings-nav__item")],
  settingsPanels: [...document.querySelectorAll(".settings-panel")]
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  return guild.channels.reduce((acc, channel) => {
    const stats = getChannelUnreadStats(channel, account);
    return {
      unread: acc.unread + stats.unread,
      mentions: acc.mentions + stats.mentions
    };
  }, { unread: 0, mentions: 0 });
}

async function copyText(value) {
  const text = (value || "").toString();
  if (!text) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
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
  document.execCommand("copy");
  area.remove();
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
  state.guilds = state.guilds.filter((entry) => entry.id !== guildId);
  if (state.activeGuildId === guildId) {
    const nextGuild = state.guilds[0] || null;
    state.activeGuildId = nextGuild?.id || null;
    state.activeChannelId = nextGuild?.channels[0]?.id || null;
  }
  saveState();
  render();
}

function closeContextMenu() {
  if (!contextMenuOpen) return;
  contextMenuOpen = false;
  ui.contextMenu.classList.add("context-menu--hidden");
  ui.contextMenu.innerHTML = "";
}

function openContextMenu(event, items) {
  event.preventDefault();
  if (!Array.isArray(items) || items.length === 0) return;
  ui.contextMenu.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.disabled = Boolean(item.disabled);
    if (item.danger) button.classList.add("danger");
    button.addEventListener("click", async () => {
      closeContextMenu();
      if (typeof item.action === "function") await item.action();
    });
    ui.contextMenu.appendChild(button);
  });
  ui.contextMenu.classList.remove("context-menu--hidden");
  contextMenuOpen = true;

  const margin = 8;
  const menuRect = ui.contextMenu.getBoundingClientRect();
  const maxLeft = window.innerWidth - menuRect.width - margin;
  const maxTop = window.innerHeight - menuRect.height - margin;
  const left = Math.max(margin, Math.min(event.clientX, maxLeft));
  const top = Math.max(margin, Math.min(event.clientY, maxTop));
  ui.contextMenu.style.left = `${left}px`;
  ui.contextMenu.style.top = `${top}px`;
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

function getPreferences() {
  const defaults = buildInitialState().preferences;
  const current = state.preferences || {};
  return {
    uiScale: Number.isFinite(Number(current.uiScale)) ? Math.min(115, Math.max(90, Number(current.uiScale))) : defaults.uiScale,
    compactMembers: normalizeToggle(current.compactMembers),
    developerMode: normalizeToggle(current.developerMode),
    debugOverlay: normalizeToggle(current.debugOverlay),
    mute: normalizeToggle(current.mute),
    deafen: normalizeToggle(current.deafen)
  };
}

function displayStatus(account) {
  if (!account) return "Offline";
  return account.customStatus.trim() || presenceLabel(account.presence);
}

function isLikelyUrl(value) {
  return /^https?:\/\//i.test((value || "").trim());
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

function applyAvatarStyle(element, account) {
  element.style.backgroundImage = "";
  element.style.backgroundColor = account?.avatarColor || "#57f287";
  if (account && isLikelyUrl(account.avatarUrl || "")) {
    element.style.backgroundImage = `url(${account.avatarUrl})`;
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center";
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

function toggleReaction(message, emoji, userId) {
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
    reactions: []
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
      reactions: []
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
      reactions: []
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
      account.displayName = arg.slice(0, 32);
      addSystemMessage(channel, `Display name changed to ${account.displayName}.`);
    }
    return true;
  }

  if (command === "status") {
    account.customStatus = arg.slice(0, 80);
    addSystemMessage(channel, account.customStatus ? `Status set to: ${account.customStatus}` : "Status cleared.");
    return true;
  }

  if (command === "help") {
    const summary = SLASH_COMMANDS
      .map((entry) => `/${entry.name}${entry.args ? ` ${entry.args}` : ""}`)
      .join(", ");
    addSystemMessage(channel, `Commands: ${summary}`);
    return true;
  }

  addSystemMessage(channel, `Unknown command: /${command}`);
  return true;
}

function openMessageEditor(channelId, messageId, messageText) {
  messageEditTarget = { channelId, messageId };
  ui.messageEditInput.value = messageText || "";
  ui.messageEditDialog.showModal();
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
  const server = getActiveServer();
  if (!server) return [];
  const accounts = server.memberIds
    .map((memberId) => getAccountById(memberId))
    .filter(Boolean);
  return accounts
    .filter((account) => {
      const username = account.username.toLowerCase();
      const displayName = (account.displayName || "").toLowerCase();
      return !query || username.startsWith(query) || displayName.startsWith(query);
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
    item.innerHTML = `<strong>@${account.username}</strong><small>${account.displayName || account.username} · ${displayStatus(account)}</small>`;
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
  ui.replyPreviewText.textContent = `Replying to ${replyTarget.authorName}: ${previewText || "(empty message)"}`;
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
  document.body.dataset.compactMembers = prefs.compactMembers;
  document.body.dataset.developerMode = prefs.developerMode;
  document.body.dataset.debugOverlay = prefs.debugOverlay;
  ui.dockMuteBtn.style.opacity = prefs.mute === "on" ? "1" : "0.7";
  ui.dockHeadphonesBtn.style.opacity = prefs.deafen === "on" ? "1" : "0.7";
}

function displayNameForMessage(message) {
  if (message.userId) {
    const account = getAccountById(message.userId);
    if (account) return account.displayName || account.username;
  }
  return message.authorName || "Unknown";
}

function renderMessageText(container, rawText) {
  const current = getCurrentAccount();
  const tokens = (rawText || "").split(/(@[a-z0-9._-]+)/gi);
  tokens.forEach((token) => {
    const mentionMatch = token.match(/^@([a-z0-9._-]+)$/i);
    if (!mentionMatch) {
      container.appendChild(document.createTextNode(token));
      return;
    }
    const username = mentionMatch[1].toLowerCase();
    const account = getAccountByUsername(username);
    if (!account) {
      container.appendChild(document.createTextNode(token));
      return;
    }
    const mention = document.createElement("span");
    mention.className = `mention ${current && current.id === account.id ? "mention--self" : ""}`;
    mention.textContent = `@${account.username}`;
    mention.addEventListener("click", () => openUserPopout(account));
    container.appendChild(mention);
  });
}

function extractImageUrl(text) {
  if (!text) return null;
  const matches = text.match(/https?:\/\/\S+/gi);
  if (!matches) return null;
  const imageUrl = matches.find((url) => /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url));
  return imageUrl || null;
}

function renderScreens() {
  const loggedIn = Boolean(state.currentAccountId);
  ui.loginScreen.classList.toggle("screen--active", !loggedIn);
  ui.chatScreen.classList.toggle("screen--active", loggedIn);
}

function renderServers() {
  ui.serverList.innerHTML = "";
  const currentAccount = getCurrentAccount();
  state.guilds.forEach((server) => {
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
      state.activeGuildId = server.id;
      state.activeChannelId = server.channels[0]?.id || null;
      ensureCurrentUserInActiveServer();
      saveState();
      render();
    });
    button.addEventListener("contextmenu", (event) => {
      const currentUser = getCurrentAccount();
      openContextMenu(event, [
        {
          label: "Open Guild",
          action: () => {
            state.activeGuildId = server.id;
            state.activeChannelId = server.channels[0]?.id || null;
            ensureCurrentUserInActiveServer();
            saveState();
            render();
          }
        },
        {
          label: "Rename Guild",
          disabled: !currentUser || !hasServerPermission(server, currentUser.id, "manageChannels"),
          action: () => renameGuildById(server.id)
        },
        {
          label: "Create Channel",
          disabled: !currentUser || !hasServerPermission(server, currentUser.id, "manageChannels"),
          action: () => {
            state.activeGuildId = server.id;
            state.activeChannelId = server.channels[0]?.id || null;
            ui.channelNameInput.value = "";
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
          label: "Delete Guild",
          danger: true,
          disabled: state.guilds.length <= 1 || !currentUser || !hasServerPermission(server, currentUser.id, "administrator"),
          action: () => deleteGuildById(server.id)
        }
      ]);
    });
    ui.serverList.appendChild(button);
  });
}

function renderChannels() {
  const server = getActiveServer();
  ui.channelList.innerHTML = "";
  if (!server) {
    ui.activeServerName.textContent = "No guild";
    return;
  }

  const currentAccount = getCurrentAccount();
  const filter = channelFilterTerm.trim().toLowerCase();
  if (ui.channelFilterInput && ui.channelFilterInput.value !== channelFilterTerm) {
    ui.channelFilterInput.value = channelFilterTerm;
  }
  ui.activeServerName.textContent = server.name;
  const channelsToRender = server.channels.filter((channel) => !filter || channel.name.toLowerCase().includes(filter));
  channelsToRender.forEach((channel) => {
    const button = document.createElement("button");
    button.className = `channel-item ${channel.id === state.activeChannelId ? "active" : ""}`;
    const label = document.createElement("span");
    label.className = "channel-item__name";
    label.textContent = `# ${channel.name}`;
    button.appendChild(label);
    const unreadStats = getChannelUnreadStats(channel, currentAccount);
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
      state.activeChannelId = channel.id;
      saveState();
      renderMessages();
      renderChannels();
    });
    button.addEventListener("contextmenu", (event) => {
      openContextMenu(event, [
        {
          label: "Open Channel",
          action: () => {
            state.activeChannelId = channel.id;
            saveState();
            renderMessages();
            renderChannels();
          }
        },
        {
          label: "Copy Channel Name",
          action: () => copyText(`#${channel.name}`)
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

function openUserPopout(account, fallbackName = "Unknown") {
  const displayName = account?.displayName || account?.username || fallbackName;
  const bio = account?.bio?.trim() || "No bio yet.";

  ui.userPopoutName.textContent = displayName;
  ui.userPopoutStatus.textContent = account ? displayStatus(account) : "Offline";
  ui.userPopoutBio.textContent = bio;
  applyAvatarStyle(ui.userPopoutAvatar, account);
  applyBannerStyle(ui.userPopoutBanner, account?.banner || "");
  renderRoleChips(ui.userPopoutRoles, account?.id);
  ui.userPopoutDialog.showModal();
}

function renderMessages() {
  const channel = getActiveChannel();
  ui.messageList.innerHTML = "";
  ui.activeChannelName.textContent = channel ? `#${channel.name}` : "#none";
  ui.activeChannelTopic.textContent = channel?.topic?.trim() || "No topic";
  ui.messageInput.placeholder = channel ? `Message #${channel.name}` : "No channel selected";
  if (!channel || (replyTarget && replyTarget.channelId !== channel.id)) {
    replyTarget = null;
  }
  renderReplyComposer();
  renderSlashSuggestions();

  if (!channel) return;

  channel.messages.forEach((message) => {
    const currentUser = getCurrentAccount();
    const messageRow = document.createElement("article");
    messageRow.className = "message";
    messageRow.dataset.messageId = message.id;
    let replyLine = null;

    const head = document.createElement("div");
    head.className = "message-head";

    const userButton = document.createElement("button");
    userButton.className = "message-user";
    userButton.textContent = displayNameForMessage(message);
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
          label: "Mention User",
          disabled: !author,
          action: () => mentionInComposer(author)
        },
        {
          label: "Copy Username",
          disabled: !author,
          action: () => copyText(author ? `@${author.username}` : "")
        }
      ]);
    });

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = formatTime(message.ts);
    let editedBadge = null;
    if (message.editedAt) {
      editedBadge = document.createElement("span");
      editedBadge.className = "message-edited";
      editedBadge.textContent = "(edited)";
    }

    const text = document.createElement("div");
    text.className = "message-text";
    renderMessageText(text, message.text);

    const imageUrl = extractImageUrl(message.text);
    let imagePreview = null;
    if (imageUrl) {
      imagePreview = document.createElement("img");
      imagePreview.className = "message-image-preview";
      imagePreview.src = imageUrl;
      imagePreview.alt = "shared image";
      imagePreview.loading = "lazy";
    }

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
      replyTarget = {
        channelId: channel.id,
        messageId: message.id,
        authorName: displayNameForMessage(message),
        text: message.text || ""
      };
      renderReplyComposer();
      ui.messageInput.focus();
    });
    actionBar.appendChild(replyBtn);

    const canPin = currentUser && (message.userId === currentUser.id || canCurrentUser("manageMessages"));
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

    const canManageMessages = currentUser ? canCurrentUser("manageMessages") : false;
    const isOwnMessage = currentUser && message.userId === currentUser.id;
    if (isOwnMessage) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "message-action-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openMessageEditor(channel.id, message.id, message.text));
      actionBar.appendChild(editBtn);

    }

    if (isOwnMessage || canManageMessages) {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "message-action-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        const scopedChannel = findChannelById(channel.id);
        if (!scopedChannel) return;
        scopedChannel.messages = scopedChannel.messages.filter((entry) => entry.id !== message.id);
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
    if (editedBadge) head.appendChild(editedBadge);
    messageRow.appendChild(head);
    if (replyLine) messageRow.appendChild(replyLine);
    if (pinIndicator) messageRow.appendChild(pinIndicator);
    messageRow.appendChild(actionBar);
    messageRow.appendChild(text);
    if (imagePreview) messageRow.appendChild(imagePreview);
    messageRow.appendChild(reactions);
    messageRow.appendChild(reactionPicker);
    messageRow.addEventListener("contextmenu", (event) => {
      const canManageMessages = currentUser ? canCurrentUser("manageMessages") : false;
      const isOwnMessage = currentUser && message.userId === currentUser.id;
      openContextMenu(event, [
        {
          label: "Reply",
          action: () => {
            replyTarget = {
              channelId: channel.id,
              messageId: message.id,
              authorName: displayNameForMessage(message),
              text: message.text || ""
            };
            renderReplyComposer();
            ui.messageInput.focus();
          }
        },
        {
          label: "Copy Text",
          action: () => copyText(message.text || "")
        },
        {
          label: message.pinned ? "Unpin Message" : "Pin Message",
          disabled: !(currentUser && (message.userId === currentUser.id || canManageMessages)),
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
          label: "Edit Message",
          disabled: !isOwnMessage,
          action: () => openMessageEditor(channel.id, message.id, message.text)
        },
        {
          label: "Delete Message",
          danger: true,
          disabled: !(isOwnMessage || canManageMessages),
          action: () => {
            const scopedChannel = findChannelById(channel.id);
            if (!scopedChannel) return;
            scopedChannel.messages = scopedChannel.messages.filter((entry) => entry.id !== message.id);
            saveState();
            renderMessages();
          }
        }
      ]);
    });
    ui.messageList.appendChild(messageRow);
  });

  ui.messageList.scrollTop = ui.messageList.scrollHeight;
  const currentAccount = getCurrentAccount();
  if (currentAccount && markChannelRead(channel, currentAccount.id)) {
    saveState();
    renderServers();
    renderChannels();
  }
}

function renderMemberList() {
  const server = getActiveServer();
  ui.memberList.innerHTML = "";
  if (!server) return;

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

  const groups = [
    { title: `Online — ${online.length}`, items: online },
    { title: `Offline — ${offline.length}`, items: offline }
  ];

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
      applyAvatarStyle(avatar, account);

      const dot = document.createElement("span");
      dot.className = `presence-dot presence-${normalizePresence(account.presence)}`;
      avatar.appendChild(dot);

      const label = document.createElement("span");
      label.textContent = account.displayName || account.username;

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
            label: "Mention User",
            action: () => mentionInComposer(account)
          },
          {
            label: "Copy Username",
            action: () => copyText(`@${account.username}`)
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
  ui.dockName.textContent = account.displayName || account.username;
  ui.dockStatus.textContent = displayStatus(account);
  applyAvatarStyle(ui.dockAvatar, account);
  ui.dockPresenceDot.className = `dock-presence-dot presence-${normalizePresence(account.presence)}`;
}

function renderSelfPopout() {
  const account = getCurrentAccount();
  if (!account) return;
  ui.selfPopoutName.textContent = account.displayName || account.username;
  ui.selfPopoutStatus.textContent = displayStatus(account);
  ui.selfPopoutBio.textContent = account.bio?.trim() || "No bio yet.";
  applyAvatarStyle(ui.selfPopoutAvatar, account);
  applyBannerStyle(ui.selfPopoutBanner, account.banner || "");
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
  const prefs = getPreferences();
  if (!account) return;
  ui.settingsDisplayName.textContent = account.displayName || account.username;
  ui.settingsUsername.textContent = `@${account.username}`;
  ui.settingsCurrentStatus.textContent = displayStatus(account);
  ui.uiScaleInput.value = String(prefs.uiScale);
  ui.compactModeInput.value = prefs.compactMembers;
  ui.developerModeInput.value = prefs.developerMode;
  ui.debugOverlayInput.value = prefs.debugOverlay;
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

function render() {
  closeContextMenu();
  renderScreens();
  applyPreferencesToUI();
  if (!state.currentAccountId) return;
  if (ensureCurrentUserInActiveServer()) {
    saveState();
  }
  renderServers();
  renderChannels();
  renderMessages();
  renderMemberList();
  renderDock();
  renderSettingsScreen();
  renderReplyComposer();
  renderSlashSuggestions();
}

function openProfileEditor() {
  const account = getCurrentAccount();
  if (!account) return;
  ui.displayNameInput.value = account.displayName || account.username;
  ui.profileBioInput.value = account.bio || "";
  ui.profileStatusInput.value = account.customStatus || "";
  ui.presenceInput.value = account.presence || "online";
  ui.profileBannerInput.value = account.banner || "";
  ui.profileAvatarInput.value = account.avatarColor || "#57f287";
  ui.profileAvatarUrlInput.value = account.avatarUrl || "";
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
  }

  state.currentAccountId = account.id;
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
  if (!createOrSwitchAccount(typed)) return;
  ui.loginUsername.value = "";
  saveState();
  render();
});

ui.messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = ui.messageInput.value.trim();
  const channel = getActiveChannel();
  const account = getCurrentAccount();
  if (!channel || !account || !text) return;

  ensureCurrentUserInActiveServer();
  if (!handleSlashCommand(text, channel, account)) {
    const nextReply = replyTarget && replyTarget.channelId === channel.id
      ? { messageId: replyTarget.messageId, authorName: replyTarget.authorName, text: replyTarget.text }
      : null;
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text,
      ts: new Date().toISOString(),
      reactions: [],
      replyTo: nextReply
    });
    replyTarget = null;
  }

  ui.messageInput.value = "";
  slashSelectionIndex = 0;
  saveState();
  renderMessages();
  renderMemberList();
});

ui.messageInput.addEventListener("input", () => {
  slashSelectionIndex = 0;
  mentionSelectionIndex = 0;
  renderSlashSuggestions();
});

ui.channelFilterInput.addEventListener("input", () => {
  channelFilterTerm = ui.channelFilterInput.value.trim().slice(0, 40);
  renderChannels();
});

ui.messageInput.addEventListener("keydown", (event) => {
  const suggestion = getComposerSuggestionState();
  const popupVisible = suggestion.type !== "none";

  if (event.key === "Escape") {
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
    event.preventDefault();
    if (suggestion.type === "slash") {
      const selected = suggestion.items[slashSelectionIndex] || suggestion.items[0];
      if (selected) applySlashCompletion(selected.name);
    } else {
      const selected = suggestion.items[mentionSelectionIndex] || suggestion.items[0];
      if (selected) applyMentionCompletion(selected);
    }
  }
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
    roles: [everyoneRole, adminRole],
    memberRoles,
    channels: [
      {
        id: generalId,
        name: "general",
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
  ui.createChannelDialog.showModal();
});

ui.channelCancel.addEventListener("click", () => ui.createChannelDialog.close());

ui.createChannelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const server = getActiveServer();
  if (!server) return;

  const channel = {
    id: createId(),
    name: sanitizeChannelName(ui.channelNameInput.value, "new-channel"),
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

ui.messageEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!messageEditTarget) return;
  const scopedChannel = findChannelById(messageEditTarget.channelId);
  const scopedMessage = findMessageInChannel(scopedChannel, messageEditTarget.messageId);
  if (!scopedChannel || !scopedMessage) return;
  scopedMessage.text = ui.messageEditInput.value.trim().slice(0, 400);
  scopedMessage.editedAt = new Date().toISOString();
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
  closeSettingsScreen();
  saveState();
  render();
});

ui.appearanceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.preferences = getPreferences();
  state.preferences.uiScale = Math.min(115, Math.max(90, Number(ui.uiScaleInput.value) || 100));
  state.preferences.compactMembers = normalizeToggle(ui.compactModeInput.value);
  saveState();
  render();
});

ui.advancedForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.preferences = getPreferences();
  state.preferences.developerMode = normalizeToggle(ui.developerModeInput.value);
  state.preferences.debugOverlay = normalizeToggle(ui.debugOverlayInput.value);
  saveState();
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
  ui.selfMenuDialog.close();
  saveState();
  render();
});

ui.profileCancel.addEventListener("click", () => ui.profileDialog.close());

ui.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const account = getCurrentAccount();
  if (!account) return;

  account.displayName = ui.displayNameInput.value.trim().slice(0, 32) || account.username;
  account.bio = ui.profileBioInput.value.trim().slice(0, 180);
  account.customStatus = ui.profileStatusInput.value.trim().slice(0, 80);
  account.presence = normalizePresence(ui.presenceInput.value);
  account.banner = ui.profileBannerInput.value.trim();
  account.avatarColor = ui.profileAvatarInput.value.trim() || "#57f287";
  account.avatarUrl = ui.profileAvatarUrlInput.value.trim();

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
  ui.selfMenuDialog,
  ui.userPopoutDialog,
  ui.accountSwitchDialog
].forEach(wireDialogBackdropClose);

document.addEventListener("click", (event) => {
  if (!contextMenuOpen) return;
  if (ui.contextMenu.contains(event.target)) return;
  closeContextMenu();
});

document.addEventListener("contextmenu", (event) => {
  if (!contextMenuOpen) return;
  if (ui.contextMenu.contains(event.target)) return;
  closeContextMenu();
});

window.addEventListener("resize", closeContextMenu);
document.addEventListener("scroll", closeContextMenu, true);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && contextMenuOpen) {
    closeContextMenu();
    return;
  }
  if (event.key === "Escape" && ui.settingsScreen.classList.contains("settings-screen--active")) {
    closeSettingsScreen();
  }
});

render();
