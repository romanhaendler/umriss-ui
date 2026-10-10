/* Density (calculation-density, ADR-0051): a compact calculation's lines
   stand as close as a compact table's rows (ADR-0042) - measured on the
   rendered example, since jsdom has no layout. */

import { existsSync } from "node:fs";
import { test, expect, webkit } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

/** What a compact table's row measures under a fine pointer, and under a
    finger (ADR-0042) - the height a compact line that says one thing takes. */
const COMPACT = 27;
const COMPACT_FINGER = 35;

const CAPTIONS = {
  regular: "Without a statement: regular",
  compact: 'density="compact"',
  provider: "From the UmrissProvider: compact",
  ownRegular: 'density="regular" under that provider: regular',
} as const;

const calculation = (page: Page, caption: string) => page.getByRole("list", { name: `Downtime of Checkout in March, ${caption}` });
const height = async (where: Locator) => (await where.boundingBox())!.height;

/** The heights of a calculation's lines above the Result - one with a
    disclosure, one with a verdict, one with neither - and of the whole
    statement, the Result included. */
const measured = async (page: Page, caption: string) => {
  const list = calculation(page, caption);
  const items = list.getByRole("listitem");
  /* The first item is the statement itself; its operands follow. */
  await expect(items).toHaveCount(4);
  return {
    lines: [await height(items.nth(1)), await height(items.nth(2)), await height(items.nth(3))],
    whole: await height(list),
  };
};

/** Every line of both compact calculations - its own density and the
    provider's - is that tall: four lines each, so the Result as well. */
const expectCompactLines = async (page: Page, tall: number) => {
  for (const caption of [CAPTIONS.compact, CAPTIONS.provider]) {
    const { lines, whole } = await measured(page, caption);
    expect(lines, caption).toEqual([tall, tall, tall]);
    expect(whole, caption).toBe(4 * tall);
  }
};

test("a compact calculation's lines are as tall as a compact table's rows, from its own density or the provider's", async ({ page }) => {
  await openExample(page, "calculation", "density");
  await expectCompactLines(page, COMPACT);
});

test("without a statement a calculation is regular, and its own density wins over the provider's", async ({ page }) => {
  await openExample(page, "calculation", "density");
  const regular = await measured(page, CAPTIONS.regular);
  expect(regular.lines[0]).toBeGreaterThan(COMPACT);
  expect(await measured(page, CAPTIONS.ownRegular)).toEqual(regular);
});

test("a compact line that is clicked stays where it is, its derivation opens line by line at the same height, and every number ends on one edge", async ({ page }) => {
  await openExample(page, "calculation", "density");
  const list = calculation(page, CAPTIONS.compact);
  const closed = await height(list);
  const button = list.getByRole("button", { name: "Show how Unplanned outages is derived" });
  const before = await button.boundingBox();
  await button.click();
  const opened = list.getByRole("button", { name: "Hide how Unplanned outages is derived" });
  expect((await opened.boundingBox())!.y).toBe(before!.y);
  /* Two operands and the line that closes on "= Unplanned outages". */
  await expect(list.getByText("= Unplanned outages")).toBeVisible();
  expect(await height(list)).toBe(closed + 3 * COMPACT);
  /* At every depth, the Result's larger number included. */
  const rights = new Set<number>();
  for (const number of ["29", "11", "18", "24", "12", "65"]) {
    const box = (await list.getByText(number, { exact: true }).first().boundingBox())!;
    rights.add(box.x + box.width);
  }
  expect([...rights]).toHaveLength(1);
});

test("narrow, a compact verdict moves beneath its label and is drawn in full", async ({ page }) => {
  await openExample(page, "calculation", "density");
  const list = calculation(page, CAPTIONS.compact);
  /* The frame is the list's parent; it measures its own width, not the window's. */
  await list.evaluate((el) => void (el.parentElement!.style.width = "400px"));
  const label = (await list.getByText("Maintenance window", { exact: true }).boundingBox())!;
  const verdict = list.getByText("Warning limit exceeded", { exact: true });
  const badge = (await verdict.boundingBox())!;
  expect(badge.y).toBeGreaterThan(label.y + label.height / 2);
  /* The cell it stands in cuts what reaches past it. */
  const cell = (await verdict.locator("..").boundingBox())!;
  expect(badge.y).toBeGreaterThanOrEqual(cell.y);
  expect(badge.y + badge.height).toBeLessThanOrEqual(cell.y + cell.height);
});

/* The suite runs in Chromium; a whole-pixel line is the point (ADR-0042:
   each engine rounded the half its own way), so another engine is asked
   once - where it is installed: the first run sets up Chromium alone
   (CONTRIBUTING.md). Not Firefox yet: Playwright's build of it (153, v1538)
   hung on launch under macOS 27 when this was written. */
test("in WebKit too, a compact calculation's lines are as tall as a compact table's rows", async ({ baseURL }) => {
  test.skip(!existsSync(webkit.executablePath()), "WebKit is not installed: npx playwright install webkit");
  const browser = await webkit.launch();
  try {
    const page = await browser.newPage({ baseURL, viewport: { width: 1280, height: 900 } });
    await openExample(page, "calculation", "density");
    await expectCompactLines(page, COMPACT);
  } finally {
    await browser.close();
  }
});

test.describe("under a finger", () => {
  test.use({ hasTouch: true });

  test("a compact calculation's lines keep their type and take the regular room, as a compact table's rows do", async ({ page }) => {
    await openExample(page, "calculation", "density");
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    await expectCompactLines(page, COMPACT_FINGER);
  });
});
