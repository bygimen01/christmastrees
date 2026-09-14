import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProductById } from "../data/catalog";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { CartItem, CurrencyCode, Locale, ThemeMode } from "../types";

type ShopContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  cartItems: CartItem[];
  cartCount: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: number, quantity?: number) => void;
  setCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
};

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

function NormalizeCartItems(Value: unknown): CartItem[] {
  if (!Array.isArray(Value)) {
    return [];
  }

  const UniqueItems = new Map<number, CartItem>();

  Value.forEach((RawItem) => {
    if (!RawItem || typeof RawItem !== "object") {
      return;
    }

    const ProductId = Number((RawItem as CartItem).productId);
    const RequestedQuantity = Number((RawItem as CartItem).quantity);
    const Product = getProductById(ProductId);
    const MaxQuantity = Math.max(0, Math.min(Product?.stock ?? 0, 99));

    if (!Number.isInteger(ProductId) || !Number.isFinite(RequestedQuantity) || MaxQuantity === 0) {
      return;
    }

    const Quantity = Math.max(1, Math.min(Math.floor(RequestedQuantity), MaxQuantity));
    UniqueItems.set(ProductId, { productId: ProductId, quantity: Quantity });
  });

  return Array.from(UniqueItems.values());
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [StoredLocale, setStoredLocale] = useLocalStorage<unknown>("CHRISTMAS-TREES-locale", "ru");
  const [StoredCurrency, setStoredCurrency] = useLocalStorage<unknown>("CHRISTMAS-TREES-currency", "KZT");
  const [StoredCartItems, setStoredCartItems] = useLocalStorage<unknown>("CHRISTMAS-TREES-cart", []);
  const [StoredTheme, setStoredTheme] = useLocalStorage<unknown>("CHRISTMAS-TREES-theme", "light");
  const [cartOpen, setCartOpen] = useState(false);

  const locale: Locale = StoredLocale === "kk" ? "kk" : "ru";
  const currency: CurrencyCode = StoredCurrency === "RUB" ? "RUB" : "KZT";
  const cartItems = useMemo(() => NormalizeCartItems(StoredCartItems), [StoredCartItems]);
  const theme: ThemeMode = StoredTheme === "dark" ? "dark" : "light";

  const setLocale = useCallback((NextLocale: Locale) => setStoredLocale(NextLocale), [setStoredLocale]);
  const setCurrency = useCallback((NextCurrency: CurrencyCode) => setStoredCurrency(NextCurrency), [setStoredCurrency]);
  const setTheme = useCallback((NextTheme: ThemeMode) => setStoredTheme(NextTheme), [setStoredTheme]);
  const toggleTheme = useCallback(() => setStoredTheme((CurrentTheme: unknown) => CurrentTheme === "dark" ? "light" : "dark"), [setStoredTheme]);

  useEffect(() => {
    if (StoredLocale !== locale) {
      setStoredLocale(locale);
    }
  }, [StoredLocale, locale, setStoredLocale]);

  useEffect(() => {
    if (StoredCurrency !== currency) {
      setStoredCurrency(currency);
    }
  }, [StoredCurrency, currency, setStoredCurrency]);

  useEffect(() => {
    if (JSON.stringify(StoredCartItems) !== JSON.stringify(cartItems)) {
      setStoredCartItems(cartItems);
    }
  }, [StoredCartItems, cartItems, setStoredCartItems]);

  useEffect(() => {
    document.documentElement.lang = locale === "kk" ? "kk" : "ru";
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const ThemeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (ThemeMeta) {
      ThemeMeta.content = theme === "dark" ? "#0d1713" : "#102b21";
    }
  }, [theme]);

  const addToCart = useCallback(
    (productId: number, quantity = 1) => {
      const Product = getProductById(productId);
      const MaxQuantity = Math.max(0, Math.min(Product?.stock ?? 0, 99));
      if (MaxQuantity === 0) {
        return;
      }

      setStoredCartItems((CurrentValue: unknown) => {
        const Items = NormalizeCartItems(CurrentValue);
        const Existing = Items.find((Item) => Item.productId === productId);
        if (Existing) {
          return Items.map((Item) =>
            Item.productId === productId
              ? { ...Item, quantity: Math.min(Item.quantity + Math.max(1, Math.floor(quantity)), MaxQuantity) }
              : Item
          );
        }

        return [...Items, { productId, quantity: Math.min(Math.max(1, Math.floor(quantity)), MaxQuantity) }];
      });
      setCartOpen(true);
    },
    [setStoredCartItems]
  );

  const setCartQuantity = useCallback(
    (productId: number, quantity: number) => {
      const Product = getProductById(productId);
      const MaxQuantity = Math.max(0, Math.min(Product?.stock ?? 0, 99));

      setStoredCartItems((CurrentValue: unknown) => {
        const Items = NormalizeCartItems(CurrentValue);
        if (quantity <= 0 || MaxQuantity === 0) {
          return Items.filter((Item) => Item.productId !== productId);
        }

        return Items.map((Item) =>
          Item.productId === productId
            ? { ...Item, quantity: Math.min(Math.max(1, Math.floor(quantity)), MaxQuantity) }
            : Item
        );
      });
    },
    [setStoredCartItems]
  );

  const removeFromCart = useCallback(
    (productId: number) => {
      setStoredCartItems((CurrentValue: unknown) => NormalizeCartItems(CurrentValue).filter((Item) => Item.productId !== productId));
    },
    [setStoredCartItems]
  );

  const clearCart = useCallback(() => {
    setStoredCartItems([]);
  }, [setStoredCartItems]);

  const cartCount = useMemo(() => cartItems.reduce((Sum, Item) => Sum + Item.quantity, 0), [cartItems]);

  const Value = useMemo(
    () => ({
      locale,
      setLocale,
      currency,
      setCurrency,
      theme,
      setTheme,
      toggleTheme,
      cartItems,
      cartCount,
      cartOpen,
      setCartOpen,
      addToCart,
      setCartQuantity,
      removeFromCart,
      clearCart
    }),
    [
      locale,
      setLocale,
      currency,
      setCurrency,
      theme,
      setTheme,
      toggleTheme,
      cartItems,
      cartCount,
      cartOpen,
      addToCart,
      setCartQuantity,
      removeFromCart,
      clearCart
    ]
  );

  return <ShopContext.Provider value={Value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const Value = useContext(ShopContext);
  if (!Value) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return Value;
}
