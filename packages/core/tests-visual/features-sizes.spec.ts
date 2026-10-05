/* Sizes (control-sizes, ADR-0041): what jsdom cannot see - a field's width
   in a real layout. Measured on the Sizes page, at the widths a person meets:
   a phone at 320 px, the desktop at 1280.

   The promises: a field fills the place that gives it a width; in a row it is
   its natural width and holds still whatever it shows - chips, an option, a
   message under it; `chars` fixes it; it is never wider than its place; one
   size for a place reaches every control in it and stops at a dialog. */

import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const box = async (locator: Locator) => {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("not laid out");
  return rect;
};

const example = (page: Page, id: string) => page.locator(`[data-example="${id}"]`);

test("A field fills the place that gives it a width", async ({ page }) => {
  await openExample(page, "sizes", "fill-the-place");
  const stage = example(page, "fill-the-place");
  const first = await box(stage.getByLabel("First name"));
  const last = await box(stage.getByLabel("Last name"));
  // The ref and the label reach the control; the field is its wrapper.
  const service = await box(stage.getByLabel("Delivery service").locator(".."));
  const note = await box(stage.getByLabel("Note for the driver").locator(".."));
  // Two equal grid cells, and the full column below them.
  expect(Math.abs(first.width - last.width)).toBeLessThanOrEqual(1);
  expect(service.width).toBeGreaterThan(first.width * 2);
  expect(Math.abs(note.width - service.width)).toBeLessThanOrEqual(1);
});

test("A multiselect holds still while values are chosen and removed", async ({ page }) => {
  await openExample(page, "sizes", "a-row-that-holds-still");
  const stage = example(page, "a-row-that-holds-still");
  const field = stage.getByRole("button", { name: "Carriers", exact: true }).locator("..");
  const range = stage.getByRole("button", { name: "Shipped", exact: true });
  const before = await box(field);
  const rangeBefore = await box(range);

  await field.locator("[aria-haspopup]").click();
  const panel = page.getByRole("dialog");
  for (const carrier of ["DPD", "Hermes", "FedEx", "TNT", "Dachser"]) {
    await panel.getByText(carrier, { exact: true }).click();
  }
  await page.keyboard.press("Escape");
  await expect(stage.getByText(/carriers: 8 chosen/)).toBeVisible();
  expect(await box(field)).toEqual(before);
  expect(await box(range)).toEqual(rangeBefore);
  // What does not fit stands as "+N".
  await expect(field.getByRole("button", { name: /Manage all 8 selected/ })).toBeVisible();

  // Removed down to none: the placeholder stands in the same width.
  for (let i = 0; i < 8; i++) await field.locator("[data-value]").first().click();
  await expect(stage.getByText("Every carrier")).toBeVisible();
  expect(await box(field)).toEqual(before);
  expect(await box(range)).toEqual(rangeBefore);
  // Its cross is counted in the width: it comes with the first value and
  // goes with all of them, and nothing moves. The panel may scroll the page,
  // so the row is compared across, not down.
  const across = async (locator: Locator) => {
    const { x, width } = await box(locator);
    return { x, width };
  };
  await field.locator("[aria-haspopup]").click();
  await panel.getByText("DHL", { exact: true }).click();
  await page.keyboard.press("Escape");
  const clear = field.getByRole("button", { name: "Clear selection" });
  await expect(clear).toBeVisible();
  expect(await across(field)).toEqual({ x: before.x, width: before.width });
  await clear.click();
  await expect(stage.getByText("Every carrier")).toBeVisible();
  expect(await across(field)).toEqual({ x: before.x, width: before.width });
  expect(await across(range)).toEqual({ x: rangeBefore.x, width: rangeBefore.width });
});

test("A select is as wide as its natural width, not as its longest option", async ({ page }) => {
  await openExample(page, "sizes", "a-row-that-holds-still");
  const stage = example(page, "a-row-that-holds-still");
  const status = stage.getByLabel("Status");
  const before = await box(status);
  await status.selectOption("Held at customs until the papers of origin are checked");
  expect(await box(status)).toEqual(before);
  // Sixteen characters, not the fifty of the long option.
  expect(before.width).toBeLessThan(260);
  // A search field beside it writes, and its cross comes: nothing moves.
  const search = stage.getByLabel("Search shipments");
  const searchBefore = await box(search.locator(".."));
  await search.fill("Hamburg");
  await expect(stage.getByRole("button", { name: "Clear input" })).toBeVisible();
  expect(await box(search.locator(".."))).toEqual(searchBefore);
  expect(await box(status)).toEqual(before);
});

test("chars fixes a field at the width of its value", async ({ page }) => {
  await openExample(page, "sizes", "sized-to-the-value");
  const stage = example(page, "sized-to-the-value");
  const postcode = stage.getByLabel("Postcode");
  const city = stage.getByLabel("City");
  const iban = stage.getByLabel("IBAN");
  const postcodeWidth = (await box(postcode.locator(".."))).width;
  // Five characters and the padding: narrower than the twenty of the city.
  expect(postcodeWidth).toBeLessThan((await box(city.locator(".."))).width / 2);
  // The values fit whole: no field cuts its own value.
  for (const field of [postcode, iban]) {
    const cut = await field.evaluate((element: HTMLInputElement) => element.scrollWidth > element.clientWidth);
    expect(cut).toBe(false);
  }
});

