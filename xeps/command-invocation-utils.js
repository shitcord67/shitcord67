(function initCommandInvocationUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_COMMAND_INVOCATION_UTILS) return;

  function normalizeSlashCommandInvocation(rawValue, {
    decodeHtmlEntitiesFn = (value) => (value || "").toString(),
    isInlineCommandHrefFn = () => false,
    slashCommands = []
  } = {}) {
    let value = decodeHtmlEntitiesFn((rawValue || "").toString()).trim();
    if (!value) return "";
    if (isInlineCommandHrefFn(value)) {
      value = value.replace(/^s67cmd:/i, "");
      try {
        value = decodeURIComponent(value);
      } catch {
        // Keep undecoded payload when malformed.
      }
      value = value.trim();
    }
    if (!value) return "";
    if (!value.startsWith("/")) value = `/${value}`;
    const commandName = value.slice(1).split(/\s+/)[0].toLowerCase();
    if (!commandName) return "";
    if (!Array.isArray(slashCommands) || !slashCommands.some((entry) => entry.name === commandName)) return "";
    return value;
  }

  function isInlineCommandHref(value) {
    return /^s67cmd:/i.test((value || "").toString().trim());
  }

  globalScope.SHITCORD67_COMMAND_INVOCATION_UTILS = Object.freeze({
    normalizeSlashCommandInvocation,
    isInlineCommandHref
  });
})(typeof window !== "undefined" ? window : globalThis);
