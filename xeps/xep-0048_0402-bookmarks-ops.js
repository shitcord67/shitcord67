(function initXep0048_0402BookmarksOps(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0048_0402_BOOKMARKS_OPS) return;

  function parseXmppRosterItems(stanza, deps = {}) {
    if (typeof deps.parseXmppRosterItemsViaXepFn === "function") return deps.parseXmppRosterItemsViaXepFn(stanza);
    return [];
  }

  function xmppRosterPushQueryNode(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    return [...stanza.getElementsByTagName("query")]
      .find((node) => (node.getAttribute("xmlns") || "").toLowerCase() === "jabber:iq:roster") || null;
  }

  function xmppRosterPushPayload(stanza) {
    if (!stanza || typeof stanza.getAttribute !== "function") return null;
    const type = (stanza.getAttribute("type") || "").toString().toLowerCase();
    if (type !== "set") return null;
    const query = xmppRosterPushQueryNode(stanza);
    if (!query) return null;
    return {
      id: (stanza.getAttribute("id") || "").toString(),
      from: (stanza.getAttribute("from") || "").toString(),
      query
    };
  }

  function xmppIqResultAttrsFromStanza(stanza) {
    if (!stanza || typeof stanza.getAttribute !== "function") return null;
    const id = (stanza.getAttribute("id") || "").toString().trim();
    if (!id) return null;
    const from = (stanza.getAttribute("from") || "").toString().trim();
    const attrs = { type: "result", id };
    if (from) attrs.to = from;
    return attrs;
  }

  function fetchXmppRoster(connection, deps = {}) {
    return new Promise((resolve) => {
      if (!connection || typeof deps.$iq !== "function") {
        if (typeof deps.addXmppDebugEventFn === "function") {
          deps.addXmppDebugEventFn("iq", "Roster request skipped (missing connection/runtime)");
        }
        resolve([]);
        return;
      }
      const iq = deps.$iq({ type: "get" }).c("query", { xmlns: "jabber:iq:roster" });
      if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("iq", "Requesting roster");
      connection.sendIQ(
        iq,
        (stanza) => {
          try {
            const items = typeof deps.parseXmppRosterItemsFn === "function" ? deps.parseXmppRosterItemsFn(stanza) : [];
            if (typeof deps.addXmppDebugEventFn === "function") {
              deps.addXmppDebugEventFn("iq", "Roster response received", { count: items.length });
            }
            resolve(items);
          } catch {
            if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("error", "Roster parse failed");
            resolve([]);
          }
        },
        () => {
          if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("error", "Roster request failed or timed out");
          resolve([]);
        },
        7000
      );
    });
  }

  function parseXmppBookmarks(stanza, deps = {}) {
    if (typeof deps.parseXmppBookmarksViaXepFn === "function") return deps.parseXmppBookmarksViaXepFn(stanza);
    return [];
  }

  function fetchXmppBookmarksPubsub(connection, deps = {}) {
    return new Promise((resolve) => {
      if (!connection || typeof deps.$iq !== "function") {
        resolve([]);
        return;
      }
      const iq = deps.$iq({ type: "get" })
        .c("pubsub", { xmlns: deps.XMPP_PUBSUB_NAMESPACE || "http://jabber.org/protocol/pubsub" })
        .c("items", { node: deps.XMPP_BOOKMARKS_NAMESPACE || "urn:xmpp:bookmarks:1" });
      if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("iq", "Requesting bookmarks (XEP-0402 pubsub)");
      connection.sendIQ(
        iq,
        (stanza) => {
          try {
            const list = typeof deps.parseXmppBookmarksFn === "function" ? deps.parseXmppBookmarksFn(stanza) : [];
            if (typeof deps.addXmppDebugEventFn === "function") {
              deps.addXmppDebugEventFn("iq", "Bookmarks pubsub response received", { count: list.length });
            }
            resolve(list);
          } catch {
            if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("error", "Bookmarks pubsub parse failed");
            resolve([]);
          }
        },
        () => {
          if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("iq", "Bookmarks pubsub request unavailable");
          resolve([]);
        },
        6000
      );
    });
  }

  function fetchXmppBookmarksLegacy(connection, deps = {}) {
    return new Promise((resolve) => {
      if (!connection || typeof deps.$iq !== "function") {
        if (typeof deps.addXmppDebugEventFn === "function") {
          deps.addXmppDebugEventFn("iq", "Bookmarks request skipped (missing connection/runtime)");
        }
        resolve([]);
        return;
      }
      const iq = deps.$iq({ type: "get" })
        .c("query", { xmlns: "jabber:iq:private" })
        .c("storage", { xmlns: deps.XMPP_BOOKMARKS_LEGACY_NAMESPACE || "storage:bookmarks" });
      if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("iq", "Requesting bookmarks");
      connection.sendIQ(
        iq,
        (stanza) => {
          try {
            const list = typeof deps.parseXmppBookmarksFn === "function" ? deps.parseXmppBookmarksFn(stanza) : [];
            if (typeof deps.addXmppDebugEventFn === "function") {
              deps.addXmppDebugEventFn("iq", "Bookmarks legacy response received", { count: list.length });
            }
            resolve(list);
          } catch {
            if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("error", "Bookmarks parse failed");
            resolve([]);
          }
        },
        () => {
          if (typeof deps.addXmppDebugEventFn === "function") deps.addXmppDebugEventFn("error", "Bookmarks request failed or timed out");
          resolve([]);
        },
        7000
      );
    });
  }

  function mergeXmppBookmarks(...lists) {
    if (typeof globalScope.SHITCORD67_XEP_0045_0402_ROSTER_BOOKMARKS?.mergeXmppBookmarks === "function") {
      return globalScope.SHITCORD67_XEP_0045_0402_ROSTER_BOOKMARKS.mergeXmppBookmarks(lists, {
        normalizeXmppJidFn: (value) => (value || "").toString().trim().toLowerCase()
      });
    }
    return lists.flat().filter(Boolean);
  }

  function xmppNormalizeBookmarkEntry(entry, deps = {}) {
    const bareJidFn = deps.bareJidFn || ((value) => (value || "").toString().trim().toLowerCase());
    const jid = bareJidFn(entry?.jid || "");
    if (!jid) return null;
    const name = (entry?.name || "").toString().trim();
    const nick = (entry?.nick || "").toString().trim();
    const password = (entry?.password || "").toString().trim();
    const extensionsXml = (entry?.extensionsXml || "").toString().trim();
    const spaceId = (entry?.spaceId || "").toString().trim().slice(0, 160);
    const parentSpaceId = (entry?.parentSpaceId || "").toString().trim().slice(0, 160);
    const spaceName = (entry?.spaceName || "").toString().trim().slice(0, 120);
    const spaceDescription = (entry?.spaceDescription || "").toString().trim().slice(0, 280);
    return {
      jid,
      name,
      autojoin: entry?.autojoin === true,
      nick,
      password,
      extensionsXml,
      spaceId,
      parentSpaceId,
      spaceName,
      spaceDescription
    };
  }

  function appendXmppBookmarkExtensionsNode(builder, extensionsXml = "") {
    if (!extensionsXml || typeof builder?.cnode !== "function") return false;
    try {
      const doc = new DOMParser().parseFromString(extensionsXml, "application/xml");
      const node = doc?.documentElement || null;
      if (!node || !node.nodeName) return false;
      builder.cnode(node).up();
      return true;
    } catch {
      return false;
    }
  }

  function appendXmppBookmarkConferenceNode(builder, entry, deps = {}) {
    const normalizeFn = deps.xmppNormalizeBookmarkEntryFn || xmppNormalizeBookmarkEntry;
    const appendExtFn = deps.appendXmppBookmarkExtensionsNodeFn || appendXmppBookmarkExtensionsNode;
    const normalized = normalizeFn(entry, { bareJidFn: deps.bareJidFn });
    if (!normalized || !builder) return builder;
    const attrs = {
      xmlns: deps.XMPP_BOOKMARKS_NAMESPACE || "urn:xmpp:bookmarks:1",
      jid: normalized.jid,
      autojoin: normalized.autojoin ? "true" : "false"
    };
    if (normalized.name) attrs.name = normalized.name.slice(0, 180);
    if (normalized.spaceId) attrs["space-id"] = normalized.spaceId;
    if (normalized.parentSpaceId) attrs["parent-space-id"] = normalized.parentSpaceId;
    if (normalized.spaceName) attrs["space-name"] = normalized.spaceName;
    const conference = builder.c("conference", attrs);
    if (normalized.nick) conference.c("nick").t(normalized.nick.slice(0, 60)).up();
    if (normalized.password) conference.c("password").t(normalized.password.slice(0, 180)).up();
    appendExtFn(conference, normalized.extensionsXml);
    conference.up();
    return builder;
  }

  function appendXmppBookmarkPublishOptions(builder) {
    if (!builder) return builder;
    const options = builder.c("publish-options")
      .c("x", { xmlns: "jabber:x:data", type: "submit" })
      .c("field", { var: "FORM_TYPE", type: "hidden" })
      .c("value").t("http://jabber.org/protocol/pubsub#publish-options").up().up()
      .c("field", { var: "pubsub#persist_items" })
      .c("value").t("true").up().up()
      .c("field", { var: "pubsub#max_items" })
      .c("value").t("max").up().up()
      .c("field", { var: "pubsub#send_last_published_item" })
      .c("value").t("never").up().up()
      .c("field", { var: "pubsub#notify_delete" })
      .c("value").t("true").up().up()
      .c("field", { var: "pubsub#access_model" })
      .c("value").t("whitelist").up().up();
    options.up();
    return builder;
  }

  globalScope.SHITCORD67_XEP_0048_0402_BOOKMARKS_OPS = Object.freeze({
    parseXmppRosterItems,
    xmppRosterPushQueryNode,
    xmppRosterPushPayload,
    xmppIqResultAttrsFromStanza,
    fetchXmppRoster,
    parseXmppBookmarks,
    fetchXmppBookmarksPubsub,
    fetchXmppBookmarksLegacy,
    mergeXmppBookmarks,
    xmppNormalizeBookmarkEntry,
    appendXmppBookmarkExtensionsNode,
    appendXmppBookmarkConferenceNode,
    appendXmppBookmarkPublishOptions
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register(
      "xep-0048_0402-bookmarks-ops",
      globalScope.SHITCORD67_XEP_0048_0402_BOOKMARKS_OPS
    );
  }
})(typeof window !== "undefined" ? window : globalThis);
