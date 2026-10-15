// src/components/assistant/AssistantChat.tsx
// Shared chat surface used by both the floating bubble and the /assistant page.
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  Square,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Hammer,
  FileText,
} from "lucide-react";
import { useAssistant } from "@/hooks/useAssistant";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { storeUrl } from "@/lib/store-url";
import { useVendorChat } from "@/hooks/useVendorChat";
import AssistantProductCard from "./AssistantProductCard";
import BennaLoader from "@/components/BennaLoader";
import type { AssistantProduct } from "@/lib/api-assistant";

const ChatManager = lazy(() => import("@/components/ChatManager"));


const SUGGESTIONS_EN = [
  "White cement for a 200 sqm villa",
  "Porcelain floor tiles under 60 SAR/sqm",
  "PPR pipes and fittings 32mm",
  "I need a full material list for a 2-floor villa",
];
const SUGGESTIONS_AR = [
  "أسمنت أبيض لفيلا 200 متر مربع",
  "بلاط بورسلان أرضيات أقل من 60 ريال/م²",
  "مواسير وتوصيلات PPR مقاس 32 مم",
  "أحتاج قائمة مواد كاملة لفيلا من طابقين",
];

const STAGE_LABEL = {
  understanding: { en: "Understanding your request…", ar: "جاري فهم طلبك…" },
  searching: { en: "Searching 182,000+ products…", ar: "جاري البحث في أكثر من 182,000 منتج…" },
  answering: { en: "Preparing recommendations…", ar: "جاري تجهيز التوصيات…" },
};

interface Props {
  variant?: "panel" | "page";
  className?: string;
  /** Existing conversation to restore on mount. */
  initialThreadId?: string | null;
  /** Fired when this conversation gets (or changes) its server thread id. */
  onThreadChange?: (threadId: string) => void;
}

