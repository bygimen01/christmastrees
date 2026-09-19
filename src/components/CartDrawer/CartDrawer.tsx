import { ArrowRight, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "../../config/currency";
import { useShop } from "../../context/ShopContext";
import { ATTR_HEIGHT, ATTR_TYPE } from "../../data/catalog";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { copy, getProductTitle, getTypeLabel } from "../../i18n/content";
import { getCartLines } from "../../utils/cart";
import { QuantityStepper } from "../QuantityStepper/QuantityStepper";
import { SmartImage } from "../SmartImage/SmartImage";

export function CartDrawer() {
  const {
    cartItems,
    cartOpen,
    setCartOpen,
    currency,
    locale,
    setCartQuantity,
    removeFromCart
  } = useShop();
  const t = copy[locale];
  const Lines = useMemo(() => getCartLines(cartItems, currency), [cartItems, currency]);
  const Subtotal = Lines.reduce((Sum, Line) => Sum + Line.total, 0);
  const DrawerRef = useRef<HTMLElement | null>(null);
  const CloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const PreviousFocusRef = useRef<HTMLElement | null>(null);

  useBodyScrollLock(cartOpen);

  useEffect(() => {
    if (!cartOpen) {
      return;
    }

    PreviousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.requestAnimationFrame(() => CloseButtonRef.current?.focus());

    const HandleKeyDown = (Event: KeyboardEvent) => {
      if (Event.key === "Escape") {
        Event.preventDefault();
        setCartOpen(false);
        return;
      }

      if (Event.key !== "Tab" || !DrawerRef.current) {
        return;
      }

      const Focusable = Array.from(DrawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!Focusable.length) {
        return;
      }

      const First = Focusable[0];
      const Last = Focusable[Focusable.length - 1];
      if (Event.shiftKey && document.activeElement === First) {
        Event.preventDefault();
        Last.focus();
      } else if (!Event.shiftKey && document.activeElement === Last) {
        Event.preventDefault();
        First.focus();
      }
    };

    window.addEventListener("keydown", HandleKeyDown);
    return () => {
      window.removeEventListener("keydown", HandleKeyDown);
      PreviousFocusRef.current?.focus();
      PreviousFocusRef.current = null;
    };
  }, [cartOpen, setCartOpen]);

  return (
    <div className={cartOpen ? "drawer-shell is-open" : "drawer-shell"} aria-hidden={!cartOpen}>
      <button className="drawer-backdrop" type="button" aria-label={t.nav.close} onClick={() => setCartOpen(false)} />
      <aside ref={DrawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-label={t.cart.title}>
        <div className="drawer-header cart-drawer-header">
          <div>
            <span className="eyebrow">{locale === "ru" ? "Ваш выбор" : "Сіздің таңдауыңыз"}</span>
            <h2>{t.cart.title}</h2>
          </div>
          <button ref={CloseButtonRef} className="icon-button" type="button" aria-label={t.nav.close} onClick={() => setCartOpen(false)}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {Lines.length === 0 ? (
          <div className="empty-state compact cart-empty-state">
            <span className="empty-state-icon"><ShoppingBag size={28} aria-hidden="true" /></span>
            <h3>{t.cart.emptyTitle}</h3>
            <p>{t.cart.emptyText}</p>
            <Link className="button primary" to="/catalog" onClick={() => setCartOpen(false)}>
              {t.cart.continue}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {Lines.map((Line) => {
                const Height = Line.product.attrs?.[ATTR_HEIGHT] ?? "";
                const Type = Line.product.attrs?.[ATTR_TYPE] ?? Line.family.type;

                return (
                  <article className="cart-line" key={Line.item.productId}>
                    <Link to={`/products/${Line.family.slug}`} onClick={() => setCartOpen(false)} className="cart-line-image">
                      <SmartImage src={Line.family.images[0]} alt={getProductTitle(Line.family.title, locale)} loading="lazy" />
                    </Link>
                    <div className="cart-line-content">
                      <div className="cart-line-heading">
                        <div>
                          <Link to={`/products/${Line.family.slug}`} onClick={() => setCartOpen(false)}>
                            <strong>{getProductTitle(Line.family.title, locale)}</strong>
                          </Link>
                          <span>{Height} см · {getTypeLabel(Type, locale)}</span>
                        </div>
                        <button
                          className="cart-remove"
                          type="button"
                          aria-label={t.cart.remove}
                          onClick={() => removeFromCart(Line.item.productId)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="cart-line-bottom">
                        <QuantityStepper
                          value={Line.item.quantity}
                          max={Math.max(1, Math.min(Line.product.stock ?? 1, 99))}
                          onChange={(Quantity) => setCartQuantity(Line.item.productId, Quantity)}
                          decreaseLabel={t.cart.decrease}
                          increaseLabel={t.cart.increase}
                        />
                        <strong>{formatMoney(Line.total, currency)}</strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>{t.cart.subtotal}</span>
                <strong>{formatMoney(Subtotal, currency)}</strong>
              </div>
              <p>{locale === "ru" ? "Детали доставки подтвердим после отправки заказа." : "Жеткізу мәліметтерін тапсырыстан кейін растаймыз."}</p>
              <Link className="button primary wide" to="/checkout" onClick={() => setCartOpen(false)}>
                {t.cart.checkout}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <button className="cart-continue-button" type="button" onClick={() => setCartOpen(false)}>
                {t.cart.continue}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
