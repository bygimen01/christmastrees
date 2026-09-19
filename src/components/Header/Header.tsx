import { ChevronRight, Menu, ShoppingBag, X } from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { getLocalizedShopConfig, shopConfig } from "../../config/shopConfig";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { copy } from "../../i18n/content";
import { PreferenceControls } from "../PreferenceControls/PreferenceControls";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { BrandLogo } from "../BrandLogo/BrandLogo";

export function Header() {
  const { locale, cartCount, setCartOpen } = useShop();
  const [MenuOpen, setMenuOpen] = useState(false);
  const [Scrolled, setScrolled] = useState(false);
  const Location = useLocation();
  const MenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const MenuCloseRef = useRef<HTMLButtonElement | null>(null);
  const MenuPanelRef = useRef<HTMLDivElement | null>(null);
  const PreviousLocationRef = useRef(`${Location.pathname}${Location.hash}`);
  const t = copy[locale];
  const SiteCopy = getLocalizedShopConfig(locale);
  const IsHome = Location.pathname === "/";

  const HandleHomeClick = (Event: MouseEvent<HTMLAnchorElement>) => {
    if (Location.pathname === "/" && !Location.hash) {
      Event.preventDefault();
      setMenuOpen(false);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });
      });
    }
  };

  useBodyScrollLock(MenuOpen);

  useEffect(() => {
    const CurrentLocation = `${Location.pathname}${Location.hash}`;
    if (PreviousLocationRef.current !== CurrentLocation) {
      setMenuOpen(false);
      PreviousLocationRef.current = CurrentLocation;
    }
  }, [Location.pathname, Location.hash]);

  useEffect(() => {
    const HandleScroll = () => setScrolled(window.scrollY > 24);
    HandleScroll();
    window.addEventListener("scroll", HandleScroll, { passive: true });
    return () => window.removeEventListener("scroll", HandleScroll);
  }, []);

  useEffect(() => {
    if (!MenuOpen) {
      return;
    }

    window.requestAnimationFrame(() => MenuCloseRef.current?.focus());

    const HandleKeyDown = (Event: KeyboardEvent) => {
      if (Event.key === "Escape") {
        Event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (Event.key !== "Tab" || !MenuPanelRef.current) {
        return;
      }

      const Focusable = Array.from(MenuPanelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
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
      MenuButtonRef.current?.focus();
    };
  }, [MenuOpen]);

  const NavItems = [
    { label: t.nav.home, to: "/" },
    { label: t.nav.catalog, to: "/catalog" },
    { label: t.nav.delivery, to: "/delivery" },
    { label: t.nav.faq, to: "/faq" },
    { label: t.nav.contacts, to: "/contacts" }
  ];

  const HeaderClassName = [
    "site-header",
    IsHome ? "is-home" : "",
    Scrolled ? "is-scrolled" : ""
  ].filter(Boolean).join(" ");

  const MobileMenu = MenuOpen ? (
    <div className="mobile-menu is-open">
      <button className="mobile-menu-backdrop" type="button" aria-label={t.nav.close} onClick={() => setMenuOpen(false)} />
      <div ref={MenuPanelRef} className="mobile-menu-panel" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
        <div className="mobile-menu-top">
          <Link to="/" className="brand-link" onClick={HandleHomeClick}>
            <span className="brand-mark" aria-hidden="true">
              <BrandLogo />
            </span>
            <span>{shopConfig.brand.name}</span>
          </Link>
          <button ref={MenuCloseRef} className="icon-button mobile-menu-close" type="button" aria-label={t.nav.close} onClick={() => setMenuOpen(false)}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="mobile-menu-intro">
          <span className="eyebrow">{SiteCopy.heroEyebrow}</span>
          <p>{SiteCopy.heroText}</p>
        </div>

        <nav aria-label={t.nav.menu}>
          {NavItems.map((Item) => (
            <NavLink key={Item.to} to={Item.to} end={Item.to === "/"} onClick={Item.to === "/" ? HandleHomeClick : () => setMenuOpen(false)}>
              <span>{Item.label}</span>
              <ChevronRight size={18} aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        <div className="mobile-menu-bottom">
          <div className="mobile-menu-preferences">
            <PreferenceControls />
            <ThemeToggle />
          </div>
          <Link className="button primary wide" to="/catalog" onClick={() => setMenuOpen(false)}>
            {SiteCopy.heroPrimary}
          </Link>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <header className={HeaderClassName}>
        <div className="header-inner">
          <Link to="/" className="brand-link" aria-label={t.nav.home} onClick={HandleHomeClick}>
            <span className="brand-mark" aria-hidden="true">
              <BrandLogo />
            </span>
            <span className="brand-copy">
              <strong>{shopConfig.brand.name}</strong>
              <small>{SiteCopy.brandTagline}</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label={t.nav.menu}>
            {NavItems.map((Item) => (
              <NavLink key={Item.to} to={Item.to} end={Item.to === "/"} onClick={Item.to === "/" ? HandleHomeClick : undefined}>
                {Item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <PreferenceControls compact />
            <ThemeToggle compact />
            <button className="icon-button cart-button" type="button" aria-label={t.nav.cart} onClick={() => setCartOpen(true)}>
              <ShoppingBag size={19} aria-hidden="true" />
              {cartCount > 0 && <span>{cartCount > 99 ? "99+" : cartCount}</span>}
            </button>
            <button ref={MenuButtonRef} className="icon-button menu-button" type="button" aria-label={t.nav.menu} onClick={() => setMenuOpen(true)}>
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      {MobileMenu && typeof document !== "undefined" ? createPortal(MobileMenu, document.body) : null}
    </>
  );
}