const AssistantChat = ({
  variant = "panel",
  className = "",
  initialThreadId = null,
  onThreadChange,
}: Props) => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { isAuthenticated } = useAuth();
  const {
    messages,
    threadId,
    stage,
    isStreaming,
    quota,
    limitReached,
    send,
    stop,
    reset,
    loadThread,
  } = useAssistant({ lang: isAr ? "ar" : "en" });

  const vendorChat = useVendorChat();

  const openVendorChat = (p: AssistantProduct) => {
    vendorChat.openChat({
      id: String(p.productId),
      name: p.name,
      vendorId: String(p.vendorId || ""),
      image: p.image,
      price: p.effectivePrice || p.price,
    });
  };

  // Restore a previously saved conversation once, on mount only. Later thread
  // id changes come from this very chat and must not reload/reset it.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (initialThreadId) void loadThread(initialThreadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Surface a newly created thread id so the page can update its URL/history.
  useEffect(() => {
    if (threadId && threadId !== initialThreadId) onThreadChange?.(threadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);


  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = isAr ? SUGGESTIONS_AR : SUGGESTIONS_EN;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, stage]);

  const lastProducts = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const p = messages[i].products;
      if (p && p.length) return p;
    }
    return [];
  }, [messages]);

  const submit = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput("");
    void send(value);
  };


  if (!isAuthenticated) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}>
        <Sparkles className="h-7 w-7 text-ali-orange-500" />
        <h2 className="text-[15px] font-normal text-ali-ink-900">
          {isAr ? "سجّل الدخول لاستخدام المساعد" : "Sign in to use the assistant"}
        </h2>
        <p className="max-w-xs text-[13px] text-ali-ink-500">
          {isAr
            ? "المساعد الذكي يبحث في كتالوج بنّاء ويعرض لك المنتجات المطابقة مباشرة."
            : "The AI assistant searches Benna's catalog and shows you matching products straight away."}
        </p>
        <Link
          to="/login"
          className="rounded-lg bg-ali-orange-500 px-4 py-2 text-[13px] font-medium text-white hover:opacity-90"
        >
          {isAr ? "تسجيل الدخول" : "Sign in"}
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex h-full min-h-0 flex-col ${className}`}>
      {/* Messages */}
      <div
        ref={scrollRef}
        className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 ${
          variant === "page" ? "md:px-6" : ""
        }`}
      >
        {!messages.length ? (
          <div className="flex min-h-full flex-col items-center justify-center px-2 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ali-orange-100 shadow-card">
              <Sparkles className="h-6 w-6 text-ali-orange-500" />
            </div>
            <h3 className="mt-4 text-[18px] font-semibold text-ali-ink-900">
              {isAr
                ? "ما الذي تحتاجه لمشروعك؟"
                : "What do you need for your project?"}
            </h3>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-ali-ink-500">
              {isAr
                ? "اوصف منتجًا، ماركة، ميزانية، أو مشروعًا كاملًا — وسأجد المنتجات المناسبة من كتالوج بنّاء وأعرضها لك لتفتحها في متجر بنّة."
                : "Describe a product, a brand, a budget, or a whole project — I'll find matching products from Benna's catalog and link you to them in the Benna store."}
            </p>
            <div className="mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-ali-line-200 bg-white px-4 py-2 text-[13px] text-ali-ink-700 shadow-card transition-colors hover:border-ali-orange-500 hover:text-ali-orange-500"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m) => (
          <div key={m.id} className="space-y-3">
            {m.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl bg-ali-orange-500 px-3 py-2 text-[13px] leading-relaxed text-white">
                  {m.content}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {m.content ? (
                  <div className="max-w-[92%] whitespace-pre-wrap rounded-xl border border-ali-line-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-ali-ink-900">
                    {m.content}
                  </div>
                ) : null}

                {m.error ? (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{m.error}</span>
                  </div>
                ) : null}

                {m.products?.length ? (
                  <div className="space-y-2">
                    {m.products.map((p) => (
                      <AssistantProductCard
                        key={p.productId}
                        product={p}
                        onChat={openVendorChat}
                      />

                    ))}
                  </div>
                ) : null}

                {m.links?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {m.links.map((l) => (
                      <a
                        key={l.href}
                        href={storeUrl(l.href)}
                        className="rounded-lg border border-ali-line-200 px-2.5 py-1.5 text-[12px] text-ali-ink-900 hover:bg-ali-bg-100"
                      >
                        {isAr && l.labelAr ? l.labelAr : l.label}
                      </a>
                    ))}
                  </div>
                ) : null}

                {m.handoff ? (
                  <a
                    href={storeUrl(m.handoff.href)}
                    className="inline-flex items-center gap-2 rounded-lg border border-ali-orange-500/40 bg-ali-orange-100 px-3 py-2 text-[12px] font-medium text-ali-orange-500 hover:bg-ali-orange-100"
                  >
                    {m.handoff.action === "boq" ? (
                      <Hammer className="h-3.5 w-3.5" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    {m.handoff.action === "boq"
                      ? isAr
                        ? "أنشئ جدول كميات كامل"
                        : "Generate a full BOQ"
                      : isAr
                        ? "انشر طلب عرض سعر"
                        : "Post an RFQ"}
                  </a>
                ) : null}
              </div>
            )}
          </div>
        ))}

        {isStreaming && stage !== "idle" ? (
          <div className="flex items-center gap-3 text-[12px] text-ali-ink-500">
            <BennaLoader size="sm" />
            <span>{STAGE_LABEL[stage][isAr ? "ar" : "en"]}</span>
          </div>
        ) : null}

        {limitReached ? (
          <div className="space-y-2 rounded-xl border border-ali-orange-500/40 bg-ali-orange-100 p-3">
            <p className="text-[13px] text-ali-ink-900">{limitReached}</p>
            <a
              href={storeUrl("/build-project?credits=1")}
              className="inline-block rounded-lg bg-ali-orange-500 px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
            >
              {isAr ? "شراء رصيد" : "Add credits"}
            </a>
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <div className="border-t border-ali-line-200 bg-white p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-ali-line-200 bg-ali-bg-100/50 px-3 py-2 transition-colors focus-within:border-ali-orange-500 focus-within:bg-white">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={
              isAr
                ? "اسأل عن أي مادة بناء…"
                : "Ask me anything about building materials…"
            }
            className="max-h-28 min-h-[36px] flex-1 resize-none border-none bg-transparent px-1 py-1.5 text-[13px] text-ali-ink-900 outline-none placeholder:text-ali-ink-400"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ali-line-200 bg-white text-ali-ink-900 transition-colors hover:bg-ali-bg-100"
              aria-label={isAr ? "إيقاف" : "Stop"}
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => submit()}
              disabled={!input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ali-orange-500 text-white transition-colors hover:bg-ali-orange-600 disabled:bg-ali-line-300 disabled:text-ali-ink-400"
              aria-label={isAr ? "إرسال" : "Send"}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-ali-ink-500">
          <span>
            {quota
              ? quota.unlimited
                ? isAr
                  ? "رسائل غير محدودة"
                  : "Unlimited messages"
                : isAr
                  ? `${quota.freeRemaining} رسالة مجانية اليوم · ${quota.creditBalance ?? 0} رصيد`
                  : `${quota.freeRemaining} free messages today · ${quota.creditBalance ?? 0} credits`
              : ""}
          </span>
          {messages.length ? (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 hover:text-ali-ink-900"
            >
              <RotateCcw className="h-3 w-3" />
              {isAr ? "محادثة جديدة" : "New chat"}
            </button>
          ) : null}
        </div>
      </div>

      {vendorChat.showChat && vendorChat.openChats.length > 0 ? (
        <Suspense fallback={null}>
          <ChatManager
            openChats={vendorChat.openChats}
            activeChatId={vendorChat.activeChatId}
            setActiveChatId={vendorChat.setActiveChatId}
            setOpenChats={vendorChat.setOpenChats}
            setShowChat={vendorChat.setShowChat}
          />
        </Suspense>
      ) : null}
    </div>
  );
};


export default AssistantChat;
