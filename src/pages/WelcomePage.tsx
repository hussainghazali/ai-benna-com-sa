import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Globe, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import ComingSoonModal from "@/components/ComingSoonModal";

const BENNA_LOGO =
  "https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
    />
  </svg>
);

/** Exact replica of the Benna storefront /welcome auth gateway. */
const WelcomePage = () => {
  const { isRTL, t, language, setLanguage } = useLanguage();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/assistant";
  const [googleSoon, setGoogleSoon] = useState(false);

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

          <p className="mt-10 text-sm text-ali-ink-500">
            {t("Continue with", "المتابعة عبر")}
          </p>

          {/* Google sign-in chip */}
          <button
            type="button"
            onClick={() => setGoogleSoon(true)}
            className="mt-4 flex w-full items-center gap-3 rounded-full border border-ali-line-300 bg-white px-5 py-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ali-bg-100 text-[13px] font-semibold text-ali-ink-700">
              T
            </span>
            <span className="flex-1 text-start text-sm font-medium text-ali-ink-900">
              {t("Sign in with Google", "تسجيل الدخول عبر Google")}
            </span>
            <GoogleIcon />
          </button>

          <div className="my-5 flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-ali-line-300" />
            <span className="text-xs text-ali-ink-500">{t("OR", "أو")}</span>
            <div className="h-px flex-1 bg-ali-line-300" />
          </div>

          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="w-full rounded-full bg-ali-orange-500 py-3.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-ali-orange-600"
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

      <ComingSoonModal
        open={googleSoon}
        onOpenChange={setGoogleSoon}
        featureIcon={Camera}
        featureName={{ en: "Google sign-in", ar: "تسجيل Google" }}
        description={{
          en: "Google sign-in isn't enabled on this standalone app yet — use email.",
          ar: "تسجيل الدخول عبر Google غير مفعّل بعد في هذا التطبيق — استخدم البريد الإلكتروني.",
        }}
      />
    </div>
  );
};

export default WelcomePage;
