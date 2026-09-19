import { ArrowLeft, CheckCircle2, PackageCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Accordion } from "../../components/Accordion/Accordion";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { ProductGallery } from "../../components/ProductGallery/ProductGallery";
import { QuantityStepper } from "../../components/QuantityStepper/QuantityStepper";
import { SectionHeading } from "../../components/SectionHeading/SectionHeading";
import { Seo } from "../../components/Seo/Seo";
import { SmartImage } from "../../components/SmartImage/SmartImage";
import { formatMoney, getPreviousPrice, getPrice } from "../../config/currency";
import { getSiteUrl, shopConfig } from "../../config/shopConfig";
import { useShop } from "../../context/ShopContext";
import {
  ATTR_HEIGHT,
  ATTR_TYPE,
  createBreadcrumbJsonLd,
  createProductJsonLd,
  getDefaultVariant,
  getFamilyBySlug,
  getLocalizedDescription,
  getRelatedFamilies
} from "../../data/catalog";
import { copy, getAttrLabel, getCategoryLabel, getProductTitle, getTypeLabel } from "../../i18n/content";
import { RawProduct } from "../../types";
import { NotFoundPage } from "../NotFoundPage/NotFoundPage";

function FormatAttribute(Key: string, Value: string, Locale: "ru" | "kk") {
  if (Key === ATTR_TYPE) {
    return getTypeLabel(Value, Locale);
  }

  if (Key === "Упаковка") {
    return Value.replace(/\*/g, " × ").replace(/(\d)\s*(см)?$/i, "$1 см");
  }

  return Value.replace(/(\d)(см|кг)/gi, "$1 $2");
}

