/* The picture of plot and axes (ADR-0075): the example's button hands over
   `toPng()`, and the image beside the chart is read in the page. Both schemes
   run: the ground and the text pixels are the scheme's. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { openExample } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

/** The picture's pixels, kept in the page under a name. */
async function keep(image: Locator, name: string): Promise<{ width: number; height: number }> {
  return image.evaluate(async (el, key) => {
    const img = el as HTMLImageElement;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.drawImage(img, 0, 0);
    (window as unknown as Record<string, ImageData>)[key] = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return { width: canvas.width, height: canvas.height };
  }, name);
}

/** Pixels of a kept picture inside a rectangle of the root, in the root's CSS
    pixels, that differ from `ground` by more than a few levels. */
async function inked(page: Page, name: string, ground: string, rect: { x: number; y: number; width: number; height: number }): Promise<number> {
  return page.evaluate(
    ([key, color, r]) => {
      const data = (window as unknown as Record<string, ImageData>)[key as string] as ImageData;
      const probe = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
      probe.fillStyle = color as string;
      probe.fillRect(0, 0, 1, 1);
      const [gr, gg, gb] = probe.getImageData(0, 0, 1, 1).data;
      const k = data.width / (r as { scale: number }).scale;
      const box = r as { x: number; y: number; width: number; height: number };
      let count = 0;
      for (let y = Math.floor(box.y * k); y < Math.ceil((box.y + box.height) * k); y++) {
        for (let x = Math.floor(box.x * k); x < Math.ceil((box.x + box.width) * k); x++) {
          const i = (y * data.width + x) * 4;
          if (Math.abs((data.data[i] as number) - (gr as number)) + Math.abs((data.data[i + 1] as number) - (gg as number)) + Math.abs((data.data[i + 2] as number) - (gb as number)) > 24) count++;
        }
      }
      return count;
    },
    [name, ground, { ...rect, scale: 1 }] as const,
  );
}

async function open(page: Page) {
  await openExample(page, "chart", "picture");
  const example = page.locator('[data-example="picture"]');
  await example.scrollIntoViewIfNeeded();
  return example;
}

test("the picture is twice the chart, on its ground, with its tick labels", async ({ page }) => {
  const example = await open(page);
  await example.locator("[data-picture]").click();
  const image = example.locator('[data-role="picture"]');
  await expect(image).toBeVisible();
  const size = await keep(image, "A");

  const root = example.locator(".uc-root");
  const box = await root.evaluate((el) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--uc-color-bg)";
    el.appendChild(probe);
    const ground = getComputedStyle(probe).color;
    probe.remove();
    const r = el.getBoundingClientRect();
    return { width: el.clientWidth, height: el.clientHeight, left: r.left, top: r.top, ground };
  });
  expect(await page.evaluate(() => devicePixelRatio)).toBe(1);
  expect(size).toEqual({ width: box.width * 2, height: box.height * 2 });

  // The corner holds the ground, as a corner of the picture's first pixels.
  expect(await inked(page, "A", box.ground, { x: 0, y: 0, width: 4, height: 4 })).toBe(0);

  // A tick label's rectangle holds text.
  const label = await example.locator(".uc-axis-x .uc-tick-label").first().boundingBox();
  if (label === null) throw new Error("no tick label");
  expect(await inked(page, "A", box.ground, { x: label.x - box.left, y: label.y - box.top, width: label.width, height: label.height })).toBeGreaterThan(10);
});

test("a pointer on the plot leaves neither crosshair nor tooltip in the picture", async ({ page }) => {
  const example = await open(page);
  const button = example.locator("[data-picture]");
  await button.click();
  const image = example.locator('[data-role="picture"]');
  await expect(image).toBeVisible();
  const first = await image.getAttribute("src");
  await keep(image, "A");

  // The pointer rests on the plot while the button, focused, takes Enter.
  const plot = await example.locator(".uc-plot").boundingBox();
  if (plot === null) throw new Error("no plot");
  await button.focus();
  await page.mouse.move(plot.x + plot.width * 0.5, plot.y + plot.height * 0.5);
  await expect(example.locator(".uc-tooltip")).toHaveCSS("opacity", "1");
  await page.keyboard.press("Enter");
  await expect(image).not.toHaveAttribute("src", first ?? "");
  await keep(image, "B");

  const same = await page.evaluate(() => {
    const w = window as unknown as Record<string, ImageData>;
    const a = w.A as ImageData;
    const b = w.B as ImageData;
    if (a.data.length !== b.data.length) return -1;
    let differing = 0;
    for (let i = 0; i < a.data.length; i++) if (a.data[i] !== b.data[i]) differing++;
    return differing;
  });
  expect(same).toBe(0);
});

test("the picture beside the chart", { tag: "@quick" }, async ({ page }, testInfo) => {
  const example = await open(page);
  await example.locator("[data-picture]").click();
  const image = example.locator('[data-role="picture"]');
  await expect(image).toBeVisible();
  await image.evaluate((el) => (el as HTMLImageElement).decode());
  await expect(image).toHaveScreenshot(`picture-${testInfo.project.name}.png`);
});
