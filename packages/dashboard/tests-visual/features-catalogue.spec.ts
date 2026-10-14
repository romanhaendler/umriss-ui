/* An added widget stands at the end of the dashboard and is brought into view. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

test("an added widget is brought into view", async ({ page }) => {
  await openExample(page, "dashboard", "dispatcher");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Add widget" }).click();
  await page.getByRole("button", { name: "Add Open alerts" }).click();
  await page.keyboard.press("Escape");
  const last = page.locator('[data-example="dispatcher"] [data-widget]').last();
  await expect(last).toHaveAttribute("data-widget", "alerts-1");
  await expect(last).toBeInViewport();
});
