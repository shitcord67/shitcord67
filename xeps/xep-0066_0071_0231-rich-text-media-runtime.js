/*
 * Rich text and inline OOB/media parsing extracted from app.js.
 * Keeps XEP-0066/0071/0231 related handling in xeps/ while preserving app globals.
 */

function appendMentionOrEmoji(target, token, context) {
  const mentionMatch = token.match(/^@([a-z0-9._-]+)$/i);
  if (mentionMatch) {
    const username = mentionMatch[1].toLowerCase();
    const account = getAccountByUsername(username);
    if (!account) {
      target.appendChild(document.createTextNode(token));
      return;
    }
    const mention = document.createElement("span");
    mention.className = `mention ${context.current && context.current.id === account.id ? "mention--self" : ""}`;
    mention.textContent = `@${account.username}`;
    mention.addEventListener("click", () => openUserPopout(account));
    target.appendChild(mention);
    return;
  }
  const emojiMatch = token.match(/^:([a-z0-9_-]{1,32}):$/i);
  if (emojiMatch) {
    const emojiUrl = context.customEmojiMap.get(emojiMatch[1].toLowerCase());
    if (!emojiUrl) {
      target.appendChild(document.createTextNode(token));
      return;
    }
    const emojiImage = document.createElement("img");
    emojiImage.className = "inline-custom-emoji";
    emojiImage.src = emojiUrl;
    emojiImage.alt = token;
    emojiImage.loading = "lazy";
    target.appendChild(emojiImage);
    return;
  }
  target.appendChild(document.createTextNode(token));
}

function appendInlineCommandChip(target, label, invocation, { submit = false, title = "" } = {}) {
  const normalized = normalizeSlashCommandInvocation(invocation);
  if (!normalized) return false;
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "inline-command-chip";
  chip.textContent = label;
  chip.title = title || (submit
    ? "Run command. Shift+click inserts only."
    : "Insert command. Shift+click runs immediately.");
  chip.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const shouldSubmit = submit ? !event.shiftKey : event.shiftKey;
    invokeInlineCommand(normalized, { submit: shouldSubmit });
  });
  target.appendChild(chip);
  return true;
}

const INLINE_MD_ESCAPE_SENTINEL = "S67_ESC_";

