import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db, ensureAnonymousAuth } from "@/lib/firebase";
import { apiFormDataClient } from "@/lib/api-form-data-client";
import { isMessageAllowed } from "@/utils/chatMessageFilter";
import { getRelativeTime } from "@/utils/getRelativeTime";
import { Send, Paperclip, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductPageChatProps {
  chatId: string;
  productId: number | string;
  vendorId: string;
  customerId: string;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface FirebaseMessage {
  id: string;
  text: string;
  senderId: string;
  senderType: "customer" | "vendor" | "system";
  createdAt: Date | null;
  attachments?: Attachment[];
}

interface PreviewFile {
  file: File;
  url: string | null;
  isImage: boolean;
}

const ALLOWED_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "pdf",
  "doc",
  "docx",
  "xlsx",
  "csv",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

const ProductPageChat = ({
  chatId,
  productId,
  vendorId,
  customerId,
}: ProductPageChatProps) => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const tx = useCallback((en: string, ar: string) => (isAr ? ar : en), [isAr]);
  const [messages, setMessages] = useState<FirebaseMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null); // Track actual URL for cleanup

  // Ensure Firebase auth
  useEffect(() => {
    let mounted = true;
    ensureAnonymousAuth()
      .then(() => {
        if (mounted) setAuthReady(true);
      })
      .catch(() => {
        if (mounted) {
          toast.error(
            tx(
              "Chat authentication failed. Please refresh.",
              "فشل التحقق من الدردشة. يرجى تحديث الصفحة.",
            ),
          );
        }
      });
    return () => {
      mounted = false;
    };
  }, [tx]);

  // Subscribe to messages
  useEffect(() => {
    if (!chatId || !authReady) return;
    const messagesRef = collection(db, "chats", chatId, "messages_v1");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: FirebaseMessage[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          text: data.text || "",
          senderId: data.senderId || "",
          senderType: data.senderType || "vendor",
          createdAt: data.createdAt?.toDate() || null,
          attachments: data.attachments || [],
        };
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId, authReady]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup preview URL on unmount or file change
  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch {
        // noop
      }
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokePreviewUrl();
  }, [revokePreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e?.target?.files?.[0];
    if (!f) return;

    const fileExt = f.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      toast.error(
        tx(
          "Invalid file type. Allowed: png, jpg, jpeg, pdf, doc, docx, xlsx, csv",
          "نوع الملف غير صالح. الأنواع المسموحة: png, jpg, jpeg, pdf, doc, docx, xlsx, csv",
        ),
      );
      e.target.value = "";
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error(
        tx("File size must be under 5MB.", "يجب أن يكون حجم الملف أقل من 5MB."),
      );
      e.target.value = "";
      return;
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(f.type);
    const url = isImage ? URL.createObjectURL(f) : null;

    revokePreviewUrl(); // Clean up previous
    if (url) previewUrlRef.current = url;

    setPreviewFile({ file: f, url, isImage });
    e.target.value = "";
  };

  const removePreview = () => {
    revokePreviewUrl();
    setPreviewFile(null);
  };

  // Secure URL validation â€” only allow http/https
  const isSafeUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSend = async () => {
    const hasText = inputValue.trim().length > 0;
    const hasFile = !!previewFile;
    if ((!hasText && !hasFile) || sending || !chatId) return;

    // Content filter â€” client-side UX only, server must re-validate
    if (hasText && !isMessageAllowed(inputValue)) {
      toast.error(
        tx(
          "Message blocked. Phone numbers and external links are not allowed.",
          "تم حظر الرسالة. أرقام الهواتف والروابط الخارجية غير مسموحة.",
        ),
      );
      setInputValue("");
      return;
    }

    const text = inputValue.trim();
    const currentFile = previewFile;
    setInputValue("");
    removePreview();
    setSending(true);

    try {
      const messagesRef = collection(db, "chats", chatId, "messages_v1");
      let lastMessage = text;
      let attachments: Attachment[] = [];

      // Upload file via vendor route (single source of truth)
      if (currentFile) {
        const formData = new FormData();
        formData.append("image", currentFile.file);

        const uploadRes = await apiFormDataClient(
          "/vendor/vendor/upload",
          formData,
        );

        const fileUrl = uploadRes?.publicUrl;
        if (!fileUrl || !isSafeUrl(fileUrl)) {
          throw new Error(
            tx(
              "Upload failed - invalid or missing URL",
              "فشل الرفع - الرابط مفقود أو غير صالح",
            ),
          );
        }

        attachments = [
          {
            name: currentFile.file.name,
            url: fileUrl,
            type: currentFile.isImage ? "image" : "file",
          },
        ];
        if (!lastMessage) lastMessage = tx("Attachment", "مرفق");
      }

      // Use customerId from props â€” do NOT fallback to auth UID
      const senderId = customerId;

      await addDoc(messagesRef, {
        text: lastMessage || tx("Attachment", "مرفق"),
        senderId,
        senderType: "customer",
        productId,
        vendorId,
        customerId,
        createdAt: serverTimestamp(),
        attachments,
      });

      // Update chat document metadata
      await setDoc(
        doc(db, "chats", chatId),
        {
          customerId,
          vendorId,
          productId,
          lastMessage,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (err: unknown) {
      // Restore input on failure
      setInputValue(text);
      const errorMessage =
        err instanceof Error && err.message
          ? err.message
          : tx(
              "Failed to send message. Please try again.",
              "فشل إرسال الرسالة. حاول مرة أخرى.",
            );
      toast.error(errorMessage);
      console.error("[ProductPageChat] send error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {!authReady && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`h-10 rounded-lg bg-[#F4F4F4] animate-pulse ${
                    i % 2 === 0 ? "w-2/3 rounded-bl-md" : "w-1/2 rounded-br-md"
                  }`}
                />
              </div>
            ))}
          </div>
        )}
        {authReady && messages.length === 0 && (
          <div className="text-center text-[#666666] text-sm py-8">
            <p className="font-normal">
              {tx("Start a conversation", "ابدأ محادثة")}
            </p>
            <p className="text-xs mt-1 text-[#999999]">
              {tx(
                "Ask about the product, availability, or pricing",
                "اسأل عن المنتج أو التوفر أو السعر",
              )}
            </p>
          </div>
        )}
        {messages.map((message) => {
          // Skip system messages from rendering (they have senderType === "system")
          if (message.senderType === "system") return null;

          const isCustomer = message.senderType === "customer";
          const hasAttachment =
            message.attachments && message.attachments.length > 0;
          const attachment = hasAttachment ? message.attachments![0] : null;
          const isImageAttachment =
            attachment?.type === "image" ||
            !!attachment?.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          const isLink = isSafeUrl(message.text.trim());

          return (
            <div
              key={message.id}
              className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg overflow-hidden ${
                  isCustomer
                    ? "bg-[#FF6600] text-white rounded-br-md"
                    : "bg-[#F4F4F4] text-[#222222] border border-[#DDDDDD] rounded-bl-md"
                }`}
              >
                {/* Attachment */}
                {hasAttachment && attachment && (
                  <div className="p-1">
                    {isImageAttachment ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-full max-h-48 rounded-lg cursor-pointer object-cover"
                        onClick={() => window.open(attachment.url, "_blank")}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
                          isCustomer ? "bg-white/10" : "bg-white"
                        }`}
                        onClick={() => window.open(attachment.url, "_blank")}
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="text-xs truncate flex-1">
                          {attachment.name}
                        </span>
                        <span className="text-[10px] text-[#999999] shrink-0">
                          {tx("Preview", "معاينة")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Text */}
                {message.text && !(hasAttachment && !message.text.trim()) && (
                  <div className="px-3 py-2">
                    {isLink ? (
                      <a
                        href={message.text.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline break-all"
                      >
                        {message.text}
                      </a>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    )}
                  </div>
                )}

                {/* Time */}
                {message.createdAt && (
                  <p
                    className={`text-[10px] px-3 pb-1.5 ${
                      isCustomer ? "text-white/70" : "text-[#999999]"
                    }`}
                  >
                    {getRelativeTime(message.createdAt)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {previewFile && (
        <div className="mx-3 mb-1 p-2 rounded-lg bg-[#F4F4F4] border border-[#DDDDDD] flex items-center gap-2.5 relative">
          {previewFile.isImage && previewFile.url ? (
            <img
              src={previewFile.url}
              alt="Preview"
              className="w-12 h-12 rounded-lg object-cover border border-[#DDDDDD]"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[#F4F4F4] border border-[#DDDDDD] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#666666]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-normal text-[#222222] truncate">
              {previewFile.file.name}
            </p>
            <p className="text-[10px] text-[#666666]">
              {(previewFile.file.size / 1024 / 1024).toLocaleString(
                typeof document !== "undefined" &&
                  document.documentElement.lang === "ar"
                  ? "ar-SA"
                  : "en-US",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 },
              )}{" "}
              MB
            </p>
          </div>
          <button
            onClick={removePreview}
            className="absolute top-1 right-1 p-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
            title={tx("Remove attachment", "إزالة المرفق")}
            aria-label={tx("Remove attachment", "إزالة المرفق")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2.5 border-t border-[#DDDDDD] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!!previewFile || !authReady}
            className="p-2 rounded-lg text-[#999999] hover:text-[#222222] hover:bg-[#F4F4F4] transition-colors disabled:opacity-40"
            title={tx("Attach file", "إرفاق ملف")}
            aria-label={tx("Attach file", "إرفاق ملف")}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xlsx,.csv"
            onChange={handleFileChange}
          />

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              previewFile
                ? tx("Add a caption...", "أضف تعليقًا...")
                : tx("Type a message...", "اكتب رسالة...")
            }
            className="flex-1 h-9 text-sm rounded-lg border border-[#DDDDDD] focus:border-[#FF6600]"
            disabled={!authReady}
          />
          <Button
            type="submit"
            disabled={
              (!inputValue.trim() && !previewFile) || sending || !authReady
            }
            size="icon"
            className="shrink-0 h-9 w-9 rounded-lg bg-[#FF6600] hover:bg-[#E65C00]"
            title={tx("Send message", "إرسال الرسالة")}
            aria-label={tx("Send message", "إرسال الرسالة")}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProductPageChat;
