(function initXep0384OmemoCryptoUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_CRYPTO_UTILS) return;

  function base64ToArrayBuffer(base64) {
    const cleaned = (base64 || "").toString().trim();
    if (!cleaned) return new ArrayBuffer(0);
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function arrayBufferToBase64(buffer) {
    if (!buffer) return "";
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function concatArrayBuffers(first, second) {
    const a = first ? new Uint8Array(first) : new Uint8Array(0);
    const b = second ? new Uint8Array(second) : new Uint8Array(0);
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out.buffer;
  }

  globalScope.SHITCORD67_XEP_0384_CRYPTO_UTILS = Object.freeze({
    base64ToArrayBuffer,
    arrayBufferToBase64,
    concatArrayBuffers
  });
})(typeof window !== "undefined" ? window : globalThis);
