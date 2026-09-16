import { ArrowRight, Clock3, Instagram, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { getLocalizedShopConfig, shopConfig } from "../config/shopConfig";
import { useShop } from "../context/ShopContext";
import { copy } from "../i18n/content";

export function ContactsPage() {
  const { locale } = useShop();
  const t = copy[locale];
  const SiteCopy = getLocalizedShopConfig(locale);
  const ContactCards = [
    {
      title: SiteCopy.contactChannelTitles.telegram,
      value: shopConfig.contacts.telegram,
      text: SiteCopy.contactChannels.telegram,
      href: shopConfig.contacts.telegramUrl,
      Icon: Send
    },
    {
      title: SiteCopy.contactChannelTitles.whatsapp,
      value: shopConfig.contacts.whatsapp,
      text: SiteCopy.contactChannels.whatsapp,
      href: shopConfig.contacts.whatsappUrl,
      Icon: MessageCircle
    },
    {
      title: SiteCopy.contactChannelTitles.phone,
      value: shopConfig.contacts.phone,
      text: SiteCopy.contactChannels.phone,
      href: shopConfig.contacts.phoneHref,
      Icon: Phone
    },
    {
      title: SiteCopy.contactChannelTitles.instagram,
      value: shopConfig.contacts.instagram,
      text: SiteCopy.contactChannels.instagram,
      href: shopConfig.contacts.instagramUrl,
      Icon: Instagram
    },
    {
      title: SiteCopy.contactChannelTitles.email,
      value: shopConfig.contacts.email,
      text: SiteCopy.contactChannels.email,
      href: `mailto:${shopConfig.contacts.email}`,
      Icon: Mail
    }
  ];

  return (
    <>
      <Seo title={`${t.nav.contacts} | ${shopConfig.brand.name}`} description={SiteCopy.contactText} />
      <section className="info-hero compact-info-hero decorated-section decorated-section-info">
        <div className="container info-hero-grid">
          <div data-reveal>
            <span className="eyebrow">{t.nav.contacts}</span>
            <h1>{SiteCopy.contactTitle}</h1>
          </div>
          <p data-reveal>{SiteCopy.contactText}</p>
        </div>
      </section>

      <section className="info-section contacts-page-section decorated-section">
        <div className="container">
          <div className="info-section-heading" data-reveal>
            <span className="eyebrow">01</span>
            <h2>{SiteCopy.contactChannelsTitle}</h2>
          </div>

          <div className="contact-method-grid is-production">
            {ContactCards.map(({ title, value, text, href, Icon }) => (
              <a key={title} href={href} className="contact-method-card" target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} data-reveal>
                <span className="info-card-icon"><Icon size={21} aria-hidden="true" /></span>
                <div>
                  <h3>{title}</h3>
                  <strong>{value}</strong>
                  <p>{text}</p>
                </div>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            ))}
          </div>

          <div className="contact-business-card" data-reveal>
            <div>
              <span className="info-card-icon"><MapPin size={21} aria-hidden="true" /></span>
              <div>
                <small>{SiteCopy.showroomLabel}</small>
                <span>{shopConfig.business.showroom}</span>
                <span>{shopConfig.business.deliveryArea}</span>
              </div>
            </div>
            <div>
              <span className="info-card-icon"><Clock3 size={21} aria-hidden="true" /></span>
              <div>
                <small>{SiteCopy.workingHoursLabel}</small>
                <span>{shopConfig.business.workingHours}</span>
                <span>{shopConfig.business.responseTime}</span>
              </div>
            </div>
            <Link className="button primary" to="/catalog">
              {SiteCopy.heroPrimary}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
