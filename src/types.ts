export type Locale = "ru" | "kk";

export type CurrencyCode = "KZT" | "RUB";

export type ThemeMode = "light" | "dark";

export type RawProduct = {
  setId: number;
  id: number;
  title: string;
  price: number;
  prices?: Record<string, number>;
  discount?: boolean;
  discountPercentage?: number;
  category: string;
  rating?: number;
  stock?: number;
  description?: string;
  images?: string[];
  variantGroup?: string;
  attrs?: Record<string, string>;
  variantMap?: Array<{ id: number; attrs: Record<string, string> }>;
};

export type ProductFamily = {
  setId: number;
  slug: string;
  title: string;
  category: string;
  type: string;
  variantGroup: string;
  description: string;
  images: string[];
  variants: RawProduct[];
  heights: string[];
  minPriceKzt: number;
  maxPriceKzt: number;
  rating: number;
  stock: number;
  discountPercentage: number;
  hasDiscount: boolean;
  leadProduct: RawProduct;
};

export type CartItem = {
  productId: number;
  quantity: number;
};

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  address: string;
  comment: string;
  contactMethod: "telegram" | "whatsapp" | "phone";
};

export type OrderPayload = {
  orderId: string;
  locale: Locale;
  currency: CurrencyCode;
  customer: CheckoutCustomer;
  items: Array<{
    productId: number;
    title: string;
    height: string;
    type: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  source: "website";
};
