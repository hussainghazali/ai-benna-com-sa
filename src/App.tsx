import { lazy, Suspense } from "react";
import BennaLoader from "@/components/BennaLoader";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import AssistantBubble from "@/components/assistant/AssistantBubble";
import SideActionRail from "@/components/sections/SideActionRail";
import ExternalRedirect from "@/components/ExternalRedirect";
import { Toaster } from "sonner";
import { storeProductUrl } from "@/lib/store-url";

const AssistantPage = lazy(() => import("@/pages/AssistantPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const WelcomePage = lazy(() => import("@/pages/WelcomePage"));

const Fallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <BennaLoader size="md" />
  </div>
);

// Product pages live on the main store.
const ProductRedirect = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  return <ExternalRedirect to={storeProductUrl(slug)} />;
};

const App = () => (
  <LanguageProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<Fallback />}>
            <Routes>
              {/* Nested so /assistant → /assistant/:threadId doesn't remount the
                  page and kill a streaming answer (same as the storefront). */}
              <Route path="/assistant" element={<AssistantPage />}>
                <Route path=":threadId" element={null} />
              </Route>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route path="/product/:slug" element={<ProductRedirect />} />
              <Route path="*" element={<Navigate to="/assistant" replace />} />
            </Routes>
          </Suspense>
          <AssistantBubble />
          <SideActionRail />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </LanguageProvider>
);

export default App;
