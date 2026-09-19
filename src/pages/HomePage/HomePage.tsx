import { ArrowRight, CheckCircle2, Headphones, Leaf, Ruler, Search, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion } from "../../components/Accordion/Accordion";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { ReviewsCarousel } from "../../components/ReviewsCarousel/ReviewsCarousel";
import { SectionHeading } from "../../components/SectionHeading/SectionHeading";
import { Seo } from "../../components/Seo/Seo";
import { SmartImage } from "../../components/SmartImage/SmartImage";
import { useShop } from "../../context/ShopContext";
import { getLocalizedShopConfig, getSiteUrl, shopConfig } from "../../config/shopConfig";
import { categories, createOrganizationJsonLd, getFamilyBySetId, getPopularFamilies, productFamilies } from "../../data/catalog";
import { copy, getCategoryLabel } from "../../i18n/content";

const BenefitIcons = [Leaf, Ruler, ShoppingBag, Headphones];
const WhyIcons = [Sparkles, ShieldCheck, CheckCircle2];
const ProcessIcons = [Search, Ruler, ShoppingBag, Truck];

export function HomePage() {
  const { locale } = useShop();
  const t = copy[locale];
  const SiteCopy = getLocalizedShopConfig(locale);
  const Benefits = SiteCopy.benefits.map(([Title, Text]) => [Title, Text] as const);
  const WhyItems = SiteCopy.whyItems.map(([Title, Text]) => [Title, Text] as const);
  const HowItems = SiteCopy.processSteps.map(([Title, Text]) => [Title, Text] as const);
  const Popular = getPopularFamilies(4);
  const Origin = getSiteUrl() || (typeof window === "undefined" ? "" : window.location.origin);
  const HeroFamily = getFamilyBySetId(shopConfig.catalog.heroProductSetId) ?? Popular[0] ?? productFamilies[0];
  const HeroImage = HeroFamily?.images[shopConfig.catalog.heroImageIndex] ?? HeroFamily?.images[0] ?? "/tree-placeholder.svg";
  const EditorialFamily = getFamilyBySetId(shopConfig.catalog.editorialProductSetId) ?? productFamilies.find((Family) => Family.category === "Ели заснеженные") ?? Popular[1] ?? HeroFamily;
  const FeaturedCategorySetIds: Record<string, number> = shopConfig.catalog.featuredCategorySetIds;
  const CategoryCards = categories.map((Category) => ({
    Category,
    Family: getFamilyBySetId(FeaturedCategorySetIds[Category]) ?? productFamilies.find((Family) => Family.category === Category) ?? HeroFamily
  }));

  return (
    <>
      <Seo
        title={locale === "ru" ? "Премиальные искусственные елки" : "Премиум жасанды шыршалар"}
        description={SiteCopy.heroText}
        image={HeroImage}
        jsonLd={[createOrganizationJsonLd(Origin)]}
      />

      <section className="hero-section decorated-section decorated-section-hero">
        <div className="container hero-grid">
          <div className="hero-content" data-reveal>
            <span className="eyebrow hero-eyebrow">{SiteCopy.heroEyebrow}</span>
            <h1>{SiteCopy.heroTitle}</h1>
            <p>{SiteCopy.heroText}</p>
            <div className="hero-actions">
              <Link className="button primary hero-primary" to="/catalog">
                {SiteCopy.heroPrimary}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="button hero-secondary" to="/delivery#size-guide">
                {SiteCopy.heroSecondary}
              </Link>
            </div>
            <div className="hero-metrics" aria-label={t.home.trustLabel}>
              {[
                [String(productFamilies.length), locale === "ru" ? "модель в каталоге" : "каталогтағы модель"],
                ["150–300", locale === "ru" ? "см — доступные высоты" : "см — қолжетімді биіктік"],
                [String(categories.length), locale === "ru" ? "коллекций по стилю" : "стиль бойынша коллекция"]
              ].map(([Value, Label]) => (
                <div key={Label}>
                  <strong>{Value}</strong>
                  <span>{Label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" data-reveal>
            <div className="hero-product-frame">
              <SmartImage
                src={HeroImage}
                alt={HeroFamily ? HeroFamily.title : SiteCopy.heroEyebrow}
                loading="eager"
                decoding="async"
              />
              <span className="hero-glow" />
            </div>
            <div className="hero-floating-card hero-card-top">
              <span>{HeroFamily?.title ?? t.home.heroCardTopLabel}</span>
              <strong>{HeroFamily?.heights.slice(0, 4).join(" · ")} см</strong>
            </div>
            <div className="hero-floating-card hero-card-bottom">
              <span className="hero-card-icon"><Sparkles size={16} /></span>
              <div>
                <strong>{t.home.heroCardBottomTitle}</strong>
                <span>{t.home.heroCardBottomText}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-band decorated-section decorated-section-band">
        <div className="container trust-grid">
          {Benefits.map(([Title, Text], Index) => {
            const Icon = BenefitIcons[Index] ?? CheckCircle2;

            return (
              <article key={Title} data-reveal>
                <span className="trust-icon"><Icon size={21} aria-hidden="true" /></span>
                <div>
                  <h2>{Title}</h2>
                  <p>{Text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-block category-section decorated-section">
        <div className="container">
          <SectionHeading title={t.home.categoriesTitle} text={t.home.categoriesText} />
          <div className="category-showcase">
            {CategoryCards.map(({ Category, Family }, Index) => (
              <Link
                key={Category}
                className={Index === 0 ? "category-card is-large" : "category-card"}
                to={`/catalog?category=${encodeURIComponent(Category)}`}
                data-reveal
              >
                <SmartImage src={Family?.images[0]} alt={getCategoryLabel(Category, locale)} loading="lazy" decoding="async" />
                <span className="category-overlay" />
                <div className="category-card-content">
                  <span>{String(Index + 1).padStart(2, "0")}</span>
                  <h3>{getCategoryLabel(Category, locale)}</h3>
                  <small>{t.home.openCollection}</small>
                </div>
                <span className="category-arrow"><ArrowRight size={18} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block popular-section decorated-section">
        <div className="container">
          <SectionHeading
            title={t.sections.popular}
            text={t.sections.popularText}
            action={
              <Link className="text-link" to="/catalog">
                {t.home.viewAll}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            }
          />
          <div className="product-grid popular-grid">
            {Popular.map((Family, Index) => (
              <ProductCard key={Family.setId} family={Family} priority={Index < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section decorated-section">
        <div className="container editorial-grid">
          <div className="editorial-media" data-reveal>
            <SmartImage src={EditorialFamily?.images[1] ?? EditorialFamily?.images[0]} alt={EditorialFamily?.title ?? ""} loading="lazy" decoding="async" />
            <span className="editorial-number">01</span>
          </div>
          <div className="editorial-copy" data-reveal>
            <span className="eyebrow">{t.home.editorialEyebrow}</span>
            <h2>{t.home.editorialTitle}</h2>
            <p>{t.home.editorialText}</p>
            <ul>
              {t.home.editorialPoints.map((Point) => (
                <li key={Point}><CheckCircle2 size={18} aria-hidden="true" />{Point}</li>
              ))}
            </ul>
            <Link className="button secondary" to={`/products/${EditorialFamily?.slug ?? ""}`}>
              {t.home.editorialCta}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="why-section decorated-section">
        <div className="container why-layout">
          <div className="why-heading" data-reveal>
            <span className="eyebrow">{t.sections.benefits}</span>
            <h2>{SiteCopy.trustTitle}</h2>
            <p>{SiteCopy.trustText}</p>
          </div>
          <div className="why-list">
            {WhyItems.map(([Title, Text], Index) => {
              const Icon = WhyIcons[Index] ?? CheckCircle2;

              return (
                <article key={Title} data-reveal>
                  <span className="why-card-icon" aria-hidden="true"><Icon size={22} /></span>
                  <div className="why-card-copy">
                    <h3>{Title}</h3>
                    <p>{Text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-block process-section decorated-section">
        <div className="container">
          <SectionHeading title={SiteCopy.processTitle} text={SiteCopy.processText} />
          <div className="process-grid">
            {HowItems.map(([Title, Text], Index) => {
              const Icon = ProcessIcons[Index] ?? CheckCircle2;

              return (
                <article key={Title} data-reveal>
                  <span className="process-card-icon" aria-hidden="true"><Icon size={20} /></span>
                  <div className="process-card-copy">
                    <h3>{Title}</h3>
                    <p>{Text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ReviewsCarousel />

      <section className="section-block faq-section decorated-section">
        <div className="container faq-layout">
          <div className="faq-heading">
            <span className="eyebrow">FAQ</span>
            <h2>{t.sections.faq}</h2>
            <p>{t.home.faqText}</p>
          </div>
          <Accordion items={[...t.faq]} />
        </div>
      </section>

      <section className="final-cta decorated-section decorated-section-band">
        <div className="container final-cta-inner" data-reveal>
          <div>
            <span className="eyebrow">{t.home.finalEyebrow}</span>
            <h2>{t.sections.finalCta}</h2>
            <p>{t.sections.finalText}</p>
          </div>
          <Link className="button primary" to="/catalog">
            {SiteCopy.heroPrimary}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