export function ProductPage() {
  const { slug } = useParams();
  const Family = getFamilyBySlug(slug);
  const { locale, currency, addToCart } = useShop();
  const t = copy[locale];
  const [Selected, setSelected] = useState<RawProduct | null>(Family ? getDefaultVariant(Family) : null);
  const [Quantity, setQuantity] = useState(1);
  const [StickyVisible, setStickyVisible] = useState(false);
  const BuyBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (Family) {
      setSelected(getDefaultVariant(Family));
      setQuantity(1);
    }
  }, [Family?.setId]);

  useEffect(() => {
    const BuyBox = BuyBoxRef.current;
    if (!BuyBox || typeof IntersectionObserver === "undefined") {
      return;
    }

    const Observer = new IntersectionObserver(([Entry]) => {
      setStickyVisible(!Entry.isIntersecting && Entry.boundingClientRect.top < 0);
    }, { threshold: 0.2 });

    Observer.observe(BuyBox);
    return () => Observer.disconnect();
  }, [Selected?.id]);

  const Origin = getSiteUrl();

  const JsonLd = useMemo(() => {
    if (!Family) {
      return [];
    }

    return [
      createProductJsonLd(Family, currency, locale, Origin),
      createBreadcrumbJsonLd([
        { name: t.nav.home, url: `${Origin}/` },
        { name: t.nav.catalog, url: `${Origin}/catalog` },
        { name: getProductTitle(Family.title, locale), url: `${Origin}/products/${Family.slug}` }
      ])
    ];
  }, [currency, Family, locale, Origin, t.nav.catalog, t.nav.home]);

  if (!Family || !Selected) {
    return <NotFoundPage />;
  }

  const Price = getPrice(Selected, currency);
  const Previous = getPreviousPrice(Selected, currency);
  const Available = (Selected.stock ?? 0) > 0;
  const SelectedHeight = Selected.attrs?.[ATTR_HEIGHT] ?? "";
  const SelectedType = Selected.attrs?.[ATTR_TYPE] ?? Family.type;
  const ProductTitle = getProductTitle(Family.title, locale);
  const Related = getRelatedFamilies(Family, 4);
  const Discount = Selected.discount && Selected.discountPercentage ? Selected.discountPercentage : 0;
  const DetailImage = Family.images[2] ?? Family.images[1] ?? Family.images[0] ?? "/tree-placeholder.svg";

  const AddProduct = () => {
    if (Available) {
      addToCart(Selected.id, Quantity);
    }
  };

  return (
    <>
      <Seo
        title={`${ProductTitle} | ${shopConfig.brand.name}`}
        description={getLocalizedDescription(Family, locale).slice(0, 160)}
        image={Family.images[0]}
        jsonLd={JsonLd}
      />

      <section className="product-page decorated-section decorated-section-product">
        <div className="container product-breadcrumb-row">
          <Link className="product-breadcrumb" to="/catalog">
            <ArrowLeft size={17} aria-hidden="true" />
            {t.nav.catalog}
          </Link>
        </div>

        <div className="container product-layout product-layout-bento">
          <ProductGallery images={Family.images} title={Family.title} locale={locale} />

          <aside className="product-info" data-reveal>
            <div className="product-info-heading">
              <span className="eyebrow">{getCategoryLabel(Family.category, locale)}</span>
              <h1>{ProductTitle}</h1>
              <div className="product-info-facts" aria-label={locale === "ru" ? "Краткая информация" : "Қысқаша ақпарат"}>
                <span>{Family.heights.length} {locale === "ru" ? "размеров" : "өлшем"}</span>
                <span>{Family.heights[0]}–{Family.heights[Family.heights.length - 1]} см</span>
                <span>{getTypeLabel(SelectedType, locale)}</span>
              </div>
            </div>

            <div className="product-price-row">
              <div>
                <span>{locale === "ru" ? "Цена выбранного размера" : "Таңдалған өлшем бағасы"}</span>
                <strong>{formatMoney(Price, currency)}</strong>
              </div>
              {Previous && <del>{formatMoney(Previous, currency)}</del>}
              {Discount > 0 && <span className="discount-pill">−{Discount}%</span>}
            </div>

            <p className={Available ? "stock-line is-available" : "stock-line"}>
              <span />
              {Available ? t.product.inStock : t.product.unavailable}
            </p>

            <div className="variant-block">
              <div className="variant-heading">
                <h2>{t.product.chooseHeight}</h2>
                <span>{SelectedHeight} см</span>
              </div>
              <div className="variant-grid">
                {Family.variants.map((Variant) => {
                  const Height = Variant.attrs?.[ATTR_HEIGHT] ?? "";
                  const Active = Selected.id === Variant.id;
                  const Disabled = (Variant.stock ?? 0) <= 0;

                  return (
                    <button
                      type="button"
                      key={Variant.id}
                      className={Active ? "variant-button is-active" : "variant-button"}
                      disabled={Disabled}
                      onClick={() => {
                        setSelected(Variant);
                        setQuantity(1);
                      }}
                    >
                      <span>{Height} см</span>
                      <small>{Disabled ? t.product.unavailable : formatMoney(getPrice(Variant, currency), currency)}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="buy-box" ref={BuyBoxRef}>
              <div className="quantity-row">
                <label>{t.product.quantity}</label>
                <QuantityStepper
                  value={Quantity}
                  max={Math.max(1, Math.min(Selected.stock ?? 1, 99))}
                  onChange={setQuantity}
                  decreaseLabel={t.cart.decrease}
                  increaseLabel={t.cart.increase}
                />
              </div>
              <button className="button primary wide product-buy-button" type="button" disabled={!Available} onClick={AddProduct}>
                <ShoppingBag size={18} aria-hidden="true" />
                {t.product.addToCart}
              </button>
            </div>

            <div className="product-trust-list">
              <div><PackageCheck size={18} aria-hidden="true" /><span>{t.product.trustOne}</span></div>
              <div><Truck size={18} aria-hidden="true" /><span>{t.product.trustTwo}</span></div>
              <div><CheckCircle2 size={18} aria-hidden="true" /><span>{t.product.trustThree}</span></div>
            </div>

            <div className="product-assurance">
              <span>{t.product.sku}: DT-{Family.setId}-{Selected.id}</span>
              <span>{getTypeLabel(SelectedType, locale)}</span>
            </div>
          </aside>

          <article className="product-story product-mosaic-story" data-reveal>
            <span className="eyebrow"><Sparkles size={14} aria-hidden="true" /> {t.product.description}</span>
            <h2>{t.product.storyTitle}</h2>
            <p>{getLocalizedDescription(Family, locale)}</p>
          </article>

          <article className="product-specs-card product-mosaic-specs" data-reveal>
            <div className="details-card-heading">
              <h2>{t.product.specs}</h2>
              <span>{SelectedHeight} см</span>
            </div>
            <dl className="spec-list">
              {Object.entries(Selected.attrs ?? {}).map(([Key, Value]) => (
                <div key={Key}>
                  <dt>{getAttrLabel(Key, locale)}</dt>
                  <dd>{FormatAttribute(Key, Value, locale)}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="product-detail-visual" data-reveal>
            <SmartImage src={DetailImage} alt={ProductTitle} loading="lazy" decoding="async" />
            <div>
              <span>{getCategoryLabel(Family.category, locale)}</span>
              <strong>{ProductTitle}</strong>
              <small>{SelectedHeight} см · {getTypeLabel(SelectedType, locale)}</small>
            </div>
          </article>

          <article className="delivery-card product-mosaic-delivery" data-reveal>
            <Truck size={24} aria-hidden="true" />
            <div>
              <h2>{t.product.delivery}</h2>
              <p>{t.product.deliveryText}</p>
            </div>
          </article>

          <article className="product-faq-card product-mosaic-faq" data-reveal>
            <h2>{t.sections.faq}</h2>
            <Accordion items={[...t.faq].slice(0, 3)} />
          </article>
        </div>
      </section>

      <section className="section-block related-section decorated-section">
        <div className="container">
          <SectionHeading title={t.product.related} text={t.product.relatedText} />
          <div className="product-grid popular-grid">
            {Related.map((Item) => (
              <ProductCard key={Item.setId} family={Item} />
            ))}
          </div>
        </div>
      </section>

      <div className={StickyVisible ? "mobile-sticky-cta is-visible" : "mobile-sticky-cta"}>
        <div>
          <span>{SelectedHeight} см</span>
          <strong>{formatMoney(Price, currency)}</strong>
        </div>
        <button type="button" disabled={!Available} onClick={AddProduct}>
          {t.product.addToCart}
        </button>
      </div>
    </>
  );
}
