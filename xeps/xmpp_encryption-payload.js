(function initXmppEncryptionPayload(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XMPP_ENCRYPTION_PAYLOAD) return;

  const ns = globalScope.SHITCORD67_XMPP_NS || {};
  const xml = globalScope.SHITCORD67_XMPP_XML || {};

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    if (!node || typeof node.getAttribute !== "function") return false;
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    return nodeXmlns === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppNodeHasXmlnsPrefix(node, prefix = "") {
    if (typeof xml.xmppNodeHasXmlnsPrefix === "function") return xml.xmppNodeHasXmlnsPrefix(node, prefix);
    if (!node || typeof node.getAttribute !== "function") return false;
    const normalizedPrefix = (prefix || "").toString().trim().toLowerCase();
    if (!normalizedPrefix) return false;
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    const scopedPrefix = normalizedPrefix.endsWith(":") ? normalizedPrefix : `${normalizedPrefix}:`;
    return nodeXmlns === normalizedPrefix || nodeXmlns.startsWith(scopedPrefix);
  }

  function xmppEncryptedPayloadInfo(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") {
      return { encrypted: false, type: "", label: "" };
    }
    const encryptedNodes = [...stanza.getElementsByTagName("encrypted")];
    const hasLegacyOmemo = encryptedNodes
      .some((node) => xmppNodeHasXmlns(node, ns.XMPP_OMEMO_NAMESPACE || "eu.siacs.conversations.axolotl"));
    if (hasLegacyOmemo) return { encrypted: true, type: "omemo", label: "OMEMO" };
    const hasOmemo = encryptedNodes
      .some((node) => xmppNodeHasXmlnsPrefix(node, "urn:xmpp:omemo:"));
    if (hasOmemo) return { encrypted: true, type: "omemo2", label: "OMEMO" };
    const hasOpenPgp = [...stanza.getElementsByTagName("openpgp")]
      .some((node) => xmppNodeHasXmlns(node, ns.XMPP_OPENPGP_NAMESPACE || "urn:xmpp:openpgp:0"));
    if (hasOpenPgp) return { encrypted: true, type: "openpgp", label: "OpenPGP" };
    const hasPgp = [...stanza.getElementsByTagName("x")]
      .some((node) => xmppNodeHasXmlns(node, ns.XMPP_OPENPGP_LEGACY_NAMESPACE || "jabber:x:encrypted"));
    if (hasPgp) return { encrypted: true, type: "pgp", label: "OpenPGP" };
    return { encrypted: false, type: "", label: "" };
  }

  function xmppHasEncryptedPayload(stanza) {
    return xmppEncryptedPayloadInfo(stanza).encrypted;
  }

  function xmppEncryptedPlaceholderLabel(info) {
    if (!info || !info.encrypted) return "";
    const label = (info.label || "").toString().trim();
    if (!label) return "Encrypted XMPP message — decryption is not available in this client yet";
    return `Encrypted XMPP message (${label}) — decryption is not available in this client yet`;
  }

  globalScope.SHITCORD67_XMPP_ENCRYPTION_PAYLOAD = Object.freeze({
    xmppEncryptedPayloadInfo,
    xmppHasEncryptedPayload,
    xmppEncryptedPlaceholderLabel
  });
})(typeof window !== "undefined" ? window : globalThis);
