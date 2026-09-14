import { getPrice } from "../config/currency";
import { getFamilyForProduct, getProductById } from "../data/catalog";
import { CartItem, CurrencyCode } from "../types";

export function getCartLines(items: CartItem[], currency: CurrencyCode) {
  return items
    .map((item) => {
      const product = getProductById(item.productId);
      const family = getFamilyForProduct(item.productId);

      if (!product || !family) {
        return null;
      }

      const price = getPrice(product, currency);

      return {
        item,
        product,
        family,
        price,
        total: price * item.quantity
      };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));
}

export function getCartSubtotal(items: CartItem[], currency: CurrencyCode) {
  return getCartLines(items, currency).reduce((sum, line) => sum + line.total, 0);
}
