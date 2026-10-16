/**
 * Checks if a chat message is allowed based on content filtering rules.
 * Blocks: phone numbers, external links (only benna.com.sa allowed), Saudi network keywords.
 */
export function isMessageAllowed(text: string): boolean {
  if (!text) return true;

  const lowerText = text.toLowerCase();

  // 1. Block Saudi network keywords
  const forbiddenKeywords = [
    "saudi network",
    "stc",
    "mobily",
    "zain",
    "virgin mobile",
  ];
  if (forbiddenKeywords.some((word) => lowerText.includes(word))) {
    return false;
  }

  // 2. Block phone numbers (Saudi formats or any 9-15 digit block)
  const phoneRegex = /(\+?966\d{8,9}|\b05\d{7,8}|\b\d{9,15}\b)/g;
  if (phoneRegex.test(lowerText.replace(/[\s\-()]/g, ""))) {
    return false;
  }

  // 3. Block unauthorized links
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b(\/[^\s]*)?)/g;
  const potentialLinks = lowerText.match(urlRegex);

  if (potentialLinks) {
    const isAllowed = potentialLinks.every((link) => {
      try {
        let parsableLink = link;
        if (!/^https?:\/\//.test(parsableLink)) {
          parsableLink = "http://" + parsableLink;
        }
        let hostname = new URL(parsableLink).hostname;
        if (hostname.startsWith("www.")) {
          hostname = hostname.substring(4);
        }
        if (hostname === "localhost") return true;
        if (hostname === "benna.com.sa" || hostname.endsWith(".benna.com.sa")) {
          return true;
        }
        return false;
      } catch {
        return false;
      }
    });
    if (!isAllowed) return false;
  }

  return true;
}
