/* The schedule under forced colours - the Windows contrast mode, emulated
   (forced-colors 03). The browser forces the colours of every element around
   the plot and none of the canvas' pixels, so the plot paints itself in the
   system colours (`FORCED` in sceneDraw.ts). The suite stands with the shell
   (`@umriss-ui/demo/checks/forcedColors.ts`); here stands the state no example
   rests in: the active subtask. */

import { test, expect } from "@playwright/test";
import { checkForcedColours } from "@umriss-ui/demo/checks/forcedColors";
import { EXAMPLE_ADDRESSES, SAMPLE } from "./pages";
import { drawn, open, openExample } from "./navigation";

checkForcedColours({ open, openExample, examples: EXAMPLE_ADDRESSES, sample: SAMPLE });

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
