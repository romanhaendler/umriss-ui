/* Screenshot comparisons of the demo of @umriss-ui/schedule, light and dark
   (through the projects in playwright.config.ts). The clock is frozen.

   The same two kinds of picture as in the other demos: one per example with
   the code COLLAPSED, one per page from the head down to the first example.
   Both derived, not enumerated (`pages.ts`). */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES, PAGES, SCENARIO_IDS } from "./pages";
import { open, openExample, openScenario } from "./navigation";

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
    await expect(target.locator(".codeBlock")).toBeHidden();
    await expect(target).toHaveScreenshot(`example-${name}-${testInfo.project.name}.png`);
  });
}
