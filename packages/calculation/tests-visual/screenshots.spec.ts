/* Screenshot comparisons of the demo of @umriss-ui/calculation, light and
   dark (through the projects in playwright.config.ts). The clock is frozen, so
   that time-dependent displays – the freshness of a given – stay deterministic.

   The same two kinds of picture as in the demo of @umriss-ui/core, for the same
   reasons: one per example with the code COLLAPSED, one per page from the head
   down to the first example. Both derived, not enumerated (`pages.ts`). */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES, PAGES } from "./pages";
import { open, openExample } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

for (const pageId of PAGES) {
  test(`Seitenkopf ${pageId}`, async ({ page }, testInfo) => {
    await open(page, pageId);
    const target =
      pageId === "overview"
        ? page.locator('[data-block="overview"]')
        : page.locator(`[data-block="${pageId}"] .pageHead`);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveScreenshot(`page-${pageId}-${testInfo.project.name}.png`);
  });
}

for (const { pageId, exampleId, name } of EXAMPLE_ADDRESSES) {
  test(`Beispiel ${name}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    await expect(target.locator(".codeBlock")).toBeHidden();
    await expect(target).toHaveScreenshot(`example-${name}-${testInfo.project.name}.png`);
  });
}

/* Outside the loop: the loop photographs every example as it starts, folded,
   and a derivation opened beneath its line - the panel, its bar, the line that
   closes it, a derivation inside another - is in no example's first picture. */
test("Beispiel calculation--oee, opened", async ({ page }, testInfo) => {
  await openExample(page, "calculation", "oee");
  const target = page.locator('[data-example="oee"]');
  for (const label of ["Availability", "Run time", "Performance"]) {
    await target.getByRole("button", { name: `Show how ${label} is derived` }).click();
  }
  await page.mouse.move(0, 0);
  await expect(target).toHaveScreenshot(`example-calculation--oee-opened-${testInfo.project.name}.png`);
});
