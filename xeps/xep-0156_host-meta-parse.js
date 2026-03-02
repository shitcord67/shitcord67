(function initXep0156HostMetaParse(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0156_HOST_META_PARSE) return;

  function normalizeXmppWsUrl(value = "") {
    const raw = (value || "").toString().trim();
    if (!raw) return "";
    if (!/^wss?:\/\//i.test(raw)) return "";
    try {
      const parsed = new URL(raw);
      parsed.hash = "";
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return "";
    }
  }

  function relTokenSet(value) {
    const tokens = new Set();
    const append = (item) => {
      const raw = (item || "").toString().trim().toLowerCase();
      if (!raw) return;
      raw.split(/[\s,]+/).map((token) => token.trim()).filter(Boolean).forEach((token) => {
        tokens.add(token);
      });
    };
    if (Array.isArray(value)) {
      value.forEach((item) => append(item));
      return tokens;
    }
    append(value);
    return tokens;
  }

  function hasXmppWsRel(entry = {}) {
    const tokens = relTokenSet(entry.rel || entry.rels || "");
    if (tokens.size === 0) return false;
    if (tokens.has("urn:xmpp:alt-connections:websocket")) return true;
    if (tokens.has("xmpp:alt-connections:websocket")) return true;
    if (tokens.has("xmpp:alt-connections:ws")) return true;
    if (tokens.has("urn:xmpp:alt-connections")) {
      const type = (entry.type || "").toString().trim().toLowerCase();
      if (type.includes("websocket")) return true;
      if (type === "ws" || type === "wss") return true;
    }
    return false;
  }

  function extractXmppAltConnectionUrls(links) {
    if (!Array.isArray(links)) return [];
    const urls = [];
    links.forEach((entry) => {
      if (!entry || typeof entry !== "object") return;
      if (!hasXmppWsRel(entry)) return;
      const href = normalizeXmppWsUrl(entry.href || entry.url || entry.template || "");
      if (!href) return;
      if (!urls.includes(href)) urls.push(href);
    });
    return urls;
  }

  function flattenHostMetaJsonLinks(rawLinks) {
    if (Array.isArray(rawLinks)) return rawLinks;
    if (!rawLinks || typeof rawLinks !== "object") return [];
    const flattened = [];
    Object.entries(rawLinks).forEach(([rel, value]) => {
      const relValue = (rel || "").toString().trim();
      if (!relValue) return;
      const pushEntry = (entry) => {
        if (!entry || typeof entry !== "object") return;
        flattened.push({
          rel: entry.rel || relValue,
          rels: entry.rels || "",
          type: entry.type || "",
          href: entry.href || "",
          url: entry.url || "",
          template: entry.template || ""
        });
      };
      if (Array.isArray(value)) {
        value.forEach((entry) => pushEntry(entry));
        return;
      }
      if (typeof value === "string") {
        flattened.push({ rel: relValue, href: value });
        return;
      }
      pushEntry(value);
    });
    return flattened;
  }

  function parseXmppHostMetaXml(rawXml) {
    const xml = (rawXml || "").toString().trim();
    if (!xml) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      if (!doc) return [];
      const links = [...doc.getElementsByTagName("*")]
        .filter((node) => (node?.localName || node?.nodeName || "").toString().trim().toLowerCase() === "link")
        .map((node) => ({
        rel: node.getAttribute("rel") || "",
        rels: node.getAttribute("rels") || "",
        type: node.getAttribute("type") || "",
        href: node.getAttribute("href") || ""
      }));
      return extractXmppAltConnectionUrls(links);
    } catch {
      return [];
    }
  }

  function parseXmppHostMetaJson(payload) {
    const data = payload && typeof payload === "object" ? payload : {};
    const links = flattenHostMetaJsonLinks(data.links);
    return extractXmppAltConnectionUrls(links);
  }

  globalScope.SHITCORD67_XEP_0156_HOST_META_PARSE = Object.freeze({
    extractXmppAltConnectionUrls,
    flattenHostMetaJsonLinks,
    parseXmppHostMetaXml,
    parseXmppHostMetaJson
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0156_host-meta-parse", globalScope.SHITCORD67_XEP_0156_HOST_META_PARSE);
  }
})(typeof window !== "undefined" ? window : globalThis);
