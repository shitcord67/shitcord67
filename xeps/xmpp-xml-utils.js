(function initXmppXmlUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XMPP_XML) return;

  function xmppNodeXmlns(node) {
    if (!node || typeof node.getAttribute !== "function") return "";
    const inline = (node.getAttribute("xmlns") || "").toString().trim().toLowerCase();
    if (inline) return inline;
    return (node.namespaceURI || "").toString().trim().toLowerCase();
  }

  function xmppNodeLocalName(node) {
    if (!node) return "";
    const local = (node.localName || node.nodeName || "").toString().trim().toLowerCase();
    if (!local) return "";
    if (!local.includes(":")) return local;
    return local.split(":").pop() || "";
  }

  function xmppElementsByLocalName(root, name = "") {
    if (!root || typeof root.getElementsByTagName !== "function") return [];
    const wanted = (name || "").toString().trim().toLowerCase();
    if (!wanted) return [];
    const direct = [...root.getElementsByTagName(wanted)];
    const wildcard = [...root.getElementsByTagName("*")]
      .filter((node) => xmppNodeLocalName(node) === wanted);
    if (direct.length === 0) return wildcard;
    if (wildcard.length === 0) return direct;
    const seen = new Set();
    const merged = [];
    [...direct, ...wildcard].forEach((node) => {
      if (seen.has(node)) return;
      seen.add(node);
      merged.push(node);
    });
    return merged;
  }

  function xmppDirectChildByLocalName(root, name = "") {
    if (!root || !root.childNodes) return null;
    const wanted = (name || "").toString().trim().toLowerCase();
    if (!wanted) return null;
    return [...root.childNodes]
      .find((node) => node?.nodeType === 1 && xmppNodeLocalName(node) === wanted) || null;
  }

  function xmppNodeHasXmlns(node, xmlns) {
    return xmppNodeXmlns(node) === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppNodeHasXmlnsPrefix(node, prefix = "") {
    const normalizedPrefix = (prefix || "").toString().trim().toLowerCase();
    if (!normalizedPrefix) return false;
    const value = xmppNodeXmlns(node);
    const scopedPrefix = normalizedPrefix.endsWith(":")
      ? normalizedPrefix
      : `${normalizedPrefix}:`;
    return value === normalizedPrefix || value.startsWith(scopedPrefix);
  }

  function xmppNodeHasAnyXmlns(node, xmlnsList = []) {
    const list = Array.isArray(xmlnsList) ? xmlnsList : [xmlnsList];
    return list.some((xmlns) => xmppNodeHasXmlns(node, xmlns));
  }

  function xmppNodeText(node) {
    if (!node) return "";
    if (typeof globalThis.Strophe?.getText === "function") {
      return (globalThis.Strophe.getText(node) || "").toString();
    }
    return (node.textContent || "").toString();
  }

  globalScope.SHITCORD67_XMPP_XML = Object.freeze({
    xmppNodeXmlns,
    xmppNodeLocalName,
    xmppElementsByLocalName,
    xmppDirectChildByLocalName,
    xmppNodeHasXmlns,
    xmppNodeHasXmlnsPrefix,
    xmppNodeHasAnyXmlns,
    xmppNodeText
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xmpp-xml-utils", globalScope.SHITCORD67_XMPP_XML);
  }
})(typeof window !== "undefined" ? window : globalThis);
