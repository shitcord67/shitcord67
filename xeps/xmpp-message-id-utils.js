(function initXmppMessageIdUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XMPP_MESSAGE_ID_UTILS) return;

  function xmppSyntheticMessageId({ from = "", ts = "", text = "", attachments = [], replyId = "" } = {}, {
    normalizeAttachmentsFn = (value) => (Array.isArray(value) ? value : [])
  } = {}) {
    const headAttachment = normalizeAttachmentsFn(attachments)[0]?.url || "";
    const seed = [
      (from || "").toString().trim().toLowerCase(),
      (ts || "").toString().trim(),
      (text || "").toString().trim(),
      headAttachment,
      (replyId || "").toString().trim()
    ].join("|");
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
      hash ^= seed.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return `xmpp-syn-${(hash >>> 0).toString(16)}`;
  }

  globalScope.SHITCORD67_XMPP_MESSAGE_ID_UTILS = Object.freeze({
    xmppSyntheticMessageId
  });
})(typeof window !== "undefined" ? window : globalThis);
