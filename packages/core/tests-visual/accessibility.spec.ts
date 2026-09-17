/* Automatic accessibility check over the demo pages, light and dark
   (consumable-package 04).

   Not a new level of testing, but one more file in the browser suite that
   already exists. That is exactly what makes the check cheap: the demo is the
   seam every component runs through anyway, the server runs, the themes run -
   only the check was missing.

   One page per test rather than one check over all of them: a finding should
   say which component has it, and a red test should not drag eleven other pages
   with it.

   A SAMPLE is checked and not every page: two axe runs per page are minutes for
   an answer that rarely differs between two pages of the same sort. The
   selection stands in `pages.ts` and names, per rubric, the one that carries
   the most interaction.

   Beside it a run with all code blocks OPEN - the state the check had never
   seen, and the only one in which coloured text stands on the sunken surface.

   The standards, the tolerated colour pairs and the reading of the findings
   stand with the shell (`@umriss-ui/demo/checks/accessibility.ts`): the demo of
   @umriss-ui/table checks against the same pairs with the same reasons, and a
   second list would drift away from the first.

   Findings were expected. The components are built carefully and keyboard
   operation belongs to the definition of done - but nothing had checked that up
   to here, and "nobody has noticed" is not a proof. */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { TOLERATED, STANDARDS, OPEN, findings } from "@umriss-ui/demo/checks/accessibility";
import { SAMPLE } from "./pages";
import { allWithCode, open } from "./navigation";


test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

for (const pageId of SAMPLE) {
  test(`Page ${pageId} is accessible`, async ({ page }, testInfo) => {
    await open(page, pageId);
    const result = await new AxeBuilder({ page })
      .include(`[data-block="${pageId}"]`)
      .withTags(STANDARDS)
      .analyze();

    const report = findings(result);

    expect(report, `${pageId} (${testInfo.project.name})`).toEqual([]);
  });
}

/* The same run, but with every code block open. The coloured source on the
   sunken surface is the one place in the demo at which ten colour roles stand
   beside each other at once - and the only one this check had never seen up to
   here. */
test("a page with all code blocks open is accessible", async ({ page }, testInfo) => {
  await open(page, "button");
  await allWithCode(page);
  await expect(page.locator('[data-block="button"] .codeBlock').first()).toBeVisible();
  const result = await new AxeBuilder({ page })
    .include('[data-block="button"]')
    .withTags(STANDARDS)
    .analyze();

  const report = findings(result);

  expect(report, `code open (${testInfo.project.name})`).toEqual([]);
});

test("every tolerated colour carries a written reason", () => {
  /* The ticket's rule as a test: never across the board. An entry without a
     reason is a switching-off that disguises itself as a decision. */
  for (const entry of TOLERATED) {
    expect(entry.reason.length, `${entry.foreground} on ${entry.background}`).toBeGreaterThan(40);
    expect(entry.upTo).toBeGreaterThan(0);
  }
  /* And the list stays short. If it grows, that is a signal and not a side
     matter. */
  expect(TOLERATED.length).toBeLessThanOrEqual(6);
});

test("the open findings point at a follow-up", () => {
  for (const entry of OPEN) {
    expect(entry.reason).toContain(".scratch/");
  }
});
