(function initXep0384Aggregate(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384) return;

  const registry = globalScope.SHITCORD67_XEP_REGISTRY;
  const moduleByName = (name, fallback) => {
    const fromRegistry = typeof registry?.get === "function" ? registry.get(name) : null;
    return fromRegistry || fallback || {};
  };

  const aggregate = Object.freeze({
    namespaces: moduleByName("xep-0384_crypto-namespaces", globalScope.SHITCORD67_XMPP_NS),
    cryptoUtils: moduleByName("xep-0384_omemo-crypto-utils", globalScope.SHITCORD67_XEP_0384_CRYPTO_UTILS),
    namespaceSelection: moduleByName("xep-0384_namespace-selection", globalScope.SHITCORD67_XEP_0384_NAMESPACE_SELECTION),
    runtime: moduleByName("xep-0384_runtime", globalScope.SHITCORD67_XEP_0384_RUNTIME),
    preferences: moduleByName("xep-0384_preferences", globalScope.SHITCORD67_XEP_0384_PREFERENCES),
    identity: moduleByName("xep-0384_identity", globalScope.SHITCORD67_XEP_0384_IDENTITY),
    sessions: moduleByName("xep-0384_sessions", globalScope.SHITCORD67_XEP_0384_SESSIONS),
    devices: moduleByName("xep-0384_devices", globalScope.SHITCORD67_XEP_0384_DEVICES),
    bundles: moduleByName("xep-0384_bundles", globalScope.SHITCORD67_XEP_0384_BUNDLES),
    ownBundle: moduleByName("xep-0384_own-bundle", globalScope.SHITCORD67_XEP_0384_OWN_BUNDLE),
    targets: moduleByName("xep-0384_targets", globalScope.SHITCORD67_XEP_0384_TARGETS),
    messageCrypto: moduleByName("xep-0384_message-crypto", globalScope.SHITCORD67_XEP_0384_MESSAGE_CRYPTO),
    decryptContent: moduleByName("xep-0384_decrypt-content", globalScope.SHITCORD67_XEP_0384_DECRYPT_CONTENT),
    decryptFlow: moduleByName("xep-0384_decrypt-flow", globalScope.SHITCORD67_XEP_0384_DECRYPT_FLOW),
    store: moduleByName("xep-0384_omemo-store", globalScope.SHITCORD67_XEP_0384_OMEMO_STORE),
    stanza: moduleByName("xep-0384_omemo-stanza", globalScope.SHITCORD67_XEP_0384_OMEMO)
  });

  globalScope.SHITCORD67_XEP_0384 = aggregate;
  if (typeof registry?.register === "function") {
    registry.register("xep-0384", aggregate);
  }
})(typeof window !== "undefined" ? window : globalThis);
