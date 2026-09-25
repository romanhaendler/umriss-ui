/* The calculation under forced colours - the Windows contrast mode, emulated
   (forced-colors 03). The suite stands with the shell
   (`@umriss-ui/demo/checks/forcedColors.ts`); here stands the state no example
   rests in. The verdicts need nothing of their own: each keeps its word. */

import { test, expect } from "@playwright/test";
import { checkForcedColours } from "@umriss-ui/demo/checks/forcedColors";
import { EXAMPLE_ADDRESSES, SAMPLE } from "./pages";
import { open, openExample } from "./navigation";

checkForcedColours({ open, openExample, examples: EXAMPLE_ADDRESSES, sample: SAMPLE });

/* The hover coupling: the quantity under the pointer and its operands. */
test("The hover coupling under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "calculation", "first-sum");
  const target = page.locator('[data-example="first-sum"]');
  await target.scrollIntoViewIfNeeded();
  await target.locator("[data-kind='result']").first().hover();
  await expect(target.locator("[data-mark='use']")).toHaveCount(1);
  await expect(target).toHaveScreenshot(`forced-hover-coupling-${testInfo.project.name}.png`);
});