function encodeInlineMarkdownEscapes(value = "") {
  const raw = (value || "").toString();
  return raw.replace(/\\([\\`*_~|])/g, (_match, token) => `${INLINE_MD_ESCAPE_SENTINEL}${token.charCodeAt(0)};`);
}

function decodeInlineMarkdownEscapes(value = "") {
  const raw = (value || "").toString();
  const pattern = new RegExp(`${INLINE_MD_ESCAPE_SENTINEL}(\\d+);`, "g");
  return raw.replace(pattern, (_match, code) => String.fromCharCode(Number(code) || 0));
}

function appendInlineRichText(target, text, context) {
  const tokenPattern = /(\|\|[^|\n]+\|\||\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|`[^`\n]+`|!\[[^\]]{0,80}\]\((?:https?:\/\/|mailto:|xmpp:)[^\s)]+\)|\[[^\]]{1,80}\]\((?:https?:\/\/|mailto:|xmpp:|s67cmd:)[^\s)]+\)|https?:\/\/[^\s]+|mailto:[^\s]+|xmpp:[^\s]+|s67cmd:[^\s]+|\/[a-z][a-z0-9-]{1,31}\b|@[a-z0-9._-]+|:[a-z0-9_-]{1,32}:)/gi;
  const workingText = encodeInlineMarkdownEscapes(text);
  let lastIndex = 0;
  let match = tokenPattern.exec(workingText);
  while (match) {
    if (match.index > lastIndex) {
      target.appendChild(document.createTextNode(
        decodeInlineMarkdownEscapes(workingText.slice(lastIndex, match.index))
      ));
    }
    const token = match[0];
    if (token.startsWith("||") && token.endsWith("||")) {
      const spoiler = document.createElement("span");
      spoiler.className = "message-spoiler";
      spoiler.textContent = decodeInlineMarkdownEscapes(token.slice(2, -2));
      spoiler.title = "Click to reveal spoiler";
      spoiler.addEventListener("click", () => {
        spoiler.classList.toggle("is-revealed");
      });
      target.appendChild(spoiler);
    } else if (token.startsWith("**") && token.endsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = decodeInlineMarkdownEscapes(token.slice(2, -2));
      target.appendChild(strong);
    } else if (token.startsWith("__") && token.endsWith("__")) {
      const prev = workingText[match.index - 1] || "";
      const next = workingText[match.index + token.length] || "";
      if (/[a-z0-9]/i.test(prev) || /[a-z0-9]/i.test(next)) {
        target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(token)));
        lastIndex = tokenPattern.lastIndex;
        match = tokenPattern.exec(workingText);
        continue;
      }
      const strong = document.createElement("strong");
      strong.textContent = decodeInlineMarkdownEscapes(token.slice(2, -2));
      target.appendChild(strong);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      const prev = workingText[match.index - 1] || "";
      const next = workingText[match.index + token.length] || "";
      if (/[a-z0-9]/i.test(prev) || /[a-z0-9]/i.test(next)) {
        target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(token)));
        lastIndex = tokenPattern.lastIndex;
        match = tokenPattern.exec(workingText);
        continue;
      }
      const em = document.createElement("em");
      em.textContent = decodeInlineMarkdownEscapes(token.slice(1, -1));
      target.appendChild(em);
    } else if (token.startsWith("_") && token.endsWith("_")) {
      const prev = workingText[match.index - 1] || "";
      const next = workingText[match.index + token.length] || "";
      if (/[a-z0-9]/i.test(prev) || /[a-z0-9]/i.test(next)) {
        target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(token)));
        lastIndex = tokenPattern.lastIndex;
        match = tokenPattern.exec(workingText);
        continue;
      }
      const em = document.createElement("em");
      em.textContent = decodeInlineMarkdownEscapes(token.slice(1, -1));
      target.appendChild(em);
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      const strike = document.createElement("s");
      strike.textContent = decodeInlineMarkdownEscapes(token.slice(2, -2));
      target.appendChild(strike);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      const code = document.createElement("code");
      code.textContent = decodeInlineMarkdownEscapes(token.slice(1, -1));
      target.appendChild(code);
    } else if (token.startsWith("![") && token.includes("](") && token.endsWith(")")) {
      const parts = token.match(/^!\[([^\]]{0,80})\]\(((?:https?:\/\/|mailto:|xmpp:)[^\s)]+)\)$/i);
      const href = sanitizeRichTextHref(parts?.[2] || "");
      if (parts && href) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = decodeInlineMarkdownEscapes(parts[1] || href);
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        target.appendChild(link);
      } else {
        target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(token)));
      }
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const parts = token.match(/^\[([^\]]{1,80})\]\(((?:https?:\/\/|mailto:|xmpp:|s67cmd:)[^\s)]+)\)$/i);
      const href = sanitizeRichTextHref(parts?.[2] || "");
      if (parts && href) {
        if (isInlineCommandHref(href)) {
          const label = decodeInlineMarkdownEscapes(parts[1] || normalizeSlashCommandInvocation(href) || "Run command");
          if (!appendInlineCommandChip(target, label, href, { submit: true })) {
            target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(token)));
          }
        } else {
          const link = document.createElement("a");
          link.href = href;
          link.textContent = decodeInlineMarkdownEscapes(parts[1]);
          link.target = "_blank";
          link.rel = "noreferrer noopener";
          target.appendChild(link);
        }
      } else {
        target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(token)));
      }
    } else if (isInlineCommandHref(token)) {
      const label = normalizeSlashCommandInvocation(token) || token;
      if (!appendInlineCommandChip(target, label, token, { submit: true })) {
        target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(token)));
      }
    } else if (/^\/[a-z][a-z0-9-]{1,31}$/i.test(token)) {
      if (!appendInlineCommandChip(target, token, token, { submit: false })) {
        target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(token)));
      }
    } else if (isLikelyRichTextLink(token)) {
      const cleaned = token.replace(/[),.!?]+$/, "");
      const trailing = token.slice(cleaned.length);
      const href = sanitizeRichTextHref(decodeInlineMarkdownEscapes(cleaned));
      if (!href) {
        target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(token)));
        lastIndex = tokenPattern.lastIndex;
        match = tokenPattern.exec(workingText);
        continue;
      }
      const link = document.createElement("a");
      link.href = href;
      link.textContent = decodeInlineMarkdownEscapes(cleaned);
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      target.appendChild(link);
      if (trailing) target.appendChild(document.createTextNode(decodeInlineMarkdownEscapes(trailing)));
    } else {
      appendMentionOrEmoji(target, decodeInlineMarkdownEscapes(token), context);
    }
    lastIndex = tokenPattern.lastIndex;
    match = tokenPattern.exec(workingText);
  }
  if (lastIndex < workingText.length) {
    target.appendChild(document.createTextNode(
      decodeInlineMarkdownEscapes(workingText.slice(lastIndex))
    ));
  }
}

