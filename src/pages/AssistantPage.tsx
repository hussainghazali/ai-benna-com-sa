// src/pages/AssistantPage.tsx
// Full-page assistant workspace with conversation history.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useMatch, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssistantChat from "@/components/assistant/AssistantChat";
import { AgentTransitionScreen } from "@/components/AgentTransitionScreen";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSeo } from "@/lib/seo";
import {
  fetchAssistantThreads,
  deleteAssistantThread,
  type AssistantThreadSummary,
} from "@/lib/api-assistant";
import { Sparkles, MessageSquare, Trash2 } from "lucide-react";

const AssistantPage = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { isAuthenticated } = useAuth();
  // Read from a match rather than useParams: this page is the PARENT route of
  // /assistant/:threadId, so its own params never carry the id.
  const threadId = useMatch("/assistant/:threadId")?.params.threadId || undefined;
  const navigate = useNavigate();
  const [threads, setThreads] = useState<AssistantThreadSummary[]>([]);
  const [newChatKey, setNewChatKey] = useState(0);
  // Bumped when the user picks a conversation from the sidebar, so a thread
  // this session created can still be re-opened (forces a fresh restore).
  const [restoreKey, setRestoreKey] = useState(0);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !window.sessionStorage.getItem("benna-assistant-intro-seen");
    } catch {
      return true;
    }
  });
  // Thread ids created by the live chat instance — navigating to them must not
  // remount the chat (which would wipe the in-progress conversation).
  const ownThreadsRef = useRef<Set<string>>(new Set());



  useSeo({
    title: isAr
      ? "المساعد الذكي للمشتريات | بنّاء"
      : "AI Procurement Assistant | Benna",
    description: isAr
      ? "اسأل مساعد بنّاء الذكي عن مواد البناء التي تحتاجها، واحصل على منتجات مطابقة من أكثر من 182,000 منتج وأضفها إلى سلتك."
      : "Ask Benna's AI assistant what materials you need and get matching products from 182,000+ building materials, ready to add to your cart.",
  });

  const loadThreads = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setThreads(await fetchAssistantThreads(20));
    } catch {
      /* history is optional */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  const dismissIntro = useCallback(() => {
    setShowIntro(false);
    try {
      window.sessionStorage.setItem("benna-assistant-intro-seen", "1");
    } catch {
      /* ignore */
    }
  }, []);

  // Shown once per browser session only, and never long enough to feel stuck.
  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(dismissIntro, 2200);
    return () => clearTimeout(timer);
  }, [showIntro, dismissIntro]);


  const remove = async (id: string) => {
    setThreads((prev) => prev.filter((t) => t.threadId !== id));
    if (id === threadId) navigate("/assistant", { replace: true });
    try {
      await deleteAssistantThread(id);
    } catch {
      void loadThreads();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showIntro && !threadId && <AgentTransitionScreen onSkip={dismissIntro} />}

      <Header />

      {/* ── Hero Band — full-bleed peach bg, centered content (matches BOQ page) ── */}
      <div className="bg-ali-orange-100/60">
        <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6 xl:px-8">
          <div className="py-8 sm:py-10">
            <h1 className="text-[26px] sm:text-[30px] font-bold leading-tight tracking-tight text-ali-ink-900">
              {isAr ? (
                <>بنّة <span className="text-ali-orange-500">رقم ١ لمساعد التوريد الذكي</span></>
              ) : (
                <>Benna's <span className="text-ali-orange-500">#1 AI sourcing assistant</span></>
              )}
            </h1>
            <p className="mt-1.5 text-[14px] text-ali-ink-500">
              {isAr
                ? "صِف مشروعك · احصل على منتجات مطابقة · أضفها مباشرة إلى سلتك"
                : "Describe your project · Get matching products · Add straight to your cart"}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setNewChatKey((k) => k + 1);
                  if (threadId) navigate("/assistant");
                  void loadThreads();
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ali-orange-500 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-ali-orange-600"
              >
                <Sparkles className="h-4 w-4" />
                {isAr ? "محادثة جديدة" : "Start a new conversation"}
              </button>
              <a
                href="https://store.benna.com.sa/build-project"
                className="inline-flex h-10 items-center rounded-full border border-ali-ink-900 bg-white px-5 text-[13px] font-semibold text-ali-ink-900 transition-colors hover:bg-ali-bg-100"
              >
                {isAr ? "منشئ قوائم الكميات" : "AI BOQ generator"}
              </a>
              <a
                href="https://store.benna.com.sa/rfq"
                className="text-[13px] font-medium text-ali-ink-900 hover:text-ali-orange-500"
              >
                {isAr ? "سوق طلبات العروض" : "RFQ marketplace"}
              </a>
            </div>
          </div>

          {/* Stats row — inside the same band */}
          <div className="border-t border-ali-ink-900/10 py-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-8 gap-y-2">
              {[
                { v: "184K+", l: isAr ? "منتج في الكتالوج" : "PRODUCTS IN CATALOG" },
                { v: "1,085+", l: isAr ? "فئة مغطاة" : "CATEGORIES COVERED" },
                { v: "1-click", l: isAr ? "أضف للسلة" : "ADD TO CART" },
                { v: "Instant", l: isAr ? "مطابقة ذكية" : "AI MATCHING" },
                { v: "24/7", l: isAr ? "متاح دائماً" : "ALWAYS AVAILABLE" },
              ].map((s) => (
                <div key={s.l} className="flex items-baseline gap-2">
                  <span className="text-[22px] font-bold text-ali-ink-900">{s.v}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-ali-ink-500">
                    {s.l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-6 xl:px-8">

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* History */}
            <aside className="order-2 lg:order-1">
              <div className="rounded-[6px] border border-border bg-card">
                <div className="border-b border-border px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                  {isAr ? "المحادثات" : "Conversations"}
                </div>
                <div className="max-h-[420px] overflow-y-auto p-2">
                  {threads.length ? (
                    threads.map((t) => {
                      const active = t.threadId === threadId;
                      return (
                        <div
                          key={t.threadId}
                          className={`group flex items-start gap-2 rounded-[4px] px-2 py-2 ${
                            active
                              ? "bg-primary/5 ring-1 ring-primary/30"
                              : "hover:bg-muted"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              // Explicit user intent to re-open this thread —
                              // drop it from the "live session" set so the chat
                              // remounts and restores its full history, even if
                              // it was created moments ago in this session.
                              ownThreadsRef.current.delete(t.threadId);
                              setRestoreKey((k) => k + 1);
                              navigate(`/assistant/${t.threadId}`);
                            }}
                            className="flex min-w-0 flex-1 items-start gap-2 text-start"
                          >

                            <MessageSquare
                              className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                                active ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[12px] text-foreground">
                                {t.title}
                              </span>
                              <span className="block truncate text-[11px] text-muted-foreground">
                                {t.preview}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(t.threadId)}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label={isAr ? "حذف" : "Delete"}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="px-2 py-3 text-[12px] text-muted-foreground">
                      {isAr ? "لا توجد محادثات بعد." : "No conversations yet."}
                    </p>
                  )}
                </div>
              </div>
            </aside>

            {/* Chat */}
            <section className="order-1 lg:order-2">
              <div className="h-[70vh] min-h-[520px] overflow-hidden rounded-[6px] border border-border bg-background">
                <AssistantChat
                  key={
                    threadId && !ownThreadsRef.current.has(threadId)
                      ? `${threadId}-${restoreKey}`
                      : `new-${newChatKey}`
                  }

                  variant="page"
                  className="h-full"
                  initialThreadId={threadId || null}
                  onThreadChange={(id) => {
                    ownThreadsRef.current.add(id);
                    if (id !== threadId) navigate(`/assistant/${id}`, { replace: true });
                    void loadThreads();
                  }}
                />

              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AssistantPage;
