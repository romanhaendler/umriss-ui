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

/** The root's position and the ground colour, for `inked`. */
async function frameOf(example: Locator) {
  return example.locator(".uc-root").evaluate((el) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--uc-color-bg)";
    el.appendChild(probe);
    const ground = getComputedStyle(probe).color;
    probe.remove();
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, ground };
  });
}

async function inkIn(page: Page, example: Locator, target: Locator, name: string): Promise<number> {
  const box = await frameOf(example);
  const r = await target.boundingBox();
  if (r === null) throw new Error("no box");
  return inked(page, name, box.ground, { x: r.x - box.left, y: r.y - box.top, width: r.width, height: r.height });
}

test("the legend, a limit's label, a mark chip and a break are in the picture", async ({ page }) => {
  const example = await open(page);
  await example.locator("[data-picture]").click();
  const image = example.locator('[data-role="picture"]');
  await expect(image).toBeVisible();
  await keep(image, "A");
  expect(await inkIn(page, example, example.locator(".uc-legend-item").first(), "A")).toBeGreaterThan(10);
  expect(await inkIn(page, example, example.locator(".uc-limit-label").first(), "A")).toBeGreaterThan(10);
  expect(await inkIn(page, example, example.locator(".uc-legend-mark").first(), "A")).toBeGreaterThan(5);
  expect(await inkIn(page, example, example.locator(".uc-break").first(), "A")).toBeGreaterThan(3);
});

test("a hidden series' chip is fainter in the picture", async ({ page }) => {
  const example = await open(page);
  // Under colour alone the chip is a box, as on screen.
  await example.locator("[data-encoding]").click();
  const entry = example.locator(".uc-legend-item").nth(1);
  const strongest = async (name: string) => {
    await example.locator("[data-picture]").click();
    const image = example.locator('[data-role="picture"]');
    await expect(image).toBeVisible();
    await keep(image, name);
    const box = await frameOf(example);
    const r = await entry.locator(".uc-legend-chip").boundingBox();
    if (r === null) throw new Error("no chip");
    // The largest difference from the ground inside the chip.
    return page.evaluate(
      ([key, c, rect]) => {
        const data = (window as unknown as Record<string, ImageData>)[key as string] as ImageData;
        const k = data.width / (document.querySelector('[data-example="picture"] .uc-root') as HTMLElement).clientWidth;
        const probe = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
        probe.fillStyle = c as string;
        probe.fillRect(0, 0, 1, 1);
        const g = probe.getImageData(0, 0, 1, 1).data;
        const b = rect as { x: number; y: number; width: number; height: number };
        let most = 0;
        for (let y = Math.floor(b.y * k); y < Math.ceil((b.y + b.height) * k); y++)
          for (let x = Math.floor(b.x * k); x < Math.ceil((b.x + b.width) * k); x++) {
            const i = (y * data.width + x) * 4;
            most = Math.max(most, Math.abs((data.data[i] as number) - (g[0] as number)) + Math.abs((data.data[i + 1] as number) - (g[1] as number)) + Math.abs((data.data[i + 2] as number) - (g[2] as number)));
          }
        return most;
      },
      [name, box.ground, { x: r.x - box.left, y: r.y - box.top, width: r.width, height: r.height }] as const,
    );
  };
  const shown = await strongest("A");
  await entry.click();
  const hidden = await strongest("B");
  expect(hidden).toBeGreaterThan(0);
  expect(hidden).toBeLessThan(shown * 0.6);
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
