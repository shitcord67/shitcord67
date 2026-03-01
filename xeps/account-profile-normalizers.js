(function initAccountProfileNormalizers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_ACCOUNT_PROFILE_NORMALIZERS) return;

  function normalizeUsername(value) {
    const base = value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .slice(0, 24);
    try {
      return base.replace(new RegExp("[^\\p{L}\\p{N}._-]", "gu"), "");
    } catch {
      // Older JS engines may not support Unicode property escapes.
    }
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 24);
  }

  function normalizeComposerDrafts(value, {
    maxLength = 2000
  } = {}) {
    if (!value || typeof value !== "object") return {};
    const entries = Object.entries(value)
      .filter(([conversationId]) => typeof conversationId === "string" && conversationId)
      .map(([conversationId, draft]) => [conversationId, (draft || "").toString().slice(0, maxLength)]);
    return Object.fromEntries(entries.filter(([, draft]) => draft.length > 0));
  }

  function normalizeOwnedCosmetics(raw) {
    const safe = raw && typeof raw === "object" ? raw : {};
    return {
      decor: Array.isArray(safe.decor) ? [...new Set(safe.decor.map((id) => (id || "").toString()).filter(Boolean))] : [],
      nameplate: Array.isArray(safe.nameplate) ? [...new Set(safe.nameplate.map((id) => (id || "").toString()).filter(Boolean))] : [],
      effect: Array.isArray(safe.effect) ? [...new Set(safe.effect.map((id) => (id || "").toString()).filter(Boolean))] : []
    };
  }

  function normalizeGuildTagGuildId(raw) {
    const token = (raw || "").toString().trim();
    return token.slice(0, 64);
  }

  function normalizeCosmeticPurchases(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((entry) => ({
        id: (entry?.id || "").toString(),
        cost: Number(entry?.cost || 0),
        ts: (entry?.ts || "").toString()
      }))
      .filter((entry) => entry.id && Number.isFinite(entry.cost) && entry.cost > 0)
      .slice(-240);
  }

  function normalizeColorForPicker(value, fallback = "#5865f2") {
    const raw = (value || "").toString().trim().toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) {
      return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
    }
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
    if (/^#[0-9a-f]{8}$/i.test(raw)) return `#${raw.slice(1, 7)}`;
    if (fallback && fallback !== value) return normalizeColorForPicker(fallback, "#5865f2");
    return "#5865f2";
  }

  function normalizeNativeAndroidInsets(rawInsets) {
    if (!rawInsets || typeof rawInsets !== "object") return null;
    const top = Number(rawInsets.top);
    const right = Number(rawInsets.right);
    const bottom = Number(rawInsets.bottom);
    const left = Number(rawInsets.left);
    if (![top, right, bottom, left].every((value) => Number.isFinite(value) && value >= 0)) {
      return null;
    }
    return {
      top: Math.round(top),
      right: Math.round(right),
      bottom: Math.round(bottom),
      left: Math.round(left)
    };
  }

  function normalizeCosmeticsTab(rawTab) {
    const token = (rawTab || "").toString().trim().toLowerCase();
    if (token === "decor" || token === "decoration" || token === "decorations") return "decor";
    if (token === "nameplate" || token === "nameplates") return "nameplate";
    if (token === "effect" || token === "effects" || token === "profilefx") return "effect";
    return "decor";
  }

  globalScope.SHITCORD67_ACCOUNT_PROFILE_NORMALIZERS = Object.freeze({
    normalizeUsername,
    normalizeComposerDrafts,
    normalizeOwnedCosmetics,
    normalizeGuildTagGuildId,
    normalizeCosmeticPurchases,
    normalizeColorForPicker,
    normalizeNativeAndroidInsets,
    normalizeCosmeticsTab
  });
})(typeof window !== "undefined" ? window : globalThis);
