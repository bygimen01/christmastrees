import { ArrowRight, CheckCircle2, Clock3, MapPin, PackageCheck, Ruler, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { getLocalizedShopConfig, shopConfig } from "../config/shopConfig";
import { useShop } from "../context/ShopContext";
import { copy } from "../i18n/content";

const StepIcons = [PackageCheck, CheckCircle2, Truck];

export function DeliveryPage() {
  const { locale } = useShop();
  const t = copy[locale];
  const Page = t.info.delivery;
  const SiteCopy = getLocalizedShopConfig(locale);

  return (
    <>
      <Seo title={`${t.nav.delivery} | ${shopConfig.brand.name}`} description={SiteCopy.deliveryText} />
      <section className="info-hero">
        <div className="container info-hero-grid">
          <div data-reveal>
            <span className="eyebrow">{Page.eyebrow}</span>
            <h1>{SiteCopy.deliveryTitle}</h1>
          </div>
          <p data-reveal>{SiteCopy.deliveryText}</p>
        </div>
      </section>

      <section className="info-section delivery-overview-section">
        <div className="container">
          <div className="delivery-facts" data-reveal>
            <div><MapPin size={20} aria-hidden="true" /><span>{locale === "ru" ? "География" : "Аймақ"}</span><strong>{shopConfig.business.deliveryArea}</strong></div>
            <div><Clock3 size={20} aria-hidden="true" /><span>{locale === "ru" ? "Связь" : "Байланыс"}</span><strong>{shopConfig.business.responseTime}</strong></div>
            <div><Truck size={20} aria-hidden="true" /><span>{locale === "ru" ? "Подтверждение" : "Растау"}</span><strong>{SiteCopy.deliveryConfirmation}</strong></div>
          </div>

          <div className="info-section-heading" data-reveal>
            <span className="eyebrow">01</span>
            <h2>{Page.stepsTitle}</h2>
          </div>
          <div className="info-step-grid compact-step-grid">
            {Page.steps.map(([Title, Text], Index) => {
              const Icon = StepIcons[Index] ?? CheckCircle2;
              return (
                <article key={Title} data-reveal>
                  <span className="info-card-icon"><Icon size={22} aria-hidden="true" /></span>
                  <span className="info-card-index">0{Index + 1}</span>
                  <h3>{Title}</h3>
                  <p>{Text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="info-section info-section-muted" id="size-guide">
        <div className="container size-guide-layout">
          <div className="size-guide-copy" data-reveal>
            <span className="info-card-icon"><Ruler size={22} aria-hidden="true" /></span>
            <span className="eyebrow">02</span>
            <h2>{Page.sizeTitle}</h2>
            <p>{Page.sizeText}</p>
            <Link className="button primary" to="/catalog">
              {Page.cta}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="size-guide-list">
            {Page.sizeItems.map(([Range, Text]) => (
              <article key={Range} data-reveal>
                <strong>{Range}</strong>
                <p>{Text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
