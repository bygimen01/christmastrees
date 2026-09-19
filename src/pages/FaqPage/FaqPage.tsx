import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion } from "../../components/Accordion/Accordion";
import { Seo } from "../../components/Seo/Seo";
import { useShop } from "../../context/ShopContext";
import { shopConfig } from "../../config/shopConfig";
import { copy } from "../../i18n/content";

export function FaqPage() {
  const { locale } = useShop();
  const t = copy[locale];
  const Page = t.info.faq;

  return (
    <>
      <Seo title={`${t.nav.faq} | ${shopConfig.brand.name}`} description={Page.text} />
      <section className="info-hero compact-info-hero decorated-section decorated-section-info">
        <div className="container info-hero-grid">
          <div data-reveal>
            <span className="eyebrow">{Page.eyebrow}</span>
            <h1>{Page.title}</h1>
          </div>
          <p data-reveal>{Page.text}</p>
        </div>
      </section>

      <section className="info-section faq-page-section decorated-section">
        <div className="container faq-page-layout">
          <aside data-reveal>
            <span className="info-card-icon"><HelpCircle size={22} aria-hidden="true" /></span>
            <h2>{t.sections.faq}</h2>
            <p>{t.home.faqText}</p>
            <Link className="button primary" to="/catalog">
              {Page.cta}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>
          <Accordion items={[...t.faq]} />
        </div>
      </section>
    </>
  );
}
