/* Screenshot comparisons of the demo of @umriss-ui/charts, light and dark
   (through the projects in playwright.config.ts). The clock is frozen, so that
   time-dependent displays stay deterministic.

   The same two kinds of picture as in the other two demos, for the same
   reasons: one per example with the code COLLAPSED, one per page from the head
   down to the first example. Both derived, not enumerated (`pages.ts`) - the
   benchmark's exception stands there, with its rule. */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES, PAGES, SCENARIO_IDS } from "./pages";
import { drawn, open, openExample, openScenario } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

for (const pageId of PAGES) {
  test(`Page head ${pageId}`, async ({ page }, testInfo) => {
    await open(page, pageId);
    const target = page.locator(`[data-block="${pageId}"] .pageHead`);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveScreenshot(`page-${pageId}-${testInfo.project.name}.png`);
  });
}

/* One per scenario: the whole screen with its marks, the code folded away. */
for (const scenarioId of SCENARIO_IDS) {
  test(`Scenario ${scenarioId}`, async ({ page }, testInfo) => {
    await openScenario(page, scenarioId);
    const target = page.locator(`[data-scenario="${scenarioId}"] .scenarioStage`);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveScreenshot(`scenario-${scenarioId}-${testInfo.project.name}.png`);
  });
}

for (const { pageId, exampleId, name } of EXAMPLE_ADDRESSES) {
  test(`Example ${name}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    // A resize can run on after the scrolling.
    await drawn(page);
    await expect(target.locator(".codeBlock")).toBeHidden();
    await expect(target).toHaveScreenshot(`example-${name}-${testInfo.project.name}.png`);
  });
}

/* charts-a11y: the plot as a tab stop - its ring, and the Active point the
   keys set (ADR-0030). One state picture, both themes. */
test("A focused chart with an Active point", async ({ page }, testInfo) => {
  await openExample(page, "chart", "keyboard-and-screen-reader");
  const target = page.locator('[data-example="keyboard-and-screen-reader"]');
  await target.scrollIntoViewIfNeeded();
  await drawn(page);
  const plot = target.locator(".uc-plot").first();
  await plot.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("PageUp");
  await page.keyboard.press("ArrowDown");
  await drawn(page);
  await expect(target).toHaveScreenshot(`focused-active-point-${testInfo.project.name}.png`);
});

/* charts-alternatives 01: the data table open over the plot - every reading
   of a shift, and a week downsampled with its caption saying so. The loop
   above photographs both closed, with their key. */
for (const exampleId of ["data-table", "a-week-as-a-table"]) {
  test(`An open data table (${exampleId})`, async ({ page }, testInfo) => {
    await openExample(page, "tooltip", exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    await drawn(page);
    await target.locator(".uc-data-key").click();
    // The pointer leaves the key, so that the picture shows it at rest.
    await page.mouse.move(0, 0);
    await expect(target.locator(".uc-data-panel")).toBeVisible();
    await expect(target).toHaveScreenshot(`open-${exampleId}-${testInfo.project.name}.png`);
  });
}
