/* The library places each widget on its grid lines and the browser draws the
   grid: what it draws must be the packing the library computed, and the same
   order must stand in the document. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

/* The packing of the example's view, worked out by hand: [column, row] in
   twelve columns. */
const EXPECTED: Record<string, [number, number]> = {
  h1: [0, 0], f1: [0, 1], f2: [3, 1], f3: [6, 1], f4: [9, 1], h2: [0, 3], t1: [0, 4], t2: [8, 4], h3: [0, 8], o1: [0, 9], a1: [8, 9],
};

test("@quick the browser draws each widget where the library placed it, in the stored order", async ({ page }) => {
  await openExample(page, "dashboard", "dispatcher");
  const frames = page.locator('[data-example="dispatcher"] [data-widget]');
  expect(await frames.evaluateAll((els) => els.map((el) => el.getAttribute("data-widget")))).toEqual(Object.keys(EXPECTED));

  const grid = frames.first().locator("xpath=..");
  const gridBox = (await grid.boundingBox())!;
  const unit = (gridBox.width - 11 * 12) / 12;
  for (const [id, [column, row]] of Object.entries(EXPECTED)) {
    const box = (await page.locator(`[data-example="dispatcher"] [data-widget="${id}"]`).boundingBox())!;
    expect(box.x - gridBox.x, `${id} column`).toBeCloseTo(column * (unit + 12), 0);
    expect(box.y - gridBox.y, `${id} row`).toBeCloseTo(row * (50 + 12), 0);
  }
});
