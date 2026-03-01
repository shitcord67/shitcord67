(function initXmppCryptoNamespaces(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XMPP_NS) return;

  const XMPP_EME_NAMESPACE = "urn:xmpp:eme:0";
  const XMPP_OPENPGP_NAMESPACE = "urn:xmpp:openpgp:0";
  const XMPP_OPENPGP_LEGACY_NAMESPACE = "jabber:x:encrypted";
  const XMPP_OTR_PREFIX = "?OTR:";
  const XMPP_OMEMO_NAMESPACE = "eu.siacs.conversations.axolotl";
  const XMPP_OMEMO_NAMESPACE_V2 = "urn:xmpp:omemo:2";
  const XMPP_OMEMO_NAMESPACES = [XMPP_OMEMO_NAMESPACE_V2, XMPP_OMEMO_NAMESPACE];
  const XMPP_OMEMO_DEVICELIST_NODE = "eu.siacs.conversations.axolotl.devicelist";
  const XMPP_OMEMO_DEVICELIST_NODE_V2 = "urn:xmpp:omemo:2:devicelist";
  const XMPP_OMEMO_BUNDLE_NODE_PREFIX = "eu.siacs.conversations.axolotl.bundles:";
  const XMPP_OMEMO_BUNDLE_NODE_PREFIX_V2 = "urn:xmpp:omemo:2:bundles:";
  const XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE = `${XMPP_OMEMO_DEVICELIST_NODE}+notify`;
  const XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2 = `${XMPP_OMEMO_DEVICELIST_NODE_V2}+notify`;
  const XMPP_OMEMO_PREKEY_COUNT = 48;
  const XMPP_OMEMO_SIGNED_PREKEY_ID = 1;

  globalScope.SHITCORD67_XMPP_NS = Object.freeze({
    XMPP_EME_NAMESPACE,
    XMPP_OPENPGP_NAMESPACE,
    XMPP_OPENPGP_LEGACY_NAMESPACE,
    XMPP_OTR_PREFIX,
    XMPP_OMEMO_NAMESPACE,
    XMPP_OMEMO_NAMESPACE_V2,
    XMPP_OMEMO_NAMESPACES: Object.freeze([...XMPP_OMEMO_NAMESPACES]),
    XMPP_OMEMO_DEVICELIST_NODE,
    XMPP_OMEMO_DEVICELIST_NODE_V2,
    XMPP_OMEMO_BUNDLE_NODE_PREFIX,
    XMPP_OMEMO_BUNDLE_NODE_PREFIX_V2,
    XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE,
    XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2,
    XMPP_OMEMO_PREKEY_COUNT,
    XMPP_OMEMO_SIGNED_PREKEY_ID
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0384_crypto-namespaces", globalScope.SHITCORD67_XMPP_NS);
  }
})(typeof window !== "undefined" ? window : globalThis);
