/* Interaction tests (R-7.2).
   They run only in the light project - they are behaviour tests, not appearance
   tests.

   The project names ("charts-light" / "charts-dark") live in the root
   playwright.config.ts and belong to no ticket of this package; they are read here
   as they stand. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { openExample } from "./navigation";

/* Every test opens what it means itself: the demo shows one page at a time, and
   `openExample` waits for the fonts and two frames - the canvas draws inside the
   rAF. The ids are unchanged; what changed with ADR-0020 is that an example now
   names the page it stands on. */
test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

/** The share of non-transparent pixels on one of the two layers. */
async function occupiedPixels(example: Locator, className: string): Promise<number> {
  return example.locator(`canvas.${className}`).first().evaluate((el) => {
    const canvas = el as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return -1;
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hits = 0;
    for (let i = 3; i < image.length; i += 4) if ((image[i] as number) > 0) hits++;
    return hits;
  });
}

/** Put the pointer on a fraction of the plot area. */
async function pointAt(
  page: Page,
  example: Locator,
  fx: number,
  fy: number,
): Promise<void> {
  const box = await example.locator(".uc-plot").first().boundingBox();
  if (box === null) throw new Error("plot area not found");
  await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy);
  await page.waitForTimeout(150);
}

test("a hover shows the crosshair and a tooltip with every series", async ({ page }) => {
  await openExample(page, "line", "multi-series");
  const example = page.locator('[data-example="multi-series"]');
  await example.scrollIntoViewIfNeeded();
  expect(await occupiedPixels(example, "uc-layer-overlay")).toBe(0);

  await pointAt(page, example, 0.98, 0.4);
  const tooltip = example.locator(".uc-tooltip");
  await expect(tooltip).toHaveCSS("opacity", "1");
  const text = await tooltip.innerText();
  for (const name of ["Series A", "Series B", "Series C", "Series D (with a gap)"]) {
    expect(text).toContain(name);
  }
  // Values at the last data point (a deterministic series, R-6.2).
  expect(text).toContain("26.933");
  expect(text).toContain("64.265");
  // The crosshair and the markers lie on the overlay layer.
  expect(await occupiedPixels(example, "uc-layer-overlay")).toBeGreaterThan(0);
});

test("the gap series is missing at the place of the gap", async ({ page }) => {
  await openExample(page, "line", "multi-series");
  const example = page.locator('[data-example="multi-series"]');
  await example.scrollIntoViewIfNeeded();
  await pointAt(page, example, 0.45, 0.5);
  const text = await example.locator(".uc-tooltip").innerText();
  expect(text).toContain("Series A");
  expect(text).toContain("Series B");
  expect(text).toContain("Series C");
  expect(text).not.toContain("Series D");
});

test("the tooltip flips to the left at the right edge", async ({ page }) => {
  await openExample(page, "line", "multi-series");
  const example = page.locator('[data-example="multi-series"]');
  await example.scrollIntoViewIfNeeded();

  await pointAt(page, example, 0.3, 0.5);
  const left = await example.locator(".uc-tooltip").boundingBox();
  const crosshairLeft = await example
    .locator(".uc-tooltip")
    .evaluate((el) => el.style.transform);

  // 0.98 still lies inside the plot area; the outer padding does not belong to it
  // and deliberately ends the hover (R-4.10).
  await pointAt(page, example, 0.98, 0.5);
  const right = await example.locator(".uc-tooltip").boundingBox();
  const plot = await example.locator(".uc-plot").boundingBox();
  if (left === null || right === null || plot === null) throw new Error("boxes missing");

  expect(crosshairLeft).not.toBe("");
  // In the middle the tooltip stands to the right of the crosshair, at the edge to
  // the left of it - in both cases it stays entirely inside the plot area.
  expect(right.x + right.width).toBeLessThanOrEqual(plot.x + plot.width + 1);
  expect(right.x).toBeGreaterThan(left.x);
});

