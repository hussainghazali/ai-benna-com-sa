// Cross-app links: this standalone site has no storefront pages of its own.
export const STORE_URL = "https://store.benna.com.sa";
export const CHAT_URL = "https://chat.benna.com.sa";

export const BOQ_URL = "https://boq.benna.com.sa";

/** BOQ builder lives on its own site; backend may send /build-project or /build-my-project. */
const BOQ_PATH = /^\/build-(my-)?project(?=[/?#]|$)/i;

/** Maps backend/storefront hrefs to the right Benna app: BOQ site, else the main store. */
export const storeUrl = (href: string): string => {
  let path = href;
  if (/^https?:\/\//i.test(href)) {
    try {
      const u = new URL(href);
      if (u.origin !== STORE_URL) return href;
      path = `${u.pathname}${u.search}${u.hash}`;
    } catch {
      return href;
    }
  }
  if (!path.startsWith("/")) path = `/${path}`;
  const m = BOQ_PATH.exec(path);
  if (m) return `${BOQ_URL}/build-project${path.slice(m[0].length)}`;
  return `${STORE_URL}${path}`;
};

/** Main-store product detail page. */
export const storeProductUrl = (slugOrId: string | number): string =>
  `${STORE_URL}/product/${encodeURIComponent(String(slugOrId))}`;
