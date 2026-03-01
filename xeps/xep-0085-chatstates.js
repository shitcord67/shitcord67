(function initXep0085ChatStates(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0085_CHATSTATES) return;

  const XMPP_CHATSTATES_NAMESPACE = "http://jabber.org/protocol/chatstates";

  function xmppChatStateNodeForTypingActive(active) {
    return active ? "composing" : "paused";
  }

  function xmppBuildChatStateStanza({
    to = "",
    type = "chat",
    state = "",
    active = null,
    id = ""
  } = {}, deps = {}) {
    if (typeof deps.$msg !== "function") return null;
    const target = (to || "").toString().trim();
    if (!target) return null;
    let node = (state || "").toString().trim().toLowerCase();
    if (!node) node = xmppChatStateNodeForTypingActive(active === true);
    if (!["composing", "paused", "inactive", "gone", "active"].includes(node)) return null;
    const attrs = { to: target, type: (type || "chat").toString().trim().toLowerCase() || "chat" };
    const stanzaId = (id || "").toString().trim();
    if (stanzaId) attrs.id = stanzaId;
    return deps.$msg(attrs).c(node, { xmlns: deps.namespace || XMPP_CHATSTATES_NAMESPACE });
  }

  function xmppChatStateFlagsFromStanza(stanza, deps = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") {
      return { composing: false, paused: false, inactive: false, gone: false, active: false };
    }
    const xmlnsMatcher = typeof deps.xmppNodeHasXmlnsFn === "function"
      ? deps.xmppNodeHasXmlnsFn
      : ((node, xmlns) => ((node?.getAttribute?.("xmlns") || "").toString().toLowerCase() === (xmlns || "").toString().toLowerCase()));
    const hasNode = (name) => [...stanza.getElementsByTagName(name)]
      .some((node) => xmlnsMatcher(node, deps.namespace || XMPP_CHATSTATES_NAMESPACE));
    return {
      composing: hasNode("composing"),
      paused: hasNode("paused"),
      inactive: hasNode("inactive"),
      gone: hasNode("gone"),
      active: hasNode("active")
    };
  }

  function xmppHasAnyChatStateSignal(flags = {}) {
    return Boolean(flags.composing || flags.paused || flags.inactive || flags.gone || flags.active);
  }

  function xmppChatStateFromFlags(flags = {}) {
    if (flags.composing) return "composing";
    if (flags.paused) return "paused";
    if (flags.inactive) return "inactive";
    if (flags.gone) return "gone";
    if (flags.active) return "active";
    return "";
  }

  function xmppChatStateFromStanza(stanza, deps = {}) {
    const flags = xmppChatStateFlagsFromStanza(stanza, deps);
    return xmppChatStateFromFlags(flags);
  }

  function xmppChatStateIsTypingActive(state = "") {
    const normalized = (state || "").toString().trim().toLowerCase();
    return normalized === "composing";
  }

  function xmppRelayTypingStateFromChatState(state = "") {
    const normalized = (state || "").toString().trim().toLowerCase();
    if (normalized === "composing") return "composing";
    if (["paused", "inactive", "gone", "active"].includes(normalized)) return "paused";
    return "";
  }

  function xmppRelayTypingPayloadFromChatState(state = "", {
    authorUsername = "",
    authorDisplay = ""
  } = {}) {
    const relayState = xmppRelayTypingStateFromChatState(state);
    if (!relayState) return null;
    return {
      state: relayState,
      active: xmppChatStateIsTypingActive(state),
      authorUsername: (authorUsername || "").toString(),
      authorDisplay: (authorDisplay || "").toString()
    };
  }

  globalScope.SHITCORD67_XEP_0085_CHATSTATES = Object.freeze({
    XMPP_CHATSTATES_NAMESPACE,
    xmppChatStateNodeForTypingActive,
    xmppBuildChatStateStanza,
    xmppChatStateFlagsFromStanza,
    xmppHasAnyChatStateSignal,
    xmppChatStateFromFlags,
    xmppChatStateFromStanza,
    xmppChatStateIsTypingActive,
    xmppRelayTypingStateFromChatState,
    xmppRelayTypingPayloadFromChatState
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0085-chatstates", globalScope.SHITCORD67_XEP_0085_CHATSTATES);
  }
})(typeof window !== "undefined" ? window : globalThis);
