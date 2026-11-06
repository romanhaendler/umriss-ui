/* Every example of the demo, driven through the head's states (sorted up and
   down, a multi-sort with ranks, every resizable column at its least width);
   after each state every head is measured and every rule is applied to it. A
   rule is one entry of RULES: it gets a head's parts and returns what is off. */

import { test, type Locator } from "@playwright/test";
import { EXAMPLE_ADDRESSES } from "./pages";
import { openExample } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark", "Layout only once (light)");
});

type Box = { left: number; right: number; top: number; bottom: number };
/** One head: its cell and the parts that stand in it (absent parts are null). */
type Head = {
  name: string;
  cell: Box;
  parts: { label: Box | null; rank: Box | null; arrow: Box | null; sortButton: Box | null };
};
/** A rule returns one line per miss: part and distance in px. */
type Rule = (head: Head) => string[];

const TOLERANCE = 0.5;

const RULES: Rule[] = [
  /* The sort button, its focus ring with it, ends within its cell's edges. */
  ({ cell, parts: { sortButton: b } }) => {
    if (!b) return [];
    const out: string[] = [];
    if (cell.left - b.left > TOLERANCE) out.push(`sort button reaches ${(cell.left - b.left).toFixed(1)}px past the cell's left edge`);
    if (b.right - cell.right > TOLERANCE) out.push(`sort button reaches ${(b.right - cell.right).toFixed(1)}px past the cell's right edge`);
    return out;
  },
];

/** Every head of the example with the boxes of its parts. */
const measure = (root: Locator): Promise<Head[]> =>
  root.evaluate((el) => {
    const box = (e: Element | null) => {
      const r = e?.getBoundingClientRect();
      return r && r.width > 0 ? { left: r.left, right: r.right, top: r.top, bottom: r.bottom } : null;
    };
    return Array.from(el.querySelectorAll<HTMLTableCellElement>("thead th")).flatMap((th) => {
      const cell = box(th);
      if (!cell) return [];
      const label = th.querySelector('[class*="headLabel"]');
      return [
        {
          name: (label?.textContent ?? th.textContent ?? "").trim() || "(blank)",
          cell,
          parts: {
            label: box(label),
            rank: box(th.querySelector('[class*="sortRank"]')),
            arrow: box(th.querySelector('[class*="sortIndicator"] svg')),
            sortButton: box(th.querySelector('[class*="sortButton"]')),
          },
        },
      ];
    });
  });

for (const { pageId, exampleId, name } of EXAMPLE_ADDRESSES) {
  test(name, async ({ page }) => {
    const faults = new Set<string>();
    const ex = page.locator(`[data-example="${exampleId}"]`);
    const check = async (state: string) => {
      for (const head of await measure(ex)) for (const rule of RULES) for (const f of rule(head)) faults.add(`${state} | "${head.name}": ${f}`);
    };
    await openExample(page, pageId, exampleId);
    if ((await ex.locator("table thead").count()) === 0) return;

    await check("initial");
    const sorts = ex.locator('thead th[aria-sort] button[class*="sortButton"]');
    const n = await sorts.count();
    for (let i = 0; i < n; i++) {
      await sorts.nth(i).click().catch(() => {});
      await check("sorted ascending");
      await sorts.nth(i).click().catch(() => {});
      await check("sorted descending");
    }
    for (let i = 0; i < n; i++) await sorts.nth(i).click({ modifiers: ["Shift"] }).catch(() => {});
    await check("multi-sort with ranks");

    const grips = ex.locator('thead th [class*="grip"]');
    const g = await grips.count();
    for (let i = 0; i < g; i++) {
      const b = await grips.nth(i).boundingBox();
      if (!b) continue;
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      await page.mouse.move(b.x - 600, b.y + b.height / 2, { steps: 4 });
      await page.mouse.up();
    }
    if (g) await check("all columns at their least width");

    if (faults.size) throw new Error(`${name}:\n${[...faults].join("\n")}`);
  });
}
