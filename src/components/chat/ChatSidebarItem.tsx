import { getRelativeTime } from "@/utils/getRelativeTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, ShieldCheck } from "lucide-react";

interface ChatSidebarItemProps {
  chatId: string;
  productId: string | number;
  vendorId: string;
  vendorName: string;
  productName: string;
  lastMessage?: string;
  lastMessageDate?: Date | null;
  isActive: boolean;
  onClick: () => void;
  productImage?: string | null; // Passed from parent to avoid N+1
}

const ChatSidebarItem = ({
  vendorName,
  productName,
  lastMessage,
  lastMessageDate,
  isActive,
  onClick,
  productImage,
}: ChatSidebarItemProps) => {
  const isSystem = lastMessage?.startsWith("⚙️ SYSTEM GENERATED MESSAGE");
  const displayMessage = isSystem
    ? "Payment confirmed ✅"
    : lastMessage || "No messages yet";

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-start gap-3 px-4 py-3 text-left 
        transition-all duration-200 border-b 
        ${
          isActive
            ? "bg-[#FFF0E5] border-l-4 border-l-[#FF6600] border-b-[#DDDDDD]"
            : "hover:bg-[#F4F4F4] border-l-4 border-l-transparent border-b-[#DDDDDD]"
        }
      `}
    >
      {/* Product Thumbnail */}
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 rounded-lg border border-[#DDDDDD] bg-white shadow-[rgba(0,0,0,0.2)_0px_0px_32px_8px]">
          {productImage ? (
            <AvatarImage
              src={productImage}
              alt={productName}
              className="object-contain p-1"
            />
          ) : (
            <AvatarFallback className="rounded-lg bg-[#F4F4F4] text-[#666666]">
              <Package className="w-5 h-5" />
            </AvatarFallback>
          )}
        </Avatar>

        {/* Online/Warranty Badge - Optional */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FF6600] rounded-full border-2 border-white"></div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-normal text-[#222222] truncate">
            {vendorName}
          </span>
          {lastMessageDate && (
            <span className="text-[10px] font-normal text-[#666666] shrink-0">
              {getRelativeTime(lastMessageDate)}
            </span>
          )}
        </div>

        {productName && (
          <p className="text-[11px] font-normal text-[#FF6600] mt-0.5 flex items-center gap-1 min-w-0">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span className="truncate">{productName}</span>
          </p>
        )}

        <p className="text-xs text-[#999999] truncate mt-1 leading-relaxed">
          {displayMessage}
        </p>

        {/* Unread indicator - Optional */}
        {!isActive && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6600]"></div>
            <span className="text-[9px] font-normal text-[#FF6600] uppercase tracking-widest">
              New
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

export default ChatSidebarItem;
