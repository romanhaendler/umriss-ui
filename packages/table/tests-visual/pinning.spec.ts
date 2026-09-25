/* Pinned columns scrolled (table-column-pinning 01), light and dark through the
   projects. The resting picture stands in `screenshots.spec.ts` - the end
   block's shadow already shows there, since the hours lie under it. Here stand
   the states a resting picture cannot show: scrolled into the middle (both
   shadows), to the end (only the start block's), and grouped, where a group
   header's label and aggregates stick in their blocks. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const ID = "pinned-both-sides";
const shot = (name: string, project: string) => `pinning-${name}-${project}.png`;

async function scrollTo(page: Page, where: "middle" | "end") {
  const area = page.locator(`[data-example="${ID}"] table`).locator("..");
  await area.evaluate((el, to) => {
    el.scrollLeft = to === "end" ? el.scrollWidth : 240;
  }, where);
  await expect(area).toHaveAttribute("data-under-start", "");
  return area;
}

test("scrolled into the middle: both blocks stay, both shadows show", async ({ page }, info) => {
  await openExample(page, "column", ID);
  const area = await scrollTo(page, "middle");
  await expect(area).toHaveAttribute("data-under-end", "");
  await expect(page.locator(`[data-example="${ID}"]`)).toHaveScreenshot(shot("middle", info.project.name));
});

test("scrolled to the end: nothing lies under the end block, its shadow is gone", async ({ page }, info) => {
  await openExample(page, "column", ID);
  const area = await scrollTo(page, "end");
  await expect(area).not.toHaveAttribute("data-under-end", "");
  await expect(page.locator(`[data-example="${ID}"]`)).toHaveScreenshot(shot("end", info.project.name));
});

test("the column menu with a column pinned to each side (table-column-pinning 02)", async ({ page }, info) => {
  await openExample(page, "column", ID);
  await page.locator(`[data-example="${ID}"]`).getByRole("button", { name: "Columns" }).click();
  const menu = page.getByRole("dialog", { name: "Show, hide and arrange columns" });
  await expect(menu.getByRole("button", { name: "Unpin Machine" })).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(menu).toHaveScreenshot(shot("menu", info.project.name));
});

test("grouped and scrolled: a group header's label and aggregates stick in their blocks", async ({ page }, info) => {
  await openExample(page, "column", ID);
  const table = page.locator(`[data-example="${ID}"]`);
  await table.getByRole("button", { name: "Columns" }).click();
  await page.getByRole("button", { name: "Group by Area" }).click();
  await page.keyboard.press("Escape");
  await expect(table.locator("tbody tr[data-line='header']")).toHaveCount(4);
  await scrollTo(page, "middle");
  await expect(table).toHaveScreenshot(shot("grouped", info.project.name));
});
