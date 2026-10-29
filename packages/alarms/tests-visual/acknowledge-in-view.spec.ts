/* "Acknowledge all" without a selection counts the rows inside the list's
   visible area: a list scrolled half way names the rows that stand in view,
   not the forty it holds. jsdom has no layout, so this is the browser's. */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES } from "./pages";
import { openExample } from "./navigation";

const TRIP = EXAMPLE_ADDRESSES.find((one) => one.pageId === "trips-and-floods" && one.exampleId.includes("trip"))!;

test("Shift+A on a scrolled list names the rows in its visible area", async ({ page }) => {
  await openExample(page, TRIP.pageId, TRIP.exampleId);
  const stage = page.locator(`[data-example="${TRIP.exampleId}"]`);
  const area = stage.locator('div[style*="max-height"]').first();
  await area.evaluate((node) => {
    node.scrollTop = (node.scrollHeight - node.clientHeight) / 2;
  });
  /* The list is virtual: a row scrolled out of the area leaves the DOM, and
     the focus with it. So the focus goes to a row in view, once the rows of
     the new position have rendered. */
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));

  /* The rows whose box meets the scroll area and the window. */
  const inView = await area.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const rows = [...node.querySelectorAll<HTMLElement>("tbody tr[data-alarm-id]")].filter((row) => {
      const r = row.getBoundingClientRect();
      return r.bottom > box.top && r.top < box.bottom && r.bottom > 0 && r.top < window.innerHeight;
    });
    rows[0]?.querySelector<HTMLElement>("th")?.focus({ preventScroll: true });
    return rows.length;
  });
  expect(inView).toBeGreaterThan(0);
  expect(inView).toBeLessThan(40);

  await page.keyboard.press("Shift+A");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(`${inView} alarms in view`);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
