import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { Seo } from "../components/Seo";
import { currencyConfig } from "../config/currency";
import { useShop } from "../context/ShopContext";
import {
  categories,
  convertKztValue,
  getSearchText,
  heights,
  normalizeSearch,
  priceBoundsKzt,
  productFamilies
} from "../data/catalog";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { copy, getCategoryLabel } from "../i18n/content";

type SortMode = "recommended" | "priceAsc" | "priceDesc" | "name";

type FiltersProps = {
  query: string;
  setQuery: (query: string) => void;
  category: string;
  setCategory: (category: string) => void;
  selectedHeights: string[];
  setSelectedHeights: (heights: string[]) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  resultCount: number;
  idSuffix: string;
  onApply?: () => void;
};

export function CatalogPage() {
  const { locale, currency } = useShop();
  const t = copy[locale];
  const [SearchParams, setSearchParams] = useSearchParams();
  const [Query, setQuery] = useState(() => SearchParams.get("q") ?? "");
  const [Category, setCategory] = useState(() => SearchParams.get("category") ?? "all");
  const [SelectedHeights, setSelectedHeights] = useState<string[]>(() => SearchParams.getAll("height"));
  const [InStockOnly, setInStockOnly] = useState(() => SearchParams.get("stock") === "1");
  const [PriceRange, setPriceRange] = useState<[number, number]>([priceBoundsKzt.min, priceBoundsKzt.max]);
  const [Sort, setSort] = useState<SortMode>(() => (SearchParams.get("sort") as SortMode) || "recommended");
  const [FiltersOpen, setFiltersOpen] = useState(false);

  useBodyScrollLock(FiltersOpen);

  useEffect(() => {
    const Params = new URLSearchParams();
    if (Query.trim()) Params.set("q", Query.trim());
    if (Category !== "all") Params.set("category", Category);
    SelectedHeights.forEach((Height) => Params.append("height", Height));
    if (InStockOnly) Params.set("stock", "1");
    if (Sort !== "recommended") Params.set("sort", Sort);

    if (Params.toString() !== SearchParams.toString()) {
      setSearchParams(Params, { replace: true });
    }
  }, [Category, InStockOnly, Query, SelectedHeights, Sort, setSearchParams]);

  useEffect(() => {
    const ParamQuery = SearchParams.get("q") ?? "";
    const ParamCategory = SearchParams.get("category") ?? "all";
    const SafeCategory = ParamCategory === "all" || categories.includes(ParamCategory) ? ParamCategory : "all";
    const ParamHeights = SearchParams.getAll("height").filter((Height) => heights.includes(Height));
    const ParamStock = SearchParams.get("stock") === "1";
    const ParamSort = SearchParams.get("sort");
    const SafeSort: SortMode = ["recommended", "priceAsc", "priceDesc", "name"].includes(ParamSort ?? "")
      ? ParamSort as SortMode
      : "recommended";

    if (ParamQuery !== Query) setQuery(ParamQuery);
    if (SafeCategory !== Category) setCategory(SafeCategory);
    if (ParamHeights.join("|") !== SelectedHeights.join("|")) setSelectedHeights(ParamHeights);
    if (ParamStock !== InStockOnly) setInStockOnly(ParamStock);
    if (SafeSort !== Sort) setSort(SafeSort);
  }, [SearchParams]);

  useEffect(() => {
    if (!FiltersOpen) {
      return;
    }

    const HandleKeyDown = (Event: KeyboardEvent) => {
      if (Event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", HandleKeyDown);
    return () => window.removeEventListener("keydown", HandleKeyDown);
  }, [FiltersOpen]);

  const Filtered = useMemo(() => {
    const NormalizedQuery = normalizeSearch(Query);

    return productFamilies
      .filter((Family) => {
        const MatchesQuery = NormalizedQuery ? getSearchText(Family, locale).includes(NormalizedQuery) : true;
        const MatchesCategory = Category === "all" || Family.category === Category;
        const MatchesHeight = SelectedHeights.length ? SelectedHeights.some((Height) => Family.heights.includes(Height)) : true;
        const MatchesAvailability = InStockOnly ? Family.stock > 0 : true;
        const MatchesPrice = Family.variants.some((Variant) => {
          const Price = Variant.prices?.KZT ?? Variant.price;
          return Price >= PriceRange[0] && Price <= PriceRange[1];
        });

        return MatchesQuery && MatchesCategory && MatchesHeight && MatchesAvailability && MatchesPrice;
      })
      .sort((First, Second) => {
        if (Sort === "priceAsc") return First.minPriceKzt - Second.minPriceKzt;
        if (Sort === "priceDesc") return Second.minPriceKzt - First.minPriceKzt;
        if (Sort === "name") return First.title.localeCompare(Second.title, locale === "ru" ? "ru" : "kk");
        return Second.stock + Second.rating * 100 - (First.stock + First.rating * 100);
      });
  }, [Category, InStockOnly, locale, PriceRange, Query, SelectedHeights, Sort]);

  const ResetFilters = () => {
    setQuery("");
    setCategory("all");
    setSelectedHeights([]);
    setInStockOnly(false);
    setPriceRange([priceBoundsKzt.min, priceBoundsKzt.max]);
    setSort("recommended");
  };

  const RemoveHeight = (Height: string) => setSelectedHeights(SelectedHeights.filter((Value) => Value !== Height));
  const HasPriceFilter = PriceRange[0] !== priceBoundsKzt.min || PriceRange[1] !== priceBoundsKzt.max;
  const ActiveFilterCount = (Query ? 1 : 0) + (Category !== "all" ? 1 : 0) + SelectedHeights.length + (InStockOnly ? 1 : 0) + (HasPriceFilter ? 1 : 0);

  const RenderFilters = (IdSuffix: string, OnApply?: () => void) => (
    <CatalogFilters
      query={Query}
      setQuery={setQuery}
      category={Category}
      setCategory={setCategory}
      selectedHeights={SelectedHeights}
      setSelectedHeights={setSelectedHeights}
      inStockOnly={InStockOnly}
      setInStockOnly={setInStockOnly}
      priceRange={PriceRange}
      setPriceRange={setPriceRange}
      resultCount={Filtered.length}
      idSuffix={IdSuffix}
      onApply={OnApply}
    />
  );

  return (
    <>
      <Seo title={t.catalog.title} description={t.catalog.text} image={productFamilies[0]?.images[0] ?? "/tree-placeholder.svg"} />

      <section className="catalog-hero">
        <div className="container catalog-hero-inner">
          <div>
            <span className="eyebrow">{t.nav.catalog}</span>
            <h1>{t.catalog.title}</h1>
          </div>
          <p>{t.catalog.text}</p>
        </div>
      </section>

      <section className="catalog-section">
        <div className="container catalog-layout">
          <aside className="catalog-sidebar">
            <div className="catalog-sidebar-heading">
              <h2>{t.catalog.filters}</h2>
              {ActiveFilterCount > 0 && <button type="button" onClick={ResetFilters}>{t.catalog.clear}</button>}
            </div>
            {RenderFilters("desktop")}
          </aside>

          <div className="catalog-main">
            <div className="catalog-toolbar">
              <button className="button ghost mobile-filter-button" type="button" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={18} aria-hidden="true" />
                {t.catalog.filters}
                {ActiveFilterCount > 0 && <span>{ActiveFilterCount}</span>}
              </button>

              <div className="catalog-count">
                <span>{t.catalog.found}</span>
                <strong>{Filtered.length}</strong>
              </div>

              <label className="sort-control">
                <span>{t.catalog.sort}</span>
                <select value={Sort} onChange={(Event) => setSort(Event.target.value as SortMode)}>
                  <option value="recommended">{t.catalog.sortRecommended}</option>
                  <option value="priceAsc">{t.catalog.sortPriceAsc}</option>
                  <option value="priceDesc">{t.catalog.sortPriceDesc}</option>
                  <option value="name">{t.catalog.sortName}</option>
                </select>
              </label>
            </div>

            {ActiveFilterCount > 0 && (
              <div className="active-filter-list">
                {Query && <button type="button" onClick={() => setQuery("")}>{Query}<X size={13} /></button>}
                {Category !== "all" && <button type="button" onClick={() => setCategory("all")}>{getCategoryLabel(Category, locale)}<X size={13} /></button>}
                {SelectedHeights.map((Height) => <button type="button" key={Height} onClick={() => RemoveHeight(Height)}>{Height} см<X size={13} /></button>)}
                {InStockOnly && <button type="button" onClick={() => setInStockOnly(false)}>{t.catalog.availability}<X size={13} /></button>}
                {HasPriceFilter && <button type="button" onClick={() => setPriceRange([priceBoundsKzt.min, priceBoundsKzt.max])}>{t.catalog.price}<X size={13} /></button>}
              </div>
            )}

            {Filtered.length === 0 ? (
              <div className="empty-state catalog-empty">
                <Search size={30} aria-hidden="true" />
                <h2>{t.catalog.emptyTitle}</h2>
                <p>{t.catalog.emptyText}</p>
                <button className="button primary" type="button" onClick={ResetFilters}>{t.catalog.clear}</button>
              </div>
            ) : (
              <div className="product-grid catalog-grid">
                {Filtered.map((Family, Index) => <ProductCard key={Family.setId} family={Family} priority={Index < 3} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className={FiltersOpen ? "filter-drawer is-open" : "filter-drawer"} aria-hidden={!FiltersOpen}>
        <button className="drawer-backdrop" type="button" aria-label={t.nav.close} onClick={() => setFiltersOpen(false)} />
        <div className="filter-panel mobile-filter-panel" role="dialog" aria-modal="true" aria-label={t.catalog.filters}>
          <div className="drawer-header">
            <div>
              <span className="eyebrow">{t.nav.catalog}</span>
              <h2>{t.catalog.filters}</h2>
            </div>
            <button className="icon-button" type="button" aria-label={t.nav.close} onClick={() => setFiltersOpen(false)}>
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          {RenderFilters("mobile", () => setFiltersOpen(false))}
        </div>
      </div>
    </>
  );
}

function CatalogFilters({
  query,
  setQuery,
  category,
  setCategory,
  selectedHeights,
  setSelectedHeights,
  inStockOnly,
  setInStockOnly,
  priceRange,
  setPriceRange,
  resultCount,
  idSuffix,
  onApply
}: FiltersProps) {
  const { locale, currency } = useShop();
  const t = copy[locale];
  const Rate = currencyConfig[currency].rateFromKzt;
  const MinDisplay = convertKztValue(priceBoundsKzt.min, currency);
  const MaxDisplay = convertKztValue(priceBoundsKzt.max, currency);

  const SetDisplayPrice = (Index: 0 | 1, Value: string) => {
    const Numeric = Number(Value);
    const AsKzt = Math.round(Numeric / Rate);
    const Next: [number, number] = [...priceRange] as [number, number];
    Next[Index] = Number.isFinite(AsKzt) ? AsKzt : priceBoundsKzt[Index === 0 ? "min" : "max"];
    if (Next[0] > Next[1]) Next[Index === 0 ? 1 : 0] = Next[Index];
    setPriceRange(Next);
  };

  const ToggleHeight = (Height: string) => {
    setSelectedHeights(selectedHeights.includes(Height) ? selectedHeights.filter((Current) => Current !== Height) : [...selectedHeights, Height]);
  };

  const Reset = () => {
    setQuery("");
    setCategory("all");
    setSelectedHeights([]);
    setInStockOnly(false);
    setPriceRange([priceBoundsKzt.min, priceBoundsKzt.max]);
  };

  return (
    <div className="filter-form">
      <div className="filter-group search-filter">
        <label htmlFor={`catalog-search-${idSuffix}`}>{t.catalog.search}</label>
        <div className="search-input-wrap">
          <Search size={17} aria-hidden="true" />
          <input id={`catalog-search-${idSuffix}`} type="search" value={query} placeholder={t.catalog.search} onChange={(Event) => setQuery(Event.target.value)} />
          {query && <button type="button" aria-label={t.catalog.clear} onClick={() => setQuery("")}><X size={15} /></button>}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">{t.catalog.category}</span>
        <div className="category-filter-list">
          <button type="button" className={category === "all" ? "is-active" : ""} onClick={() => setCategory("all")}>
            <span>{t.catalog.allCategories}</span>{category === "all" && <Check size={15} />}
          </button>
          {categories.map((Item) => (
            <button type="button" key={Item} className={category === Item ? "is-active" : ""} onClick={() => setCategory(Item)}>
              <span>{getCategoryLabel(Item, locale)}</span>{category === Item && <Check size={15} />}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="filter-group">
        <legend>{t.catalog.height}</legend>
        <div className="height-filter-grid">
          {heights.map((Height) => (
            <button type="button" key={Height} className={selectedHeights.includes(Height) ? "is-active" : ""} onClick={() => ToggleHeight(Height)}>{Height}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>{t.catalog.price}</legend>
        <div className="price-inputs">
          <label><span>{t.catalog.from}</span><input type="number" min={MinDisplay} max={MaxDisplay} step={currency === "KZT" ? 1000 : 100} value={convertKztValue(priceRange[0], currency)} onChange={(Event) => SetDisplayPrice(0, Event.target.value)} /></label>
          <label><span>{t.catalog.to}</span><input type="number" min={MinDisplay} max={MaxDisplay} step={currency === "KZT" ? 1000 : 100} value={convertKztValue(priceRange[1], currency)} onChange={(Event) => SetDisplayPrice(1, Event.target.value)} /></label>
        </div>
      </fieldset>

      <label className="filter-checkbox">
        <input type="checkbox" checked={inStockOnly} onChange={(Event) => setInStockOnly(Event.target.checked)} />
        <span className="filter-checkbox-box"><Check size={14} /></span>
        <span>{t.catalog.availability}</span>
      </label>

      <div className="filter-actions">
        <button className="button ghost" type="button" onClick={Reset}>{t.catalog.clear}</button>
        {onApply && <button className="button primary" type="button" onClick={onApply}>{t.catalog.apply} · {resultCount}</button>}
      </div>
    </div>
  );
}
