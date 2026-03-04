(function initXep0045_0402RosterBookmarks(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0045_0402_ROSTER_BOOKMARKS) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};
  const XMPP_BOOKMARKS_NAMESPACE = "urn:xmpp:bookmarks:1";
  const XEP_0503_SPACES = globalScope.SHITCORD67_XEP_0503_SPACES || {};

  function xmppBareJid(value, {
    normalizeXmppJidFn = (input) => (input || "").toString().trim().toLowerCase()
  } = {}) {
    return normalizeXmppJidFn((value || "").toString().split("/")[0] || "").toLowerCase();
  }

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    if (!node || typeof node.getAttribute !== "function") return false;
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    return nodeXmlns === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppNodeText(node) {
    if (typeof xml.xmppNodeText === "function") return xml.xmppNodeText(node);
    return (node?.textContent || "").toString();
  }

  function parseXmppRosterItems(stanza, {
    getTextFn = null
  } = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
    const getText = typeof getTextFn === "function"
      ? getTextFn
      : (typeof globalScope.Strophe?.getText === "function"
        ? globalScope.Strophe.getText
        : ((node) => node?.textContent || ""));
    return [...stanza.getElementsByTagName("item")]
      .map((node) => ({
        jid: node.getAttribute("jid") || "",
        name: node.getAttribute("name") || "",
        subscription: node.getAttribute("subscription") || "",
        ask: node.getAttribute("ask") || "",
        groups: [...node.getElementsByTagName("group")].map((group) => getText(group) || "")
      }))
      .filter((entry) => entry.jid && entry.subscription !== "remove");
  }

  function parseXmppBookmarks(stanza, {
    normalizeXmppJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    serializePayloadFn = (node) => (node?.outerHTML || "").toString()
  } = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
    const seen = new Set();
    const list = [];
    [...stanza.getElementsByTagName("conference")].forEach((node) => {
      const modernBookmark = xmppNodeHasXmlns(node, XMPP_BOOKMARKS_NAMESPACE);
      let jid = normalizeXmppJidFn(node.getAttribute("jid") || "").toLowerCase();
      if (!jid && modernBookmark) {
        const parentItem = node.parentNode && node.parentNode.nodeType === 1
          ? node.parentNode
          : null;
        if (parentItem && parentItem.nodeName?.toLowerCase().endsWith("item")) {
          jid = normalizeXmppJidFn(parentItem.getAttribute("id") || parentItem.getAttribute("jid") || "").toLowerCase();
        }
      }
      if (!jid || seen.has(jid)) return;
      seen.add(jid);
      const nickNode = node.getElementsByTagName("nick")[0] || null;
      const passwordNode = node.getElementsByTagName("password")[0] || null;
      const extensionsNode = node.getElementsByTagName("extensions")[0] || null;
      const extensionsXml = extensionsNode ? serializePayloadFn(extensionsNode) : "";
      const parser = typeof XEP_0503_SPACES.parseSpaceMetadataFromBookmarkExtensions === "function"
        ? XEP_0503_SPACES.parseSpaceMetadataFromBookmarkExtensions
        : (() => ({ spaceId: "", parentSpaceId: "", spaceName: "", spaceDescription: "" }));
      const parsedSpaceMeta = parser(extensionsXml, { fallbackJid: jid });
      const attrSpaceId = (node.getAttribute("space-id") || node.getAttribute("space") || "").toString().trim();
      const attrParentSpaceId = (node.getAttribute("parent-space-id") || node.getAttribute("parent") || "").toString().trim();
      const attrSpaceName = (node.getAttribute("space-name") || node.getAttribute("space-title") || "").toString().trim();
      list.push({
        jid,
        name: (node.getAttribute("name") || "").toString().trim(),
        autojoin: (node.getAttribute("autojoin") || "").toString().toLowerCase() === "true",
        nick: xmppNodeText(nickNode).trim(),
        password: xmppNodeText(passwordNode).trim(),
        extensionsXml,
        spaceId: (attrSpaceId || parsedSpaceMeta.spaceId || "").toString().trim(),
        parentSpaceId: (attrParentSpaceId || parsedSpaceMeta.parentSpaceId || "").toString().trim(),
        spaceName: (attrSpaceName || parsedSpaceMeta.spaceName || "").toString().trim(),
        spaceDescription: (parsedSpaceMeta.spaceDescription || "").toString().trim()
      });
    });
    return list;
  }

  function mergeXmppBookmarks(lists = [], {
    normalizeXmppJidFn = (value) => (value || "").toString().trim().toLowerCase()
  } = {}) {
    const merged = new Map();
    lists.forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((entry) => {
        const jid = normalizeXmppJidFn(entry?.jid || "").toLowerCase();
        if (!jid) return;
        const existing = merged.get(jid) || {
          jid,
          name: "",
          autojoin: false,
          nick: "",
          password: "",
          extensionsXml: "",
          spaceId: "",
          parentSpaceId: "",
          spaceName: "",
          spaceDescription: ""
        };
        const nextName = (entry?.name || "").toString().trim();
        const nextNick = (entry?.nick || "").toString().trim();
        const nextPassword = (entry?.password || "").toString().trim();
        const nextExtensions = (entry?.extensionsXml || "").toString().trim();
        const nextSpaceId = (entry?.spaceId || "").toString().trim();
        const nextParentSpaceId = (entry?.parentSpaceId || "").toString().trim();
        const nextSpaceName = (entry?.spaceName || "").toString().trim();
        const nextSpaceDescription = (entry?.spaceDescription || "").toString().trim();
        const nextAutojoin = entry?.autojoin === true;
        if (nextName && (!existing.name || existing.name === jid.split("@")[0])) existing.name = nextName;
        if (nextNick && !existing.nick) existing.nick = nextNick;
        if (nextPassword && !existing.password) existing.password = nextPassword;
        if (nextExtensions && !existing.extensionsXml) existing.extensionsXml = nextExtensions;
        if (nextSpaceId && !existing.spaceId) existing.spaceId = nextSpaceId;
        if (nextParentSpaceId && !existing.parentSpaceId) existing.parentSpaceId = nextParentSpaceId;
        if (nextSpaceName && !existing.spaceName) existing.spaceName = nextSpaceName;
        if (nextSpaceDescription && !existing.spaceDescription) existing.spaceDescription = nextSpaceDescription;
        if (nextAutojoin) existing.autojoin = true;
        merged.set(jid, existing);
      });
    });
    return [...merged.values()];
  }

  function xmppRoomNodeForToken(roomToken, {
    sanitizeChannelNameFn = (value, fallback = "") => (value || "").toString().trim() || fallback
  } = {}) {
    const raw = (roomToken || "").toString().trim();
    if (!raw) return "lobby";
    const pair = raw.match(/^([^:]+):([^:]+)$/);
    if (pair) {
      const guildNode = sanitizeChannelNameFn(pair[1], "");
      const channelNode = sanitizeChannelNameFn(pair[2], "");
      if (channelNode === "general" && guildNode) {
        return guildNode;
      }
    }
    return sanitizeChannelNameFn(raw.replace(/[:]/g, "-"), "lobby-general");
  }

  function looksLikeXmppMucJid(roomJid, {
    bareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    resolveXmppMucServiceFn = () => ""
  } = {}) {
    const bare = bareJidFn(roomJid);
    if (!bare || !bare.includes("@")) return false;
    const mucService = resolveXmppMucServiceFn();
    if (mucService && bare.endsWith(`@${mucService}`)) return true;
    return /@(?:conference|muc|chat)\./i.test(bare);
  }

  function isXmppMucRoomJid(roomJid, {
    bareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    looksLikeXmppMucJidFn = () => false,
    isKnownXmppRoomJidFn = () => false
  } = {}) {
    const bare = bareJidFn(roomJid);
    if (!bare || !bare.includes("@")) return false;
    if (looksLikeXmppMucJidFn(bare)) return true;
    return isKnownXmppRoomJidFn(bare);
  }

  function xmppRoomJidForToken(roomToken, {
    bareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    resolveXmppMucServiceFn = () => "",
    roomNodeForTokenFn = (value) => (value || "").toString().trim().toLowerCase()
  } = {}) {
    const direct = (roomToken || "").toString();
    if (/^xmpp:/i.test(direct)) {
      return bareJidFn(direct.slice(5));
    }
    const mucService = resolveXmppMucServiceFn();
    if (!mucService) return "";
    const node = roomNodeForTokenFn(roomToken || "lobby:general");
    return `${node}@${mucService}`;
  }

  function xmppStanzaErrorDetails(stanza, {
    xmppNodeHasXmlnsFn = xmppNodeHasXmlns,
    xmppNodeTextFn = xmppNodeText
  } = {}) {
    const errorNode = stanza?.getElementsByTagName?.("error")?.[0] || null;
    if (!errorNode) return null;
    const conditionNode = [...(errorNode.childNodes || [])].find((node) => (
      node?.nodeType === 1
      && ((node.namespaceURI || "").toLowerCase() === "urn:ietf:params:xml:ns:xmpp-stanzas")
      && ((node.localName || node.nodeName || "").toLowerCase() !== "text")
    )) || null;
    const condition = (conditionNode?.localName || conditionNode?.nodeName || "").toString().trim().toLowerCase();
    const textNode = [...errorNode.getElementsByTagName("text")]
      .find((node) => xmppNodeHasXmlnsFn(node, "urn:ietf:params:xml:ns:xmpp-stanzas")) || null;
    const text = xmppNodeTextFn(textNode).trim();
    const type = (errorNode.getAttribute("type") || "").toString().trim().toLowerCase();
    const by = (errorNode.getAttribute("by") || "").toString().trim();
    return {
      condition,
      text,
      type,
      by
    };
  }

  function xmppMucJoinErrorHint(condition) {
    const token = (condition || "").toString().trim().toLowerCase();
    if (token === "service-unavailable") return "Room unavailable on this service (wrong MUC domain/room, room creation disabled, or access restricted).";
    if (token === "item-not-found") return "Room not found on this MUC service.";
    if (token === "not-authorized" || token === "registration-required") return "Room requires a password/invite/membership.";
    if (token === "forbidden") return "Join is forbidden for this account.";
    if (token === "conflict") return "Nickname conflict; try another nickname.";
    return "";
  }

  function xmppChannelDisplayName(channel, {
    isXmppBackedChannelFn = () => false,
    decodeHtmlEntitiesFn = (value) => (value || "").toString(),
    bareJidFn = (value) => (value || "").toString().trim().toLowerCase()
  } = {}) {
    if (!channel || !isXmppBackedChannelFn(channel)) return "";
    const explicit = decodeHtmlEntitiesFn((channel.xmppRoomName || "").toString()).replace(/\s+/g, " ").trim();
    if (explicit) return explicit.slice(0, 90);
    const roomJid = bareJidFn(channel.xmppRoomJid || "");
    if (roomJid) return (roomJid.split("@")[0] || "").slice(0, 90);
    return "";
  }

  function xmppChannelDescription(channel, {
    isXmppBackedChannelFn = () => false,
    decodeHtmlEntitiesFn = (value) => (value || "").toString()
  } = {}) {
    if (!channel || !isXmppBackedChannelFn(channel)) return "";
    const description = decodeHtmlEntitiesFn((channel.xmppRoomDescription || "").toString()).replace(/\s+/g, " ").trim();
    if (description) return description.slice(0, 240);
    return "";
  }

  function findXmppRoomChannelByJid(roomJid, {
    bareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    guilds = []
  } = {}) {
    const bare = bareJidFn(roomJid);
    if (!bare) return null;
    for (const guild of guilds || []) {
      if (!guild || !Array.isArray(guild.channels)) continue;
      const match = guild.channels.find((channel) => bareJidFn(channel?.xmppRoomJid || "") === bare) || null;
      if (match) return match;
    }
    return null;
  }

  function isKnownXmppRoomJid(roomJid, {
    bareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    looksLikeXmppMucJidFn = () => false,
    xmppRoomByJid = null,
    findXmppRoomChannelByJidFn = () => null
  } = {}) {
    const bare = bareJidFn(roomJid);
    if (!bare) return false;
    if (!looksLikeXmppMucJidFn(bare)) return false;
    if (xmppRoomByJid instanceof Map && xmppRoomByJid.has(bare)) return true;
    return Boolean(findXmppRoomChannelByJidFn(bare));
  }

  globalScope.SHITCORD67_XEP_0045_0402_ROSTER_BOOKMARKS = Object.freeze({
    XMPP_BOOKMARKS_NAMESPACE,
    xmppBareJid,
    parseXmppRosterItems,
    parseXmppBookmarks,
    mergeXmppBookmarks,
    xmppRoomNodeForToken,
    looksLikeXmppMucJid,
    isXmppMucRoomJid,
    xmppRoomJidForToken,
    xmppStanzaErrorDetails,
    xmppMucJoinErrorHint,
    xmppChannelDisplayName,
    xmppChannelDescription,
    findXmppRoomChannelByJid,
    isKnownXmppRoomJid
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0045_0402-roster-bookmarks", globalScope.SHITCORD67_XEP_0045_0402_ROSTER_BOOKMARKS);
  }
})(typeof window !== "undefined" ? window : globalThis);
