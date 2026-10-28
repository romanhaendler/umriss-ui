/* The dashboard's cards stand flush with its own edge - and so with whatever
   block stands above it - while not editing; and stay put in the mode,
   where the accent frame stands outside them. Chromium only; light only. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

test("@quick The first card starts at the dashboard's edge, and stays there in the mode", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await openExample(page, "dashboard", "dispatcher");
  const root = page.locator('[data-example="dispatcher"] [role="group"]').first();
  const card = root.locator("[data-widget]").nth(1);
  await card.waitFor({ state: "visible" });
  const left = async () => ({ root: (await root.boundingBox())!.x, card: (await card.boundingBox())!.x });
  const rest = await left();
  expect(rest.card).toBeCloseTo(rest.root, 0);
  await root.getByRole("button", { name: "Edit" }).click();
  await expect(root).toHaveAttribute("data-editing", "");
  const editing = await left();
  expect(editing).toEqual(rest);
});
