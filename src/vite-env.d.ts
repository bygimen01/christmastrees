/// <reference types="vite/client" />

declare module "../../data/products.js" {
  const products: RawProduct[];
  export default products;
}

type RawProduct = {
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
