import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "react-router-dom";
import ComingSoonModal from "@/components/ComingSoonModal";
import { Camera } from "lucide-react";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
// import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const footerLinks = [
  {
    title: { en: "About Benna.com.sa", ar: "عن بنّة السعودية" },
    links: [
      { name: { en: "About Benna", ar: "عن بنّة" }, href: "/about" },
      {
        name: { en: "Why choose Benna", ar: "لماذا بنّة" },
        href: "/why-benna",
      },
      { name: { en: "Blog", ar: "المدونة" }, href: "/blog" },
      {
        name: { en: "Benna Certificates", ar: "شهادات بنّة" },
        href: "/certificates",
      },
      {
        name: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
        href: "/privacy-policy",
      },
      {
        name: { en: "Terms of Use", ar: "شروط الاستخدام" },
        href: "/terms-of-use",
      },
    ],
  },
  {
    title: { en: "Order protection", ar: "حماية الطلب" },
    links: [
      {
        name: { en: "Secure payments", ar: "مدفوعات آمنة" },
        href: "/payment-methods",
      },
      {
        name: { en: "Money-back guarantee", ar: "ضمان استرداد الأموال" },
        href: "/warranty-policy",
      },
      {
        name: { en: "Guaranteed delivery", ar: "توصيل مضمون" },
        href: "/fulfillment",
      },
      {
        name: { en: "After-sales protections", ar: "حماية ما بعد البيع" },
        href: "/account/returns",
      },
      {
        name: { en: "Policies and rules", ar: "السياسات والقواعد" },
        href: "/terms-of-sale",
      },
    ],
  },
  {
    title: { en: "Source on Benna", ar: "التوريد على بنّة" },
    links: [
      {
        name: { en: "Verified vendors", ar: "موردون موثقون" },
        href: "/top-vendors",
      },
      {
        name: { en: "Request for Quotation", ar: "طلب عرض سعر" },
        href: "/rfq",
      },
      {
        name: { en: "RFQ Marketplace", ar: "سوق طلبات العروض" },
        href: "/rfqs",
      },
      { name: { en: "Benna Brands", ar: "ماركات بنّة" }, href: "/brands" },
      { name: { en: "Benna Products", ar: "منتجات بنّة" }, href: "/products" },
      {
        name: { en: "Benna Categories", ar: "فئات بنّة" },
        href: "/categories",
      },
    ],
  },
  {
    title: { en: "Help Center", ar: "مركز المساعدة" },
    links: [
      {
        name: { en: "Buyer Help Center", ar: "مركز مساعدة المشتري" },
        href: "/faqs",
      },
      { name: { en: "Live chat", ar: "محادثة مباشرة" }, href: "/chat" },
      { name: { en: "Track Order", ar: "تتبع الطلب" }, href: "/track-order" },
      {
        name: { en: "Refunds & returns", ar: "الاسترداد والإرجاع" },
        href: "/account/returns",
      },
      {
        name: { en: "Warranty claims", ar: "مطالبات الضمان" },
        href: "/account/warranty",
      },
      {
        name: { en: "Support tickets", ar: "تذاكر الدعم" },
        href: "/account/support-tickets",
      },
      {
        name: { en: "Materials Answers", ar: "أسئلة وأجوبة المواد" },
        href: "/answers",
      },
      {
        name: { en: "Arabic Materials Guide", ar: "مواد البناء بالعربية" },
        href: "/ar",
      },
      {
        name: { en: "Knowledge Graph", ar: "قاعدة المعرفة" },
        href: "/knowledge",
      },
      { name: { en: "Contact Us", ar: "اتصل بنا" }, href: "/contact" },
      {
        name: { en: "Connect AI Assistant", ar: "ربط مساعد الذكاء الاصطناعي" },
        href: "/connect",
      },
    ],
  },
  {
    title: { en: "Sell on Benna", ar: "البيع على بنّة" },
    links: [
      { name: { en: "Sell on Benna", ar: "بيع على بنّة" }, href: "/sell" },
      {
        name: { en: "Become a Verified Vendor", ar: "كن مورداً موثقاً" },
        href: "https://vendor.benna.com.sa/en/signup",
      },
      {
        name: { en: "Supply To Benna", ar: "التوريد لبنّة" },
        href: "/supply",
      },
      {
        name: { en: "Fulfillment By Benna", ar: "التنفيذ بواسطة بنّة" },
        href: "/fulfillment",
      },
      {
        name: { en: "Advertise Your Products", ar: "إعلان منتجاتك" },
        href: "/advertise",
      },
      {
        name: { en: "Check order status", ar: "حالة الطلب" },
        href: "/track-order",
      },
    ],
  },
  {
    title: { en: "Benna Platform", ar: "منصة بنّة" },
    links: [
      { name: { en: "Benna AI", ar: "بناء الذكي" }, href: "/assistant" },
      {
        name: { en: "AI BOQ", ar: "كمية الأعمال الذكية" },
        href: "/build-project",
      },
      {
        name: { en: "Compare Products", ar: "قارن المنتجات" },
        href: "/compare",
      },
      {
        name: { en: "Wishlist", ar: "قائمة الأمنيات" },
        href: "/account/wishlist",
      },
      { name: { en: "Deals", ar: "العروض" }, href: "/deals" },
      {
        name: { en: "Cost Calculators", ar: "حاسبات التكلفة" },
        href: "/calculators/all",
      },
    ],
  },
  {
    title: { en: "Cost Calculators", ar: "حاسبات التكلفة" },
    links: [
      {
        name: { en: "Ready Mix Calculator", ar: "حاسبة الخرسانة الجاهزة" },
        href: "/calculators/ready-mix",
      },
      {
        name: { en: "Construction Cost Calculator", ar: "حاسبة تكلفة البناء" },
        href: "/calculators/construction-cost",
      },
      {
        name: {
          en: "Raw Material For Construction",
          ar: "المواد الخام للبناء",
        },
        href: "/calculators/raw-materials",
      },
      {
        name: { en: "Paint Calculator", ar: "حاسبة الدهانات" },
        href: "/calculators/paint",
      },
      {
        name: { en: "Explore All Calculators", ar: "استكشف جميع الحاسبات" },
        href: "/calculators/all",
      },
    ],
  },
];

