import { shopConfig } from "./shopConfig";
import { CurrencyCode, RawProduct } from "../types";

export const currencyConfig: Record<
  CurrencyCode,
  { code: CurrencyCode; symbol: string; rateFromKzt: number; locale: string; label: string }
> = {
  KZT: {
    code: "KZT",
    symbol: "₸",
    rateFromKzt: 1,
    locale: "ru-KZ",
    label: "KZT ₸"
  },
  RUB: {
    code: "RUB",
    symbol: "₽",
    rateFromKzt: shopConfig.currency.rubRateFromKzt,
    locale: "ru-RU",
    label: "RUB ₽"
  }
};

export function getPrice(product: RawProduct, currency: CurrencyCode) {
  const direct = product.prices?.[currency];
  if (typeof direct === "number") {
    return direct;
  }

  const baseKzt = product.prices?.KZT ?? product.price;
  return Math.round(baseKzt * currencyConfig[currency].rateFromKzt);
}

export function getPreviousPrice(product: RawProduct, currency: CurrencyCode) {
  if (!product.discount || !product.discountPercentage) {
    return null;
  }

  const current = getPrice(product, currency);
  return Math.round(current / (1 - product.discountPercentage / 100));
}

export function formatMoney(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat(currencyConfig[currency].locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatRange(min: number, max: number, currency: CurrencyCode) {
  if (min === max) {
    return formatMoney(min, currency);
  }

  return `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
}
