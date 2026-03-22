(function initXep0384OmemoStanza(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_OMEMO) return;

  const ns = globalScope.SHITCORD67_XMPP_NS || {};
  const xml = globalScope.SHITCORD67_XMPP_XML || {};

  function xmppNodeText(node) {
    if (typeof xml.xmppNodeText === "function") return xml.xmppNodeText(node);
    if (!node) return "";
    if (typeof globalThis.Strophe?.getText === "function") {
      return (globalThis.Strophe.getText(node) || "").toString();
    }
    return (node.textContent || "").toString();
  }

  function xmppNodeXmlns(node) {
    if (typeof xml.xmppNodeXmlns === "function") return xml.xmppNodeXmlns(node);
    if (!node || typeof node.getAttribute !== "function") return "";
    const inline = (node.getAttribute("xmlns") || "").toString().trim().toLowerCase();
    if (inline) return inline;
    return (node.namespaceURI || "").toString().trim().toLowerCase();
  }

  function xmppNodeHasAnyXmlns(node, xmlnsList = []) {
    if (typeof xml.xmppNodeHasAnyXmlns === "function") return xml.xmppNodeHasAnyXmlns(node, xmlnsList);
    const list = Array.isArray(xmlnsList) ? xmlnsList : [xmlnsList];
    const nodeXmlns = xmppNodeXmlns(node);
    return list.some((xmlns) => nodeXmlns === (xmlns || "").toString().trim().toLowerCase());
  }

  function xmppOmemoNamespaceNodeSet(namespace = ns.XMPP_OMEMO_NAMESPACE || "eu.siacs.conversations.axolotl") {
    const legacyNs = ns.XMPP_OMEMO_NAMESPACE || "eu.siacs.conversations.axolotl";
    const v2Ns = ns.XMPP_OMEMO_NAMESPACE_V2 || "urn:xmpp:omemo:2";
    const candidate = (namespace || "").toString().trim().toLowerCase();
    if (candidate === v2Ns) {
      return {
        namespace: v2Ns,
        devicelistNode: ns.XMPP_OMEMO_DEVICELIST_NODE_V2 || "urn:xmpp:omemo:2:devicelist",
        bundleNodePrefix: ns.XMPP_OMEMO_BUNDLE_NODE_PREFIX_V2 || "urn:xmpp:omemo:2:bundles:",
        notifyFeature: ns.XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2 || "urn:xmpp:omemo:2:devicelist+notify",
        encryptedType: "omemo2"
      };
    }
    return {
      namespace: legacyNs,
      devicelistNode: ns.XMPP_OMEMO_DEVICELIST_NODE || "eu.siacs.conversations.axolotl.devicelist",
      bundleNodePrefix: ns.XMPP_OMEMO_BUNDLE_NODE_PREFIX || "eu.siacs.conversations.axolotl.bundles:",
      notifyFeature: ns.XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE || "eu.siacs.conversations.axolotl.devicelist+notify",
      encryptedType: "omemo"
    };
  }

  function xmppOmemoParseEncryptedPayload(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const namespaces = ns.XMPP_OMEMO_NAMESPACES || [
      ns.XMPP_OMEMO_NAMESPACE_V2 || "urn:xmpp:omemo:2",
      ns.XMPP_OMEMO_NAMESPACE || "eu.siacs.conversations.axolotl"
    ];
    const encryptedNode = [...stanza.getElementsByTagName("encrypted")]
      .find((node) => xmppNodeHasAnyXmlns(node, namespaces)) || null;
    if (!encryptedNode) return null;
    const namespace = xmppNodeXmlns(encryptedNode);
    const headerNode = encryptedNode.getElementsByTagName("header")[0] || null;
    if (!headerNode) return null;
    const sid = (headerNode.getAttribute("sid") || "").toString().trim();
    const ivNode = headerNode.getElementsByTagName("iv")[0] || null;
    const payloadNode = encryptedNode.getElementsByTagName("payload")[0] || null;
    const keys = {};
    [...headerNode.getElementsByTagName("key")].forEach((node) => {
      const rid = (node.getAttribute("rid") || "").toString().trim();
      if (!rid) return;
      const prekeyRaw = (node.getAttribute("prekey") || "").toString().trim().toLowerCase();
      keys[rid] = {
        payload: xmppNodeText(node).trim(),
        prekey: prekeyRaw === "1" || prekeyRaw === "true"
      };
    });
    return {
      namespace,
      encryptedType: namespace === (ns.XMPP_OMEMO_NAMESPACE_V2 || "urn:xmpp:omemo:2") ? "omemo2" : "omemo",
      sid,
      keys,
      iv: xmppNodeText(ivNode).trim(),
      payload: xmppNodeText(payloadNode).trim()
    };
  }

  function appendXmppOmemoEncryptedNode(stanza, payload, { namespace = ns.XMPP_OMEMO_NAMESPACE || "eu.siacs.conversations.axolotl" } = {}) {
    if (!stanza || !payload) return stanza;
    const nodeSet = xmppOmemoNamespaceNodeSet(namespace);
    const encrypted = stanza.c("encrypted", { xmlns: nodeSet.namespace });
    const header = encrypted.c("header", { sid: payload.sid || "" });
    Object.entries(payload.keys || {}).forEach(([rid, entry]) => {
      if (!rid || !entry?.payload) return;
      const attrs = { rid };
      if (entry.prekey) attrs.prekey = "1";
      header.c("key", attrs).t(entry.payload).up();
    });
    header.c("iv").t(payload.iv || "").up();
    header.up();
    encrypted.c("payload").t(payload.payload || "").up();
    encrypted.up();
    return stanza;
  }

  function appendXmppEmeNode(stanza, { namespace = "", name = "" } = {}) {
    if (!stanza || !namespace) return stanza;
    const attrs = {
      xmlns: ns.XMPP_EME_NAMESPACE || "urn:xmpp:eme:0",
      namespace
    };
    if (name) attrs.name = name;
    stanza.c("encryption", attrs).up();
    return stanza;
  }

  globalScope.SHITCORD67_XEP_0384_OMEMO = Object.freeze({
    xmppOmemoNamespaceNodeSet,
    xmppOmemoParseEncryptedPayload,
    appendXmppOmemoEncryptedNode,
    appendXmppEmeNode
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0384_omemo-stanza", globalScope.SHITCORD67_XEP_0384_OMEMO);
  }
})(typeof window !== "undefined" ? window : globalThis);
