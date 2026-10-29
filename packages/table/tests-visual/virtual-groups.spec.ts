/* A virtual table with column groups in the browser: both head rows stay in the
   sticky head, the rows keep their numbers while the window moves. Run against
   the example "Column groups over virtual rows". */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark", "Layout only once (light)");
});

test("both head rows stick, and the rows keep their numbers when scrolled", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "virtualisation", "groups-over-virtual-rows");
  const example = page.locator('[data-example="groups-over-virtual-rows"]');
  const table = example.locator("table");
  await expect(table).toHaveAttribute("aria-rowcount", "2002");
  await expect(table.locator("thead tr")).toHaveCount(2);
  await expect(table.locator("thead tr").nth(0)).toHaveAttribute("aria-rowindex", "1");
  await expect(table.locator("thead tr").nth(1)).toHaveAttribute("aria-rowindex", "2");
  await expect(table.locator("tbody tr[data-row]").first()).toHaveAttribute("aria-rowindex", "3");

  const area = table.locator("..");
  await area.evaluate((el) => {
    el.scrollTop = el.scrollHeight / 2;
  });
  await expect(async () => {
    const first = Number(await table.locator("tbody tr[data-row]").first().getAttribute("data-row"));
    expect(first).toBeGreaterThan(100);
    await expect(table.locator(`tbody tr[data-row="${first}"]`)).toHaveAttribute("aria-rowindex", String(first + 3));
  }).toPass();

  const group = (await table.getByRole("columnheader", { name: "Week 1" }).boundingBox())!;
  const mon = (await table.getByRole("columnheader", { name: "Mon" }).boundingBox())!;
  const areaBox = (await area.boundingBox())!;
  expect(Math.abs(group.y - areaBox.y)).toBeLessThan(2);
  expect(Math.abs(mon.y - (group.y + group.height))).toBeLessThan(2);
});
