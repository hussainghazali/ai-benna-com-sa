import { CHAT_URL, STORE_URL } from "@/lib/store-url";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  Camera,
  FileText,
  MessageSquare,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ComingSoonModal from "@/components/ComingSoonModal";

/**
 * Alibaba-style fixed side rail — a vertical stack of quick actions pinned to
 * the left edge of the viewport: Messenger,
 * Benna AI, WhatsApp, Benna BOQ, Benna Lens (image search), RFQ, Back to Top.
 * Design reference: docs/ALIBABA-DESIGN-SYSTEM.md §4.5 (z-index, drawer tier).
 */

const itemClass =
  "group flex h-16 w-full flex-col items-center justify-center gap-1 px-1 text-ali-ink-700 transition-colors hover:text-ali-orange-500";

const labelClass =
  "text-[10px] font-medium leading-3 text-center truncate w-full";

const SideActionRail = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [lensOpen, setLensOpen] = useState(false);

  return (
    <>
      <nav
        aria-label={isAr ? "إجراءات سريعة" : "Quick actions"}
        className="fixed bottom-24 left-3 z-[60] hidden w-[68px] flex-col divide-y divide-ali-line-200 overflow-hidden rounded-xl border border-ali-line-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] xl:flex"
      >
        <a
          href={CHAT_URL}
          className={itemClass}
          aria-label={isAr ? "الرسائل" : "Messenger"}
        >
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          <span className={labelClass}>{isAr ? "الرسائل" : "Messenger"}</span>
        </a>

        <Link
          to="/assistant"
          className={itemClass}
          aria-label={isAr ? "المساعد الذكي" : "Benna AI"}
        >
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className={labelClass}>{isAr ? "بنّا AI" : "Benna AI"}</span>
        </Link>

        <a
          href={`https://wa.me/966565669693?text=${encodeURIComponent(
            isAr
              ? "مرحباً، أريد الاستفسار عن مواد البناء"
              : "Hi, I'd like to inquire about building materials",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClass}
          aria-label={isAr ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
        >
          <svg
            className="h-5 w-5 text-[#25D366] transition-colors group-hover:text-[#1EBE5B]"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className={labelClass}>WhatsApp</span>
        </a>

        <a
          href={`${STORE_URL}/build-project`}
          className={itemClass}
          aria-label="Benna BOQ"
        >
          <Wand2 className="h-5 w-5" aria-hidden="true" />
          <span className={labelClass}>{isAr ? "بنّا BOQ" : "Benna BOQ"}</span>
        </a>

        <button
          type="button"
          onClick={() => setLensOpen(true)}
          className={itemClass}
          aria-label={isAr ? "عدسة بنّا" : "Benna Lens"}
        >
          <Camera className="h-5 w-5" aria-hidden="true" />
          <span className={labelClass}>
            {isAr ? "عدسة بنّا" : "Benna Lens"}
          </span>
        </button>

        <a href={`${STORE_URL}/rfq`} className={itemClass} aria-label="Benna RFQ">
          <FileText className="h-5 w-5" aria-hidden="true" />
          <span className={labelClass}>
            {isAr ? "بنّا RFQ" : "Benna RFQ"}
          </span>
        </a>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={itemClass}
          aria-label={isAr ? "العودة للأعلى" : "Back to top"}
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
          <span className={labelClass}>
            {isAr ? "الأعلى" : "Back to Top"}
          </span>
        </button>
      </nav>

      <ComingSoonModal
        open={lensOpen}
        onOpenChange={setLensOpen}
        featureIcon={Camera}
        featureName={{ en: "Benna Lens", ar: "عدسة بنّة" }}
      />
    </>
  );
};

export default SideActionRail;
