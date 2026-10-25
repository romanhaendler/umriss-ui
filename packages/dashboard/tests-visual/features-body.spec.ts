/* The editing mode takes nothing from a widget's body: every body is as tall
   and as wide after "Edit" as at rest, in the grid and in the list. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

const example = (page: Page) => page.locator('[data-example="dispatcher"]');

/** Every card's body (the child that is inert in the mode) by widget id, as width x height. */
const bodies = (page: Page) =>
  example(page).locator("[data-widget]").evaluateAll((els) =>
    els.flatMap((el) => {
      const body = [...el.children].find((child) => child.className.includes("body"));
      if (!body) return [];
      const { width, height } = body.getBoundingClientRect();
      return [`${el.getAttribute("data-widget")}: ${width.toFixed(1)} x ${height.toFixed(1)}`];
    }),
  );

for (const width of [1280, 390]) {
  test(`@quick at ${width} px every widget body has the same size at rest and in the editing mode`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openExample(page, "dashboard", "dispatcher");
    const rest = await bodies(page);
    expect(rest.length).toBeGreaterThan(0);
    await example(page).getByRole("button", { name: "Edit" }).click();
    await expect(example(page).locator("[data-widget][data-editing]").first()).toBeVisible();
    expect(await bodies(page)).toEqual(rest);
  });
}

test("@quick under other spacing tokens every widget body still keeps its size in the editing mode", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await openExample(page, "dashboard", "dispatcher");
  await page.addStyleTag({ content: ":root { --u-space-1: 6px; --u-space-2: 10px }" });
  const rest = await bodies(page);
  expect(rest.length).toBeGreaterThan(0);
  await example(page).getByRole("button", { name: "Edit" }).click();
  await expect(example(page).locator("[data-widget][data-editing]").first()).toBeVisible();
  expect(await bodies(page)).toEqual(rest);
});
