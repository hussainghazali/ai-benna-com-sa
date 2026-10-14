// Port of the storefront CartDrawer (origin/alibaba-clone) — same markup and
// Alibaba styling, but mounted on a lightweight AnimatePresence slide-over
// instead of radix Sheet so it runs in every standalone app.
import { locNum } from "@/utils/formatPrice";
import RiyalSymbol from "@/components/ui/RiyalSymbol";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProductImage } from "@/utils/imageUtils";
import { isBoqCartItem } from "@/lib/boq-cart-flag";

const CartDrawer = () => {
  const {
    cartData,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const products = cartData?.products || [];
  const subtotal = cartData?.subTotal || 0;
  const vat = cartData?.vat ?? subtotal * 0.15;
  const cartTotal = cartData?.cartTotal || subtotal + vat;
  const fmt = (n: number) =>
    locNum(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const paymentMethods = ["Visa", "Mastercard", "Mada", "Sadad", "Apple Pay"];

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.aside
            initial={{ x: isAr ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isAr ? "-100%" : "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 end-0 z-[71] flex w-full flex-col bg-white sm:max-w-md"
            role="dialog"
            aria-label={t("Cart", "السلة")}
          >
            {/* Header */}
            <div className="border-b border-ali-line-200 px-6 pb-4 pt-6 bg-white">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-ali-ink-900">
                  <ShoppingBag className="w-5 h-5 text-ali-orange-500" />
                  <span className="text-base font-semibold text-ali-ink-900">
                    {t("Cart", "السلة")} ({itemCount})
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                  {products.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-ali-ink-500 hover:text-ali-orange-500 font-medium transition-colors"
                    >
                      {t("Clear all", "مسح الكل")}
                    </button>
                  )}
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-full p-1.5 text-ali-ink-500 hover:bg-ali-bg-100 hover:text-ali-ink-900"
                    aria-label={isAr ? "إغلاق" : "Close"}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-ali-bg-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-ali-ink-400" />
                </div>
                <h3 className="text-lg font-semibold text-ali-ink-900 mb-2">
                  {t("Your cart is empty", "سلتك فارغة")}
                </h3>
                <p className="text-ali-ink-500 text-sm mb-6">
                  {t(
                    "Looks like you haven't added anything yet.",
                    "يبدو أنك لم تضف أي منتجات بعد.",
                  )}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-ali-orange-500 hover:bg-ali-orange-600 text-white font-bold px-8 h-11 rounded-full"
                >
                  {t("Continue shopping", "متابعة التسوق")}
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items - Scrollable */}
                <div className="flex-1 overflow-y-auto py-4 px-6 space-y-3 bg-ali-bg-100">
                  {products.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-3 p-3 bg-white rounded-lg border border-ali-line-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <img
                        src={getProductImage(item.productImageUrl)}
                        alt={item.productName}
                        className="w-20 h-20 object-contain bg-white rounded-md border border-ali-line-200"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        {isBoqCartItem(item.productId) && (
                          <span className="inline-block mb-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-ali-orange-100 text-ali-ink-900 border border-ali-orange-500/30">
                            BOQ
                          </span>
                        )}
                        <h4 className="text-sm font-normal text-ali-ink-900 line-clamp-2">
                          {item.productName}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-ali-ink-900 tabular-nums">
                            <RiyalSymbol /> {fmt(item.productPrice)}
                          </span>
                          <div className="flex items-center gap-1 border border-ali-line-300 rounded-md bg-white">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.productQuantity - 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center hover:bg-ali-bg-100 rounded-l-md transition-colors"
                              aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                            >
                              <Minus className="w-3 h-3 text-ali-ink-700" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-ali-ink-900 tabular-nums">
                              {item.productQuantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.productQuantity + 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center hover:bg-ali-bg-100 rounded-r-md transition-colors"
                              aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                            >
                              <Plus className="w-3 h-3 text-ali-ink-700" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-ali-ink-500 tabular-nums">
                          {t("Total", "الإجمالي")}: <RiyalSymbol />{" "}
                          {fmt(item.productPrice * item.productQuantity)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="self-start p-2 text-ali-ink-400 hover:text-ali-danger transition-colors rounded-md hover:bg-red-50"
                        aria-label={isAr ? "إزالة من السلة" : "Remove from cart"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-ali-line-200 pt-4 px-6 pb-6 bg-white">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-ali-ink-500">
                          {t("Subtotal", "المجموع الفرعي")}
                        </span>
                        <span className="font-semibold text-ali-ink-900 tabular-nums">
                          <RiyalSymbol /> {fmt(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-ali-ink-500">
                          {t("VAT", "ضريبة القيمة المضافة")}
                        </span>
                        <span className="font-semibold text-ali-ink-900 tabular-nums">
                          <RiyalSymbol /> {fmt(vat)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-ali-line-200">
                        <span className="font-semibold text-ali-ink-900 text-base">
                          {t("Total", "الإجمالي")}
                        </span>
                        <span className="font-bold text-ali-ink-900 text-xl tabular-nums">
                          <RiyalSymbol bold /> {fmt(cartTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-2 pt-2">
                      <Link
                        to="/checkout"
                        onClick={() => setIsCartOpen(false)}
                        className="group flex h-12 w-full items-center justify-center rounded-full bg-ali-orange-500 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-ali-orange-600"
                      >
                        <span>{t("Checkout", "إتمام الشراء")}</span>
                        <ArrowRight
                          className={`w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform ${isAr ? "rotate-180" : ""}`}
                        />
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setIsCartOpen(false)}
                        className="flex h-11 w-full items-center justify-center rounded-full border border-ali-ink-900 bg-white font-semibold text-ali-ink-900 transition-colors duration-200 hover:bg-ali-bg-100"
                      >
                        {t("View cart", "عرض السلة")}
                      </Link>
                    </div>

                    {/* Trust signal */}
                    <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-ali-ink-500">
                      <ShieldCheck className="w-4 h-4 text-ali-success" />
                      {isAr
                        ? "مدفوعات آمنة وضمان استرداد الأموال"
                        : "Secure payments · Money-back guarantee"}
                    </div>

                    {/* Payment Methods Logos */}
                    <div className="pt-1">
                      <p className="text-xs text-ali-ink-500 text-center mb-2">
                        {isAr ? "طرق الدفع المقبولة" : "Accepted Payment Methods"}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        {paymentMethods.map((method) => (
                          <div
                            key={method}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-ali-line-200 rounded-md flex items-center justify-center hover:border-ali-ink-400 transition-colors duration-200"
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
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
