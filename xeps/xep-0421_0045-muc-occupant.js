(function initXep0421_0045MucOccupant(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0421_0045_MUC_OCCUPANT) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};
  const XMPP_OCCUPANT_ID_NAMESPACE = "urn:xmpp:occupant-id:0";

  function xmppElementsByLocalName(root, name = "") {
    if (typeof xml.xmppElementsByLocalName === "function") return xml.xmppElementsByLocalName(root, name);
    if (!root || typeof root.getElementsByTagName !== "function") return [];
    const wanted = (name || "").toString().trim().toLowerCase();
    return wanted ? [...root.getElementsByTagName(wanted)] : [];
  }

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
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    const scopedPrefix = normalizedPrefix.endsWith(":") ? normalizedPrefix : `${normalizedPrefix}:`;
    return Boolean(normalizedPrefix && (nodeXmlns === normalizedPrefix || nodeXmlns.startsWith(scopedPrefix)));
  }

  function xmppOccupantIdFromStanza(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return "";
    const node = xmppElementsByLocalName(stanza, "occupant-id")
      .find((entry) => (
        xmppNodeHasXmlns(entry, XMPP_OCCUPANT_ID_NAMESPACE)
        || xmppNodeHasXmlnsPrefix(entry, XMPP_OCCUPANT_ID_NAMESPACE)
      )) || null;
    return (node?.getAttribute("id") || "").toString().trim().slice(0, 200);
  }

  function xmppMucMessageAuthorJid(stanza, { bareJidFn = (value) => (value || "").toString().trim().toLowerCase() } = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return "";
    const mucUserNode = [...stanza.getElementsByTagName("x")]
      .find((node) => xmppNodeHasXmlns(node, "http://jabber.org/protocol/muc#user")) || null;
    const itemNode = mucUserNode ? mucUserNode.getElementsByTagName("item")[0] : null;
    return bareJidFn(itemNode?.getAttribute("jid") || "");
  }

  globalScope.SHITCORD67_XEP_0421_0045_MUC_OCCUPANT = Object.freeze({
    XMPP_OCCUPANT_ID_NAMESPACE,
    xmppOccupantIdFromStanza,
    xmppMucMessageAuthorJid
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0421_0045-muc-occupant", globalScope.SHITCORD67_XEP_0421_0045_MUC_OCCUPANT);
  }
})(typeof window !== "undefined" ? window : globalThis);
