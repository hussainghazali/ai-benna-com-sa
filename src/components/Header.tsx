// Standalone header matching the Benna storefront chrome (Alibaba-style):
// single row, centered container — logo left; Deliver-to / language+currency
// popover / cart / messages popover / orders / Log in on the right.
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Globe, ShoppingCart, MessageCircle, Package, User, ChevronDown, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const { isRTL, t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [langOpen, setLangOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [pendingLang, setPendingLang] = useState<"en" | "ar">("en");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click / Esc
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setLangOpen(false);
        setMsgOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLangOpen(false);
        setMsgOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const displayName =
    (user as { name?: string; fullName?: string } | null)?.name ||
    (user as { name?: string; fullName?: string } | null)?.fullName ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <header className="sticky top-0 z-40 border-b border-ali-line-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link to="/assistant" className="flex shrink-0 items-center" aria-label="Benna - Home">
          <img
            src="https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif"
            alt="Benna"
            width={180}
            height={56}
            decoding="async"
            className="h-9 w-auto"
          />
        </Link>

        {/* Right utilities */}
        <div className="relative flex items-center gap-4 text-[13px] text-ali-ink-700" ref={wrapRef}>
          <span className="hidden items-center gap-1 md:flex">
            <MapPin className="h-4 w-4 text-ali-ink-500" />
            {t("Deliver to:", "التوصيل إلى:")}{" "}
            <span className="font-semibold text-ali-ink-900">SA</span>
          </span>

          {/* Language + currency dropdown */}
          <button
            type="button"
            onClick={() => {
              setPendingLang(language as "en" | "ar");
              setLangOpen((v) => !v);
              setMsgOpen(false);
            }}
            className="hidden items-center gap-1 hover:text-ali-ink-900 md:flex"
          >
            <Globe className="h-4 w-4 text-ali-ink-500" />
            {isRTL ? "English–SAR" : "العربية–ر.س"}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {langOpen && (
            <div className="absolute end-0 top-full z-50 mt-3 w-[320px] rounded-xl border border-ali-line-200 bg-white p-5 text-start shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <h3 className="text-[16px] font-semibold text-ali-ink-900">
                {t("Set language and currency", "اختر اللغة والعملة")}
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-ali-ink-500">
                {t(
                  "Select your preferred language and currency. You can update the settings at any time.",
                  "اختر لغتك وعملتك المفضلة. يمكنك تعديل الإعدادات في أي وقت.",
                )}
              </p>

              <label className="mt-4 block text-[12px] font-medium text-ali-ink-900">
                {t("Language", "اللغة")}
              </label>
              <select
                value={pendingLang}
                onChange={(e) => setPendingLang(e.target.value as "en" | "ar")}
                className="mt-1 h-11 w-full rounded-lg border-2 border-ali-orange-500 bg-white px-3 text-[14px] text-ali-ink-900 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>

              <label className="mt-4 block text-[12px] font-medium text-ali-ink-900">
                {t("Currency", "العملة")}
              </label>
              <div className="mt-1 flex h-11 w-full items-center justify-between rounded-lg border border-ali-line-300 bg-ali-bg-100 px-3 text-[14px] text-ali-ink-500">
                <span>{t("SAR - Saudi Arabian Riyal", "ر.س - ريال سعودي")}</span>
                <Lock className="h-4 w-4 text-ali-ink-400" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setLanguage(pendingLang);
                  setLangOpen(false);
                }}
                className="mt-5 h-11 w-full rounded-full bg-ali-orange-500 text-[15px] font-semibold text-white transition-colors hover:bg-ali-orange-600"
              >
                {t("Save", "حفظ")}
              </button>
            </div>
          )}

          <button type="button" onClick={() => setIsCartOpen(true)} className="relative hover:text-ali-ink-900" title={t("Cart", "السلة")}>
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-1.5 -end-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ali-danger text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </button>

          {/* Messages dropdown */}
          <button
            type="button"
            onClick={() => {
              setMsgOpen((v) => !v);
              setLangOpen(false);
            }}
            className="relative hover:text-ali-ink-900"
            title={t("Messages", "الرسائل")}
          >
            <MessageCircle className="h-5 w-5" />
          </button>

          {msgOpen && (
            <div className="absolute end-0 top-full z-50 mt-3 w-[340px] rounded-xl border border-ali-line-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <h3 className="text-[18px] font-semibold text-ali-ink-900">
                {t("Messages", "الرسائل")}
              </h3>
              <p className="mt-8 mb-8 text-center text-[14px] text-ali-ink-500">
                {isAuthenticated
                  ? t("No messages yet", "لا توجد رسائل بعد")
                  : t("Sign in to view more", "سجّل الدخول للعرض")}
              </p>
              <Link
                to={isAuthenticated ? "/assistant" : "/welcome?redirect=/assistant"}
                onClick={() => setMsgOpen(false)}
                className="block h-12 w-full rounded-full bg-ali-orange-500 text-center text-[15px] font-semibold leading-[3rem] text-white transition-colors hover:bg-ali-orange-600"
              >
                {isAuthenticated ? t("Open messages", "فتح الرسائل") : t("Sign in", "تسجيل الدخول")}
              </Link>
            </div>
          )}

          <Package className="h-5 w-5 cursor-pointer hover:text-ali-ink-900" />

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/assistant");
              }}
              className="flex items-center gap-1 font-semibold text-ali-ink-900 hover:text-ali-orange-500"
              title={t("Log out", "تسجيل الخروج")}
            >
              <User className="h-4 w-4" />
              {displayName}
            </button>
          ) : (
            <Link
              to="/welcome?redirect=/assistant"
              className="font-semibold text-ali-ink-900 hover:text-ali-orange-500"
            >
              {t("Log in", "تسجيل الدخول")}
            </Link>
          )}
        </div>
      </div>

    </header>
  );
};

export default Header;