function renderMessageText(container, rawText) {
  const current = getCurrentAccount();
  const guild = getActiveGuild();
  ensureGuildMediaCollections(guild);
  const context = {
    current,
    customEmojiMap: new Map((guild?.customEmojis || []).map((emoji) => [emoji.name, emoji.url]))
  };
  const lines = decodeHtmlEntities(rawText || "").split("\n");
  let inFence = false;
  let fenceBuffer = [];
  let listEl = null;
  const flushList = () => {
    if (!listEl) return;
    container.appendChild(listEl);
    listEl = null;
  };
  const flushFence = () => {
    if (!inFence) return;
    const pre = document.createElement("pre");
    pre.className = "message-text-file";
    pre.textContent = fenceBuffer.join("\n");
    container.appendChild(pre);
    inFence = false;
    fenceBuffer = [];
  };
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      flushList();
      if (inFence) {
        flushFence();
      } else {
        inFence = true;
        fenceBuffer = [];
      }
      if (index < lines.length - 1) container.appendChild(document.createElement("br"));
      return;
    }
    if (inFence) {
      fenceBuffer.push(line);
      if (index === lines.length - 1) flushFence();
      return;
    }
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const heading = document.createElement("strong");
      heading.className = "message-heading";
      heading.textContent = headingMatch[2];
      container.appendChild(heading);
      if (index < lines.length - 1) container.appendChild(document.createElement("br"));
      return;
    }
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
    const numberMatch = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bulletMatch || numberMatch) {
      if (!listEl || listEl.tagName.toLowerCase() !== (numberMatch ? "ol" : "ul")) {
        flushList();
        listEl = document.createElement(numberMatch ? "ol" : "ul");
        listEl.className = "message-inline-list";
      }
      const item = document.createElement("li");
      appendInlineRichText(item, (bulletMatch?.[1] || numberMatch?.[1] || "").toString(), context);
      listEl.appendChild(item);
      if (index === lines.length - 1) flushList();
      return;
    }
    flushList();
    const quoteMatch = line.match(/^\s*(>{1,3})\s?(.*)$/);
    if (quoteMatch) {
      const quote = document.createElement("span");
      quote.className = "message-quote";
      appendInlineRichText(quote, quoteMatch[2] || "", context);
      container.appendChild(quote);
    } else {
      appendInlineRichText(container, line, context);
    }
    if (index < lines.length - 1) container.appendChild(document.createElement("br"));
  });
  flushList();
  flushFence();
}

function collectRenderableAttachments(message) {
  return normalizeAttachments([
    ...normalizeAttachments(message?.attachments),
    ...extractInlineAttachmentsFromText(message?.text || "")
  ]);
}

