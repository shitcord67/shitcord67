(function initXep0384NamespaceSelection(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_NAMESPACE_SELECTION) return;

  const ns = globalScope.SHITCORD67_XMPP_NS || {};

  function xmppOmemoBuildNamespaceCandidates({
    cachedPreferred = "",
    discoFeatures = new Set(),
    includeLegacy = true
  } = {}) {
    const omemoNs = ns.XMPP_OMEMO_NAMESPACE || "eu.siacs.conversations.axolotl";
    const omemoNsV2 = ns.XMPP_OMEMO_NAMESPACE_V2 || "urn:xmpp:omemo:2";
    const omemoNamespaces = ns.XMPP_OMEMO_NAMESPACES || [omemoNsV2, omemoNs];
    const devicelistV2 = ns.XMPP_OMEMO_DEVICELIST_NODE_V2 || "urn:xmpp:omemo:2:devicelist";
    const notifyV2 = ns.XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2 || "urn:xmpp:omemo:2:devicelist+notify";

    const featureSet = discoFeatures instanceof Set
      ? discoFeatures
      : new Set(Array.isArray(discoFeatures) ? discoFeatures : []);
    const supportsV2 = featureSet.has(omemoNsV2)
      || featureSet.has(notifyV2)
      || featureSet.has(devicelistV2);

    const list = [];
    const append = (namespace) => {
      const value = (namespace || "").toString().trim();
      if (!value || list.includes(value)) return;
      if (!includeLegacy && value === omemoNs) return;
      list.push(value);
    };

    if (supportsV2) append(omemoNsV2);
    append(cachedPreferred);
    omemoNamespaces.forEach(append);
    if (list.length === 0) append(omemoNs);
    return list;
  }

  function xmppOmemoSelectNamespaceForSend(preferredNamespaces = []) {
    const omemoNs = ns.XMPP_OMEMO_NAMESPACE || "eu.siacs.conversations.axolotl";
    const omemoNsV2 = ns.XMPP_OMEMO_NAMESPACE_V2 || "urn:xmpp:omemo:2";
    const supported = (Array.isArray(preferredNamespaces) ? preferredNamespaces : [preferredNamespaces])
      .map((entry) => (entry || "").toString().trim())
      .filter(Boolean);
    if (supported.length === 0) return omemoNs;
    if (supported.every((namespace) => namespace === omemoNsV2)) return omemoNsV2;
    return omemoNs;
  }

  globalScope.SHITCORD67_XEP_0384_NAMESPACE_SELECTION = Object.freeze({
    xmppOmemoBuildNamespaceCandidates,
    xmppOmemoSelectNamespaceForSend
  });
})(typeof window !== "undefined" ? window : globalThis);
