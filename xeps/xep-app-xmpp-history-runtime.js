/*
 * XMPP conversation history helpers extracted from app.js.
 */

(function initAppXmppHistoryRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_APP_XMPP_HISTORY_RUNTIME) return;

  function activeConversationHistoryState(conversation, {
    getPreferencesFn = () => ({}),
    getCurrentAccountFn = () => null,
    xmppPeerJidForDmThreadFn = () => "",
    xmppBareJidFn = () => "",
    ensureXmppDmMamStateFn = () => null,
    ensureXmppMamStateFn = () => null
  } = {}) {
    if (!conversation || getPreferencesFn().relayMode !== "xmpp") return null;
    if (conversation.type === "dm" && conversation.thread) {
      const peerJid = xmppPeerJidForDmThreadFn(conversation.thread, getCurrentAccountFn());
      const barePeer = xmppBareJidFn(peerJid);
      if (!barePeer) return null;
      return ensureXmppDmMamStateFn(barePeer);
    }
    if (conversation.type === "channel" && conversation.channel?.xmppRoomJid) {
      const roomJid = xmppBareJidFn(conversation.channel.xmppRoomJid);
      if (!roomJid) return null;
      return ensureXmppMamStateFn(roomJid);
    }
    return null;
  }

  globalScope.SHITCORD67_APP_XMPP_HISTORY_RUNTIME = Object.freeze({
    activeConversationHistoryState
  });
})(typeof window !== "undefined" ? window : globalThis);
