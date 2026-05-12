import {
  expect,
  test,
} from "@playwright/test";

test("homepage redirects anonymous visitors to login", async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("404 (Not Found)") &&
      !message.text().includes("/_next/webpack-hmr")
    ) {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);

  await expect(
    page.getByRole("heading", {
      name: "NearbyNow",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: "Continue with Google",
    }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("buyer protected pages redirect anonymous visitors to login", async ({
  page,
}) => {
  await page.goto("/orders");

  await expect(page).toHaveURL(/\/login$/);
});

test("seller portal redirects anonymous visitors to login", async ({ page }) => {
  await page.goto("/seller/orders");

  await expect(page).toHaveURL(/\/login$/);
});

test("buyer profile route redirects anonymous visitors to login", async ({
  page,
}) => {
  await page.goto("/buyer");

  await expect(page).toHaveURL(/\/login$/);
});
