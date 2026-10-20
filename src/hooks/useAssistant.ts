import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { API_URL } from "@/config/env";
import { getAccessToken } from "@/lib/auth-session";
import { fetchAssistantQuota, fetchAssistantThread, type AssistantQuota, type AssistantProduct } from "@/lib/api-assistant";

export interface AssistantMetadata {
  threadId?: string;
  products?: AssistantProduct[];
  sources?: { title: string; href: string; kind?: string }[];
  unresolved?: boolean;
  completed?: boolean;
  feedback?: "useful" | "not_useful";
}
export type BennaMessage = UIMessage<AssistantMetadata>;
export interface Resolution { messageId: string; publicQuestion: string; draft: string; sources: { title: string; href: string }[]; resolvedAt: string }

export function useAssistant(options: { lang?: "en" | "ar"; initialThreadId?: string | null; onThreadChange?: (id: string) => void } = {}) {
  const [threadId, setThreadId] = useState<string | null>(options.initialThreadId || null);
  const threadRef = useRef(threadId);
  const chatId = useRef(options.initialThreadId || crypto.randomUUID());
  const [quota, setQuota] = useState<AssistantQuota | null>(null);
  const [loading, setLoading] = useState(!!options.initialThreadId);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const refreshQuota = useCallback(async () => { try { setQuota(await fetchAssistantQuota()); } catch { /* advisory */ } }, []);
  const transport = useMemo(() => new DefaultChatTransport<BennaMessage>({
    api: `${API_URL.replace(/\/+$/, "")}/users/website/assistant/chat`,
    headers: () => ({ Authorization: `Bearer ${getAccessToken() || ""}`, "x-api-key": import.meta.env.VITE_API_KEY || "" }),
    body: () => ({ threadId: threadRef.current, lang: optionsRef.current.lang || "en" }),
    prepareSendMessagesRequest: ({ messages, body }) => ({
      // The server restores trusted history; send only the new user message.
      body: { ...body, messages: messages.slice(-1) },
    }),
    fetch: async (input, init) => {
      const response = await fetch(input, init);
      if (response.ok) return response;
      const raw = await response.text();
      let message = raw;
      try {
        const payload = JSON.parse(raw);
        if (typeof payload.message === "string") message = payload.message;
      } catch { /* Preserve non-JSON service errors. */ }
      return new Response(message, { status: response.status, statusText: response.statusText, headers: response.headers });
    },
  }), []);
  const chat = useChat<BennaMessage>({
    id: chatId.current,
    transport,
    onFinish: ({ message }) => {
      const id = message.metadata?.threadId;
      if (id) { threadRef.current = id; setThreadId(id); optionsRef.current.onThreadChange?.(id); }
      void refreshQuota();
    },
  });
  useEffect(() => {
    const id = chat.messages.find(m => m.metadata?.threadId)?.metadata?.threadId;
    if (id && threadRef.current !== id) { threadRef.current = id; setThreadId(id); optionsRef.current.onThreadChange?.(id); }
  }, [chat.messages]);
  useEffect(() => {
    const id = options.initialThreadId;
    if (!id) { void refreshQuota(); return; }
    let cancelled = false;
    void fetchAssistantThread(id).then(result => {
      if (cancelled) return;
      if (!result) throw new Error("Conversation not found");
      chat.setMessages(result.messages || []);
      setResolutions(result.resolutions || []);
      setLoading(false);
    }).catch(() => { if (!cancelled) { setLoadError("Could not restore this conversation. Reload to try again."); setLoading(false); } });
    void refreshQuota();
    return () => { cancelled = true; };
  // Restoration is tied to this keyed chat instance, never to streamed metadata.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => { void chat.stop(); }, [chat.stop]);
  const send = useCallback(async (value: string) => {
    if (loading || loadError || chat.status === "submitted" || chat.status === "streaming") return;
    const text = value.trim();
    if (!text || text.length > 2000) return;
    await chat.sendMessage({ text });
  }, [chat.sendMessage, chat.status, loading, loadError]);
  return { ...chat, send, threadId, quota, refreshQuota, loading, loadError, resolutions, isStreaming: chat.status === "submitted" || chat.status === "streaming" };
}
