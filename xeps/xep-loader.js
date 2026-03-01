(function initXepRegistry(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_REGISTRY) return;

  const modules = new Map();

  function normalizeName(name) {
    return (name || "").toString().trim().toLowerCase();
  }

  function register(name, api) {
    const key = normalizeName(name);
    if (!key || !api) return false;
    modules.set(key, api);
    return true;
  }

  function get(name) {
    const key = normalizeName(name);
    if (!key) return null;
    return modules.get(key) || null;
  }

  function has(name) {
    const key = normalizeName(name);
    return key ? modules.has(key) : false;
  }

  globalScope.SHITCORD67_XEP_REGISTRY = Object.freeze({
    register,
    get,
    has
  });
})(typeof window !== "undefined" ? window : globalThis);
