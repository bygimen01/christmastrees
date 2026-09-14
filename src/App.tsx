import { lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { useShop } from "./context/ShopContext";
import { useReveal } from "./hooks/useReveal";
import { useRouteScroll } from "./hooks/useRouteScroll";
import { copy } from "./i18n/content";

const HomePage = lazy(() => import("./pages/HomePage").then((Module) => ({ default: Module.HomePage })));
const CatalogPage = lazy(() => import("./pages/CatalogPage").then((Module) => ({ default: Module.CatalogPage })));
const ProductPage = lazy(() => import("./pages/ProductPage").then((Module) => ({ default: Module.ProductPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage").then((Module) => ({ default: Module.CheckoutPage })));
const SuccessPage = lazy(() => import("./pages/SuccessPage").then((Module) => ({ default: Module.SuccessPage })));
const DeliveryPage = lazy(() => import("./pages/DeliveryPage").then((Module) => ({ default: Module.DeliveryPage })));
const FaqPage = lazy(() => import("./pages/FaqPage").then((Module) => ({ default: Module.FaqPage })));
const ContactsPage = lazy(() => import("./pages/ContactsPage").then((Module) => ({ default: Module.ContactsPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((Module) => ({ default: Module.NotFoundPage })));

export function App() {
  const Location = useLocation();
  const { locale } = useShop();
  const t = copy[locale];

  useReveal();
  useRouteScroll();

  return (
    <>
      <Header />
      <main key={Location.pathname} className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success/:orderId" element={<SuccessPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <div className="sr-only" aria-live="polite">
        {t.loading}
      </div>
    </>
  );
}
