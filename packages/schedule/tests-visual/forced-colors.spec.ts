/* The schedule under forced colours - the Windows contrast mode, emulated
   (forced-colors 03). The browser forces the colours of every element around
   the plot and none of the canvas' pixels, so the plot forces itself: its
   subtasks, findings and the active subtask are drawn in the system colours
   the page now wears. Light and dark through the projects. */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { FORCED_BY_THE_SYSTEM, STANDARDS, findings } from "@umriss-ui/demo/checks/accessibility";
import { firstExamples } from "@umriss-ui/demo/checks/pages";
import { EXAMPLE_ADDRESSES, SAMPLE } from "./pages";
import { drawn, open, openExample } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  // Before the page loads: the plot reads its colours on its first frame.
  await page.emulateMedia({ forcedColors: "active" });
});

for (const { pageId, exampleId, name } of firstExamples(EXAMPLE_ADDRESSES)) {
  test(`Under forced colours: ${name}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    await drawn(page);
    await expect(target).toHaveScreenshot(`forced-${name}-${testInfo.project.name}.png`);
  });
}

test("A focused schedule with an active subtask under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = example.locator("[role='application']");
  await example.locator(".exampleToggle").first().focus();
  for (let i = 0; i < 8 && !(await plot.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowRight");
  await expect(example.locator("[data-schedule-tooltip]")).toContainText("a-2043-2");
  await drawn(page);
  await expect(example).toHaveScreenshot(`forced-focus-active-${testInfo.project.name}.png`);
});

for (const pageId of SAMPLE) {
  test(`Page ${pageId} is accessible under forced colours`, async ({ page }, testInfo) => {
    await open(page, pageId);
    const result = await new AxeBuilder({ page })
      .include(`[data-block="${pageId}"]`)
      .withTags(STANDARDS)
      .disableRules(FORCED_BY_THE_SYSTEM)
      .analyze();
    expect(findings(result), `${pageId} (${testInfo.project.name})`).toEqual([]);
  });
}
