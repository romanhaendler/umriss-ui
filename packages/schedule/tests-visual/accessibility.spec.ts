/* Accessibility check of a sample of pages of the demo of @umriss-ui/schedule,
   light and dark, against WCAG 2.1 AA. The standards, the tolerated colour pairs
   and the reading of the findings come from the shell
   (`@umriss-ui/demo/checks/accessibility.ts`); not one pair has been added. */

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
  await open(page, "subtasks");
  await allWithCode(page);
  await expect(page.locator('[data-block="subtasks"] .codeBlock').first()).toBeVisible();
  const result = await new AxeBuilder({ page }).include('[data-block="subtasks"]').withTags(STANDARDS).analyze();
  expect(findings(result), `Code open (${testInfo.project.name})`).toEqual([]);
});

/* The context menu of the demonstration is portalled to the body, outside
   every page block - it is checked where it lands. */
test("the demonstration's context menu is accessible", async ({ page }, testInfo) => {
  await open(page, "demonstration");
  const plot = page.locator('[data-example="demonstration"] [data-schedule-plot]');
  await plot.scrollIntoViewIfNeeded();
  const box = (await plot.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.02, box.y + 6 * 44 + 22, { button: "right" });
  await expect(page.getByRole("menu")).toBeVisible();
  const result = await new AxeBuilder({ page }).include('[role="menu"]').withTags(STANDARDS).analyze();
  expect(findings(result), `Context menu (${testInfo.project.name})`).toEqual([]);
});
