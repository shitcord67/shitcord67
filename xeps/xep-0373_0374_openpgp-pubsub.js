(function initXep0373OpenPgpPubsub(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0373_0374_OPENPGP_PUBSUB) return;

  function parseIsoTimestamp(value = "") {
    const time = Date.parse((value || "").toString().trim());
    return Number.isFinite(time) ? new Date(time).toISOString() : "";
  }

  async function xmppOpenPgpFetchKeylistCore(jid, {
    toBareJid,
    connection,
    sendIqPromiseFn,
    nodeTextFn,
    publicKeysNode,
    openPgpNamespace
  } = {}) {
    const bare = typeof toBareJid === "function" ? toBareJid(jid || "") : "";
    if (!bare || !connection || typeof connection.sendIQ !== "function" || typeof sendIqPromiseFn !== "function" || !globalThis.$iq) {
      return [];
    }
    const iq = globalThis.$iq({ type: "get", to: bare })
      .c("pubsub", { xmlns: "http://jabber.org/protocol/pubsub" })
      .c("items", { node: publicKeysNode || "urn:xmpp:openpgp:0:public-keys" });
    const stanza = await sendIqPromiseFn(connection, iq, 7000);
    const listNode = [...stanza.getElementsByTagName("public-keys-list")]
      .find((entry) => ((entry.getAttribute("xmlns") || entry.namespaceURI || "").toString().trim().toLowerCase())
        === (openPgpNamespace || "urn:xmpp:openpgp:0"));
    if (!listNode) return [];
    return [...listNode.getElementsByTagName("pubkey-metadata")]
      .map((entry) => ({
        fingerprint: (entry.getAttribute("v4-fingerprint") || "").toString().trim(),
        date: parseIsoTimestamp(entry.getAttribute("date") || ""),
        rawDate: (entry.getAttribute("date") || "").toString().trim()
      }))
      .filter((entry) => entry.fingerprint);
  }

  async function xmppOpenPgpFetchPublicKeyCore(jid, fingerprint, {
    toBareJid,
    connection,
    sendIqPromiseFn,
    nodeTextFn,
    publicKeysNode,
    openPgpNamespace
  } = {}) {
    const bare = typeof toBareJid === "function" ? toBareJid(jid || "") : "";
    const cleanFingerprint = (fingerprint || "").toString().trim();
    if (!bare || !cleanFingerprint || !connection || typeof connection.sendIQ !== "function" || typeof sendIqPromiseFn !== "function" || !globalThis.$iq) {
      return null;
    }
    const iq = globalThis.$iq({ type: "get", to: bare })
      .c("pubsub", { xmlns: "http://jabber.org/protocol/pubsub" })
      .c("items", { node: `${publicKeysNode || "urn:xmpp:openpgp:0:public-keys"}:${cleanFingerprint}` });
    const stanza = await sendIqPromiseFn(connection, iq, 7000);
    const pubkeyNode = [...stanza.getElementsByTagName("pubkey")]
      .find((entry) => ((entry.getAttribute("xmlns") || entry.namespaceURI || "").toString().trim().toLowerCase())
        === (openPgpNamespace || "urn:xmpp:openpgp:0"));
    if (!pubkeyNode) return null;
    const dataNode = pubkeyNode.getElementsByTagName("data")[0] || null;
    const dataBase64 = typeof nodeTextFn === "function" ? nodeTextFn(dataNode).trim() : ((dataNode?.textContent || "").toString().trim());
    if (!dataBase64) return null;
    return {
      fingerprint: cleanFingerprint,
      dataBase64,
      date: parseIsoTimestamp(pubkeyNode.getAttribute("date") || "")
    };
  }

  async function xmppOpenPgpPublishKeylistCore(ownBare, keys = [], {
    connection,
    sendIqPromiseFn,
    publicKeysNode,
    openPgpNamespace,
    debugEventFn
  } = {}) {
    if (!ownBare || !connection || typeof connection.sendIQ !== "function" || typeof sendIqPromiseFn !== "function" || !globalThis.$iq) {
      return false;
    }
    const uniqueKeys = [...new Map((Array.isArray(keys) ? keys : []).map((entry) => [
      (entry?.fingerprint || "").toString().trim(),
      entry
    ])).values()].filter((entry) => entry?.fingerprint);
    if (uniqueKeys.length === 0) return false;
    const iq = globalThis.$iq({ type: "set", to: ownBare })
      .c("pubsub", { xmlns: "http://jabber.org/protocol/pubsub" })
      .c("publish", { node: publicKeysNode || "urn:xmpp:openpgp:0:public-keys" })
      .c("item", { id: "current" })
      .c("public-keys-list", { xmlns: openPgpNamespace || "urn:xmpp:openpgp:0" });
    uniqueKeys.forEach((entry) => {
      iq.c("pubkey-metadata", {
        "v4-fingerprint": (entry.fingerprint || "").toString().trim(),
        date: (entry.date || new Date().toISOString()).toString()
      }).up();
    });
    try {
      await sendIqPromiseFn(connection, iq, 7000);
      return true;
    } catch (error) {
      if (typeof debugEventFn === "function") {
        debugEventFn("error", "OpenPGP keylist publish failed", {
          jid: ownBare,
          error: String(error?.message || error)
        });
      }
      return false;
    }
  }

  async function xmppOpenPgpPublishPublicKeyCore(ownBare, {
    fingerprint = "",
    dataBase64 = "",
    date = ""
  } = {}, {
    connection,
    sendIqPromiseFn,
    publicKeysNode,
    openPgpNamespace,
    debugEventFn
  } = {}) {
    const cleanFingerprint = (fingerprint || "").toString().trim();
    const cleanData = (dataBase64 || "").toString().trim();
    if (!ownBare || !cleanFingerprint || !cleanData || !connection || typeof connection.sendIQ !== "function" || typeof sendIqPromiseFn !== "function" || !globalThis.$iq) {
      return false;
    }
    const iq = globalThis.$iq({ type: "set", to: ownBare })
      .c("pubsub", { xmlns: "http://jabber.org/protocol/pubsub" })
      .c("publish", { node: `${publicKeysNode || "urn:xmpp:openpgp:0:public-keys"}:${cleanFingerprint}` })
      .c("item", { id: (date || new Date().toISOString()).toString() })
      .c("pubkey", {
        xmlns: openPgpNamespace || "urn:xmpp:openpgp:0",
        date: (date || new Date().toISOString()).toString()
      })
      .c("data")
      .t(cleanData);
    try {
      await sendIqPromiseFn(connection, iq, 7000);
      return true;
    } catch (error) {
      if (typeof debugEventFn === "function") {
        debugEventFn("error", "OpenPGP public-key publish failed", {
          jid: ownBare,
          fingerprint: cleanFingerprint,
          error: String(error?.message || error)
        });
      }
      return false;
    }
  }

  globalScope.SHITCORD67_XEP_0373_0374_OPENPGP_PUBSUB = Object.freeze({
    xmppOpenPgpFetchKeylistCore,
    xmppOpenPgpFetchPublicKeyCore,
    xmppOpenPgpPublishKeylistCore,
    xmppOpenPgpPublishPublicKeyCore
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0373_0374_openpgp-pubsub", globalScope.SHITCORD67_XEP_0373_0374_OPENPGP_PUBSUB);
  }
})(typeof window !== "undefined" ? window : globalThis);
