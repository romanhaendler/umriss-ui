/* Behaviour of the schedule in the browser: its chrome, pan and zoom, hover,
   click, right-click and selection (schedule 05). Observed through what the DOM
   says - band labels, lane headers, what an example writes down - never the
   pixel mechanics in between. Light only: behaviour, not appearance. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { openExample } from "./navigation";
import { DAY_OF_PLAN, LANES, plotOf } from "./plot";

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const tickLabels = (example: Locator) => example.locator("[data-schedule-ticks] span span").allTextContents();

async function tickPositions(example: Locator): Promise<Record<string, number>> {
  const labels = example.locator("[data-schedule-ticks] span span");
  const out: Record<string, number> = {};
  for (const label of await labels.all()) {
    const box = await label.boundingBox();
    if (box !== null) out[(await label.textContent()) ?? ""] = box.x + box.width / 2;
  }
  return out;
}

async function wheel(page: Page, x: number, y: number, deltaY: number, times: number, modifier?: "Control") {
  await page.mouse.move(x, y);
  if (modifier) await page.keyboard.down(modifier);
  for (let i = 0; i < times; i++) {
    await page.mouse.wheel(0, deltaY);
    await page.waitForTimeout(30);
  }
  if (modifier) await page.keyboard.up(modifier);
}

test("the schedule carries its name, and the lane headers are text", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const figure = page.locator('[data-example="first-schedule"]').getByRole("figure", { name: "Plan of Tuesday, 17 March" });
  await expect(figure).toBeVisible();
  await expect(figure.locator("[data-schedule-headers]")).toHaveText(/Saw 1.*Lathe 1.*Lathe 2.*Mill.*Press 2.*Paint shop.*Inspection/);
  await expect(figure.locator("canvas").first()).toHaveAttribute("aria-hidden", "true");
});

test("the day band names the day, and the fine band steps in hours", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  await expect(example.locator("[data-schedule-days]")).toContainText("17 March 2026");
  expect(await tickLabels(example)).toEqual(expect.arrayContaining(["06:00", "07:00", "12:00", "17:00"]));
});

test("zooming in with Ctrl and the wheel steps the fine band down to the quarter hour", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  await wheel(page, plot.x(10), plot.y(LANES.qa), -120, 25, "Control");
  await expect.poll(async () => (await tickLabels(example)).some((label) => label.endsWith(":15"))).toBe(true);
  /* The instant under the pointer kept its place: 10:00 is still in view. */
  expect(await tickLabels(example)).toContain("10:00");
});

test("zooming out with Ctrl and the wheel steps the fine band up past the hour", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  await wheel(page, plot.x(12), plot.y(LANES.qa), 120, 12, "Control");
  await expect.poll(async () => (await tickLabels(example)).includes("07:00")).toBe(false);
});

test("the plain wheel does not zoom, and scrolls the page where the lanes fit", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const labels = await tickLabels(example);
  const pageBefore = await page.evaluate(() => document.scrollingElement!.scrollTop);
  await wheel(page, plot.x(10), plot.y(LANES.qa), 120, 3);
  expect(await tickLabels(example)).toEqual(labels);
  await expect.poll(() => page.evaluate(() => document.scrollingElement!.scrollTop)).toBeGreaterThan(pageBefore);
});

test("the wheel scrolls the lanes, and lets the page scroll on at their end", async ({ page }) => {
  await openExample(page, "schedule", "many-lanes");
  const example = page.locator('[data-example="many-lanes"]');
  const headers = example.locator("[data-schedule-headers]");
  const last = headers.getByText("Cell 20");
  const plot = example.locator("[data-schedule-plot]");
  const box = (await plot.boundingBox())!;
  const frame = (await headers.boundingBox())!;
  const scrollTop = () => page.evaluate(() => document.scrollingElement!.scrollTop);

  /* Twenty lanes of 32 pixels in a plot of about 244: some 400 pixels to go. */
  const pageBefore = await scrollTop();
  await wheel(page, box.x + box.width / 2, box.y + box.height / 2, 100, 2);
  expect(await scrollTop()).toBe(pageBefore);

  await wheel(page, box.x + box.width / 2, box.y + box.height / 2, 100, 6);
  const moved = (await last.boundingBox())!;
  expect(moved.y + moved.height).toBeLessThanOrEqual(frame.y + frame.height + 1);
  await expect.poll(scrollTop).toBeGreaterThan(pageBefore);
});

