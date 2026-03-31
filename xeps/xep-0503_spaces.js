/* XEP-0503 (Draft): Spaces local registry with room + hierarchy metadata. */

const XEP_0503_STORAGE_KEY = "s67:xep-0503:spaces";
const XEP_0503_SERVICE_CACHE = new Map();
const XEP_0503_SERVICE_IN_FLIGHT = new Map();
const XEP_0503_SPACE_NODE_CACHE = new Map();
const XEP_0503_SPACE_NODE_IN_FLIGHT = new Map();
const XEP_0503_SERVICE_TTL_MS = 10 * 60 * 1000;
const XEP_0503_NODE_TTL_MS = 10 * 60 * 1000;

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

function spaceIdFromServiceNode(serviceJid = "", node = "") {
  const jid = (serviceJid || "").toString().trim().toLowerCase();
  const nodeId = (node || "").toString().trim();
  if (!jid || !nodeId) return "";
  return normalizeSpaceKey(`${jid}/${nodeId}`);
}

function parseDiscoFeatures(stanza) {
  if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
  return [...stanza.getElementsByTagName("feature")]
    .map((node) => (node.getAttribute("var") || "").toString().trim())
    .filter(Boolean);
}

function parseDiscoInfoFields(stanza) {
  if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
  return [...stanza.getElementsByTagName("field")]
    .map((node) => ({
      key: (node.getAttribute("var") || "").toString().trim().toLowerCase(),
      value: (node.getElementsByTagName("value")[0]?.textContent || "").toString().trim()
    }))
    .filter((entry) => entry.key && entry.value);
}

function parseSpaceMetaFromDiscoInfo(stanza) {
  const fields = parseDiscoInfoFields(stanza);
  const fieldValue = (patterns = []) => {
    const hit = fields.find((entry) => patterns.some((pattern) => pattern.test(entry.key)));
    return hit ? hit.value : "";
  };
  const identity = stanza?.getElementsByTagName?.("identity")?.[0] || null;
  const identityName = (identity?.getAttribute?.("name") || "").toString().trim();
  const title = fieldValue([/^pubsub#title$/, /^title$/, /^name$/]);
  const description = fieldValue([/^description$/, /^desc$/]);
  return {
    name: normalizeSpaceLabel(title || identityName),
    description: normalizeSpaceDescription(description)
  };
}

async function discoverXmppSpacesService({
  connection = null,
  prefs = {},
  force = false
} = {}, deps = {}) {
  if (!connection || typeof deps.$iq !== "function" || typeof deps.xmppSendIqPromiseFn !== "function") return null;
  const domain = typeof deps.xmppDomainFromJidFn === "function"
    ? deps.xmppDomainFromJidFn(prefs?.xmppJid || "")
    : "";
  if (!domain) return null;
  const cacheKey = domain.toLowerCase();
  const now = Date.now();
  const cached = XEP_0503_SERVICE_CACHE.get(cacheKey);
  if (!force && cached && cached.expiresAt > now) return cached.value;
  if (!force && XEP_0503_SERVICE_IN_FLIGHT.has(cacheKey)) {
    return XEP_0503_SERVICE_IN_FLIGHT.get(cacheKey);
  }
  const task = (async () => {
    const candidates = new Set([domain, `pubsub.${domain}`]);
    try {
      const itemsStanza = await deps.xmppSendIqPromiseFn(
        connection,
        deps.$iq({ type: "get", to: domain }).c("query", { xmlns: "http://jabber.org/protocol/disco#items" }),
        7000
      );
      [...itemsStanza.getElementsByTagName("item")].forEach((node) => {
        const jid = (node.getAttribute("jid") || "").toString().trim();
        if (jid) candidates.add(jid);
      });
    } catch {
      // Ignore discovery failures.
    }
    const namespace = (deps.XMPP_SPACES_NAMESPACE || "urn:xmpp:spaces:0").toString();
    const checks = [...candidates].slice(0, 18);
    for (const jid of checks) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const infoStanza = await deps.xmppSendIqPromiseFn(
          connection,
          deps.$iq({ type: "get", to: jid }).c("query", { xmlns: "http://jabber.org/protocol/disco#info" }),
          7000
        );
        const features = parseDiscoFeatures(infoStanza);
        if (features.includes(namespace)) {
          return jid;
        }
      } catch {
        // Ignore candidates that error.
      }
    }
    return null;
  })()
    .then((value) => {
      XEP_0503_SERVICE_CACHE.set(cacheKey, {
        value,
        expiresAt: Date.now() + XEP_0503_SERVICE_TTL_MS
      });
      return value;
    })
    .finally(() => {
      XEP_0503_SERVICE_IN_FLIGHT.delete(cacheKey);
    });
  XEP_0503_SERVICE_IN_FLIGHT.set(cacheKey, task);
  return task;
}