test("the mouse leaves the plot area - the overlay is empty", async ({ page }) => {
  await openExample(page, "line", "multi-series");
  const example = page.locator('[data-example="multi-series"]');
  await example.scrollIntoViewIfNeeded();
  await pointAt(page, example, 0.5, 0.5);
  expect(await occupiedPixels(example, "uc-layer-overlay")).toBeGreaterThan(0);

  await page.mouse.move(2, 2);
  await page.waitForTimeout(200);
  expect(await occupiedPixels(example, "uc-layer-overlay")).toBe(0);
  await expect(example.locator(".uc-tooltip")).toHaveCSS("opacity", "0");
});

test("multiple axes: values per axis space, right labels right of the marks", async ({
  page,
}) => {
  await openExample(page, "axis", "axes");
  const example = page.locator('[data-example="axes"]');
  await example.scrollIntoViewIfNeeded();
  await pointAt(page, example, 0.5, 0.5);

  // Every series reads from its own y axis: three clearly separated magnitudes.
  const values = await example.locator(".uc-tooltip .uc-tooltip-value").allInnerTexts();
  const numbers = values.map((t) => Number(t.replace(/,/g, "")));
  expect(numbers).toHaveLength(3);
  const [small, large, medium] = numbers as [number, number, number];
  expect(small).toBeGreaterThan(15);
  expect(small).toBeLessThan(25);
  expect(large).toBeGreaterThan(100_000);
  expect(medium).toBeGreaterThan(500);
  expect(medium).toBeLessThan(1_000);

  // R-4.16: the tick labels of a right y axis stand to the right of their marks.
  const right = example.locator('.uc-axis-right[data-axis="large"] .uc-tick').first();
  const mark = await right.locator(".uc-tick-mark").boundingBox();
  const label = await right.locator(".uc-tick-label").boundingBox();
  if (mark === null || label === null) throw new Error("tick not found");
  expect(label.x).toBeGreaterThan(mark.x + mark.width - 1);

  // … and to the left of them on the left axis.
  const leftAxis = example.locator('.uc-axis-left[data-axis="small"] .uc-tick').first();
  const markL = await leftAxis.locator(".uc-tick-mark").boundingBox();
  const labelL = await leftAxis.locator(".uc-tick-label").boundingBox();
  if (markL === null || labelL === null) throw new Error("tick not found");
  expect(labelL.x + labelL.width).toBeLessThanOrEqual(markL.x + 1);
});

