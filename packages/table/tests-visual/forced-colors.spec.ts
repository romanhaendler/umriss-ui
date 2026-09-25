/* The table under forced colours - the Windows contrast mode, emulated
   (forced-colors 03). The suite stands with the shell
   (`@umriss-ui/demo/checks/forcedColors.ts`); here stand the states no first
   example shows: pinned blocks scrolled, bands, a whole group selected, selected rows -
   the last two ticked here, since no example rests selected - and a focused
   virtual row, whose ring its cells draw as inset shadows that forced colours
   drop. */

import { test, expect, type Locator } from "@playwright/test";
import { checkForcedColours } from "@umriss-ui/demo/checks/forcedColors";
import { EXAMPLE_ADDRESSES, SAMPLE } from "./pages";
import { open, openExample } from "./navigation";

checkForcedColours({ open, openExample, examples: EXAMPLE_ADDRESSES, sample: SAMPLE });

const tick = (rows: number[]) => async (target: Locator) => {
  // The native input lies invisibly under its drawn box: clicked as a keyboard would.
  for (const row of rows) await target.locator("tbody tr").nth(row).getByRole("checkbox").evaluate((box: HTMLElement) => box.click());
};

/* Scrolled into the middle, so that content lies under both pinned blocks and
   both inner edges show. */
const scrolled = async (target: Locator) => {
  const area = target.locator("table").locator("..");
  await area.evaluate((el) => (el.scrollLeft = 240));
  await expect(area).toHaveAttribute("data-under-start", "");
};

/* `state` names a picture the shared suite takes too - the first example of a
   page, at rest: `selection` is its page's first example and is photographed
   here ticked. */
const STATES: Array<{ pageId: string; exampleId: string; state?: string; act?: (target: Locator) => Promise<void> }> = [
  { pageId: "width-and-pinning", exampleId: "pinned-both-sides", act: scrolled },
  { pageId: "grouping", exampleId: "in-bands" },
  { pageId: "grouping", exampleId: "a-whole-group-selected", act: tick([0]) },
  { pageId: "selection", exampleId: "selection", state: "ticked", act: tick([1, 2]) },
];

for (const { pageId, exampleId, state, act } of STATES) {
  const name = `${pageId}--${exampleId}${state ? `--${state}` : ""}`;
  test(`Under forced colours: ${name}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    await act?.(target);
    /* Out of the way: the pointer resting on the last ticked row would
       photograph its hover. */
    await page.mouse.move(0, 0);
    await expect(target).toHaveScreenshot(`forced-${name}-${testInfo.project.name}.png`);
  });
}

test("A focused virtual row under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "virtualisation", "virtualisation");
  const target = page.locator('[data-example="virtualisation"]');
  await target.scrollIntoViewIfNeeded();
  await target.locator("tbody tr[tabindex='0']").focus();
  await page.keyboard.press("ArrowDown");
  await expect(target.locator("tbody tr:focus-visible")).toHaveCount(1);
  await expect(target).toHaveScreenshot(`forced-focus-virtual-row-${testInfo.project.name}.png`);
});
