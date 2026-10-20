import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { storeUrl } from "@/lib/store-url";
import { useAuthUrl } from "@/hooks/useAuthUrl";
import { ArrowUp, AlertTriangle, Building2, Copy, ThumbsUp, ThumbsDown, ShoppingCart, Plus, Check, LayoutGrid, FileText, Calculator, Camera } from "lucide-react";
import { isToolUIPart } from "ai";
import { useAssistant } from "@/hooks/useAssistant";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useVendorChat } from "@/hooks/useVendorChat";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Tool, ToolHeader, ToolContent, ToolOutput } from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";
import AssistantProductCard from "./AssistantProductCard";
import BennaLoader from "@/components/BennaLoader";
import type { AssistantProduct } from "@/lib/api-assistant";
const ChatManager = lazy(() => import("@/components/ChatManager"));
interface Props { variant?: "panel" | "page"; className?: string; initialThreadId?: string | null; onThreadChange?: (id: string) => void; onNewConversation?: () => void }
const TOOL_LABELS: Record<string, [string, string]> = { search_products: ["Product search", "البحث عن المنتجات"], get_product: ["Product specifications", "مواصفات المنتج"], search_categories: ["Categories", "الفئات"], search_brands: ["Brands", "العلامات التجارية"], find_vendors: ["Suppliers", "الموردون"], search_knowledge: ["Benna sources", "مصادر بنّاء"], report_unresolved: ["Question review", "مراجعة السؤال"] };
export default function AssistantChat({ className = "", initialThreadId, onThreadChange, onNewConversation }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { isAuthenticated } = useAuth();
  const loginUrl = useAuthUrl("/login");
  const { addToCart, setIsCartOpen } = useCart();
  const chat = useAssistant({ lang: isAr ? "ar" : "en", initialThreadId, onThreadChange });
  const vendorChat = useVendorChat();
  const [input, setInput] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (!chat.loading && !chat.isStreaming && !document.querySelector('[role="dialog"]')) textarea.current?.focus(); }, [chat.loading, chat.isStreaming, chat.threadId]);
  const lastProducts = useMemo(() => [...chat.messages].reverse().find(m => m.metadata?.products?.length)?.metadata?.products || [], [chat.messages]);
  const openVendorChat = (p: AssistantProduct) => vendorChat.openChat({ id: String(p.productId), name: p.name, vendorId: String(p.vendorId), image: p.image, price: p.effectivePrice || p.price });
  const send = async (value: string) => { if (!value.trim() || chat.isStreaming) return; setInput(""); await chat.send(value); textarea.current?.focus(); };
  const addAll = async () => {
    if (bulkBusy) return;
    const items = lastProducts.filter(p => !p.isRFQ && p.inStock);
    if (!window.confirm(isAr ? `إضافة ${items.length} منتجات إلى السلة؟` : `Add ${items.length} products to your cart?`)) return;
    setBulkBusy(true);
    try { for (const p of items) await addToCart({ productId: String(p.productId), productName: p.name, uniqueProductSlug: p.slug, productPrice: p.effectivePrice || p.price, productQuantity: 1, productImageUrl: p.image || "/placeholder.svg", vendorId: String(p.vendorId) } as never); setIsCartOpen(true); }
    catch { setActionError(isAr ? "تعذرت إضافة بعض المنتجات." : "Some products could not be added."); } finally { setBulkBusy(false); }
  };
  const rate = async (messageId: string, value: "useful" | "not_useful") => {
    if (!chat.threadId) return;
    try { await apiClient(`/users/website/assistant/threads/${encodeURIComponent(chat.threadId)}/feedback`, { method: "POST", body: JSON.stringify({ messageId, value }) }); setFeedback(p => ({ ...p, [messageId]: value })); }
    catch { setActionError(isAr ? "تعذر حفظ التقييم." : "Feedback could not be saved."); }
  };
  if (!isAuthenticated) return <div className={`flex h-full flex-col items-center justify-center gap-4 p-8 text-center ${className}`}><Building2 className="h-10 w-10 text-primary" /><h2 className="text-lg">{isAr ? "مساعد بنّاء" : "Benna Assistant"}</h2><Button asChild><Link to={loginUrl}>{isAr ? "تسجيل الدخول" : "Sign in"}</Link></Button></div>;
  return <div className={`flex h-full min-h-0 flex-col bg-background text-foreground ${className}`} dir={isAr ? "rtl" : "ltr"}>
    <Conversation className="min-h-0 flex-1">
      <ConversationContent className="gap-6 px-4 py-6 md:px-6">
        {chat.loading ? <BennaLoader size="sm" /> : null}
        {!chat.messages.length && !chat.loading && !chat.loadError ? <div className="flex flex-col items-center gap-5 py-10 text-center"><Building2 className="h-10 w-10 text-primary" /><h2 className="text-2xl font-light">{isAr ? "ماذا تحتاج لمشروعك؟" : "What does your project need?"}</h2><div className="flex max-w-xl flex-wrap justify-center gap-2">{(isAr ? ["قارن البورسلان والسيراميك", "ابحث عن مورد للأسمنت", "كيف أختار عازل السطح؟"] : ["Compare porcelain and ceramic tiles", "Find cement suppliers", "How should I waterproof a roof?"]).map(q => <Button key={q} variant="outline" className="h-auto whitespace-normal text-start" onClick={() => void send(q)}>{q}</Button>)}</div></div> : null}
        {chat.messages.map(m => <Message key={m.id} from={m.role} className={m.role === "user" ? "ms-auto me-0" : "max-w-full"}>
          <MessageContent className={m.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground max-w-[90%]" : "w-full max-w-full"}>
            {m.parts.map((p, i) => {
              if (p.type === "text") return <MessageResponse key={i} className="break-words text-sm leading-7" isAnimating={chat.isStreaming && m.id === chat.messages.at(-1)?.id}>{p.text}</MessageResponse>;
              if (p.type === "reasoning") return <details key={i} className="text-xs text-muted-foreground"><summary>{isAr ? "التفكير" : "Thinking"}</summary><MessageResponse>{p.text}</MessageResponse></details>;
              if (isToolUIPart(p)) { const name = p.type === "dynamic-tool" ? p.toolName : p.type.replace(/^tool-/, ""); return <Tool key={i} defaultOpen={false}>{p.type === "dynamic-tool" ? <ToolHeader type="dynamic-tool" toolName={p.toolName} state={p.state} title={TOOL_LABELS[name]?.[isAr ? 1 : 0] || name} /> : <ToolHeader type={p.type} state={p.state} title={TOOL_LABELS[name]?.[isAr ? 1 : 0] || name} />}<ToolContent><ToolOutput output={p.output} errorText={p.errorText} /></ToolContent></Tool>; }
              return null;
            })}
          </MessageContent>
          {m.metadata?.products?.length ? <div className="grid min-w-0 gap-2">{m.metadata.products.map(p => <AssistantProductCard key={p.productId} product={p} onChat={openVendorChat} />)}</div> : null}
          {m.metadata?.sources?.length ? <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">{m.metadata.sources.map(s => <a className="text-primary underline underline-offset-4" key={s.href} href={storeUrl(s.href)}>{s.title}</a>)}</div> : null}
          {m.role === "assistant" && !chat.isStreaming ? <div className="flex items-center gap-1"><Button size="icon-sm" variant="ghost" title={isAr ? "نسخ" : "Copy answer"} aria-label="Copy answer" onClick={async () => { try { await navigator.clipboard.writeText(m.parts.filter(p => p.type === "text").map(p => p.text).join("\n")); setCopied(m.id); } catch { setActionError("Could not copy answer."); } }}>{copied === m.id ? <Check /> : <Copy />}</Button><Button size="icon-sm" variant="ghost" title={isAr ? "مفيد" : "Useful"} aria-label="Useful" onClick={() => void rate(m.id, "useful")} className={feedback[m.id] === "useful" ? "text-primary" : ""}><ThumbsUp /></Button><Button size="icon-sm" variant="ghost" title={isAr ? "غير مفيد" : "Not useful"} aria-label="Not useful" onClick={() => void rate(m.id, "not_useful")} className={feedback[m.id] === "not_useful" ? "text-destructive" : ""}><ThumbsDown /></Button>{feedback[m.id] === "not_useful" ? <span className="text-xs text-muted-foreground">{isAr ? "حُفظ السؤال للمراجعة" : "Question saved for review"}</span> : null}</div> : null}
          {m.metadata?.unresolved ? <p className="text-xs text-muted-foreground">{isAr ? "سؤال بحاجة إلى مراجعة. تحقق من المحادثة لاحقًا." : "This question needs review. Check this conversation for updates."}</p> : null}
          {m.role === "assistant" && !(chat.isStreaming && m.id === chat.messages.at(-1)?.id) && needsNextSteps(m) ? <NextSteps isAr={isAr} /> : null}
        </Message>)}
        {chat.resolutions.map(r => <div key={r.messageId} className="border-s-2 border-primary ps-4"><p className="mb-2 text-xs font-medium text-primary">{isAr ? "إجابة تمت مراجعتها" : "Reviewed answer"}</p><h3 className="mb-2 font-medium">{r.publicQuestion}</h3><MessageResponse>{r.draft}</MessageResponse><div className="mt-2 flex flex-wrap gap-3">{r.sources.map(s => <Link key={s.href} to={s.href} className="text-xs text-primary underline">{s.title}</Link>)}</div></div>)}
        {chat.status === "submitted" ? <Shimmer>{isAr ? "جاري التفكير…" : "Thinking…"}</Shimmer> : null}
        {chat.error || chat.loadError || actionError ? <div role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4 shrink-0" /><span>{chat.loadError || actionError || readableError(chat.error?.message)}</span></div> : null}
      </ConversationContent><ConversationScrollButton aria-label={isAr ? "آخر الرسائل" : "Latest messages"} />
    </Conversation>
    {ENABLE_BULK_ADD && lastProducts.filter(p => !p.isRFQ && p.inStock).length > 1 ? <div className="border-t border-border px-4 py-2"><Button variant="outline" className="w-full" onClick={() => void addAll()} disabled={bulkBusy}><ShoppingCart />{isAr ? "إضافة المقترحات للسلة" : "Add suggestions to cart"}</Button></div> : null}
    <div className="border-t border-border p-3">
      <PromptInput onSubmit={({ text }) => send(text || input)}><PromptInputTextarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} maxLength={2000} disabled={chat.loading || !!chat.loadError} placeholder={isAr ? "اسأل مساعد بنّاء…" : "Ask Benna…"} className="min-h-16 max-h-40 text-base" /><PromptInputFooter className="justify-end"><PromptInputSubmit status={chat.status} onStop={() => void chat.stop()} disabled={!chat.isStreaming && (!input.trim() || chat.loading || !!chat.loadError)} aria-label={chat.isStreaming ? "Stop" : "Send"} className="h-9 w-9 shrink-0">{!chat.isStreaming ? <ArrowUp className="h-4 w-4" /> : undefined}</PromptInputSubmit></PromptInputFooter></PromptInput>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{chat.quota ? chat.quota.unlimited ? isAr ? "رسائل غير محدودة" : "Unlimited messages" : isAr ? `${chat.quota.freeRemaining} مجانية اليوم · ${chat.quota.creditBalance ?? 0} رصيد` : `${chat.quota.freeRemaining} free today · ${chat.quota.creditBalance ?? 0} credits` : ""}</span>{onNewConversation ? <Button variant="ghost" size="icon-sm" aria-label="New conversation" title={isAr ? "محادثة جديدة" : "New conversation"} onClick={onNewConversation}><Plus /></Button> : null}</div>
    </div>
    {vendorChat.showChat && vendorChat.openChats.length ? <Suspense fallback={null}><ChatManager openChats={vendorChat.openChats} activeChatId={vendorChat.activeChatId} setActiveChatId={vendorChat.setActiveChatId} setOpenChats={vendorChat.setOpenChats} setShowChat={vendorChat.setShowChat} /></Suspense> : null}
  </div>;
}

// Service errors can arrive as raw JSON; show only the human sentence.
function readableError(raw?: string) {
  if (!raw) return raw;
  try { const parsed = JSON.parse(raw); if (typeof parsed?.message === "string") return parsed.message; } catch { /* plain text */ }
  return raw;
}

// When the assistant can't fully answer, always give shoppers a clear way forward.
// ai.benna.com.sa has no checkout of its own (header cart = store cart), so the
// "Add all to cart" button would only fill a local cart nobody can check out.
// Products open on the store instead. Flip to true if this site ever gets a real cart.
const ENABLE_BULK_ADD = false;

const NEXT_STEPS = [
  { href: "/products", icon: LayoutGrid, en: "Browse all products", ar: "تصفح كل المنتجات" },
  { href: "/rfqs", icon: FileText, en: "Publish an RFQ for a quote", ar: "انشر طلب عرض سعر" },
  { href: "/build-project", icon: Calculator, en: "Create a BOQ", ar: "أنشئ جدول كميات" },
  { href: "/", icon: Camera, en: "Search by image or voice", ar: "ابحث بالصورة أو الصوت" },
];
function needsNextSteps(m: { metadata?: { unresolved?: boolean; products?: unknown[] }; parts: { type: string }[] }) {
  if (m.metadata?.unresolved) return true;
  const searched = m.parts.some(p => p.type === "tool-search_products" || p.type === "tool-get_product");
  return searched && !m.metadata?.products?.length;
}
function NextSteps({ isAr }: { isAr: boolean }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs text-muted-foreground">{isAr ? "يمكنك أيضًا:" : "You can also:"}</p>
      <div className="flex flex-wrap gap-2">
        {NEXT_STEPS.map(({ href, icon: Icon, en, ar }) => (
          <Button key={href} asChild size="sm" variant="outline"><a href={storeUrl(href)}><Icon />{isAr ? ar : en}</a></Button>
        ))}
      </div>
    </div>
  );
}
