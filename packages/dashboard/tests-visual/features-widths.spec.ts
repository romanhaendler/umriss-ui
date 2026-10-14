/* The same arrangement at every width the grid has room for, a list below it,
   and a maximum width above. The width is the dashboard's own: the stage it
   stands in is set to it on a window wider than any of them, so that the demo
   shell's own column does not decide.*/

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

const GAP = 12;

/** Opens the example with its stage `width` px wide; hands back each widget's
    box and the grid's. */
async function openAt(page: Page, width: number) {
  await page.setViewportSize({ width: 3000, height: 1200 });
  await openExample(page, "dashboard", "dispatcher");
  await page.addStyleTag({ content: `[class*="exampleStage"] { width: ${width}px !important; max-width: none !important; padding: 0 !important; }` });
  const frames = page.locator('[data-example="dispatcher"] [data-widget]');
  const grid = (await frames.first().locator("xpath=..").boundingBox())!;
  const list = await frames.evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.getAttribute("data-widget")!, x: r.x, y: r.y, width: r.width };
    }),
  );
  return { grid, list };
}

/** Every widget's place in columns and rows of the grid: who its neighbours are. */
async function places(page: Page, width: number) {
  const { grid, list } = await openAt(page, width);
  const unit = (grid.width - 11 * GAP) / 12;
  return { grid, places: list.map(({ id, x, y }) => `${id}:${Math.round((x - grid.x) / (unit + GAP))},${Math.round((y - grid.y) / (50 + GAP))}`) };
}

test("@quick at 1280, 1920 and 2560 px every widget has the same neighbours; the dashboard stops at its maximum width", async ({ page }) => {
  const at1280 = await places(page, 1280);
  const at1920 = await places(page, 1920);
  const at2560 = await places(page, 2560);
  expect(at1920.places).toEqual(at1280.places);
  expect(at2560.places).toEqual(at1280.places);
  expect(at1280.grid.width).toBeCloseTo(1280, 0);
  expect(at1920.grid.width).toBeCloseTo(1560, 0);
  expect(at2560.grid.width).toBeCloseTo(1560, 0);
  /* It stands at the start of its container, not in the middle. */
  expect(at2560.grid.x).toBe(at1920.grid.x);
});

test("@quick at 820 px the dashboard is still the grid", async ({ page }) => {
  const { places: at820 } = await places(page, 820);
  expect(at820.slice(0, 2)).toEqual(["f1:0,0", "f2:3,0"]);
});

test("@quick at 390 px the dashboard is a list in the stored order", async ({ page }) => {
  const { grid, list } = await openAt(page, 390);
  expect(list.map((one) => one.id)).toEqual(["f1", "f2", "f3", "f4", "t1", "a1", "t2", "o1"]);
  for (const one of list) {
    expect(one.x, one.id).toBeCloseTo(grid.x, 0);
    expect(one.width, one.id).toBeCloseTo(grid.width, 0);
  }
  const ys = list.map((one) => one.y);
  expect([...ys].sort((a, b) => a - b)).toEqual(ys);
  expect(new Set(ys).size).toBe(ys.length);
});
