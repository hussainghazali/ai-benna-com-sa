// Standalone header — port of the storefront's top row (benna-mobile-app,
// branch alibaba-clone): logo left; Deliver-to / language+currency / cart /
// messages / orders / login-or-account flyouts on the right.
// The storefront's lower links row (All categories, Verified vendors … /
// About Benna …) is intentionally NOT part of this app header.
//
// Flyouts are dependency-free (no Radix Popover/Select/DropdownMenu) so the
// same file works in every standalone app. Markup + classes mirror the store.
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Globe,
  ShoppingCart,
  MessagesSquare,
  ClipboardList,
  User,
  ChevronDown,
  Lock,
  ShieldCheck,
  RotateCcw,
  Truck,
  BadgeCheck,
  Package,
  MapPinned,
  CreditCard,
  Heart,
  CircleUser as UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProductImage } from "@/utils/imageUtils";

// Where this app's logo / sign-in redirects land.
const APP_HOME = "/assistant";
const STORE = "https://store.benna.com.sa";
const LOGO_SRC =
  "https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif";
const SIGN_IN = `/welcome?redirect=${APP_HOME}`;

const SHIP_TO_COUNTRIES = [
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", ar: "السعودية" },
  { code: "AE", flag: "🇦🇪", name: "United Arab Emirates", ar: "الإمارات" },
  { code: "KW", flag: "🇰🇼", name: "Kuwait", ar: "الكويت" },
  { code: "BH", flag: "🇧🇭", name: "Bahrain", ar: "البحرين" },
  { code: "QA", flag: "🇶🇦", name: "Qatar", ar: "قطر" },
  { code: "OM", flag: "🇴🇲", name: "Oman", ar: "عُمان" },
];

type PanelId = "ship" | "lang" | "cart" | "chat" | "orders" | "login" | "account";

const NATIVE_SELECT =
  "mt-1.5 h-11 w-full rounded-md border border-ali-line-300 bg-white px-3 text-sm text-ali-ink-900 focus:border-ali-orange-500 focus:outline-none";
const PILL_ORANGE =
  "rounded-full bg-ali-orange-500 text-sm font-bold text-white transition-colors hover:bg-ali-orange-600";
const PILL_OUTLINE =
  "flex h-10 w-full items-center justify-center rounded-full border border-ali-ink-900 text-sm font-semibold text-ali-ink-900 transition-colors hover:bg-ali-bg-100";

