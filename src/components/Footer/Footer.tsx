import { ArrowUpRight, Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { getLocalizedShopConfig, shopConfig } from "../../config/shopConfig";
import { useShop } from "../../context/ShopContext";
import { copy } from "../../i18n/content";
import { PreferenceControls } from "../PreferenceControls/PreferenceControls";
import { BrandLogo } from "../BrandLogo/BrandLogo";

export function Footer() {
  const { locale } = useShop();
  const t = copy[locale];
  const SiteCopy = getLocalizedShopConfig(locale);

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand">
            <span className="brand-mark" aria-hidden="true">
              <BrandLogo />
            </span>
            <span>{shopConfig.brand.name}</span>
          </Link>
          <p>{SiteCopy.footerDescription}</p>
          <PreferenceControls />
        </div>

        <div className="footer-links-column">
          <h2>{t.nav.catalog}</h2>
          <Link to="/">{t.nav.home}</Link>
          <Link to="/catalog">{SiteCopy.heroPrimary}</Link>
          <Link to="/delivery">{t.nav.delivery}</Link>
          <Link to="/faq">{t.nav.faq}</Link>
          <Link to="/contacts">{t.nav.contacts}</Link>
        </div>

        <div className="footer-links-column footer-contact-column">
          <h2>{t.footer.contacts}</h2>
          <a href={shopConfig.contacts.phoneHref}><Phone size={15} aria-hidden="true" />{shopConfig.contacts.phone}</a>
          <a href={`mailto:${shopConfig.contacts.email}`}><Mail size={15} aria-hidden="true" />{shopConfig.contacts.email}</a>
          <a href={shopConfig.contacts.telegramUrl} target="_blank" rel="noreferrer"><Send size={15} aria-hidden="true" />{shopConfig.contacts.telegram}</a>
          <a href={shopConfig.contacts.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={15} aria-hidden="true" />{shopConfig.contacts.instagram}</a>
        </div>

        <div className="footer-links-column footer-order-column">
          <h2>{t.footer.order}</h2>
          <p>{shopConfig.business.workingHours}</p>
          <p className="footer-location"><MapPin size={15} aria-hidden="true" />{shopConfig.business.showroom}</p>
          <Link className="footer-order-link" to="/catalog">
            {t.cart.continue}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {shopConfig.brand.name} · {SiteCopy.copyright}</span>
        <span>{shopConfig.business.deliveryArea}</span>
      </div>
    </footer>
  );
}
