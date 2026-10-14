import { Link, useSearchParams } from "react-router-dom";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const BENNA_LOGO =
  "https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif";

/** Exact replica of the Benna storefront /welcome auth gateway. */
const WelcomePage = () => {
  const { isRTL, t, language, setLanguage } = useLanguage();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/assistant";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Peach glow washes — match dev.store.benna.com.sa/welcome */}
      <div className="pointer-events-none absolute -left-48 top-0 h-[560px] w-[560px] rounded-full bg-[#FFD7B0]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-56 top-16 h-[680px] w-[680px] rounded-full bg-[#FFC294]/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-24 h-[300px] w-[300px] rounded-full bg-[#FFE3CC]/60 blur-3xl" />

      {/* Logo + language pill */}
      <div className="relative z-10 flex items-center justify-center gap-3 pt-8">
        <img src={BENNA_LOGO} alt="Benna" className="h-10 w-auto" decoding="async" />
        <button
          type="button"
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          className="flex items-center gap-1.5 rounded-full border border-ali-line-300 bg-white/60 px-3 py-1.5 text-xs text-ali-ink-700 backdrop-blur-sm transition-colors hover:text-ali-ink-900"
        >
          <Globe className="h-3.5 w-3.5" />
          {isRTL ? "English" : "العربية"}
        </button>
      </div>

      {/* Center card-less welcome */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex w-full max-w-sm flex-col items-center"
        >
          <h1 className="text-center text-4xl font-semibold tracking-tight text-ali-ink-900 sm:text-5xl">
            {t("Get started with Us", "ابدأ معنا")}
          </h1>

          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="mt-10 w-full rounded-full bg-ali-orange-500 py-3.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-ali-orange-600"
          >
            {t("Register with email", "التسجيل بالبريد الإلكتروني")}
          </Link>
          <Link
            to={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="mt-3 w-full rounded-full border border-ali-line-300 bg-white py-3.5 text-center text-[15px] font-semibold text-ali-ink-900 transition-colors hover:border-ali-orange-500 hover:text-ali-orange-500"
          >
            {t("Login with email", "تسجيل الدخول بالبريد الإلكتروني")}
          </Link>
        </motion.div>
      </div>

    </div>
  );
};

export default WelcomePage;
