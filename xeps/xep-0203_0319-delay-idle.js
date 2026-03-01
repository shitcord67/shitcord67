(function initXep0203_0319DelayIdle(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0203_0319_DELAY_IDLE) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};
  const XMPP_IDLE_NAMESPACE = "urn:xmpp:idle:1";
  const XMPP_DELAY_NAMESPACE = "urn:xmpp:delay";

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    if (!node || typeof node.getAttribute !== "function") return false;
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    return nodeXmlns === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppStanzaDelayTimestamp(stanza, fallbackTs = "") {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return fallbackTs || new Date().toISOString();
    const delayNode = [...stanza.getElementsByTagName("delay")]
      .find((node) => xmppNodeHasXmlns(node, XMPP_DELAY_NAMESPACE)) || null;
    const stamp = (delayNode?.getAttribute("stamp") || "").toString().trim();
    if (!stamp) return fallbackTs || new Date().toISOString();
    const parsed = new Date(stamp);
    if (Number.isNaN(parsed.getTime())) return fallbackTs || new Date().toISOString();
    return parsed.toISOString();
  }

  function xmppPresenceIdleSince(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return "";
    const idleNode = [...stanza.getElementsByTagName("idle")]
      .find((entry) => xmppNodeHasXmlns(entry, XMPP_IDLE_NAMESPACE)) || null;
    const stamp = (idleNode?.getAttribute("since") || "").toString().trim();
    if (!stamp) return "";
    const parsed = new Date(stamp);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString();
  }

  globalScope.SHITCORD67_XEP_0203_0319_DELAY_IDLE = Object.freeze({
    XMPP_IDLE_NAMESPACE,
    XMPP_DELAY_NAMESPACE,
    xmppStanzaDelayTimestamp,
    xmppPresenceIdleSince
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0203_0319-delay-idle", globalScope.SHITCORD67_XEP_0203_0319_DELAY_IDLE);
  }
})(typeof window !== "undefined" ? window : globalThis);
