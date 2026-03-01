(function initXep0334ProcessingHints(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0334_HINTS) return;

  const XMPP_HINTS_NAMESPACE = "urn:xmpp:hints";

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
    appendXmppMessageProcessingHints
  });
})(typeof window !== "undefined" ? window : globalThis);
