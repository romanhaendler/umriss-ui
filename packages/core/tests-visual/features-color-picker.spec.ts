/* The ColorPicker's square and hue strip, in a real browser: a drag on each
   moves the handle and changes the value, a drag through the black corner keeps
   the hue, and both surfaces hold in light, dark and forced colours and under a
   finger. Chromium only; the colour scheme is switched in the test. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ browserName }) => browserName !== "chromium", "Pointer behaviour once, in Chromium");

const openPanel = async (page: Page) => {
  await openExample(page, "colorpicker", "series-of-a-trend");
  await page.getByRole("button", { name: "Zone 1" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  // The panel scales in; measure its surfaces only once it stands still.
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
  return {
    square: page.getByRole("slider", { name: "Saturation and brightness" }),
    hue: page.getByRole("slider", { name: "Hue" }),
    trigger: page.getByRole("button", { name: "Zone 1" }),
  };
};

/** A drag inside the box of a surface, from one fraction of it to another. */
async function drag(page: Page, surface: Locator, from: [number, number], to: [number, number]) {
  const box = (await surface.boundingBox())!;
  const at = ([x, y]: [number, number]) => [box.x + box.width * x, box.y + box.height * y] as const;
  await page.mouse.move(...at(from));
  await page.mouse.down();
  await page.mouse.move(...at(to), { steps: 6 });
  await page.mouse.up();
}

const handleOf = (surface: Locator) => surface.locator("span").last().boundingBox();

for (const colorScheme of ["light", "dark"] as const) {
  test(`a drag on the square and on the strip changes the value and moves the handle (${colorScheme})`, { tag: "@quick" }, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    const { square, hue, trigger } = await openPanel(page);
    const before = await trigger.textContent();

    const squareHandle = await handleOf(square);
    await drag(page, square, [0.2, 0.8], [0.9, 0.1]);
    expect(await handleOf(square)).not.toEqual(squareHandle);
    expect(await square.getAttribute("aria-valuetext")).toBe("Saturation 90 %, brightness 90 %");
    const afterSquare = await trigger.textContent();
    expect(afterSquare).not.toBe(before);

    const hueHandle = await handleOf(hue);
    await drag(page, hue, [0.1, 0.5], [0.8, 0.5]);
    expect(await handleOf(hue)).not.toEqual(hueHandle);
    expect(Number(await hue.getAttribute("aria-valuenow"))).toBeGreaterThan(250);
    expect(await trigger.textContent()).not.toBe(afterSquare);
  });
}

test("a drag through the black corner keeps the hue", { tag: "@quick" }, async ({ page }) => {
  const { square, hue } = await openPanel(page);
  const hueNow = await hue.getAttribute("aria-valuenow");
  await drag(page, square, [0.5, 0.5], [0.5, 1]);
  await drag(page, square, [0.5, 1], [0, 1]);
  await expect(page.getByRole("button", { name: "Zone 1" })).toHaveText("#000000");
  expect(await hue.getAttribute("aria-valuenow")).toBe(hueNow);
  await drag(page, square, [0, 1], [0.9, 0.2]);
  expect(await hue.getAttribute("aria-valuenow")).toBe(hueNow);
});

test("neither surface scrolls the page under a finger, and the handles stay visible in forced colours", { tag: "@quick" }, async ({ page }) => {
  const { square, hue } = await openPanel(page);
  for (const surface of [square, hue]) {
    expect(await surface.evaluate((el) => getComputedStyle(el).touchAction)).toBe("none");
  }
  await page.emulateMedia({ forcedColors: "active" });
  for (const surface of [square, hue]) {
    const painted = await surface.evaluate((el) => {
      const handle = getComputedStyle(el.querySelector("span:last-child")!);
      const track = getComputedStyle(el.querySelector("span") ?? el);
      return { handleOutline: handle.outlineStyle + " " + handle.outlineWidth, handleColor: handle.outlineColor, backgroundImage: getComputedStyle(el).backgroundImage + track.backgroundImage };
    });
    expect(painted.handleOutline).toBe("solid 2px");
    expect(painted.handleColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(painted.backgroundImage).toContain("linear-gradient");
  }
});

test.describe("under a finger", () => {
  test.use({ hasTouch: true, viewport: { width: 600, height: 800 } });

  test("both surfaces are at least 24 px on each side", { tag: "@quick" }, async ({ page }) => {
    const { square, hue } = await openPanel(page);
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    for (const surface of [square, hue]) {
      const box = (await surface.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(24);
      expect(box.height).toBeGreaterThanOrEqual(24);
    }
  });
});