/* The field's own markup, cloned beside it with a count as `chars` would hand
   it in (lib/extent.ts): the stylesheet's arithmetic measured on the real
   classes, without a second example on the page. */
const widthAt = (field: Locator, count: number) =>
  field.evaluate((element, chars) => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.setProperty("--_chars", String(chars));
    clone.style.inlineSize = "fit-content";
    element.after(clone);
    const width = clone.getBoundingClientRect().width;
    clone.remove();
    return width;
  }, count);

test("chars at the default count is the natural width, and every character counts", async ({ page }) => {
  await openExample(page, "sizes", "a-row-that-holds-still");
  const stage = example(page, "a-row-that-holds-still");
  // A text field's sixteen, a select's sixteen, a multiselect's twenty.
  for (const [field, natural] of [
    [stage.getByLabel("Search shipments").locator(".."), 16],
    [stage.getByLabel("Status").locator(".."), 16],
    [stage.getByRole("button", { name: "Carriers", exact: true }).locator(".."), 20],
  ] as const) {
    const width = (await box(field)).width;
    expect(Math.abs((await widthAt(field, natural)) - width)).toBeLessThanOrEqual(0.5);
  }

  await openExample(page, "sizes", "sized-to-the-value");
  const postcode = example(page, "sized-to-the-value").getByLabel("Postcode").locator("..");
  const five = (await box(postcode)).width;
  const ten = await widthAt(postcode, 10);
  // Five characters more are five `ch` of the field's own type wider.
  const ch = await postcode.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;inline-size:1ch";
    element.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  });
  expect(Math.abs(ten - five - 5 * ch)).toBeLessThanOrEqual(0.5);
});

test("A multiselect holds still in a column too", async ({ page }) => {
  await openExample(page, "sizes", "narrow-places");
  const field = example(page, "narrow-places").locator(".exampleStage [aria-haspopup]").last().locator("..");
  const before = await box(field);
  await field.locator("[aria-haspopup]").click();
  const panel = page.getByRole("dialog");
  for (const person of ["Ada Okafor", "Jun Park"]) await panel.getByText(person, { exact: true }).click();
  await page.keyboard.press("Escape");
  expect(await box(field)).toEqual(before);
  for (let i = 0; i < 4; i++) await field.locator("[data-value]").first().click();
  expect(await box(field)).toEqual(before);
});

test("A message under a field in a row wraps there and moves nothing", async ({ page }) => {
  await openExample(page, "sizes", "sized-to-the-value");
  const stage = example(page, "sized-to-the-value");
  const postcode = stage.getByLabel("Postcode");
  const city = stage.getByLabel("City");
  const field = await box(postcode.locator(".."));
  const cityBefore = await box(city.locator(".."));
  await postcode.fill("204");
  await expect(stage.getByText("Five digits.")).toBeVisible();
  expect(await box(postcode.locator(".."))).toEqual(field);
  expect(await box(city.locator(".."))).toEqual(cityBefore);
});