function stripInlineAttachmentUrlsFromText(text, attachments = []) {
  const raw = (text || "").toString();
  if (!raw) return "";
  if (!Array.isArray(attachments) || attachments.length === 0) return raw;
  const normalizeInlineCidToken = (value = "") => {
    const token = (value || "").toString().trim();
    if (!token) return "";
    const xmppWrapped = token.match(/^xmpp:(cid:.+)$/i);
    let normalized = (xmppWrapped?.[1] || token).toString().trim().replace(/^cid:/i, "");
    try {
      normalized = decodeURIComponent(normalized);
    } catch {
      // Keep raw value when percent-decoding fails.
    }
    return normalized
      .split("?")[0]
      .split("#")[0]
      .replace(/^<+|>+$/g, "")
      .trim()
      .toLowerCase();
  };
  const normalizeComparableUrl = (value = "") => {
    const token = (value || "").toString().trim();
    if (!token) return "";
    if (/^(xmpp:)?cid:/i.test(token)) {
      const cid = normalizeInlineCidToken(token);
      return cid ? `cid:${cid}` : "";
    }
    const unwrapped = token.replace(/^xmpp:(https?:\/\/.+)$/i, "$1");
    const withoutTrail = unwrapped.replace(/[),.!?]+$/, "");
    return withoutTrail;
  };
  const attachmentUrls = new Set(
    attachments
      .flatMap((entry) => {
        const source = (entry?.url || "").toString().trim();
        if (!source) return [];
        const normalized = normalizeComparableUrl(source);
        const wrapped = /^(https?:\/\/|cid:)/i.test(normalized) ? `xmpp:${normalized}` : "";
        return [source, normalized, wrapped].filter(Boolean);
      })
      .filter(Boolean)
  );
  if (attachmentUrls.size === 0) return raw;
  const stripped = raw.replace(/(?:xmpp:https?:\/\/\S+|https?:\/\/\S+|xmpp:cid:\S+|cid:\S+|aesgcm:\/\/\S+)/gi, (token) => {
    const cleanedRaw = (token || "").toString().replace(/[),.!?]+$/, "");
    const cleaned = normalizeComparableUrl(cleanedRaw);
    const normalizedToken = normalizeComparableUrl(token);
    if (!cleaned || (!attachmentUrls.has(cleaned) && !attachmentUrls.has(normalizedToken) && !attachmentUrls.has(cleanedRaw))) return token;
    const suffix = token.slice(cleanedRaw.length);
    return /^[),.!?]+$/.test(suffix) ? suffix : "";
  });
  return stripped
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

function extractImageUrl(text) {
  if (!text) return null;
  const matches = text.match(/https?:\/\/\S+/gi);
  if (!matches) return null;
  const imageUrl = matches.find((url) => /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url));
  return imageUrl || null;
}

function normalizeInlineBobCidToken(value = "") {
  const raw = (value || "").toString().trim();
  if (!raw) return "";
  const xmppWrapped = raw.match(/^xmpp:(cid:.+)$/i);
  let normalized = (xmppWrapped?.[1] || raw).toString().trim().replace(/^cid:/i, "");
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Ignore malformed percent-encoding and use raw token.
  }
  const clean = normalized
    .split("?")[0]
    .split("#")[0]
    .replace(/^<+|>+$/g, "")
    .trim()
    .toLowerCase();
  return clean || "";
}

function resolveInlineBobCacheEntry(url = "") {
  const cidKey = normalizeInlineBobCidToken(url);
  if (!cidKey) return null;
  const cache = globalThis.xmppBobCacheByCid;
  if (!(cache instanceof Map)) return null;
  const cached = cache.get(cidKey);
  if (!cached || typeof cached !== "object") return null;
  const dataUrl = (cached.url || "").toString().trim();
  if (!/^data:/i.test(dataUrl)) return null;
  const mime = (cached.mime || "").toString().trim().toLowerCase();
  return {
    cidKey,
    url: dataUrl,
    mime,
    name: (cached.name || cached.cid || cidKey).toString().trim()
  };
}

