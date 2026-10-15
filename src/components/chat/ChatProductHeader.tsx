import { locNum } from "@/utils/formatPrice";
import RiyalSymbol from "@/components/ui/RiyalSymbol";
import { Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatProductHeaderProps {
  productId: number | string;
  vendorId: string;
  productName: string;
  productImage?: string | null;
  productPrice?: number;
}

const ChatProductHeader = ({
  productName,
  productImage,
  productPrice,
}: ChatProductHeaderProps) => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const tx = (en: string, ar: string) => (isAr ? ar : en);
  if (!productName) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#DDDDDD] bg-[#F4F4F4]">
      {/* Product Image */}
      <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-[#DDDDDD] shadow-[rgba(0,0,0,0.2)_0px_0px_32px_8px]">
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              // Show fallback icon when image fails
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                const fallback = document.createElement("div");
                fallback.className =
                  "w-full h-full flex items-center justify-center";
                fallback.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#666666]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>';
                parent.appendChild(fallback);
                (e.target as HTMLImageElement).style.display = "none";
              }
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-[#666666]" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-normal text-[#222222] truncate leading-tight">
          {productName}
        </p>
        {typeof productPrice === "number" && productPrice > 0 && (
          <p className="text-sm font-normal text-[#FF6600] mt-1 flex items-center gap-0.5">
            <RiyalSymbol />
            <span>{locNum(productPrice)}</span>
          </p>
        )}
      </div>

      {/* Optional: Warranty badge */}
      <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F4F4F4]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#FF6600]"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="text-[10px] font-normal text-[#FF6600] uppercase tracking-widest">
          {tx("Check for Warranty", "تحقق من الضمان")}
        </span>
      </div>
    </div>
  );
};

export default ChatProductHeader;
