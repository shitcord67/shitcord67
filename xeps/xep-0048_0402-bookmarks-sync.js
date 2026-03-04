(function initXep0048_0402BookmarksSync(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0048_0402_BOOKMARKS_SYNC) return;

  function upsertXmppSpaceChannels(bookmarks, prefs = {}, account = null, deps = {}) {
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) return;
    let changed = false;
    bookmarks.forEach((entry) => {
      const normalizeXmppJidFn = deps.normalizeXmppJidFn || ((value) => (value || "").toString().trim());
      const roomJid = normalizeXmppJidFn(entry?.jid || "").toLowerCase();
      if (!roomJid) return;
      if (typeof deps.looksLikeXmppMucJidFn === "function" && !deps.looksLikeXmppMucJidFn(roomJid, prefs)) return;
      const upserted = typeof deps.upsertXmppRoomChannelFn === "function"
        ? deps.upsertXmppRoomChannelFn(roomJid, {
          roomName: (entry?.name || "").toString(),
          roomDescription: (entry?.spaceDescription || "").toString(),
          autojoin: entry?.autojoin === true,
          spaceId: (entry?.spaceId || "").toString(),
          parentSpaceId: (entry?.parentSpaceId || "").toString(),
          spaceName: (entry?.spaceName || "").toString(),
          roomToken: `xmpp:${roomJid}`,
          prefs,
          account,
          persist: false
        })
        : { changed: false };
      if (upserted.changed) changed = true;
    });
    if (changed && typeof deps.saveStateFn === "function") deps.saveStateFn();
  }

  function syncXmppRosterIntoState(items, prefs = {}, account = null, deps = {}) {
    if (!Array.isArray(items) || !account) return;
    const ensureXmppSpacesGuildFn = deps.ensureXmppSpacesGuildFn;
    const normalizeXmppJidFn = deps.normalizeXmppJidFn || ((value) => (value || "").toString().trim().toLowerCase());
    const ensureAccountByXmppJidFn = deps.ensureAccountByXmppJidFn;
    const maybeFetchXmppAvatarForJidFn = deps.maybeFetchXmppAvatarForJidFn;
    const getOrCreateDmThreadFn = deps.getOrCreateDmThreadFn;
    const upsertXmppContactRequestFn = deps.upsertXmppContactRequestFn;
    const clearXmppContactRequestFn = deps.clearXmppContactRequestFn;
    const sanitizeChannelNameFn = deps.sanitizeChannelNameFn || ((value, fallback) => (value || fallback || "group").toString());
    const createIdFn = deps.createIdFn || (() => Math.random().toString(36).slice(2));
    const createVoiceStateFn = deps.createVoiceStateFn || (() => ({}));
    const xmppRosterByJid = deps.xmppRosterByJid;
    const guild = typeof ensureXmppSpacesGuildFn === "function" ? ensureXmppSpacesGuildFn(prefs, account) : null;
    const groupMembers = new Map();
    items.forEach((item) => {
      const bare = normalizeXmppJidFn(item?.jid || "").toLowerCase();
      if (!bare) return;
      const accountEntry = typeof ensureAccountByXmppJidFn === "function"
        ? ensureAccountByXmppJidFn(bare, item?.name || bare.split("@")[0] || "")
        : null;
      if (!accountEntry || accountEntry.id === account.id) return;
      if (typeof maybeFetchXmppAvatarForJidFn === "function") maybeFetchXmppAvatarForJidFn(bare);
      if (typeof getOrCreateDmThreadFn === "function") getOrCreateDmThreadFn(account, accountEntry);
      const groups = Array.isArray(item?.groups)
        ? item.groups.map((entry) => (entry || "").toString().trim()).filter(Boolean).slice(0, 8)
        : [];
      xmppRosterByJid?.set?.(bare, { accountId: accountEntry.id, groups });
      const subscription = (item?.subscription || "").toString().trim().toLowerCase();
      const ask = (item?.ask || "").toString().trim().toLowerCase();
      if (ask === "subscribe" && subscription === "none") {
        if (typeof upsertXmppContactRequestFn === "function") {
          upsertXmppContactRequestFn("outgoing", bare, { name: item?.name || accountEntry.displayName || "", source: "roster" });
        }
      } else if (typeof clearXmppContactRequestFn === "function") {
        clearXmppContactRequestFn("outgoing", bare);
      }
      if (subscription === "from") {
        if (typeof upsertXmppContactRequestFn === "function") {
          upsertXmppContactRequestFn("incoming", bare, { name: item?.name || accountEntry.displayName || "", source: "roster" });
        }
      } else if (subscription === "to" || subscription === "both") {
        if (typeof clearXmppContactRequestFn === "function") clearXmppContactRequestFn("incoming", bare);
      }
      groups.forEach((groupName) => {
        if (!groupMembers.has(groupName)) groupMembers.set(groupName, 0);
        groupMembers.set(groupName, (groupMembers.get(groupName) || 0) + 1);
      });
    });
    if (guild) {
      groupMembers.forEach((memberCount, groupName) => {
        const channelName = sanitizeChannelNameFn(groupName, "group");
        let channel = guild.channels.find((entry) => entry?.xmppGroupName === groupName) || null;
        if (!channel) {
          channel = {
            id: createIdFn(),
            name: channelName,
            type: "text",
            topic: `${memberCount} XMPP contacts`,
            forumTags: [],
            permissionOverrides: {},
            voiceState: createVoiceStateFn(),
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

  async function fetchXmppBookmarks(connection, deps = {}) {
    if (!connection || typeof deps.$iq !== "function") {
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("iq", "Bookmarks request skipped (missing connection/runtime)");
      }
      return [];
    }
    const [modernResult, legacyResult] = await Promise.allSettled([
      typeof deps.fetchXmppBookmarksPubsubFn === "function" ? deps.fetchXmppBookmarksPubsubFn(connection) : Promise.resolve([]),
      typeof deps.fetchXmppBookmarksLegacyFn === "function" ? deps.fetchXmppBookmarksLegacyFn(connection) : Promise.resolve([])
    ]);
    const modern = modernResult.status === "fulfilled" ? modernResult.value : [];
    const legacy = legacyResult.status === "fulfilled" ? legacyResult.value : [];
    const merged = typeof deps.mergeXmppBookmarksFn === "function"
      ? deps.mergeXmppBookmarksFn(modern, legacy)
      : [...modern, ...legacy];
    if (typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("iq", "Merged bookmarks list", {
        modernCount: modern.length,
        legacyCount: legacy.length,
        mergedCount: merged.length
      });
    }
    return merged;
  }

  async function xmppPublishBookmarkModern(entry, { connection = null } = {}, deps = {}) {
    const normalizeEntryFn = deps.xmppNormalizeBookmarkEntryFn;
    const normalized = typeof normalizeEntryFn === "function" ? normalizeEntryFn(entry) : null;
    if (!normalized || !connection || typeof deps.$iq !== "function") return false;
    const ownBare = typeof deps.bareJidFn === "function" ? deps.bareJidFn((typeof deps.getPreferencesFn === "function" ? deps.getPreferencesFn().xmppJid : "") || "") : "";
    const iqAttrs = { type: "set" };
    if (ownBare) iqAttrs.to = ownBare;
    const iq = deps.$iq(iqAttrs)
      .c("pubsub", { xmlns: deps.XMPP_PUBSUB_NAMESPACE || "http://jabber.org/protocol/pubsub" })
      .c("publish", { node: deps.XMPP_BOOKMARKS_NAMESPACE || "urn:xmpp:bookmarks:1" })
      .c("item", { id: normalized.jid });
    if (typeof deps.appendXmppBookmarkConferenceNodeFn === "function") deps.appendXmppBookmarkConferenceNodeFn(iq, normalized);
    iq.up().up();
    if (typeof deps.appendXmppBookmarkPublishOptionsFn === "function") deps.appendXmppBookmarkPublishOptionsFn(iq);
    try {
      if (typeof deps.xmppSendIqPromiseFn === "function") await deps.xmppSendIqPromiseFn(connection, iq, 7000);
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("iq", "Published XEP-0402 bookmark", { jid: normalized.jid, autojoin: normalized.autojoin });
      }
      return true;
    } catch (error) {
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("error", "Failed to publish XEP-0402 bookmark", {
          jid: normalized.jid,
          error: String(error?.message || error)
        });
      }
      return false;
    }
  }

  async function xmppPublishBookmarkLegacy(entry, { connection = null } = {}, deps = {}) {
    const normalizeEntryFn = deps.xmppNormalizeBookmarkEntryFn;
    const normalized = typeof normalizeEntryFn === "function" ? normalizeEntryFn(entry) : null;
    if (!normalized || !connection || typeof deps.$iq !== "function") return false;
    const existing = typeof deps.fetchXmppBookmarksLegacyFn === "function" ? await deps.fetchXmppBookmarksLegacyFn(connection) : [];
    const next = typeof deps.mergeXmppBookmarksFn === "function" ? deps.mergeXmppBookmarksFn(existing, [normalized]) : [...existing, normalized];
    const iq = deps.$iq({ type: "set" })
      .c("query", { xmlns: "jabber:iq:private" })
      .c("storage", { xmlns: deps.XMPP_BOOKMARKS_LEGACY_NAMESPACE || "storage:bookmarks" });
    next.forEach((bookmark) => {
      const attrs = {
        jid: bookmark.jid,
        autojoin: bookmark.autojoin ? "true" : "false"
      };
      if (bookmark.name) attrs.name = bookmark.name.slice(0, 180);
      if (bookmark.spaceId) attrs["space-id"] = (bookmark.spaceId || "").toString().trim().slice(0, 160);
      if (bookmark.parentSpaceId) attrs["parent-space-id"] = (bookmark.parentSpaceId || "").toString().trim().slice(0, 160);
      if (bookmark.spaceName) attrs["space-name"] = (bookmark.spaceName || "").toString().trim().slice(0, 120);
      const conference = iq.c("conference", attrs);
      if (bookmark.nick) conference.c("nick").t(bookmark.nick.slice(0, 60)).up();
      if (bookmark.password) conference.c("password").t(bookmark.password.slice(0, 180)).up();
      if (typeof deps.appendXmppBookmarkExtensionsNodeFn === "function") {
        deps.appendXmppBookmarkExtensionsNodeFn(conference, bookmark.extensionsXml);
      }
      conference.up();
    });
    try {
      if (typeof deps.xmppSendIqPromiseFn === "function") await deps.xmppSendIqPromiseFn(connection, iq, 7000);
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("iq", "Published legacy XMPP bookmark", {
          jid: normalized.jid,
          count: next.length
        });
      }
      return true;
    } catch (error) {
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("error", "Failed to publish legacy XMPP bookmark", {
          jid: normalized.jid,
          error: String(error?.message || error)
        });
      }
      return false;
    }
  }

  async function xmppPublishBookmark(entry, { connection = null } = {}, deps = {}) {
    const modernOk = await xmppPublishBookmarkModern(entry, { connection }, deps);
    const legacyOk = await xmppPublishBookmarkLegacy(entry, { connection }, deps);
    return modernOk || legacyOk;
  }

  async function xmppRetractBookmarkModern(jid, { connection = null } = {}, deps = {}) {
    const bare = typeof deps.bareJidFn === "function" ? deps.bareJidFn(jid || "") : "";
    if (!bare || !connection || typeof deps.$iq !== "function") return false;
    const ownBare = typeof deps.bareJidFn === "function" ? deps.bareJidFn((typeof deps.getPreferencesFn === "function" ? deps.getPreferencesFn().xmppJid : "") || "") : "";
    const iqAttrs = { type: "set" };
    if (ownBare) iqAttrs.to = ownBare;
    const iq = deps.$iq(iqAttrs)
      .c("pubsub", { xmlns: deps.XMPP_PUBSUB_NAMESPACE || "http://jabber.org/protocol/pubsub" })
      .c("retract", { node: deps.XMPP_BOOKMARKS_NAMESPACE || "urn:xmpp:bookmarks:1", id: bare });
    try {
      if (typeof deps.xmppSendIqPromiseFn === "function") await deps.xmppSendIqPromiseFn(connection, iq, 7000);
      if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("iq", "Retracted XEP-0402 bookmark", { jid: bare });
      return true;
    } catch (error) {
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("error", "Failed to retract XEP-0402 bookmark", {
          jid: bare,
          error: String(error?.message || error)
        });
      }
      return false;
    }
  }

  async function xmppRetractBookmarkLegacy(jid, { connection = null } = {}, deps = {}) {
    const bare = typeof deps.bareJidFn === "function" ? deps.bareJidFn(jid || "") : "";
    if (!bare || !connection || typeof deps.$iq !== "function") return false;
    const existing = typeof deps.fetchXmppBookmarksLegacyFn === "function" ? await deps.fetchXmppBookmarksLegacyFn(connection) : [];
    const next = existing.filter((entry) => (
      (typeof deps.bareJidFn === "function" ? deps.bareJidFn(entry?.jid || "") : "") !== bare
    ));
    const iq = deps.$iq({ type: "set" })
      .c("query", { xmlns: "jabber:iq:private" })
      .c("storage", { xmlns: deps.XMPP_BOOKMARKS_LEGACY_NAMESPACE || "storage:bookmarks" });
    next.forEach((bookmark) => {
      const attrs = {
        jid: typeof deps.bareJidFn === "function" ? deps.bareJidFn(bookmark?.jid || "") : "",
        autojoin: bookmark?.autojoin === true ? "true" : "false"
      };
      if (!attrs.jid) return;
      if (bookmark?.name) attrs.name = (bookmark.name || "").toString().trim().slice(0, 180);
      if (bookmark?.spaceId) attrs["space-id"] = (bookmark.spaceId || "").toString().trim().slice(0, 160);
      if (bookmark?.parentSpaceId) attrs["parent-space-id"] = (bookmark.parentSpaceId || "").toString().trim().slice(0, 160);
      if (bookmark?.spaceName) attrs["space-name"] = (bookmark.spaceName || "").toString().trim().slice(0, 120);
      const conference = iq.c("conference", attrs);
      if (bookmark?.nick) conference.c("nick").t((bookmark.nick || "").toString().trim().slice(0, 60)).up();
      if (bookmark?.password) conference.c("password").t((bookmark.password || "").toString().trim().slice(0, 180)).up();
      if (typeof deps.appendXmppBookmarkExtensionsNodeFn === "function") {
        deps.appendXmppBookmarkExtensionsNodeFn(conference, bookmark?.extensionsXml || "");
      }
      conference.up();
    });
    try {
      if (typeof deps.xmppSendIqPromiseFn === "function") await deps.xmppSendIqPromiseFn(connection, iq, 7000);
      if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("iq", "Retracted legacy XMPP bookmark", { jid: bare });
      return true;
    } catch (error) {
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("error", "Failed to retract legacy XMPP bookmark", {
          jid: bare,
          error: String(error?.message || error)
        });
      }
      return false;
    }
  }

  async function xmppRetractBookmark(jid, { connection = null } = {}, deps = {}) {
    const modernOk = await xmppRetractBookmarkModern(jid, { connection }, deps);
    const legacyOk = await xmppRetractBookmarkLegacy(jid, { connection }, deps);
    return modernOk || legacyOk;
  }

  function xmppHandleBookmarksPubsubEvent(stanza, { account = null, prefs = {} } = {}, deps = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return false;
    const xmppNodeHasXmlnsFn = deps.xmppNodeHasXmlnsFn || (() => false);
    const eventNode = [...stanza.getElementsByTagName("event")]
      .find((node) => xmppNodeHasXmlnsFn(node, "http://jabber.org/protocol/pubsub#event")) || null;
    if (!eventNode) return false;
    const itemsNode = [...eventNode.getElementsByTagName("items")]
      .find((node) => (node.getAttribute("node") || "").toString().trim() === (deps.XMPP_BOOKMARKS_NAMESPACE || "urn:xmpp:bookmarks:1")) || null;
    const deleteNode = [...eventNode.getElementsByTagName("delete")]
      .find((node) => (node.getAttribute("node") || "").toString().trim() === (deps.XMPP_BOOKMARKS_NAMESPACE || "urn:xmpp:bookmarks:1")) || null;
    const purgeNode = [...eventNode.getElementsByTagName("purge")]
      .find((node) => (node.getAttribute("node") || "").toString().trim() === (deps.XMPP_BOOKMARKS_NAMESPACE || "urn:xmpp:bookmarks:1")) || null;
    let updated = [];
    let retracts = [];
    if (itemsNode) {
      updated = typeof deps.parseXmppBookmarksFn === "function" ? deps.parseXmppBookmarksFn(itemsNode) : [];
      if (updated.length > 0 && typeof deps.upsertXmppSpaceChannelsFn === "function") {
        deps.upsertXmppSpaceChannelsFn(updated, prefs, account);
      }
      retracts = [...itemsNode.getElementsByTagName("retract")]
        .map((node) => (node.getAttribute("id") || "").toString().trim())
        .filter(Boolean);
    }
    const deleteTriggered = Boolean(deleteNode || purgeNode);
    if (deleteTriggered) {
      const knownRooms = Array.isArray(deps.knownRoomJids) ? deps.knownRoomJids : [];
      retracts = [...new Set([...retracts, ...knownRooms])];
    }
    retracts.forEach((jid) => {
      if (typeof deps.removeXmppRoomChannelByJidFn === "function") {
        deps.removeXmppRoomChannelByJidFn(jid, { account, prefs, persist: true, leave: true });
      }
    });
    if (updated.length > 0 || retracts.length > 0 || deleteTriggered) {
      if (typeof deps.saveStateFn === "function") deps.saveStateFn();
      if (typeof deps.renderServersFn === "function") deps.renderServersFn();
      if (typeof deps.renderChannelsFn === "function") deps.renderChannelsFn();
    }
    if (typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("message", "Received bookmark pubsub update", {
        updated: updated.length,
        retracted: retracts.length,
        deleted: deleteTriggered
      });
    }
    return Boolean(itemsNode || deleteTriggered);
  }

  globalScope.SHITCORD67_XEP_0048_0402_BOOKMARKS_SYNC = Object.freeze({
    upsertXmppSpaceChannels,
    syncXmppRosterIntoState,
    fetchXmppBookmarks,
    xmppPublishBookmarkModern,
    xmppPublishBookmarkLegacy,
    xmppPublishBookmark,
    xmppRetractBookmarkModern,
    xmppRetractBookmarkLegacy,
    xmppRetractBookmark,
    xmppHandleBookmarksPubsubEvent
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register(
      "xep-0048_0402-bookmarks-sync",
      globalScope.SHITCORD67_XEP_0048_0402_BOOKMARKS_SYNC
    );
  }
})(typeof window !== "undefined" ? window : globalThis);
