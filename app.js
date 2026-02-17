const STORAGE_KEY = "flashcord-state-v2";

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

function buildInitialState() {
  const serverId = createId();
  const channelId = createId();
  return {
    accounts: [],
    currentAccountId: null,
    servers: [
      {
        id: serverId,
        name: "My First Server",
        memberIds: [],
        channels: [
          {
            id: channelId,
            name: "general",
            messages: [
              {
                id: createId(),
                userId: null,
                authorName: "system",
                text: "Welcome to FlashCord. Create channels and start chatting.",
                ts: new Date().toISOString()
              }
            ]
          }
        ]
      }
    ],
    activeServerId: serverId,
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
  if (raw && Array.isArray(raw.accounts) && Array.isArray(raw.servers)) {
    if (!raw.preferences || typeof raw.preferences !== "object") {
      raw.preferences = buildInitialState().preferences;
    }
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

  if (Array.isArray(raw.servers) && raw.servers.length > 0) {
    migrated.servers = raw.servers.map((server) => {
      const serverId = server.id || createId();
      const memberIds = [];
      if (account) memberIds.push(account.id);
      const channels = Array.isArray(server.channels) && server.channels.length > 0
        ? server.channels.map((channel) => {
            const messages = Array.isArray(channel.messages)
              ? channel.messages.map((msg) => ({
                  id: msg.id || createId(),
                  userId: account && msg.user === raw.currentUser ? account.id : null,
                  authorName: account && msg.user === raw.currentUser ? "" : (msg.user || "unknown"),
                  text: (msg.text || "").toString(),
                  ts: msg.ts || new Date().toISOString()
                }))
              : [];
            return {
              id: channel.id || createId(),
              name: channel.name || "general",
              messages
            };
          })
        : [
            {
              id: createId(),
              name: "general",
              messages: []
            }
          ];
      return {
        id: serverId,
        name: server.name || "Untitled Server",
        memberIds,
        channels
      };
    });

    migrated.activeServerId = raw.activeServerId || migrated.servers[0].id;
    const activeServer = migrated.servers.find((s) => s.id === migrated.activeServerId) || migrated.servers[0];
    migrated.activeChannelId = raw.activeChannelId || activeServer.channels[0].id;
  }

  return migrated;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw));

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

const ui = {
  loginScreen: document.getElementById("loginScreen"),
  chatScreen: document.getElementById("chatScreen"),
  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  serverList: document.getElementById("serverList"),
  channelList: document.getElementById("channelList"),
  memberList: document.getElementById("memberList"),
  activeServerName: document.getElementById("activeServerName"),
  activeChannelName: document.getElementById("activeChannelName"),
  messageList: document.getElementById("messageList"),
  messageForm: document.getElementById("messageForm"),
  messageInput: document.getElementById("messageInput"),
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
  selfMenuDialog: document.getElementById("selfMenuDialog"),
  selfPopoutBanner: document.getElementById("selfPopoutBanner"),
  selfPopoutAvatar: document.getElementById("selfPopoutAvatar"),
  selfPopoutName: document.getElementById("selfPopoutName"),
  selfPopoutStatus: document.getElementById("selfPopoutStatus"),
  selfPopoutBio: document.getElementById("selfPopoutBio"),
  selfEditProfile: document.getElementById("selfEditProfile"),
  selfSwitchAccount: document.getElementById("selfSwitchAccount"),
  selfLogout: document.getElementById("selfLogout"),
  userPopoutDialog: document.getElementById("userPopoutDialog"),
  userPopoutBanner: document.getElementById("userPopoutBanner"),
  userPopoutAvatar: document.getElementById("userPopoutAvatar"),
  userPopoutName: document.getElementById("userPopoutName"),
  userPopoutStatus: document.getElementById("userPopoutStatus"),
  userPopoutBio: document.getElementById("userPopoutBio"),
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

function getActiveServer() {
  return state.servers.find((server) => server.id === state.activeServerId) || null;
}

function getActiveChannel() {
  const server = getActiveServer();
  if (!server) return null;
  return server.channels.find((channel) => channel.id === state.activeChannelId) || null;
}

function ensureCurrentUserInActiveServer() {
  const account = getCurrentAccount();
  const server = getActiveServer();
  if (!account || !server) return false;
  if (!server.memberIds.includes(account.id)) {
    server.memberIds.push(account.id);
    return true;
  }
  return false;
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

function renderScreens() {
  const loggedIn = Boolean(state.currentAccountId);
  ui.loginScreen.classList.toggle("screen--active", !loggedIn);
  ui.chatScreen.classList.toggle("screen--active", loggedIn);
}

function renderServers() {
  ui.serverList.innerHTML = "";
  state.servers.forEach((server) => {
    const button = document.createElement("button");
    button.className = `server-item ${server.id === state.activeServerId ? "active" : ""}`;
    button.textContent = server.name.slice(0, 2).toUpperCase();
    button.title = server.name;
    button.addEventListener("click", () => {
      state.activeServerId = server.id;
      state.activeChannelId = server.channels[0]?.id || null;
      ensureCurrentUserInActiveServer();
      saveState();
      render();
    });
    ui.serverList.appendChild(button);
  });
}

function renderChannels() {
  const server = getActiveServer();
  ui.channelList.innerHTML = "";
  if (!server) {
    ui.activeServerName.textContent = "No server";
    return;
  }

  ui.activeServerName.textContent = server.name;
  server.channels.forEach((channel) => {
    const button = document.createElement("button");
    button.className = `channel-item ${channel.id === state.activeChannelId ? "active" : ""}`;
    button.textContent = `# ${channel.name}`;
    button.addEventListener("click", () => {
      state.activeChannelId = channel.id;
      saveState();
      renderMessages();
      renderChannels();
    });
    ui.channelList.appendChild(button);
  });
}

function openUserPopout(account, fallbackName = "Unknown") {
  const displayName = account?.displayName || account?.username || fallbackName;
  const bio = account?.bio?.trim() || "No bio yet.";

  ui.userPopoutName.textContent = displayName;
  ui.userPopoutStatus.textContent = account ? displayStatus(account) : "Offline";
  ui.userPopoutBio.textContent = bio;
  applyAvatarStyle(ui.userPopoutAvatar, account);
  applyBannerStyle(ui.userPopoutBanner, account?.banner || "");
  ui.userPopoutDialog.showModal();
}

function renderMessages() {
  const channel = getActiveChannel();
  ui.messageList.innerHTML = "";
  ui.activeChannelName.textContent = channel ? `#${channel.name}` : "#none";
  ui.messageInput.placeholder = channel ? `Message #${channel.name}` : "No channel selected";

  if (!channel) return;

  channel.messages.forEach((message) => {
    const messageRow = document.createElement("article");
    messageRow.className = "message";

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

    const text = document.createElement("div");
    text.className = "message-text";
    text.textContent = message.text;

    head.appendChild(userButton);
    head.appendChild(time);
    messageRow.appendChild(head);
    messageRow.appendChild(text);
    ui.messageList.appendChild(messageRow);
  });

  ui.messageList.scrollTop = ui.messageList.scrollHeight;
}

function renderMemberList() {
  const server = getActiveServer();
  ui.memberList.innerHTML = "";
  if (!server) return;

  server.memberIds.forEach((memberId) => {
    const account = getAccountById(memberId);
    if (!account) return;

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
    ui.memberList.appendChild(row);
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

function createOrSwitchAccount(usernameInput) {
  const normalized = normalizeUsername(usernameInput);
  if (!normalized) return false;

  let account = getAccountByUsername(normalized);
  if (!account) {
    account = createAccount(normalized, usernameInput.trim().slice(0, 32));
    state.accounts.push(account);
  }

  state.currentAccountId = account.id;
  if (!state.activeServerId && state.servers[0]) {
    state.activeServerId = state.servers[0].id;
  }
  if (!state.activeChannelId && state.servers[0]?.channels[0]) {
    state.activeChannelId = state.servers[0].channels[0].id;
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
  channel.messages.push({
    id: createId(),
    userId: account.id,
    authorName: "",
    text,
    ts: new Date().toISOString()
  });

  ui.messageInput.value = "";
  saveState();
  renderMessages();
  renderMemberList();
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
  const server = {
    id: createId(),
    name,
    memberIds: account ? [account.id] : [],
    channels: [
      {
        id: generalId,
        name: "general",
        messages: []
      }
    ]
  };

  state.servers.push(server);
  state.activeServerId = server.id;
  state.activeChannelId = generalId;
  saveState();
  ui.createServerDialog.close();
  render();
});

ui.createChannelBtn.addEventListener("click", () => {
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
    messages: []
  };

  server.channels.push(channel);
  state.activeChannelId = channel.id;
  saveState();
  ui.createChannelDialog.close();
  render();
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
  ui.selfMenuDialog,
  ui.userPopoutDialog,
  ui.accountSwitchDialog
].forEach(wireDialogBackdropClose);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && ui.settingsScreen.classList.contains("settings-screen--active")) {
    closeSettingsScreen();
  }
});

render();
