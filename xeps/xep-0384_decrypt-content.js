(function initXep0384DecryptContent(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_DECRYPT_CONTENT) return;

  async function xmppOmemoDecryptContentFromKeyAndPayload(keyAndTag, payload, {
    base64ToArrayBuffer,
    concatArrayBuffers
  } = {}) {
    if (!keyAndTag || !payload) return null;
    if (typeof base64ToArrayBuffer !== "function" || typeof concatArrayBuffers !== "function") return null;
    if (!globalThis.crypto?.subtle) return null;

    const keyBytes = new Uint8Array(keyAndTag);
    if (keyBytes.length < 16) return null;
    const keyBytesPart = keyBytes.slice(0, 16);
    const tagBytes = keyBytes.slice(16);
    const iv = base64ToArrayBuffer(payload.iv);
    const ciphertext = base64ToArrayBuffer(payload.payload);
    const tagBuffer = tagBytes.byteLength > 0
      ? tagBytes.buffer.slice(tagBytes.byteOffset, tagBytes.byteOffset + tagBytes.byteLength)
      : new ArrayBuffer(0);
    const ciphertextAndTag = concatArrayBuffers(ciphertext, tagBuffer);
    const importedKey = await crypto.subtle.importKey("raw", keyBytesPart, "AES-GCM", false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv), tagLength: 128 }, importedKey, ciphertextAndTag);
    return new TextDecoder().decode(decrypted);
  }

  globalScope.SHITCORD67_XEP_0384_DECRYPT_CONTENT = Object.freeze({
    xmppOmemoDecryptContentFromKeyAndPayload
  });
})(typeof window !== "undefined" ? window : globalThis);
