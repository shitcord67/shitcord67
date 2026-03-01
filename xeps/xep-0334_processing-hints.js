(function initXep0334ProcessingHints(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0334_HINTS) return;

  const XMPP_HINTS_NAMESPACE = "urn:xmpp:hints";

  function xmppProcessingHintsFromStanza(stanza) {
    const out = {
      store: false,
      noStore: false,
      noPermanentStore: false,
      noCopy: false,
      noPermanentCopy: false,
      hasHints: false
    };
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return out;
    const findHint = (name) => [...stanza.getElementsByTagName(name)]
      .some((node) => ((node.getAttribute?.("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase() === XMPP_HINTS_NAMESPACE));
    out.store = findHint("store");
    out.noStore = findHint("no-store");
    out.noPermanentStore = findHint("no-permanent-store");
    out.noCopy = findHint("no-copy");
    out.noPermanentCopy = findHint("no-permanent-copy");
    out.hasHints = out.store || out.noStore || out.noPermanentStore || out.noCopy || out.noPermanentCopy;
    return out;
  }

  function appendXmppMessageProcessingHints(stanza, {
    encrypted = false,
    ephemeral = false,
    preferStore = true
  } = {}) {
    if (!stanza || typeof stanza.c !== "function") return stanza;
    const add = (name) => stanza.c(name, { xmlns: XMPP_HINTS_NAMESPACE }).up();

    if (encrypted || ephemeral) {
      add("no-store");
      add("no-permanent-store");
      if (encrypted) add("no-copy");
      return stanza;
    }

    if (preferStore) add("store");
    return stanza;
  }

  globalScope.SHITCORD67_XEP_0334_HINTS = Object.freeze({
    XMPP_HINTS_NAMESPACE,
    appendXmppMessageProcessingHints,
    xmppProcessingHintsFromStanza
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0334_processing-hints", globalScope.SHITCORD67_XEP_0334_HINTS);
  }
})(typeof window !== "undefined" ? window : globalThis);
