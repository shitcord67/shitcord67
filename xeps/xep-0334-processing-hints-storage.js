/*
 * XEP-0334 processing-hint persistence helpers extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function xmppShouldPersistMessage(message) {
  if (!message || typeof message !== "object") return true;
  const hints = message.xmppProcessingHints;
  if (!hints || typeof hints !== "object") return true;
  const text = (message.text || "").toString().trim();
  const hasAttachments = Array.isArray(message.attachments) && message.attachments.length > 0;
  const hasPoll = Boolean(message.poll);
  const hasReply = Boolean(message.replyTo && typeof message.replyTo === "object");
  const isEncryptedUserMessage = Boolean(message.xmppEncrypted || message.xmppOmemoPayload);
  const hasUserContent = Boolean(text || hasAttachments || hasPoll || hasReply || isEncryptedUserMessage);
  if (hasUserContent) return true;
  return !(hints.noStore || hints.noPermanentStore);
}

function xmppFilterMessagesForStorage(messages) {
  if (!Array.isArray(messages)) return messages;
  let changed = false;
  const filtered = messages.filter((message) => {
    const keep = xmppShouldPersistMessage(message);
    if (!keep) changed = true;
    return keep;
  });
  return changed ? filtered : messages;
}

function xmppSnapshotStateForStorage(rawState) {
  if (!rawState || typeof rawState !== "object") return rawState;
  const snapshot = { ...rawState };
  if (Array.isArray(rawState.dmThreads)) {
    snapshot.dmThreads = rawState.dmThreads.map((thread) => {
      if (!thread || typeof thread !== "object") return thread;
      const filtered = xmppFilterMessagesForStorage(thread.messages);
      if (filtered === thread.messages) return thread;
      return { ...thread, messages: filtered };
    });
  }
  if (Array.isArray(rawState.guilds)) {
    snapshot.guilds = rawState.guilds.map((guild) => {
      if (!guild || typeof guild !== "object") return guild;
      if (!Array.isArray(guild.channels)) return guild;
      let channelsChanged = false;
      const nextChannels = guild.channels.map((channel) => {
        if (!channel || typeof channel !== "object") return channel;
        const filtered = xmppFilterMessagesForStorage(channel.messages);
        if (filtered === channel.messages) return channel;
        channelsChanged = true;
        return { ...channel, messages: filtered };
      });
      if (!channelsChanged) return guild;
      return { ...guild, channels: nextChannels };
    });
  }
  return snapshot;
}
