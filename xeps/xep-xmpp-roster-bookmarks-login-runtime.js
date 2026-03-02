/*
 * XMPP roster/bookmarks/login runtime bridge extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function xmppUserLabelFromJid(jid, fallback = "") {
  const raw = (jid || "").toString().trim().toLowerCase();
  const [local = "", domain = ""] = raw.split("@");
  const localSafe = local.replace(/[^a-z0-9._-]/g, "_");
  const domainSafe = domain.replace(/[^a-z0-9.-]/g, "").replace(/[.]/g, "_");
  const seed = [localSafe, domainSafe].filter(Boolean).join("_") || fallback || "xmpp_user";
  return normalizeUsername(seed).slice(0, 24);
}

function getAccountByXmppJid(jid) {
  const bare = xmppBareJid(jid);
  if (!bare) return null;
  return state.accounts.find((account) => xmppBareJid(account?.xmppJid || "") === bare) || null;
}

function ensureAccountByXmppJid(jid, displayName = "") {
  const bare = normalizeXmppJid(jid).toLowerCase();
  const normalizedDisplayName = decodeHtmlEntities((displayName || "").toString()).slice(0, 32);
  if (!bare) return null;
  const mapped = xmppRosterByJid.get(bare);
  if (mapped) {
    const account = getAccountById(mapped.accountId);
    if (account) {
      if (normalizedDisplayName) account.displayName = normalizedDisplayName || account.displayName;
      account.xmppJid = bare;
      return account;
    }
  }
  const existing = state.accounts.find((account) => normalizeXmppJid(account.xmppJid || "").toLowerCase() === bare) || null;
  if (existing) {
    if (normalizedDisplayName) existing.displayName = normalizedDisplayName || existing.displayName;
    existing.xmppJid = bare;
    xmppRosterByJid.set(bare, { accountId: existing.id, groups: [] });
    return existing;
  }
  const username = xmppUserLabelFromJid(bare, bare.split("@")[0] || "xmpp");
  let account = getAccountByUsername(username);
  if (!account) {
    account = createAccount(username, normalizedDisplayName || bare.split("@")[0] || username);
    account.xmppJid = bare;
    state.accounts.push(account);
  } else {
    account.xmppJid = bare;
    if (normalizedDisplayName) account.displayName = normalizedDisplayName || account.displayName;
  }
  xmppRosterByJid.set(bare, { accountId: account.id, groups: [] });
  return account;
}

function ensureGuildMembership(guild, account) {
  if (!guild || !account) return false;
  let changed = false;
  if (!Array.isArray(guild.memberIds)) {
    guild.memberIds = [];
    changed = true;
  }
  if (!guild.memberIds.includes(account.id)) {
    guild.memberIds.push(account.id);
    changed = true;
  }
  if (!Array.isArray(guild.roles) || guild.roles.length === 0) {
    guild.roles = [createRole("@everyone", "#b5bac1", "member")];
    changed = true;
  }
  const everyoneRole = guild.roles.find((role) => role?.name === "@everyone") || guild.roles[0] || null;
  if (!guild.memberRoles || typeof guild.memberRoles !== "object") {
    guild.memberRoles = {};
    changed = true;
  }
  if (!Array.isArray(guild.memberRoles[account.id])) {
    guild.memberRoles[account.id] = [];
    changed = true;
  }
  if (everyoneRole?.id && !guild.memberRoles[account.id].includes(everyoneRole.id)) {
    guild.memberRoles[account.id].push(everyoneRole.id);
    changed = true;
  }
  return changed;
}

function ensureXmppSpacesGuild(prefs = getPreferences(), account = getCurrentAccount()) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.ensureXmppSpacesGuild !== "function") return null;
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.ensureXmppSpacesGuild(prefs, account, {
    xmppDomainFromJidFn: xmppDomainFromJid,
    state,
    ensureGuildMembershipFn: ensureGuildMembership,
    xmppRegisterSpaceRecordFn: xmppRegisterSpaceRecord,
    createRoleFn: createRole,
    createIdFn: createId,
    createVoiceStateFn: createVoiceState
  });
}

function upsertXmppRoomChannel(roomJid, {
  roomName = null,
  roomDescription = null,
  roomToken = "",
  autojoin = null,
  prefs = getPreferences(),
  account = getCurrentAccount(),
  persist = false
} = {}) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.upsertXmppRoomChannel !== "function") {
    return { channel: null, created: false, changed: false };
  }
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.upsertXmppRoomChannel(roomJid, {
    roomName,
    roomDescription,
    roomToken,
    autojoin,
    prefs,
    account,
    persist
  }, {
    normalizeXmppJidFn: normalizeXmppJid,
    xmppDomainFromJidFn: xmppDomainFromJid,
    state,
    ensureGuildMembershipFn: ensureGuildMembership,
    xmppRegisterSpaceRecordFn: xmppRegisterSpaceRecord,
    createRoleFn: createRole,
    createIdFn: createId,
    createVoiceStateFn: createVoiceState,
    decodeHtmlEntitiesFn: decodeHtmlEntities,
    sanitizeChannelNameFn: sanitizeChannelName,
    ensureChannelReadStateFn: ensureChannelReadState,
    saveStateFn: saveState
  });
}

function xmppChannelDisplayName(channel) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.xmppChannelDisplayName !== "function") {
    return xmppChannelDisplayNameViaXep(channel);
  }
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.xmppChannelDisplayName(channel, {
    xmppChannelDisplayNameViaXepFn: xmppChannelDisplayNameViaXep
  });
}

function xmppChannelDescription(channel) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.xmppChannelDescription !== "function") {
    return xmppChannelDescriptionViaXep(channel);
  }
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.xmppChannelDescription(channel, {
    xmppChannelDescriptionViaXepFn: xmppChannelDescriptionViaXep
  });
}

function applyXmppRoomTopicFromSubject(roomJid, subject = "") {
  const bareRoom = xmppBareJid(roomJid);
  if (!bareRoom) return { changed: false, channel: null };
  const roomToken = xmppRoomByJid.get(bareRoom) || `xmpp:${bareRoom}`;
  const channel = findRelayTargetChannelByRoom(roomToken) || findXmppRoomChannelByJid(bareRoom);
  if (!channel) return { changed: false, channel: null };
  const updated = upsertXmppRoomChannel(bareRoom, {
    roomDescription: subject,
    roomToken,
    prefs: getPreferences(),
    account: getCurrentAccount(),
    persist: false
  });
  return {
    changed: Boolean(updated.changed),
    channel: updated.channel || channel
  };
}

function upsertXmppSpaceChannels(bookmarks, prefs = getPreferences(), account = getCurrentAccount()) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.upsertXmppSpaceChannels !== "function") return;
  XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.upsertXmppSpaceChannels(bookmarks, prefs, account, {
    normalizeXmppJidFn: normalizeXmppJid,
    looksLikeXmppMucJidFn: looksLikeXmppMucJid,
    upsertXmppRoomChannelFn: upsertXmppRoomChannel,
    saveStateFn: saveState
  });
}

function syncXmppRosterIntoState(items, prefs = getPreferences(), account = getCurrentAccount()) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.syncXmppRosterIntoState !== "function") return;
  XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.syncXmppRosterIntoState(items, prefs, account, {
    ensureXmppSpacesGuildFn: ensureXmppSpacesGuild,
    normalizeXmppJidFn: normalizeXmppJid,
    ensureAccountByXmppJidFn: ensureAccountByXmppJid,
    maybeFetchXmppAvatarForJidFn: maybeFetchXmppAvatarForJid,
    getOrCreateDmThreadFn: getOrCreateDmThread,
    upsertXmppContactRequestFn: upsertXmppContactRequest,
    clearXmppContactRequestFn: clearXmppContactRequest,
    sanitizeChannelNameFn: sanitizeChannelName,
    createIdFn: createId,
    createVoiceStateFn: createVoiceState,
    xmppRosterByJid
  });
}

function parseXmppRosterItems(stanza) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.parseXmppRosterItems !== "function") return [];
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.parseXmppRosterItems(stanza, {
    parseXmppRosterItemsViaXepFn: parseXmppRosterItemsViaXep
  });
}

function xmppRosterPushPayload(stanza) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.xmppRosterPushPayload !== "function") return null;
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.xmppRosterPushPayload(stanza);
}

function xmppIqResultAttrsFromStanza(stanza) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.xmppIqResultAttrsFromStanza !== "function") return null;
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.xmppIqResultAttrsFromStanza(stanza);
}

function fetchXmppRoster(connection) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.fetchXmppRoster !== "function") return Promise.resolve([]);
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.fetchXmppRoster(connection, {
    $iq: globalThis.$iq,
    addXmppDebugEventFn: addXmppDebugEvent,
    parseXmppRosterItemsFn: parseXmppRosterItems
  });
}

function parseXmppBookmarks(stanza) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.parseXmppBookmarks !== "function") return [];
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.parseXmppBookmarks(stanza, {
    parseXmppBookmarksViaXepFn: parseXmppBookmarksViaXep
  });
}

function fetchXmppBookmarksPubsub(connection) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.fetchXmppBookmarksPubsub !== "function") return Promise.resolve([]);
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.fetchXmppBookmarksPubsub(connection, {
    $iq: globalThis.$iq,
    XMPP_PUBSUB_NAMESPACE,
    XMPP_BOOKMARKS_NAMESPACE,
    addXmppDebugEventFn: addXmppDebugEvent,
    parseXmppBookmarksFn: parseXmppBookmarks
  });
}

function fetchXmppBookmarksLegacy(connection) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.fetchXmppBookmarksLegacy !== "function") return Promise.resolve([]);
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.fetchXmppBookmarksLegacy(connection, {
    $iq: globalThis.$iq,
    XMPP_BOOKMARKS_LEGACY_NAMESPACE,
    addXmppDebugEventFn: addXmppDebugEvent,
    parseXmppBookmarksFn: parseXmppBookmarks
  });
}

function mergeXmppBookmarks(...lists) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.mergeXmppBookmarks !== "function") {
    return mergeXmppBookmarksViaXep(...lists);
  }
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.mergeXmppBookmarks(...lists);
}

async function fetchXmppBookmarks(connection) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.fetchXmppBookmarks !== "function") return [];
  return XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.fetchXmppBookmarks(connection, {
    $iq: globalThis.$iq,
    addXmppDebugEventFn: addXmppDebugEvent,
    fetchXmppBookmarksPubsubFn: fetchXmppBookmarksPubsub,
    fetchXmppBookmarksLegacyFn: fetchXmppBookmarksLegacy,
    mergeXmppBookmarksFn: mergeXmppBookmarks
  });
}

function xmppNormalizeBookmarkEntry(entry) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.xmppNormalizeBookmarkEntry !== "function") return null;
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.xmppNormalizeBookmarkEntry(entry, {
    bareJidFn: xmppBareJid
  });
}

function appendXmppBookmarkExtensionsNode(builder, extensionsXml = "") {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.appendXmppBookmarkExtensionsNode !== "function") return false;
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.appendXmppBookmarkExtensionsNode(builder, extensionsXml);
}

function appendXmppBookmarkConferenceNode(builder, entry) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.appendXmppBookmarkConferenceNode !== "function") return builder;
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.appendXmppBookmarkConferenceNode(builder, entry, {
    bareJidFn: xmppBareJid,
    XMPP_BOOKMARKS_NAMESPACE,
    xmppNormalizeBookmarkEntryFn: xmppNormalizeBookmarkEntry,
    appendXmppBookmarkExtensionsNodeFn: appendXmppBookmarkExtensionsNode
  });
}

function appendXmppBookmarkPublishOptions(builder) {
  if (typeof XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.appendXmppBookmarkPublishOptions !== "function") return builder;
  return XEP_0048_0402_BOOKMARKS_OPS_GLOBAL.appendXmppBookmarkPublishOptions(builder);
}

async function xmppPublishBookmarkModern(entry, { connection = xmppConnection } = {}) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppPublishBookmarkModern !== "function") return false;
  return XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppPublishBookmarkModern(entry, { connection }, {
    $iq: globalThis.$iq,
    getPreferencesFn: getPreferences,
    bareJidFn: xmppBareJid,
    XMPP_PUBSUB_NAMESPACE,
    XMPP_BOOKMARKS_NAMESPACE,
    xmppNormalizeBookmarkEntryFn: xmppNormalizeBookmarkEntry,
    appendXmppBookmarkConferenceNodeFn: appendXmppBookmarkConferenceNode,
    appendXmppBookmarkPublishOptionsFn: appendXmppBookmarkPublishOptions,
    xmppSendIqPromiseFn: xmppSendIqPromise,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

async function xmppPublishBookmarkLegacy(entry, { connection = xmppConnection } = {}) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppPublishBookmarkLegacy !== "function") return false;
  return XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppPublishBookmarkLegacy(entry, { connection }, {
    $iq: globalThis.$iq,
    XMPP_BOOKMARKS_LEGACY_NAMESPACE,
    xmppNormalizeBookmarkEntryFn: xmppNormalizeBookmarkEntry,
    fetchXmppBookmarksLegacyFn: fetchXmppBookmarksLegacy,
    mergeXmppBookmarksFn: mergeXmppBookmarks,
    appendXmppBookmarkExtensionsNodeFn: appendXmppBookmarkExtensionsNode,
    xmppSendIqPromiseFn: xmppSendIqPromise,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

async function xmppPublishBookmark(entry, { connection = xmppConnection } = {}) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppPublishBookmark !== "function") return false;
  return XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppPublishBookmark(entry, { connection }, {
    $iq: globalThis.$iq,
    getPreferencesFn: getPreferences,
    bareJidFn: xmppBareJid,
    XMPP_PUBSUB_NAMESPACE,
    XMPP_BOOKMARKS_NAMESPACE,
    XMPP_BOOKMARKS_LEGACY_NAMESPACE,
    xmppNormalizeBookmarkEntryFn: xmppNormalizeBookmarkEntry,
    appendXmppBookmarkConferenceNodeFn: appendXmppBookmarkConferenceNode,
    appendXmppBookmarkPublishOptionsFn: appendXmppBookmarkPublishOptions,
    fetchXmppBookmarksLegacyFn: fetchXmppBookmarksLegacy,
    mergeXmppBookmarksFn: mergeXmppBookmarks,
    appendXmppBookmarkExtensionsNodeFn: appendXmppBookmarkExtensionsNode,
    xmppSendIqPromiseFn: xmppSendIqPromise,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

async function xmppRetractBookmarkModern(jid, { connection = xmppConnection } = {}) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppRetractBookmarkModern !== "function") return false;
  return XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppRetractBookmarkModern(jid, { connection }, {
    $iq: globalThis.$iq,
    getPreferencesFn: getPreferences,
    bareJidFn: xmppBareJid,
    XMPP_PUBSUB_NAMESPACE,
    XMPP_BOOKMARKS_NAMESPACE,
    xmppSendIqPromiseFn: xmppSendIqPromise,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

async function xmppRetractBookmarkLegacy(jid, { connection = xmppConnection } = {}) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppRetractBookmarkLegacy !== "function") return false;
  return XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppRetractBookmarkLegacy(jid, { connection }, {
    $iq: globalThis.$iq,
    XMPP_BOOKMARKS_LEGACY_NAMESPACE,
    bareJidFn: xmppBareJid,
    fetchXmppBookmarksLegacyFn: fetchXmppBookmarksLegacy,
    appendXmppBookmarkExtensionsNodeFn: appendXmppBookmarkExtensionsNode,
    xmppSendIqPromiseFn: xmppSendIqPromise,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

async function xmppRetractBookmark(jid, { connection = xmppConnection } = {}) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppRetractBookmark !== "function") return false;
  return XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppRetractBookmark(jid, { connection }, {
    $iq: globalThis.$iq,
    getPreferencesFn: getPreferences,
    bareJidFn: xmppBareJid,
    XMPP_PUBSUB_NAMESPACE,
    XMPP_BOOKMARKS_NAMESPACE,
    XMPP_BOOKMARKS_LEGACY_NAMESPACE,
    fetchXmppBookmarksLegacyFn: fetchXmppBookmarksLegacy,
    appendXmppBookmarkExtensionsNodeFn: appendXmppBookmarkExtensionsNode,
    xmppSendIqPromiseFn: xmppSendIqPromise,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function xmppHandleBookmarksPubsubEvent(stanza, { account = getCurrentAccount(), prefs = getPreferences() } = {}) {
  if (typeof XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppHandleBookmarksPubsubEvent !== "function") return false;
  const knownRoomJids = [...xmppRoomByJid.keys()];
  return XEP_0048_0402_BOOKMARKS_SYNC_GLOBAL.xmppHandleBookmarksPubsubEvent(stanza, { account, prefs }, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    XMPP_BOOKMARKS_NAMESPACE,
    parseXmppBookmarksFn: parseXmppBookmarks,
    upsertXmppSpaceChannelsFn: upsertXmppSpaceChannels,
    removeXmppRoomChannelByJidFn: removeXmppRoomChannelByJid,
    saveStateFn: saveState,
    renderServersFn: renderServers,
    renderChannelsFn: renderChannels,
    addXmppDebugEventFn: addXmppDebugEvent,
    knownRoomJids
  });
}

function validateXmppLoginCredentials({ jid, password, wsUrl, timeoutMs = 10000, onProgress = null }) {
  return new Promise((resolve) => {
    const notify = (event, payload = {}) => {
      if (typeof onProgress !== "function") return;
      try {
        onProgress({ event, ...payload });
      } catch {
        // Ignore progress callback errors.
      }
    };
    const cleanJid = normalizeXmppJid(jid);
    const cleanPass = normalizeXmppPassword(password);
    const explicitWs = normalizeXmppWsUrl(wsUrl);
    let candidates = resolveXmppWsCandidates(cleanJid, explicitWs);
    notify("start", { candidateCount: candidates.length, jid: cleanJid });
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
      notify("failure", { reason: "invalid-input" });
      resolve({ ok: false, error: "XMPP login requires JID, password, and a valid WebSocket URL.", wsUrl: normalizeXmppWsUrl(wsUrl) || "" });
      return;
    }
    const tryCandidate = (candidateWs, index = 0, total = 0) => new Promise((doneAttempt) => {
      let connection = null;
      let finished = false;
      addXmppDebugEvent("connect", "Trying login endpoint", { wsUrl: candidateWs });
      notify("candidate-start", { wsUrl: candidateWs, index, total });
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
        notify("candidate-timeout", { wsUrl: candidateWs, index, total });
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
        notify("candidate-status", { wsUrl: candidateWs, index, total, status: statusName });
        if (status === S.CONNECTED) {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          notify("candidate-success", { wsUrl: candidateWs, index, total });
          done({ ok: true, wsUrl: candidateWs });
          return;
        }
        if (status === S.AUTHFAIL) {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          notify("candidate-authfail", { wsUrl: candidateWs, index, total });
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
      notify("runtime-loading");
      loadXmppLibrary().then(async (ready) => {
        if (!ready || !globalThis.Strophe) {
          addXmppDebugEvent("error", "Login validation could not load runtime", { error: xmppRuntimeLastError || "" });
          notify("failure", { reason: "runtime" });
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
            notify("candidates", { candidateCount: candidates.length });
          }
        } catch (error) {
          addXmppDebugEvent("runtime", "Host-meta discovery failed during login validation", { error: String(error?.message || error) });
        }
        let sawAuthFail = false;
        for (let i = 0; i < candidates.length; i += 1) {
          const candidateWs = candidates[i];
          // eslint-disable-next-line no-await-in-loop
          const attempt = await tryCandidate(candidateWs, i + 1, candidates.length);
          if (attempt.ok) {
            addXmppDebugEvent("connect", "Login validation succeeded", { wsUrl: candidateWs });
            notify("success", { wsUrl: candidateWs, via: "browser" });
            resolve({ ok: true, wsUrl: candidateWs });
            return;
          }
          if (attempt.reason === "auth") {
            sawAuthFail = true;
            break;
          }
        }
        notify("gateway-start", { mode: "fallback", candidateCount: candidates.length });
        const localGateway = await validateXmppViaLocalGateway({
          jid: cleanJid,
          password: cleanPass,
          candidates,
          timeoutMs
        });
        if (localGateway?.ok) {
          notify("success", { wsUrl: localGateway.wsUrl || candidates[0] || "", via: "local-gateway" });
          resolve({ ok: true, wsUrl: localGateway.wsUrl || candidates[0] || "", via: "local-gateway" });
          return;
        }
        const gatewayHint = localGateway && localGateway.ok === false
          ? ` Local gateway check also failed: ${localGateway.error || "unknown error"}`
          : ` Local gateway unavailable at ${XMPP_LOCAL_AUTH_GATEWAY_URL}; start it with: node scripts/xmpp-auth-gateway.mjs`;
        notify("failure", { reason: sawAuthFail ? "auth" : "connect" });
        resolve({
          ok: false,
          error: sawAuthFail
            ? `XMPP authentication failed. Tried: ${candidates.join(", ")}.${gatewayHint}`
            : `XMPP connection failed for WebSocket endpoints. Tried: ${candidates.join(", ")}.${gatewayHint}`,
          wsUrl: candidates[0] || ""
        });
      }).catch((error) => {
        addXmppDebugEvent("error", "Login validation crashed", { error: String(error) });
        notify("failure", { reason: "crash" });
        resolve({ ok: false, error: String(error), wsUrl: candidates[0] || "" });
      });
    };

    if (shouldUsePlainOnlySasl(cleanJid, explicitWs || candidates[0] || "")) {
      addXmppDebugEvent("connect", "Using local gateway-first login validation strategy", {
        jid: cleanJid,
        gatewayUrl: XMPP_LOCAL_AUTH_GATEWAY_URL
      });
      notify("gateway-start", { mode: "first", candidateCount: candidates.length });
      validateXmppViaLocalGateway({
        jid: cleanJid,
        password: cleanPass,
        candidates,
        timeoutMs
      }).then((gatewayFirst) => {
        if (gatewayFirst?.ok) {
          notify("success", { wsUrl: gatewayFirst.wsUrl || candidates[0] || "", via: "local-gateway-first" });
          resolve({ ok: true, wsUrl: gatewayFirst.wsUrl || candidates[0] || "", via: "local-gateway-first" });
          return;
        }
        addXmppDebugEvent("runtime", "Gateway-first path unavailable; falling back to browser validation", {
          hasGatewayResult: gatewayFirst !== null,
          gatewayError: gatewayFirst?.error || ""
        });
        notify("gateway-fallback", { reason: gatewayFirst?.error || "" });
        runBrowserValidation();
      }).catch((error) => {
        addXmppDebugEvent("runtime", "Gateway-first check crashed; falling back to browser validation", {
          error: String(error?.message || error)
        });
        notify("gateway-fallback", { reason: String(error?.message || error) });
        runBrowserValidation();
      });
      return;
    }

    runBrowserValidation();
  });
}
