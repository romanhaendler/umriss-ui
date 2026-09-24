/* The matrix of the grouped table (table-grouping 07), light and dark through
   the projects. The resting state of every example already stands in
   `screenshots.spec.ts`; here stand the states a resting picture does not
   show - hover on every line kind, a fold with the focus on it, a sticky header
   while its group scrolls, a page that begins inside a group, the phone width
   and the reduced motion. Each picture is taken after the motion has settled:
   the durations are set to zero, as `prefers-reduced-motion` sets them. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const example = (page: Page, id: string) => page.locator(`[data-example="${id}"]`);
const shot = (name: string, project: string) => `grouping-${name}-${project}.png`;

test("hover on a group header, a row and a span", async ({ page }, info) => {
  await openExample(page, "grouping", "two-levels");
  const table = example(page, "two-levels");
  await table.locator("tbody tr[data-line='header']").first().hover();
  await expect(table).toHaveScreenshot(shot("hover-header", info.project.name));
  await table.locator("tbody tr[data-line='row']").nth(1).hover();
  await expect(table).toHaveScreenshot(shot("hover-row", info.project.name));
});

test("a folded span and a folded header, the focus on the fold", async ({ page }, info) => {
  await openExample(page, "grouping", "two-levels");
  const table = example(page, "two-levels");
  await table.getByRole("button", { name: "Fold Otto & Söhne, 3" }).click();
  const header = table.getByRole("button", { name: "Fold Line 3, 3" });
  await header.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(table.getByRole("button", { name: "Unfold Line 3, 3" })).toBeFocused();
  await expect(table).toHaveScreenshot(shot("folded-focus", info.project.name));
});

test("everything folded is a summary", async ({ page }, info) => {
  await openExample(page, "grouping", "the-overview");
  const table = example(page, "the-overview");
  await table.getByRole("button", { name: "Fold all", exact: true }).click();
  await expect(table).toHaveScreenshot(shot("all-folded", info.project.name));
});

test("three levels, compact, selected in part", async ({ page }, info) => {
  await openExample(page, "grouping", "compact-and-long-values");
  const table = example(page, "compact-and-long-values");
  /* The box's input is visually hidden under the drawn box; it is reached as a
     keyboard user reaches it. */
  await table.getByRole("checkbox", { name: "Select M-4417" }).focus();
  await page.keyboard.press("Space");
  await expect(table.getByRole("checkbox", { name: "Select M-4417" })).toBeChecked();
  await expect(table).toHaveScreenshot(shot("compact-partial", info.project.name));
});

test("a sticky group header while its group scrolls", async ({ page }, info) => {
  await openExample(page, "grouping", "the-shift-report");
  const table = example(page, "the-shift-report");
  await table.locator("table").evaluate((el) => {
    el.parentElement!.scrollTop = 150;
  });
  await expect(table.locator("tbody tr[data-stuck]")).toHaveCount(1);
  await expect(table).toHaveScreenshot(shot("sticky", info.project.name));
});

test("a page that begins inside a group", async ({ page }, info) => {
  await openExample(page, "grouping", "paging");
  const table = example(page, "paging");
  await table.getByRole("button", { name: "Next" }).click();
  await expect(table.locator("tbody tr[data-continued]")).toHaveCount(1);
  await expect(table).toHaveScreenshot(shot("continued", info.project.name));
});

test.describe("at the phone's width", () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test("two levels", async ({ page }, info) => {
    await openExample(page, "grouping", "two-levels");
    await expect(example(page, "two-levels")).toHaveScreenshot(shot("phone", info.project.name));
  });
});
