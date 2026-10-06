/* The library under forced colours - the Windows contrast mode, emulated
   (forced-colors 01, 02). The browser repaints every colour with a system
   colour and drops every box-shadow: the ring, the edges, a state that was
   only a surface. What survives is what the stylesheets give it - a
   transparent outline beside every ring and every edge, a system colour or an
   outline for every state that was only a surface. The suite every demo runs
   stands with the shell (`@umriss-ui/demo/checks/forcedColors.ts`); here
   stand the ring and the states that live in an open panel. */

import { test, expect, type Page } from "@playwright/test";
import { checkForcedColours } from "@umriss-ui/demo/checks/forcedColors";
import { EXAMPLE_ADDRESSES, SAMPLE } from "./pages";
import { open, openExample, standstill } from "./navigation";

checkForcedColours({ open, openExample, examples: EXAMPLE_ADDRESSES, sample: SAMPLE });

/** The outline the element paints, as forced colours leave it. */
function outlineOf(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const style = getComputedStyle(el);
    return `${style.outlineStyle} ${style.outlineWidth}`;
  });
}

/* 01: the ring survives. Three ways a ring is drawn - the shared `ring` a
   button composes, a field's own on the wrapper around its input (ADR-0041),
   and the box beside a hidden input - and under forced colours each leaves its
   two-pixel outline, which Chromium paints in the selection colour on a
   focused element. */
for (const [pageId, exampleId, control, painted] of [
  ["button", "variants", "button", ":focus-visible"],
  ["input", "states", "input", ":has(> input:focus-visible)"],
  ["checkbox", "states", "input", ":focus-visible + *"],
  ["segmentedcontrol", "segmented-control", "input", ":has(> input:focus-visible)"],
  ["segmentedcontrol", "drawn-as-a-field", "input", ":has(> input:focus-visible)"],
] as const) {
  test(`The ${pageId}'s ring survives forced colours (${exampleId})`, async ({ page }) => {
    await openExample(page, pageId, exampleId);
    const example = `[data-example="${exampleId}"] .exampleStage`;
    await page.locator(`${example} ${control}:not(:disabled)`).first().focus();
    expect(await outlineOf(page, `${example} ${painted}`)).toBe("solid 2px");
  });
}

/* segmented-control-inset 03: the inset track is a sunken ground and the
   choice a lifted one - both repainted. The track keeps an edge, and the
   choice the system's selection colours, as in the field drawing. */
test("An inset segmented control keeps its track and its choice under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "segmentedcontrol", "a-theme-switch");
  const target = page.locator('[data-example="a-theme-switch"]');
  const control = target.getByRole("radiogroup", { name: "Theme" });
  expect(await control.evaluate((el) => `${getComputedStyle(el).outlineStyle} ${getComputedStyle(el).outlineWidth}`)).toBe("solid 1px");
  const selected = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "forced-color-adjust: none; background: SelectedItem";
    document.body.append(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  });
  const chosen = control.getByRole("radio", { name: "System" }).locator("..");
  expect(await chosen.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(selected);
  expect(await chosen.evaluate((el) => getComputedStyle(el).boxShadow)).toBe("none");
  // The keys land on the choice: its ring is the outline, in the system's colour.
  await control.getByRole("radio", { name: "System" }).focus();
  const ring = await chosen.evaluate((el) => {
    const style = getComputedStyle(el);
    return { outline: `${style.outlineStyle} ${style.outlineWidth}`, colour: style.outlineColor };
  });
  expect(ring.outline).toBe("solid 2px");
  expect(ring.colour).not.toBe("rgba(0, 0, 0, 0)");
  await control.getByRole("radio", { name: "System" }).blur();
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveScreenshot(`forced-segmented-inset-${testInfo.project.name}.png`);
});

test("A focused button under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "button", "variants");
  const target = page.locator('[data-example="variants"]');
  await target.scrollIntoViewIfNeeded();
  await target.locator(".exampleStage button").first().focus();
  await expect(target).toHaveScreenshot(`forced-focus-button-${testInfo.project.name}.png`);
});

/* 02: the states that live in an open panel - no example rests in them. The
   whole viewport, because the panel lies in the top layer and not in the
   example; after it has come to rest, since it enters by scale. */
test("A combobox's cursor under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "combobox", "pick-a-driver");
  await page.locator('[data-example="pick-a-driver"] .exampleStage input').first().focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option").nth(1)).toBeVisible();
  await standstill(page);
  await expect(page).toHaveScreenshot(`forced-combobox-cursor-${testInfo.project.name}.png`);
});

test("A chosen range under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "daterangepicker", "presets");
  const trigger = page.locator('[data-example="presets"] .exampleStage button').first();
  await trigger.click();
  await page.getByRole("button", { name: "Next 2 weeks" }).click();
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await standstill(page);
  await expect(page).toHaveScreenshot(`forced-range-${testInfo.project.name}.png`);
});
