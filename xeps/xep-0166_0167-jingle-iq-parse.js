(function initXep0166_0167JingleIqParse(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0166_0167_JINGLE_IQ_PARSE) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};
  const XMPP_JINGLE_NAMESPACE = "urn:xmpp:jingle:1";
  const XMPP_JINGLE_RTP_NAMESPACE = "urn:xmpp:jingle:apps:rtp:1";
  const XMPP_JINGLE_ICE_UDP_NAMESPACE = "urn:xmpp:jingle:transports:ice-udp:1";
  const XMPP_JINGLE_RTP_INFO_NAMESPACE = "urn:xmpp:jingle:apps:rtp:info:1";
  const XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE = "urn:xmpp:jingle:apps:rtp:rtcp-fb:0";
  const XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE = "urn:xmpp:jingle:apps:rtp:rtp-hdrext:0";
  const XMPP_JINGLE_RTP_SSMA_NAMESPACE = "urn:xmpp:jingle:apps:rtp:ssma:0";

  function xmppElementsByLocalName(root, name = "") {
    if (typeof xml.xmppElementsByLocalName === "function") return xml.xmppElementsByLocalName(root, name);
    if (!root || typeof root.getElementsByTagName !== "function") return [];
    const wanted = (name || "").toString().trim().toLowerCase();
    return wanted ? [...root.getElementsByTagName(wanted)] : [];
  }

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    if (!node || typeof node.getAttribute !== "function") return false;
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    return nodeXmlns === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppNodeXmlns(node) {
    if (typeof xml.xmppNodeXmlns === "function") return xml.xmppNodeXmlns(node);
    if (!node || typeof node.getAttribute !== "function") return "";
    const inline = (node.getAttribute("xmlns") || "").toString().trim().toLowerCase();
    if (inline) return inline;
    return (node.namespaceURI || "").toString().trim().toLowerCase();
  }

  function xmppNodeText(node) {
    if (typeof xml.xmppNodeText === "function") return xml.xmppNodeText(node);
    return (node?.textContent || "").toString();
  }

  function parseXmppJingleIq(stanza, { bareJidFn = (value) => (value || "").toString().trim().toLowerCase() } = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const jingle = xmppElementsByLocalName(stanza, "jingle")
      .find((node) => xmppNodeHasXmlns(node, XMPP_JINGLE_NAMESPACE)) || null;
    if (!jingle) return null;
    const action = (jingle.getAttribute("action") || "").toString().trim().toLowerCase();
    const sid = (jingle.getAttribute("sid") || "").toString().trim();
    const initiator = bareJidFn(jingle.getAttribute("initiator") || "");
    const responder = bareJidFn(jingle.getAttribute("responder") || "");
    const contents = xmppElementsByLocalName(jingle, "content")
      .map((contentNode) => {
        const description = xmppElementsByLocalName(contentNode, "description")
          .find((node) => xmppNodeHasXmlns(node, XMPP_JINGLE_RTP_NAMESPACE)) || null;
        const contentName = (contentNode.getAttribute("name") || "").toString().trim();
        const describedMedia = (description?.getAttribute("media") || "").toString().trim().toLowerCase();
        const inferredMedia = contentName.toLowerCase().includes("video")
          ? "video"
          : (contentName.toLowerCase().includes("audio") ? "audio" : "");
        const media = describedMedia === "audio" || describedMedia === "video" ? describedMedia : inferredMedia;
        const senders = (contentNode.getAttribute("senders") || "both").toString().trim().toLowerCase() || "both";
        if (!media && !contentName) return null;
        const payloadTypes = [...(description ? xmppElementsByLocalName(description, "payload-type") : [])]
          .map((payloadNode) => ({
            id: Number(payloadNode.getAttribute("id") || 0) || 0,
            name: (payloadNode.getAttribute("name") || "").toString().trim(),
            clockrate: Number(payloadNode.getAttribute("clockrate") || 0) || 0,
            channels: Number(payloadNode.getAttribute("channels") || 0) || 0,
            rtcpFeedback: xmppElementsByLocalName(payloadNode, "rtcp-fb")
              .filter((feedbackNode) => (
                feedbackNode.parentNode === payloadNode
                && (
                  xmppNodeHasXmlns(feedbackNode, XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE)
                  || xmppNodeHasXmlns(feedbackNode, XMPP_JINGLE_RTP_NAMESPACE)
                  || !xmppNodeXmlns(feedbackNode)
                )
              ))
              .map((feedbackNode) => ({
                type: (feedbackNode.getAttribute("type") || "").toString().trim().toLowerCase(),
                subtype: (feedbackNode.getAttribute("subtype") || "").toString().trim().toLowerCase()
              }))
              .filter((feedback) => feedback.type),
            parameters: xmppElementsByLocalName(payloadNode, "parameter")
              .map((parameterNode) => ({
                name: (parameterNode.getAttribute("name") || "").toString().trim(),
                value: (parameterNode.getAttribute("value") || "").toString().trim()
              }))
              .filter((param) => param.name)
          }))
          .filter((payload) => payload.id > 0);
        const rtcpFeedback = [...(description ? xmppElementsByLocalName(description, "rtcp-fb") : [])]
          .filter((feedbackNode) => (
            feedbackNode.parentNode === description
            && (
              xmppNodeHasXmlns(feedbackNode, XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE)
              || xmppNodeHasXmlns(feedbackNode, XMPP_JINGLE_RTP_NAMESPACE)
              || !xmppNodeXmlns(feedbackNode)
            )
          ))
          .map((feedbackNode) => ({
            type: (feedbackNode.getAttribute("type") || "").toString().trim().toLowerCase(),
            subtype: (feedbackNode.getAttribute("subtype") || "").toString().trim().toLowerCase()
          }))
          .filter((feedback) => feedback.type);
        const extmaps = [...(description ? xmppElementsByLocalName(description, "rtp-hdrext") : [])]
          .filter((extNode) => (
            extNode.parentNode === description
            && (
              xmppNodeHasXmlns(extNode, XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE)
              || xmppNodeHasXmlns(extNode, XMPP_JINGLE_RTP_NAMESPACE)
              || !xmppNodeXmlns(extNode)
            )
          ))
          .map((extNode) => ({
            id: Number(extNode.getAttribute("id") || 0) || 0,
            uri: (extNode.getAttribute("uri") || "").toString().trim(),
            direction: (extNode.getAttribute("senders") || "").toString().trim().toLowerCase(),
            attributes: (extNode.getAttribute("attributes") || "").toString().trim()
          }))
          .filter((ext) => ext.id > 0 && ext.uri);
        const sources = [...(description ? xmppElementsByLocalName(description, "source") : [])]
          .filter((sourceNode) => (
            sourceNode.parentNode === description
            && (
              xmppNodeHasXmlns(sourceNode, XMPP_JINGLE_RTP_SSMA_NAMESPACE)
              || xmppNodeHasXmlns(sourceNode, XMPP_JINGLE_RTP_NAMESPACE)
              || !xmppNodeXmlns(sourceNode)
            )
          ))
          .map((sourceNode) => ({
            ssrc: Number(sourceNode.getAttribute("ssrc") || 0) || 0,
            parameters: xmppElementsByLocalName(sourceNode, "parameter")
              .map((parameterNode) => ({
                name: (parameterNode.getAttribute("name") || "").toString().trim(),
                value: (parameterNode.getAttribute("value") || "").toString().trim()
              }))
              .filter((param) => param.name)
          }))
          .filter((source) => source.ssrc > 0);
        const sourceGroups = [...(description ? xmppElementsByLocalName(description, "source-group") : [])]
          .filter((groupNode) => (
            groupNode.parentNode === description
            && (
              xmppNodeHasXmlns(groupNode, XMPP_JINGLE_RTP_SSMA_NAMESPACE)
              || xmppNodeHasXmlns(groupNode, XMPP_JINGLE_RTP_NAMESPACE)
              || !xmppNodeXmlns(groupNode)
            )
          ))
          .map((groupNode) => ({
            semantics: (groupNode.getAttribute("semantics") || "").toString().trim().toUpperCase(),
            sources: xmppElementsByLocalName(groupNode, "source")
              .filter((sourceNode) => (
                sourceNode.parentNode === groupNode
                && (
                  xmppNodeHasXmlns(sourceNode, XMPP_JINGLE_RTP_SSMA_NAMESPACE)
                  || xmppNodeHasXmlns(sourceNode, XMPP_JINGLE_RTP_NAMESPACE)
                  || !xmppNodeXmlns(sourceNode)
                )
              ))
              .map((sourceNode) => Number(sourceNode.getAttribute("ssrc") || 0) || 0)
              .filter((ssrc) => ssrc > 0)
          }))
          .filter((group) => group.semantics && group.sources.length > 0);
        const transportNode = xmppElementsByLocalName(contentNode, "transport")
          .find((node) => xmppNodeHasXmlns(node, XMPP_JINGLE_ICE_UDP_NAMESPACE)) || null;
        const fingerprintNode = transportNode
          ? xmppElementsByLocalName(transportNode, "fingerprint")[0] || null
          : null;
        const transport = transportNode
          ? {
            ufrag: (transportNode.getAttribute("ufrag") || "").toString().trim(),
            pwd: (transportNode.getAttribute("pwd") || "").toString().trim(),
            setup: (fingerprintNode?.getAttribute("setup") || "").toString().trim().toLowerCase(),
            hash: (fingerprintNode?.getAttribute("hash") || "sha-256").toString().trim().toLowerCase(),
            fingerprint: xmppNodeText(fingerprintNode).trim(),
            candidateCount: xmppElementsByLocalName(transportNode, "candidate").length
          }
          : null;
        return {
          name: contentName,
          creator: (contentNode.getAttribute("creator") || "").toString().trim().toLowerCase(),
          senders,
          media,
          rtcpFeedback,
          extmaps,
          sources,
          sourceGroups,
          payloadTypes,
          transport
        };
      })
      .filter(Boolean);
    const media = contents
      .map((entry) => entry.media)
      .filter((item) => item === "audio" || item === "video");
    const reasonNode = xmppElementsByLocalName(jingle, "reason")[0] || null;
    const infoNode = [...jingle.childNodes]
      .find((node) => node?.nodeType === 1 && xmppNodeHasXmlns(node, XMPP_JINGLE_RTP_INFO_NAMESPACE)) || null;
    const info = infoNode ? (infoNode.nodeName || "").toString().trim().toLowerCase() : "";
    const transportUpdates = xmppElementsByLocalName(jingle, "content")
      .map((contentNode) => {
        const transportNode = xmppElementsByLocalName(contentNode, "transport")
          .find((node) => xmppNodeHasXmlns(node, XMPP_JINGLE_ICE_UDP_NAMESPACE)) || null;
        if (!transportNode) return null;
        const contentName = (contentNode.getAttribute("name") || "").toString().trim();
        const describedMedia = xmppElementsByLocalName(contentNode, "description")
          .find((node) => xmppNodeHasXmlns(node, XMPP_JINGLE_RTP_NAMESPACE))
          ?.getAttribute("media") || "";
        const media = (describedMedia || "").toString().trim().toLowerCase()
          || (contentName.toLowerCase().includes("video") ? "video" : (contentName.toLowerCase().includes("audio") ? "audio" : ""));
        const fingerprintNode = xmppElementsByLocalName(transportNode, "fingerprint")[0] || null;
        const candidates = xmppElementsByLocalName(transportNode, "candidate").map((candidate) => ({
          foundation: (candidate.getAttribute("foundation") || "").toString().trim(),
          component: Number(candidate.getAttribute("component") || 0) || 0,
          protocol: (candidate.getAttribute("protocol") || "").toString().trim().toLowerCase(),
          priority: Number(candidate.getAttribute("priority") || 0) || 0,
          ip: (candidate.getAttribute("ip") || "").toString().trim(),
          port: Number(candidate.getAttribute("port") || 0) || 0,
          type: (candidate.getAttribute("type") || "").toString().trim().toLowerCase(),
          contentName,
          media: (media || "").toString().trim().toLowerCase()
        }));
        return {
          contentName,
          media: (media || "").toString().trim().toLowerCase(),
          ufrag: (transportNode.getAttribute("ufrag") || "").toString().trim(),
          pwd: (transportNode.getAttribute("pwd") || "").toString().trim(),
          setup: (fingerprintNode?.getAttribute("setup") || "").toString().trim().toLowerCase(),
          hash: (fingerprintNode?.getAttribute("hash") || "sha-256").toString().trim().toLowerCase(),
          fingerprint: xmppNodeText(fingerprintNode).trim(),
          candidateCount: candidates.length,
          candidates
        };
      })
      .filter(Boolean);
    let reason = "";
    let reasonText = "";
    if (reasonNode) {
      const child = [...(reasonNode.childNodes || [])]
        .find((node) => node?.nodeType === 1 && (node.nodeName || "").toLowerCase() !== "text") || null;
      reason = (child?.nodeName || "").toString().trim().toLowerCase();
      const textNode = xmppElementsByLocalName(reasonNode, "text")[0] || null;
      reasonText = xmppNodeText(textNode).trim();
    }
    return {
      action,
      sid,
      initiator,
      responder,
      media,
      contents,
      reason,
      reasonText,
      info,
      transportUpdates
    };
  }

  globalScope.SHITCORD67_XEP_0166_0167_JINGLE_IQ_PARSE = Object.freeze({
    parseXmppJingleIq
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0166_0167-jingle-iq-parse", globalScope.SHITCORD67_XEP_0166_0167_JINGLE_IQ_PARSE);
  }
})(typeof window !== "undefined" ? window : globalThis);
