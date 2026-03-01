(function initXep0308_0424_0444MessageActions(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0308_0424_0444_ACTIONS) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};
  const XMPP_REACTIONS_NAMESPACE = "urn:xmpp:reactions:0";
  const XMPP_MESSAGE_RETRACT_NAMESPACE = "urn:xmpp:message-retract:1";
  const XMPP_FASTEN_NAMESPACE = "urn:xmpp:fasten:0";

  function xmppNodeXmlns(node) {
    if (typeof xml.xmppNodeXmlns === "function") return xml.xmppNodeXmlns(node);
    if (!node || typeof node.getAttribute !== "function") return "";
    return ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
  }

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    return xmppNodeXmlns(node) === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppNodeHasXmlnsPrefix(node, prefix = "") {
    if (typeof xml.xmppNodeHasXmlnsPrefix === "function") return xml.xmppNodeHasXmlnsPrefix(node, prefix);
    const normalizedPrefix = (prefix || "").toString().trim().toLowerCase();
    const value = xmppNodeXmlns(node);
    const scopedPrefix = normalizedPrefix.endsWith(":") ? normalizedPrefix : `${normalizedPrefix}:`;
    return Boolean(normalizedPrefix && (value === normalizedPrefix || value.startsWith(scopedPrefix)));
  }

  function xmppNodeText(node) {
    if (typeof xml.xmppNodeText === "function") return xml.xmppNodeText(node);
    return (node?.textContent || "").toString();
  }

  function xmppMessageCorrectionTargetId(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return "";
    const node = [...stanza.getElementsByTagName("replace")]
      .find((entry) => xmppNodeHasXmlns(entry, "urn:xmpp:message-correct:0") || xmppNodeHasXmlnsPrefix(entry, "urn:xmpp:message-correct"))
      || null;
    return (node?.getAttribute("id") || "").toString().trim();
  }

  function xmppMessageRetractionTargetId(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return "";
    const directNode = [...stanza.getElementsByTagName("retract")]
      .find((entry) => xmppNodeHasXmlns(entry, XMPP_MESSAGE_RETRACT_NAMESPACE) || xmppNodeHasXmlnsPrefix(entry, "urn:xmpp:message-retract"))
      || null;
    const directId = (directNode?.getAttribute("id") || "").toString().trim();
    if (directId) return directId;
    const applyNode = [...stanza.getElementsByTagName("apply-to")]
      .find((entry) => xmppNodeHasXmlns(entry, XMPP_FASTEN_NAMESPACE) || xmppNodeHasXmlnsPrefix(entry, "urn:xmpp:fasten"))
      || null;
    if (!applyNode) return "";
    const hasRetract = [...applyNode.getElementsByTagName("retract")]
      .some((entry) => xmppNodeHasXmlns(entry, XMPP_MESSAGE_RETRACT_NAMESPACE) || xmppNodeHasXmlnsPrefix(entry, "urn:xmpp:message-retract"));
    if (!hasRetract) return "";
    return (applyNode.getAttribute("id") || "").toString().trim();
  }

  function xmppReactionPayloadFromStanza(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const reactionNode = [...stanza.getElementsByTagName("reactions")]
      .find((entry) => xmppNodeHasXmlns(entry, XMPP_REACTIONS_NAMESPACE) || xmppNodeHasXmlnsPrefix(entry, "urn:xmpp:reactions"))
      || null;
    if (!reactionNode) return null;
    const targetId = (reactionNode.getAttribute("id") || "").toString().trim();
    if (!targetId) return null;
    const emojis = [...reactionNode.getElementsByTagName("reaction")]
      .map((entry) => xmppNodeText(entry).trim())
      .filter(Boolean)
      .slice(0, 8);
    return { targetId, emojis };
  }

  globalScope.SHITCORD67_XEP_0308_0424_0444_ACTIONS = Object.freeze({
    xmppMessageCorrectionTargetId,
    xmppMessageRetractionTargetId,
    xmppReactionPayloadFromStanza
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0308_0424_0444-message-actions", globalScope.SHITCORD67_XEP_0308_0424_0444_ACTIONS);
  }
})(typeof window !== "undefined" ? window : globalThis);
