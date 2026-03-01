(function initXep0384Identity(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_IDENTITY) return;

  async function xmppOmemoEnsureLocalIdentityCore(ownBare, {
    runtimeAvailableFn,
    storeForAccountFn
  } = {}) {
    if (typeof runtimeAvailableFn !== "function" || typeof storeForAccountFn !== "function") return null;
    if (!runtimeAvailableFn()) return null;
    const store = storeForAccountFn(ownBare);
    if (!store) return null;
    let registrationId = await store.getLocalRegistrationId();
    if (!registrationId) {
      registrationId = globalThis.libsignal.KeyHelper.generateRegistrationId();
      await store.setLocalRegistrationId(registrationId);
    }
    try {
      await store.getIdentityKeyPair();
    } catch {
      const identityKeyPair = await globalThis.libsignal.KeyHelper.generateIdentityKeyPair();
      await store.setIdentityKeyPair(identityKeyPair);
    }
    return store;
  }

  globalScope.SHITCORD67_XEP_0384_IDENTITY = Object.freeze({
    xmppOmemoEnsureLocalIdentityCore
  });
})(typeof window !== "undefined" ? window : globalThis);