test("A date picker without chars shows its whole date", async ({ page }) => {
  await openExample(page, "sizes", "sized-to-the-value");
  // The trigger is named by its FormField's label; its first child is the value.
  const value = example(page, "sized-to-the-value").getByRole("button", { name: "Due" });
  const cut = await value.evaluate((trigger) => {
    const text = trigger.firstElementChild as HTMLElement;
    return text.scrollWidth > text.clientWidth;
  });
  expect(cut).toBe(false);
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test("no field is wider than its place, and the page does not scroll sideways", async ({ page }) => {
    for (const id of ["narrow-places", "a-row-that-holds-still", "sized-to-the-value", "one-size-for-a-place", "a-row-of-fields"]) {
      await openExample(page, "sizes", id);
      const stage = example(page, id);
      const stageBox = await box(stage);
      const fields = stage.locator("input, select, textarea, [aria-haspopup]");
      for (let i = 0; i < (await fields.count()); i++) {
        const field = fields.nth(i);
        if (!(await field.isVisible())) continue;
        const rect = await box(field);
        expect(rect.x + rect.width, `${id} #${i}`).toBeLessThanOrEqual(stageBox.x + stageBox.width + 0.5);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    }
  });

  test("a value too long for the place ends in an ellipsis", async ({ page }) => {
    await openExample(page, "sizes", "narrow-places");
    const slot = example(page, "narrow-places").getByRole("button", { name: "Window" });
    const cut = await slot.evaluate((trigger) => {
      const text = trigger.firstElementChild as HTMLElement;
      return text.scrollWidth > text.clientWidth && getComputedStyle(text).textOverflow === "ellipsis";
    });
    expect(cut).toBe(true);
  });

  test("a segmented control too wide for the place ends its words in an ellipsis", async ({ page }) => {
    await openExample(page, "segmentedcontrol", "long-words-in-a-narrow-place");
    const stage = example(page, "long-words-in-a-narrow-place");
    const control = stage.getByRole("radiogroup");
    const room = await box(stage);
    const rect = await box(control);
    expect(rect.x + rect.width).toBeLessThanOrEqual(room.x + room.width + 0.5);
    const cut = await control.getByText("Cleaned and validated readings", { exact: true }).evaluate(
      (word) => word.scrollWidth > word.clientWidth && getComputedStyle(word).textOverflow === "ellipsis",
    );
    expect(cut).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});

test("One size for a place reaches every control, and a dialog keeps its own", async ({ page }) => {
  await openExample(page, "sizes", "one-size-for-a-place");
  const stage = example(page, "one-size-for-a-place");
  const small = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--u-control-height-sm")),
  );
  const regular = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--u-control-height")),
  );
  /* The layout height, which a dialog's entering scale does not touch. */
  const height = (locator: Locator) => locator.evaluate((element) => (element as HTMLElement).offsetHeight);
  for (const control of [
    stage.getByLabel("Search tickets").locator(".."),
    stage.getByLabel("Team"),
    stage.getByRole("button", { name: "Opened on", exact: true }),
    stage.getByRole("button", { name: "Open", exact: true }),
    stage.getByRole("button", { name: "New ticket" }),
  ]) {
    expect(await height(control)).toBe(small);
  }
  await stage.getByRole("button", { name: "New ticket" }).click();
  const save = page.getByRole("dialog").getByRole("button", { name: "Save" });
  await expect(save).toBeVisible();
  expect(await height(save)).toBe(regular);
});

test("Every control in a row of fields stands on the select's line", async ({ page }) => {
  await openExample(page, "sizes", "a-row-of-fields");
  const stage = example(page, "a-row-of-fields");
  const middle = async (locator: Locator) => {
    const rect = await box(locator);
    return rect.y + rect.height / 2;
  };
  for (const name of ["Medium", "Small"]) {
    const row = stage.getByRole("group", { name });
    const line = await middle(row.getByLabel("Caster"));
    // A word's own line: the box of its label, one line tall.
    for (const word of ["Raw", "Measured", "Show archived", "Live"]) {
      const words = row.getByText(word, { exact: true });
      expect(Math.abs((await middle(words)) - line), `${name}: ${word}`).toBeLessThanOrEqual(1);
    }
  }
});

test("A segmented control is a field in the row, and holds still while it is switched", async ({ page }) => {
  await openExample(page, "sizes", "a-row-of-fields");
  for (const name of ["Medium", "Small"]) {
    const row = example(page, "a-row-of-fields").getByRole("group", { name });
    const select = await box(row.getByLabel("Caster"));
    const control = row.getByRole("radiogroup", { name: "Values" });
    const before = await box(control);
    // The same box as the select's, top and bottom.
    expect(Math.abs(before.y - select.y), `${name}: top`).toBeLessThanOrEqual(0.5);
    expect(Math.abs(before.height - select.height), `${name}: height`).toBeLessThanOrEqual(0.5);
    // The input lies over its whole segment: a click anywhere on it lands there.
    const forecast = control.getByRole("radio", { name: "Forecast" });
    await forecast.click();
    await expect(forecast).toBeChecked();
    expect(await box(control)).toEqual(before);
  }
});

test("A checkbox or switch outside a field keeps its own height", async ({ page }) => {
  // Outside a field they stand in lists, where a control's height would spread them apart.
  const height = async (locator: Locator) => (await box(locator)).height;
  await openExample(page, "checkbox", "select-all-with-a-mixed-state");
  expect(await height(page.getByText("Maya Lindgren", { exact: true }).locator(".."))).toBeLessThan(20);
  await openExample(page, "switch", "settings-of-a-service");
  expect(await height(page.getByRole("switch").first().locator(".."))).toBeLessThan(20);
});

/* segmented-control-inset 01: `fill` - the control takes its place's width,
   its segments share it equally, and the choice moves nothing. */
for (const width of [1280, 320]) {
  test(`A filling segmented control takes its place and shares it equally (${width} px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await openExample(page, "segmentedcontrol", "a-theme-switch");
    const control = example(page, "a-theme-switch").getByRole("radiogroup", { name: "Theme" });
    const place = await control.evaluate((element) => element.parentElement!.getBoundingClientRect().width);
    const before = await box(control);
    expect(Math.abs(before.width - place)).toBeLessThanOrEqual(0.5);
    const widths: number[] = [];
    for (const name of ["Light", "Dark", "System"]) {
      const segment = await box(control.getByRole("radio", { name }));
      widths.push(segment.width);
      // The word stands in the middle of its segment.
      const word = await box(control.getByText(name, { exact: true }));
      expect(Math.abs(word.x + word.width / 2 - (segment.x + segment.width / 2)), name).toBeLessThanOrEqual(1);
    }
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
    await control.getByRole("radio", { name: "Dark" }).click();
    expect(await box(control)).toEqual(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
}
