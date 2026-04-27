const { test, expect } = require("@playwright/test");

test.describe("Eisheilige 2026 site", () => {
  test("desktop homepage renders key content, SEO, and FAQ behavior", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Eisheilige 2026/i);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.locator("h1")).toHaveText(/Eisheiligen 2026/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /11\. bis 15\. Mai 2026/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://eisheilige2026.lol/");

    const heroPrimaryCta = page.locator('[data-testid="hero-primary-cta"]');
    await expect(heroPrimaryCta).toHaveAttribute("href", "https://graphify.homes/");

    await expect(page.locator(".timeline-card")).toHaveCount(5);
    await expect(page.locator(".source-card")).toHaveCount(4);

    const firstFaq = page.locator(".faq-item").first();
    await firstFaq.locator("summary").click();
    await expect(firstFaq.locator("p")).toBeVisible();

    const imagesLoaded = await page.evaluate(() =>
      Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)
    );
    expect(imagesLoaded).toBe(true);
  });

  test("mobile layout stays inside viewport and keeps navigation usable", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();
    await page.getByRole("link", { name: "Termine prüfen" }).click();
    await expect(page.locator("#termine")).toBeInViewport();

    await page.getByText("Menü").click();
    await expect(page.getByRole("link", { name: "FAQ" })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const faq = page.locator(".faq-item").nth(1);
    await faq.locator("summary").click();
    await expect(faq.locator("p")).toBeVisible();

    await context.close();
  });
});
