/* A label beside its field: `labelPlacement="start"` on the property panel
   example. Measured as a user sees it: the label's column, the field's left
   edge, the first baselines and the wrap in a narrow place. */

import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const rem = (page: Page) => page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));

const box = async (locator: Locator) => {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("not laid out");
  return rect;
};

const open = async (page: Page, width: number) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openExample(page, "formfield", "put-the-labels-in-a-column");
  const stage = page.locator('[data-example="put-the-labels-in-a-column"]');
  /* A place of its own width inside the stage. */
  await stage.locator("label").first().locator("xpath=../..").evaluate((element, w) => ((element as HTMLElement).style.maxWidth = `${w}px`), width);
  return stage;
};

/* The y of the label's first baseline: an empty inline-block sits on it. */
const labelBaseline = (label: Locator) =>
  label.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0";
    element.appendChild(probe);
    const y = probe.getBoundingClientRect().bottom;
    probe.remove();
    return y;
  });

/* The y of the text baseline of a centred input line. */
const inputBaseline = (input: Locator) =>
  input.evaluate((element) => {
    const style = getComputedStyle(element);
    const context = document.createElement("canvas").getContext("2d")!;
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const m = context.measureText("x");
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2 + (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
  });

test("The label stands left of the field, 10rem wide, and the token moves the field", { tag: "@quick" }, async ({ page }) => {
  const stage = await open(page, 560);
  const label = stage.locator("label", { hasText: "Cost centre" });
  const input = stage.getByLabel("Cost centre");
  const unit = await rem(page);

  const labelBox = await box(label);
  const inputBox = await box(input);
  expect(labelBox.width).toBeCloseTo(10 * unit, 0);
  expect(inputBox.x).toBeGreaterThan(labelBox.x + labelBox.width - 0.5);
  const before = inputBox.x - labelBox.x;

  await page.addStyleTag({ content: ":root { --u-label-width: 14rem }" });
  expect((await box(input)).x - (await box(label)).x).toBeCloseTo(before + 4 * unit, 0);
});

for (const [name, height] of [
  ["md", "32px"],
  ["sm", "26px"],
] as const) {
  test(`The label's baseline is level with the input's text at ${name}`, { tag: "@quick" }, async ({ page }) => {
    const stage = await open(page, 560);
    /* The small control is the same field at its own height. */
    await page.addStyleTag({ content: `:root { --u-control-height: ${height} }` });
    const label = stage.locator("label", { hasText: "Cost centre" });
    const input = stage.getByLabel("Cost centre");
    expect(Math.abs((await labelBaseline(label)) - (await inputBaseline(input)))).toBeLessThanOrEqual(1);
  });
}

test("The hint and the error start at the field's left edge, under it", { tag: "@quick" }, async ({ page }) => {
  const stage = await open(page, 560);
  const pairs: [string, string][] = [
    ["Cost centre", "As on the budget sheet, for example CC-2100."],
    ["Budget", "The budget must be above zero."],
  ];
  for (const [name, message] of pairs) {
    /* The control's own box: a NumberInput's native input stands inside its frame. */
    const input = await box(stage.locator("label", { hasText: name }).locator("xpath=following-sibling::div[1]/*[1]"));
    const text = await box(stage.getByText(message, { exact: true }));
    expect(text.x).toBeCloseTo(input.x, 0);
    expect(text.y).toBeGreaterThan(input.y + input.height - 0.5);
  }
});

test("In a narrow place the field stands under its label", { tag: "@quick" }, async ({ page }) => {
  const stage = await open(page, 280);
  const label = await box(stage.locator("label", { hasText: "Cost centre" }));
  const input = await box(stage.getByLabel("Cost centre"));
  expect(input.y).toBeGreaterThan(label.y + label.height - 0.5);
  expect(input.x).toBeCloseTo(label.x, 0);
});
