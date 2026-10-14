// Standalone header matching the Benna storefront chrome (Alibaba-style):
// single row, centered container — logo left; Deliver-to / Language /
// cart / messages / orders / Log in on the right.
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Globe, ShoppingCart, MessageCircle, Package, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { items } = useCart();
  const { isRTL, t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

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
        <div className="flex items-center gap-4 text-[13px] text-ali-ink-700">
          <span className="hidden items-center gap-1 md:flex">
            <MapPin className="h-4 w-4 text-ali-ink-500" />
            {t("Deliver to:", "التوصيل إلى:")}{" "}
            <span className="font-semibold text-ali-ink-900">SA</span>
          </span>

          <button
            type="button"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="hidden items-center gap-1 hover:text-ali-ink-900 md:flex"
          >
            <Globe className="h-4 w-4 text-ali-ink-500" />
            {isRTL ? "English–SAR" : "العربية–ر.س"}
          </button>

          <span className="relative cursor-pointer hover:text-ali-ink-900" title={t("Cart", "السلة")}>
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-1.5 -end-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ali-danger text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </span>

          <MessageCircle className="h-5 w-5 cursor-pointer hover:text-ali-ink-900" />
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
