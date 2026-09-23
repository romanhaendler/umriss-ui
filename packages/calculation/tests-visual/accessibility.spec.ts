/* Accessibility check of a sample of pages of the demo of @umriss-ui/calculation, light
   and dark, against WCAG 2.1 AA.

   The standards, the tolerated colour pairs and the reading of the findings come
   from the shell (`@umriss-ui/demo/checks/accessibility.ts`): they are the pairs
   the suite of @umriss-ui/core tolerates, with the same written reasons, and not
   one has been added. Its two guards – every entry carries a reason, an open one
   points at a follow-up – stand there, where the list came into being. */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STANDARDS, findings } from "@umriss-ui/demo/checks/accessibility";
import { SAMPLE } from "./pages";
import { allWithCode, open } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

for (const pageId of SAMPLE) {
  test(`Page ${pageId} is accessible`, async ({ page }, testInfo) => {
    await open(page, pageId);
    const result = await new AxeBuilder({ page }).include(`[data-block="${pageId}"]`).withTags(STANDARDS).analyze();
    expect(findings(result), `${pageId} (${testInfo.project.name})`).toEqual([]);
  });
}

/* With every code block open: coloured source on the sunken surface. */
test("a page with every code block open is accessible", async ({ page }, testInfo) => {
  await open(page, "calculation");
  await allWithCode(page);
  await expect(page.locator('[data-block="calculation"] .codeBlock').first()).toBeVisible();
  const result = await new AxeBuilder({ page }).include('[data-block="calculation"]').withTags(STANDARDS).analyze();
  expect(findings(result), `Code open (${testInfo.project.name})`).toEqual([]);
});
