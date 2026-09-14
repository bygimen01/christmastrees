import fs from "node:fs";
import path from "node:path";
import products from "../data/products.js";

const ShopConfig = JSON.parse(fs.readFileSync(new URL("../data/shopConfig.json", import.meta.url), "utf8"));
const Origin = (process.env.SITE_URL || process.env.VITE_SITE_URL || ShopConfig.seo.siteUrl || "").replace(/\/$/, "");

if (!Origin) {
  process.exit(0);
}

const Transliteration = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "",
  ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
};

function Slugify(Value) {
  return Value
    .toLowerCase()
    .split("")
    .map((Character) => Transliteration[Character] ?? Character)
    .join("")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const Families = Array.from(products.reduce((MapValue, Product) => {
  if (!MapValue.has(Product.setId)) {
    MapValue.set(Product.setId, Product);
  }
  return MapValue;
}, new Map()).values());

const Urls = [
  "/",
  "/catalog",
  "/delivery",
  "/faq",
  "/contacts",
  ...Families.map((Product) => `/products/${Slugify(`${Product.title}-${Product.category}`)}-${Product.setId}`)
];

const Xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Urls.map((Url) => `  <url>\n    <loc>${Origin}${Url}</loc>\n  </url>`).join("\n")}
</urlset>\n`;

fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), Xml);
