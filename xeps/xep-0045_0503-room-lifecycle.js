(function initXep0045_0503RoomLifecycle(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0045_0503_ROOM_LIFECYCLE) return;

  function isXmppBackedChannel(channel, deps = {}) {
    if (!channel || typeof channel !== "object") return false;
    const roomJid = typeof deps.normalizeXmppJidFn === "function"
      ? deps.normalizeXmppJidFn(channel.xmppRoomJid || "").toLowerCase()
      : "";
    if (roomJid) return true;
    const relayRoomToken = (channel.relayRoomToken || "").toString().trim().toLowerCase();
    if (relayRoomToken.startsWith("xmpp:")) return true;
    const groupName = (channel.xmppGroupName || "").toString().trim();
    return Boolean(groupName);
  }

  function isXmppBackedGuild(guild, deps = {}) {
    if (!guild || typeof guild !== "object") return false;
    const guildId = (guild.id || "").toString().toLowerCase();
    if (guildId.startsWith("xmpp-spaces:")) return true;
    if (!Array.isArray(guild.channels)) return false;
    return guild.channels.some((channel) => isXmppBackedChannel(channel, deps));
  }

  function resolveXmppServiceUrl(prefs = {}, deps = {}) {
    const explicit = typeof deps.normalizeXmppWsUrlFn === "function"
      ? deps.normalizeXmppWsUrlFn(prefs.xmppWsUrl)
      : "";
    if (explicit) return explicit;
    const domain = typeof deps.xmppDomainFromJidFn === "function" ? deps.xmppDomainFromJidFn(prefs.xmppJid) : "";
    if (!domain) return "";
    return `wss://api.${domain}/ws`;
  }

  function joinXmppRoom(roomToken, account = null, deps = {}) {
    if (!deps.xmppConnection || !account) return false;
    if (deps.relayStatus !== "connected") return false;
    if (deps.xmppConnection.authenticated === false || deps.xmppConnection.connected === false) return false;
    const prefs = typeof deps.getPreferencesFn === "function" ? deps.getPreferencesFn() : {};
    const roomJid = typeof deps.xmppRoomJidForTokenFn === "function" ? deps.xmppRoomJidForTokenFn(roomToken, prefs) : "";
    if (!roomJid) return false;
    const existingJoin = deps.xmppMucJoinStateByRoomJid?.get?.(roomJid) || {};
    const shouldForceRejoin = Boolean(
      existingJoin.pending
      || (existingJoin.lastErrorCondition || "").toString().toLowerCase() === "unavailable"
    );
    if (deps.xmppRoomByJid?.has?.(roomJid) && !shouldForceRejoin) {
      deps.xmppMucJoinStateByRoomJid?.set?.(roomJid, {
        ...existingJoin,
        roomToken,
        nick: existingJoin.nick || (typeof deps.sanitizeChannelNameFn === "function" ? deps.sanitizeChannelNameFn(account.username || "user", "user") : "user"),
        pending: false,
        joinedAt: existingJoin.joinedAt || new Date().toISOString()
      });
      const mamState = typeof deps.ensureXmppMamStateFn === "function" ? deps.ensureXmppMamStateFn(roomJid) : null;
      if (!mamState || (mamState.pagesLoaded === 0 && !mamState.loading)) {
        if (typeof deps.requestXmppRoomHistoryFn === "function") {
          deps.requestXmppRoomHistoryFn(roomJid, {
            reason: "join",
            prefetchPages: deps.XMPP_MAM_PREFETCH_PAGES || 1
          });
        }
      }
      if (typeof deps.scheduleXmppMucSelfPingFn === "function") {
        deps.scheduleXmppMucSelfPingFn(roomJid, { immediate: true, reason: "join-existing" });
      }
      return true;
    }
    if (shouldForceRejoin) {
      deps.xmppRoomByJid?.delete?.(roomJid);
      if (typeof deps.clearXmppMucSelfPingFn === "function") deps.clearXmppMucSelfPingFn(roomJid);
    }
    if (typeof deps.$pres !== "function") return false;
    const nick = typeof deps.sanitizeChannelNameFn === "function"
      ? deps.sanitizeChannelNameFn(account.username || "user", "user")
      : "user";
    const presence = deps.$pres({ to: `${roomJid}/${nick}` }).c("x", { xmlns: "http://jabber.org/protocol/muc" });
    deps.xmppConnection.send(presence);
    deps.xmppRoomByJid?.set?.(roomJid, roomToken);
    deps.xmppMucJoinStateByRoomJid?.set?.(roomJid, {
      roomToken,
      nick,
      pending: true,
      attemptedAt: new Date().toISOString(),
      lastErrorAt: "",
      lastErrorCondition: "",
      lastErrorText: ""
    });
    const mapped = typeof deps.upsertXmppRoomChannelFn === "function"
      ? deps.upsertXmppRoomChannelFn(roomJid, {
        roomToken,
        account,
        prefs,
        persist: true
      })
      : { created: false };
    if (mapped.created) {
      if (typeof deps.renderServersFn === "function") deps.renderServersFn();
      if (typeof deps.renderChannelsFn === "function") deps.renderChannelsFn();
    }
    if (typeof deps.requestXmppRoomHistoryFn === "function") {
      deps.requestXmppRoomHistoryFn(roomJid, {
        reason: "join",
        prefetchPages: deps.XMPP_MAM_PREFETCH_PAGES || 1
      });
    }
    if (typeof deps.scheduleXmppMucSelfPingFn === "function") {
      deps.scheduleXmppMucSelfPingFn(roomJid, { immediate: true, reason: "join-requested" });
    }
    if (typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("presence", "Joined MUC room", { roomToken, roomJid, nick });
    }
    return true;
  }

  function leaveXmppRoom(roomJid, account = null, deps = {}) {
    const bare = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid || "") : "";
    if (!bare || !deps.xmppConnection || deps.relayStatus !== "connected" || typeof deps.$pres !== "function") return false;
    const joinState = deps.xmppMucJoinStateByRoomJid?.get?.(bare) || {};
    const nick = (joinState.nick || (typeof deps.sanitizeChannelNameFn === "function" ? deps.sanitizeChannelNameFn(account?.username || "user", "user") : "user")).toString().trim();
    if (!nick) return false;
    try {
      deps.xmppConnection.send(deps.$pres({ to: `${bare}/${nick}`, type: "unavailable" }));
    } catch {
      return false;
    }
    deps.xmppRoomByJid?.delete?.(bare);
    if (typeof deps.clearXmppMucSelfPingFn === "function") deps.clearXmppMucSelfPingFn(bare);
    deps.xmppMucJoinStateByRoomJid?.set?.(bare, {
      ...joinState,
      roomToken: joinState.roomToken || `xmpp:${bare}`,
      nick,
      pending: false,
      lastErrorAt: "",
      lastErrorCondition: "",
      lastErrorText: ""
    });
    if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("presence", "Left MUC room", { roomJid: bare, nick });
    return true;
  }

  function removeXmppRoomChannelByJid(roomJid, {
    account = null,
    prefs = {},
    persist = false,
    leave = false
  } = {}, deps = {}) {
    const bare = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid || "") : "";
    if (!bare) return { removed: false, channel: null };
    let targetGuild = null;
    let targetIndex = -1;
    let targetChannel = null;
    for (const guild of deps.state?.guilds || []) {
      if (!guild || !Array.isArray(guild.channels)) continue;
      if (!guild.id || !guild.id.startsWith("xmpp-spaces:")) continue;
      const idx = guild.channels.findIndex((entry) => (
        (typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(entry?.xmppRoomJid || "") : "") === bare
      ));
      if (idx >= 0) {
        targetGuild = guild;
        targetIndex = idx;
        targetChannel = guild.channels[idx];
        break;
      }
    }
    if (!targetGuild || targetIndex < 0 || !targetChannel) return { removed: false, channel: null };
    if (leave && typeof deps.leaveXmppRoomFn === "function") deps.leaveXmppRoomFn(bare, account);
    targetGuild.channels.splice(targetIndex, 1);
    deps.xmppRoomByJid?.delete?.(bare);
    const wasActive = deps.state?.activeChannelId === targetChannel.id;
    if (wasActive && deps.state) {
      deps.state.activeChannelId = typeof deps.getFirstOpenableChannelIdForGuildFn === "function"
        ? deps.getFirstOpenableChannelIdForGuildFn(targetGuild) || ""
        : "";
    }
    if (persist && typeof deps.saveStateFn === "function") deps.saveStateFn();
    return { removed: true, channel: targetChannel };
  }

  function ensureXmppSpacesGuild(prefs = {}, account = null, deps = {}) {
    const domain = (typeof deps.xmppDomainFromJidFn === "function" ? deps.xmppDomainFromJidFn(prefs.xmppJid) : "") || "xmpp";
    const guildId = `xmpp-spaces:${domain}`;
    let guild = (deps.state?.guilds || []).find((entry) => entry.id === guildId) || null;
    if (guild) {
      if (typeof deps.ensureGuildMembershipFn === "function") deps.ensureGuildMembershipFn(guild, account);
      if (typeof deps.xmppRegisterSpaceRecordFn === "function") {
        deps.xmppRegisterSpaceRecordFn({
          spaceId: guildId,
          name: guild.name || "XMPP Spaces",
          description: guild.description || `Synced from ${domain}`
        });
      }
      return guild;
    }
    const everyoneRole = typeof deps.createRoleFn === "function"
      ? deps.createRoleFn("@everyone", "#b5bac1", "member")
      : { id: "everyone", name: "@everyone" };
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
          id: typeof deps.createIdFn === "function" ? deps.createIdFn() : `id-${Date.now()}`,
          name: "general",
          type: "text",
          topic: "XMPP mapped channels",
          forumTags: [],
          permissionOverrides: {},
          voiceState: typeof deps.createVoiceStateFn === "function" ? deps.createVoiceStateFn() : {},
          readState: account ? { [account.id]: new Date().toISOString() } : {},
          slowmodeSec: 0,
          slowmodeState: {},
          messages: []
        }
      ]
    };
    if (typeof deps.ensureGuildMembershipFn === "function") deps.ensureGuildMembershipFn(guild, account);
    deps.state?.guilds?.push?.(guild);
    if (typeof deps.xmppRegisterSpaceRecordFn === "function") {
      deps.xmppRegisterSpaceRecordFn({
        spaceId: guildId,
        name: guild.name || "XMPP Spaces",
        description: guild.description || `Synced from ${domain}`
      });
    }
    return guild;
  }

  function upsertXmppRoomChannel(roomJid, {
    roomName = null,
    roomDescription = null,
    roomToken = "",
    autojoin = null,
    spaceId = "",
    parentSpaceId = "",
    spaceName = "",
    prefs = {},
    account = null,
    persist = false
  } = {}, deps = {}) {
    const normalizedRoomJid = typeof deps.normalizeXmppJidFn === "function"
      ? deps.normalizeXmppJidFn(roomJid).toLowerCase()
      : "";
    if (!normalizedRoomJid) return { channel: null, created: false, changed: false };
    const guild = ensureXmppSpacesGuild(prefs, account, deps);
    if (!guild) return { channel: null, created: false, changed: false };
    let changed = false;
    let created = false;
    const roomNode = normalizedRoomJid.split("@")[0] || "space";
    const normalizedRoomName = roomName == null
      ? ""
      : (typeof deps.decodeHtmlEntitiesFn === "function"
        ? deps.decodeHtmlEntitiesFn((roomName || "").toString())
        : (roomName || "").toString()).replace(/\s+/g, " ").trim().slice(0, 90);
    const normalizedRoomDescription = roomDescription == null
      ? ""
      : (typeof deps.decodeHtmlEntitiesFn === "function"
        ? deps.decodeHtmlEntitiesFn((roomDescription || "").toString())
        : (roomDescription || "").toString()).replace(/\s+/g, " ").trim().slice(0, 240);
    const fallbackName = typeof deps.sanitizeChannelNameFn === "function" ? deps.sanitizeChannelNameFn(roomNode, "space") : roomNode;
    const incomingNameIsFallback = !normalizedRoomName
      || ((typeof deps.sanitizeChannelNameFn === "function" ? deps.sanitizeChannelNameFn(normalizedRoomName, "space") : normalizedRoomName) === fallbackName);
    const desiredDisplayName = normalizedRoomName || roomNode;
    const desiredName = typeof deps.sanitizeChannelNameFn === "function"
      ? deps.sanitizeChannelNameFn(desiredDisplayName, "space")
      : desiredDisplayName;
    const desiredToken = (roomToken || `xmpp:${normalizedRoomJid}`).toString().trim() || `xmpp:${normalizedRoomJid}`;
    const normalizeSpaceKeyFn = typeof deps.xmppNormalizeSpaceKeyFn === "function"
      ? deps.xmppNormalizeSpaceKeyFn
      : ((value) => (value || "").toString().trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9:/_.-]/g, "").slice(0, 160));
    const scopedSpaceId = normalizeSpaceKeyFn(spaceId);
    const scopedParentSpaceId = normalizeSpaceKeyFn(parentSpaceId);
    const roomScopedSpaceId = scopedSpaceId
      ? `${guild.id}/${scopedSpaceId}`
      : guild.id;
    const roomScopedParentSpaceId = scopedParentSpaceId
      ? `${guild.id}/${scopedParentSpaceId}`
      : guild.id;
    const normalizedSpaceName = (spaceName || "").toString().replace(/\s+/g, " ").trim().slice(0, 120);
    let channel = guild.channels.find((entry) => (
      (typeof deps.normalizeXmppJidFn === "function" ? deps.normalizeXmppJidFn(entry?.xmppRoomJid || "").toLowerCase() : "") === normalizedRoomJid
    )) || null;
    if (!channel && desiredToken) {
      channel = guild.channels.find((entry) => (entry?.relayRoomToken || "").toString().trim() === desiredToken) || null;
    }
    if (!channel) {
      channel = {
        id: typeof deps.createIdFn === "function" ? deps.createIdFn() : `id-${Date.now()}`,
        name: desiredName,
        type: "text",
        topic: normalizedRoomDescription || `XMPP room ${normalizedRoomJid}`,
        forumTags: [],
        permissionOverrides: {},
        voiceState: typeof deps.createVoiceStateFn === "function" ? deps.createVoiceStateFn() : {},
        readState: account ? { [account.id]: new Date().toISOString() } : {},
        slowmodeSec: 0,
        slowmodeState: {},
        messages: [],
        xmppRoomName: desiredDisplayName,
        xmppRoomDescription: normalizedRoomDescription,
        xmppRoomJid: normalizedRoomJid,
        relayRoomToken: desiredToken,
        xmppSpaceAutojoin: autojoin === true,
        xmppSpaceId: roomScopedSpaceId,
        xmppSpaceParentId: roomScopedParentSpaceId,
        xmppSpaceName: normalizedSpaceName || ""
      };
      guild.channels.push(channel);
      changed = true;
      created = true;
    } else {
      const currentDisplayName = (typeof deps.decodeHtmlEntitiesFn === "function"
        ? deps.decodeHtmlEntitiesFn((channel.xmppRoomName || "").toString())
        : (channel.xmppRoomName || "").toString()).replace(/\s+/g, " ").trim();
      const shouldUpdateDisplayName = normalizedRoomName && (!incomingNameIsFallback || !currentDisplayName);
      if (shouldUpdateDisplayName && currentDisplayName !== normalizedRoomName) {
        channel.xmppRoomName = normalizedRoomName;
        changed = true;
      }
      if (!channel.xmppRoomName) {
        channel.xmppRoomName = currentDisplayName || desiredDisplayName;
        changed = true;
      }
      const expectedName = typeof deps.sanitizeChannelNameFn === "function"
        ? deps.sanitizeChannelNameFn((channel.xmppRoomName || channel.name || desiredDisplayName).toString(), "space")
        : (channel.xmppRoomName || channel.name || desiredDisplayName).toString();
      if (expectedName && channel.name !== expectedName) {
        channel.name = expectedName;
        changed = true;
      }
      if (roomDescription != null) {
        const previousDescription = (typeof deps.decodeHtmlEntitiesFn === "function"
          ? deps.decodeHtmlEntitiesFn((channel.xmppRoomDescription || "").toString())
          : (channel.xmppRoomDescription || "").toString()).replace(/\s+/g, " ").trim();
        if (previousDescription !== normalizedRoomDescription) {
          channel.xmppRoomDescription = normalizedRoomDescription;
          changed = true;
        }
        const topic = (typeof deps.decodeHtmlEntitiesFn === "function"
          ? deps.decodeHtmlEntitiesFn((channel.topic || "").toString())
          : (channel.topic || "").toString()).replace(/\s+/g, " ").trim();
        const generatedTopic = /^xmpp (?:muc|room) /i.test(topic);
        if (normalizedRoomDescription && (generatedTopic || topic === previousDescription)) {
          if (topic !== normalizedRoomDescription) {
            channel.topic = normalizedRoomDescription;
            changed = true;
          }
        } else if (!normalizedRoomDescription && (generatedTopic || topic === previousDescription)) {
          if (channel.topic) {
            channel.topic = "";
            changed = true;
          }
        }
      }
      if (channel.xmppRoomJid !== normalizedRoomJid) {
        channel.xmppRoomJid = normalizedRoomJid;
        changed = true;
      }
      if (channel.relayRoomToken !== desiredToken) {
        channel.relayRoomToken = desiredToken;
        changed = true;
      }
      if (typeof autojoin === "boolean" && channel.xmppSpaceAutojoin !== autojoin) {
        channel.xmppSpaceAutojoin = autojoin;
        changed = true;
      }
      if (channel.xmppSpaceId !== roomScopedSpaceId) {
        channel.xmppSpaceId = roomScopedSpaceId;
        changed = true;
      }
      if (channel.xmppSpaceParentId !== roomScopedParentSpaceId) {
        channel.xmppSpaceParentId = roomScopedParentSpaceId;
        changed = true;
      }
      if (normalizedSpaceName && channel.xmppSpaceName !== normalizedSpaceName) {
        channel.xmppSpaceName = normalizedSpaceName;
        changed = true;
      }
    }
    if (account) {
      if (typeof deps.ensureChannelReadStateFn === "function") deps.ensureChannelReadStateFn(channel);
      if (!channel.readState[account.id]) {
        channel.readState[account.id] = new Date().toISOString();
        changed = true;
      }
    }
    if (typeof deps.xmppRegisterSpaceRecordFn === "function") {
      deps.xmppRegisterSpaceRecordFn({
        spaceId: roomScopedSpaceId,
        parentSpaceId: roomScopedParentSpaceId,
        spaceName: channel.xmppSpaceName || normalizedSpaceName || guild.name || "XMPP Spaces",
        spaceDescription: ""
      });
      deps.xmppRegisterSpaceRecordFn({
        spaceId: roomScopedSpaceId,
        parentSpaceId: roomScopedParentSpaceId,
        spaceName: channel.xmppSpaceName || normalizedSpaceName || guild.name || "XMPP Spaces",
        spaceDescription: "",
        roomJid: normalizedRoomJid,
        name: channel.xmppRoomName || channel.name || desiredDisplayName,
        description: channel.xmppRoomDescription || channel.topic || "",
        autojoin: channel.xmppSpaceAutojoin === true,
        updatedAt: Date.now()
      });
    }
    if (changed && persist && typeof deps.saveStateFn === "function") deps.saveStateFn();
    return { channel, created, changed };
  }

  function xmppChannelDisplayName(channel, deps = {}) {
    return typeof deps.xmppChannelDisplayNameViaXepFn === "function"
      ? deps.xmppChannelDisplayNameViaXepFn(channel)
      : ((channel?.xmppRoomName || channel?.name || "").toString());
  }

  function xmppChannelDescription(channel, deps = {}) {
    return typeof deps.xmppChannelDescriptionViaXepFn === "function"
      ? deps.xmppChannelDescriptionViaXepFn(channel)
      : ((channel?.xmppRoomDescription || channel?.topic || "").toString());
  }

  globalScope.SHITCORD67_XEP_0045_0503_ROOM_LIFECYCLE = Object.freeze({
    isXmppBackedChannel,
    isXmppBackedGuild,
    resolveXmppServiceUrl,
    joinXmppRoom,
    leaveXmppRoom,
    removeXmppRoomChannelByJid,
    ensureXmppSpacesGuild,
    upsertXmppRoomChannel,
    xmppChannelDisplayName,
    xmppChannelDescription
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
