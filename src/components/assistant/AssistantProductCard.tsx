// src/components/assistant/AssistantProductCard.tsx
import { ShoppingCart, MessageSquare } from "lucide-react";
import { storeProductUrl } from "@/lib/store-url";
import { useLanguage } from "@/contexts/LanguageContext";
import RiyalSymbol from "@/components/ui/RiyalSymbol";
import { getProductImage } from "@/utils/imageUtils";
import type { AssistantProduct } from "@/lib/api-assistant";

const fmt = (n: number) =>
  n >= 1000 ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(n);

interface Props {
  product: AssistantProduct;
  onChat?: (product: AssistantProduct) => void;
}

const AssistantProductCard = ({ product, onChat }: Props) => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const name = isAr && product.nameArabic ? product.nameArabic : product.name;
  const price = product.effectivePrice || product.price;
  // Standalone site: every product opens the main store PDP.
  const href = storeProductUrl(product.slug || product.productId);

  return (
    <div className="flex gap-3 rounded-xl border border-ali-line-200 bg-white p-3 transition-shadow hover:shadow-sm">
      <a href={href} className="shrink-0">
        <img
          src={getProductImage(product.image, "/placeholder.svg")}
          alt={name}
          loading="lazy"
          className="h-16 w-16 rounded-xl border border-ali-line-200/60 bg-white object-contain"
        />
      </a>

      <div className="min-w-0 flex-1">
        <a
          href={href}
          className="line-clamp-2 text-[13px] font-normal leading-snug text-ali-ink-900 hover:text-ali-orange-500"
        >
          {name}
        </a>
        {product.brand ? (
          <p className="mt-0.5 text-[11px] text-ali-ink-500">{product.brand}</p>
        ) : null}

        <div className="mt-1 flex items-center gap-2">
          {product.isRFQ ? (
            <span className="text-[12px] text-ali-ink-500">
              {isAr ? "السعر عند الطلب" : "Price on request"}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[13px] font-medium text-ali-ink-900">
              <RiyalSymbol className="text-[12px]" />
              {fmt(price)}
              {product.unit ? (
                <span className="text-[11px] font-normal text-ali-ink-500">
                  /{product.unit}
                </span>
              ) : null}
            </span>
          )}
          {!product.inStock ? (
            <span className="rounded-lg bg-muted px-1.5 py-0.5 text-[10px] text-ali-ink-500">
              {isAr ? "غير متوفر" : "Out of stock"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-stretch justify-center gap-1.5">
        {product.isRFQ ? (
          <button
            type="button"
            onClick={() => onChat?.(product)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-ali-orange-500 px-2.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {isAr ? "تحدث مع البائع" : "Chat with seller"}
          </button>
        ) : (
          <>
            <a
              href={href}
              aria-disabled={!product.inStock}
              className={`flex items-center justify-center gap-1.5 rounded-lg bg-ali-orange-500 px-2.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 ${
                product.inStock ? "" : "pointer-events-none opacity-50"
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {isAr ? "أضف" : "Add"}
            </a>
            <button
              type="button"
              onClick={() => onChat?.(product)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-ali-line-200 px-2.5 py-1.5 text-[11px] text-ali-ink-900 hover:bg-ali-bg-100"
            >
              <MessageSquare className="h-3 w-3" />
              {isAr ? "تحدث مع البائع" : "Chat with seller"}
            </button>
          </>
        )}
      </div>

    </div>
  );
};

export default AssistantProductCard;
