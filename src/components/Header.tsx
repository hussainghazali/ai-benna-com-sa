// Standalone header matching the Benna storefront chrome (Alibaba-style):
// single row, centered container — logo left; Deliver-to / language+currency
// popover / cart / messages popover / orders / Log in on the right.
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Globe, ShoppingCart, MessagesSquare, ClipboardList, User, ChevronDown, Lock, ShieldCheck, RotateCcw, Truck, ClipboardCheck } from "lucide-react";
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
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [pendingCountry, setPendingCountry] = useState("SA");
  const [pendingLang, setPendingLang] = useState<"en" | "ar">("en");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click / Esc
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setLangOpen(false);
        setMsgOpen(false);
        setOrdersOpen(false);
        setLocOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLangOpen(false);
        setMsgOpen(false);
        setOrdersOpen(false);
        setLocOpen(false);
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
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link to="/assistant" className="flex shrink-0 items-center" aria-label="Benna - Home">
          <img
            src="https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif"
            alt="Benna"
            width={180}
            height={56}
            decoding="async"
            className="h-11 w-auto"
          />
        </Link>

        {/* Right utilities */}
        <div className="relative flex items-center gap-6 text-[14px] text-ali-ink-700" ref={wrapRef}>
          {/* Deliver-to dropdown — specify your location */}
          <button
            type="button"
            onClick={() => {
              setLocOpen((v) => !v);
              setLangOpen(false);
              setMsgOpen(false);
              setOrdersOpen(false);
            }}
            className="hidden items-center gap-1 md:flex hover:text-ali-ink-900"
          >
            <MapPin className="h-5 w-5 text-ali-ink-500" />
            {t("Deliver to:", "التوصيل إلى:")}{" "}
            <span className="rounded border border-ali-line-300 px-1 py-0.5 text-[10px] font-medium text-ali-ink-500">SA</span>{" "}
            <span className="font-semibold text-ali-ink-900">SA</span>
          </button>

          {locOpen && (
            <div className="absolute start-0 top-full z-50 mt-3 w-[340px] rounded-xl border border-ali-line-200 bg-white p-5 text-start shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <h3 className="text-[18px] font-semibold text-ali-ink-900">
                {t("Specify your location", "حدد موقعك")}
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-ali-ink-500">
                {t(
                  "Shipping options and fees vary based on your location",
                  "تختلف خيارات الشحن والرسوم حسب موقعك",
                )}
              </p>

              <Link
                to="/welcome?redirect=/assistant"
                onClick={() => setLocOpen(false)}
                className="mt-4 block h-11 w-full rounded-full bg-ali-orange-500 text-center text-[15px] font-semibold leading-[2.75rem] text-white transition-colors hover:bg-ali-orange-600"
              >
                {t("Sign in to add address", "سجّل الدخول لإضافة عنوان")}
              </Link>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-ali-line-300" />
                <span className="text-[12px] text-ali-ink-400">{t("Or", "أو")}</span>
                <div className="h-px flex-1 bg-ali-line-300" />
              </div>

              <select
                value={pendingCountry}
                onChange={(e) => setPendingCountry(e.target.value)}
                className="h-11 w-full rounded-lg border-2 border-ali-orange-500 bg-white px-3 text-[14px] text-ali-ink-900 focus:outline-none"
              >
                <option value="SA">SA&nbsp;&nbsp;{t("Saudi Arabia", "السعودية")}</option>
                <option value="AE">AE&nbsp;&nbsp;{t("United Arab Emirates", "الإمارات")}</option>
                <option value="KW">KW&nbsp;&nbsp;{t("Kuwait", "الكويت")}</option>
                <option value="QA">QA&nbsp;&nbsp;{t("Qatar", "قطر")}</option>
                <option value="BH">BH&nbsp;&nbsp;{t("Bahrain", "البحرين")}</option>
                <option value="OM">OM&nbsp;&nbsp;{t("Oman", "عُمان")}</option>
              </select>

              <button
                type="button"
                onClick={() => setLocOpen(false)}
                className="mt-4 h-11 w-full rounded-full bg-ali-orange-500 text-[15px] font-semibold text-white transition-colors hover:bg-ali-orange-600"
              >
                {t("Save", "حفظ")}
              </button>
            </div>
          )}

          {/* Language + currency dropdown */}
          <button
            type="button"
            onClick={() => {
              setPendingLang(language as "en" | "ar");
              setLangOpen((v) => !v);
              setMsgOpen(false);
              setOrdersOpen(false);
        setLocOpen(false);
            }}
            className="hidden items-center gap-1 hover:text-ali-ink-900 md:flex"
          >
            <Globe className="h-5 w-5 text-ali-ink-500" />
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
              setOrdersOpen(false);
        setLocOpen(false);
            }}
            className="relative hover:text-ali-ink-900"
            title={t("Messages", "الرسائل")}
          >
            <MessagesSquare className="h-5 w-5" />
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

          {/* Orders dropdown — Trade Assurance panel */}
          <button
            type="button"
            onClick={() => {
              setOrdersOpen((v) => !v);
              setLangOpen(false);
              setMsgOpen(false);
              setLocOpen(false);
            }}
            className="relative hover:text-ali-ink-900"
            title={t("Orders", "الطلبات")}
          >
            <ClipboardList className="h-5 w-5" />
          </button>

          {ordersOpen && (
            <div className="absolute end-0 top-full z-50 mt-3 w-[320px] rounded-xl border border-ali-line-200 bg-white p-5 text-start shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <h3 className="text-[18px] font-semibold text-ali-ink-900">
                {t("Orders", "الطلبات")}
              </h3>

              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ali-orange-100">
                  <ShieldCheck className="h-6 w-6 text-ali-orange-500" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-ali-ink-900">
                    {t("Trade Assurance", "ضمان التجارة")}
                  </h4>
                  <p className="mt-0.5 text-[13px] leading-snug text-ali-ink-500">
                    {t(
                      "Enjoy protection from payment to delivery",
                      "استمتع بحماية من الدفع حتى التسليم",
                    )}
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-4">
                {[
                  { Icon: Lock, label: t("Secure payments", "مدفوعات آمنة") },
                  {
                    Icon: RotateCcw,
                    label: t("Money-back guarantee", "ضمان استرداد الأموال"),
                  },
                  {
                    Icon: Truck,
                    label: t("Guaranteed on-time delivery", "تسليم مضمون في الموعد"),
                  },
                  {
                    Icon: ClipboardCheck,
                    label: t("After-sales protections", "حماية ما بعد البيع"),
                  },
                ].map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ali-orange-100">
                      <Icon className="h-[18px] w-[18px] text-ali-orange-500" />
                    </span>
                    <span className="text-[14px] font-medium text-ali-ink-900">{label}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://store.benna.com.sa/order-protection"
                className="mt-5 inline-block text-[14px] font-medium text-ali-ink-900 underline hover:text-ali-orange-500"
              >
                {t("Learn more", "اعرف المزيد")}
              </a>
            </div>
          )}

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
              <User className="h-5 w-5" />
              {displayName}
            </button>
          ) : (
            <Link
              to="/welcome?redirect=/assistant"
              className="flex items-center gap-1.5 font-semibold text-ali-ink-900 hover:text-ali-orange-500"
            >
              <User className="h-5 w-5" />
              {t("Log in", "تسجيل الدخول")}
            </Link>
          )}
        </div>
      </div>

    </header>
  );
};

export default Header;
