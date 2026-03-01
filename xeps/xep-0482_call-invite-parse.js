(function initXep0482CallInviteParse(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0482_CALL_INVITE_PARSE) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};
  const XMPP_CALL_INVITES_NAMESPACE = "urn:xmpp:call-invites:0";
  const XMPP_CALL_INVITES_NAMESPACE_PREFIX = "urn:xmpp:call-invites";
  const XMPP_JINGLE_NAMESPACE = "urn:xmpp:jingle:1";

  function xmppNodeXmlns(node) {
    if (typeof xml.xmppNodeXmlns === "function") return xml.xmppNodeXmlns(node);
    if (!node || typeof node.getAttribute !== "function") return "";
    return ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
  }

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    return xmppNodeXmlns(node) === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppNodeHasXmlnsPrefix(node, prefix = "") {
    if (typeof xml.xmppNodeHasXmlnsPrefix === "function") return xml.xmppNodeHasXmlnsPrefix(node, prefix);
    const normalizedPrefix = (prefix || "").toString().trim().toLowerCase();
    const value = xmppNodeXmlns(node);
    const scopedPrefix = normalizedPrefix.endsWith(":") ? normalizedPrefix : `${normalizedPrefix}:`;
    return Boolean(normalizedPrefix && (value === normalizedPrefix || value.startsWith(scopedPrefix)));
  }

  function xmppElementsByLocalName(root, name = "") {
    if (typeof xml.xmppElementsByLocalName === "function") return xml.xmppElementsByLocalName(root, name);
    if (!root || typeof root.getElementsByTagName !== "function") return [];
    const wanted = (name || "").toString().trim().toLowerCase();
    return wanted ? [...root.getElementsByTagName(wanted)] : [];
  }

  function xmppNodeText(node) {
    if (typeof xml.xmppNodeText === "function") return xml.xmppNodeText(node);
    return (node?.textContent || "").toString();
  }

  function parseXmppCallInviteAction(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const actions = ["invite", "accept", "reject", "retract", "left"];
    const hasCallInviteNamespace = (node) => {
      if (!node) return false;
      if (xmppNodeHasXmlns(node, XMPP_CALL_INVITES_NAMESPACE) || xmppNodeHasXmlnsPrefix(node, XMPP_CALL_INVITES_NAMESPACE_PREFIX)) return true;
      const parent = node.parentNode && node.parentNode.nodeType === 1 ? node.parentNode : null;
      if (!parent) return false;
      return xmppNodeHasXmlns(parent, XMPP_CALL_INVITES_NAMESPACE) || xmppNodeHasXmlnsPrefix(parent, XMPP_CALL_INVITES_NAMESPACE_PREFIX);
    };
    for (const action of actions) {
      const node = xmppElementsByLocalName(stanza, action)
        .find((entry) => hasCallInviteNamespace(entry)) || null;
      if (!node) continue;
      const rawId = (node.getAttribute("id") || "").toString().trim();
      const audio = node.getAttribute("audio");
      const video = node.getAttribute("video");
      const jingleCandidates = xmppElementsByLocalName(node, "jingle");
      const jingleNode = jingleCandidates
        .find((entry) => xmppNodeHasXmlns(entry, XMPP_JINGLE_NAMESPACE))
        || jingleCandidates.find((entry) => hasCallInviteNamespace(entry))
        || jingleCandidates.find((entry) => !xmppNodeXmlns(entry))
        || null;
      const jingleSid = (jingleNode?.getAttribute("sid") || "").toString().trim();
      const externals = xmppElementsByLocalName(node, "external")
        .filter((entry) => hasCallInviteNamespace(entry) || (!xmppNodeXmlns(entry) && entry.parentNode === node))
        .map((entry) => (
          entry.getAttribute("uri")
          || entry.getAttribute("url")
          || xmppNodeText(entry)
          || ""
        ).toString().trim())
        .filter(Boolean);
      const mujiNode = xmppElementsByLocalName(node, "muji")
        .find((entry) => (
          xmppNodeHasXmlns(entry, "urn:xmpp:jingle:muji:0")
          || (!xmppNodeXmlns(entry) && entry.parentNode === node)
        )) || null;
      const mujiRoom = (mujiNode?.getAttribute("room") || "").toString().trim();
      return {
        action,
        id: rawId,
        audio: audio === "false" ? false : true,
        video: video === "false" ? false : true,
        externals,
        jingleSid,
        mujiRoom
      };
    }
    return null;
  }

  function normalizeCallInviteUrl(rawUrl = "", {
    resolveMediaUrlFn = (value) => (value || "").toString().trim()
  } = {}) {
    const cleaned = resolveMediaUrlFn((rawUrl || "").toString().trim());
    if (!/^https?:\/\//i.test(cleaned)) return "";
    return cleaned;
  }

  function stripTrailingUrlPunctuation(value = "") {
    return (value || "").toString().replace(/[)\].,!?]+$/g, "");
  }

  function looksLikeConferenceCallUrl(rawUrl = "", {
    normalizeCallInviteUrlFn = normalizeCallInviteUrl
  } = {}) {
    const candidateUrl = normalizeCallInviteUrlFn(rawUrl);
    if (!candidateUrl) return false;
    try {
      const parsed = new URL(candidateUrl);
      const host = (parsed.host || "").toString().trim().toLowerCase();
      const pathBits = `${parsed.pathname || ""} ${parsed.search || ""} ${parsed.hash || ""}`.toLowerCase();
      if (/(^|[.-])(jitsi|meet|visio|call|calls|conference|webrtc|videochat)([.-]|$)/.test(host)) return true;
      if (/(\/|^)(j|call|calls|meet|room|rooms|conference|conf|video|join)(\/|$|[?#])/i.test(pathBits)) return true;
      if (pathBits.includes("startscreensharing=true")) return true;
    } catch {
      return false;
    }
    return false;
  }

  function parseCallInviteFromText(text = "", {
    normalizeCallInviteUrlFn = normalizeCallInviteUrl,
    stripTrailingUrlPunctuationFn = stripTrailingUrlPunctuation,
    looksLikeConferenceCallUrlFn = looksLikeConferenceCallUrl,
    normalizeConferenceProviderUrlFn = (value) => (value || "").toString().trim(),
    callProviderUrl = ""
  } = {}) {
    const raw = (text || "").toString().trim();
    if (!raw) return null;
    const urlMatch = raw.match(/https?:\/\/\S+/i);
    if (!urlMatch) return null;
    const candidateUrl = normalizeCallInviteUrlFn(stripTrailingUrlPunctuationFn(urlMatch[0]));
    if (!candidateUrl) return null;
    const lower = raw.toLowerCase();
    const hasCallHint = lower.includes("call") || raw.includes("\ud83d\udcde") || raw.includes("\ud83d\udda5\ufe0f");
    let baseHost = "";
    let urlHost = "";
    try {
      baseHost = new URL(normalizeConferenceProviderUrlFn(callProviderUrl)).host;
    } catch {
      baseHost = "";
    }
    try {
      urlHost = new URL(candidateUrl).host;
    } catch {
      urlHost = "";
    }
    const providerMatches = Boolean(baseHost && urlHost && baseHost === urlHost);
    const conferenceLikeUrl = looksLikeConferenceCallUrlFn(candidateUrl);
    const urlLower = candidateUrl.toLowerCase();
    const screenShare = lower.includes("screen-share")
      || lower.includes("screen share")
      || lower.includes("screenshare")
      || urlLower.includes("startscreensharing=true");
    if (!hasCallHint && !providerMatches && !conferenceLikeUrl) return null;
    return {
      url: candidateUrl,
      screenShare,
      providerMatches
    };
  }

  function buildWebCallInviteToken({
    url = "",
    messageId = "",
    fromId = "",
    shortHashTokenFn = (value) => (value || "").toString()
  } = {}) {
    const seed = [url, messageId, fromId].filter(Boolean).join("::");
    if (!seed) return "";
    return shortHashTokenFn(seed);
  }

  function markWebCallInviteSeen(token, {
    seenTokens = null,
    maxEntries = 200
  } = {}) {
    const key = (token || "").toString().trim();
    if (!key) return;
    if (!(seenTokens instanceof Set)) return;
    seenTokens.add(key);
    const max = Math.max(20, Number(maxEntries) || 200);
    if (seenTokens.size > max) {
      const first = seenTokens.values().next().value;
      seenTokens.delete(first);
    }
  }

  globalScope.SHITCORD67_XEP_0482_CALL_INVITE_PARSE = Object.freeze({
    parseXmppCallInviteAction,
    normalizeCallInviteUrl,
    stripTrailingUrlPunctuation,
    looksLikeConferenceCallUrl,
    parseCallInviteFromText,
    buildWebCallInviteToken,
    markWebCallInviteSeen
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0482_call-invite-parse", globalScope.SHITCORD67_XEP_0482_CALL_INVITE_PARSE);
  }
})(typeof window !== "undefined" ? window : globalThis);
