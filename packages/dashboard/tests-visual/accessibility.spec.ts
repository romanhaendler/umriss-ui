/* Accessibility check of the pages of the demo of @umriss-ui/dashboard, light
   and dark, against WCAG 2.1 AA. The standards, the tolerated colour pairs and
   the reading of the findings come from the shell
   (`@umriss-ui/demo/checks/accessibility.ts`); not one pair has been added. */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STANDARDS, findings } from "@umriss-ui/demo/checks/accessibility";
import { SAMPLE } from "./pages";
import { open } from "./navigation";

for (const pageId of SAMPLE) {
  test(`Page ${pageId} is accessible`, async ({ page }, testInfo) => {
    await open(page, pageId);
    const result = await new AxeBuilder({ page }).include(`[data-block="${pageId}"]`).withTags(STANDARDS).analyze();
    expect(findings(result), `${pageId} (${testInfo.project.name})`).toEqual([]);
  });
}
