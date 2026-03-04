/* XEP-0503 (Draft): Spaces local registry with room + hierarchy metadata. */

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

function normalizeSpaceKey(value = "") {
  return (value || "")
    .toString()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9:/_.-]/g, "")
    .slice(0, 160);
}

function normalizeSpaceLabel(value = "", fallback = "") {
  const text = (value || "").toString().replace(/\s+/g, " ").trim().slice(0, 120);
  return text || (fallback || "").toString().replace(/\s+/g, " ").trim().slice(0, 120);
}

function normalizeSpaceDescription(value = "") {
  return (value || "").toString().replace(/\s+/g, " ").trim().slice(0, 280);
}

function parseSpaceMetadataFromBookmarkExtensions(extensionsXml = "", {
  fallbackJid = ""
} = {}) {
  const xmlText = (extensionsXml || "").toString().trim();
  const fallbackNode = (fallbackJid || "").toString().trim().toLowerCase().split("@")[0] || "";
  const result = {
    spaceId: "",
    parentSpaceId: "",
    spaceName: "",
    spaceDescription: ""
  };
  if (!xmlText || typeof DOMParser === "undefined") return result;
  let doc = null;
  try {
    doc = new DOMParser().parseFromString(xmlText, "application/xml");
  } catch {
    return result;
  }
  const root = doc?.documentElement || null;
  if (!root || (root.nodeName || "").toLowerCase() === "parsererror") return result;
  const fields = [];
  const fieldNodes = root.getElementsByTagName("field");
  for (const field of fieldNodes) {
    const key = (field.getAttribute("var") || "").toString().trim().toLowerCase();
    if (!key) continue;
    const valueNode = field.getElementsByTagName("value")[0] || null;
    const value = (valueNode?.textContent || "").toString().trim();
    if (!value) continue;
    fields.push({ key, value });
  }
  const nodeValueByKey = new Map();
  const allNodes = root.getElementsByTagName("*");
  for (const node of allNodes) {
    const key = (node.localName || node.nodeName || "").toString().trim().toLowerCase();
    if (!key || !node.textContent) continue;
    const value = node.textContent.toString().trim();
    if (!value || nodeValueByKey.has(key)) continue;
    nodeValueByKey.set(key, value);
  }
  const takeField = (patterns = []) => {
    const hit = fields.find((entry) => patterns.some((pattern) => pattern.test(entry.key)));
    return hit ? hit.value : "";
  };
  const takeNode = (keys = []) => {
    for (const key of keys) {
      if (nodeValueByKey.has(key)) return nodeValueByKey.get(key) || "";
    }
    return "";
  };
  const roomHint = fallbackNode || "room";
  const rawSpaceId = takeField([
    /^space[_:-]?id$/,
    /^bookmark[_:-]?space[_:-]?id$/,
    /^urn:xmpp:spaces:.*space[_:-]?id$/,
    /^space$/
  ]) || takeNode(["space-id", "spaceid", "space", "group", "section", "folder"]);
  const rawParentId = takeField([
    /^parent[_:-]?space[_:-]?id$/,
    /^space[_:-]?parent[_:-]?id$/,
    /^parent$/,
    /^space[_:-]?parent$/
  ]) || takeNode(["parent-space-id", "parentspaceid", "parent", "space-parent"]);
  const rawName = takeField([
    /^space[_:-]?(name|title|label)$/,
    /^group[_:-]?name$/,
    /^section[_:-]?name$/
  ]) || takeNode(["space-name", "space-title", "group-name", "section-name"]);
  const rawDescription = takeField([
    /^space[_:-]?(description|desc|topic)$/
  ]) || takeNode(["space-description", "space-desc", "space-topic"]);
  result.spaceId = normalizeSpaceKey(rawSpaceId || roomHint);
  result.parentSpaceId = normalizeSpaceKey(rawParentId);
  result.spaceName = normalizeSpaceLabel(rawName);
  result.spaceDescription = normalizeSpaceDescription(rawDescription);
  return result;
}

function registerSpaceRecord({
  spaceId = "",
  parentSpaceId = "",
  spaceName = "",
  spaceDescription = "",
  roomJid = "",
  name = "",
  description = "",
  autojoin = null,
  updatedAt = Date.now()
} = {}) {
  const key = normalizeSpaceKey(spaceId);
  if (!key) return false;
  const registry = loadSpaceRegistry();
  const space = registry.spaces[key] && typeof registry.spaces[key] === "object"
    ? registry.spaces[key]
    : { spaceId: key, parentSpaceId: "", name: "", description: "", rooms: {} };
  const normalizedParent = normalizeSpaceKey(parentSpaceId);
  const normalizedSpaceName = normalizeSpaceLabel(spaceName, space.name || key.split(":").pop() || "space");
  const normalizedSpaceDescription = normalizeSpaceDescription(spaceDescription || space.description || "");
  if (normalizedParent && normalizedParent !== key) {
    space.parentSpaceId = normalizedParent;
  } else if (space.parentSpaceId == null) {
    space.parentSpaceId = "";
  }
  if (normalizedSpaceName) space.name = normalizedSpaceName;
  space.description = normalizedSpaceDescription;
  space.updatedAt = Number(updatedAt) || Date.now();
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
      spaceId: key,
      updatedAt: Number(updatedAt) || Date.now()
    };
  }
  registry.spaces[key] = space;
  saveSpaceRegistry(registry);
  return true;
}

function listSpaceRecords(spaceId = "") {
  const key = normalizeSpaceKey(spaceId);
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
  listSpaceRecords,
  normalizeSpaceKey,
  parseSpaceMetadataFromBookmarkExtensions
};
