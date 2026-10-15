import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  X,
  Minimize2,
  Maximize2,
  Search,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { resolveVendorName } from "@/utils/vendorNameCache";
import ProductPageChat from "@/components/chat/ProductPageChat";
import ChatProductHeader from "@/components/chat/ChatProductHeader";
import ChatSidebarItem from "@/components/chat/ChatSidebarItem";
import { useLanguage } from "@/contexts/LanguageContext";
import { CHAT_URL } from "@/lib/store-url";

type Translate = (en: string, ar: string) => string;

interface ChatSession {
  chatId: string;
  productId: string | number;
  vendorId: string;
  customerId: string;
  productName: string;
  productImage?: string | null;
  productPrice?: number;
}

interface ChatDataItem extends ChatSession {
  lastMessage?: string;
  lastMessageDate?: Date | null;
}

interface ChatManagerProps {
  openChats: ChatSession[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  setOpenChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  setShowChat: (show: boolean) => void;
}

const ChatManager = ({
  openChats,
  activeChatId,
  setActiveChatId,
  setOpenChats,
  setShowChat,
}: ChatManagerProps) => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const tx = useCallback<Translate>((en, ar) => (isAr ? ar : en), [isAr]);

  const [isMinimized, setIsMinimized] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorNames, setVendorNames] = useState<Record<string, string>>({});
  const [chatData, setChatData] = useState<Record<string, ChatDataItem>>({});
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setShowSidebar(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const needed = openChats
      .map((c) => c.vendorId)
      .filter((id, i, arr) => arr.indexOf(id) === i && !vendorNames[id]);

    if (needed.length === 0) return;

    Promise.all(
      needed.map(async (vendorId) => {
        const name = await resolveVendorName(vendorId);
        return { vendorId, name };
      }),
    ).then((results) => {
      setVendorNames((prev) => {
        const next = { ...prev };
        results.forEach(({ vendorId, name }) => {
          next[vendorId] = name;
        });
        return next;
      });
    });
  }, [openChats, vendorNames]);

  useEffect(() => {
    if (
      !widgetRef.current ||
      typeof window === "undefined" ||
      !window.visualViewport
    )
      return;

    const updatePosition = () => {
      if (!widgetRef.current || !window.visualViewport) return;
      widgetRef.current.style.maxHeight = `${window.visualViewport.height - 40}px`;
    };

    window.visualViewport.addEventListener("resize", updatePosition);
    window.visualViewport.addEventListener("scroll", updatePosition);
    updatePosition();

    return () => {
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
    };
  }, []);

  useEffect(() => {
    if (openChats.length === 0) {
      setChatData({});
      return;
    }

    const unsubscribes = openChats.map((chat) => {
      const chatId = chat.chatId;
      const q = query(
        collection(db, "chats", chatId, "messages_v1"),
        orderBy("createdAt", "desc"),
        limit(1),
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const lastMsg = snapshot.docs[0]?.data();
          setChatData((prev) => ({
            ...prev,
            [chatId]: {
              ...chat,
              lastMessage: lastMsg?.text,
              lastMessageDate: lastMsg?.createdAt?.toDate() || null,
            },
          }));
        },
        (error) => console.error("Chat subscription error for", chatId, error),
      );
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [openChats]);

  useEffect(() => {
    const activeIds = new Set(openChats.map((c) => c.chatId));
    setChatData((prev) => {
      const next: Record<string, ChatDataItem> = {};
      Object.entries(prev).forEach(([id, data]) => {
        if (activeIds.has(id)) next[id] = data;
      });
      return next;
    });
  }, [openChats]);

  const activeChat = useMemo(
    () =>
      chatData[activeChatId || ""] ||
      openChats.find((c) => c.chatId === activeChatId),
    [chatData, openChats, activeChatId],
  );

  const filteredChats = useMemo(() => {
    const merged = openChats.map((chat) => {
      const data = chatData[chat.chatId];
      return (
        data || { ...chat, lastMessage: undefined, lastMessageDate: undefined }
      );
    });

    return merged
      .filter((chat) => {
        const vendorName = vendorNames[chat.vendorId] || tx("Vendor", "البائع");
        const term = searchTerm.toLowerCase();
        return (
          vendorName.toLowerCase().includes(term) ||
          chat.productName.toLowerCase().includes(term) ||
          (chat.lastMessage || "").toLowerCase().includes(term)
        );
      })
      .sort(
        (a, b) =>
          (b.lastMessageDate?.getTime() || 0) -
          (a.lastMessageDate?.getTime() || 0),
      );
  }, [openChats, chatData, vendorNames, searchTerm, tx]);

  const handleCloseAll = useCallback(() => {
    setShowChat(false);
    setActiveChatId(null);
  }, [setShowChat, setActiveChatId]);

  if (!openChats.length) return null;

  const hasSidebar = showSidebar && openChats.length > 1;

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 flex shadow-xl rounded-xl overflow-hidden border border-[#DDDDDD] bg-white"
      style={{
        width: hasSidebar
          ? "min(760px, calc(100vw - 24px))"
          : "min(420px, calc(100vw - 24px))",
        maxHeight: isMinimized ? "56px" : "min(600px, calc(100vh - 80px))",
        transition: "max-height 0.3s ease, width 0.3s ease",
      }}
    >
      {hasSidebar && !isMinimized && (
        <div className="w-[260px] border-r border-[#DDDDDD] flex flex-col bg-[#F4F4F4] shrink-0">
          <div className="px-3 py-3 border-b border-[#DDDDDD] bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-0.5 bg-[#FF6600] rounded-full" />
              <span className="text-xs font-medium text-[#FF6600] uppercase tracking-widest">
                {tx("Conversations", "دردشاتك")}
              </span>
              <span className="ml-auto text-[10px] font-medium bg-[#FF6600] text-white rounded-lg px-1.5 py-0.5">
                {openChats.length}
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999999]" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={tx("Search chats...", "ابحث في الدردشات...")}
                className="h-8 pl-8 text-xs rounded-lg border border-[#DDDDDD] bg-white focus:border-[#FF6600] transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => {
              return (
                <ChatSidebarItem
                  key={chat.chatId}
                  chatId={chat.chatId}
                  productId={chat.productId}
                  vendorId={chat.vendorId}
                  vendorName={
                    vendorNames[chat.vendorId] || tx("Vendor", "البائع")
                  }
                  productName={chat.productName}
                  lastMessage={chat.lastMessage}
                  lastMessageDate={chat.lastMessageDate}
                  isActive={activeChatId === chat.chatId}
                  onClick={() => {
                    setActiveChatId(chat.chatId);
                    if (
                      typeof window !== "undefined" &&
                      window.innerWidth < 768
                    ) {
                      setShowSidebar(false);
                    }
                  }}
                  productImage={chat.productImage}
                />
              );
            })}
            {filteredChats.length === 0 && (
              <div className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-[#999999] mx-auto mb-2" />
                <p className="text-xs text-[#666666]">
                  {tx("No chats found", "لم يتم العثور على دردشات")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <ChatAreaHeader
          activeChat={activeChat}
          vendorNames={vendorNames}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
          handleCloseAll={handleCloseAll}
          tx={tx}
        />

        {!isMinimized && (
          <>
            {!hasSidebar && openChats.length > 1 && (
              <MobileChatTabs
                openChats={openChats}
                activeChatId={activeChatId}
                vendorNames={vendorNames}
                setActiveChatId={setActiveChatId}
                tx={tx}
              />
            )}

            {activeChat && (
              <ChatProductHeader
                productId={activeChat.productId}
                vendorId={activeChat.vendorId}
                productName={activeChat.productName}
                productImage={activeChat.productImage}
                productPrice={activeChat.productPrice}
              />
            )}

            {activeChat ? (
              <div
                className="flex-1"
                style={{ minHeight: "300px", maxHeight: "400px" }}
              >
                <ProductPageChat
                  chatId={activeChat.chatId}
                  productId={activeChat.productId}
                  vendorId={activeChat.vendorId}
                  customerId={activeChat.customerId}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#F4F4F4] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#666666]" />
                </div>
                <p className="text-sm font-normal text-[#222222]">
                  {tx(
                    "Select a chat to start messaging",
                    "اختر دردشة لبدء التواصل",
                  )}
                </p>
                <p className="text-xs text-[#666666]">
                  {tx(
                    "Choose from your conversations on the left",
                    "اختر من محادثاتك على اليسار",
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function ChatAreaHeader({
  activeChat,
  vendorNames,
  isMinimized,
  setIsMinimized,
  handleCloseAll,
  tx,
}: {
  activeChat: ChatDataItem | ChatSession | undefined;
  vendorNames: Record<string, string>;
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
  handleCloseAll: () => void;
  tx: Translate;
}) {
  return (
    <div className="bg-[#222222] px-4 py-3 flex items-center gap-3 shrink-0">
      <div className="w-1 h-8 bg-[#FF6600] rounded-full" />

      <div className="flex-1 min-w-0">
        <h4 className="font-normal text-sm text-white truncate">
          {activeChat
            ? vendorNames[activeChat.vendorId] || activeChat.productName
            : tx("Vendor Chat", "دردشة البائع")}
        </h4>
        {!isMinimized && activeChat && (
          <p className="text-[10px] text-white/70 truncate mt-0.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {activeChat.productName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          onClick={() => {
            if (typeof window !== "undefined" && activeChat) {
              window.open(
                `${CHAT_URL}/chat/${encodeURIComponent(activeChat.chatId)}`,
                "_blank",
                "noopener,noreferrer",
              );
            }
          }}
          title={tx("Open Full Messenger", "افتح المراسلة الكاملة")}
          aria-label={tx("Open Full Messenger", "افتح المراسلة الكاملة")}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          onClick={() => setIsMinimized(!isMinimized)}
          title={
            isMinimized
              ? tx("Expand chat", "توسيع الدردشة")
              : tx("Minimize chat", "تصغير الدردشة")
          }
          aria-label={
            isMinimized
              ? tx("Expand chat", "توسيع الدردشة")
              : tx("Minimize chat", "تصغير الدردشة")
          }
        >
          {isMinimized ? (
            <Maximize2 className="w-4 h-4" />
          ) : (
            <Minimize2 className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          onClick={handleCloseAll}
          title={tx("Close chat", "إغلاق الدردشة")}
          aria-label={tx("Close chat", "إغلاق الدردشة")}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function MobileChatTabs({
  openChats,
  activeChatId,
  vendorNames,
  setActiveChatId,
  tx,
}: {
  openChats: ChatSession[];
  activeChatId: string | null;
  vendorNames: Record<string, string>;
  setActiveChatId: (id: string) => void;
  tx: Translate;
}) {
  return (
    <div className="flex border-b border-[#DDDDDD] bg-[#F4F4F4] overflow-x-auto">
      {openChats.map((chat) => {
        const label = vendorNames[chat.vendorId] || chat.productName;
        const isActive = chat.chatId === activeChatId;
        return (
          <button
            key={chat.chatId}
            onClick={() => setActiveChatId(chat.chatId)}
            className={`px-4 py-2.5 text-xs font-normal truncate max-w-[140px] border-b transition-all duration-200 shrink-0 ${
              isActive
                ? "border-b-[#FF6600] bg-white text-[#222222]"
                : "border-b-transparent text-[#666666] hover:bg-white"
            }`}
            title={tx("Open conversation", "فتح المحادثة")}
          >
            {label.length > 18 ? `${label.slice(0, 18)}...` : label}
          </button>
        );
      })}
    </div>
  );
}

export default ChatManager;
