(function initXep0384MessageCrypto(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_MESSAGE_CRYPTO) return;

  async function xmppOmemoEncryptPlaintextContent(plaintext, {
    arrayBufferToBase64,
    concatArrayBuffers
  } = {}) {
    if (typeof arrayBufferToBase64 !== "function" || typeof concatArrayBuffers !== "function") return null;
    if (!globalThis.crypto?.subtle) return null;

    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 128 }, true, ["encrypt", "decrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext || "");
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, encoded);
    const encryptedBytes = new Uint8Array(encrypted);
    const tagLength = 16;
    const ciphertext = encryptedBytes.slice(0, Math.max(0, encryptedBytes.length - tagLength));
    const tag = encryptedBytes.slice(encryptedBytes.length - tagLength);
    const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));
    const tagBuffer = tag.byteLength > 0
      ? tag.buffer.slice(tag.byteOffset, tag.byteOffset + tag.byteLength)
      : new ArrayBuffer(0);
    const keyAndTag = concatArrayBuffers(rawKey.buffer, tagBuffer);

    return {
      keyAndTag,
      ivBase64: arrayBufferToBase64(iv.buffer),
      payloadBase64: arrayBufferToBase64(ciphertext.buffer)
    };
  }

  globalScope.SHITCORD67_XEP_0384_MESSAGE_CRYPTO = Object.freeze({
    xmppOmemoEncryptPlaintextContent
  });
})(typeof window !== "undefined" ? window : globalThis);
