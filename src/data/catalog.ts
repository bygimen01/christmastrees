import rawProducts from "../../data/products";
import { currencyConfig, getPrice } from "../config/currency";
import { shopConfig } from "../config/shopConfig";
import { getCategoryLabel, getProductSummary, getProductTitle, getTypeLabel } from "../i18n/content";
import { CurrencyCode, Locale, ProductFamily, RawProduct } from "../types";
import { slugify } from "../utils/slug";

export const ATTR_HEIGHT = "Высота";
export const ATTR_TYPE = "Тип ели";

const products = rawProducts as RawProduct[];

function numberFrom(value?: string) {
  if (!value) {
    return 0;
  }

  return Number.parseInt(value.replace(/[^\d]/g, ""), 10) || 0;
}

function cleanText(value?: string) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function pickLeadProduct(variants: RawProduct[]) {
  return variants.find((product) => product.attrs?.[ATTR_HEIGHT] === "180") ?? variants[0];
}

function buildFamilies() {
  const grouped = products.reduce<Map<number, RawProduct[]>>((map, product) => {
    const current = map.get(product.setId) ?? [];
    current.push(product);
    map.set(product.setId, current);
    return map;
  }, new Map());

  return Array.from(grouped.entries())
    .map(([setId, variants]) => {
      const sortedVariants = [...variants].sort((a, b) => numberFrom(a.attrs?.[ATTR_HEIGHT]) - numberFrom(b.attrs?.[ATTR_HEIGHT]));
      const leadProduct = pickLeadProduct(sortedVariants);
      const title = leadProduct.title;
      const category = leadProduct.category;
      const type = leadProduct.attrs?.[ATTR_TYPE] ?? "";
      const heights = unique(sortedVariants.map((product) => product.attrs?.[ATTR_HEIGHT]).filter(Boolean) as string[]).sort(
        (a, b) => numberFrom(a) - numberFrom(b)
      );
      const images = unique(sortedVariants.flatMap((product) => product.images ?? [])).filter(Boolean);
      const prices = sortedVariants.map((product) => product.prices?.KZT ?? product.price);
      const hasDiscount = sortedVariants.some((product) => product.discount);
      const discountPercentage = Math.max(...sortedVariants.map((product) => product.discountPercentage ?? 0));
      const rating =
        sortedVariants.reduce((sum, product) => sum + (product.rating ?? 0), 0) / Math.max(sortedVariants.length, 1);

      return {
        setId,
        slug: `${slugify(`${title}-${category}`)}-${setId}`,
        title,
        category,
        type,
        variantGroup: leadProduct.variantGroup ?? "",
        description: cleanText(leadProduct.description),
        images,
        variants: sortedVariants,
        heights,
        minPriceKzt: Math.min(...prices),
        maxPriceKzt: Math.max(...prices),
        rating,
        stock: sortedVariants.reduce((sum, product) => sum + (product.stock ?? 0), 0),
        discountPercentage,
        hasDiscount,
        leadProduct
      } satisfies ProductFamily;
    })
    .sort((a, b) => a.setId - b.setId);
}

export const productFamilies = buildFamilies();

export const allProducts = products;

export const categories = unique(productFamilies.map((family) => family.category));

export const heights = unique(products.map((product) => product.attrs?.[ATTR_HEIGHT]).filter(Boolean) as string[]).sort(
  (a, b) => numberFrom(a) - numberFrom(b)
);

export const priceBoundsKzt = {
  min: Math.min(...products.map((product) => product.prices?.KZT ?? product.price)),
  max: Math.max(...products.map((product) => product.prices?.KZT ?? product.price))
};

export function getFamilyBySlug(slug?: string) {
  return productFamilies.find((family) => family.slug === slug || String(family.setId) === slug);
}

export function getFamilyBySetId(setId: number) {
  return productFamilies.find((family) => family.setId === setId);
}

export function getProductById(productId: number) {
  return products.find((product) => product.id === productId);
}

