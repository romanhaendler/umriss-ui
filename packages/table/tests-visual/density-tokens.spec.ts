/* The table's rows follow the type, space and small-control tokens an
   application sets on :root - not a fixed 36 and 27 px. Measured on the
   rendered example, since jsdom has no layout. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

const SETS = {
  none: "",
  dense: ":root { --u-text-sm: 0.75rem; --u-text-xs: 0.625rem; --u-space-1: 0.125rem; --u-space-2: 0.25rem; --u-control-height-sm: 1rem; }",
  roomy: ":root { --u-text-sm: 1rem; --u-text-xs: 0.875rem; --u-space-1: 0.375rem; --u-space-2: 0.75rem; --u-control-height-sm: 1.75rem; }",
} as const;

/** The heights of every line - head and rows, and a footer where there is one - of the regular and the compact table. */
const lines = async (page: Page, tokens: string) => {
  await openExample(page, "row-appearance", "density");
  if (tokens) await page.addStyleTag({ content: tokens });
  const measure = (label: string) =>
    page.getByRole("table", { name: label }).locator("tr").evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height));
  return { regular: await measure("Services, Without a statement: regular"), compact: await measure('Services, density="compact"') };
};

const same = (heights: number[]) => new Set(heights).size === 1;

test("the default tokens keep a regular line at 36 px and a compact one at 27 px", { tag: "@quick" }, async ({ page }) => {
  const { regular, compact } = await lines(page, SETS.none);
  expect(regular.every((h) => h === 36)).toBe(true);
  expect(compact.every((h) => h === 27)).toBe(true);
});

test("a dense set of tokens shortens every line, a roomy one lengthens it, to a whole pixel and equally", { tag: "@quick" }, async ({ page }) => {
  const base = await lines(page, SETS.none);
  const dense = await lines(page, SETS.dense);
  const roomy = await lines(page, SETS.roomy);
  for (const kind of ["regular", "compact"] as const) {
    for (const set of [dense[kind], roomy[kind]]) {
      expect(same(set), kind).toBe(true);
      expect(Number.isInteger(set[0]), kind).toBe(true);
    }
    expect(dense[kind][0]!, kind).toBeLessThan(base[kind][0]!);
    expect(roomy[kind][0]!, kind).toBeGreaterThan(base[kind][0]!);
  }
});

test("a footer row is as tall as the head and the rows, under every set", { tag: "@quick" }, async ({ page }) => {
  for (const tokens of Object.values(SETS)) {
    await openExample(page, "aggregate", "sum-and-average");
    if (tokens) await page.addStyleTag({ content: tokens });
    const heights = await page.getByRole("table", { name: "Tours" }).locator("tfoot tr, thead tr, tbody tr").evaluateAll((rows) =>
      rows.map((row) => row.getBoundingClientRect().height),
    );
    expect(heights.length).toBeGreaterThan(2);
    expect(same(heights), tokens).toBe(true);
  }
});

test.describe("under a finger", () => {
  test.use({ hasTouch: true });

  test("a compact line stays 35 px at the default tokens", { tag: "@quick" }, async ({ page }) => {
    const { compact } = await lines(page, SETS.none);
    expect(compact.every((h) => h === 35)).toBe(true);
  });
});
