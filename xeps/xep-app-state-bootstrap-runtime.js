/*
 * App state bootstrap/migration runtime extracted from app.js.
 * Loaded before app.js to provide state constructors/migration helpers.
 */

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
    categoryId: "",
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
        channelCategories: [],
        roles: [everyoneRole],
        memberRoles: {},
        channels: [
          {
            id: channelId,
            name: "general",
            type: "text",
            categoryId: "",
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
    gifUsage: {
      byConversation: {},
      byTime: {},
      byNetwork: {}
    },
    preferences: {
      uiScale: 100,
      theme: "discord",
      uiAccentColor: "",
      language: "auto",
      languageOnboardingSeen: "off",
      dmHomeTab: "friends",
      compactMembers: "off",
      enterToSend: "enter",
      quickSwitcherHotkey: "ctrl-k",
      reducedMotion: "off",
      uiIntensity: 100,
      developerMode: "off",
      debugOverlay: "off",
      mute: "off",
      deafen: "off",
      swfAudio: "on",
      swfVolume: 20,
      swfAudioPolicy: "single",
      swfAudioScope: "global",
      swfAutoplay: "on",
      hapticMode: "full",
      swfPauseOnMute: "off",
      swfVuMeter: "off",
      swfQuickAudioMode: "click",
      messageCharLimit: MESSAGE_CHAR_LIMIT_DEFAULT,
      guildNotifications: {},
      forumCollapsedThreads: {},
      forumThreadReadState: {},
      forumThreadSort: {},
      forumThreadTagFilter: {},
      forumThreadUnreadOnly: {},
      collapsedChannelCategories: {},
      mediaPrivacyMode: "safe",
      mediaTrustRules: [],
      mediaDenyRules: [],
      mediaLastTab: "gif",
      gifFavorites: [],
      gifGroups: [],
      gifScope: "all",
      recentEmojis: [],
      hideChannelPanel: "off",
      hideMemberPanel: "off",
      mobilePane: "chat",
      collapseDmSection: "off",
      collapseGuildSection: "off",
      lastChannelByGuild: {},
      swfPipPosition: null,
      videoPipPosition: null,
      swfPipSize: null,
      videoPipSize: null,
      relayMode: "local",
      relayUrl: "ws://localhost:8787",
      relayRoom: "",
      relayAutoConnect: "on",
      relayClientId: createId(),
      rememberLogin: "on",
      rememberLoginStorage: "off",
      xmppJid: "",
      xmppPassword: "",
      xmppWsUrl: "",
      xmppMucService: "",
      xmppHideNonXmpp: "on",
      xmppOmemoEnabledByJid: {},
      callProviderUrl: "https://meet.jit.si",
      callRoomPrefix: "shitcord67",
      callAutoPost: "on",
      callAudioInputId: "",
      callVideoInputId: "",
      callAudioOutputId: "",
      callScreenSystemAudio: "on",
      callScreenMicMix: "on",
      platformOverride: "auto",
      whiteboardProviderUrl: "https://wbo.ophir.dev/boards",
      whiteboardRoomPrefix: "shitcord67-wb",
      whiteboardAutoPost: "on"
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
    xmppIdleSince: "",
    xmppLastActiveAt: "",
    customStatus: "",
    customStatusEmoji: "",
    customStatusExpiresAt: null,
    avatarDecoration: "",
    guildTag: "",
    guildTagGuildId: "",
    profileEffect: "none",
    profileNameplateSvg: "",
    activityText: "",
    activities: [],
    ownedCosmetics: {
      decor: [],
      nameplate: [],
      effect: []
    },
    cosmeticPurchases: []
  };
}

function normalizeOwnedCosmetics(raw) {
  return normalizeOwnedCosmeticsViaModule(raw);
}

function normalizeGuildTagGuildId(raw) {
  return normalizeGuildTagGuildIdViaModule(raw);
}

function normalizeCosmeticPurchases(raw) {
  return normalizeCosmeticPurchasesViaModule(raw);
}

function sanitizeStoredChannelCategoryName(nameInput, fallback = "Category") {
  const cleaned = (nameInput || "").toString().replace(/\s+/g, " ").trim().slice(0, 32);
  return cleaned || fallback;
}

function normalizeChannelCategories(raw) {
  const source = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const normalized = [];
  source.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const id = (entry.id || "").toString().trim() || createId();
    if (seen.has(id)) return;
    seen.add(id);
    normalized.push({
      id,
      name: sanitizeStoredChannelCategoryName(entry.name || "Category")
    });
  });
  return normalized;
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