test("panning moves the time, and the headers and bands hold still", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const headers = example.locator("[data-schedule-headers]");
  const headerBefore = await headers.boundingBox();
  const bandBefore = await example.locator("[data-schedule-ticks]").boundingBox();
  const before = await tickPositions(example);

  /* On the empty inspection lane at 08:00: nothing to drag there, so it pans. */
  await page.mouse.move(plot.x(8), plot.y(LANES.qa));
  await page.mouse.down();
  await page.mouse.move(plot.x(8) - 150, plot.y(LANES.qa), { steps: 6 });
  await page.mouse.up();

  const after = await tickPositions(example);
  expect(after["12:00"]).toBeCloseTo(before["12:00"]! - 150, -1);
  expect(await headers.boundingBox()).toEqual(headerBefore);
  expect(await example.locator("[data-schedule-ticks]").boundingBox()).toEqual(bandBefore);
});

test("dragging up brings the lower lanes into view, headers with them", async ({ page }) => {
  await openExample(page, "schedule", "many-lanes");
  const example = page.locator('[data-example="many-lanes"]');
  const headers = example.locator("[data-schedule-headers]");
  const last = headers.getByText("Cell 20");
  const frame = (await headers.boundingBox())!;
  expect((await last.boundingBox())!.y).toBeGreaterThan(frame.y + frame.height);

  const plot = example.locator("[data-schedule-plot]");
  const box = (await plot.boundingBox())!;
  /* Late in the day, where no cell has work: the drag pans. */
  await page.mouse.move(box.x + box.width - 10, box.y + box.height - 10);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 10, box.y - 400, { steps: 10 });
  await page.mouse.up();

  const moved = (await last.boundingBox())!;
  expect(moved.y + moved.height).toBeLessThanOrEqual(frame.y + frame.height + 1);
  expect((await headers.boundingBox())!.x).toBe(frame.x);
});

test("hover, click and right-click report their target", async ({ page }) => {
  await openExample(page, "schedule", "interactions");
  const example = page.locator('[data-example="interactions"]');
  const status = example.locator("[data-last-interaction]");
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* A-2041 on the saw, 06:00 to 07:00. */
  await page.mouse.move(plot.x(6, 30), plot.y(LANES.saw));
  await expect(status).toHaveText("hover: subtask a-2041-1 (main) at 06:30");
  await page.mouse.move(plot.x(5, 50), plot.y(LANES.saw));
  await expect(status).toHaveText(/^hover: subtask a-2041-1 \(setup\)/);

  await page.mouse.click(plot.x(15), plot.y(LANES.saw), { button: "right" });
  /* A pixel is about a minute here; where the pointer lands on it decides. */
  await expect(status).toHaveText(/^contextmenu: lane saw at (14:59|15:00|15:01)$/);

  await page.mouse.click(plot.x(6, 30), plot.y(LANES.saw));
  await expect(status).toHaveText("click: subtask a-2041-1 (main) at 06:30");
});

test("a click selects the whole task with the stop it hit, and a click on nothing clears it", async ({ page }) => {
  await openExample(page, "schedule", "selection");
  const example = page.locator('[data-example="selection"]');
  const selected = example.locator("[data-selected-order]");
  await expect(selected).toHaveText("Selected: A-2043 Bracket");
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* The shaft's second subtask, on lathe 1 at 10:00. */
  await page.mouse.click(plot.x(10), plot.y(LANES.lathe1));
  await expect(selected).toHaveText("Selected: A-2042 Shaft, at a-2042-2");

  /* Another stop of the same order: the task does not change, the stop does. */
  await page.mouse.click(plot.x(8), plot.y(LANES.saw));
  await expect(selected).toHaveText("Selected: A-2042 Shaft, at a-2042-1");

  await page.mouse.click(plot.x(17), plot.y(LANES.saw));
  await expect(selected).toHaveText("Selected: nothing");
});

test("resting on a subtask shows its order, times, parts and findings", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const tooltip = example.locator("[data-schedule-tooltip]");
  await expect(tooltip).toHaveCount(0);

  /* The bracket in the paint shop, noon to 14:00: its transport from the mill
     is fifteen minutes short. */
  await page.mouse.move(plot.x(13), plot.y(LANES.paint));
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText("A-2043 Bracket");
  await expect(tooltip).toContainText("12:00–14:00");
  await expect(tooltip).toContainText("Setup 20 min");
  await expect(tooltip).toContainText("Teardown 20 min");
  await expect(tooltip).toContainText("Late transport, 15 min short");

  /* The housing on the mill shares its time with the bracket's milling. */
  await page.mouse.move(plot.x(9), plot.y(LANES.mill));
  await expect(tooltip).toContainText("A-2041 Housing");
  await expect(tooltip).toContainText("Overlap with a-2043-2");

  await page.mouse.move(plot.x(17), plot.y(LANES.saw));
  await expect(tooltip).toHaveCount(0);
});

test("resting on a transport names its route, its duration and that it is late", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  /* The bracket's move from the mill (11:30) to the paint shop's setup (11:40):
     a symmetric curve passes through the middle of its two ends. */
  await page.mouse.move((plot.x(11, 30) + plot.x(11, 40)) / 2, plot.y(LANES.press));
  const tooltip = example.locator("[data-schedule-tooltip]");
  await expect(tooltip).toContainText("a-2043-2 → a-2043-3");
  await expect(tooltip).toContainText("Transport 25 min");
  await expect(tooltip).toContainText("Late transport, 15 min short");
});

