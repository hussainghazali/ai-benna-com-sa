// src/pages/AssistantPage.tsx
// Full-page assistant workspace with conversation history.
import { useCallback, useEffect, useRef, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { STORE_URL, storeUrl } from "@/lib/store-url";
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
      ? "اسأل مساعد بنّاء عن مواد البناء والموردين والعلامات التجارية من أكثر من 184,267 منتج و1,085 فئة و95 موردًا."
      : "Ask Benna about building materials, suppliers and brands across 184,267+ products, 1,085+ categories and 95+ vendors.",
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


  const startNewConversation = useCallback(() => {
    setNewChatKey((k) => k + 1);
    if (threadId) navigate("/assistant");
    void loadThreads();
  }, [threadId, navigate, loadThreads]);

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
    <div className="flex min-h-screen flex-col bg-ali-bg-100">
      {showIntro && !threadId && <AgentTransitionScreen onSkip={dismissIntro} />}

      <Header />

      <main className="flex-1">
        {/* ── Hero band (same as RFQ / BOQ pages) ── */}
        <section
          className="border-b border-ali-line-200"
          style={{
            background:
              "linear-gradient(90deg, #FFFFFF 0%, #FFF9F4 25%, #FFF0E5 50%, #FFF9F4 75%, #FFFFFF 100%)",
            backgroundSize: "200% 100%",
            animation: "gradient-shift 12s ease-in-out infinite",
          }}
        >
          <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6 xl:px-8 py-6 md:py-8">
            <h1 className="max-w-2xl text-3xl lg:text-4xl font-semibold tracking-tight text-ali-ink-900">
              {isAr ? (
                <>
                  مساعد المشتريات{" "}
                  <span className="text-ali-orange-500">بالذكاء الاصطناعي</span>
                </>
              ) : (
                <>
                  Benna's{" "}
                  <span className="text-ali-orange-500">
                    #1 AI sourcing assistant
                  </span>
                </>
              )}
            </h1>
            <p className="mt-2 text-sm text-ali-ink-500">
              {isAr
                ? "صِف مشروعك أو منتجك · احصل على منتجات مطابقة · افتحها مباشرة في متجر بنّة"
                : "Describe your project · Get matching products · Open them in the Benna store"}
            </p>

            {/* CTAs, then stats row */}
            <div className="mt-6 flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={startNewConversation}
                  className="inline-flex items-center rounded-full bg-ali-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ali-orange-600"
                >
                  <Sparkles className="h-4 w-4 me-1.5" aria-hidden="true" />
                  {isAr ? "ابدأ محادثة جديدة" : "Start a new conversation"}
                </button>
                <a
                  href={storeUrl("/build-project")}
                  className="inline-flex items-center rounded-full border border-ali-ink-900 px-5 py-2.5 text-sm font-semibold text-ali-ink-900 transition-colors hover:bg-ali-bg-100"
                >
                  {isAr ? "مولّد BOQ" : "AI BOQ generator"}
                </a>
                <a
                  href={`${STORE_URL}/rfqs`}
                  className="text-sm text-ali-ink-700 underline decoration-ali-line-300 underline-offset-4 transition-colors hover:text-ali-orange-500"
                >
                  {isAr ? "سوق طلبات التسعير" : "RFQ marketplace"}
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-ali-line-200 pt-5">
                {[
                  {
                    big: isAr ? "+184 ألف" : "184K+",
                    label: isAr ? "منتج في الكتالوج" : "Products in catalog",
                  },
                  {
                    big: isAr ? "+1,085" : "1,085+",
                    label: isAr ? "فئة مغطاة" : "Categories covered",
                  },
                  {
                    big: isAr ? "نقرة واحدة" : "1-click",
                    label: isAr ? "فتح في المتجر" : "Open in store",
                  },
                  {
                    big: isAr ? "فوري" : "Instant",
                    label: isAr ? "مطابقة بالذكاء الاصطناعي" : "AI matching",
                  },
                  {
                    big: "24/7",
                    label: isAr ? "متاح دائمًا" : "Always available",
                  },
                ].map(({ big, label }) => (
                  <div key={label} className="flex items-baseline gap-2">
                    <p className="text-2xl font-medium tracking-tighter text-ali-ink-900 md:text-3xl">
                      {big}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-ali-ink-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-6 xl:px-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* History */}
            <aside className="order-2 lg:order-1">
              <div className="rounded-xl border border-ali-line-200 bg-white shadow-card">
                <div className="border-b border-ali-line-200 px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-ali-ink-500">
                  {isAr ? "المحادثات" : "Conversations"}
                </div>
                <div className="max-h-[420px] overflow-y-auto p-2">
                  {threads.length ? (
                    threads.map((t) => {
                      const active = t.threadId === threadId;
                      return (
                        <div
                          key={t.threadId}
                          className={`group flex items-start gap-2 rounded-lg px-2 py-2 ${
                            active
                              ? "bg-ali-orange-100 ring-1 ring-ali-orange-500/40"
                              : "hover:bg-ali-bg-100"
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
                                active ? "text-ali-orange-500" : "text-ali-ink-500"
                              }`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[12px] text-ali-ink-900">
                                {t.title}
                              </span>
                              <span className="block truncate text-[11px] text-ali-ink-500">
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
                            <Trash2 className="h-3.5 w-3.5 text-ali-ink-500 hover:text-destructive" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="px-2 py-3 text-[12px] text-ali-ink-500">
                      {isAr ? "لا توجد محادثات بعد." : "No conversations yet."}
                    </p>
                  )}
                </div>
              </div>
            </aside>

            {/* Chat */}
            <section className="order-1 lg:order-2">
              <div className="h-[70vh] min-h-[520px] overflow-hidden rounded-xl border border-ali-line-200 bg-white shadow-card">
                <AssistantChat
                  key={
                    threadId && !ownThreadsRef.current.has(threadId)
                      ? `${threadId}-${restoreKey}`
                      : `new-${newChatKey}`
                  }

                  variant="page"
                  className="h-full"
                  initialThreadId={threadId || null}
                  onNewConversation={startNewConversation}
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
