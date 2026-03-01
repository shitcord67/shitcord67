/* XEP-0503 (Draft): Spaces - minimal local registry for XMPP Spaces mapping. */

const XEP_0503_STORAGE_KEY = "s67:xep-0503:spaces";

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadSpaceRegistry() {
  if (typeof localStorage === "undefined") return { spaces: {} };
  const raw = localStorage.getItem(XEP_0503_STORAGE_KEY);
  const parsed = safeParseJson(raw, null);
  if (!parsed || typeof parsed !== "object") return { spaces: {} };
  if (!parsed.spaces || typeof parsed.spaces !== "object") parsed.spaces = {};
  return parsed;
}

function saveSpaceRegistry(registry) {
  if (typeof localStorage === "undefined") return;
  const payload = registry && typeof registry === "object" ? registry : { spaces: {} };
  localStorage.setItem(XEP_0503_STORAGE_KEY, JSON.stringify(payload));
}

function registerSpaceRecord({
  spaceId = "",
  roomJid = "",
  name = "",
  description = "",
  autojoin = null,
  updatedAt = Date.now()
} = {}) {
  const key = (spaceId || "").toString().trim();
  if (!key) return false;
  const registry = loadSpaceRegistry();
  const space = registry.spaces[key] && typeof registry.spaces[key] === "object"
    ? registry.spaces[key]
    : { spaceId: key, rooms: {} };
  const roomKey = (roomJid || "").toString().trim().toLowerCase();
  if (roomKey) {
    const existing = space.rooms[roomKey] && typeof space.rooms[roomKey] === "object"
      ? space.rooms[roomKey]
      : {};
    space.rooms[roomKey] = {
      roomJid: roomKey,
      name: name ? String(name) : (existing.name || ""),
      description: description ? String(description) : (existing.description || ""),
      autojoin: typeof autojoin === "boolean" ? autojoin : (typeof existing.autojoin === "boolean" ? existing.autojoin : null),
      updatedAt: Number(updatedAt) || Date.now()
    };
  }
  registry.spaces[key] = space;
  saveSpaceRegistry(registry);
  return true;
}

function listSpaceRecords(spaceId = "") {
  const key = (spaceId || "").toString().trim();
  const registry = loadSpaceRegistry();
  if (!key) {
    return Object.values(registry.spaces || {}).map((space) => ({
      ...space,
      rooms: space.rooms ? Object.values(space.rooms) : []
    }));
  }
  const space = registry.spaces?.[key];
  if (!space) return [];
  return [{
    ...space,
    rooms: space.rooms ? Object.values(space.rooms) : []
  }];
}

globalThis.SHITCORD67_XEP_0503_SPACES = {
  registerSpaceRecord,
  listSpaceRecords
};
