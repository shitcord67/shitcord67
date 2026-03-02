(function initXep0249DirectMucInvite(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0249_DIRECT_MUC_INVITE) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};
  const XMPP_DIRECT_MUC_INVITE_NAMESPACE = "jabber:x:conference";

  function xmppNodeXmlns(node) {
    if (typeof xml.xmppNodeXmlns === "function") return xml.xmppNodeXmlns(node);
    if (!node || typeof node.getAttribute !== "function") return "";
    const inline = (node.getAttribute("xmlns") || "").toString().trim().toLowerCase();
    if (inline) return inline;
    return (node.namespaceURI || "").toString().trim().toLowerCase();
  }

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    return xmppNodeXmlns(node) === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppElementsByLocalName(root, name = "") {
    if (typeof xml.xmppElementsByLocalName === "function") return xml.xmppElementsByLocalName(root, name);
    if (!root || typeof root.getElementsByTagName !== "function") return [];
    const wanted = (name || "").toString().trim().toLowerCase();
    return wanted ? [...root.getElementsByTagName(wanted)] : [];
  }

  function xmppDirectChildByLocalName(root, name = "") {
    if (typeof xml.xmppDirectChildByLocalName === "function") return xml.xmppDirectChildByLocalName(root, name);
    if (!root || !root.childNodes) return null;
    const wanted = (name || "").toString().trim().toLowerCase();
    return [...root.childNodes]
      .find((node) => node?.nodeType === 1 && ((node.localName || node.nodeName || "").toString().trim().toLowerCase() === wanted)) || null;
  }

  function xmppNodeText(node) {
    if (typeof xml.xmppNodeText === "function") return xml.xmppNodeText(node);
    if (!node) return "";
    return (node.textContent || "").toString();
  }

  function decodeEntities(value = "") {
    const raw = (value || "").toString();
    if (!raw || !globalScope.document) return raw;
    const textarea = globalScope.document.createElement("textarea");
    textarea.innerHTML = raw;
    return textarea.value;
  }

  function normalizeJid(value = "") {
    const raw = (value || "").toString().trim();
    if (!raw) return "";
    const withoutScheme = raw.replace(/^xmpp:/i, "");
    const withoutUriPunctuation = withoutScheme.replace(/^\/\//, "").replace(/[?#].*$/, "");
    const bare = withoutUriPunctuation.split("/")[0] || "";
    return bare.trim().toLowerCase();
  }

  function parseXmppUriParams(rawValue = "") {
    const raw = (rawValue || "").toString().trim();
    if (!raw) return new Map();
    const withoutScheme = raw.replace(/^xmpp:/i, "");
    const queryPart = withoutScheme.includes("?")
      ? withoutScheme.slice(withoutScheme.indexOf("?") + 1)
      : "";
    const params = new Map();
    queryPart.split(/[;&]/).forEach((segment) => {
      const part = (segment || "").toString().trim();
      if (!part) return;
      const eqIndex = part.indexOf("=");
      if (eqIndex < 0) {
        params.set(part.toLowerCase(), "");
        return;
      }
      const key = part.slice(0, eqIndex).trim().toLowerCase();
      const value = part.slice(eqIndex + 1).trim();
      if (!key) return;
      params.set(key, decodeURIComponent(value));
    });
    return params;
  }

  function normalizeXmppRoomJoinArg(rawArg = "", { bareJidFn = normalizeJid } = {}) {
    return bareJidFn((rawArg || "").toString().trim().replace(/^xmpp:/i, ""));
  }

  function parseXmppDirectMucInviteCommandArg(rawArg = "", {
    decodeHtmlEntitiesFn = decodeEntities,
    normalizeRoomJoinArgFn = normalizeXmppRoomJoinArg
  } = {}) {
    const [roomTokenRaw, reasonRaw = "", passwordRaw = "", continueRaw = "", threadRaw = ""] = (rawArg || "").toString().split("|");
    const roomJid = normalizeRoomJoinArgFn(roomTokenRaw);
    const reason = decodeHtmlEntitiesFn((reasonRaw || "").toString()).replace(/\s+/g, " ").trim().slice(0, 280);
    const password = (passwordRaw || "").toString().trim().slice(0, 120);
    const continueToken = (continueRaw || "").toString().trim().toLowerCase();
    const continueThread = ["1", "true", "yes", "continue", "cont"].includes(continueToken);
    const thread = (threadRaw || "").toString().trim().slice(0, 160);
    return { roomJid, reason, password, continueThread, thread };
  }

  function parseXmppDirectMucInvite(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const inviteNode = xmppElementsByLocalName(stanza, "x")
      .find((entry) => (
        xmppNodeHasXmlns(entry, XMPP_DIRECT_MUC_INVITE_NAMESPACE)
        || (entry.parentNode === stanza && !xmppNodeXmlns(entry) && Boolean(entry.getAttribute("jid")))
      )) || null;
    if (!inviteNode) return null;
    const rawJidAttr = (inviteNode.getAttribute("jid") || "").toString();
    const roomJid = normalizeJid(rawJidAttr);
    if (!roomJid) return null;
    const uriParams = parseXmppUriParams(rawJidAttr);
    const reasonNode = xmppDirectChildByLocalName(inviteNode, "reason");
    const passwordNode = xmppDirectChildByLocalName(inviteNode, "password");
    const reason = decodeEntities((
      inviteNode.getAttribute("reason")
      || xmppNodeText(reasonNode)
      || ""
    ).toString()).replace(/\s+/g, " ").trim().slice(0, 280);
    const password = (
      inviteNode.getAttribute("password")
      || xmppNodeText(passwordNode)
      || uriParams.get("password")
      || uriParams.get("pwd")
      || ""
    ).toString().trim().slice(0, 120);
    const thread = (inviteNode.getAttribute("thread") || "").toString().trim().slice(0, 160);
    const continueNode = xmppDirectChildByLocalName(inviteNode, "continue");
    const continueRaw = (
      inviteNode.getAttribute("continue")
      || continueNode?.getAttribute?.("thread")
      || xmppNodeText(continueNode)
      || ""
    ).toString().trim().toLowerCase();
    return {
      roomJid,
      reason,
      password,
      thread,
      continueThread: ["true", "1", "yes"].includes(continueRaw)
    };
  }

  function rememberXmppDirectMucInviteSeen(key = "", {
    seenKeys = null,
    maxEntries = 200
  } = {}) {
    const normalized = (key || "").toString().trim();
    if (!normalized) return false;
    if (!(seenKeys instanceof Set)) return true;
    if (seenKeys.has(normalized)) return false;
    seenKeys.add(normalized);
    const max = Math.max(10, Number(maxEntries) || 200);
    while (seenKeys.size > max) {
      const oldest = seenKeys.values().next().value;
      if (!oldest) break;
      seenKeys.delete(oldest);
    }
    return true;
  }

  globalScope.SHITCORD67_XEP_0249_DIRECT_MUC_INVITE = Object.freeze({
    XMPP_DIRECT_MUC_INVITE_NAMESPACE,
    normalizeXmppRoomJoinArg,
    parseXmppDirectMucInviteCommandArg,
    parseXmppDirectMucInvite,
    rememberXmppDirectMucInviteSeen
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0249_direct-muc-invite", globalScope.SHITCORD67_XEP_0249_DIRECT_MUC_INVITE);
  }
})(typeof window !== "undefined" ? window : globalThis);
