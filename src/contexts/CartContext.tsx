// Minimal cart context — localStorage-backed so "Add to cart" behaves like the
// real storefront without needing the full catalog backend. Exposes the same
// shape the storefront CartDrawer expects (cartData/itemCount/updateQuantity…).
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  productName: string;
  uniqueProductSlug?: string;
  productPrice: number;
  productQuantity: number;
  productImageUrl?: string;
  vendorId?: string;
  availableStock?: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (item: CartItem, opts?: { source?: string }) => Promise<boolean>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  cartData: {
    products: CartItem[];
    subTotal: number;
    vat: number;
    cartTotal: number;
  };
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const readCart = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem("benna-cart") || "[]");
  } catch {
    return [];
  }
};

const persist = (items: CartItem[]) => {
  try {
    localStorage.setItem("benna-cart", JSON.stringify(items));
  } catch {
    /* ignore */
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback(async (item: CartItem) => {
    setItems((prev) => {
      const next = prev.some((i) => i.productId === item.productId)
        ? prev.map((i) =>
            i.productId === item.productId
              ? { ...i, productQuantity: i.productQuantity + item.productQuantity }
              : i,
          )
        : [...prev, item];
      persist(next);
      return next;
    });
    return true;
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      persist(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((i) => i.productId !== productId)
          : prev.map((i) =>
              i.productId === productId ? { ...i, productQuantity: quantity } : i,
            );
      persist(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
    setItems([]);
  }, []);

  const cartData = useMemo(() => {
    const subTotal = items.reduce(
      (sum, i) => sum + i.productPrice * i.productQuantity,
      0,
    );
    const vat = subTotal * 0.15;
    return { products: items, subTotal, vat, cartTotal: subTotal + vat };
  }, [items]);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.productQuantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        cartData,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
