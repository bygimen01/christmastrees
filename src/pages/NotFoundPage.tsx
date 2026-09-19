import { Link } from "react-router-dom";
import { Seo } from "../components/Seo/Seo";
import { useShop } from "../context/ShopContext";
import { copy } from "../i18n/content";

export function NotFoundPage() {
  const { locale } = useShop();
  const t = copy[locale];

  return (
    <>
      <Seo title={t.notFound.title} description={t.notFound.text} />
      <section className="not-found-section">
        <div className="container empty-state">
          <span className="eyebrow">404</span>
          <h1>{t.notFound.title}</h1>
          <p>{t.notFound.text}</p>
          <Link className="button primary" to="/catalog">
            {t.notFound.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
