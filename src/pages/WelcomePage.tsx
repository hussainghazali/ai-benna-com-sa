// Welcome gateway — real Benna GlassAuth welcome screen
// (ported from benna-mobile-app @ alibaba-clone).
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Globe, Camera } from "lucide-react";
import { GlassAuth } from "@/components/auth/GlassAuth";
import ComingSoonModal from "@/components/ComingSoonModal";
import { useLanguage } from "@/contexts/LanguageContext";

const BENNA_LOGO =
  "https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif";

const HOME = "/assistant";

const WelcomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const [googleSoon, setGoogleSoon] = useState(false);

  const qs = new URLSearchParams(location.search).get("redirect");
  const suffix = qs ? `?redirect=${encodeURIComponent(qs)}` : "";

  return (
    <>
      <GlassAuth
        logo={<img src={BENNA_LOGO} alt="Benna" className="h-9 w-auto" />}
        brandName="Benna"
        mode="login"
        showWelcomeScreen
        language={language}
        onLogoClick={() => navigate(HOME)}
        googleSignInButton={
          <button
            type="button"
            onClick={() => setGoogleSoon(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-ali-ink-900"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            {language === "ar" ? "المتابعة مع Google" : "Continue with Google"}
          </button>
        }
        onModeSwitch={(m) =>
          navigate(m === "signup" ? `/register${suffix}` : `/login${suffix}`)
        }
        languageSwitcher={
          <button
            type="button"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 rounded-full border border-ali-line-300 bg-white/60 px-3 py-1.5 text-xs text-ali-ink-700 backdrop-blur-sm transition-colors hover:text-ali-ink-900"
          >
            <Globe className="h-3.5 w-3.5" />
            {language === "ar" ? "English" : "العربية"}
          </button>
        }
      />
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
    </>
  );
};

export default WelcomePage;
