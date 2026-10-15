// Auth page using the real Benna storefront GlassAuth component
// (ported from benna-mobile-app @ alibaba-clone), wired to our authApi.
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import { GlassAuth } from "@/components/auth/GlassAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const BENNA_LOGO =
  "https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif";

const HOME = "/assistant";
const ALLOWED_REDIRECT_PATHS = /^\/[a-zA-Z0-9\-_/]*$/;

const validateRedirectTarget = (target: string): string => {
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return HOME;
    if (!ALLOWED_REDIRECT_PATHS.test(url.pathname)) return HOME;
    return `${url.pathname}${url.search}`;
  } catch {
    return HOME;
  }
};

const AuthPage = ({ mode }: { mode: "login" | "register" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const redirectTarget = validateRedirectTarget(
    new URLSearchParams(location.search).get("redirect") || HOME,
  );

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTarget, { replace: true });
  }, [isAuthenticated, navigate, redirectTarget]);

  const handleSubmit = async ({
    email,
    password,
    name,
    phone,
  }: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) => {
    if (mode === "login") await login(email, password);
    else await register({ name: name || "User", email, phone, password });
    navigate(redirectTarget, { replace: true });
  };

  return (
    <GlassAuth
        logo={<img src={BENNA_LOGO} alt="Benna" className="h-9 w-auto" />}
        brandName="Benna"
        mode={mode === "register" ? "signup" : "login"}
        showWelcomeScreen={false}
        language={language}
        onLogoClick={() => navigate(HOME)}
        onSubmit={handleSubmit}
        onModeSwitch={(m) =>
          navigate(
            m === "signup"
              ? `/register?redirect=${encodeURIComponent(redirectTarget)}`
              : `/login?redirect=${encodeURIComponent(redirectTarget)}`,
          )
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

export default AuthPage;
