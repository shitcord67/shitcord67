(function initXep0198StreamManagement(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0198_STREAM_MANAGEMENT) return;

  function createXmppSmState() {
    return {
      supported: false,
      enabled: false,
      allowResume: false,
      resumed: false,
      failed: false,
      id: "",
      inboundHandledCount: 0,
      outboundStanzaCount: 0,
      lastAckedByServer: 0,
      lastEnableAt: 0,
      lastAckAt: 0,
      lastAckRequestAt: 0
    };
  }

  function resetXmppSmState(smState, {
    keepSupport = false
  } = {}) {
    if (!smState || typeof smState !== "object") return smState;
    const supported = keepSupport ? Boolean(smState.supported) : false;
    const next = createXmppSmState();
    next.supported = supported;
    Object.assign(smState, next);
    return smState;
  }

  function xmppNodeHasXmlns(node, xmlns = "") {
    const lhs = (node?.getAttribute?.("xmlns") || "").toString().trim().toLowerCase();
    const rhs = (xmlns || "").toString().trim().toLowerCase();
    return Boolean(lhs && rhs && lhs === rhs);
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

  function xmppServerSupportsStreamManagement(connection = null, {
    streamManagementNamespace = "urn:xmpp:sm:3"
  } = {}, deps = {}) {
    const featuresNode = xmppStreamFeaturesNode(connection);
    if (!featuresNode) return false;
    const hasXmlns = typeof deps.xmppNodeHasXmlnsFn === "function"
      ? deps.xmppNodeHasXmlnsFn
      : xmppNodeHasXmlns;
    const smNodes = [...featuresNode.getElementsByTagName("sm")];
    if (smNodes.some((node) => hasXmlns(node, streamManagementNamespace))) return true;
    const anyNodes = [...featuresNode.getElementsByTagName("*")];
    return anyNodes.some((node) => hasXmlns(node, streamManagementNamespace));
  }

  function xmppBuildStreamManagementNode(name = "", attrs = {}, {
    streamManagementNamespace = "urn:xmpp:sm:3"
  } = {}, deps = {}) {
    const nodeName = (name || "").toString().trim().toLowerCase();
    if (!nodeName) return null;
    const stropheApi = deps.Strophe || globalScope.Strophe;
    const nextAttrs = {
      xmlns: streamManagementNamespace,
      ...(attrs && typeof attrs === "object" ? attrs : {})
    };
    if (stropheApi && typeof stropheApi.xmlElement === "function") {
      return stropheApi.xmlElement(nodeName, nextAttrs);
    }
    const documentRef = deps.documentRef || (typeof document !== "undefined" ? document : null);
    if (documentRef && typeof documentRef.createElementNS === "function") {
      const node = documentRef.createElementNS(streamManagementNamespace, nodeName);
      Object.entries(nextAttrs).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        node.setAttribute(key, String(value));
      });
      return node;
    }
    return null;
  }

  function noteXmppSmOutboundStanza(smState, stanza = null) {
    if (!smState || !stanza) return smState;
    const name = ((stanza?.nodeName || stanza?.tagName || "").toString().trim().toLowerCase());
    if (!["message", "presence", "iq"].includes(name)) return smState;
    smState.outboundStanzaCount = Math.max(0, Number(smState.outboundStanzaCount) || 0) + 1;
    return smState;
  }

  function noteXmppSmInboundStanza(smState, stanza = null) {
    if (!smState || !stanza) return smState;
    const name = ((stanza?.nodeName || stanza?.tagName || "").toString().trim().toLowerCase());
    if (!["message", "presence", "iq"].includes(name)) return smState;
    smState.inboundHandledCount = Math.max(0, Number(smState.inboundHandledCount) || 0) + 1;
    return smState;
  }

  function clampXmppSmCounter(value = 0) {
    const normalized = Math.floor(Number(value) || 0);
    if (!Number.isFinite(normalized) || normalized < 0) return 0;
    return normalized;
  }

  function sendXmppSmNode(connection = null, node = null) {
    if (!connection || !node || typeof connection.send !== "function") return false;
    connection.send(node);
    return true;
  }

  function maybeEnableXmppStreamManagement(connection = null, smState = null, {
    allowResume = true,
    reason = ""
  } = {}, deps = {}) {
    if (!connection || !smState) return false;
    const streamManagementNamespace = (deps.streamManagementNamespace || "urn:xmpp:sm:3").toString().trim() || "urn:xmpp:sm:3";
    const supported = xmppServerSupportsStreamManagement(connection, { streamManagementNamespace }, deps);
    smState.supported = supported;
    if (!supported || smState.enabled) return false;
    const node = xmppBuildStreamManagementNode("enable", {
      resume: allowResume ? "true" : "false"
    }, { streamManagementNamespace }, deps);
    if (!node) return false;
    try {
      if (!sendXmppSmNode(connection, node)) return false;
      smState.lastEnableAt = Date.now();
      smState.allowResume = Boolean(allowResume);
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("connect", "Requested XMPP stream management enable", {
          namespace: streamManagementNamespace,
          allowResume: smState.allowResume,
          reason: reason || ""
        });
      }
      return true;
    } catch (error) {
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("error", "Failed to request XMPP stream management enable", {
          reason: reason || "",
          error: String(error?.message || error || "")
        });
      }
      return false;
    }
  }

  function requestXmppSmAck(connection = null, smState = null, {
    reason = "",
    minIntervalMs = 15_000
  } = {}, deps = {}) {
    if (!connection || !smState || !smState.enabled) return false;
    const now = Date.now();
    const intervalMs = Math.max(1000, Number(minIntervalMs) || 15_000);
    const lastAt = Number(smState.lastAckRequestAt) || 0;
    if (now - lastAt < intervalMs) return false;
    const streamManagementNamespace = (deps.streamManagementNamespace || "urn:xmpp:sm:3").toString().trim() || "urn:xmpp:sm:3";
    const node = xmppBuildStreamManagementNode("r", {}, { streamManagementNamespace }, deps);
    if (!node) return false;
    try {
      if (!sendXmppSmNode(connection, node)) return false;
      smState.lastAckRequestAt = now;
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("iq", "Requested XMPP stream-management ack", {
          reason: reason || "",
          outboundCount: clampXmppSmCounter(smState.outboundStanzaCount)
        });
      }
      return true;
    } catch (error) {
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("error", "Failed to request XMPP stream-management ack", {
          reason: reason || "",
          error: String(error?.message || error || "")
        });
      }
      return false;
    }
  }

  function handleXmppSmStanza(stanza = null, {
    streamManagementNamespace = "urn:xmpp:sm:3"
  } = {}, deps = {}) {
    if (!stanza || typeof stanza.getAttribute !== "function") return { handled: false, type: "" };
    const name = ((stanza.nodeName || stanza.tagName || "").toString().trim().toLowerCase());
    if (!name) return { handled: false, type: "" };
    const hasXmlns = typeof deps.xmppNodeHasXmlnsFn === "function"
      ? deps.xmppNodeHasXmlnsFn
      : xmppNodeHasXmlns;
    if (!hasXmlns(stanza, streamManagementNamespace)) return { handled: false, type: "" };

    const smState = deps.smState || null;
    const connection = deps.connection || null;
    const addDebug = typeof deps.addXmppDebugEventFn === "function" ? deps.addXmppDebugEventFn : null;

    if (name === "r") {
      const h = clampXmppSmCounter(smState?.inboundHandledCount || 0);
      const ackNode = xmppBuildStreamManagementNode("a", { h }, { streamManagementNamespace }, deps);
      if (connection && ackNode) {
        try {
          sendXmppSmNode(connection, ackNode);
          if (addDebug) addDebug("iq", "Answered XMPP stream-management ack request", { h });
        } catch (error) {
          if (addDebug) {
            addDebug("error", "Failed answering XMPP stream-management ack request", {
              error: String(error?.message || error || "")
            });
          }
        }
      }
      return { handled: true, type: "r" };
    }

    if (name === "a") {
      const h = clampXmppSmCounter(stanza.getAttribute("h"));
      if (smState) {
        smState.lastAckedByServer = h;
        smState.lastAckAt = Date.now();
      }
      if (addDebug) {
        addDebug("iq", "Received XMPP stream-management ack", {
          h,
          outboundCount: clampXmppSmCounter(smState?.outboundStanzaCount || 0)
        });
      }
      return { handled: true, type: "a" };
    }

    if (name === "enabled") {
      if (smState) {
        smState.supported = true;
        smState.enabled = true;
        smState.failed = false;
        smState.resumed = false;
        smState.id = (stanza.getAttribute("id") || "").toString().trim();
        smState.allowResume = (stanza.getAttribute("resume") || "").toString().trim().toLowerCase() === "true";
      }
      if (addDebug) {
        addDebug("connect", "XMPP stream management enabled", {
          id: smState?.id || "",
          allowResume: Boolean(smState?.allowResume)
        });
      }
      return { handled: true, type: "enabled" };
    }

    if (name === "resumed") {
      const h = clampXmppSmCounter(stanza.getAttribute("h"));
      const previd = (stanza.getAttribute("previd") || "").toString().trim();
      if (smState) {
        smState.supported = true;
        smState.enabled = true;
        smState.failed = false;
        smState.resumed = true;
        smState.lastAckedByServer = h;
        smState.lastAckAt = Date.now();
      }
      if (addDebug) {
        addDebug("connect", "XMPP stream management resumed", {
          h,
          previd
        });
      }
      return { handled: true, type: "resumed" };
    }

    if (name === "failed") {
      if (smState) {
        smState.enabled = false;
        smState.failed = true;
        smState.resumed = false;
        smState.id = "";
      }
      if (addDebug) {
        addDebug("error", "XMPP stream-management failed", {});
      }
      return { handled: true, type: "failed" };
    }

    return { handled: false, type: "" };
  }

  globalScope.SHITCORD67_XEP_0198_STREAM_MANAGEMENT = Object.freeze({
    createXmppSmState,
    resetXmppSmState,
    xmppStreamFeaturesNode,
    xmppServerSupportsStreamManagement,
    xmppBuildStreamManagementNode,
    noteXmppSmOutboundStanza,
    noteXmppSmInboundStanza,
    maybeEnableXmppStreamManagement,
    requestXmppSmAck,
    handleXmppSmStanza
  });

  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0198_stream-management", globalScope.SHITCORD67_XEP_0198_STREAM_MANAGEMENT);
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
