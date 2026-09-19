import { CheckCircle2 } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import { useShop } from "../context/ShopContext";
import { copy } from "../i18n/content";

export function SuccessPage() {
  const { locale } = useShop();
  const t = copy[locale];
  const { orderId: paramOrderId } = useParams();
  const location = useLocation();
  const state = location.state as { orderId?: string } | null;
  const orderId = state?.orderId ?? paramOrderId;

  return (
    <>
      <Seo title={t.success.title} description={t.success.text} />
      <section className="success-section">
        <div className="container success-card" data-reveal>
          <CheckCircle2 size={44} aria-hidden="true" />
          <span className="eyebrow">{t.checkout.success}</span>
          <h1>{t.success.title}</h1>
          <p>{t.success.text}</p>
          {orderId && (
            <div className="order-number">
              <span>{t.success.order}</span>
              <strong>{orderId}</strong>
            </div>
          )}
          <Link className="button primary" to="/catalog">
            {t.success.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
