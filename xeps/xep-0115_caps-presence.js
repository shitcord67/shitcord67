(function initXep0115CapsPresence(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0115_CAPS_PRESENCE) return;

  function xmppCapsIdentityStrings() {
    return ["client/web//shitcord67"];
  }

  function xmppCapsFeatureStrings(features = []) {
    return [...new Set(Array.isArray(features) ? features : [])].sort();
  }

  async function computeXmppCapsHash({
    identities = [],
    features = [],
    cryptoRef = globalScope.crypto,
    TextEncoderRef = globalScope.TextEncoder
  } = {}) {
    if (!cryptoRef?.subtle || typeof TextEncoderRef === "undefined") return "";
    const sortedIdentities = [...(Array.isArray(identities) ? identities : [])].sort();
    const sortedFeatures = xmppCapsFeatureStrings(features);
    const summary = `${sortedIdentities.map((id) => `${id}<`).join("")}${sortedFeatures.map((feature) => `${feature}<`).join("")}`;
    const bytes = new TextEncoderRef().encode(summary);
    const digest = await cryptoRef.subtle.digest("SHA-1", bytes);
    const hashBytes = new Uint8Array(digest);
    let binary = "";
    hashBytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function xmppPresenceIdleSinceValue(account = {}, deps = {}) {
    const toTimestampMsFn = typeof deps.toTimestampMsFn === "function"
      ? deps.toTimestampMsFn
      : ((value) => Number(Date.parse(value || "")) || 0);
    const value = (account?.xmppIdleSince || "").toString();
    const stamp = toTimestampMsFn(value);
    return stamp ? new Date(stamp).toISOString() : "";
  }

  function xmppAppendPresenceNickNode(stanza, account = {}) {
    const displayName = (account?.displayName || account?.username || "").toString().trim();
    if (!stanza || !displayName) return stanza;
    stanza.c("nick", { xmlns: "http://jabber.org/protocol/nick" }).t(displayName).up();
    return stanza;
  }

  function xmppAppendPresenceStatusNode(stanza, account = {}) {
    const statusText = (account?.customStatus || "").toString().trim();
    if (!stanza || !statusText) return stanza;
    stanza.c("status").t(statusText.slice(0, 80)).up();
    return stanza;
  }

  function xmppAppendPresenceIdleNode(stanza, {
    mode = "online",
    idleSince = "",
    idleNamespace = "urn:xmpp:idle:1"
  } = {}) {
    if (!stanza || mode !== "idle" || !idleSince) return stanza;
    stanza.c("idle", { xmlns: idleNamespace, since: idleSince }).up();
    return stanza;
  }

  function xmppAppendPresenceCapsNode(stanza, {
    capsHash = "",
    capsNamespace = "http://jabber.org/protocol/caps",
    capsNode = "urn:shitcord67:caps"
  } = {}) {
    if (!stanza || !capsHash) return stanza;
    stanza.c("c", {
      xmlns: capsNamespace,
      hash: "sha-1",
      node: capsNode,
      ver: capsHash
    }).up();
    return stanza;
  }

  function xmppBuildPresenceStanza({
    mode = "online",
    show = "",
    account = {},
    capsHash = "",
    $pres = null,
    idleNamespace = "urn:xmpp:idle:1",
    capsNamespace = "http://jabber.org/protocol/caps",
    capsNode = "urn:shitcord67:caps"
  } = {}, deps = {}) {
    if (typeof $pres !== "function") return null;
    if (mode === "invisible") return $pres({ type: "unavailable" });
    const stanza = $pres();
    if (show) stanza.c("show").t(show);
    stanza.c("priority").t("0").up();
    xmppAppendPresenceNickNode(stanza, account);
    xmppAppendPresenceStatusNode(stanza, account);
    const idleSince = xmppPresenceIdleSinceValue(account, {
      toTimestampMsFn: deps.toTimestampMsFn
    });
    xmppAppendPresenceIdleNode(stanza, { mode, idleSince, idleNamespace });
    xmppAppendPresenceCapsNode(stanza, { capsHash, capsNamespace, capsNode });
    return stanza;
  }

  function ensureXmppCapsHash({
    force = false
  } = {}, deps = {}) {
    const refs = deps.refs || {};
    const getCapsHash = typeof refs.getCapsHash === "function" ? refs.getCapsHash : (() => "");
    const setCapsHash = typeof refs.setCapsHash === "function" ? refs.setCapsHash : (() => {});
    const getCapsPromise = typeof refs.getCapsPromise === "function" ? refs.getCapsPromise : (() => null);
    const setCapsPromise = typeof refs.setCapsPromise === "function" ? refs.setCapsPromise : (() => {});
    const addXmppDebugEventFn = typeof deps.addXmppDebugEventFn === "function" ? deps.addXmppDebugEventFn : null;
    const computeFn = typeof deps.computeXmppCapsHashFn === "function" ? deps.computeXmppCapsHashFn : (async () => "");

    const currentHash = getCapsHash();
    if (!force && currentHash) return Promise.resolve(currentHash);
    const currentPromise = getCapsPromise();
    if (!force && currentPromise) return currentPromise;

    const task = computeFn()
      .then((hash) => {
        const next = (hash || "").toString();
        setCapsHash(next);
        if (addXmppDebugEventFn) {
          if (next) addXmppDebugEventFn("presence", "Computed XMPP caps hash", { ver: next });
          else addXmppDebugEventFn("presence", "Failed to compute XMPP caps hash");
        }
        return next;
      })
      .finally(() => {
        setCapsPromise(null);
      });
    setCapsPromise(task);
    return task;
  }

  globalScope.SHITCORD67_XEP_0115_CAPS_PRESENCE = Object.freeze({
    xmppCapsIdentityStrings,
    xmppCapsFeatureStrings,
    computeXmppCapsHash,
    xmppPresenceIdleSinceValue,
    xmppAppendPresenceNickNode,
    xmppAppendPresenceStatusNode,
    xmppAppendPresenceIdleNode,
    xmppAppendPresenceCapsNode,
    xmppBuildPresenceStanza,
    ensureXmppCapsHash
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0115_caps-presence", globalScope.SHITCORD67_XEP_0115_CAPS_PRESENCE);
  }
})(typeof window !== "undefined" ? window : globalThis);
