/* Under `touch-scale.css` the `sm` controls of the table grow with `md`
   (ADR-0079): the toolbar's Search and Columns and the pagination measure
   44 px; without the stylesheet they keep their 26 px. The address
   `?touch-scale` has the shell's switch, and so the stylesheet, on. Chromium
   only; light only. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { addressOf } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

const heightsOf = async (page: Page, pageId: string, exampleId: string, scaled: boolean, pick: (stage: Locator) => Locator[]) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await page.goto(addressOf(pageId, exampleId).replace("#", scaled ? "?touch-scale#" : "#"));
  await page.evaluate(() => document.fonts.ready);
  const stage = page.locator(`[data-example="${exampleId}"] .exampleStage`);
  await stage.waitFor({ state: "visible" });
  const found: number[] = [];
  for (const control of pick(stage)) found.push(Math.round((await control.boundingBox())!.height));
  return found;
};

const toolbar = (stage: Locator) => [stage.getByRole("searchbox").first(), stage.getByRole("button", { name: "Columns" }).first()];
const pagination = (stage: Locator) => [stage.getByRole("button", { name: /next/i }).first(), stage.getByRole("button", { name: /previous/i }).first()];

test("the toolbar's Search and Columns are 44 px with the opt-in, 26 px without", { tag: "@quick" }, async ({ page }) => {
  expect(await heightsOf(page, "toolbar", "search-arrange-and-export", false, toolbar)).toEqual([26, 26]);
  expect(await heightsOf(page, "toolbar", "search-arrange-and-export", true, toolbar)).toEqual([44, 44]);
});

test("the pagination's buttons are 44 px with the opt-in, 26 px without", { tag: "@quick" }, async ({ page }) => {
  expect(await heightsOf(page, "pagination", "page-through-shipments", false, pagination)).toEqual([26, 26]);
  expect(await heightsOf(page, "pagination", "page-through-shipments", true, pagination)).toEqual([44, 44]);
});
