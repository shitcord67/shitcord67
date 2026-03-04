(function initXep0482_0503SpacesFlow(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0482_0503_SPACES_FLOW) return;

  function handleJoinXmppCommand(rawRoomArg, account = null, { focus = false } = {}, deps = {}) {
    const roomJid = typeof deps.normalizeXmppRoomJoinArgFn === "function"
      ? deps.normalizeXmppRoomJoinArgFn(rawRoomArg)
      : "";
    if (!roomJid) {
      return {
        ok: false,
        joined: false,
        roomJid: "",
        message: "Usage: /joinxmpp <room@conference.example.org>"
      };
    }
    const roomToken = `xmpp:${roomJid}`;
    deps.xmppRoomByJid?.set?.(roomJid, roomToken);
    const mapped = typeof deps.upsertXmppRoomChannelFn === "function"
      ? deps.upsertXmppRoomChannelFn(roomJid, {
        roomName: roomJid.split("@")[0] || "",
        roomToken,
        account,
        prefs: typeof deps.getPreferencesFn === "function" ? deps.getPreferencesFn() : {},
        persist: false
      })
      : { changed: false, channel: null };
    let focusChanged = false;
    if (focus && mapped.channel) {
      const guild = typeof deps.findGuildByChannelIdFn === "function"
        ? deps.findGuildByChannelIdFn(mapped.channel.id)
        : null;
      if (guild) {
        if (deps.state && deps.state.viewMode !== "guild") {
          deps.state.viewMode = "guild";
          focusChanged = true;
        }
        if (deps.state && deps.state.activeGuildId !== guild.id) {
          deps.state.activeGuildId = guild.id;
          focusChanged = true;
        }
        if (deps.state && deps.state.activeChannelId !== mapped.channel.id) {
          deps.state.activeChannelId = mapped.channel.id;
          focusChanged = true;
        }
      }
    }
    const joined = typeof deps.joinXmppRoomFn === "function"
      ? deps.joinXmppRoomFn(roomToken, account)
      : false;
    if (joined || deps.relayStatus === "connected") {
      const nick = typeof deps.sanitizeChannelNameFn === "function"
        ? deps.sanitizeChannelNameFn(account?.username || "user", "user")
        : (account?.username || "user");
      const channelName = mapped.channel?.xmppRoomName || mapped.channel?.name || roomJid.split("@")[0] || "";
      if (typeof deps.xmppPublishBookmarkFn === "function") {
        void deps.xmppPublishBookmarkFn({
          jid: roomJid,
          name: channelName,
          autojoin: mapped.channel?.xmppSpaceAutojoin === true,
          nick
        });
      }
    }
    if (mapped.changed || focusChanged) {
      if (typeof deps.saveStateFn === "function") deps.saveStateFn();
      if (typeof deps.renderFn === "function") deps.renderFn();
    } else if (joined && typeof deps.renderChannelsFn === "function") {
      deps.renderChannelsFn();
    }
    return {
      ok: true,
      joined,
      roomJid,
      message: joined
        ? `Joining XMPP room ${roomJid}.`
        : `Added room ${roomJid} to XMPP Spaces. Connect XMPP relay and run /joinxmpp ${roomJid} again for live join.`
    };
  }

  function handleLeaveXmppCommand(rawRoomArg, account = null, deps = {}) {
    let roomJid = typeof deps.normalizeXmppRoomJoinArgFn === "function"
      ? deps.normalizeXmppRoomJoinArgFn(rawRoomArg)
      : "";
    if (!roomJid) {
      const activeRoom = typeof deps.xmppBareJidFn === "function"
        ? deps.xmppBareJidFn((typeof deps.getActiveChannelFn === "function" ? deps.getActiveChannelFn()?.xmppRoomJid : "") || "")
        : "";
      if (activeRoom) roomJid = activeRoom;
    }
    if (!roomJid) {
      return {
        ok: false,
        roomJid: "",
        message: "Usage: /leavexmpp [room@conference.example.org]"
      };
    }
    const removed = typeof deps.removeXmppRoomChannelByJidFn === "function"
      ? deps.removeXmppRoomChannelByJidFn(roomJid, {
        account,
        prefs: typeof deps.getPreferencesFn === "function" ? deps.getPreferencesFn() : {},
        persist: true,
        leave: true
      })
      : { removed: false };
    if (!removed.removed) {
      return {
        ok: false,
        roomJid,
        message: `No mapped XMPP room found for ${roomJid}.`
      };
    }
    if (typeof deps.xmppRetractBookmarkFn === "function") void deps.xmppRetractBookmarkFn(roomJid);
    return {
      ok: true,
      roomJid,
      message: `Left XMPP room ${roomJid} and removed it from XMPP Spaces.`
    };
  }

  function xmppCallInviteSignal(session = null) {
    return (session?.inviteSignal || "").toString().trim().toLowerCase();
  }

  function xmppSessionIsMujiCallInvite(session = null) {
    const signal = xmppCallInviteSignal(session);
    return signal === "muji-call-invite" || signal === "muji-call" || signal === "muji";
  }

  function xmppSendMujiCallInviteActionForSession(session = null, action = "accept", deps = {}) {
    if (!session || !xmppSessionIsMujiCallInvite(session)) return false;
    const callInviteId = (session.callInviteId || "").toString().trim();
    const roomJid = typeof deps.xmppBareJidFn === "function"
      ? deps.xmppBareJidFn(session.callInviteRoomJid || session.peerJid || "")
      : "";
    if (!callInviteId || !roomJid) return false;
    return Boolean(
      typeof deps.xmppSendCallInviteActionFn === "function"
        ? deps.xmppSendCallInviteActionFn(roomJid, action, {
          inviteId: callInviteId,
          audio: session.media?.includes("audio") !== false,
          video: session.media?.includes("video") !== false,
          preferFull: false,
          messageType: "groupchat"
        })
        : false
    );
  }

  function xmppKnownSpacesRooms(prefs = {}, deps = {}) {
    const listSpaceRecordsFn = typeof deps.xmppListSpaceRecordsFn === "function"
      ? deps.xmppListSpaceRecordsFn
      : (() => []);
    const roomMetaByJid = new Map();
    for (const space of listSpaceRecordsFn()) {
      const spaceId = (space?.spaceId || "").toString().trim();
      const parentSpaceId = (space?.parentSpaceId || "").toString().trim();
      const spaceName = (space?.name || "").toString().replace(/\s+/g, " ").trim();
      for (const room of Array.isArray(space?.rooms) ? space.rooms : []) {
        const roomJid = (room?.roomJid || "").toString().trim().toLowerCase();
        if (!roomJid) continue;
        roomMetaByJid.set(roomJid, {
          spaceId,
          parentSpaceId,
          spaceName
        });
      }
    }
    const merged = new Map();
    for (const guild of deps.state?.guilds || []) {
      if (!guild || !Array.isArray(guild.channels)) continue;
      for (const channel of guild.channels) {
        const jid = typeof deps.xmppBareJidFn === "function"
          ? deps.xmppBareJidFn(channel?.xmppRoomJid || "")
          : "";
        if (!jid || (typeof deps.looksLikeXmppMucJidFn === "function" && !deps.looksLikeXmppMucJidFn(jid, prefs))) continue;
        const roomName = (typeof deps.decodeHtmlEntitiesFn === "function"
          ? deps.decodeHtmlEntitiesFn((channel?.xmppRoomName || channel?.name || "").toString())
          : (channel?.xmppRoomName || channel?.name || "").toString())
          .replace(/\s+/g, " ")
          .trim();
        const meta = roomMetaByJid.get(jid) || {};
        merged.set(jid, {
          jid,
          channelId: (channel?.id || "").toString(),
          name: roomName || jid.split("@")[0] || jid,
          autojoin: channel?.xmppSpaceAutojoin === true,
          spaceId: (channel?.xmppSpaceId || meta.spaceId || "").toString().trim(),
          parentSpaceId: (channel?.xmppSpaceParentId || meta.parentSpaceId || "").toString().trim(),
          spaceName: (channel?.xmppSpaceName || meta.spaceName || "").toString().replace(/\s+/g, " ").trim()
        });
      }
    }
    if (deps.xmppRoomByJid?.entries) {
      for (const [jid] of deps.xmppRoomByJid.entries()) {
        const bare = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(jid) : "";
        if (!bare || (typeof deps.looksLikeXmppMucJidFn === "function" && !deps.looksLikeXmppMucJidFn(bare, prefs)) || merged.has(bare)) continue;
        merged.set(bare, {
          jid: bare,
          channelId: "",
          name: bare.split("@")[0] || bare,
          autojoin: false,
          spaceId: (roomMetaByJid.get(bare)?.spaceId || "").toString().trim(),
          parentSpaceId: (roomMetaByJid.get(bare)?.parentSpaceId || "").toString().trim(),
          spaceName: (roomMetaByJid.get(bare)?.spaceName || "").toString().replace(/\s+/g, " ").trim()
        });
      }
    }
    return [...merged.values()].sort((a, b) => (a.jid || "").localeCompare(b.jid || ""));
  }

  function xmppSpacesRoomStateLabel(roomJid = "", deps = {}) {
    const bare = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid) : "";
    if (!bare) return "unknown";
    const joinState = deps.xmppMucJoinStateByRoomJid?.get?.(bare) || {};
    if (joinState.pending) return "joining";
    if ((joinState.lastErrorCondition || "").toString().trim()) {
      return `error:${joinState.lastErrorCondition}`;
    }
    if (deps.xmppRoomByJid?.has?.(bare)) return "joined";
    return "mapped";
  }

  function xmppSpacesSummaryLines({ limit = 12, prefs = {} } = {}, deps = {}) {
    const entries = xmppKnownSpacesRooms(prefs, deps)
      .slice(0, Math.max(1, Number(limit) || 12));
    const grouped = new Map();
    entries.forEach((entry) => {
      const spaceId = (entry.spaceId || "").toString().trim() || "xmpp-spaces:default";
      const parent = (entry.parentSpaceId || "").toString().trim();
      const name = (entry.spaceName || "").toString().replace(/\s+/g, " ").trim();
      const label = name || spaceId.split("/").pop() || "XMPP Spaces";
      if (!grouped.has(spaceId)) {
        grouped.set(spaceId, {
          id: spaceId,
          parentSpaceId: parent,
          label,
          entries: []
        });
      }
      grouped.get(spaceId).entries.push(entry);
    });
    const sortedGroups = [...grouped.values()]
      .sort((a, b) => {
        const ap = (a.parentSpaceId || "").localeCompare(b.parentSpaceId || "");
        if (ap !== 0) return ap;
        const lp = (a.label || "").localeCompare(b.label || "");
        if (lp !== 0) return lp;
        return (a.id || "").localeCompare(b.id || "");
      });
    const rows = [];
    sortedGroups.forEach((group) => {
      const parentSuffix = group.parentSpaceId ? ` <= ${group.parentSpaceId}` : "";
      rows.push(`* ${group.label}${parentSuffix}`);
      group.entries
        .sort((a, b) => (a.jid || "").localeCompare(b.jid || ""))
        .forEach((entry) => {
          const state = xmppSpacesRoomStateLabel(entry.jid, deps);
          const suffix = entry.autojoin ? " · autojoin" : "";
          rows.push(`  - ${entry.name} (${entry.jid}) [${state}${suffix}]`);
        });
    });
    return rows;
  }

  function focusXmppSpacesGuild(account = null, prefs = {}, deps = {}) {
    const guild = typeof deps.ensureXmppSpacesGuildFn === "function"
      ? deps.ensureXmppSpacesGuildFn(prefs, account)
      : null;
    if (!guild) return false;
    const nextChannel = guild.channels.find((entry) => (
      typeof deps.isXmppBackedChannelFn === "function" ? deps.isXmppBackedChannelFn(entry) : false
    )) || guild.channels[0] || null;
    let changed = false;
    if (deps.state && deps.state.viewMode !== "guild") {
      deps.state.viewMode = "guild";
      changed = true;
    }
    if (deps.state && deps.state.activeGuildId !== guild.id) {
      deps.state.activeGuildId = guild.id;
      changed = true;
    }
    if (nextChannel && deps.state && deps.state.activeChannelId !== nextChannel.id) {
      deps.state.activeChannelId = nextChannel.id;
      changed = true;
    }
    if (changed) {
      if (typeof deps.saveStateFn === "function") deps.saveStateFn();
      if (typeof deps.renderFn === "function") deps.renderFn();
    }
    return true;
  }

  async function syncXmppSpacesNow({
    account = null,
    prefs = {},
    forceDiscovery = false
  } = {}, deps = {}) {
    if (!deps.xmppConnection || deps.relayStatus !== "connected") {
      return {
        ok: false,
        message: "XMPP relay is not connected. Connect first, then retry /spacesxmpp sync."
      };
    }
    const [bookmarkResult, discoveryResult] = await Promise.allSettled([
      typeof deps.fetchXmppBookmarksFn === "function" ? deps.fetchXmppBookmarksFn(deps.xmppConnection) : Promise.resolve([]),
      typeof deps.discoverXmppMucRoomsFn === "function"
        ? deps.discoverXmppMucRoomsFn({
          connection: deps.xmppConnection,
          prefs,
          force: forceDiscovery
        })
        : Promise.resolve([])
    ]);
    const bookmarkItems = bookmarkResult.status === "fulfilled" ? bookmarkResult.value : [];
    const discoveredRooms = discoveryResult.status === "fulfilled" ? discoveryResult.value : [];
    const mergedRoomsRaw = typeof deps.mergeXmppBookmarksFn === "function"
      ? deps.mergeXmppBookmarksFn(bookmarkItems, discoveredRooms)
      : [...bookmarkItems, ...discoveredRooms];
    const mergedByJid = new Map();
    for (const entry of mergedRoomsRaw) {
      const bare = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(entry?.jid || "") : "";
      if (!bare) continue;
      if (!mergedByJid.has(bare)) mergedByJid.set(bare, { ...entry, jid: bare });
      else {
        const prev = mergedByJid.get(bare);
        mergedByJid.set(bare, {
          ...prev,
          ...entry,
          jid: bare,
          autojoin: prev?.autojoin === true || entry?.autojoin === true
        });
      }
    }
    const mergedRooms = [...mergedByJid.values()];
    if (mergedRooms.length > 0 && typeof deps.upsertXmppSpaceChannelsFn === "function") {
      deps.upsertXmppSpaceChannelsFn(mergedRooms, prefs, account);
    }
    let joinedAutoCount = 0;
    mergedRooms.forEach((entry) => {
      if (entry?.autojoin !== true) return;
      const roomJid = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(entry.jid || "") : "";
      if (!roomJid) return;
      if (typeof deps.joinXmppRoomFn === "function" && deps.joinXmppRoomFn(`xmpp:${roomJid}`, account)) joinedAutoCount += 1;
    });
    const mappedCount = xmppKnownSpacesRooms(prefs, deps).length;
    return {
      ok: true,
      message: `Synced XMPP Spaces: ${mappedCount} mapped room(s) · ${bookmarkItems.length} bookmark(s) · ${discoveredRooms.length} discovered · ${joinedAutoCount} autojoined.`
    };
  }

  globalScope.SHITCORD67_XEP_0482_0503_SPACES_FLOW = Object.freeze({
    handleJoinXmppCommand,
    handleLeaveXmppCommand,
    xmppCallInviteSignal,
    xmppSessionIsMujiCallInvite,
    xmppSendMujiCallInviteActionForSession,
    xmppKnownSpacesRooms,
    xmppSpacesRoomStateLabel,
    xmppSpacesSummaryLines,
    focusXmppSpacesGuild,
    syncXmppSpacesNow
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
