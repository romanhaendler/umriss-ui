/* Every demo under forced colours - the Windows contrast mode, emulated
   (forced-colors 02, 03). One suite for all of them; each package's
   `forced-colors.spec.ts` calls it and adds the states that belong to it.

   The browser repaints every colour with a system colour and drops every
   box-shadow, so what is photographed is what the stylesheets give back: one
   picture per page - its first example, the component at rest
   (`firstExamples`) - in both projects, and axe over the demo's sample with
   the one rule forced colours take out of the library's hands
   (`FORCED_BY_THE_SYSTEM`). `page.emulateMedia` and not a context option:
   this Playwright has no `forcedColors` there. */

import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { FORCED_BY_THE_SYSTEM, STANDARDS, findings } from "./accessibility.ts";
import { firstExamples, type ExampleAddress } from "./pages.ts";

export interface ForcedColoursSuite {
  open: (page: Page, pageId: string) => Promise<void>;
  openExample: (page: Page, pageId: string, exampleId: string) => Promise<void>;
  examples: readonly ExampleAddress[];
  sample: readonly string[];
}

export function checkForcedColours({ open, openExample, examples, sample }: ForcedColoursSuite): void {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
    // Before the page loads: a canvas reads its colours on its first frame.
    await page.emulateMedia({ forcedColors: "active" });
  });

  for (const { pageId, exampleId, name } of firstExamples(examples)) {
    test(`Under forced colours: ${name}`, async ({ page }, testInfo) => {
      await openExample(page, pageId, exampleId);
      const target = page.locator(`[data-example="${exampleId}"]`);
      await target.scrollIntoViewIfNeeded();
      await expect(target).toHaveScreenshot(`forced-${name}-${testInfo.project.name}.png`);
    });
  }

  for (const pageId of sample) {
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
}
