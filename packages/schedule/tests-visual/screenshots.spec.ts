/* Screenshot comparisons of the demo of @umriss-ui/schedule, light and dark
   (through the projects in playwright.config.ts). The clock is frozen.

   The same two kinds of picture as in the other demos: one per example with
   the code COLLAPSED, one per page from the head down to the first example.
   Both derived, not enumerated (`pages.ts`). */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES, PAGES, SCENARIO_IDS } from "./pages";
import { aloneStage, open, openExample, openScenario } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

/* Not the API index: its content is text, which the guards hold (ADR-0044). */
for (const pageId of PAGES.filter((one) => one !== "api")) {
  test(`Page head ${pageId}`, { tag: "@quick" }, async ({ page }, testInfo) => {
    await open(page, pageId);
    const target = page.locator(`[data-block="${pageId}"] .pageHead`);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveScreenshot(`page-${pageId}-${testInfo.project.name}.png`);
  });
}

/* One per scenario: the whole screen with its marks, the code folded away. */
for (const scenarioId of SCENARIO_IDS) {
  test(`Scenario ${scenarioId}`, { tag: "@quick" }, async ({ page }, testInfo) => {
    await openScenario(page, scenarioId);
    const target = await aloneStage(page, scenarioId);
    await expect(target).toHaveScreenshot(`scenario-${scenarioId}-${testInfo.project.name}.png`);
  });
}

/* A plan while it reloads: stale and dimmed. The example ends its reload by a
   timer, so the page's timers are stopped before Reload is pressed. */
test("Example schedule--loading reloading", async ({ page }, testInfo) => {
  await openExample(page, "schedule", "loading");
  const target = page.locator('[data-example="loading"]');
  await target.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    window.setTimeout = (() => 0) as unknown as typeof window.setTimeout;
  });
  await target.getByRole("button", { name: "Reload" }).click();
  await expect(target.locator("[aria-busy='true']")).toHaveCount(2);
  await page.mouse.move(0, 0);
  await expect(target).toHaveScreenshot(`example-schedule--loading--reloading-${testInfo.project.name}.png`);
});

/* The plan opened as a table, to be compared by eye with the chart's open data table. */
test("Example tooltip--read-the-plan-as-a-table open", async ({ page }, testInfo) => {
  await openExample(page, "tooltip", "read-the-plan-as-a-table");
  const target = page.locator('[data-example="read-the-plan-as-a-table"]');
  await target.scrollIntoViewIfNeeded();
  await target.getByRole("button", { name: "Show data" }).click();
  await expect(target.getByRole("table")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(target).toHaveScreenshot(`example-tooltip--read-the-plan-as-a-table--open-${testInfo.project.name}.png`);
});

for (const { pageId, exampleId, name } of EXAMPLE_ADDRESSES) {
  test(`Example ${name}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    await expect(target.locator(".codeBlock")).toBeHidden();
    await expect(target).toHaveScreenshot(`example-${name}-${testInfo.project.name}.png`);
  });
}
