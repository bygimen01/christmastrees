import { expect, test } from "@playwright/test";

const Viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 }
];

const ProductRoute = "/products/el-novgorodskaya-eli-naturalnye-0";
const PublicRoutes = ["/", "/catalog", "/delivery", "/faq", "/contacts", ProductRoute];

for (const Viewport of Viewports) {
  test.describe(`${Viewport.width}x${Viewport.height}`, () => {
    test.use({ viewport: Viewport });

    for (const Route of PublicRoutes) {
      test(`${Route} has no horizontal overflow`, async ({ page }) => {
        await page.goto(Route);
        await expect(page.locator("body")).toBeVisible();
        const Overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(Overflow).toBeLessThanOrEqual(1);
      });
    }
  });
}

test("desktop navigation opens information pages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  for (const Route of ["/delivery", "/faq", "/contacts"]) {
    await page.locator(`.desktop-nav a[href="${Route}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${Route}$`));
    await expect(page.locator("main h1")).toBeVisible();
    await page.goto("/");
  }
});

test("mobile navigation opens delivery page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".menu-button").click();
  await expect(page.locator(".mobile-menu")).toHaveClass(/is-open/);
  await page.locator('.mobile-menu-panel a[href="/delivery"]').click();
  await expect(page).toHaveURL(/\/delivery$/);
  await expect(page.locator("main h1")).toBeVisible();
});

test("delivery size link scrolls to the guide", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator('.hero-actions a[href="/delivery#size-guide"]').click();
  await expect(page).toHaveURL(/\/delivery#size-guide$/);
  await expect(page.locator("#size-guide")).toBeInViewport();
});

test("checkout remains responsive with a stored cart", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem("CHRISTMAS-TREES-cart", JSON.stringify([{ productId: 1, quantity: 1 }]));
  });
  await page.goto("/checkout");
  await expect(page.locator(".checkout-form")).toBeVisible();
  const Overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(Overflow).toBeLessThanOrEqual(1);
});

test("mobile menu fully covers the viewport and keeps readable colors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalog");
  await page.locator(".menu-button").click();
  const Box = await page.locator(".mobile-menu-panel").boundingBox();
  expect(Box?.x ?? -1).toBeLessThanOrEqual(1);
  expect(Box?.width ?? 0).toBeGreaterThanOrEqual(389);
  await expect(page.locator('.mobile-menu-panel a[href="/catalog"]')).toBeVisible();
});

test("mobile cart drawer uses the full viewport width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem("CHRISTMAS-TREES-cart", JSON.stringify([{ productId: 1, quantity: 1 }]));
  });
  await page.goto("/catalog");
  await page.locator(".cart-button").click();
  const Box = await page.locator(".cart-drawer").boundingBox();
  expect(Box?.x ?? -1).toBeLessThanOrEqual(1);
  expect(Box?.width ?? 0).toBeGreaterThanOrEqual(389);
});

test("phone catalog uses one product column", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalog");
  const Cards = page.locator(".catalog-grid .product-card");
  await expect(Cards.first()).toBeVisible();
  await expect(Cards.nth(1)).toBeVisible();
  const First = await Cards.first().boundingBox();
  const Second = await Cards.nth(1).boundingBox();
  expect(Math.abs((First?.x ?? 0) - (Second?.x ?? 0))).toBeLessThanOrEqual(2);
  expect((Second?.y ?? 0) - (First?.y ?? 0)).toBeGreaterThan(200);
});

test("reviews expose more than three cards and can scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const Reviews = page.locator(".reviews-track .review-card");
  expect(await Reviews.count()).toBeGreaterThan(3);
  const Track = page.locator(".reviews-track");
  const Before = await Track.evaluate((Element) => Element.scrollLeft);
  await page.locator(".reviews-controls button").last().click();
  await page.waitForTimeout(450);
  const After = await Track.evaluate((Element) => Element.scrollLeft);
  expect(After).toBeGreaterThan(Before);
});


test("product gallery opens a viewport-sized lightbox", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ProductRoute);
  await page.locator(".gallery-main-image").click();
  await expect(page.locator(".media-lightbox")).toBeVisible();
  const Box = await page.locator(".media-lightbox-dialog").boundingBox();
  expect(Box?.width ?? 0).toBeGreaterThanOrEqual(389);
  expect(Box?.height ?? 0).toBeGreaterThanOrEqual(843);
  await page.keyboard.press("Escape");
  await expect(page.locator(".media-lightbox")).toHaveCount(0);
});

