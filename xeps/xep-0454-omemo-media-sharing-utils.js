(function initXep0454OmemoMediaSharingUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0454_UTILS) return;

  function bytesToHex(bytes) {
    const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    return [...input].map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  function hexToBytes(hex = "") {
    const cleaned = (hex || "").toString().trim().toLowerCase();
    if (!cleaned || cleaned.length % 2 !== 0) return new Uint8Array();
    const out = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
      out[i / 2] = Number.parseInt(cleaned.slice(i, i + 2), 16);
    }
    return out;
  }

  function isAesgcmUrl(value) {
    return /^aesgcm:\/\//i.test((value || "").toString().trim());
  }

  function buildAesgcmUrl(httpsUrl, ivBytes, keyBytes) {
    const url = (httpsUrl || "").toString().trim();
    if (!/^https:\/\//i.test(url)) return "";
    const ivHex = bytesToHex(ivBytes);
    const keyHex = bytesToHex(keyBytes);
    if (ivHex.length !== 24 || keyHex.length !== 64) return "";
    return `aesgcm://${url.slice("https://".length)}#${ivHex}${keyHex}`;
  }

  function parseAesgcmUrl(value = "") {
    const raw = (value || "").toString().trim();
    if (!/^aesgcm:\/\//i.test(raw)) return null;
    const [schemePart, fragment = ""] = raw.split("#");
    const hex = fragment.trim().toLowerCase();
    if (hex.length !== 88) return null;
    const ivHex = hex.slice(0, 24);
    const keyHex = hex.slice(24);
    const iv = hexToBytes(ivHex);
    const key = hexToBytes(keyHex);
    if (iv.length !== 12 || key.length !== 32) return null;
    const httpsUrl = `https://${schemePart.replace(/^aesgcm:\/\//i, "")}`;
    return { httpsUrl, iv, key };
  }

  function extractAesgcmUrls(text = "") {
    const urls = [];
    const regex = /aesgcm:\/\/[^\s]+/gi;
    const raw = (text || "").toString();
    let match = regex.exec(raw);
    while (match) {
      const candidate = match[0];
      if (parseAesgcmUrl(candidate)) urls.push(candidate);
      match = regex.exec(raw);
    }
    return [...new Set(urls)];
  }

  function stripAesgcmUrls(text = "") {
    const raw = (text || "").toString();
    return raw
      .split(/\r?\n/)
      .filter((line) => !isAesgcmUrl(line.trim()))
      .join("\n")
      .trim();
  }

  globalScope.SHITCORD67_XEP_0454_UTILS = Object.freeze({
    bytesToHex,
    hexToBytes,
    isAesgcmUrl,
    buildAesgcmUrl,
    parseAesgcmUrl,
    extractAesgcmUrls,
    stripAesgcmUrls
  });
})(typeof window !== "undefined" ? window : globalThis);
