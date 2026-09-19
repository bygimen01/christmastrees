import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSiteUrl, shopConfig } from "../../config/shopConfig";
import { useShop } from "../../context/ShopContext";
import { resolvePublicAsset } from "../../utils/assets";

type SeoProps = {
  title: string;
  description: string;
  image?: string;
  jsonLd?: unknown[];
  noIndex?: boolean;
};

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!tag) {
    tag = document.createElement("link");
    tag.rel = rel;
    document.head.appendChild(tag);
  }

  tag.href = href;
}

export function Seo({ title, description, image = shopConfig.seo.defaultImage, jsonLd = [], noIndex = false }: SeoProps) {
  const { locale } = useShop();
  const location = useLocation();
  const Brand = shopConfig.brand.name;

  useEffect(() => {
    const SiteOrigin = getSiteUrl() || window.location.origin;
    const Canonical = `${SiteOrigin}${location.pathname}`;
    const FullTitle = title.includes(Brand) ? title : `${title} | ${Brand}`;
    const ImageUrl = image.startsWith("http") ? image : new URL(resolvePublicAsset(image) || image, window.location.origin).href;

    document.documentElement.lang = locale === "ru" ? "ru" : "kk";
    document.title = FullTitle;
    setMeta("description", description);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    setMeta("theme-color", shopConfig.seo.themeColor);
    setMeta("og:type", "website", true);
    setMeta("og:title", FullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", ImageUrl, true);
    setMeta("og:url", Canonical, true);
    setMeta("og:site_name", Brand, true);
    setMeta("og:locale", locale === "ru" ? "ru_RU" : "kk_KZ", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", FullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ImageUrl);
    setLink("canonical", Canonical);

    document.querySelectorAll("script[data-json-ld]").forEach((Node) => Node.remove());
    jsonLd.forEach((Entry) => {
      const Script = document.createElement("script");
      Script.type = "application/ld+json";
      Script.dataset.jsonLd = "true";
      Script.textContent = JSON.stringify(Entry);
      document.head.appendChild(Script);
    });
  }, [Brand, description, image, jsonLd, locale, location.pathname, noIndex, title]);

  return null;
}
