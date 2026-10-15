// Welcome gateway — real Benna GlassAuth welcome screen
// (ported from benna-mobile-app @ alibaba-clone). Email-only auth.
import { useLocation, useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import { GlassAuth } from "@/components/auth/GlassAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const BENNA_LOGO =
  "https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif";

const HOME = "/assistant";

const WelcomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const qs = new URLSearchParams(location.search).get("redirect");
  const suffix = qs ? `?redirect=${encodeURIComponent(qs)}` : "";

  return (
    <GlassAuth
      logo={<img src={BENNA_LOGO} alt="Benna" className="h-9 w-auto" />}
      brandName="Benna"
      mode="login"
      showWelcomeScreen
      language={language}
      onLogoClick={() => navigate(HOME)}
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
  );
};

export default WelcomePage;
