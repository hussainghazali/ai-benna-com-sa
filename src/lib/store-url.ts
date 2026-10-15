// Cross-app links: this standalone site has no storefront pages of its own.
export const STORE_URL = "https://store.benna.com.sa";
export const CHAT_URL = "https://chat.benna.com.sa";

/** Absolute URLs pass through; site-relative paths point at the main store. */
export const storeUrl = (href: string): string =>
  /^https?:\/\//i.test(href) ? href : `${STORE_URL}${href.startsWith("/") ? "" : "/"}${href}`;

/** Main-store product detail page. */
export const storeProductUrl = (slugOrId: string | number): string =>
  `${STORE_URL}/product/${encodeURIComponent(String(slugOrId))}`;
