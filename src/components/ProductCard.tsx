import { ArrowUpRight, Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney, formatRange, getPreviousPrice, getPrice } from "../config/currency";
import { useShop } from "../context/ShopContext";
import { ATTR_HEIGHT, getDefaultVariant, getFamilyPriceRange, getShortDescription } from "../data/catalog";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { copy, getCategoryLabel, getProductTitle } from "../i18n/content";
import { ProductFamily, RawProduct } from "../types";
import { SmartImage } from "./SmartImage";

type ProductCardProps = {
  family: ProductFamily;
  priority?: boolean;
};

export function ProductCard({ family, priority = false }: ProductCardProps) {
  const { locale, currency, addToCart } = useShop();
  const t = copy[locale];
  const [QuickAddOpen, setQuickAddOpen] = useState(false);
  const [SelectedVariant, setSelectedVariant] = useState<RawProduct>(() => getDefaultVariant(family));
  const PriceRange = getFamilyPriceRange(family, currency);
  const Previous = getPreviousPrice(SelectedVariant, currency);
  const MainImage = family.images[0];
  const DiscountLabel = family.hasDiscount && family.discountPercentage > 0 ? `−${family.discountPercentage}%` : null;
  const AvailableVariants = family.variants.filter((Variant) => (Variant.stock ?? 0) > 0);

  useBodyScrollLock(QuickAddOpen);

  useEffect(() => {
    setSelectedVariant(getDefaultVariant(family));
  }, [family.setId]);

  useEffect(() => {
    if (!QuickAddOpen) {
      return;
    }

    const HandleKeyDown = (Event: KeyboardEvent) => {
      if (Event.key === "Escape") {
        setQuickAddOpen(false);
      }
    };

    window.addEventListener("keydown", HandleKeyDown);
    return () => window.removeEventListener("keydown", HandleKeyDown);
  }, [QuickAddOpen]);

  const AddSelectedVariant = () => {
    if ((SelectedVariant.stock ?? 0) <= 0) {
      return;
    }

    addToCart(SelectedVariant.id, 1);
    setQuickAddOpen(false);
  };

  return (
    <>
      <article className="product-card" data-reveal>
        <Link className="product-media" to={`/products/${family.slug}`} aria-label={getProductTitle(family.title, locale)}>
          <div className="product-card-badges">
            {DiscountLabel && <span className="product-badge discount-badge">{DiscountLabel}</span>}
            {family.stock > 0 && <span className="product-badge stock-badge">{t.product.inStock}</span>}
          </div>
          <SmartImage
            className="product-image primary-image"
            src={MainImage}
            alt={getProductTitle(family.title, locale)}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
          <span className="product-card-arrow" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
        </Link>

        <div className="product-card-body">
          <div className="product-card-meta">
            <span>{getCategoryLabel(family.category, locale)}</span>
            <span>{family.heights.length} {locale === "ru" ? "размеров" : "өлшем"}</span>
          </div>

          <h3>
            <Link to={`/products/${family.slug}`}>{getProductTitle(family.title, locale)}</Link>
          </h3>
          <p>{getShortDescription(family, locale)}</p>

          <div className="height-list" aria-label={t.product.heights}>
            {family.heights.slice(0, 6).map((Height) => (
              <span key={Height}>{Height}</span>
            ))}
            {family.heights.length > 6 && <span>+{family.heights.length - 6}</span>}
          </div>

          <div className="product-card-bottom">
            <div className="price-stack">
              <small>{locale === "ru" ? "Цена" : "Бағасы"}</small>
              <strong>{formatRange(PriceRange.min, PriceRange.max, currency)}</strong>
              {Previous && PriceRange.min === PriceRange.max && <del>{formatMoney(Previous, currency)}</del>}
            </div>
            <button
              className="quick-add-button"
              type="button"
              disabled={!AvailableVariants.length}
              onClick={() => setQuickAddOpen(true)}
            >
              <Plus size={18} aria-hidden="true" />
              <span>{t.product.quickAdd}</span>
            </button>
          </div>
        </div>
      </article>

      <div className={QuickAddOpen ? "quick-add-shell is-open" : "quick-add-shell"} aria-hidden={!QuickAddOpen}>
        <button className="drawer-backdrop" type="button" aria-label={t.nav.close} onClick={() => setQuickAddOpen(false)} />
        <section className="quick-add-panel" role="dialog" aria-modal="true" aria-label={t.product.chooseHeight}>
          <div className="quick-add-top">
            <div>
              <span className="eyebrow">{getCategoryLabel(family.category, locale)}</span>
              <h2>{getProductTitle(family.title, locale)}</h2>
            </div>
            <button className="icon-button" type="button" aria-label={t.nav.close} onClick={() => setQuickAddOpen(false)}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="quick-add-product">
            <SmartImage src={MainImage} alt={getProductTitle(family.title, locale)} loading="lazy" />
            <div>
              <p>{t.product.chooseHeight}</p>
              <strong>{formatMoney(getPrice(SelectedVariant, currency), currency)}</strong>
            </div>
          </div>

          <div className="quick-variant-grid">
            {family.variants.map((Variant) => {
              const Height = Variant.attrs?.[ATTR_HEIGHT] ?? "";
              const IsActive = SelectedVariant.id === Variant.id;
              const IsDisabled = (Variant.stock ?? 0) <= 0;

              return (
                <button
                  type="button"
                  key={Variant.id}
                  className={IsActive ? "quick-variant is-active" : "quick-variant"}
                  disabled={IsDisabled}
                  onClick={() => setSelectedVariant(Variant)}
                >
                  <span>{Height} см</span>
                  <small>{IsDisabled ? t.product.unavailable : formatMoney(getPrice(Variant, currency), currency)}</small>
                  {IsActive && <Check size={15} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <button className="button primary wide quick-add-confirm" type="button" onClick={AddSelectedVariant}>
            <Plus size={18} aria-hidden="true" />
            {t.product.addToCart}
          </button>
        </section>
      </div>
    </>
  );
}
