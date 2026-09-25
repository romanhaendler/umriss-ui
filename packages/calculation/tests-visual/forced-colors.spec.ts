/* The calculation under forced colours - the Windows contrast mode, emulated
   (forced-colors 03). The browser repaints every colour with a system colour
   and drops every box-shadow: the frame's edge, the hover coupling's band,
   the verdicts' colours. What survives is what the stylesheet gives it - and
   each verdict's word. Light and dark through the projects. */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { FORCED_BY_THE_SYSTEM, STANDARDS, findings } from "@umriss-ui/demo/checks/accessibility";
import { firstExamples } from "@umriss-ui/demo/checks/pages";
import { EXAMPLE_ADDRESSES, SAMPLE } from "./pages";
import { open, openExample } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await page.emulateMedia({ forcedColors: "active" });
});

for (const { pageId, exampleId, name } of firstExamples(EXAMPLE_ADDRESSES)) {
  test(`Under forced colours: ${name}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveScreenshot(`forced-${name}-${testInfo.project.name}.png`);
  });
}

/* The hover coupling: the quantity under the pointer and its operands. */
test("The hover coupling under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "calculation", "first-sum");
  const target = page.locator('[data-example="first-sum"]');
  await target.scrollIntoViewIfNeeded();
  await target.locator("[data-kind='result']").first().hover();
  await expect(target.locator("[data-mark='use']")).toHaveCount(1);
  await expect(target).toHaveScreenshot(`forced-hover-coupling-${testInfo.project.name}.png`);
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
