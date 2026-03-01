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

  function extractXmppAltConnectionUrls(links) {
    if (!Array.isArray(links)) return [];
    const urls = [];
    links.forEach((entry) => {
      if (!entry || typeof entry !== "object") return;
      const rel = (entry.rel || "").toString().toLowerCase();
      if (!rel.includes("xmpp:alt-connections") || !rel.includes("websocket")) return;
      const href = normalizeXmppWsUrl(entry.href || entry.url || "");
      if (!href) return;
      if (!urls.includes(href)) urls.push(href);
    });
    return urls;
  }

  function parseXmppHostMetaXml(rawXml) {
    const xml = (rawXml || "").toString().trim();
    if (!xml) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      if (!doc) return [];
      const links = [...doc.getElementsByTagName("Link")].map((node) => ({
        rel: node.getAttribute("rel") || "",
        href: node.getAttribute("href") || ""
      }));
      return extractXmppAltConnectionUrls(links);
    } catch {
      return [];
    }
  }

  function parseXmppHostMetaJson(payload) {
    const data = payload && typeof payload === "object" ? payload : {};
    const links = Array.isArray(data.links) ? data.links : [];
    return extractXmppAltConnectionUrls(links);
  }

  globalScope.SHITCORD67_XEP_0156_HOST_META_PARSE = Object.freeze({
    extractXmppAltConnectionUrls,
    parseXmppHostMetaXml,
    parseXmppHostMetaJson
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0156_host-meta-parse", globalScope.SHITCORD67_XEP_0156_HOST_META_PARSE);
  }
})(typeof window !== "undefined" ? window : globalThis);
