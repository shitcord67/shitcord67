(function initXep0384DecryptFlow(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_DECRYPT_FLOW) return;

  function xmppOmemoTryDecryptIntoMessageCore({
    stanza,
    message,
    peerBare,
    ownBare,
    onUpdated,
    runtimeAvailableFn,
    parseEncryptedPayloadFn,
    decryptPayloadFn,
    extractAesgcmUrlsFn,
    stripAesgcmUrlsFn,
    normalizeAttachmentsFn,
    saveStateFn,
    debugEventFn,
    inFlightByMessageId,
    resolveMessageIdFn
  }) {
    if (!stanza || !message || !peerBare || !ownBare) return;
    if (typeof runtimeAvailableFn !== "function" || !runtimeAvailableFn()) return;
    if (typeof parseEncryptedPayloadFn !== "function" || typeof decryptPayloadFn !== "function") return;
    if (!inFlightByMessageId) return;

    const omemoPayload = parseEncryptedPayloadFn(stanza);
    if (!omemoPayload) return;

    const messageId = typeof resolveMessageIdFn === "function"
      ? resolveMessageIdFn({ stanza, message, peerBare })
      : `${peerBare}|${message.id || "msg"}`;
    if (inFlightByMessageId.has(messageId)) return;

    const task = (async () => {
      try {
        const plaintext = await decryptPayloadFn(peerBare, omemoPayload, ownBare);
        if (!plaintext) return;
        const aesgcmUrls = typeof extractAesgcmUrlsFn === "function" ? extractAesgcmUrlsFn(plaintext) : [];
        const cleanText = typeof stripAesgcmUrlsFn === "function" ? stripAesgcmUrlsFn(plaintext) : plaintext;
        if (aesgcmUrls.length > 0 && typeof normalizeAttachmentsFn === "function") {
          const encryptedAttachments = aesgcmUrls.map((url) => ({
            type: "file",
            url,
            name: "Encrypted attachment",
            format: "aesgcm"
          }));
          message.attachments = normalizeAttachmentsFn([
            ...encryptedAttachments,
            ...normalizeAttachmentsFn(message.attachments)
          ]);
        }
        message.text = cleanText || message.text || "";
        message.xmppEncrypted = true;
        message.xmppEncryptedType = omemoPayload.encryptedType || "omemo";
        message.xmppEncryptedLabel = "OMEMO";
        message.xmppOmemoDecrypted = true;
        if (typeof saveStateFn === "function") saveStateFn();
        if (typeof onUpdated === "function") onUpdated();
      } catch (error) {
        if (typeof debugEventFn === "function") {
          debugEventFn("error", "OMEMO decrypt failed", {
            peer: peerBare,
            error: String(error?.message || error)
          });
        }
      }
    })();

    inFlightByMessageId.set(messageId, task);
    task.finally(() => {
      inFlightByMessageId.delete(messageId);
    });
  }

  globalScope.SHITCORD67_XEP_0384_DECRYPT_FLOW = Object.freeze({
    xmppOmemoTryDecryptIntoMessageCore
  });
})(typeof window !== "undefined" ? window : globalThis);
