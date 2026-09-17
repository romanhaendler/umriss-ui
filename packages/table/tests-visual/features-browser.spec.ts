/* What jsdom could not prove (table-demo, Testing Decisions).

   `umriss-table` moved these guarantees to "the package's demo": jsdom knows no
   layout, no real focus movement and no computed colour. Here they become facts
   – does the row header really stick, is the gesture really quiet, does the
   focus really stay, and does the column menu really move what stands on the
   screen. Only in the light project. */

import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const example = (page: Page, id: string) => page.locator(`[data-example="${id}"]`);
const x = async (where: Locator) => (await where.boundingBox())!.x;

/* ---------------- The sticky row header sticks (umriss-table 10) ---------------- */

test("the row header sticks while scrolling sideways, behind selection and expander, and nothing covers it", async ({ page }) => {
  await openExample(page, "table", "sticky-parts");
  const table = example(page, "sticky-parts");
  const area = table.locator("table").locator("..");
  const first = table.locator("tbody tr").first();
  const selection = first.locator("td").nth(0);
  const expander = first.locator("td").nth(1);
  const header = first.locator("th[scope='row']");

  expect(await area.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(200);
  const before = { selection: await x(selection), expander: await x(expander), header: await x(header) };

  await area.evaluate((el) => {
    el.scrollLeft = 300;
  });

  expect(Math.abs((await x(selection)) - before.selection)).toBeLessThan(1);
  expect(Math.abs((await x(expander)) - before.expander)).toBeLessThan(1);
  expect(Math.abs((await x(header)) - before.header)).toBeLessThan(1);

  // Behind the two control cells, not over them.
  const expanderBox = (await expander.boundingBox())!;
  expect(await x(header)).toBeGreaterThanOrEqual(expanderBox.x + expanderBox.width - 1);

  // The cell "Line" has wandered underneath it – and lies under it.
  const line = first.locator("td").nth(2);
  const headerBox = (await header.boundingBox())!;
  expect((await line.boundingBox())!.x).toBeLessThan(headerBox.x);
  const onTop = await page.evaluate(
    ({ px, py }) => document.elementFromPoint(px, py)?.closest("th, td")?.getAttribute("scope") ?? null,
    { px: headerBox.x + headerBox.width / 2, py: headerBox.y + headerBox.height / 2 },
  );
  expect(onTop).toBe("row");
});

/* ---------------- The quiet gesture (umriss-table 09) ---------------- */

test("a row action rests in the secondary type and stands in the accent when its row is meant", async ({ page }) => {
  await openExample(page, "rowactions", "row-actions");
  const table = example(page, "row-actions");

  /* The colours of the tokens, resolved by the browser – not copied out. */
  const colorOf = (token: string) =>
    page.evaluate((t) => {
      const probe = document.createElement("span");
      probe.style.color = `var(${t})`;
      document.body.appendChild(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    }, token);
  const resting = await colorOf("--u-color-text-secondary");
  const accent = await colorOf("--u-color-accent-text");
  expect(resting).not.toBe(accent);

  const colorOfLocator = (where: Locator) => where.evaluate((el) => getComputedStyle(el).color);
  const open = table.getByRole("button", { name: "Open: A-2041" });
  const other = table.getByRole("button", { name: "Open: A-2043" });

  await page.mouse.move(0, 0);
  await expect.poll(() => colorOfLocator(open)).toBe(resting);

  await table.locator("tbody tr").first().locator("th").hover();
  await expect.poll(() => colorOfLocator(open)).toBe(accent);
  await expect.poll(() => colorOfLocator(other)).toBe(resting);

  await page.mouse.move(0, 0);
  await table.getByRole("button", { name: "Duplicate: A-2043" }).focus();
  await expect.poll(() => colorOfLocator(other)).toBe(accent);
  await expect.poll(() => colorOfLocator(open)).toBe(resting);
});

/* ---------------- The focus in the column menu (umriss-table 08) ---------------- */

test("after “move forward” the focus stands on the button of the column that moved, at the end of the list on its neighbour", async ({ page }) => {
  await openExample(page, "columnmenu", "show-hide-and-order");
  await example(page, "show-hide-and-order").getByRole("button", { name: "Columns" }).click();
  const menu = page.getByRole("dialog", { name: "Show, hide and arrange columns" });

  /* The element wanders to its new place in the DOM, and an element that has
     been moved loses the focus in the browser – exactly what jsdom cannot do. */
  await menu.getByRole("button", { name: "Move Quantity forward" }).click();
  await expect(menu.getByRole("button", { name: "Move Quantity forward" })).toBeFocused();

  /* Once more: Quantity now stands directly behind the sticky row header, "move
     forward" is disabled, and the focus goes to "move backward". */
  await page.keyboard.press("Enter");
  await expect(menu.getByRole("button", { name: "Move Quantity forward" })).toBeDisabled();
  await expect(menu.getByRole("button", { name: "Move Quantity backward" })).toBeFocused();
});

/* ---------------- The download (umriss-table 08) ---------------- */

test("Export downloads orders.csv, and in it stands the filtered set in the visible order", async ({ page }) => {
  await openExample(page, "export", "download");
  const table = example(page, "download");
  await table.getByPlaceholder("Search customer").fill("North");
  await table.getByRole("columnheader", { name: "Quantity" }).getByRole("button", { name: "Quantity", exact: true }).click();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    table.getByRole("button", { name: "Export" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("orders.csv");

  const text = (await readFile((await download.path())!, "utf8")).replace(/^﻿/, "");
  expect(text.trim().split(/\r?\n/)).toEqual([
    "Order;Customer;Quantity;Price",
    "A-2044;Northplate;310;2215,8",
    "A-2043;Northworks;1250;9870,25",
  ]);
});

/* ---------------- The error this package exists for ---------------- */

test("reordering in the column menu moves head, body and foot on the screen", async ({ page }) => {
  await openExample(page, "columnmenu", "show-hide-and-order");
  const table = example(page, "show-hide-and-order");
  const amountHeader = table.getByRole("columnheader", { name: "Quantity" });
  const lineHeader = table.getByRole("columnheader", { name: "Line" });
  const amountCell = table.locator("tbody tr").first().getByRole("cell", { name: "120", exact: true });
  const sum = table.locator("tfoot [data-footer='sum']");

  expect(await x(amountHeader)).toBeGreaterThan(await x(lineHeader));

  await table.getByRole("button", { name: "Columns" }).click();
  await page.getByRole("button", { name: "Move Quantity forward" }).click();
  await page.keyboard.press("Escape");

  /* Not only in the model: on the screen, in all three parts. */
  expect(await x(amountHeader)).toBeLessThan(await x(lineHeader));
  expect(Math.abs((await x(amountCell)) - (await x(amountHeader)))).toBeLessThan(1);
  expect(Math.abs((await x(sum)) - (await x(amountHeader)))).toBeLessThan(1);
});
