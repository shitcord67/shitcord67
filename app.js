const STORAGE_KEY = "flashcord-state-v1";

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

function buildInitialState() {
  const initialServerId = createId();
  const initialChannelId = createId();
  return {
    currentUser: null,
    profile: {
      bio: "",
      banner: "",
      avatarColor: "#57f287"
    },
    servers: [
      {
        id: initialServerId,
        name: "My First Server",
        channels: [
          {
            id: initialChannelId,
            name: "general",
            messages: [
              {
                id: createId(),
                user: "system",
                text: "Welcome to FlashCord. Create channels and start chatting.",
                ts: new Date().toISOString()
              }
            ]
          }
        ]
      }
    ],
    activeServerId: initialServerId,
    activeChannelId: initialChannelId
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return buildInitialState();
    }
    const parsed = JSON.parse(raw);
    if (!parsed.activeServerId && parsed.servers[0]) {
      parsed.activeServerId = parsed.servers[0].id;
    }
    const activeServer = parsed.servers.find((s) => s.id === parsed.activeServerId);
    if (!parsed.activeChannelId && activeServer?.channels[0]) {
      parsed.activeChannelId = activeServer.channels[0].id;
    }
    return parsed;
  } catch {
    return buildInitialState();
  }
}

let state = loadState();

const ui = {
  loginScreen: document.getElementById("loginScreen"),
  chatScreen: document.getElementById("chatScreen"),
  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  serverList: document.getElementById("serverList"),
  channelList: document.getElementById("channelList"),
  activeServerName: document.getElementById("activeServerName"),
  activeChannelName: document.getElementById("activeChannelName"),
  messageList: document.getElementById("messageList"),
  messageForm: document.getElementById("messageForm"),
  messageInput: document.getElementById("messageInput"),
  profileName: document.getElementById("profileName"),
  profileBio: document.getElementById("profileBio"),
  profileBanner: document.getElementById("profileBanner"),
  profileAvatar: document.getElementById("profileAvatar"),
  editProfileBtn: document.getElementById("editProfileBtn"),
  createServerBtn: document.getElementById("createServerBtn"),
  createChannelBtn: document.getElementById("createChannelBtn"),
  profileDialog: document.getElementById("profileDialog"),
  profileForm: document.getElementById("profileForm"),
  profileBioInput: document.getElementById("profileBioInput"),
  profileBannerInput: document.getElementById("profileBannerInput"),
  profileAvatarInput: document.getElementById("profileAvatarInput"),
  profileCancel: document.getElementById("profileCancel"),
  createServerDialog: document.getElementById("createServerDialog"),
  createServerForm: document.getElementById("createServerForm"),
  serverNameInput: document.getElementById("serverNameInput"),
  serverCancel: document.getElementById("serverCancel"),
  createChannelDialog: document.getElementById("createChannelDialog"),
  createChannelForm: document.getElementById("createChannelForm"),
  channelNameInput: document.getElementById("channelNameInput"),
  channelCancel: document.getElementById("channelCancel")
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveServer() {
  return state.servers.find((s) => s.id === state.activeServerId) || null;
}

function getActiveChannel() {
  const server = getActiveServer();
  if (!server) return null;
  return server.channels.find((c) => c.id === state.activeChannelId) || null;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isLikelyUrl(value) {
  return /^https?:\/\//i.test(value.trim());
}

function applyBannerStyle(bannerValue) {
  const value = bannerValue.trim();
  if (!value) {
    ui.profileBanner.style.background = "linear-gradient(120deg, #5160f7, #2b45d4)";
    ui.profileBanner.style.backgroundImage = "";
    return;
  }
  if (isLikelyUrl(value)) {
    ui.profileBanner.style.background = "#2f3136";
    ui.profileBanner.style.backgroundImage = `url(${value})`;
    ui.profileBanner.style.backgroundSize = "cover";
    ui.profileBanner.style.backgroundPosition = "center";
    return;
  }
  ui.profileBanner.style.backgroundImage = "";
  ui.profileBanner.style.background = value;
}

function renderServers() {
  ui.serverList.innerHTML = "";
  state.servers.forEach((server) => {
    const btn = document.createElement("button");
    btn.className = `server-item ${server.id === state.activeServerId ? "active" : ""}`;
    btn.textContent = server.name.slice(0, 2).toUpperCase();
    btn.title = server.name;
    btn.addEventListener("click", () => {
      state.activeServerId = server.id;
      state.activeChannelId = server.channels[0]?.id || null;
      saveState();
      render();
    });
    ui.serverList.appendChild(btn);
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
    const btn = document.createElement("button");
    btn.className = `channel-item ${channel.id === state.activeChannelId ? "active" : ""}`;
    btn.textContent = `# ${channel.name}`;
    btn.addEventListener("click", () => {
      state.activeChannelId = channel.id;
      saveState();
      renderMessages();
      renderChannels();
    });
    ui.channelList.appendChild(btn);
  });
}

function renderMessages() {
  const channel = getActiveChannel();
  ui.messageList.innerHTML = "";
  ui.activeChannelName.textContent = channel ? `#${channel.name}` : "#none";
  ui.messageInput.placeholder = channel ? `Message #${channel.name}` : "No channel selected";

  if (!channel) return;
  channel.messages.forEach((msg) => {
    const row = document.createElement("article");
    row.className = "message";

    const head = document.createElement("div");
    head.className = "message-head";
    head.innerHTML = `<span class="message-user">${escapeHtml(msg.user)}</span><span class="message-time">${formatTime(msg.ts)}</span>`;

    const text = document.createElement("div");
    text.className = "message-text";
    text.textContent = msg.text;

    row.appendChild(head);
    row.appendChild(text);
    ui.messageList.appendChild(row);
  });
  ui.messageList.scrollTop = ui.messageList.scrollHeight;
}

function renderProfile() {
  ui.profileName.textContent = state.currentUser || "Guest";
  ui.profileBio.textContent = state.profile.bio?.trim() || "No bio yet.";
  ui.profileAvatar.style.background = state.profile.avatarColor || "#57f287";
  applyBannerStyle(state.profile.banner || "");
}

function renderScreens() {
  const loggedIn = Boolean(state.currentUser);
  ui.loginScreen.classList.toggle("screen--active", !loggedIn);
  ui.chatScreen.classList.toggle("screen--active", loggedIn);
}

function render() {
  renderScreens();
  if (!state.currentUser) return;
  renderServers();
  renderChannels();
  renderMessages();
  renderProfile();
}

function sanitizeName(value, fallback) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 40);
  return cleaned || fallback;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

ui.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = ui.loginUsername.value.trim().slice(0, 24);
  if (!username) return;
  state.currentUser = username;
  saveState();
  render();
  ui.loginUsername.value = "";
});

