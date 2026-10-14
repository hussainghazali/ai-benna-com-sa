// src/lib/boq-cart-flag.ts
// Tracks which cart line items came from a BOQ generation. The Mongo cart
// schema is strict (no extra fields survive a round-trip), so the flag lives
// client-side keyed by productId — enough to warn the shopper before mixing a
// BOQ package with ad-hoc browsing items.
const KEY = "benna-boq-cart-items";

const read = (): Set<string> => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
};

const write = (ids: Set<string>) => {
  try {
    if (ids.size === 0) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
  } catch {
    /* quota */
  }
};

export const getBoqCartItemIds = (): string[] => Array.from(read());

export const isBoqCartItem = (productId: string): boolean =>
  read().has(String(productId));

export const markBoqCartItem = (productId: string) => {
  const ids = read();
  ids.add(String(productId));
  write(ids);
};

export const unmarkBoqCartItem = (productId: string) => {
  const ids = read();
  if (ids.delete(String(productId))) write(ids);
};

export const clearBoqCartItems = () => write(new Set());

/** True when any product currently in the cart is flagged as a BOQ item. */
export const cartHasBoqItems = (
  products?: Array<{ productId: string }> | null,
): boolean => {
  if (!products?.length) return false;
  const ids = read();
  if (ids.size === 0) return false;
  return products.some((p) => ids.has(String(p.productId)));
};

/** Count of flagged BOQ items present in the given cart products. */
export const countBoqItems = (
  products?: Array<{ productId: string }> | null,
): number => {
  if (!products?.length) return 0;
  const ids = read();
  return products.filter((p) => ids.has(String(p.productId))).length;
};