test("photo reviews open in the shared lightbox", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const Photo = page.locator(".photo-review-card").first();
  await Photo.scrollIntoViewIfNeeded();
  await Photo.click();
  await expect(page.locator(".media-lightbox")).toBeVisible();
  await expect(page.locator(".media-lightbox-counter")).toContainText("1");
});

test("mobile product card keeps inner padding and variants inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(ProductRoute);
  const Info = await page.locator(".product-info").boundingBox();
  const Variant = await page.locator(".variant-button").last().boundingBox();
  expect(Info?.x ?? 0).toBeGreaterThanOrEqual(8);
  expect((Info?.x ?? 0) + (Info?.width ?? 0)).toBeLessThanOrEqual(352);
  expect((Variant?.x ?? 0) + (Variant?.width ?? 0)).toBeLessThanOrEqual((Info?.x ?? 0) + (Info?.width ?? 0));
});

test("desktop navigation includes home and stays above catalog content", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/catalog");
  const HomeLink = page.locator('.desktop-nav a[href="/"]');
  await expect(HomeLink).toBeVisible();
  const HeaderZIndex = await page.locator(".site-header").evaluate((Element) => Number.parseInt(getComputedStyle(Element).zIndex || "0", 10));
  const CardZIndex = await page.locator(".catalog-grid .product-card").first().evaluate((Element) => Number.parseInt(getComputedStyle(Element).zIndex || "0", 10) || 0);
  expect(HeaderZIndex).toBeGreaterThan(CardZIndex);
});

test("catalog sidebar never exposes a horizontal scrollbar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/catalog");
  const HorizontalOverflow = await page.locator(".catalog-sidebar").evaluate((Element) => Element.scrollWidth - Element.clientWidth);
  expect(HorizontalOverflow).toBeLessThanOrEqual(1);
});

test("closing a review photo lightbox preserves scroll position", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const Photo = page.locator(".photo-review-card").first();
  await Photo.scrollIntoViewIfNeeded();
  const Before = await page.evaluate(() => window.scrollY);
  await Photo.click();
  await expect(page.locator(".media-lightbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".media-lightbox")).toHaveCount(0);
  const After = await page.evaluate(() => window.scrollY);
  expect(Math.abs(After - Before)).toBeLessThanOrEqual(2);
});

test("mobile menu preferences are interactive and close control stays visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalog");
  await page.locator(".menu-button").click();
  await expect(page.locator(".mobile-menu-close")).toBeVisible();

  const LanguageControls = page.locator(".mobile-menu-bottom .segmented-control").first();
  await LanguageControls.getByRole("button", { name: "KZ" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "kk");
  await expect(LanguageControls.getByRole("button", { name: "KZ" })).toHaveAttribute("aria-pressed", "true");

  const CurrencyControls = page.locator(".mobile-menu-bottom .segmented-control").nth(1);
  await CurrencyControls.getByRole("button", { name: /RUB/ }).click();
  await expect(CurrencyControls.getByRole("button", { name: /RUB/ })).toHaveAttribute("aria-pressed", "true");

  await page.locator(".mobile-menu-close").click();
  await expect(page.locator(".mobile-menu")).not.toHaveClass(/is-open/);
});

test("mobile product storytelling follows the gallery before purchase controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ProductRoute);

  const Gallery = await page.locator(".product-gallery").boundingBox();
  const Story = await page.locator(".product-mosaic-story").boundingBox();
  const Purchase = await page.locator(".product-info").boundingBox();

  expect(Story?.y ?? 0).toBeGreaterThanOrEqual((Gallery?.y ?? 0) + (Gallery?.height ?? 0) - 2);
  expect(Purchase?.y ?? 0).toBeGreaterThanOrEqual((Story?.y ?? 0) + (Story?.height ?? 0) - 2);
});

test("product purchase controls do not use a separate tinted panel", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ProductRoute);
  const Background = await page.locator(".buy-box").evaluate((Element) => getComputedStyle(Element).backgroundColor);
  expect(Background).toBe("rgba(0, 0, 0, 0)");
});