function inferAttachmentTypeFromUrl(url) {
  const raw = (url || "").toString().trim();
  if (!raw) return null;
  const inlineBob = resolveInlineBobCacheEntry(raw);
  if (inlineBob?.mime) {
    return inferAttachmentTypeFromMime(inlineBob.mime) || "file";
  }
  const xmppWrapped = raw.match(/^xmpp:(https?:\/\/.+)$/i);
  if (xmppWrapped?.[1]) return inferAttachmentTypeFromUrl(xmppWrapped[1]);
  if (typeof isAesgcmUrl === "function" && isAesgcmUrl(raw)) return "bin";
  const clean = raw.toLowerCase();
  let pathAndQuery = clean;
  try {
    const parsed = new URL(raw, globalThis.location?.href || "http://localhost/");
    pathAndQuery = `${(parsed.pathname || "").toLowerCase()}${(parsed.search || "").toLowerCase()}`;
  } catch {
    // Ignore malformed URLs and fallback to the raw value.
  }
  const haystacks = [clean, pathAndQuery];
  const has = (pattern) => haystacks.some((value) => pattern.test(value));
  if (has(/\.swf(\?|$|&|#)/i)) return "swf";
  if (has(/\.svg(\?|$|&|#)/i)) return "svg";
  if (has(/\.html?(\?|$|&|#)/i)) return "html";
  if (has(/\.pdf(\?|$|&|#)/i)) return "pdf";
  if (has(/\.rtf(\?|$|&|#)/i)) return "rtf";
  if (has(/\.(odt|ods|odp|doc|docx|xls|xlsx|ppt|pptx)(\?|$|&|#)/i)) return "odf";
  if (has(/\.(mp3|ogg|wav|m4a|flac)(\?|$|&|#)/i)) return "audio";
  if (has(/\.(txt|md|log|json|js|ts|css|html|xml|yml|yaml|ini|toml)(\?|$|&|#)/i)) return "text";
  if (has(/\.bin(\?|$|&|#)/i)) return "bin";
  if (has(/\.apng(\?|$|&|#)/i)) return "sticker";
  if (has(/\.lottie(\?|$|&|#)/i)) return "sticker";
  if (has(/\/stickers?\//i) && has(/\.(png|gif|webp|apng|lottie)(\?|$|&|#)/i)) return "sticker";
  if (has(/\.(mp4|webm|mov|m4v|ogv|m3u8|mkv|avi|wmv|mpe?g|m2ts|ts)(\?|$|&|#)/i) || has(/[?&](?:format|fm|ext)=?(mp4|webm|mov|m4v|ogv|m3u8|mkv|avi|wmv|mpe?g|m2ts|ts)(?:[&#]|$)/i)) return "video";
  if (has(/\.(png|jpe?g|gif|webp|bmp|avif|heic|heif|jfif)(\?|$|&|#)/i) || has(/[?&](?:format|fm|ext)=?(png|jpe?g|gif|webp|bmp|avif|heic|heif)(?:[&#]|$)/i)) return "gif";
  if (has(/\/[^/?#]+\.[a-z0-9]{1,12}(\?|$|&|#)/i)) return "file";
  return null;
}

function inferAttachmentTypeFromMime(mime = "") {
  const raw = (mime || "").toString().trim().toLowerCase();
  if (!raw) return null;
  const clean = raw.split(";")[0].trim();
  if (!clean) return null;
  if (clean.startsWith("image/")) {
    if (clean.includes("svg")) return "svg";
    if (clean.includes("apng") || clean.includes("lottie")) return "sticker";
    return "gif";
  }
  if (clean === "application/x-shockwave-flash") return "swf";
  if (clean === "application/pdf") return "pdf";
  if (clean === "application/rtf" || clean === "text/rtf") return "rtf";
  if (clean.startsWith("audio/")) return "audio";
  if (clean.startsWith("video/")) return "video";
  if (clean.startsWith("text/")) return "text";
  if (
    clean.includes("officedocument")
    || clean.includes("msword")
    || clean.includes("vnd.ms-")
    || clean.includes("vnd.oasis.opendocument")
  ) {
    return "odf";
  }
  return null;
}

function inferVideoMimeType(value) {
  const raw = (value || "").toString().toLowerCase();
  if (/\.mp4(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?mp4(?:[&#]|$)/i.test(raw)) return "video/mp4";
  if (/\.webm(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?webm(?:[&#]|$)/i.test(raw)) return "video/webm";
  if (/\.ogv(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?ogv(?:[&#]|$)/i.test(raw)) return "video/ogg";
  if (/\.m3u8(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?m3u8(?:[&#]|$)/i.test(raw)) return "application/x-mpegURL";
  if (/\.mov(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?mov(?:[&#]|$)/i.test(raw)) return "video/quicktime";
  if (/\.m4v(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?m4v(?:[&#]|$)/i.test(raw)) return "video/x-m4v";
  if (/\.mkv(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?mkv(?:[&#]|$)/i.test(raw)) return "video/x-matroska";
  if (/\.avi(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?avi(?:[&#]|$)/i.test(raw)) return "video/x-msvideo";
  if (/\.wmv(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?wmv(?:[&#]|$)/i.test(raw)) return "video/x-ms-wmv";
  if (/\.(mpeg|mpg)(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?mpe?g(?:[&#]|$)/i.test(raw)) return "video/mpeg";
  if (/\.(m2ts|ts)(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?(m2ts|ts)(?:[&#]|$)/i.test(raw)) return "video/mp2t";
  return "";
}

function inferAttachmentFormat(type, url) {
  if (type !== "sticker") return "image";
  return stickerFormatFromName("", url);
}

function extractInlineAttachmentsFromText(text) {
  if (!text) return [];
  const results = [];
  const matches = text.match(/(?:xmpp:https?:\/\/\S+|https?:\/\/\S+|xmpp:cid:\S+|cid:\S+|aesgcm:\/\/\S+|(?:\.?\/)?[a-z0-9._%+-]+\.(?:swf|svg|html?|pdf|rtf|odt|ods|odp|docx?|xlsx?|pptx?|apng|lottie|png|jpe?g|gif|webp|bmp|avif|heic|heif|mp4|webm|mov|m4v|ogv|m3u8|mp3|ogg|wav|m4a|flac|txt|md|log|json|js|ts|css|xml|yml|yaml|ini|toml|bin))/gi) || [];
  const seen = new Set();
  matches.forEach((raw) => {
    const cleaned = raw.replace(/[),.!?]+$/, "");
    const inlineBob = resolveInlineBobCacheEntry(cleaned);
    const normalized = inlineBob
      ? inlineBob.url
      : cleaned.replace(/^xmpp:(https?:\/\/.+)$/i, "$1");
    if (seen.has(normalized)) return;
    const type = inferAttachmentTypeFromUrl(normalized);
    if (!type) return;
    seen.add(normalized);
    results.push({
      type,
      url: normalized,
      name: inlineBob?.name || normalized.split("/").pop() || normalized,
      format: inferAttachmentFormat(type, normalized)
    });
  });
  return results.slice(0, 4);
}

function decodeDataUrlPreviewBytes(url, limit = 65536) {
  const safeLimit = Math.max(64, Math.min(524288, Number(limit) || 65536));
  const raw = (url || "").toString();
  const match = raw.match(/^data:([^,]*?),(.*)$/is);
  if (!match) return null;
  const meta = (match[1] || "").toLowerCase();
  const payload = (match[2] || "").trim();
  if (!payload) return new Uint8Array();
  if (meta.includes(";base64")) {
    const clean = payload.replace(/\s+/g, "");
    const charsNeeded = Math.max(4, Math.ceil(safeLimit / 3) * 4);
    const sliced = clean.slice(0, charsNeeded);
    let padded = sliced;
    while (padded.length % 4 !== 0) padded += "=";
    try {
      const binary = atob(padded);
      const length = Math.min(binary.length, safeLimit);
      const bytes = new Uint8Array(length);
      for (let index = 0; index < length; index += 1) bytes[index] = binary.charCodeAt(index);
      return bytes;
    } catch {
      return null;
    }
  }
  try {
    const decoded = decodeURIComponent(payload.replace(/\+/g, "%20"));
    return new TextEncoder().encode(decoded).slice(0, safeLimit);
  } catch {
    return null;
  }
}

function getCachedAttachmentPreview(cacheMap, key) {
  const cached = cacheMap.get(key);
  if (!cached) return "";
  if (cached.expiresAt <= Date.now()) {
    cacheMap.delete(key);
    return "";
  }
  return (cached.value || "").toString();
}

function setCachedAttachmentPreview(cacheMap, key, value, ttlMs = 5 * 60 * 1000) {
  cacheMap.set(key, {
    value: (value || "").toString(),
    expiresAt: Date.now() + Math.max(10_000, Number(ttlMs) || (5 * 60 * 1000))
  });
}

async function loadTextAttachmentPreview(url) {
  const key = (url || "").toString();
  const cached = getCachedAttachmentPreview(attachmentTextPreviewCache, key);
  if (cached) return cached;
  if (attachmentTextPreviewInFlight.has(key)) {
    return attachmentTextPreviewInFlight.get(key);
  }
  const inlineBytes = decodeDataUrlPreviewBytes(url, 70_000);
  if (inlineBytes instanceof Uint8Array) {
    const text = new TextDecoder().decode(inlineBytes);
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const clipped = lines.slice(0, 40).join("\n").slice(0, 3500);
    const truncated = lines.length > 40 || text.length > clipped.length;
    const preview = `${clipped}${truncated ? "\n… (truncated)" : ""}`;
    setCachedAttachmentPreview(attachmentTextPreviewCache, key, preview, 30 * 60 * 1000);
    return preview;
  }
  const task = (async () => {
    const response = await fetch(url, {
      cache: "force-cache",
      headers: { Range: "bytes=0-65535" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const clipped = lines.slice(0, 40).join("\n").slice(0, 3500);
    const partial = response.status === 206;
    const truncated = partial || lines.length > 40 || text.length > clipped.length;
    const preview = `${clipped}${truncated ? "\n… (truncated)" : ""}`;
    setCachedAttachmentPreview(attachmentTextPreviewCache, key, preview, 30 * 60 * 1000);
    return preview;
  })().finally(() => {
    attachmentTextPreviewInFlight.delete(key);
  });
  attachmentTextPreviewInFlight.set(key, task);
  return task;
}

async function loadBinaryPreview(url, limit = 512) {
  const safeLimit = Math.max(64, Math.min(4096, Number(limit) || 512));
  const key = `${(url || "").toString()}::${safeLimit}`;
  const cached = getCachedAttachmentPreview(attachmentBinaryPreviewCache, key);
  if (cached) return cached;
  if (attachmentBinaryPreviewInFlight.has(key)) {
    return attachmentBinaryPreviewInFlight.get(key);
  }
  const inlineBytes = decodeDataUrlPreviewBytes(url, safeLimit);
  if (inlineBytes instanceof Uint8Array) {
    const lines = [];
    for (let i = 0; i < inlineBytes.length; i += 16) {
      const chunk = inlineBytes.slice(i, i + 16);
      const hex = [...chunk].map((b) => b.toString(16).padStart(2, "0")).join(" ");
      const ascii = [...chunk].map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ".")).join("");
      lines.push(`${i.toString(16).padStart(4, "0")}  ${hex.padEnd(47, " ")}  ${ascii}`);
    }
    const preview = lines.join("\n");
    setCachedAttachmentPreview(attachmentBinaryPreviewCache, key, preview);
    return preview;
  }
  const task = (async () => {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer.slice(0, Math.min(safeLimit, buffer.byteLength)));
    const lines = [];
    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hex = [...chunk].map((b) => b.toString(16).padStart(2, "0")).join(" ");
      const ascii = [...chunk].map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ".")).join("");
      lines.push(`${i.toString(16).padStart(4, "0")}  ${hex.padEnd(47, " ")}  ${ascii}`);
    }
    const suffix = buffer.byteLength > bytes.length ? `\n… (${buffer.byteLength - bytes.length} bytes more)` : "";
    const preview = lines.join("\n") + suffix;
    setCachedAttachmentPreview(attachmentBinaryPreviewCache, key, preview);
    return preview;
  })().finally(() => {
    attachmentBinaryPreviewInFlight.delete(key);
  });
  attachmentBinaryPreviewInFlight.set(key, task);
  return task;
}

function rtfToPlainText(rtf) {
  if (!rtf) return "";
  return rtf
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\tab/g, "\t")
    .replace(/\\'[0-9a-f]{2}/gi, " ")
    .replace(/\\[a-z]+-?\d* ?/gi, "")
    .replace(/[{}]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
