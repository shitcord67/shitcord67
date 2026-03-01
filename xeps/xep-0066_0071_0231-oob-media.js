(function initXep0066_0071_0231OobMedia(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0066_0071_0231_MEDIA) return;

  const XMPP_BOB_NAMESPACE = "urn:xmpp:bob";
  const XMPP_SIMS_NAMESPACE = "urn:xmpp:sims:1";
  const XMPP_FILE_METADATA_NAMESPACE = "urn:xmpp:file:metadata:0";
  const XMPP_XHTML_IM_NAMESPACE = "http://jabber.org/protocol/xhtml-im";
  const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

  function xmppNodeHasXmlns(node, xmlns, options = {}) {
    if (typeof options.xmppNodeHasXmlnsFn === "function") {
      return options.xmppNodeHasXmlnsFn(node, xmlns);
    }
    if (!node || typeof node.getAttribute !== "function") return false;
    const local = (xmlns || "").toString().trim().toLowerCase();
    const value = (node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase();
    return Boolean(local && value === local);
  }

  function xmppNodeText(node, options = {}) {
    if (typeof options.xmppNodeTextFn === "function") return options.xmppNodeTextFn(node);
    return (node?.textContent || "").toString();
  }

  function xmppElementsByLocalName(node, localName, options = {}) {
    if (typeof options.xmppElementsByLocalNameFn === "function") {
      return options.xmppElementsByLocalNameFn(node, localName);
    }
    if (!node || typeof node.getElementsByTagName !== "function") return [];
    const want = (localName || "").toString().trim().toLowerCase();
    if (!want) return [];
    return [...node.getElementsByTagName("*")].filter((entry) => (
      ((entry?.localName || entry?.nodeName || "").toString().split(":").pop() || "").toLowerCase() === want
    ));
  }

  function decodeHtmlEntities(text) {
    const raw = (text || "").toString();
    if (!raw) return raw;
    if (typeof document === "undefined" || !document.createElement) return raw;
    let value = raw;
    for (let i = 0; i < 3; i += 1) {
      if (!/&(?:[a-z][a-z0-9]+|#\d+|#x[a-f0-9]+);/i.test(value)) break;
      const area = document.createElement("textarea");
      area.innerHTML = value
        .replace(/&apos;/gi, "'")
        .replace(/&quot;/gi, "\"");
      const decoded = area.value || value;
      if (decoded === value) break;
      value = decoded;
    }
    return value;
  }

  function xmppNormalizeBobCid(value = "") {
    let token = (value || "").toString().trim();
    if (!token) return "";
    token = decodeHtmlEntities(token);
    token = token.replace(/^xmpp:/i, "");
    if (!/^cid:/i.test(token)) return "";
    token = token.replace(/^cid:/i, "");
    token = token
      .split("?")[0]
      .split("#")[0]
      .replace(/^<+|>+$/g, "")
      .trim();
    return token.toLowerCase();
  }

  function xmppInlineBobEntries(stanza, options = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
    const out = [];
    const seen = new Set();
    xmppElementsByLocalName(stanza, "data", options)
      .filter((node) => xmppNodeHasXmlns(node, XMPP_BOB_NAMESPACE, options))
      .forEach((node) => {
        const rawCid = (node.getAttribute?.("cid") || "").toString().trim();
        const cidKey = xmppNormalizeBobCid(rawCid);
        if (!cidKey || seen.has(cidKey)) return;
        const payload = (xmppNodeText(node, options) || "").toString().replace(/\s+/g, "");
        if (!payload || payload.length > (8 * 1024 * 1024)) return;
        const cleanPayload = payload.replace(/[^a-z0-9+/=]/gi, "");
        if (!cleanPayload) return;
        const rawMime = (node.getAttribute?.("type") || "").toString().trim().toLowerCase();
        const mime = /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(rawMime) ? rawMime : "application/octet-stream";
        seen.add(cidKey);
        out.push({
          cid: rawCid || cidKey,
          cidKey,
          name: rawCid || cidKey,
          mime,
          url: `data:${mime};base64,${cleanPayload}`
        });
      });
    return out.slice(0, 6);
  }

  function xmppParseBobDataNode(node, options = {}) {
    if (!node || !xmppNodeHasXmlns(node, XMPP_BOB_NAMESPACE, options)) return null;
    const rawCid = (node.getAttribute?.("cid") || "").toString().trim();
    const cidKey = xmppNormalizeBobCid(rawCid);
    if (!cidKey) return null;
    const payload = (xmppNodeText(node, options) || "").toString().replace(/\s+/g, "");
    if (!payload || payload.length > (8 * 1024 * 1024)) return null;
    const cleanPayload = payload.replace(/[^a-z0-9+/=]/gi, "");
    if (!cleanPayload) return null;
    const rawMime = (node.getAttribute?.("type") || "").toString().trim().toLowerCase();
    const mime = /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(rawMime) ? rawMime : "application/octet-stream";
    return {
      cid: rawCid || cidKey,
      cidKey,
      name: rawCid || cidKey,
      mime,
      url: `data:${mime};base64,${cleanPayload}`
    };
  }

  function xmppExtractBobCidCandidates(stanza, options = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
    const out = [];
    const seen = new Set();
    const add = (raw = "", { name = "", mime = "" } = {}) => {
      const value = (raw || "").toString().trim();
      if (!value || !/^(xmpp:)?cid:/i.test(value)) return;
      const cidKey = xmppNormalizeBobCid(value);
      if (!cidKey || seen.has(cidKey)) return;
      seen.add(cidKey);
      out.push({
        cid: value,
        cidKey,
        name: (name || "").toString().trim().slice(0, 120),
        mime: (mime || "").toString().trim().toLowerCase().slice(0, 120)
      });
    };
    xmppElementsByLocalName(stanza, "img", options).forEach((node) => {
      add(node.getAttribute?.("src") || "", {
        name: node.getAttribute?.("alt") || node.getAttribute?.("title") || "",
        mime: node.getAttribute?.("type") || node.getAttribute?.("data-mime") || ""
      });
    });
    xmppElementsByLocalName(stanza, "a", options).forEach((node) => {
      add(node.getAttribute?.("href") || "", {
        name: node.getAttribute?.("title") || node.getAttribute?.("data-name") || "",
        mime: node.getAttribute?.("type") || node.getAttribute?.("data-mime") || ""
      });
    });
    xmppElementsByLocalName(stanza, "source", options).forEach((node) => {
      add(node.getAttribute?.("src") || node.getAttribute?.("srcset") || "", {
        name: node.getAttribute?.("title") || "",
        mime: node.getAttribute?.("type") || ""
      });
    });
    xmppElementsByLocalName(stanza, "object", options).forEach((node) => {
      add(node.getAttribute?.("data") || "", {
        name: node.getAttribute?.("title") || "",
        mime: node.getAttribute?.("type") || ""
      });
    });
    xmppElementsByLocalName(stanza, "reference", options)
      .filter((node) => xmppNodeHasXmlns(node, "urn:xmpp:reference:0", options))
      .forEach((node) => {
        const uriNode = xmppElementsByLocalName(node, "uri", options)[0] || null;
        const mediaTypeNode = xmppElementsByLocalName(node, "media-type", options)[0] || null;
        add(node.getAttribute("uri") || xmppNodeText(uriNode, options) || "", {
          name: node.getAttribute("name") || "",
          mime: node.getAttribute("media-type") || xmppNodeText(mediaTypeNode, options) || ""
        });
      });
    return out.slice(0, 6);
  }

  function xmppExtractOobAttachments(stanza, options = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
    const inferAttachmentTypeFromUrl = typeof options.inferAttachmentTypeFromUrlFn === "function"
      ? options.inferAttachmentTypeFromUrlFn
      : (() => "");
    const inferAttachmentTypeFromMime = typeof options.inferAttachmentTypeFromMimeFn === "function"
      ? options.inferAttachmentTypeFromMimeFn
      : (() => "");
    const out = [];
    const seen = new Set();
    const inlineBobEntries = xmppInlineBobEntries(stanza, options);
    const inlineBobByCid = new Map(
      inlineBobEntries
        .map((entry) => [entry.cidKey, entry])
        .filter(([key]) => Boolean(key))
    );
    const resolveInlineBobFromUri = (raw = "") => {
      const cidKey = xmppNormalizeBobCid(raw);
      if (!cidKey) return null;
      return inlineBobByCid.get(cidKey) || null;
    };
    const normalizeMediaUrl = (raw = "") => {
      const value = (raw || "").toString().trim();
      if (!value) return "";
      if (/^data:/i.test(value)) return value;
      if (/^https?:\/\//i.test(value)) return value;
      const wrapped = value.match(/^xmpp:(https?:\/\/.+)$/i);
      if (wrapped?.[1] && /^https?:\/\//i.test(wrapped[1])) return wrapped[1];
      return "";
    };
    const upsert = (entry = {}) => {
      const bobEntry = resolveInlineBobFromUri(entry.url || "");
      const url = normalizeMediaUrl((bobEntry?.url || entry.url || "").toString());
      if (!url) return;
      const cleanName = (entry.name || bobEntry?.name || "").toString().trim().slice(0, 120);
      const cleanMime = (entry.mime || bobEntry?.mime || "").toString().trim().toLowerCase().slice(0, 120);
      const key = /^data:/i.test(url) ? url : url.toLowerCase();
      if (seen.has(key)) {
        const existing = out.find((item) => ((/^data:/i.test(item.url || "") ? item.url : (item.url || "").toLowerCase()) === key)) || null;
        if (existing && !existing.name && cleanName) existing.name = cleanName;
        if (existing && !existing.mime && cleanMime) existing.mime = cleanMime;
        return;
      }
      seen.add(key);
      out.push({
        url,
        name: cleanName,
        mime: cleanMime
      });
    };
    const extractRefUri = (node = null) => {
      if (!node) return "";
      const uriNode = xmppElementsByLocalName(node, "uri", options)[0] || null;
      return (node.getAttribute("uri") || xmppNodeText(uriNode, options) || "").toString().trim();
    };
    const extractRefMime = (node = null) => {
      if (!node) return "";
      const mediaTypeNode = xmppElementsByLocalName(node, "media-type", options)[0] || null;
      const typeAttr = (node.getAttribute("type") || "").toString().trim().toLowerCase();
      const mimeFromTypeAttr = typeAttr.includes("/") ? typeAttr : "";
      return (node.getAttribute("media-type") || xmppNodeText(mediaTypeNode, options) || mimeFromTypeAttr || "").toString().trim();
    };
    const extractRefName = (node = null) => {
      if (!node) return "";
      const nameNode = xmppElementsByLocalName(node, "name", options)[0] || null;
      const descNode = xmppElementsByLocalName(node, "desc", options)[0] || null;
      return (node.getAttribute("name") || xmppNodeText(nameNode, options) || xmppNodeText(descNode, options) || "").toString().trim();
    };
    const upsertMediaSharingNode = (mediaSharingNode, { fallbackUrl = "", fallbackName = "", fallbackMime = "" } = {}) => {
      if (!mediaSharingNode || !xmppNodeHasXmlns(mediaSharingNode, XMPP_SIMS_NAMESPACE, options)) return;
      const fileNode = xmppElementsByLocalName(mediaSharingNode, "file", options)
        .find((node) => xmppNodeHasXmlns(node, XMPP_FILE_METADATA_NAMESPACE, options))
        || xmppElementsByLocalName(mediaSharingNode, "file", options)[0]
        || null;
      const fileNameNode = fileNode ? (xmppElementsByLocalName(fileNode, "name", options)[0] || null) : null;
      const fileDescNode = fileNode ? (xmppElementsByLocalName(fileNode, "desc", options)[0] || null) : null;
      const fileMimeNode = fileNode ? (xmppElementsByLocalName(fileNode, "media-type", options)[0] || null) : null;
      const fileUriNodes = fileNode ? xmppElementsByLocalName(fileNode, "uri", options) : [];
      const fileName = (xmppNodeText(fileNameNode, options) || xmppNodeText(fileDescNode, options) || fallbackName || "").toString().trim();
      const fileMime = (xmppNodeText(fileMimeNode, options) || fallbackMime || "").toString().trim();
      const uriCandidates = [];
      const pushUri = (rawUrl = "") => {
        const candidate = (rawUrl || "").toString().trim();
        if (!candidate || uriCandidates.includes(candidate)) return;
        uriCandidates.push(candidate);
      };
      pushUri(fallbackUrl);
      fileUriNodes.forEach((uriNode) => {
        pushUri(xmppNodeText(uriNode, options));
        pushUri(uriNode?.getAttribute?.("uri") || "");
      });
      xmppElementsByLocalName(mediaSharingNode, "reference", options)
        .filter((node) => xmppNodeHasXmlns(node, "urn:xmpp:reference:0", options))
        .forEach((refNode) => {
          pushUri(extractRefUri(refNode));
          const thumbNodes = xmppElementsByLocalName(refNode, "thumbnail", options);
          thumbNodes.forEach((thumbNode) => {
            pushUri(thumbNode?.getAttribute?.("uri") || "");
          });
          upsert({
            url: extractRefUri(refNode),
            name: extractRefName(refNode) || fileName || fallbackName,
            mime: extractRefMime(refNode) || fileMime || fallbackMime
          });
        });
      uriCandidates.forEach((uri) => {
        upsert({
          url: uri,
          name: fileName || fallbackName,
          mime: fileMime || fallbackMime
        });
      });
    };

    xmppElementsByLocalName(stanza, "x", options)
      .filter((node) => xmppNodeHasXmlns(node, "jabber:x:oob", options))
      .forEach((node) => {
        const urlNode = xmppElementsByLocalName(node, "url", options)[0] || null;
        const descNode = xmppElementsByLocalName(node, "desc", options)[0] || null;
        const mediaTypeNode = xmppElementsByLocalName(node, "media-type", options)[0] || null;
        upsert({
          url: xmppNodeText(urlNode, options) || node.getAttribute?.("url") || "",
          name: xmppNodeText(descNode, options),
          mime: xmppNodeText(mediaTypeNode, options)
        });
      });
    xmppElementsByLocalName(stanza, "reference", options)
      .filter((node) => xmppNodeHasXmlns(node, "urn:xmpp:reference:0", options))
      .forEach((node) => {
        const uri = extractRefUri(node);
        const name = extractRefName(node);
        const mime = extractRefMime(node);
        upsert({ url: uri, name, mime });
        const mediaSharingNode = xmppElementsByLocalName(node, "media-sharing", options)
          .find((entry) => xmppNodeHasXmlns(entry, XMPP_SIMS_NAMESPACE, options)) || null;
        if (mediaSharingNode) {
          upsertMediaSharingNode(mediaSharingNode, {
            fallbackUrl: uri,
            fallbackName: name,
            fallbackMime: mime
          });
        }
      });
    xmppElementsByLocalName(stanza, "media-sharing", options)
      .filter((node) => xmppNodeHasXmlns(node, XMPP_SIMS_NAMESPACE, options))
      .forEach((node) => upsertMediaSharingNode(node));
    xmppElementsByLocalName(stanza, "file", options)
      .filter((node) => xmppNodeHasXmlns(node, XMPP_FILE_METADATA_NAMESPACE, options))
      .forEach((node) => {
        const nameNode = xmppElementsByLocalName(node, "name", options)[0] || null;
        const descNode = xmppElementsByLocalName(node, "desc", options)[0] || null;
        const mediaTypeNode = xmppElementsByLocalName(node, "media-type", options)[0] || null;
        const uriNodes = xmppElementsByLocalName(node, "uri", options);
        const fileName = (xmppNodeText(nameNode, options) || xmppNodeText(descNode, options) || "").toString().trim();
        const fileMime = (xmppNodeText(mediaTypeNode, options) || "").toString().trim();
        uriNodes.forEach((uriNode) => {
          upsert({
            url: xmppNodeText(uriNode, options) || uriNode?.getAttribute?.("uri") || "",
            name: fileName,
            mime: fileMime
          });
        });
      });
    xmppElementsByLocalName(stanza, "img", options).forEach((node) => {
      const src = (node.getAttribute?.("src") || "").toString().trim();
      if (!src) return;
      const alt = (node.getAttribute?.("alt") || node.getAttribute?.("title") || "").toString().trim();
      const hintedMime = (node.getAttribute?.("type") || node.getAttribute?.("data-mime") || "").toString().trim();
      const bobEntry = resolveInlineBobFromUri(src);
      if (bobEntry) {
        upsert({
          url: src,
          name: alt || bobEntry.name,
          mime: bobEntry.mime
        });
        return;
      }
      if (!/^(https?:\/\/|xmpp:https?:\/\/|data:image\/|blob:)/i.test(src)) return;
      upsert({
        url: src,
        name: alt || src.split("/").pop() || "image",
        mime: hintedMime
      });
    });
    const shouldTreatLinkAsAttachment = (href, hintedMime = "", hintedType = "") => {
      const normalizedHref = (href || "").toString().trim();
      if (!normalizedHref) return false;
      const inferred = inferAttachmentTypeFromUrl(normalizedHref);
      if (inferred && inferred !== "file") return true;
      const mimeType = (hintedMime || "").toString().trim();
      const inferredFromMime = inferAttachmentTypeFromMime(mimeType);
      if (inferredFromMime && inferredFromMime !== "file") return true;
      const typeHint = (hintedType || "").toString().toLowerCase();
      if (/(sticker|image|img|gif|video|audio)/i.test(typeHint)) return true;
      return false;
    };
    xmppElementsByLocalName(stanza, "a", options).forEach((node) => {
      const href = (node.getAttribute?.("href") || "").toString().trim();
      if (!href) return;
      const hintedMime = (node.getAttribute?.("type") || node.getAttribute?.("data-mime") || "").toString().trim();
      const hintedType = (node.getAttribute?.("data-type") || "").toString().trim();
      if (!shouldTreatLinkAsAttachment(href, hintedMime, hintedType)) return;
      upsert({
        url: href,
        name: (node.getAttribute?.("title") || node.getAttribute?.("data-name") || "").toString().trim(),
        mime: hintedMime
      });
    });
    return out.slice(0, 6);
  }

  function xmppHasOobAttachmentHint(stanza, options = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return false;
    const hasOob = xmppElementsByLocalName(stanza, "x", options)
      .some((node) => xmppNodeHasXmlns(node, "jabber:x:oob", options));
    if (hasOob) return true;
    const hasInlineBob = xmppElementsByLocalName(stanza, "data", options)
      .some((node) => xmppNodeHasXmlns(node, XMPP_BOB_NAMESPACE, options));
    if (hasInlineBob) return true;
    const hasMediaSharing = xmppElementsByLocalName(stanza, "media-sharing", options)
      .some((node) => xmppNodeHasXmlns(node, XMPP_SIMS_NAMESPACE, options));
    if (hasMediaSharing) return true;
    const hasFileMetadata = xmppElementsByLocalName(stanza, "file", options)
      .some((node) => xmppNodeHasXmlns(node, XMPP_FILE_METADATA_NAMESPACE, options));
    if (hasFileMetadata) return true;
    return xmppElementsByLocalName(stanza, "reference", options)
      .filter((node) => xmppNodeHasXmlns(node, "urn:xmpp:reference:0", options))
      .some((node) => {
        const uriNode = xmppElementsByLocalName(node, "uri", options)[0] || null;
        const uri = (node.getAttribute("uri") || xmppNodeText(uriNode, options) || "").toString().trim();
        if (/^(https?:\/\/|xmpp:https?:\/\/|cid:|xmpp:cid:)/i.test(uri)) return true;
        const typeAttr = (node.getAttribute("type") || "").toString().trim().toLowerCase();
        if (typeAttr === "data" || typeAttr === "media" || typeAttr === "file") return true;
        const mediaTypeNode = xmppElementsByLocalName(node, "media-type", options)[0] || null;
        const mediaType = (node.getAttribute("media-type") || xmppNodeText(mediaTypeNode, options) || "").toString().trim().toLowerCase();
        return mediaType.includes("/");
      });
  }

  function xmppExtractOobUrls(stanza, options = {}) {
    return xmppExtractOobAttachments(stanza, options).map((entry) => entry.url);
  }

  function xmppExtractLooseAttachmentEntries(stanza, { hintName = "", hintMime = "" } = {}, options = {}) {
    if (!stanza) return [];
    const nameHint = (hintName || "").toString().trim().slice(0, 120);
    const mimeHint = (hintMime || "").toString().trim().toLowerCase().slice(0, 120);
    const inferAttachmentTypeFromUrl = typeof options.inferAttachmentTypeFromUrlFn === "function"
      ? options.inferAttachmentTypeFromUrlFn
      : (() => "");
    const inferAttachmentTypeFromMime = typeof options.inferAttachmentTypeFromMimeFn === "function"
      ? options.inferAttachmentTypeFromMimeFn
      : (() => "");
    let serialized = "";
    try {
      if (typeof options.xmppSerializePayloadFn === "function") serialized = options.xmppSerializePayloadFn(stanza);
    } catch {
      serialized = "";
    }
    if (!serialized && typeof stanza.textContent === "string") serialized = stanza.textContent;
    const seen = new Set();
    const out = [];
    const isLikelyLooseAttachmentUrl = (rawUrl = "") => {
      const candidate = (rawUrl || "").toString().trim();
      if (!/^https?:\/\//i.test(candidate)) return false;
      let parsed = null;
      try {
        parsed = new URL(candidate);
      } catch {
        return false;
      }
      const host = (parsed.hostname || "").toLowerCase();
      const path = (parsed.pathname || "").toLowerCase();
      if (
        ["jabber.org", "www.jabber.org", "w3.org", "www.w3.org", "xmpp.org", "www.xmpp.org"].includes(host)
        && (
          /\/protocol\//.test(path)
          || /\/tr\//.test(path)
          || /\/ns\//.test(path)
          || /xhtml/.test(path)
        )
      ) {
        return false;
      }
      const inferred = inferAttachmentTypeFromUrl(candidate) || inferAttachmentTypeFromMime(mimeHint);
      if (inferred && inferred !== "file") return true;
      if (/\.(png|jpe?g|gif|webp|apng|lottie|mp4|webm|mov|m4v|mp3|ogg|wav|m4a|flac|svg|pdf)(\?|$|#|&)/i.test(candidate)) {
        return true;
      }
      if (/\/(stickers?|uploads?|attachments?|media|files?)\//i.test(path)) return true;
      return false;
    };
    const pattern = /https?:\/\/[^\s<>"']+/gi;
    let match = pattern.exec(serialized);
    while (match) {
      const candidate = (match[0] || "").toString().replace(/[)\],.!?]+$/g, "").trim();
      if (candidate && !seen.has(candidate.toLowerCase()) && isLikelyLooseAttachmentUrl(candidate)) {
        seen.add(candidate.toLowerCase());
        out.push({
          url: candidate,
          name: nameHint || candidate.split("/").pop() || "attachment",
          mime: mimeHint
        });
        if (out.length >= 6) break;
      }
      match = pattern.exec(serialized);
    }
    return out;
  }

  function xmppAttachmentsFromOobEntries(entries, options = {}) {
    const inferAttachmentTypeFromUrl = typeof options.inferAttachmentTypeFromUrlFn === "function"
      ? options.inferAttachmentTypeFromUrlFn
      : (() => "");
    const inferAttachmentTypeFromMime = typeof options.inferAttachmentTypeFromMimeFn === "function"
      ? options.inferAttachmentTypeFromMimeFn
      : (() => "");
    const inferAttachmentFormat = typeof options.inferAttachmentFormatFn === "function"
      ? options.inferAttachmentFormatFn
      : (() => "");
    const normalizeAttachments = typeof options.normalizeAttachmentsFn === "function"
      ? options.normalizeAttachmentsFn
      : ((items) => items);
    if (!Array.isArray(entries) || entries.length === 0) return [];
    const out = [];
    entries.forEach((entry) => {
      const clean = (typeof entry === "string" ? entry : entry?.url || "").toString().trim();
      if (!clean) return;
      const preferredName = typeof entry === "string" ? "" : (entry?.name || "").toString().trim();
      const preferredMime = typeof entry === "string" ? "" : (entry?.mime || "").toString().trim();
      let type = inferAttachmentTypeFromUrl(clean)
        || inferAttachmentTypeFromUrl(preferredName)
        || inferAttachmentTypeFromMime(preferredMime)
        || "file";
      const stickerHint = /\bsticker\b/i.test(preferredName)
        || /\baufkleber\b/i.test(preferredName)
        || (/image\/webp/i.test(preferredMime) && /\bsticker\b/i.test(preferredName))
        || /\/stickers?\//i.test(clean);
      if ((type === "gif" || type === "file") && stickerHint) type = "sticker";
      out.push({
        type,
        url: clean,
        name: preferredName || clean.split("/").pop() || clean,
        format: inferAttachmentFormat(type, clean),
        mime: preferredMime
      });
    });
    return normalizeAttachments(out);
  }

  function xmppAttachmentsFromUrls(urls, options = {}) {
    const entries = Array.isArray(urls) ? urls.map((url) => ({ url })) : [];
    return xmppAttachmentsFromOobEntries(entries, options);
  }

  function xmppLooksLikeAttachmentFallbackText(text = "") {
    const normalized = decodeHtmlEntities((text || "").toString())
      .trim()
      .toLowerCase()
      .replace(/[.!?]+$/g, "")
      .trim();
    if (!normalized) return false;
    if (/^(ein|a)\s+sticker\b/.test(normalized) && /\b(sent|versendet|gesendet)\b/.test(normalized)) return true;
    if (/^sent\s+a\s+sticker\b/.test(normalized)) return true;
    if (/^sticker\s+sent\b/.test(normalized)) return true;
    if (/^\bsticker\b/.test(normalized) && /\b(sent|versendet|gesendet)\b/.test(normalized)) return true;
    if (/^(ein|a)\s+aufkleber\b/.test(normalized) && /\b(sent|versendet|gesendet)\b/.test(normalized)) return true;
    return false;
  }

  function xmppXhtmlNodeToInlineText(node, options = {}) {
    if (!node) return "";
    if (node.nodeType === 3) return (node.nodeValue || "").toString();
    const tag = ((node.nodeName || "").toString().split(":").pop() || "").toLowerCase();
    if (tag === "br") return "\n";
    const childText = [...(node.childNodes || [])].map((child) => xmppXhtmlNodeToInlineText(child, options)).join("");
    if (tag === "strong" || tag === "b") return `**${childText}**`;
    if (tag === "em" || tag === "i") return `*${childText}*`;
    if (tag === "u") return `__${childText}__`;
    if (tag === "s" || tag === "strike" || tag === "del") return `~~${childText}~~`;
    if (tag === "code") return `\`${childText}\``;
    if (tag === "pre") return `\`\`\`\n${childText}\n\`\`\`\n`;
    if (tag === "a") {
      const href = (node.getAttribute?.("href") || "").toString().trim();
      return href ? `[${childText || href}](${href})` : childText;
    }
    if (tag === "blockquote") {
      return childText
        .split("\n")
        .map((line) => `> ${line}`.trimEnd())
        .join("\n");
    }
    if (tag === "span") {
      const style = (node.getAttribute?.("style") || "").toString().toLowerCase();
      let output = childText;
      if (style.includes("font-weight:bold") || style.includes("font-weight: 700")) output = `**${output}**`;
      if (style.includes("font-style:italic")) output = `*${output}*`;
      if (style.includes("text-decoration:underline")) output = `__${output}__`;
      if (style.includes("line-through")) output = `~~${output}~~`;
      return output;
    }
    if (tag === "ul") return `${childText}\n`;
    if (tag === "ol") {
      const items = xmppElementsByLocalName(node, "li", options);
      if (items.length === 0) return `${childText}\n`;
      return `${items.map((item, index) => `${index + 1}. ${xmppXhtmlNodeToInlineText(item, options).trim()}`).join("\n")}\n`;
    }
    if (tag === "li") return `${childText}\n`;
    if (tag === "hr") return "\n---\n";
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return `**${childText.trim()}**\n`;
    if (tag === "p" || tag === "div") return `${childText}\n`;
    return childText;
  }

  function xmppPreferredBodyText(stanza, options = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return "";
    const markdownNode = xmppElementsByLocalName(stanza, "content", options)
      .find((node) => {
        if (!xmppNodeHasXmlns(node, "urn:xmpp:content", options)) return false;
        const type = (node.getAttribute("type") || "").toString().trim().toLowerCase();
        return type === "text/markdown";
      }) || null;
    const markdownText = decodeHtmlEntities(xmppNodeText(markdownNode, options)).trim();
    if (markdownText) return markdownText;
    const htmlNode = xmppElementsByLocalName(stanza, "html", options)
      .find((node) => xmppNodeHasXmlns(node, XMPP_XHTML_IM_NAMESPACE, options)) || null;
    const xhtmlBody = htmlNode
      ? xmppElementsByLocalName(htmlNode, "body", options)
        .find((node) => xmppNodeHasXmlns(node, XHTML_NAMESPACE, options)) || null
      : null;
    if (!xhtmlBody) {
      const textNode = xmppElementsByLocalName(stanza, "content", options)
        .find((node) => {
          if (!xmppNodeHasXmlns(node, "urn:xmpp:content", options)) return false;
          const type = (node.getAttribute("type") || "").toString().trim().toLowerCase();
          return type === "text/plain";
        }) || null;
      return decodeHtmlEntities(xmppNodeText(textNode, options)).trim();
    }
    const text = xmppXhtmlNodeToInlineText(xhtmlBody, options)
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return decodeHtmlEntities(text);
  }

  globalScope.SHITCORD67_XEP_0066_0071_0231_MEDIA = Object.freeze({
    decodeHtmlEntities,
    xmppNormalizeBobCid,
    xmppInlineBobEntries,
    xmppParseBobDataNode,
    xmppExtractBobCidCandidates,
    xmppExtractOobAttachments,
    xmppHasOobAttachmentHint,
    xmppExtractOobUrls,
    xmppExtractLooseAttachmentEntries,
    xmppAttachmentsFromOobEntries,
    xmppAttachmentsFromUrls,
    xmppLooksLikeAttachmentFallbackText,
    xmppXhtmlNodeToInlineText,
    xmppPreferredBodyText
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0066_0071_0231-oob-media", globalScope.SHITCORD67_XEP_0066_0071_0231_MEDIA);
  }
})(typeof window !== "undefined" ? window : globalThis);