// Absolutely-positioned panel under its trigger. The outer wrapper carries
// top padding so the pointer can travel from trigger to panel without a gap.
const FlyoutPanel = ({
  align,
  width,
  className = "",
  children,
}: {
  align: "end" | "center";
  width: string;
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={`absolute top-full z-50 pt-3 ${
      align === "end"
        ? "end-0"
        : "left-1/2 -translate-x-1/2 rtl:end-0 rtl:left-auto rtl:translate-x-0"
    }`}
  >
    <div
      className={`${width} max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-2xl ${className}`}
    >
      {children}
    </div>
  </div>
);

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, cartData, setIsCartOpen } = useCart();
  const { isRTL, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const en = language === "en";

  const [open, setOpen] = useState<PanelId | null>(null);
  const [draftLang, setDraftLang] = useState<"en" | "ar">(language);
  const [shipToCode, setShipToCode] = useState<string>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("benna_ship_to") || "null");
      return SHIP_TO_COUNTRIES.find((c) => c.code === saved?.country)?.code ?? "SA";
    } catch {
      return "SA";
    }
  });
  const shipTo =
    SHIP_TO_COUNTRIES.find((c) => c.code === shipToCode) ?? SHIP_TO_COUNTRIES[0];

  const stripRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Hover-to-open (cart / messages / orders / sign-in) — same as the store.
  const hoverProps = (id: PanelId) => ({
    onMouseEnter: () => {
      clearCloseTimer();
      setOpen(id);
    },
    onMouseLeave: () => {
      clearCloseTimer();
      closeTimer.current = setTimeout(
        () => setOpen((cur) => (cur === id ? null : cur)),
        120,
      );
    },
  });

  // Close on outside click / Esc
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (stripRef.current && !stripRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      clearCloseTimer();
    };
  }, []);

  const toggle = (id: PanelId) => setOpen((cur) => (cur === id ? null : id));

  const handleShipToSave = () => {
    try {
      localStorage.setItem("benna_ship_to", JSON.stringify({ country: shipToCode }));
    } catch {
      /* storage unavailable */
    }
    setOpen(null);
  };

  const handleLogout = () => {
    setOpen(null);
    logout();
    navigate(APP_HOME);
  };

  const firstName =
    user?.name?.split(" ")[0] || user?.email?.split("@")[0] || (en ? "My account" : "حسابي");
  const cartProducts = cartData?.products ?? [];

  const cartBadge =
    itemCount > 0 ? (
      <span className="absolute -top-1.5 -right-2.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-ali-danger px-1 text-[10px] font-bold text-white">
        {itemCount}
      </span>
    ) : null;

  const accountLinks = [
    { Icon: Package, en: "Orders", ar: "الطلبات", href: `${STORE}/account/orders` },
    { Icon: MapPinned, en: "Addresses", ar: "العناوين", href: `${STORE}/account/addresses` },
    { Icon: CreditCard, en: "Payments", ar: "طرق الدفع", href: `${STORE}/account/payments` },
    { Icon: Heart, en: "Wishlist", ar: "قائمة الرغبات", href: `${STORE}/account/wishlist` },
    { Icon: RotateCcw, en: "Returns", ar: "المرتجعات", href: `${STORE}/account/returns` },
    { Icon: UserCircle, en: "Profile", ar: "الملف الشخصي", href: `${STORE}/account/profile` },
  ];

  const deliverToInner = (
    <>
      <MapPin className="h-[18px] w-[18px] text-ali-ink-500" />
      <span>{en ? "Deliver to" : "التوصيل إلى"}:</span>
      <span className="text-base leading-none" aria-hidden="true">
        {shipTo.flag}
      </span>
      <span className="font-bold text-ali-ink-900">{shipTo.code}</span>
    </>
  );

  return (
    <header
      className="sticky top-0 z-50 bg-white"
      dir={isRTL ? "rtl" : "ltr"}
      role="banner"
      aria-label={en ? "Main site header - Benna" : "رأس الموقع الرئيسي - بناء"}
    >
      {/* ====== Desktop — logo + utility toolbar ====== */}
      <div
        className="relative hidden border-b border-gray-100 bg-white xl:block"
        role="navigation"
        aria-label={en ? "Top navigation" : "التنقل العلوي"}
      >
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between gap-8 pb-3 pt-4">
            {/* Left: logo */}
            <Link
              to={APP_HOME}
              className="flex shrink-0 items-center"
              aria-label={en ? "Benna - Home" : "بناء - الصفحة الرئيسية"}
            >
              <img
                src={LOGO_SRC}
                alt={en ? "Benna - Building Materials Marketplace Saudi Arabia" : "بناء - منصة مواد البناء في السعودية"}
                width={160}
                height={56}
                decoding="async"
                className="h-11 w-auto"
              />
            </Link>

            {/* Right: utility strip */}
            <div
              ref={stripRef}
              className="flex items-center gap-6 text-[15px] font-medium text-ali-ink-700"
            >
              {/* Deliver to */}
              {isAuthenticated ? (
                <a
                  href={`${STORE}/account/addresses`}
                  className="flex items-center gap-1.5 transition-colors hover:text-ali-ink-900"
                  aria-label={en ? "Deliver to Saudi Arabia" : "التوصيل إلى السعودية"}
                >
                  {deliverToInner}
                </a>
              ) : (
                <div className="relative flex">
                  <button
                    type="button"
                    onClick={() => toggle("ship")}
                    aria-expanded={open === "ship"}
                    aria-haspopup="dialog"
                    className="flex items-center gap-1.5 transition-colors hover:text-ali-ink-900"
                    aria-label={en ? "Deliver to Saudi Arabia" : "التوصيل إلى السعودية"}
                  >
                    {deliverToInner}
                  </button>
                  {open === "ship" && (
                    <FlyoutPanel align="end" width="w-[320px]" className="p-5 text-start">
                      <h3 className="text-base font-bold text-ali-ink-900">
                        {en ? "Specify your location" : "حدد موقعك"}
                      </h3>
                      <p className="mt-1 text-[13px] text-ali-ink-500">
                        {en
                          ? "Shipping options and fees vary based on your location"
                          : "تختلف خيارات الشحن والرسوم حسب موقعك"}
                      </p>
                      <Link
                        to={SIGN_IN}
                        onClick={() => setOpen(null)}
                        className={`mt-4 flex h-11 items-center justify-center ${PILL_ORANGE}`}
                      >
                        {en ? "Sign in to add address" : "سجّل الدخول لإضافة عنوان"}
                      </Link>
                      <div className="my-4 flex items-center gap-3 text-xs text-ali-ink-400">
                        <span className="h-px flex-1 bg-ali-line-300" />
                        {en ? "Or" : "أو"}
                        <span className="h-px flex-1 bg-ali-line-300" />
                      </div>
                      <select
                        value={shipToCode}
                        onChange={(e) => setShipToCode(e.target.value)}
                        className={NATIVE_SELECT.replace("mt-1.5 ", "")}
                        aria-label={en ? "Country" : "الدولة"}
                      >
                        {SHIP_TO_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {en ? c.name : c.ar}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleShipToSave}
                        className={`mt-4 h-11 w-full ${PILL_ORANGE}`}
                      >
                        {en ? "Save" : "حفظ"}
                      </button>
                    </FlyoutPanel>
                  )}
                </div>
              )}

              {/* Language + currency */}
              <div className="relative flex">
                <button
                  type="button"
                  onClick={() => {
                    setDraftLang(language);
                    toggle("lang");
                  }}
                  aria-expanded={open === "lang"}
                  aria-haspopup="dialog"
                  className="flex items-center gap-1 font-medium transition-colors hover:text-ali-ink-900"
                  aria-label={en ? "Set language and currency" : "تعيين اللغة والعملة"}
                >
                  <Globe className="h-[18px] w-[18px] text-ali-ink-500" />
                  <span>{en ? "English-SAR" : "العربية-SAR"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-ali-ink-400" />
                </button>
                {open === "lang" && (
                  <FlyoutPanel align="end" width="w-[320px]" className="p-5 text-start">
                    <h3 className="text-base font-bold text-ali-ink-900">
                      {en ? "Set language and currency" : "تعيين اللغة والعملة"}
                    </h3>
                    <p className="mt-1 text-[13px] text-ali-ink-500">
                      {en
                        ? "Select your preferred language and currency. You can update the settings at any time."
                        : "اختر لغتك وعملتك المفضلة. يمكنك تغيير الإعدادات في أي وقت."}
                    </p>
                    <label
                      htmlFor="hdr-lang"
                      className="mt-4 block text-xs font-semibold text-ali-ink-900"
                    >
                      {en ? "Language" : "اللغة"}
                    </label>
                    <select
                      id="hdr-lang"
                      value={draftLang}
                      onChange={(e) => setDraftLang(e.target.value as "en" | "ar")}
                      className={NATIVE_SELECT}
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                    <label className="mt-3 block text-xs font-semibold text-ali-ink-900">
                      {en ? "Currency" : "العملة"}
                    </label>
                    <div className="mt-1.5 flex h-11 w-full items-center justify-between rounded-md border border-ali-line-300 bg-ali-bg-100 px-3 text-sm text-ali-ink-500">
                      <span>{en ? "SAR - Saudi Arabian Riyal" : "ريال سعودي - SAR"}</span>
                      <Lock className="h-4 w-4 text-ali-ink-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage(draftLang);
                        setOpen(null);
                      }}
                      className={`mt-4 h-11 w-full ${PILL_ORANGE}`}
                    >
                      {en ? "Save" : "حفظ"}
                    </button>
                  </FlyoutPanel>
                )}
              </div>

              {/* Cart: hover flyout + click opens drawer */}
              <div className="relative flex" {...hoverProps("cart")}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(null);
                    setIsCartOpen(true);
                  }}
                  className="relative transition-colors hover:text-ali-ink-900"
                  aria-label={en ? "Open cart" : "فتح السلة"}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartBadge}
                </button>
                {open === "cart" && (
                  <FlyoutPanel align="center" width="w-[320px]" className="p-5 text-start">
                    <h3 className="text-sm font-bold text-ali-ink-900">
                      {en ? "Shopping cart" : "سلة التسوق"}
                    </h3>
                    {cartProducts.length === 0 ? (
                      <div className="flex flex-col items-center py-5 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-ali-bg-100">
                          <span className="text-3xl" aria-hidden="true">
                            📦
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-ali-ink-900">
                          {en ? "Your cart is empty" : "سلة التسوق فارغة"}
                        </p>
                        <p className="mt-0.5 text-xs text-ali-ink-500">
                          {en
                            ? "Add items to your cart to see them here"
                            : "أضف منتجات إلى سلتك لتظهر هنا"}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(null);
                            setIsCartOpen(true);
                          }}
                          className={`mt-4 ${PILL_OUTLINE}`}
                        >
                          {en ? "Go to cart" : "الذهاب إلى السلة"}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3">
                        <div className="space-y-3">
                          {cartProducts.slice(0, 3).map((item) => (
                            <div key={item.productId} className="flex items-center gap-3">
                              <img
                                src={getProductImage(item.productImageUrl)}
                                alt={item.productName}
                                className="h-12 w-12 rounded-md border border-ali-line-200 bg-white object-contain"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] text-ali-ink-900">
                                  {item.productName}
                                </p>
                                <p className="text-xs tabular-nums text-ali-ink-500">
                                  {en ? "Qty" : "الكمية"}: {item.productQuantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(null);
                            setIsCartOpen(true);
                          }}
                          className={`mt-4 ${PILL_OUTLINE}`}
                        >
                          {en
                            ? `Go to cart (${itemCount})`
                            : `الذهاب إلى السلة (${itemCount})`}
                        </button>
                      </div>
                    )}
                  </FlyoutPanel>
                )}
              </div>

              {/* Messages: hover flyout (signed-out) or direct link (signed-in) */}
              {isAuthenticated ? (
                <a
                  href={`${STORE}/benna-chat`}
                  className="transition-colors hover:text-ali-ink-900"
                  aria-label="Benna Chat"
                >
                  <MessagesSquare className="h-5 w-5" />
                </a>
              ) : (
                <div className="relative flex" {...hoverProps("chat")}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(null);
                      navigate(SIGN_IN);
                    }}
                    className="transition-colors hover:text-ali-ink-900"
                    aria-label={en ? "Messages" : "الرسائل"}
                  >
                    <MessagesSquare className="h-5 w-5" />
                  </button>
                  {open === "chat" && (
                    <FlyoutPanel align="center" width="w-[320px]" className="p-5 text-center">
                      <h3 className="text-start text-sm font-bold text-ali-ink-900">
                        {en ? "Messages" : "الرسائل"}
                      </h3>
                      <p className="mt-3 text-[13px] text-ali-ink-500">
                        {en ? "Sign in to view more" : "سجّل الدخول لعرض المزيد"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(null);
                          navigate(SIGN_IN);
                        }}
                        className={`mt-4 h-10 w-full ${PILL_ORANGE}`}
                      >
                        {en ? "Sign in" : "تسجيل الدخول"}
                      </button>
                    </FlyoutPanel>
                  )}
                </div>
              )}

              {/* Orders: hover flyout with Trade Assurance (signed-out) or direct link */}
              {isAuthenticated ? (
                <a
                  href={`${STORE}/account/orders`}
                  className="transition-colors hover:text-ali-ink-900"
                  aria-label={en ? "Orders & RFQs" : "الطلبات وعروض الأسعار"}
                >
                  <ClipboardList className="h-5 w-5" />
                </a>
              ) : (
                <div className="relative flex" {...hoverProps("orders")}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(null);
                      navigate(SIGN_IN);
                    }}
                    className="transition-colors hover:text-ali-ink-900"
                    aria-label={en ? "Orders & RFQs" : "الطلبات وعروض الأسعار"}
                  >
                    <ClipboardList className="h-5 w-5" />
                  </button>
                  {open === "orders" && (
                    <FlyoutPanel align="end" width="w-[380px]" className="p-6 text-start">
                      <h3 className="text-base font-bold text-ali-ink-900">
                        {en ? "Orders" : "الطلبات"}
                      </h3>
                      <div className="mt-4 flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ali-orange-100">
                          <ShieldCheck className="h-6 w-6 text-ali-orange-500" />
                        </div>
                        <div>
                          <p className="text-[15px] font-semibold text-ali-ink-900">
                            {en ? "Trade Assurance" : "ضمان التجارة"}
                          </p>
                          <p className="text-sm text-ali-ink-500">
                            {en
                              ? "Enjoy protection from payment to delivery"
                              : "حماية كاملة من الدفع حتى التسليم"}
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-3 text-sm text-ali-ink-700">
                        {[
                          { en: "Secure payments", ar: "مدفوعات آمنة", Icon: Lock },
                          { en: "Money-back guarantee", ar: "ضمان استرداد الأموال", Icon: RotateCcw },
                          { en: "Guaranteed on-time delivery", ar: "تسليم مضمون في الوقت المحدد", Icon: Truck },
                          { en: "After-sales protections", ar: "حماية ما بعد البيع", Icon: BadgeCheck },
                        ].map(({ en: label, ar, Icon }) => (
                          <li key={label} className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ali-orange-100">
                              <Icon className="h-[18px] w-[18px] text-ali-orange-500" />
                            </span>
                            <span className="font-medium">{en ? label : ar}</span>
                          </li>
                        ))}
                      </ul>
                      <a
                        href={`${STORE}/faqs`}
                        className="mt-5 inline-block text-sm font-semibold text-ali-ink-900 underline underline-offset-2 transition-colors hover:text-ali-orange-500"
                      >
                        {en ? "Learn more" : "اعرف المزيد"}
                      </a>
                    </FlyoutPanel>
                  )}
                </div>
              )}

              {/* Account (signed-in) / Log in (signed-out) */}
              {isAuthenticated ? (
                <div className="relative flex">
                  <button
                    type="button"
                    onClick={() => toggle("account")}
                    aria-expanded={open === "account"}
                    aria-haspopup="menu"
                    className="flex items-center gap-1.5 outline-none transition-colors hover:text-ali-ink-900"
                  >
                    <User className="h-5 w-5" />
                    <span className="max-w-[140px] truncate font-medium">{firstName}</span>
                  </button>
                  {open === "account" && (
                    <FlyoutPanel align="end" width="w-64" className="overflow-hidden text-start">
                      <div className="bg-ali-orange-500 px-4 py-3">
                        <span className="text-base font-bold text-white">
                          {en ? "Marhaba" : "مرحباً"} {firstName}!
                        </span>
                      </div>
                      <div className="py-2" role="menu">
                        {accountLinks.map(({ Icon, en: label, ar, href }) => (
                          <a
                            key={href}
                            href={href}
                            role="menuitem"
                            className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50"
                          >
                            <Icon className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-800">
                              {en ? label : ar}
                            </span>
                          </a>
                        ))}
                        <div className="my-1 h-px bg-gray-100" />
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-start hover:bg-gray-50"
                        >
                          <LogOut className="h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-800">
                            {en ? "Log out" : "تسجيل الخروج"}
                          </span>
                        </button>
                      </div>
                    </FlyoutPanel>
                  )}
                </div>
              ) : (
                <div className="relative -mb-3 flex pb-3" {...hoverProps("login")}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(null);
                      navigate(SIGN_IN);
                    }}
                    className="flex items-center gap-1.5 font-medium transition-colors hover:text-ali-ink-900"
                  >
                    <User className="h-5 w-5" />
                    <span>{en ? "Log in" : "تسجيل الدخول"}</span>
                  </button>
                  {open === "login" && (
                    <div className="absolute end-0 top-full z-50 pt-0">
                      <div className="w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-5 text-start shadow-2xl">
                        <h3 className="text-sm font-bold text-ali-ink-900">
                          {en ? "Sign back in to continue" : "سجّل الدخول للمتابعة"}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(null);
                            navigate(SIGN_IN);
                          }}
                          className={`mt-3 h-10 w-full ${PILL_ORANGE}`}
                        >
                          {en ? "Sign in" : "تسجيل الدخول"}
                        </button>
                        <p className="mt-3 text-[11px] leading-relaxed text-ali-ink-500">
                          {en ? (
                            <>
                              By signing in, I agree to the BENNA{" "}
                              <a href={`${STORE}/terms-of-use`} className="underline">
                                Terms of Use
                              </a>{" "}
                              and{" "}
                              <a href={`${STORE}/privacy-policy`} className="underline">
                                Privacy Policy
                              </a>
                              .
                            </>
                          ) : (
                            <>
                              بتسجيل الدخول، أوافق على{" "}
                              <a href={`${STORE}/terms-of-use`} className="underline">
                                شروط الاستخدام
                              </a>{" "}
                              و
                              <a href={`${STORE}/privacy-policy`} className="underline">
                                سياسة الخصوصية
                              </a>{" "}
                              الخاصة ببناء.
                            </>
                          )}
                        </p>
                        <div className="mt-3 border-t border-ali-line-200 pt-3">
                          <p className="text-xs font-semibold text-ali-ink-900">
                            {en ? "My BENNA" : "حسابي في بناء"}
                          </p>
                          <ul className="mt-1.5 text-[13px] text-ali-ink-700">
                            {[
                              { en: "Orders", ar: "الطلبات" },
                              { en: "Messages", ar: "الرسائل" },
                              { en: "RFQs", ar: "طلبات عروض الأسعار" },
                              { en: "Favorites", ar: "المفضلة" },
                              { en: "Account", ar: "الحساب" },
                              { en: "Membership program", ar: "برنامج العضوية" },
                            ].map((item) => (
                              <li key={item.en}>
                                <Link
                                  to={SIGN_IN}
                                  onClick={() => setOpen(null)}
                                  className="block w-full py-1.5 text-start transition-colors hover:text-ali-orange-500"
                                >
                                  {en ? item.en : item.ar}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== Mobile / tablet — compact bar ====== */}
      <div
        className="border-b border-gray-100 bg-white xl:hidden"
        role="navigation"
        aria-label={en ? "Mobile navigation bar" : "شريط التنقل للجوال"}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            to={APP_HOME}
            className="flex items-center"
            aria-label={en ? "Benna - Home" : "بناء - الصفحة الرئيسية"}
          >
            <img
              src={LOGO_SRC}
              alt={en ? "Benna - Building Materials Marketplace Saudi Arabia" : "بناء - منصة مواد البناء في السعودية"}
              width={140}
              height={48}
              decoding="async"
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex items-center gap-1 text-ali-ink-900">
            <button
              type="button"
              onClick={() => setLanguage(en ? "ar" : "en")}
              className="flex items-center gap-1 p-2 text-sm font-medium"
              aria-label={en ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
            >
              <Globe className="h-5 w-5" />
              {en ? "العربية" : "English"}
            </button>
            <button
              type="button"
              className="relative p-2"
              onClick={() => setIsCartOpen(true)}
              aria-label={en ? "Open cart" : "فتح السلة"}
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ali-orange-500 text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="p-2"
                aria-label={en ? "Log out" : "تسجيل الخروج"}
                title={firstName}
              >
                <LogOut className="h-6 w-6" />
              </button>
            ) : (
              <Link to={SIGN_IN} className="p-2" aria-label={en ? "Log in" : "تسجيل الدخول"}>
                <User className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
