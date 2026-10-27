/* Accessibility check of the pages of the demo of @umriss-ui/alarms, light
   and dark, against WCAG 2.1 AA. The standards, the tolerated colour pairs and
   the reading of the findings come from the shell
   (`@umriss-ui/demo/checks/accessibility.ts`); not one pair has been added. */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STANDARDS, findings } from "@umriss-ui/demo/checks/accessibility";
import { SAMPLE } from "./pages";
import { open } from "./navigation";

test.beforeEach(async ({ page }) => {
  // The flood example renders a thousand rows; axe needs longer than the default for them.
  test.slow();
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

for (const pageId of SAMPLE) {
  test(`Page ${pageId} is accessible`, async ({ page }, testInfo) => {
    await open(page, pageId);
    const result = await new AxeBuilder({ page }).include(`[data-block="${pageId}"]`).withTags(STANDARDS).analyze();
    expect(findings(result), `${pageId} (${testInfo.project.name})`).toEqual([]);
  });
}
