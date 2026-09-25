/* The table under forced colours - the Windows contrast mode, emulated
   (forced-colors 03). The browser repaints every colour with a system colour
   and drops every box-shadow: the frame's edge, the focused virtual row's
   ring, a group band's tone, a selected row's accent ground. What survives is
   what the stylesheet gives it. Light and dark through the projects. */

import { test, expect, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { FORCED_BY_THE_SYSTEM, STANDARDS, findings } from "@umriss-ui/demo/checks/accessibility";
import { firstExamples } from "@umriss-ui/demo/checks/pages";
import { EXAMPLE_ADDRESSES, SAMPLE, type ExampleAddress } from "./pages";
import { open, openExample } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await page.emulateMedia({ forcedColors: "active" });
});

/* Every page's first example, and the states no first example shows: pinned
   blocks, bands, a whole group selected, selected rows - the last two ticked
   here, since no example rests selected. */
const tick = (rows: number[]) => async (target: Locator) => {
  // The native input lies invisibly under its drawn box: clicked as a keyboard would.
  for (const row of rows) await target.locator("tbody tr").nth(row).getByRole("checkbox").evaluate((box: HTMLElement) => box.click());
};

const STATES: Array<ExampleAddress & { act?: (target: Locator) => Promise<void> }> = [
  { pageId: "column", exampleId: "pinned-both-sides", name: "column--pinned-both-sides" },
  { pageId: "grouping", exampleId: "in-bands", name: "grouping--in-bands" },
  { pageId: "grouping", exampleId: "a-whole-group-selected", name: "grouping--a-whole-group-selected", act: tick([0]) },
  { pageId: "table", exampleId: "selection", name: "table--selection", act: tick([1, 2]) },
];

for (const { pageId, exampleId, name, act } of [...firstExamples(EXAMPLE_ADDRESSES), ...STATES] as typeof STATES) {
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

/* A virtual row draws its ring on its cells as inset shadows, which forced
   colours drop - the row keeps an outline of its own there. */
test("A focused virtual row under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "table", "virtualisation");
  const target = page.locator('[data-example="virtualisation"]');
  await target.scrollIntoViewIfNeeded();
  await target.locator("tbody tr[tabindex='0']").focus();
  await page.keyboard.press("ArrowDown");
  await expect(target.locator("tbody tr:focus-visible")).toHaveCount(1);
  await expect(target).toHaveScreenshot(`forced-focus-virtual-row-${testInfo.project.name}.png`);
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