ui.messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = ui.messageInput.value.trim();
  const channel = getActiveChannel();
  if (!channel || !text || !state.currentUser) return;
  channel.messages.push({
    id: createId(),
    user: state.currentUser,
    text,
    ts: new Date().toISOString()
  });
  ui.messageInput.value = "";
  saveState();
  renderMessages();
});

ui.editProfileBtn.addEventListener("click", () => {
  ui.profileBioInput.value = state.profile.bio || "";
  ui.profileBannerInput.value = state.profile.banner || "";
  ui.profileAvatarInput.value = state.profile.avatarColor || "";
  ui.profileDialog.showModal();
});

ui.profileCancel.addEventListener("click", () => ui.profileDialog.close());

ui.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.profile.bio = ui.profileBioInput.value.trim();
  state.profile.banner = ui.profileBannerInput.value.trim();
  state.profile.avatarColor = ui.profileAvatarInput.value.trim() || "#57f287";
  saveState();
  ui.profileDialog.close();
  renderProfile();
});

ui.createServerBtn.addEventListener("click", () => {
  ui.serverNameInput.value = "";
  ui.createServerDialog.showModal();
});

ui.serverCancel.addEventListener("click", () => ui.createServerDialog.close());

ui.createServerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = ui.serverNameInput.value.trim().slice(0, 40);
  if (!name) return;
  const channelId = createId();
  const server = {
    id: createId(),
    name,
    channels: [
      {
        id: channelId,
        name: "general",
        messages: []
      }
    ]
  };
  state.servers.push(server);
  state.activeServerId = server.id;
  state.activeChannelId = channelId;
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
  const raw = ui.channelNameInput.value;
  const channelName = sanitizeName(raw, "new-channel");
  const channel = {
    id: createId(),
    name: channelName,
    messages: []
  };
  server.channels.push(channel);
  state.activeChannelId = channel.id;
  saveState();
  ui.createChannelDialog.close();
  render();
});

render();
