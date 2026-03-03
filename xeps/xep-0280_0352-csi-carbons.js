(function initXep0280_0352CsiCarbons(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0280_0352_CSI_CARBONS) return;

  function shouldUsePlainOnlySasl(jid, wsUrl = "", deps = {}) {
    const jidDomain = typeof deps.xmppDomainFromJidFn === "function" ? deps.xmppDomainFromJidFn(jid) : "";
    const plainOnlyDomains = deps.XMPP_PLAIN_ONLY_DOMAINS;
    if (jidDomain && plainOnlyDomains instanceof Set) {
      if (plainOnlyDomains.has(jidDomain)) return true;
      for (const domain of plainOnlyDomains.values()) {
        const normalized = (domain || "").toString().trim().toLowerCase();
        if (normalized && jidDomain.endsWith(`.${normalized}`)) return true;
      }
    }
    try {
      const normalizedWs = typeof deps.normalizeXmppWsUrlFn === "function" ? deps.normalizeXmppWsUrlFn(wsUrl) : wsUrl;
      const host = new URL(normalizedWs || "").hostname.toLowerCase();
      if (!host || !(plainOnlyDomains instanceof Set)) return false;
      for (const domain of plainOnlyDomains.values()) {
        if (host === domain || host.endsWith(`.${domain}`)) return true;
      }
    } catch {
      // Ignore URL parse errors.
    }
    return false;
  }

  function stropheConnectionOptionsForXmpp({ jid, wsUrl } = {}, deps = {}) {
    const options = { keepalive: true };
    const stropheApi = deps.Strophe || globalScope.Strophe;
    if (!stropheApi) return options;
    if (shouldUsePlainOnlySasl(jid, wsUrl, deps) && stropheApi.SASLPlain) {
      options.mechanisms = [stropheApi.SASLPlain];
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("connect", "Using PLAIN-only SASL workaround", {
          jid: typeof deps.normalizeXmppJidFn === "function" ? deps.normalizeXmppJidFn(jid) : jid,
          wsUrl: typeof deps.normalizeXmppWsUrlFn === "function" ? deps.normalizeXmppWsUrlFn(wsUrl) : wsUrl
        });
      }
    }
    return options;
  }

  function enableXmppCarbons(connection, deps = {}) {
    if (!connection || typeof deps.$iq !== "function") return;
    const iq = deps.$iq({ type: "set" }).c("enable", { xmlns: "urn:xmpp:carbons:2" });
    if (typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("iq", "Enabling message carbons (XEP-0280)");
    }
    connection.sendIQ(
      iq,
      () => {
        if (typeof deps.addXmppDebugEventFn === "function") {
          deps.addXmppDebugEventFn("iq", "Message carbons enabled");
        }
      },
      () => {
        if (typeof deps.addXmppDebugEventFn === "function") {
          deps.addXmppDebugEventFn("iq", "Message carbons unavailable on this server");
        }
      },
      7000
    );
  }

  function xmppStreamFeaturesNode(connection = null) {
    if (!connection || typeof connection !== "object") return null;
    const candidates = [
      connection.features,
      connection._streamFeatures,
      connection._proto?.features,
      connection._proto?._features
    ];
    for (const candidate of candidates) {
      if (candidate && typeof candidate.getElementsByTagName === "function") return candidate;
    }
    return null;
  }

  function xmppServerSupportsCsi(connection = null, deps = {}) {
    const featuresNode = xmppStreamFeaturesNode(connection);
    if (!featuresNode) return false;
    const csiNodes = [...featuresNode.getElementsByTagName("csi")];
    if (csiNodes.some((node) => typeof deps.xmppNodeHasXmlnsFn === "function" && deps.xmppNodeHasXmlnsFn(node, deps.XMPP_CSI_NAMESPACE || "urn:xmpp:csi:0"))) return true;
    const anyNodes = [...featuresNode.getElementsByTagName("*")];
    return anyNodes.some((node) => (
      typeof deps.xmppNodeHasXmlnsFn === "function"
      && deps.xmppNodeHasXmlnsFn(node, deps.XMPP_CSI_NAMESPACE || "urn:xmpp:csi:0")
    ));
  }

  function xmppBuildClientStateNode(state = "active", deps = {}) {
    const normalized = state === "inactive" ? "inactive" : "active";
    const csiNs = deps.XMPP_CSI_NAMESPACE || "urn:xmpp:csi:0";
    const stropheApi = deps.Strophe || globalScope.Strophe;
    if (stropheApi && typeof stropheApi.xmlElement === "function") {
      return stropheApi.xmlElement(normalized, { xmlns: csiNs });
    }
    const doc = deps.documentRef || (typeof document !== "undefined" ? document : null);
    if (doc && typeof doc.createElementNS === "function") {
      const node = doc.createElementNS(csiNs, normalized);
      node.setAttribute("xmlns", csiNs);
      return node;
    }
    return null;
  }

  function sendXmppClientStateHint(state = "active", { force = false, reason = "" } = {}, deps = {}) {
    const normalized = state === "inactive" ? "inactive" : "active";
    if (!deps.xmppConnection || deps.relayStatus !== "connected") return false;
    if (!deps.xmppCsiSupportedRef?.get?.()) return false;
    if (!force && deps.xmppCsiStateRef?.get?.() === normalized) return false;
    const node = xmppBuildClientStateNode(normalized, deps);
    if (!node) return false;
    try {
      deps.xmppConnection.send(node);
      deps.xmppCsiStateRef?.set?.(normalized);
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("presence", "Sent XMPP client state hint", {
          state: normalized,
          reason: reason || ""
        });
      }
      return true;
    } catch (error) {
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("error", "Failed to send XMPP client state hint", {
          state: normalized,
          reason: reason || "",
          error: String(error?.message || error || "")
        });
      }
      return false;
    }
  }

  function syncXmppClientStateHint({ force = false, reason = "" } = {}, deps = {}) {
    if (!deps.xmppConnection || deps.relayStatus !== "connected") return false;
    if (!deps.xmppCsiSupportedRef?.get?.()) return false;
    const doc = deps.documentRef || (typeof document !== "undefined" ? document : null);
    const hidden = doc && doc.visibilityState === "hidden";
    const focused = doc && typeof doc.hasFocus === "function" ? doc.hasFocus() : true;
    const nextState = hidden || !focused ? "inactive" : "active";
    return sendXmppClientStateHint(nextState, { force, reason }, deps);
  }

  function refreshXmppCsiCapability(connection = null, deps = {}) {
    const next = xmppServerSupportsCsi(connection, deps);
    deps.xmppCsiSupportedRef?.set?.(next);
    if (!next) deps.xmppCsiStateRef?.set?.("");
    if (typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("presence", next ? "XMPP CSI available" : "XMPP CSI unavailable", {
        namespace: deps.XMPP_CSI_NAMESPACE || "urn:xmpp:csi:0"
      });
    }
    return next;
  }

  function resolveXmppMucService(prefs = {}, deps = {}) {
    const explicit = typeof deps.normalizeXmppMucServiceFn === "function"
      ? deps.normalizeXmppMucServiceFn(prefs.xmppMucService)
      : "";
    if (explicit) return explicit;
    const domain = typeof deps.xmppDomainFromJidFn === "function" ? deps.xmppDomainFromJidFn(prefs.xmppJid) : "";
    return domain ? `conference.${domain}` : "";
  }

  function xmppNodeLocalName(node = null) {
    if (!node || typeof node !== "object") return "";
    const local = (node.localName || "").toString().trim().toLowerCase();
    if (local) return local;
    const name = (node.nodeName || "").toString().trim().toLowerCase();
    if (!name) return "";
    const colonIndex = name.indexOf(":");
    return colonIndex >= 0 ? name.slice(colonIndex + 1) : name;
  }

  function xmppElementsByLocalName(stanza, wanted = "") {
    const target = (wanted || "").toString().trim().toLowerCase();
    if (!stanza || typeof stanza.getElementsByTagName !== "function" || !target) return [];
    return [...stanza.getElementsByTagName("*")]
      .filter((node) => xmppNodeLocalName(node) === target);
  }

  function xmppMamForwardedMessagesFromStanza(stanza, {
    mamNamespace = "urn:xmpp:mam:2",
    forwardingNamespace = "urn:xmpp:forward:0"
  } = {}, deps = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
    const xmlnsMatcher = typeof deps.xmppNodeHasXmlnsFn === "function"
      ? deps.xmppNodeHasXmlnsFn
      : ((node, xmlns) => ((node?.getAttribute?.("xmlns") || "").toString().toLowerCase() === (xmlns || "").toString().toLowerCase()));
    const delayTs = typeof deps.xmppStanzaDelayTimestampFn === "function"
      ? deps.xmppStanzaDelayTimestampFn
      : ((_, fallback = "") => fallback || "");
    return xmppElementsByLocalName(stanza, "result")
      .filter((node) => xmlnsMatcher(node, mamNamespace))
      .map((resultNode) => {
        const forwardedNode = xmppElementsByLocalName(resultNode, "forwarded")
          .find((node) => xmlnsMatcher(node, forwardingNamespace)) || null;
        if (!forwardedNode) return null;
        const messageNode = xmppElementsByLocalName(forwardedNode, "message")[0] || null;
        if (!messageNode) return null;
        return {
          message: messageNode,
          ts: delayTs(forwardedNode, delayTs(resultNode, ""))
        };
      })
      .filter(Boolean);
  }

  function xmppCarbonForwardedMessagesFromStanza(stanza, {
    carbonsNamespace = "urn:xmpp:carbons:2",
    forwardingNamespace = "urn:xmpp:forward:0"
  } = {}, deps = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
    const xmlnsMatcher = typeof deps.xmppNodeHasXmlnsFn === "function"
      ? deps.xmppNodeHasXmlnsFn
      : ((node, xmlns) => ((node?.getAttribute?.("xmlns") || "").toString().toLowerCase() === (xmlns || "").toString().toLowerCase()));
    const delayTs = typeof deps.xmppStanzaDelayTimestampFn === "function"
      ? deps.xmppStanzaDelayTimestampFn
      : ((_, fallback = "") => fallback || "");
    const out = [];
    const carbonNodes = [
      ...xmppElementsByLocalName(stanza, "received")
        .filter((node) => xmlnsMatcher(node, carbonsNamespace)),
      ...xmppElementsByLocalName(stanza, "sent")
        .filter((node) => xmlnsMatcher(node, carbonsNamespace))
    ];
    carbonNodes.forEach((carbonNode) => {
      const isSent = xmppNodeLocalName(carbonNode) === "sent";
      const forwardedNode = xmppElementsByLocalName(carbonNode, "forwarded")
        .find((node) => xmlnsMatcher(node, forwardingNamespace)) || null;
      if (!forwardedNode) return;
      const messageNode = xmppElementsByLocalName(forwardedNode, "message")[0] || null;
      if (!messageNode) return;
      out.push({
        message: messageNode,
        ts: delayTs(forwardedNode, delayTs(messageNode, "")),
        allowSelf: isSent
      });
    });
    return out;
  }

  globalScope.SHITCORD67_XEP_0280_0352_CSI_CARBONS = Object.freeze({
    shouldUsePlainOnlySasl,
    stropheConnectionOptionsForXmpp,
    enableXmppCarbons,
    xmppStreamFeaturesNode,
    xmppServerSupportsCsi,
    xmppBuildClientStateNode,
    sendXmppClientStateHint,
    syncXmppClientStateHint,
    refreshXmppCsiCapability,
    resolveXmppMucService,
    xmppMamForwardedMessagesFromStanza,
    xmppCarbonForwardedMessagesFromStanza
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
