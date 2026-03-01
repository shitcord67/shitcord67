(function initXep0421_0045MucActorCache(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0421_0045_MUC_ACTOR_CACHE) return;

  function xmppMucOccupantByNick(roomJid, nick = "", deps = {}) {
    const bareRoom = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid) : "";
    const nickValue = (nick || "").toString().trim().toLowerCase();
    if (!bareRoom || !nickValue) return null;
    const occupants = deps.xmppOccupantsByRoomJid?.get?.(bareRoom);
    if (!occupants || occupants.size === 0) return null;
    return [...occupants.values()].find((entry) => (
      (entry?.nick || "").toString().trim().toLowerCase() === nickValue
    )) || null;
  }

  function xmppMucOccupantById(roomJid, occupantId = "", deps = {}) {
    const bareRoom = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid) : "";
    const idValue = (occupantId || "").toString().trim();
    if (!bareRoom || !idValue) return null;
    const occupants = deps.xmppOccupantsByRoomJid?.get?.(bareRoom);
    if (!occupants || occupants.size === 0) return null;
    return [...occupants.values()].find((entry) => (
      (entry?.occupantId || "").toString().trim() === idValue
    )) || null;
  }

  function xmppMucOccupantAvatarKey(roomJid, nick = "", deps = {}) {
    const bareRoom = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid) : "";
    const nickValue = (nick || "").toString().trim().toLowerCase();
    if (!bareRoom || !nickValue) return "";
    return `${bareRoom}|${nickValue}`;
  }

  function xmppKnownMucOccupantKey(roomJid, nick = "", deps = {}) {
    return xmppMucOccupantAvatarKey(roomJid, nick, deps);
  }

  function rememberKnownXmppMucOccupantJid(roomJid, nick = "", jid = "", deps = {}) {
    const key = xmppKnownMucOccupantKey(roomJid, nick, deps);
    const bareJid = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(jid) : "";
    if (!key || !bareJid) return false;
    const previous = deps.xmppKnownMucOccupantJidByKey?.get?.(key) || "";
    if (previous && previous === bareJid) return false;
    deps.xmppKnownMucOccupantJidByKey?.set?.(key, bareJid);
    return true;
  }

  function knownXmppMucOccupantJid(roomJid, nick = "", deps = {}) {
    const key = xmppKnownMucOccupantKey(roomJid, nick, deps);
    if (!key) return "";
    return (deps.xmppKnownMucOccupantJidByKey?.get?.(key) || "").toString();
  }

  function inferXmppAuthorJidFromRoomHistory(roomJid, nick = "", deps = {}) {
    const bareRoom = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid) : "";
    const nickValue = (nick || "").toString().trim().toLowerCase();
    if (!bareRoom || !nickValue) return "";
    const mapped = knownXmppMucOccupantJid(bareRoom, nickValue, deps);
    if (mapped) return mapped;
    const channel = typeof deps.findXmppRoomChannelByJidFn === "function" ? deps.findXmppRoomChannelByJidFn(bareRoom) : null;
    if (!channel || !Array.isArray(channel.messages)) return "";
    for (let i = channel.messages.length - 1; i >= 0; i -= 1) {
      const entry = channel.messages[i];
      if (!entry || !entry.userId) continue;
      if ((entry.xmppNick || "").toString().trim().toLowerCase() !== nickValue) continue;
      const account = typeof deps.getAccountByIdFn === "function" ? deps.getAccountByIdFn(entry.userId) : null;
      const accountJid = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(account?.xmppJid || "") : "";
      if (!accountJid) continue;
      rememberKnownXmppMucOccupantJid(bareRoom, nickValue, accountJid, deps);
      return accountJid;
    }
    return "";
  }

  function resolveXmppRoomActorUserId(roomJid, nick = "", stanza = null, occupantIdHint = "", deps = {}) {
    const bareRoom = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid) : "";
    const nickValue = (nick || "").toString().trim();
    const occupantId = (occupantIdHint || (typeof deps.xmppOccupantIdFromStanzaFn === "function" ? deps.xmppOccupantIdFromStanzaFn(stanza) : "")).toString().trim();
    if (!bareRoom || (!nickValue && !occupantId)) return "";
    const current = typeof deps.getCurrentAccountFn === "function" ? deps.getCurrentAccountFn() : null;
    const joinState = deps.xmppMucJoinStateByRoomJid?.get?.(bareRoom) || {};
    if (
      current?.id
      && nickValue
      && joinState.nick
      && joinState.nick.toString().trim().toLowerCase() === nickValue.toLowerCase()
    ) {
      return current.id;
    }
    const occupantById = occupantId ? xmppMucOccupantById(bareRoom, occupantId, deps) : null;
    const occupantByNick = nickValue ? xmppMucOccupantByNick(bareRoom, nickValue, deps) : null;
    const occupant = occupantById || occupantByNick;
    if (occupant?.accountId) return occupant.accountId;
    let actorJid = typeof deps.xmppMucMessageAuthorJidFn === "function" ? deps.xmppMucMessageAuthorJidFn(stanza) : "";
    if (!actorJid && occupant?.jid) actorJid = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(occupant.jid) : "";
    if (!actorJid && occupant?.accountId) {
      const account = typeof deps.getAccountByIdFn === "function" ? deps.getAccountByIdFn(occupant.accountId) : null;
      actorJid = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(account?.xmppJid || "") : "";
    }
    if (!actorJid && nickValue) actorJid = inferXmppAuthorJidFromRoomHistory(bareRoom, nickValue, deps);
    if (!actorJid) return occupant?.accountId || "";
    if (nickValue) rememberKnownXmppMucOccupantJid(bareRoom, nickValue, actorJid, deps);
    const actorAccount = typeof deps.ensureAccountByXmppJidFn === "function"
      ? deps.ensureAccountByXmppJidFn(actorJid, nickValue || occupant?.nick || actorJid.split("@")[0] || "")
      : null;
    return actorAccount?.id || occupant?.accountId || "";
  }

  function canonicalXmppRoomReactionActorId(roomJid, actorUserId = "", deps = {}) {
    const actorId = (actorUserId || "").toString().trim();
    if (!actorId) return "";
    const parsedAlias = typeof deps.parseXmppRoomAliasActorIdFn === "function"
      ? deps.parseXmppRoomAliasActorIdFn(actorId)
      : null;
    if (!parsedAlias) return actorId;
    const bareRoom = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid || "") : "";
    const effectiveRoom = bareRoom || parsedAlias.roomJid;
    if (!effectiveRoom) return actorId;
    if (bareRoom && parsedAlias.roomJid !== bareRoom) return actorId;
    const resolved = resolveXmppRoomActorUserId(
      effectiveRoom,
      parsedAlias.nick || "",
      null,
      parsedAlias.occupantId || "",
      deps
    );
    return resolved || actorId;
  }

  function xmppAvatarUrlForKnownRoomNick(roomJid, nick = "", guildId = null, deps = {}) {
    const authorJid = inferXmppAuthorJidFromRoomHistory(roomJid, nick, deps);
    if (!authorJid) return "";
    const account = typeof deps.getAccountByXmppJidFn === "function" ? deps.getAccountByXmppJidFn(authorJid) : null;
    if (!account) return "";
    const avatar = typeof deps.resolveAccountAvatarFn === "function" ? deps.resolveAccountAvatarFn(account, guildId) : { url: "" };
    if (typeof deps.isRenderableAvatarUrlFn === "function" && deps.isRenderableAvatarUrlFn(avatar.url || "")) return avatar.url;
    if (typeof deps.maybeFetchXmppAvatarForJidFn === "function") deps.maybeFetchXmppAvatarForJidFn(authorJid);
    return "";
  }

  globalScope.SHITCORD67_XEP_0421_0045_MUC_ACTOR_CACHE = Object.freeze({
    xmppMucOccupantByNick,
    xmppMucOccupantById,
    xmppMucOccupantAvatarKey,
    xmppKnownMucOccupantKey,
    rememberKnownXmppMucOccupantJid,
    knownXmppMucOccupantJid,
    inferXmppAuthorJidFromRoomHistory,
    resolveXmppRoomActorUserId,
    canonicalXmppRoomReactionActorId,
    xmppAvatarUrlForKnownRoomNick
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