async function fetchXmppSpacesNodes({
  connection = null,
  serviceJid = "",
  force = false
} = {}, deps = {}) {
  if (!connection || !serviceJid || typeof deps.$iq !== "function" || typeof deps.xmppSendIqPromiseFn !== "function") return [];
  const cacheKey = `${serviceJid}`.toLowerCase();
  const now = Date.now();
  const cached = XEP_0503_SPACE_NODE_CACHE.get(cacheKey);
  if (!force && cached && cached.expiresAt > now) return cached.value || [];
  if (!force && XEP_0503_SPACE_NODE_IN_FLIGHT.has(cacheKey)) {
    return XEP_0503_SPACE_NODE_IN_FLIGHT.get(cacheKey);
  }
  const task = (async () => {
    try {
      const stanza = await deps.xmppSendIqPromiseFn(
        connection,
        deps.$iq({ type: "get", to: serviceJid }).c("query", { xmlns: "http://jabber.org/protocol/disco#items" }),
        7000
      );
      const rawNodes = [...stanza.getElementsByTagName("item")]
        .map((node) => {
          const nodeId = (node.getAttribute("node") || "").toString().trim();
          if (!nodeId) return null;
          const name = (node.getAttribute("name") || "").toString().trim();
          return {
            node: nodeId,
            name,
            spaceId: spaceIdFromServiceNode(serviceJid, nodeId)
          };
        })
        .filter(Boolean);
      const namespace = (deps.XMPP_SPACES_NAMESPACE || "urn:xmpp:spaces:0").toString();
      const annotated = [];
      for (const entry of rawNodes.slice(0, 40)) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const infoStanza = await deps.xmppSendIqPromiseFn(
            connection,
            deps.$iq({ type: "get", to: serviceJid }).c("query", {
              xmlns: "http://jabber.org/protocol/disco#info",
              node: entry.node
            }),
            7000
          );
          const fields = parseDiscoInfoFields(infoStanza);
          const typeField = fields.find((field) => field.key === "pubsub#type");
          if (typeField && typeField.value && typeField.value !== namespace) continue;
          const meta = parseSpaceMetaFromDiscoInfo(infoStanza);
          annotated.push({
            ...entry,
            name: meta.name || entry.name,
            description: meta.description || ""
          });
        } catch {
          annotated.push(entry);
        }
      }
      return annotated;
    } catch {
      return [];
    }
  })()
    .then((value) => {
      XEP_0503_SPACE_NODE_CACHE.set(cacheKey, {
        value,
        expiresAt: Date.now() + XEP_0503_NODE_TTL_MS
      });
      return value;
    })
    .finally(() => {
      XEP_0503_SPACE_NODE_IN_FLIGHT.delete(cacheKey);
    });
  XEP_0503_SPACE_NODE_IN_FLIGHT.set(cacheKey, task);
  return task;
}

async function fetchXmppSpaceNodeItems({
  connection = null,
  serviceJid = "",
  node = ""
} = {}, deps = {}) {
  if (!connection || !serviceJid || !node || typeof deps.$iq !== "function" || typeof deps.xmppSendIqPromiseFn !== "function") return [];
  const stanza = await deps.xmppSendIqPromiseFn(
    connection,
    deps.$iq({ type: "get", to: serviceJid })
      .c("pubsub", { xmlns: deps.XMPP_PUBSUB_NAMESPACE || "http://jabber.org/protocol/pubsub" })
      .c("items", { node }),
    7000
  );
  if (typeof deps.parseXmppBookmarksFn === "function") {
    return deps.parseXmppBookmarksFn(stanza);
  }
  if (typeof deps.parseXmppBookmarksViaXepFn === "function") {
    return deps.parseXmppBookmarksViaXepFn(stanza);
  }
  return [];
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
  parseSpaceMetadataFromBookmarkExtensions,
  discoverXmppSpacesService,
  fetchXmppSpacesNodes,
  fetchXmppSpaceNodeItems,
  parseSpaceMetaFromDiscoInfo,
  spaceIdFromServiceNode
};