function resolveCosmeticSeason(date = new Date()) {
  const month = date.getUTCMonth();
  return COSMETIC_SEASONS.find((season) => season.months.includes(month)) || COSMETIC_SEASONS[0];
}

function resolveFeaturedCosmeticBundles(now = new Date()) {
  const season = resolveCosmeticSeason(now);
  const candidateBundles = COSMETIC_BUNDLE_CATALOG.filter((bundle) => bundle.seasons.includes(season.key));
  const fallbackBundles = COSMETIC_BUNDLE_CATALOG;
  const pool = candidateBundles.length > 0 ? candidateBundles : fallbackBundles;
  if (pool.length === 0) {
    return {
      season,
      bundles: [],
      endsAtMs: Date.now() + COSMETIC_ROTATION_INTERVAL_MS
    };
  }
  const nowMs = now.getTime();
  const rotationIndex = Math.max(0, Math.floor((nowMs - COSMETIC_ROTATION_ANCHOR_MS) / COSMETIC_ROTATION_INTERVAL_MS));
  const slotCount = Math.min(2, pool.length);
  const bundles = Array.from({ length: slotCount }, (_, offset) => {
    const index = (rotationIndex + offset) % pool.length;
    return pool[index];
  }).filter(Boolean);
  const endsAtMs = COSMETIC_ROTATION_ANCHOR_MS + ((rotationIndex + 1) * COSMETIC_ROTATION_INTERVAL_MS);
  return {
    season,
    bundles,
    endsAtMs
  };
}

function migrateState(raw) {
  const sourceGuilds = Array.isArray(raw?.guilds) ? raw.guilds : raw?.servers;
  if (raw && Array.isArray(raw.accounts) && Array.isArray(sourceGuilds)) {
    if (!raw.preferences || typeof raw.preferences !== "object") {
      raw.preferences = buildInitialState().preferences;
    }
    if (!raw.preferences.collapsedChannelCategories || typeof raw.preferences.collapsedChannelCategories !== "object") {
      raw.preferences.collapsedChannelCategories = {};
    }
    raw.accounts = raw.accounts.map((account) => ({
      ...account,
      guildProfiles: account && typeof account.guildProfiles === "object" ? { ...account.guildProfiles } : {},
      xmppIdleSince: Number.isFinite(Date.parse(account?.xmppIdleSince || "")) ? new Date(account.xmppIdleSince).toISOString() : "",
      xmppLastActiveAt: Number.isFinite(Date.parse(account?.xmppLastActiveAt || "")) ? new Date(account.xmppLastActiveAt).toISOString() : "",
      customStatusEmoji: (account?.customStatusEmoji || "").toString().slice(0, 4),
      customStatusExpiresAt: account?.customStatusExpiresAt || null,
      avatarDecoration: (account?.avatarDecoration || "").toString().slice(0, 4),
      guildTag: (account?.guildTag || "").toString().trim().slice(0, 8),
      guildTagGuildId: normalizeGuildTagGuildId(account?.guildTagGuildId),
      profileEffect: normalizeProfileEffect(account?.profileEffect),
      profileNameplateSvg: (account?.profileNameplateSvg || "").toString().slice(0, 280),
      activityText: (account?.activityText || "").toString().slice(0, 180),
      activities: Array.isArray(account?.activities)
        ? account.activities
          .map((entry) => (
            entry && typeof entry === "object"
              ? {
                name: (entry.name || "").toString().slice(0, 120),
                details: (entry.details || "").toString().slice(0, 160),
                state: (entry.state || "").toString().slice(0, 160)
              }
              : null
          ))
          .filter(Boolean)
          .slice(0, 6)
        : [],
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
      const channelCategories = normalizeChannelCategories(guild.channelCategories);
      const channelCategoryIds = new Set(channelCategories.map((entry) => entry.id));
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
        channelCategories,
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
                categoryId: channelCategoryIds.has((channel.categoryId || "").toString().trim())
                  ? (channel.categoryId || "").toString().trim()
                  : "",
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
      account.guildTagGuildId = normalizeGuildTagGuildId(raw.profile.guildTagGuildId);
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
      const channelCategories = normalizeChannelCategories(guild.channelCategories);
      const channelCategoryIds = new Set(channelCategories.map((entry) => entry.id));
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
              categoryId: channelCategoryIds.has((channel.categoryId || "").toString().trim())
                ? (channel.categoryId || "").toString().trim()
                : "",
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
        channelCategories,
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
