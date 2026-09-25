/* The library under forced colours - the Windows contrast mode, emulated
   (forced-colors). The browser repaints every colour with a system colour and
   drops every box-shadow: the ring, the edges, a state that was only a
   surface. What survives is what the stylesheets give it - a transparent
   outline beside every ring (01), a border or outline beside every state that
   was only a surface (02). Light and dark through the projects, as
   everywhere; Chromium's emulated contrast themes differ between the two. */

import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { FORCED_BY_THE_SYSTEM, STANDARDS, findings } from "@umriss-ui/demo/checks/accessibility";
import { firstExamples } from "@umriss-ui/demo/checks/pages";
import { EXAMPLE_ADDRESSES, SAMPLE } from "./pages";
import { open, openExample, standstill } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await page.emulateMedia({ forcedColors: "active" });
});

/** The outline the element paints, as forced colours leave it. */
function outlineOf(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const style = getComputedStyle(el);
    return `${style.outlineStyle} ${style.outlineWidth}`;
  });
}

/* 01: the ring survives. Three ways a ring is drawn - the shared `ring` a
   button composes, a field's own, and the box beside a hidden input - and
   under forced colours each leaves its two-pixel outline in the system's
   text colour. */
for (const [pageId, exampleId, control, painted] of [
  ["button", "variants", "button", ":focus-visible"],
  ["input", "states", "input", ":focus-visible"],
  ["checkbox", "states", "input", ":focus-visible + *"],
] as const) {
  test(`The ${pageId}'s ring survives forced colours`, async ({ page }) => {
    await openExample(page, pageId, exampleId);
    const example = `[data-example="${exampleId}"] .exampleStage`;
    await page.locator(`${example} ${control}:not(:disabled)`).first().focus();
    expect(await outlineOf(page, `${example} ${painted}`)).toBe("solid 2px");
  });
}

test("A focused button under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "button", "variants");
  const target = page.locator('[data-example="variants"]');
  await target.scrollIntoViewIfNeeded();
  await target.locator(".exampleStage button").first().focus();
  await expect(target).toHaveScreenshot(`forced-focus-button-${testInfo.project.name}.png`);
});

/* 02: every page's first example, the component at rest. */
for (const { pageId, exampleId, name } of firstExamples(EXAMPLE_ADDRESSES)) {
  test(`Under forced colours: ${name}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveScreenshot(`forced-${name}-${testInfo.project.name}.png`);
  });
}

/* 02: the states that live in an open panel - no example rests in them. */
test("A combobox's cursor under forced colours", async ({ page }, testInfo) => {
  await openExample(page, "combobox", "typing-filters");
  await page.locator('[data-example="typing-filters"] .exampleStage input').first().focus();
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
