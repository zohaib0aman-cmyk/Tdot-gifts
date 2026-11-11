import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.setItem("gs-cookie-consent", "all"));
});

test("home renders hero, sections and no horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Gifts that make");
  await expect(page.locator("#best-h")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("shop filters and search", async ({ page }) => {
  await page.goto("/shop?category=flowers");
  await expect(page.getByRole("heading", { name: "Flowers & Bouquets" })).toBeVisible();
  await page.getByLabel("Search the collection").fill("gajra");
  await expect(page.getByText(/1 gift/)).toBeVisible();
});

test("browse → cart → checkout → pay → confirmation → admin fulfils", async ({ page }) => {
  await page.goto("/product/pearl-rose-celebration-cake", { waitUntil: "networkidle" });
  await page.locator("#gift-msg").fill("Happy birthday!");
  await page.getByRole("button", { name: /Add to bag ·/ }).click();
  await expect(page.getByText("Added to your bag")).toBeVisible();
  await page.goto("/checkout");
  await page.locator("#co-email").fill(`e2e+${Date.now()}@example.com`);
  await page.locator("#co-firstName").fill("Test");
  await page.locator("#co-lastName").fill("Buyer");
  await page.locator("#co-line1").fill("1 Main St");
  await page.locator("#co-city").fill("Austin");
  await page.locator("#co-state").selectOption("TX");
  await page.locator("#co-zip").fill("78701");
  await page.getByRole("button", { name: /Continue to payment/ }).click();
  await page.locator("#cc-num").fill("4242 4242 4242 4242");
  await page.getByRole("button", { name: /^Pay \$/ }).click();
  await page.waitForURL(/checkout\/success/);
  await expect(page.getByText("Order confirmed")).toBeVisible();
  const number = (await page.getByText(/^Order GS-/).textContent())?.replace("Order ", "").trim();

  await page.goto("/admin/login");
  await page.locator("#ad-pw").fill(process.env.ADMIN_PASSWORD || "Surprise2026!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/admin$/);
  await page.goto("/admin/orders");
  await page.getByLabel("Search orders").fill(number ?? "");
  await page.getByRole("link", { name: number ?? "" }).first().click();
  await page.locator("#o-status").selectOption("shipped");
  await page.locator("#o-trk").fill("9400100000000000000000");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Order updated")).toBeVisible();
});

test("declined card shows failure screen", async ({ page }) => {
  await page.goto("/product/rose-swirl-cupcakes", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Add to bag ·/ }).click();
  await expect(page.getByText("Added to your bag")).toBeVisible();
  await page.goto("/checkout");
  await page.locator("#co-email").fill("decline@example.com");
  await page.locator("#co-firstName").fill("D");
  await page.locator("#co-lastName").fill("C");
  await page.locator("#co-line1").fill("9 Elm St");
  await page.locator("#co-city").fill("Miami");
  await page.locator("#co-state").selectOption("FL");
  await page.locator("#co-zip").fill("33130");
  await page.getByRole("button", { name: /Continue to payment/ }).click();
  await page.locator("#cc-num").fill("4000 0000 0000 0002");
  await page.getByRole("button", { name: /^Pay \$/ }).click();
  await page.waitForURL(/checkout\/failed/);
  await expect(page.getByText("nothing was charged")).toBeVisible();
});

test("admin routes are protected", async ({ request, page }) => {
  const r = await request.post("/api/admin/settings", { data: {} });
  expect(r.status()).toBe(401);
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/admin\/login/);
});
