import RawConfig from "../../data/shopConfig.json";
import { Locale } from "../types";

export const shopConfig = RawConfig;

export function getLocalizedShopConfig(locale: Locale) {
  return shopConfig[locale];
}

export function getSiteUrl() {
  const EnvironmentSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
  const ConfiguredSiteUrl = EnvironmentSiteUrl || shopConfig.seo.siteUrl || "";
  return ConfiguredSiteUrl.replace(/\/$/, "");
}

export function getOrderApiUrl() {
  const ConfiguredApiUrl = import.meta.env.VITE_ORDER_API_URL?.trim();
  return ConfiguredApiUrl || "/api/order";
}

export function getContactEntries() {
  return [
    {
      key: "telegram",
      value: shopConfig.contacts.telegram,
      href: shopConfig.contacts.telegramUrl
    },
    {
      key: "whatsapp",
      value: shopConfig.contacts.whatsapp,
      href: shopConfig.contacts.whatsappUrl
    },
    {
      key: "phone",
      value: shopConfig.contacts.phone,
      href: shopConfig.contacts.phoneHref
    },
    {
      key: "email",
      value: shopConfig.contacts.email,
      href: `mailto:${shopConfig.contacts.email}`
    }
  ].filter((Item) => Item.value && Item.href);
}
