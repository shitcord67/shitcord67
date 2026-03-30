(function initXep0373OpenPgpStanza(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0373_0374_OPENPGP_STANZA) return;

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

  function escapeXml(text = "") {
    return (text || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function randomRpad() {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 30 + Math.floor(Math.random() * 21);
    let out = "";
    for (let i = 0; i < length; i += 1) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)] || "x";
    }
    return out;
  }

  function xmppOpenPgpParsePayload(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const node = [...stanza.getElementsByTagName("openpgp")]
      .find((entry) => ((entry.getAttribute("xmlns") || entry.namespaceURI || "").toString().trim().toLowerCase())
        === (ns.XMPP_OPENPGP_NAMESPACE || "urn:xmpp:openpgp:0"));
    if (!node) return null;
    return {
      payloadBase64: xmppNodeText(node).trim()
    };
  }

  function xmppLegacyPgpParsePayload(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const node = [...stanza.getElementsByTagName("x")]
      .find((entry) => ((entry.getAttribute("xmlns") || entry.namespaceURI || "").toString().trim().toLowerCase())
        === (ns.XMPP_OPENPGP_LEGACY_NAMESPACE || "jabber:x:encrypted"));
    if (!node) return null;
    return {
      armored: xmppNodeText(node).trim()
    };
  }

  function buildXmppOpenPgpSigncryptXml(plaintext = "", recipients = []) {
    const cleanRecipients = [...new Set((Array.isArray(recipients) ? recipients : [recipients])
      .map((entry) => (entry || "").toString().trim())
      .filter(Boolean))];
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const toXml = cleanRecipients.map((jid) => `<to jid="${escapeXml(jid)}"/>`).join("");
    return [
      `<signcrypt xmlns="${ns.XMPP_OPENPGP_NAMESPACE || "urn:xmpp:openpgp:0"}">`,
      toXml,
      `<time stamp="${escapeXml(timestamp)}"/>`,
      `<rpad>${escapeXml(randomRpad())}</rpad>`,
      `<payload><body xmlns="jabber:client">${escapeXml(plaintext)}</body></payload>`,
      "</signcrypt>"
    ].join("");
  }

  function appendXmppOpenPgpNode(stanza, payloadBase64 = "") {
    if (!stanza || !payloadBase64) return stanza;
    stanza.c("openpgp", { xmlns: ns.XMPP_OPENPGP_NAMESPACE || "urn:xmpp:openpgp:0" })
      .t(payloadBase64)
      .up();
    stanza.c("encryption", {
      xmlns: ns.XMPP_EME_NAMESPACE || "urn:xmpp:eme:0",
      namespace: ns.XMPP_OPENPGP_NAMESPACE || "urn:xmpp:openpgp:0",
      name: "OpenPGP"
    }).up();
    return stanza;
  }

  function appendXmppLegacyPgpNode(stanza, armored = "") {
    if (!stanza || !armored) return stanza;
    stanza.c("x", { xmlns: ns.XMPP_OPENPGP_LEGACY_NAMESPACE || "jabber:x:encrypted" })
      .t(armored)
      .up();
    stanza.c("encryption", {
      xmlns: ns.XMPP_EME_NAMESPACE || "urn:xmpp:eme:0",
      namespace: ns.XMPP_OPENPGP_LEGACY_NAMESPACE || "jabber:x:encrypted",
      name: "OpenPGP"
    }).up();
    return stanza;
  }

  function parseXmppOpenPgpDecryptedText(plaintext = "") {
    const raw = (plaintext || "").toString();
    if (!raw.trim()) return "";
    if (!/<signcrypt[\s>]/i.test(raw)) return raw.trim();
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, "application/xml");
      const parseError = doc.getElementsByTagName("parsererror")[0];
      if (parseError) return raw.trim();
      const body = doc.getElementsByTagName("body")[0] || null;
      const payload = doc.getElementsByTagName("payload")[0] || null;
      if (body) return (body.textContent || "").toString().trim();
      if (payload) return (payload.textContent || "").toString().trim();
    } catch {
      return raw.trim();
    }
    return raw.trim();
  }

  globalScope.SHITCORD67_XEP_0373_0374_OPENPGP_STANZA = Object.freeze({
    xmppOpenPgpParsePayload,
    xmppLegacyPgpParsePayload,
    buildXmppOpenPgpSigncryptXml,
    appendXmppOpenPgpNode,
    appendXmppLegacyPgpNode,
    parseXmppOpenPgpDecryptedText
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0373_0374_openpgp-stanza", globalScope.SHITCORD67_XEP_0373_0374_OPENPGP_STANZA);
  }
})(typeof window !== "undefined" ? window : globalThis);
