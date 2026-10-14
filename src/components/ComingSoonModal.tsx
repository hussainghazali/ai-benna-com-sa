import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LucideIcon } from "lucide-react";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureIcon: LucideIcon;
  featureName: { en: string; ar: string };
  description?: { en: string; ar: string };
}

// Lightweight overlay modal — no radix dependency in this app.
const ComingSoonModal = ({
  open,
  onOpenChange,
  featureIcon: FeatureIcon,
  featureName,
  description,
}: ComingSoonModalProps) => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={isAr ? "إغلاق" : "Close"}
              className="absolute end-3 top-3 rounded-full p-1.5 text-ali-ink-500 hover:bg-ali-bg-100 hover:text-ali-ink-900"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ali-orange-100">
              <FeatureIcon className="h-7 w-7 text-ali-orange-500" />
            </div>

            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-ali-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ali-orange-600">
              <Sparkles className="h-3 w-3" />
              {isAr ? "قريباً" : "Coming soon"}
            </div>

            <h3 className="text-lg font-semibold text-ali-ink-900">
              {isAr ? featureName.ar : featureName.en}
            </h3>
            <p className="mt-2 text-sm text-ali-ink-500">
              {description
                ? isAr
                  ? description.ar
                  : description.en
                : isAr
                  ? "هذه الميزة قيد التطوير وستتوفر قريباً على منصة بنّة."
                  : "This feature is under development and will be available soon on Benna."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonModal;