test("an application's own tooltip content replaces the default", async ({ page }) => {
  await openExample(page, "schedule", "own-tooltip");
  const example = page.locator('[data-example="own-tooltip"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  await page.mouse.move(plot.x(13), plot.y(LANES.paint));
  const tooltip = example.locator("[data-schedule-tooltip]");
  await expect(tooltip).toContainText("Northworks");
  await expect(tooltip).toContainText("1 finding");
  await expect(tooltip).not.toContainText("12:00–14:00");
});

test("the now line stands at the present", async ({ page }) => {
  await openExample(page, "schedule", "now-line");
  const example = page.locator('[data-example="now-line"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const mark = example.locator("[data-now]");
  const box = (await mark.boundingBox())!;
  /* The clock is frozen at 10:30. */
  expect(box.x + box.width / 2).toBeCloseTo(plot.x(10, 30), -1);
  await expect(page.locator('[data-example="first-schedule"] [data-now]')).toHaveCount(0);
});

test("two schedules move together, and the span is reported", async ({ page }) => {
  await openExample(page, "schedule", "in-step");
  const example = page.locator('[data-example="in-step"]');
  const span = example.locator("[data-span]");
  await expect(span).toHaveText("05:30 – 18:00");

  const upper = example.locator("[data-schedule-plot]").first();
  const box = (await upper.boundingBox())!;
  const noonBelow = () => example.locator("[data-schedule-ticks]").nth(1).locator("span span", { hasText: "12:00" });
  const before = (await noonBelow().boundingBox())!.x;

  /* Panned on the upper plan, on its last lane where nothing is drawn. */
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height - 8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5 - 120, box.y + box.height - 8, { steps: 8 });
  await page.mouse.up();

  /* The lower plan followed, and the span says where they stand. */
  await expect.poll(async () => (await noonBelow().boundingBox())!.x).toBeCloseTo(before - 120, -1);
  await expect(span).not.toHaveText("05:30 – 18:00");
});

test("the handle places the application's own mark at a time", async ({ page }) => {
  await openExample(page, "schedule", "in-step");
  const example = page.locator('[data-example="in-step"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const pin = example.locator("[data-pin]");
  const box = (await pin.boundingBox())!;
  /* `clientPointOf(14:00)` - the pin stands over the 14:00 of the upper plan. */
  expect(box.x + box.width / 2).toBeCloseTo(plot.x(14), -1);
});

test.describe("touch", () => {
  test.use({ hasTouch: true });

  test("a pinch zooms the time scale", async ({ page, context }) => {
    await openExample(page, "schedule", "first-schedule");
    const example = page.locator('[data-example="first-schedule"]');
    const plot = await plotOf(page, example, DAY_OF_PLAN);
    const before = (await tickLabels(example)).length;

    /* Two fingers, spread apart: Chromium turns the touches into pointer
       events of type "touch", which is what the schedule listens to. There is
       no multi-touch API in Playwright, so the events come through the
       protocol. */
    const cdp = await context.newCDPSession(page);
    const middle = plot.y(LANES.qa);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", points: readonly number[]) =>
      cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: points.map((x, id) => ({ x, y: middle, id })),
      });

    await touch("touchStart", [plot.x(10), plot.x(12)]);
    for (let step = 1; step <= 6; step++) {
      await touch("touchMove", [plot.x(10) - step * 25, plot.x(12) + step * 25]);
      await page.waitForTimeout(30);
    }
    await touch("touchEnd", []);

    /* Fewer hours in the same width: the fine band shows fewer labels than the
       twelve and a half hours did, and the quarter hours appear. */
    await expect.poll(async () => (await tickLabels(example)).some((label) => label.endsWith(":30") || label.endsWith(":15"))).toBe(true);
    expect((await tickLabels(example)).length).toBeLessThanOrEqual(before + 4);
  });
});

test("the operating calendar holds through pan and zoom: no removed hour gets a tick", async ({ page }) => {
  await openExample(page, "schedule", "operating-calendar");
  const example = page.locator('[data-example="operating-calendar"]');
  const removed = (labels: readonly string[]) => labels.filter((l) => /^(00|01|02|03|04|05|23):/.test(l));
  expect(removed(await tickLabels(example))).toEqual([]);

  const plot = example.locator("[data-schedule-plot]");
  const box = (await plot.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height - 8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height - 8, { steps: 8 });
  await page.mouse.up();
  expect(removed(await tickLabels(example))).toEqual([]);

  await wheel(page, box.x + box.width * 0.5, box.y + box.height - 8, -120, 10, "Control");
  expect(removed(await tickLabels(example))).toEqual([]);
});
