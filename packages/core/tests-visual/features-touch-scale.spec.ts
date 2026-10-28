/* The height of a `md` control under a finger (ADR-0079): 32 px as under a
   mouse, unless the application imports `@umriss-ui/core/touch-scale.css`, then
   44 px. The demo's touch-scale switch puts that stylesheet on the page, and the
   address `?touch-scale` has it on from the start. Chromium only; light only. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { addressOf, settle } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

/** The four controls the promise is made for, one example each. */
const CONTROLS: readonly [string, string, (stage: Locator) => Locator][] = [
  ["button", "one-action", (stage) => stage.getByRole("button").first()],
  ["input", "text-field", (stage) => stage.getByRole("textbox").first()],
  ["select", "select", (stage) => stage.getByRole("combobox").first()],
  ["segmentedcontrol", "segmented-control", (stage) => stage.getByRole("radiogroup").first()],
];

/** Opens an example with the stylesheet on (`scaled`, by the address) or off. */
const openScaled = async (page: Page, pageId: string, exampleId: string, scaled: boolean) => {
  await page.goto(addressOf(pageId, exampleId).replace("#", scaled ? "?touch-scale#" : "#"));
  await page.evaluate(() => document.fonts.ready);
  await page.locator(`[data-example="${exampleId}"]`).waitFor({ state: "visible" });
  await settle(page);
};

const heights = async (page: Page, scaled: boolean) => {
  const found: Record<string, number> = {};
  for (const [pageId, exampleId, control] of CONTROLS) {
    await openScaled(page, pageId, exampleId, scaled);
    found[pageId] = Math.round((await control(page.locator(`[data-example="${exampleId}"] .exampleStage`)).boundingBox())!.height * 10) / 10;
  }
  return found;
};

test("without touch-scale.css a md control is 32 px under a finger", async ({ page }) => {
  expect(await heights(page, false)).toEqual({ button: 32, input: 32, select: 32, segmentedcontrol: 32 });
  expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches), "touch emulation").toBe(true);
});

test("with touch-scale.css a md control is 44 px under a finger", async ({ page }) => {
  expect(await heights(page, true)).toEqual({ button: 44, input: 44, select: 44, segmentedcontrol: 44 });
});

test("the address ?touch-scale turns the switch and the stylesheet on", async ({ page }) => {
  await openScaled(page, "button", "one-action", true);
  await expect(page.getByRole("button", { name: "Touch scale", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-example="one-action"] .exampleStage').getByRole("button").first()).toHaveCSS("height", "44px");
});

test.describe("from a desk", () => {
  test.use({ hasTouch: false, viewport: { width: 1280, height: 900 } });

  test("the switch shows the grown state under a mouse as well", async ({ page }) => {
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(false);
    expect(await heights(page, true)).toEqual({ button: 44, input: 44, select: 44, segmentedcontrol: 44 });
  });
});