test("container resize: collapsing and expanding without an error", async ({ page }) => {
  await openExample(page, "chart", "sizes");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  const example = page.locator('[data-example="sizes"]');
  await example.scrollIntoViewIfNeeded();
  const before = await example.locator(".uc-plot").first().boundingBox();

  await example.getByRole("button", { name: "Collapse" }).click();
  await page.waitForTimeout(200);
  await expect(example.getByRole("button", { name: "Expand" })).toBeVisible();
  await example.getByRole("button", { name: "Expand" }).click();
  await page.waitForTimeout(200);

  const after = await example.locator(".uc-plot").first().boundingBox();
  if (before === null || after === null) throw new Error("plot area missing");
  expect(Math.round(after.width)).toBe(Math.round(before.width));
  expect(await occupiedPixels(example, "uc-layer-series")).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("switching the theme changes the axis and series colours without a reload", async ({ page }) => {
  await openExample(page, "line", "basic");
  const example = page.locator('[data-example="basic"]');
  await example.scrollIntoViewIfNeeded();

  const labelColor = () =>
    example.locator(".uc-tick-label").first().evaluate((el) => getComputedStyle(el).color);
  const layerSignature = () =>
    example.locator("canvas.uc-layer-series").evaluate((el) => {
      const canvas = el as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");
      if (ctx === null) return "";
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let sum = 0;
      for (let i = 0; i < image.length; i += 4) {
        sum = (sum + (image[i] as number) * (i % 997)) % 2_147_483_647;
      }
      return String(sum);
    });

  const colorBefore = await labelColor();
  const signatureBefore = await layerSignature();

  await page.getByRole("button", { name: /Light theme|Dark theme/ }).click();
  await page.waitForTimeout(250);

  expect(await labelColor()).not.toBe(colorBefore);
  expect(await layerSignature()).not.toBe(signatureBefore);
  // No reload: the demo is still the same page.
  await expect(example.locator("canvas.uc-layer-series")).toBeVisible();
});

/** The mean y position of every pixel of one exact colour on the overlay, as a
    fraction of the canvas height. -1 when the colour does not occur. The hover
    markers are the only series colours on this layer - the crosshair is grey. */
async function markerPosition(
  example: Locator,
  r: number,
  g: number,
  b: number,
): Promise<number> {
  return example
    .locator("canvas.uc-layer-overlay")
    .first()
    .evaluate(
      (el, color) => {
        const canvas = el as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        if (ctx === null) return -1;
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let sum = 0;
        let hits = 0;
        for (let i = 0; i < image.length; i += 4) {
          if (
            image[i] === color[0] &&
            image[i + 1] === color[1] &&
            image[i + 2] === color[2] &&
            (image[i + 3] as number) > 200
          ) {
            sum += Math.floor(i / 4 / canvas.width);
            hits++;
          }
        }
        return hits === 0 ? -1 : sum / hits / canvas.height;
      },
      [r, g, b],
    );
}

/** The number behind a series name in the built-in tooltip. */
function valueOf(text: string, name: string): number {
  const hit = new RegExp(`${name}\\s*([\\d.,]+)`).exec(text);
  if (hit === null) throw new Error(`no value for "${name}" in: ${text}`);
  return Number((hit[1] as string).replace(/\./g, "").replace(",", "."));
}

test("the mixed example: the tooltip carries every series kind", async ({ page }) => {
  await openExample(page, "chart", "mixed");
  const example = page.locator('[data-example="mixed"]');
  await example.scrollIntoViewIfNeeded();
  await pointAt(page, example, 0.8, 0.5);
  const text = await example.locator(".uc-tooltip").innerText();
  // Bars, a band area, a line and a scatter at one position, in one chart.
  for (const name of ["Inflow", "Outflow", "Corridor", "Stock", "Samples"]) {
    expect(text).toContain(name);
  }
});

test("the mixed example: the bar marker follows the value, not the foot", async ({
  page,
}) => {
  await openExample(page, "chart", "mixed");
  const example = page.locator('[data-example="mixed"]');
  await example.scrollIntoViewIfNeeded();

  // Two periods with clearly different inflow. If the marker sat at the foot of
  // the bar - the baseline 0 - it would lie in the same place both times.
  await pointAt(page, example, 0.22, 0.5);
  const smallValue = valueOf(await example.locator(".uc-tooltip").innerText(), "Inflow");
  const smallPosition = await markerPosition(example, 37, 99, 235);

  await pointAt(page, example, 0.78, 0.5);
  const largeValue = valueOf(await example.locator(".uc-tooltip").innerText(), "Inflow");
  const largePosition = await markerPosition(example, 37, 99, 235);

  expect(smallPosition).toBeGreaterThan(0);
  expect(largePosition).toBeGreaterThan(0);
  expect(largeValue).toBeGreaterThan(smallValue);
  // A larger value means further up, so a smaller y fraction.
  expect(largePosition).toBeLessThan(smallPosition);
});

/* ------------------------------------------------------------------------
   The operation instruments.

   The exact position of the lanes is NOT nailed down here - a test that guesses
   fractions of the plot area checks the layout calculation and not the statement.
   Instead the pointer is moved across the area and what comes out is checked.
   ------------------------------------------------------------------------ */

const STATES = ["Production", "Setup", "Fault", "Maintenance"];
const MACHINES = ["Furnace 1", "Press 2", "Mill 3"];

/** What the tooltip says at a place; empty when it says nothing. */
async function tooltipText(page: Page, example: Locator, fx: number, fy: number): Promise<string> {
  await pointAt(page, example, fx, fy);
  const tooltip = example.locator(".uc-tooltip").first();
  if ((await tooltip.count()) === 0) return "";
  const visible = await tooltip.evaluate((el) => getComputedStyle(el).opacity);
  return visible === "1" ? await tooltip.innerText() : "";
}

test("state band: the hit names a state, not its code", async ({
  page,
}) => {
  await openExample(page, "limitline", "limits-and-state");
  const example = page.locator('[data-example="limits-and-state"]');
  await example.scrollIntoViewIfNeeded();

  const seen = new Set<string>();
  let hits = 0;
  for (let i = 0; i < 12; i++) {
    for (const fy of [0.7, 0.8, 0.9]) {
      const text = await tooltipText(page, example, 0.12 + i * 0.07, fy);
      const name = STATES.find((z) => text.includes(z));
      if (name === undefined) continue;
      hits++;
      seen.add(name);
      // A tooltip showing "2" would never have read the state list: the accessor
      // yields a code, and a code is no information.
      expect(text).not.toMatch(/^\s*[0-3][.,]00\s*$/m);
    }
  }
  expect(hits).toBeGreaterThan(8);
  // Across a band the state changes - otherwise the test would only prove that
  // something is reported.
  expect(seen.size).toBeGreaterThan(1);
});

test("state band: every lane answers for itself", async ({ page }) => {
  await openExample(page, "limitline", "limits-and-state");
  // Without the lane condition one lane would catch everything lying beneath it,
  // and a stack would not be readable.
  const example = page.locator('[data-example="limits-and-state"]');
  await example.scrollIntoViewIfNeeded();

  const order: string[] = [];
  for (let k = 0; k <= 20; k++) {
    const fy = 0.55 + k * 0.022;
    const text = await tooltipText(page, example, 0.35, fy);
    const machine = MACHINES.find((m) => text.includes(m));
    if (machine === undefined) continue;
    // Exactly one machine per place: two would be two lanes at one point.
    expect(MACHINES.filter((m) => text.includes(m))).toHaveLength(1);
    if (order[order.length - 1] !== machine) order.push(machine);
  }

  // All three occur, and from top to bottom in this order - the same one the axis
  // writes to its ticks.
  expect(order).toEqual(MACHINES);
});

test("matrix: the tooltip carries the value, not the row number", async ({ page }) => {
  await openExample(page, "matrix", "matrix");
  // Colour alone can transport no number. The cell has to give up its value as
  // text, otherwise the matrix is empty for part of its readers.
  const example = page.locator('[data-example="matrix"]');
  await example.scrollIntoViewIfNeeded();
  const text = await tooltipText(page, example, 0.5, 0.5);
  expect(text).toContain("OEE");
  // OEE lies between 18 and 94; a row number 0-7 does not.
  const numbers = [...text.matchAll(/(\d+)[.,]\d+/g)].map((m) => Number(m[1]));
  expect(numbers.some((z) => z > 10)).toBe(true);
});

test("control chart: everything lies on the series layer, nothing on the overlay", async ({ page }) => {
  await openExample(page, "controlchart", "control-chart");
  const example = page.locator('[data-example="control-chart"]');
  await example.scrollIntoViewIfNeeded();
  expect(await occupiedPixels(example, "uc-layer-series")).toBeGreaterThan(0);
  expect(await occupiedPixels(example, "uc-layer-overlay")).toBe(0);
});

test("scatter under \"nearest\": the hit follows the pointer up and down", async ({ page }) => {
  // Hit by x alone, a pointer moving straight up and down names the same
  // sample the whole way. In the plane it names the one above near the top and
  // the one below near the bottom - somewhere along the course the two differ.
  await openExample(page, "scatter", "measurements");
  const example = page.locator('[data-example="measurements"]');
  await example.scrollIntoViewIfNeeded();
  let changed = 0;
  for (let fx = 0.1; fx < 0.9; fx += 0.04) {
    const top = await tooltipText(page, example, fx, 0.15);
    const bottom = await tooltipText(page, example, fx, 0.75);
    if (top !== "" && bottom !== "" && top !== bottom) changed++;
  }
  expect(changed).toBeGreaterThan(0);
});

/* ------------------------------------------------------------------------
   Zoom and pan (charts-long-series 01).

   The axis proposes, the example passes the proposal back: what is checked is
   the axis the reader sees, its tick labels. A week reads in days; a zoom far
   enough in reads in hours.
   ------------------------------------------------------------------------ */

/** The tick labels of an example's bottom x axis, left to right. */
async function xLabels(example: Locator): Promise<string[]> {
  return example.locator(".uc-axis-bottom .uc-tick-label").allInnerTexts();
}

const HOURS = /^\d\d:\d\d$/;

async function openZoom(page: Page): Promise<{ example: Locator; box: { x: number; y: number; width: number; height: number } }> {
  await openExample(page, "axis", "zoom-and-pan");
  const example = page.locator('[data-example="zoom-and-pan"]');
  await example.scrollIntoViewIfNeeded();
  const box = await example.locator(".uc-plot").first().boundingBox();
  if (box === null) throw new Error("plot area not found");
  return { example, box };
}

async function zoomIn(page: Page, x: number, y: number, steps: number): Promise<void> {
  await page.mouse.move(x, y);
  await page.keyboard.down("Control");
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(50);
  }
  await page.keyboard.up("Control");
  await page.waitForTimeout(150);
}

test("zoom: Ctrl with the wheel zooms in around the pointer, a double click shows it all", async ({ page }) => {
  const { example, box } = await openZoom(page);
  const week = await xLabels(example);
  expect(week.some((l) => HOURS.test(l))).toBe(false);
  // The instant under the pointer, to the minute, as the tooltip's header says it.
  const header = async () => (await example.locator(".uc-tooltip").innerText()).split("\n")[0]?.slice(0, -1);
  await pointAt(page, example, 0.5, 0.5);
  const under = await header();

  await zoomIn(page, box.x + box.width / 2, box.y + box.height / 2, 4);
  expect((await xLabels(example)).some((l) => HOURS.test(l))).toBe(true);
  // Around the pointer: the instant under it keeps its place (to ten minutes -
  // the tooltip snaps to a reading).
  await pointAt(page, example, 0.5, 0.5);
  expect(await header()).toBe(under);

  await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(() => xLabels(example)).toEqual(week);
});

test("zoom: a drag pans - to the left shows what comes later", async ({ page }) => {
  const { example, box } = await openZoom(page);
  const y = box.y + box.height / 2;
  await zoomIn(page, box.x + box.width / 2, y, 4);
  const before = await xLabels(example);

  await page.mouse.move(box.x + box.width * 0.8, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  const after = await xLabels(example);
  expect(after).not.toEqual(before);
  // The first label now is one that stood further right before.
  expect(before.indexOf(after[0] as string)).toBeGreaterThan(0);
});

test("zoom: the plain wheel belongs to the page", async ({ page }) => {
  const { example, box } = await openZoom(page);
  const before = await xLabels(example);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(150);
  expect(await xLabels(example)).toEqual(before);
});

test("zoom: an axis without onDomainChange does not zoom", async ({ page }) => {
  await openExample(page, "axis", "time");
  const example = page.locator('[data-example="time"]');
  await example.scrollIntoViewIfNeeded();
  const box = await example.locator(".uc-plot").first().boundingBox();
  if (box === null) throw new Error("plot area not found");
  const before = await xLabels(example);
  await zoomIn(page, box.x + box.width / 2, box.y + box.height / 2, 3);
  expect(await xLabels(example)).toEqual(before);
});

test("zoom: two fingers spread apart zoom in", async ({ page, context }) => {
  const { example, box } = await openZoom(page);
  /* Playwright has no multi-touch API: the touches come through the protocol,
     and Chromium turns them into pointer events of type "touch" - as in the
     schedule's pinch test. */
  const cdp = await context.newCDPSession(page);
  const y = box.y + box.height / 2;
  const middle = box.x + box.width / 2;
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", points: readonly number[]) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points.map((x, id) => ({ x, y, id })) });
  await touch("touchStart", [middle - 20, middle + 20]);
  for (let step = 1; step <= 8; step++) {
    await touch("touchMove", [middle - 20 - step * 40, middle + 20 + step * 40]);
    await page.waitForTimeout(30);
  }
  await touch("touchEnd", []);
  await expect.poll(async () => (await xLabels(example)).some((l) => HOURS.test(l))).toBe(true);
});

/* ------------------------------------------------------------------------
   Cursor sync (charts-long-series 04): three charts of one kiln share
   `syncId`. The crosshair is found on each overlay as the mean column of its
   pixels - the hover marker sits on the crosshair, so it does not move it.
   ------------------------------------------------------------------------ */

/** The crosshair's x in page coordinates, or null where the overlay is empty. */
async function crosshairX(overlay: Locator): Promise<number | null> {
  return overlay.evaluate((el) => {
    const canvas = el as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return null;
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let sum = 0;
    let hits = 0;
    for (let i = 3; i < image.length; i += 4) {
      if ((image[i] as number) === 0) continue;
      sum += (i >> 2) % canvas.width;
      hits++;
    }
    if (hits === 0) return null;
    const box = canvas.getBoundingClientRect();
    return box.x + ((sum / hits) * box.width) / canvas.width;
  });
}

test("cursor sync: every chart draws its crosshair at the pointer's instant, one tooltip", async ({ page }) => {
  await openExample(page, "chart", "cursor-sync");
  const example = page.locator('[data-example="cursor-sync"]');
  await example.scrollIntoViewIfNeeded();
  const overlays = example.locator("canvas.uc-layer-overlay");
  const tooltips = example.locator(".uc-tooltip");
  await expect(overlays).toHaveCount(3);

  const box = await example.locator(".uc-plot").nth(1).boundingBox();
  if (box === null) throw new Error("plot area not found");
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height / 2);
  await page.waitForTimeout(200);

  const xs = await Promise.all([0, 1, 2].map((k) => crosshairX(overlays.nth(k))));
  const [top, middle, bottom] = xs;
  expect(middle).not.toBeNull();
  // The three plots begin in one column (labels of one width), so one instant
  // is one x on the page.
  expect(Math.abs((top ?? 0) - (middle as number))).toBeLessThan(1.5);
  expect(Math.abs((bottom ?? 0) - (middle as number))).toBeLessThan(1.5);
  await expect(tooltips.nth(1)).toHaveCSS("opacity", "1");
  await expect(tooltips.nth(0)).toHaveCSS("opacity", "0");
  await expect(tooltips.nth(2)).toHaveCSS("opacity", "0");

  await page.mouse.move(2, 2);
  await page.waitForTimeout(200);
  for (let k = 0; k < 3; k++) expect(await crosshairX(overlays.nth(k))).toBeNull();
});

test("cursor sync: one controlled domain zooms all three", async ({ page }) => {
  await openExample(page, "chart", "cursor-sync");
  const example = page.locator('[data-example="cursor-sync"]');
  await example.scrollIntoViewIfNeeded();
  const bottom = example.locator(".uc-axis-bottom").nth(2).locator(".uc-tick-label");
  const before = await bottom.allInnerTexts();
  const box = await example.locator(".uc-plot").first().boundingBox();
  if (box === null) throw new Error("plot area not found");
  await zoomIn(page, box.x + box.width / 2, box.y + box.height / 2, 4);
  const after = await bottom.allInnerTexts();
  expect(after).not.toEqual(before);
  expect(after.some((l) => HOURS.test(l))).toBe(true);
});