const paymentMethods = [
  "Mada",
  "Visa",
  "Mastercard",
  "Sadad",
  "Apple Pay",
  "PayTabs",
  "SAB",
  "IFS",
  "gopay",
  "nsbh",
  "CR",
  "VAT",
  "SPL",
];

const Footer = () => {
  const { language, isRTL } = useLanguage();
  const location = useLocation();
  const [lensOpen, setLensOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getText = (textObj: unknown): string => {
    if (textObj && typeof textObj === "object") {
      const obj = textObj as Record<string, string>;
      return obj[language] || obj.en || "";
    }
    return String(textObj ?? "");
  };

  return (
    <footer className="footer-section" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-white border-b border-[#DDDDDD]/30 py-3 lg:py-4">
        <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6 xl:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs sm:text-sm text-center text-[#666666] w-full cursor-pointer hover:text-[#FF6600] transition-colors w-full"
          >
            {language === "en" ? "Back to top" : "العودة للأعلى"}
          </button>
        </div>
      </div>
      {/* Main Footer */}
      <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6 xl:px-8 py-8 lg:py-12">
        {/* Logo */}
        <div className="flex items-center justify-center sm:justify-start mb-8 lg:mb-10 w-full">
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-1"
          >
            <img
              src="https://static.wixstatic.com/media/b99a57_66162956ac1345b7b402744d22076d87~mv2.png/v1/fit/w_320,h_128,q_80,enc_avif/image.avif"
              alt="Benna logo"
              width={160}
              height={63}
              loading="lazy"
              decoding="async"
              className="h-10 sm:h-12 lg:h-14 xl:h-16 w-auto"
            />
          </a>
        </div>

        {/* Links Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-6 xl:gap-8 w-full">
          {footerLinks.map((section, index) => (
            <div key={index} className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 lg:mb-4">
                {getText(section.title)}
              </h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {(() => {
                      const href = link.href.startsWith("/")
                        ? `https://store.benna.com.sa${link.href}`
                        : link.href.startsWith("https://vendor.benna.com.sa/en/")
                          ? link.href.replace("/en/", `/${language}/`)
                          : link.href;
                      return (
                        <a
                          href={href}
                          className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors truncate block"
                        >
                          {getText(link.name)}
                        </a>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods & Social */}
        <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            {/* Payment Methods */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-wrap justify-center">
              <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                {language === "en"
                  ? "© 2026 Benna. All Rights Reserved"
                  : "© 2026 بنّة. جميع الحقوق محفوظة"}
              </span>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {paymentMethods.map((method) => (
                  <div
                    key={method}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded flex items-center justify-center"
                    title={method}
                  >
                    {method === "Visa" && (
                      <img
                        src="https://static.wixstatic.com/media/b99a57_8325709bba1a426f88c313c0fcd6de69~mv2.png"
                        alt="Visa"
                        className="w-6 h-3 sm:w-8 sm:h-4 object-contain"
                      />
                    )}
                    {method === "Mastercard" && (
                      <img
                        src="https://static.wixstatic.com/shapes/b99a57_beef98af55144635bb9705b039a0011e.svg"
                        alt="Mastercard"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "Mada" && (
                      <img
                        src="https://static.wixstatic.com/shapes/b99a57_31cbd43722894cc5ba5180d2f4af12b7.svg"
                        alt="Mada"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "Sadad" && (
                      <img
                        src="https://static.wixstatic.com/media/b99a57_2aec326ccc484b72b9b85bc2ce301bd0~mv2.png"
                        alt="Sadad"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "Apple Pay" && (
                      <img
                        src="https://static.wixstatic.com/shapes/b99a57_0bf0a722401c4214a6a689814fed8e36.svg"
                        alt="Apple Pay"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "PayTabs" && (
                      <img
                        src="https://ms.hsoubcdn.com/uploads/thumbnails/2161724/64b700dbd8c17/Logoverticalenglishlogo1500x1500.png"
                        alt="PayTabs"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "SAB" && (
                      <img
                        src="https://static.wixstatic.com/media/b99a57_0bec39d1ffa1451db8a7b68d28c7e538~mv2.png"
                        alt="SAB"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "IFS" && (
                      <img
                        src="https://i0.wp.com/ifs.sa/wp-content/uploads/2022/10/Fullcolor-version-En.png?fit=7195%2C1883&ssl=1"
                        alt="IFS"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "gopay" && (
                      <img
                        src="https://app.gopay.sa/wbiller/assets/images/LogoIcon.png"
                        alt="Gopay"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "nsbh" && (
                      <img
                        src="https://www.qoyod.com/wp-content/uploads/2026/04/nsbh_logo.png"
                        alt="nsbh"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "CR" && (
                      <img
                        src="https://jkmanagement.ae/wp-content/uploads/2025/01/Logo_Ministry_of_Commerce.svg-1024x384.png"
                        alt="Commercial Registration"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "VAT" && (
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNGr2mfichSpb9VNRk4AN46l35yDskLLU8bw&s"
                        alt="VAT"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                    {method === "SPL" && (
                      <img
                        src="https://media.licdn.com/dms/image/v2/C4D12AQFthL0jaxEfdA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1631288448037?e=2147483647&v=beta&t=OcMryeIlIToo5M9X0vdjBv-k2ZMdBrat7Ktz1COxneg"
                        alt="SPL"
                        className="w-6 h-3.5 sm:w-8 sm:h-5 object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                {language === "en" ? "Follow us:" : "تابعنا:"}
              </span>
              <div className="flex gap-2 sm:gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61579625979584&mibextid=wwXIfr&rdid=1uwVv3qauXF2kGQJ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F16iRWsjWHR%2F%3Fmibextid%3DwwXIfr#"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={language === "en" ? "Facebook" : "فيسبوك"}
                >
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a
                  href="https://x.com/bennaksa?s=11"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={language === "en" ? "Twitter" : "تويتر"}
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a
                  href="https://www.instagram.com/bennaksa?igsh=MXAzaHhiZmdiaHdhcA%3D%3D"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={language === "en" ? "Instagram" : "إنستغرام"}
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a
                  href="https://www.youtube.com/@BennaKSA"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={language === "en" ? "YouTube" : "يوتيوب"}
                >
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/benna-sa/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={language === "en" ? "LinkedIn" : "لينكدإن"}
                >
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Connect strip — Alibaba-style */}
        <div className="mt-6 lg:mt-8 pt-6 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {/* Benna Lens */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs sm:text-sm text-gray-600">
                  {language === "en"
                    ? "Snap a photo, find the product"
                    : "صوّر المنتج واعثر عليه"}
                </span>
                <button
                  type="button"
                  onClick={() => setLensOpen(true)}
                  className="inline-flex items-center rounded-md bg-ali-orange-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-ali-orange-600"
                >
                  {language === "en" ? "Use Benna Lens" : "استخدم عدسة بنّة"}
                </button>
              </div>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/966565669693?text=${encodeURIComponent(
                  language === "en"
                    ? "Hi, I'd like to inquire about building materials"
                    : "مرحباً، أريد الاستفسار عن مواد البناء",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 transition-colors"
              >
                {language === "en" ? "Connect on" : "تواصل عبر"}
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 font-semibold text-white transition-colors hover:bg-[#1EBE5B]">
                  <svg
                    className="h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {/* Supplier platform */}
              <a
                href={`https://vendor.benna.com.sa/${language}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {language === "en" ? (
                  <>
                    Connect{" "}
                    <span className="font-semibold text-gray-900">
                      Supplier Platform
                    </span>
                  </>
                ) : (
                  <>
                    تواصل{" "}
                    <span className="font-semibold text-gray-900">
                      منصة الموردين
                    </span>
                  </>
                )}
              </a>

              {/* App badges */}
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm text-gray-600">
                  {language === "en" ? (
                    <>
                      Trade on the go with the{" "}
                      <span className="font-semibold text-gray-900">
                        Benna.com.sa app
                      </span>
                    </>
                  ) : (
                    <>
                      تسوق أثناء التنقل مع{" "}
                      <span className="font-semibold text-gray-900">
                        تطبيق بنّة
                      </span>
                    </>
                  )}
                </span>
                <a
                  href="https://apps.apple.com/sa/app/benna-%D8%A8%D9%86%D8%A7%D8%A1/id6763252606"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-80 transition-opacity"
                  aria-label="Download on the App Store"
                >
                  <img
                    src="https://static.wixstatic.com/shapes/a3b8d7_8ed3aae73ef9433598da0de7e90391d9.svg"
                    alt="Download on the App Store"
                    className="h-9 w-auto"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=benna.ksa.com.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-80 transition-opacity"
                  aria-label="Get it on Google Play"
                >
                  <img
                    src="https://static.wixstatic.com/media/a3b8d7_cf19eb43e85f493aa7dd2060e7bed1aa~mv2.png"
                    alt="Get it on Google Play"
                    className="h-9 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BENNA hover text — hidden
      <div className="hidden lg:flex h-[18rem] w-full items-end justify-center overflow-hidden -mb-10 -mt-6">
        <TextHoverEffect text="BENNA KSA" duration={0.2} className="w-full h-full" />
      </div>
      */}

      <ComingSoonModal
        open={lensOpen}
        onOpenChange={setLensOpen}
        featureIcon={Camera}
        featureName={{ en: "Benna Lens", ar: "عدسة بنّة" }}
      />

      {/* Copyright */}
      <div className="bg-gray-900 text-white py-3 lg:py-4">
        <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6 xl:px-8">
          <p className="text-xs sm:text-sm text-center text-gray-500 w-full">
            {language === "en"
              ? "Benna KSA | Building Platform - CR No. 7029882987 - VAT No. 310336295200003"
              : "بنّة السعودية | منصة بناء - السجل التجاري رقم 7029882987 - الرقم الضريبي 310336295200003"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
