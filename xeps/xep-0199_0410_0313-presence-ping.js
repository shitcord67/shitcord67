(function initXep0199_0410_0313PresencePing(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0199_0410_0313_PRESENCE_PING) return;

  function xmppHistoryStatusLabel(mamState, { scope = "muc", target = "" } = {}) {
    if (!mamState) return "";
    const page = Math.max(1, (Number(mamState.pagesLoaded) || 0) + 1);
    const isDm = scope === "dm";
    const targetLabel = isDm
      ? `DM ${target ? `(${target})` : ""}`
      : `Room ${target ? `(${target})` : ""}`;
    if (mamState.loading) {
      if ((Number(mamState.pagesLoaded) || 0) <= 0) return `Syncing recent history… ${targetLabel}`;
      return `Syncing older messages (page ${page})… ${targetLabel}`;
    }
    if ((Number(mamState.pagesLoaded) || 0) <= 0 && !mamState.complete) {
      return `Recent history not loaded yet. ${targetLabel}`;
    }
    if (mamState.complete) {
      const loaded = Math.max(0, Number(mamState.pagesLoaded) || 0);
      return `History synced (${loaded} page${loaded === 1 ? "" : "s"}).`;
    }
    return `History synced through page ${Math.max(1, Number(mamState.pagesLoaded) || 1)}.`;
  }

  function clearXmppPingLoop(deps = {}) {
    const timer = typeof deps.getPingTimerFn === "function" ? deps.getPingTimerFn() : null;
    if (timer) {
      clearInterval(timer);
      if (typeof deps.setPingTimerFn === "function") deps.setPingTimerFn(null);
    }
    if (typeof deps.setPingOutstandingIdFn === "function") deps.setPingOutstandingIdFn("");
    if (typeof deps.setPingOutstandingAtFn === "function") deps.setPingOutstandingAtFn(0);
  }

  function sendXmppPing(connection, { timeoutMs = 30_000 } = {}, deps = {}) {
    if (!connection || typeof connection.sendIQ !== "function" || typeof deps.$iq !== "function") return false;
    const outstandingId = typeof deps.getPingOutstandingIdFn === "function" ? deps.getPingOutstandingIdFn() : "";
    if (outstandingId) return true;
    const id = `s67-ping-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
    if (typeof deps.setPingOutstandingIdFn === "function") deps.setPingOutstandingIdFn(id);
    if (typeof deps.setPingOutstandingAtFn === "function") deps.setPingOutstandingAtFn(Date.now());
    const pingIq = deps.$iq({ type: "get", id }).c("ping", { xmlns: "urn:xmpp:ping" });
    connection.sendIQ(
      pingIq,
      () => {
        const live = typeof deps.getPingOutstandingIdFn === "function" ? deps.getPingOutstandingIdFn() : "";
        if (live !== id) return;
        if (typeof deps.setPingOutstandingIdFn === "function") deps.setPingOutstandingIdFn("");
        if (typeof deps.setPingOutstandingAtFn === "function") deps.setPingOutstandingAtFn(0);
      },
      (errorStanza) => {
        const live = typeof deps.getPingOutstandingIdFn === "function" ? deps.getPingOutstandingIdFn() : "";
        if (live !== id) return;
        if (typeof deps.setPingOutstandingIdFn === "function") deps.setPingOutstandingIdFn("");
        if (typeof deps.setPingOutstandingAtFn === "function") deps.setPingOutstandingAtFn(0);
        if (typeof deps.addXmppDebugEventFn === "function") {
          const serialize = typeof deps.xmppSerializePayloadFn === "function" ? deps.xmppSerializePayloadFn(errorStanza) : "";
          const trimRaw = typeof deps.trimXmppRawFn === "function" ? deps.trimXmppRawFn(serialize) : serialize;
          deps.addXmppDebugEventFn("warn", "XMPP ping failed", {
            id,
            error: trimRaw
          });
        }
      },
      timeoutMs
    );
    return true;
  }

  function startXmppPingLoop(connection, deps = {}) {
    const clearFn = typeof deps.clearXmppPingLoopFn === "function" ? deps.clearXmppPingLoopFn : () => clearXmppPingLoop(deps);
    clearFn();
    if (!connection || typeof connection.sendIQ !== "function" || typeof deps.$iq !== "function") return;
    const intervalMs = Math.max(5_000, Number(deps.intervalMs) || 30_000);
    const timer = setInterval(() => {
      const xmppConnection = typeof deps.getXmppConnectionFn === "function" ? deps.getXmppConnectionFn() : null;
      if (!xmppConnection || connection !== xmppConnection) {
        clearFn();
        return;
      }
      const relayStatus = typeof deps.getRelayStatusFn === "function" ? deps.getRelayStatusFn() : "";
      if (relayStatus !== "connected") return;
      if (typeof deps.sendXmppPingFn === "function") deps.sendXmppPingFn(connection);
      else sendXmppPing(connection, { timeoutMs: deps.timeoutMs }, deps);
    }, intervalMs);
    if (typeof deps.setPingTimerFn === "function") deps.setPingTimerFn(timer);
  }

  function clearXmppMucSelfPing(roomJid = "", deps = {}) {
    const bare = typeof deps.bareJidFn === "function" ? deps.bareJidFn(roomJid) : "";
    if (!bare) return;
    const map = deps.mucSelfPingStateByRoomJid;
    const state = map?.get?.(bare);
    if (state?.timerId) clearTimeout(state.timerId);
    map?.delete?.(bare);
  }

  function clearAllXmppMucSelfPings(deps = {}) {
    const map = deps.mucSelfPingStateByRoomJid;
    if (!map || typeof map.entries !== "function") return;
    for (const [roomJid, state] of map.entries()) {
      if (state?.timerId) clearTimeout(state.timerId);
      map.delete(roomJid);
    }
  }

  function xmppMucSelfPingTarget(roomJid = "", fallbackNick = "", deps = {}) {
    const bare = typeof deps.bareJidFn === "function" ? deps.bareJidFn(roomJid) : "";
    if (!bare) return "";
    const joinState = deps.mucJoinStateByRoomJid?.get?.(bare) || {};
    const account = typeof deps.getCurrentAccountFn === "function" ? deps.getCurrentAccountFn() : null;
    const sanitize = typeof deps.sanitizeChannelNameFn === "function"
      ? deps.sanitizeChannelNameFn
      : ((value, fallback) => (value || fallback || "user").toString());
    const fallback = sanitize(
      fallbackNick
        || joinState.nick
        || account?.username
        || "user",
      "user"
    );
    const nick = sanitize((joinState.nick || fallback).toString(), fallback);
    return nick ? `${bare}/${nick}` : "";
  }

  function scheduleXmppMucSelfPing(roomJid = "", { immediate = false, reason = "" } = {}, deps = {}) {
    const bare = typeof deps.bareJidFn === "function" ? deps.bareJidFn(roomJid) : "";
    if (!bare) return false;
    const xmppConnection = typeof deps.getXmppConnectionFn === "function" ? deps.getXmppConnectionFn() : null;
    const relayStatus = typeof deps.getRelayStatusFn === "function" ? deps.getRelayStatusFn() : "";
    if (!xmppConnection || relayStatus !== "connected") {
      if (typeof deps.clearXmppMucSelfPingFn === "function") deps.clearXmppMucSelfPingFn(bare);
      else clearXmppMucSelfPing(bare, deps);
      return false;
    }
    const map = deps.mucSelfPingStateByRoomJid;
    const next = map?.get?.(bare) || {
      timerId: 0,
      inFlightId: "",
      failureCount: 0,
      lastSuccessAt: 0,
      lastFailureAt: 0,
      lastRejoinAt: 0
    };
    if (next.timerId) clearTimeout(next.timerId);
    const intervalMs = Math.max(5_000, Number(deps.mucSelfPingIntervalMs) || 60_000);
    const delay = immediate ? 3500 : (intervalMs + Math.floor(Math.random() * 6000));
    next.timerId = setTimeout(() => {
      const current = map?.get?.(bare);
      if (!current) return;
      current.timerId = 0;
      map?.set?.(bare, current);
      if (typeof deps.sendXmppMucSelfPingFn === "function") deps.sendXmppMucSelfPingFn(bare, { reason: reason || "scheduled" });
    }, Math.max(1200, delay));
    map?.set?.(bare, next);
    return true;
  }

  function sendXmppMucSelfPing(roomJid = "", { reason = "manual" } = {}, deps = {}) {
    const bare = typeof deps.bareJidFn === "function" ? deps.bareJidFn(roomJid) : "";
    const xmppConnection = typeof deps.getXmppConnectionFn === "function" ? deps.getXmppConnectionFn() : null;
    const relayStatus = typeof deps.getRelayStatusFn === "function" ? deps.getRelayStatusFn() : "";
    if (!bare || !xmppConnection || relayStatus !== "connected" || typeof deps.$iq !== "function") return false;
    const joinState = deps.mucJoinStateByRoomJid?.get?.(bare) || {};
    if (joinState.pending) {
      if (typeof deps.scheduleXmppMucSelfPingFn === "function") {
        deps.scheduleXmppMucSelfPingFn(bare, { immediate: false, reason: "pending" });
      }
      return false;
    }
    const target = typeof deps.xmppMucSelfPingTargetFn === "function"
      ? deps.xmppMucSelfPingTargetFn(bare)
      : xmppMucSelfPingTarget(bare, "", deps);
    if (!target) return false;
    const map = deps.mucSelfPingStateByRoomJid;
    const state = map?.get?.(bare) || {
      timerId: 0,
      inFlightId: "",
      failureCount: 0,
      lastSuccessAt: 0,
      lastFailureAt: 0,
      lastRejoinAt: 0
    };
    if (state.inFlightId) return true;
    const pingId = `s67-muc-ping-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 7)}`;
    state.inFlightId = pingId;
    map?.set?.(bare, state);
    const pingIq = deps.$iq({ type: "get", to: target, id: pingId }).c("ping", { xmlns: "urn:xmpp:ping" });
    const timeoutMs = Math.max(2000, Number(deps.mucSelfPingTimeoutMs) || 15000);
    xmppConnection.sendIQ(
      pingIq,
      () => {
        const live = map?.get?.(bare);
        if (!live || live.inFlightId !== pingId) return;
        live.inFlightId = "";
        live.failureCount = 0;
        live.lastSuccessAt = Date.now();
        map?.set?.(bare, live);
        if (typeof deps.scheduleXmppMucSelfPingFn === "function") deps.scheduleXmppMucSelfPingFn(bare, { reason: "ok" });
      },
      (errorStanza) => {
        const live = map?.get?.(bare);
        if (!live || live.inFlightId !== pingId) return;
        live.inFlightId = "";
        live.lastFailureAt = Date.now();
        live.failureCount = (Number(live.failureCount) || 0) + 1;
        const error = typeof deps.xmppStanzaErrorDetailsFn === "function"
          ? (deps.xmppStanzaErrorDetailsFn(errorStanza) || { condition: "", text: "" })
          : { condition: "", text: "" };
        if (typeof deps.addXmppDebugEventFn === "function") {
          deps.addXmppDebugEventFn("warn", "XMPP MUC self-ping failed", {
            roomJid: bare,
            target,
            reason,
            condition: error.condition || "",
            text: error.text || "",
            failures: live.failureCount
          });
        }
        const rejoinAfterFailures = Math.max(1, Number(deps.rejoinAfterFailures) || 3);
        if (live.failureCount >= rejoinAfterFailures) {
          const now = Date.now();
          const cooldownMs = Math.max(1000, Number(deps.rejoinCooldownMs) || 90_000);
          const sinceRejoin = now - (Number(live.lastRejoinAt) || 0);
          if (sinceRejoin >= cooldownMs) {
            live.failureCount = 0;
            live.lastRejoinAt = now;
            map?.set?.(bare, live);
            const roomToken = (joinState.roomToken || `xmpp:${bare}`).toString().trim() || `xmpp:${bare}`;
            if (typeof deps.addXmppDebugEventFn === "function") {
              deps.addXmppDebugEventFn("presence", "Rejoining room after MUC self-ping failure", {
                roomJid: bare,
                roomToken,
                condition: error.condition || ""
              });
            }
            if (typeof deps.joinXmppRoomFn === "function") {
              deps.joinXmppRoomFn(roomToken, typeof deps.getCurrentAccountFn === "function" ? deps.getCurrentAccountFn() : null);
            }
            if (typeof deps.scheduleXmppMucSelfPingFn === "function") {
              deps.scheduleXmppMucSelfPingFn(bare, { immediate: true, reason: "rejoin-after-self-ping-failure" });
            }
            return;
          }
        }
        map?.set?.(bare, live);
        if (typeof deps.scheduleXmppMucSelfPingFn === "function") deps.scheduleXmppMucSelfPingFn(bare, { reason: "failed" });
      },
      timeoutMs
    );
    return true;
  }

  function xmppPresenceShowToPresence(node, deps = {}) {
    const xmppNodeTextFn = deps.xmppNodeTextFn || ((item) => (item?.textContent || "").toString());
    const show = (xmppNodeTextFn(node) || "").toString().trim().toLowerCase();
    if (show === "xa" || show === "away") return "idle";
    if (show === "dnd") return "dnd";
    if (show === "chat") return "online";
    return "online";
  }

  globalScope.SHITCORD67_XEP_0199_0410_0313_PRESENCE_PING = Object.freeze({
    xmppHistoryStatusLabel,
    clearXmppPingLoop,
    sendXmppPing,
    startXmppPingLoop,
    clearXmppMucSelfPing,
    clearAllXmppMucSelfPings,
    xmppMucSelfPingTarget,
    scheduleXmppMucSelfPing,
    sendXmppMucSelfPing,
    xmppPresenceShowToPresence
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register(
      "xep-0199_0410_0313-presence-ping",
      globalScope.SHITCORD67_XEP_0199_0410_0313_PRESENCE_PING
    );
  }
})(typeof window !== "undefined" ? window : globalThis);