export function getFamilyForProduct(productId: number) {
  const product = getProductById(productId);
  return product ? getFamilyBySetId(product.setId) : undefined;
}

export function getDefaultVariant(family: ProductFamily) {
  return family.variants.find((variant) => (variant.stock ?? 0) > 0 && variant.attrs?.[ATTR_HEIGHT] === "180")
    ?? family.variants.find((variant) => (variant.stock ?? 0) > 0)
    ?? family.variants[0];
}

export function getPopularFamilies(limit = 4) {
  return [...productFamilies]
    .sort((a, b) => b.stock + b.rating * 100 + b.images.length * 20 - (a.stock + a.rating * 100 + a.images.length * 20))
    .slice(0, limit);
}

export function getRelatedFamilies(family: ProductFamily, limit = 4) {
  return productFamilies
    .filter((candidate) => candidate.setId !== family.setId)
    .sort((a, b) => {
      const aScore = (a.category === family.category ? 1000 : 0) + Math.abs(a.minPriceKzt - family.minPriceKzt) * -1;
      const bScore = (b.category === family.category ? 1000 : 0) + Math.abs(b.minPriceKzt - family.minPriceKzt) * -1;
      return bScore - aScore;
    })
    .slice(0, limit);
}

export function getFamilyPriceRange(family: ProductFamily, currency: CurrencyCode) {
  const prices = family.variants.map((variant) => getPrice(variant, currency));
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}


function cleanProductDescription(value: string) {
  return value
    .replace(/У нее 300% схожести с натуральной елью за сч[её]т использования полностью литых ветвей-лапок разной формы и размера\.?/gi, "Натуральный вид создают полностью литые ветви-лапки разной формы и размера.")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getLocalizedDescription(family: ProductFamily, locale: Locale) {
  if (locale === "ru" && family.description) {
    return cleanProductDescription(family.description);
  }

  return getProductSummary(family.title, family.type, family.heights, locale);
}

export function getShortDescription(family: ProductFamily, locale: Locale) {
  if (locale === "kk") {
    return getProductSummary(family.title, family.type, family.heights, locale);
  }

  const Description = cleanProductDescription(family.description);
  const FirstSentence = Description.split(/[.!?]\s/)[0];
  return FirstSentence ? `${FirstSentence}.` : getProductSummary(family.title, family.type, family.heights, locale);
}

export function normalizeSearch(value: string) {
  return value.trim().toLowerCase().replace(/ё/g, "е");
}

export function getSearchText(family: ProductFamily, locale: Locale) {
  return normalizeSearch(
    [
      family.title,
      getProductTitle(family.title, locale),
      family.category,
      getCategoryLabel(family.category, locale),
      family.type,
      getTypeLabel(family.type, locale),
      family.heights.join(" ")
    ].join(" ")
  );
}

export function convertKztValue(value: number, currency: CurrencyCode) {
  return Math.round(value * currencyConfig[currency].rateFromKzt);
}

export function createProductJsonLd(family: ProductFamily, currency: CurrencyCode, locale: Locale, origin: string) {
  const range = getFamilyPriceRange(family, currency);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: getProductTitle(family.title, locale),
    description: getShortDescription(family, locale),
    image: family.images.map((image) => `${origin}${image}`),
    sku: `DT-${family.setId}`,
    brand: {
      "@type": "Brand",
      name: shopConfig.brand.name
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: currency,
      lowPrice: range.min,
      highPrice: range.max,
      availability: family.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${origin}/products/${family.slug}`
    }
  };
}

export function createOrganizationJsonLd(origin: string) {
  const SiteOrigin = origin.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: shopConfig.brand.name,
    url: SiteOrigin,
    logo: `${SiteOrigin}${shopConfig.brand.logo}`,
    email: shopConfig.contacts.email,
    telephone: shopConfig.contacts.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: shopConfig.business.city,
      addressCountry: shopConfig.brand.country
    },
    sameAs: [
      shopConfig.contacts.telegramUrl,
      shopConfig.contacts.instagramUrl
    ].filter(Boolean)
  };
}

export function createBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
