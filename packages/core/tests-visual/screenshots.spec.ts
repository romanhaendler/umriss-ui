/* Screenshot comparisons of the demo, light and dark (through the project
   definitions in playwright.config.ts). The clock is frozen so that
   time-dependent displays stay deterministic; timers keep running
   (setFixedTime freezes only Date).

   Two kinds of picture, and the separation is the point:

   – One per example, with the code FOLDED AWAY. An open code block would bind
     the baseline to the source, and a renamed variable in an example would
     become an image diff.

   – One per page, from the head to the first example. That captures the title,
     the import line and the beginning of the table, without producing a very
     tall image per page in which every change hits every baseline.

   Both are derived and not counted: `pages.ts` reads the same two sources as
   the demo itself. A page without a baseline therefore cannot exist – it would
   have a failing test.

   The baseline file names stay as they are: the pictures belong to the ticket
   that rebuilds them. */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES, PAGES, SCENARIO_IDS } from "./pages";
import { open, openExample, standstill, openScenario } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

for (const pageId of PAGES) {
  test(`Page head ${pageId}`, async ({ page }, testInfo) => {
    await open(page, pageId);
    /* From the head to the first example: the first example itself already has
       a picture of its own, and so does everything below it. */
    const target = page.locator(`[data-block="${pageId}"] .pageHead`);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveScreenshot(`page-${pageId}-${testInfo.project.name}.png`);
  });
}

/* One per scenario: the whole screen with its marks, the code folded away. */
for (const scenarioId of SCENARIO_IDS) {
  test(`Scenario ${scenarioId}`, async ({ page }, testInfo) => {
    await openScenario(page, scenarioId);
    const target = page.locator(`[data-scenario="${scenarioId}"] .scenarioStage`);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveScreenshot(`scenario-${scenarioId}-${testInfo.project.name}.png`);
  });
}

for (const { pageId, exampleId, name } of EXAMPLE_ADDRESSES) {
  test(`Example ${name}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    /* Folded away is the resting state and the photographed one. */
    await expect(target.locator(".codeBlock")).toBeHidden();
    await expect(target).toHaveScreenshot(`example-${name}-${testInfo.project.name}.png`);
  });
}

/* The command palette's window, in both themes.

   It is not an example and cannot be one: it lies in the top layer and not in
   the page, and the example `befehle` therefore shows the trigger, like every
   other overlay example. What is photographed here is the whole viewport –
   otherwise the translucent material cannot be seen at all, because it consists
   of what lies behind it.

   Whether this picture is stable from run to run was the open question of the
   work package (`command-palette` 08): `backdrop-filter` is a render path that
   has already differed between machines of the same platform. It has proved
   stable and the baseline stays. If it begins to flutter, the answer is to
   strike it and not to change the material: the proof that the pane really
   carries the material is carried by features-shell.spec.ts anyway, through the
   computed style. */
test("The command palette's window", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.keyboard.press("ControlOrMeta+k");
  const field = page.getByRole("combobox", { name: "Search a page or example" });
  await field.fill("dtp");
  await expect(page.getByRole("option").first()).toBeVisible();
  await expect(page).toHaveScreenshot(`palette-window-${testInfo.project.name}.png`);
});

/* The filled resting state that `restingItems` makes possible.

   The shell leaves it empty (all pages and all examples), the example fills it
   (seven commands). Both behaviours thereby have a living caller and a picture -
   otherwise the prop would be a promise nobody looks after. */
test("The command palette's window in the resting state", async ({ page }, testInfo) => {
  await openExample(page, "commandpalette", "commands");
  await page.getByRole("button", { name: "Open the palette" }).click();
  await expect(page.getByRole("option")).toHaveCount(7);
  await expect(page).toHaveScreenshot(`palette-resting-${testInfo.project.name}.png`);
});

/* The dock's four resting places, light and dark.

   The example loop above photographs only one of them - the one the dock starts
   with. The other three are states it has to be brought into first, and the way
   there is the four arrows on the grip.

   Only RESTING states are photographed. A picture in the middle of a transition
   would be the picture of a transform on its way to zero, and the baseline
   thereby a test of timing rather than of appearance (ADR-0014). That is why it
   waits each time until no animation is running any more - and not for a fixed
   span of time, which would be too short on a slower machine. */
for (const [key, place] of [
  ["ArrowUp", "top"],
  ["ArrowRight", "right"],
  ["ArrowDown", "bottom"],
  ["ArrowLeft", "left"],
] as const) {
  test(`The dock at the resting place ${place}`, async ({ page }, testInfo) => {
    await open(page, "dock");
    const host = page.locator('[data-dock="spacious"]');
    await host.getByRole("button", { name: "Move dock" }).focus();
    await page.keyboard.press(key);
    await expect(host.getByRole("group", { name: "Tools" })).toHaveAttribute(
      "data-place",
      place,
    );
    await standstill(page);
    await expect(host).toHaveScreenshot(`dock-${place}-${testInfo.project.name}.png`);
  });
}

/* The drawer standing open, at both edges (core-foundations 03). The example
   loop photographs its examples closed - a button - and the sheet at the edge
   is the one thing about it that is appearance. The whole viewport, because
   the drawer is its edge and the scrim over the page behind; after the
   entrance has come to rest, for the reason the dock's pictures give. */
for (const [example, button] of [
  ["beside-a-service-list", "Checkout"],
  ["left-and-wider", "Filter the alerts"],
] as const) {
  test(`The drawer open: ${example}`, async ({ page }, testInfo) => {
    await openExample(page, "drawer", example);
    await page.getByRole("button", { name: button, exact: true }).click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    /* Settled rather than finished: under load the page's own jump highlight
       is cancelled while the drawer comes in, and `standstill` rejects on a
       cancelled animation (it aborted three of these runs). */
    await drawer.evaluate((el) =>
      Promise.allSettled(el.ownerDocument.getAnimations().map((a) => a.finished)).then(() => undefined),
    );
    await expect(page).toHaveScreenshot(`drawer-${example}-${testInfo.project.name}.png`);
  });
}
