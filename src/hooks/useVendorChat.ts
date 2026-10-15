import { useState, useEffect } from "react";
import {
  getCurrentUserDetail,
  subscribeToAuthSession,
} from "@/lib/auth-session";
import { apiClient } from "@/lib/api-client";
import { getProductImage } from "@/utils/imageUtils";

export interface ChatSession {
  chatId: string;
  productId: string | number;
  vendorId: string;
  customerId: string;
  productName: string;
  productImage?: string | null;
  productPrice?: number;
}

export interface Product {
  id: string | number;
  name: string;
  vendorId?: string;
  image?: string | string[] | null;
  productImage?: string | string[] | null;
  productImageUrl?: string | string[] | null;
  price?: number;
}

export const useVendorChat = () => {
  const [openChats, setOpenChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");

  useEffect(() => {
    const syncCustomerId = () => {
      const user = getCurrentUserDetail();
      setCustomerId(user?._id || user?.email || "");
    };

    syncCustomerId();
    return subscribeToAuthSession(syncCustomerId);
  }, []);

  const openChat = (product: Product): boolean => {
    // Require authentication before opening chat
    const user = getCurrentUserDetail();
    if (!user) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("openLoginModal", { detail: { reason: "chat" } }),
        );
      }
      return false;
    }

    const currentCustomerId = user._id || customerId || user.email;
    const productId = String(product.id || "unknown");
    const vendorId = String(product.vendorId || "vendor_default");
    const resolvedImage = getProductImage(
      product.image ||
        product.productImage ||
        product.productImageUrl ||
        undefined,
      "",
    );
    const initialProductImage = resolvedImage || null;

    const chatId = `product_${productId}_vendor_${vendorId}_customer_${currentCustomerId}`;

    if (!openChats.find((c) => c.chatId === chatId)) {
      setOpenChats((prev) => [
        ...prev,
        {
          chatId,
          productId,
          vendorId,
          customerId: currentCustomerId,
          productName: product.name,
          productImage: initialProductImage,
          productPrice: product.price || 0,
        },
      ]);
    }

    const shouldHydrate =
      (!initialProductImage || !product.price || product.price <= 0) &&
      productId !== "unknown";
    if (shouldHydrate) {
      void apiClient<{
        data?: {
          name?: string;
          productImageUrl?: string | string[];
          price?: number;
        };
      }>(`/users/website/chat/product/${productId}/details`)
        .then((response) => {
          const data = response?.data;
          if (!data) return;

          const fetchedImage =
            getProductImage(data.productImageUrl || undefined, "") || null;
          const fetchedName = data.name || product.name;
          const fetchedPrice = data.price || product.price || 0;

          setOpenChats((prev) =>
            prev.map((chat) =>
              chat.chatId === chatId
                ? {
                    ...chat,
                    productName: chat.productName || fetchedName,
                    productImage: chat.productImage || fetchedImage,
                    productPrice:
                      chat.productPrice && chat.productPrice > 0
                        ? chat.productPrice
                        : fetchedPrice,
                  }
                : chat,
            ),
          );
        })
        .catch(() => {
          // Keep chat usable even if hydration fails.
        });
    }

    setActiveChatId(chatId);
    setShowChat(true);
    return true;
  };

  const closeChat = (chatId: string) => {
    setOpenChats((prev) => prev.filter((c) => c.chatId !== chatId));
    if (activeChatId === chatId) {
      const remaining = openChats.filter((c) => c.chatId !== chatId);
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].chatId);
      } else {
        setActiveChatId(null);
        setShowChat(false);
      }
    }
  };

  return {
    openChats,
    setOpenChats,
    activeChatId,
    setActiveChatId,
    showChat,
    setShowChat,
    customerId,
    openChat,
    closeChat,
  };
};
