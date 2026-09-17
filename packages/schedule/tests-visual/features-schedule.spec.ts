/* Behaviour of the schedule in the browser: its chrome, pan and zoom, hover,
   click, right-click and selection (schedule 05). Observed through what the DOM
   says - band labels, lane headers, what an example writes down - never the
   pixel mechanics in between. Light only: behaviour, not appearance. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { overlayOffenders } from "@umriss-ui/demo/checks/overlays";
import { openExample } from "./navigation";
import { colour, distanceFrom, paintedShare, rgba } from "./pixels";
import { DAY_OF_PLAN, LANE_HEIGHT, LANES, at, plotOf } from "./plot";

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

test("a bar says what the caller writes into it, cut off where it must be", async ({ page }) => {
  await openExample(page, "subtasks", "bar-labels");
  const example = page.locator('[data-example="bar-labels"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* The housing's milling runs 08:00 to 10:30 - room for the whole name. */
  const wide = example.locator('[data-bar-label="a-2041-2"]');
  await expect(wide).toHaveText("A-2041 Housing");
  const fits = await wide.evaluate((el) => {
    const text = el.firstElementChild as HTMLElement;
    return text.scrollWidth <= text.clientWidth;
  });
  expect(fits).toBe(true);

  /* The flange on the press runs an hour and a quarter: room for a label, not
     for the whole name, so it is cut. */
  const narrow = example.locator('[data-bar-label="a-2044-2"]');
  const cut = await narrow.evaluate((el) => {
    const text = el.firstElementChild as HTMLElement;
    return text.scrollWidth > text.clientWidth;
  });
  expect(cut).toBe(true);

  /* The housing's inspection is forty-five minutes: too narrow for a label
     that would say anything, so it stays silent and the tooltip answers. */
  await expect(example.locator('[data-bar-label="a-2041-3"]')).toHaveCount(0);

  /* The label lies within its bar: the box is the bar's visible main time. */
  const box = (await wide.boundingBox())!;
  expect(box.x).toBeCloseTo(plot.x(8), -1);
  expect(box.x + box.width).toBeCloseTo(plot.x(10, 30), -1);

  /* Zoomed out, the short subtasks lose their text rather than wear a row of
     dots: half an hour of inspection is then a few pixels wide. */
  const before = await example.locator("[data-bar-label]").count();
  await wheel(page, plot.x(12), plot.y(LANES.qa), 120, 8, "Control");
  await expect.poll(async () => example.locator("[data-bar-label]").count()).toBeLessThan(before);
  await expect(example.locator('[data-bar-label="a-2046-3"]')).toHaveCount(0);
});

test("a bar that began before the view keeps its label at the edge", async ({ page }) => {
  await openExample(page, "subtasks", "bar-labels");
  const example = page.locator('[data-example="bar-labels"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const label = example.locator('[data-bar-label="a-2041-2"]');

  /* Panned until the milling starts left of the view: its label follows to
     the edge instead of leaving with it. */
  await page.mouse.move(plot.x(8), plot.y(LANES.qa));
  await page.mouse.down();
  await page.mouse.move(plot.x(8) - 200, plot.y(LANES.qa), { steps: 8 });
  await page.mouse.up();

  const box = (await label.boundingBox())!;
  expect(box.x).toBeCloseTo(plot.box.x, 0);
  await expect(label).toHaveText("A-2041 Housing");
  expect(await overlayOffenders(page)).toEqual([]);
});

/* ------------------------------------------------------------------ */
/* One channel per statement (schedule-lane-groups 02)                  */
/* ------------------------------------------------------------------ */

/* The appearances are the one thing about the schedule that IS the picture, so
   these read the pixels the plot actually put down. The rectangles are worked
   out from the example's own lanes and times, as `plot.ts` works out a point a
   person would aim at.

   A bar sits centred in its lane, `laneHeight - 2 * BAR_INSET - MAX_DEPTH *
   DEPTH_STEP` high - 23 of 44 - so its middle band is a safe place to ask
   about, and a strip a few pixels wide is enough to tell a filled face from an
   empty one. */
const APPEARANCE_DOMAIN = [at(6, 30), at(11)] as const;
/** The middle third of a bar on the lane with this index, over an hour of it. */
const face = (plot: { x: (h: number, m?: number) => number; box: { x: number } }, lane: number, hour: number) => ({
  x: plot.x(hour) - plot.box.x,
  y: lane * LANE_HEIGHT + LANE_HEIGHT / 2 - 4,
  width: plot.x(hour + 1) - plot.x(hour),
  height: 8,
});

test("a provisional bar is hollow, and a released one is not", async ({ page }) => {
  await openExample(page, "subtasks", "appearances");
  const example = page.locator('[data-example="appearances"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);

  /* Lane 0 is released work, lane 1 provisional - both 07:00 to 10:00, so the
     same strip of each is asked about.

     Hollow is not "nothing at all": the grid's time ticks run the height of
     the plot beneath the bars, and a bar with no fill lets them through. That
     is the picture being right, not the test being loose - a hollow bar shows
     what is behind it, which is what hollow means. */
  expect(await paintedShare(example, "data", face(plot, 0, 8))).toBeGreaterThan(0.95);
  expect(await paintedShare(example, "data", face(plot, 1, 8))).toBeLessThan(0.05);
});

test("a fixed bar is marked at its ends and keeps its face clear", async ({ page }) => {
  await openExample(page, "subtasks", "appearances");
  const example = page.locator('[data-example="appearances"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);

  /* Lane 2, 07:00 to 10:00. The cap is three pixels in the colour the label
     takes, sitting two pixels INSIDE the end and framed by the bar's own
     colour. Flush with the end it was no mark at all: a light cap at the start
     of a bar on a light page reads as the bar beginning a little later. */
  const y = LANE_HEIGHT * 2 + LANE_HEIGHT / 2;
  const spot = (x: number) => ({ x: Math.round(x - plot.box.x), y });
  const faceColour = await colour(example, "data", spot(plot.x(8, 30)));

  expect(await colour(example, "data", spot(plot.x(7)))).toBe(faceColour);
  expect(await colour(example, "data", spot(plot.x(7) + 3))).not.toBe(faceColour);
  expect(await colour(example, "data", spot(plot.x(10) - 1))).toBe(faceColour);
  expect(await colour(example, "data", spot(plot.x(10) - 4))).not.toBe(faceColour);

  /* And between the caps the face is one colour throughout: no hatch. The
     hatch left the bars in this ticket and went to the refused lane, where
     "not available" is what it says. */
  for (const hour of [8, 9]) expect(await colour(example, "data", spot(plot.x(hour)))).toBe(faceColour);
  expect(await paintedShare(example, "data", face(plot, 2, 8))).toBeGreaterThan(0.95);
});

test("muted work is a paler colour at full height, and cannot be read as a setup", async ({ page }) => {
  await openExample(page, "subtasks", "appearances");
  const example = page.locator('[data-example="appearances"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);

  /* Lane 3 carries another shift's work from 07:00 with half an hour of setup
     before it: the two lie side by side in one picture, which is the only way
     to prove they cannot be confused. */
  const y = LANE_HEIGHT * 3 + LANE_HEIGHT / 2;
  const onBar = { x: Math.round(plot.x(8) - plot.box.x), y };
  const inSetup = { x: Math.round(plot.x(6, 45) - plot.box.x), y };

  /* Full height: the bar's top rows are painted. A half-height bar - which is
     what muted used to be - would leave them empty. */
  expect(await paintedShare(example, "data", { x: onBar.x, y: LANE_HEIGHT * 3 + 12, width: 20, height: 3 })).toBe(1);

  /* And a different colour from the setup beside it, by a margin and not by a
     rounding: user story 4 asks for "without doubt", so the test asks for a
     distance and not merely for inequality. */
  expect(await distanceFrom(example, "data", onBar, await rgba(example, "data", inSetup))).toBeGreaterThan(50);

  /* Nor is it simply the task colour - that is the whole point of the
     channel. */
  const plain = { x: onBar.x, y: LANE_HEIGHT / 2 };
  expect(await distanceFrom(example, "data", onBar, await rgba(example, "data", plain))).toBeGreaterThan(50);
});

test("the progress rail lies within the main time and stops at its end", async ({ page }) => {
  await openExample(page, "subtasks", "appearances");
  const example = page.locator('[data-example="appearances"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);

  /* Lane 4: 07:00 to 10:00 at 65 per cent, with half an hour of teardown after
     it. The rail is a mark ON the bar, so it lies above the bar's own bottom
     edge - and it measures the WORK, so it must stop where the main time
     does. */
  const bottom = LANE_HEIGHT * 4 + LANE_HEIGHT / 2 + 11 - 4;
  const done = plot.x(7) + 0.65 * (plot.x(10) - plot.x(7));
  const spot = (x: number) => ({ x: x - plot.box.x, y: bottom });

  const onWork = await colour(example, "data", spot(plot.x(8)));
  const stillToDo = await colour(example, "data", spot(done + 20));
  const underTeardown = await colour(example, "data", spot(plot.x(10, 15)));
  /* Done, still to do, and the teardown: three different things at that
     height. If the rail ran on, the last two would be one. */
  expect(onWork).not.toBe(stillToDo);
  expect(underTeardown).not.toBe(onWork);
  expect(underTeardown).not.toBe(stillToDo);

  /* And it is inset: the bar's lowest row is the bar, not the rail. */
  const lowest = { x: plot.x(8) - plot.box.x, y: LANE_HEIGHT * 4 + LANE_HEIGHT / 2 + 10 };
  expect(await colour(example, "data", lowest)).not.toBe(onWork);
});

test("a bar fades at whichever edge of the view it passes", async ({ page }) => {
  await openExample(page, "subtasks", "appearances");
  const example = page.locator('[data-example="appearances"]');
  const width = (await example.locator("[data-schedule-plot]").boundingBox())!.width;

  /* Lane 5 runs past the right edge, lane 6 began before the left one. A fade
     is a gradient into the surface, so the test asks how far each place stands
     from the bar's own solid colour: further, the nearer the edge. */
  const mid = (lane: number) => lane * LANE_HEIGHT + LANE_HEIGHT / 2;

  const solidRight = await rgba(example, "data", { x: width - 60, y: mid(5) });
  const near = await distanceFrom(example, "data", { x: width - 2, y: mid(5) }, solidRight);
  const far = await distanceFrom(example, "data", { x: width - 12, y: mid(5) }, solidRight);
  expect(near).toBeGreaterThan(far);
  expect(far).toBeGreaterThan(0);

  const solidLeft = await rgba(example, "data", { x: 60, y: mid(6) });
  const nearLeft = await distanceFrom(example, "data", { x: 1, y: mid(6) }, solidLeft);
  const farLeft = await distanceFrom(example, "data", { x: 11, y: mid(6) }, solidLeft);
  expect(nearLeft).toBeGreaterThan(farLeft);
  expect(farLeft).toBeGreaterThan(0);
});

test("three statements on one bar stay three statements", async ({ page }) => {
  await openExample(page, "subtasks", "combinations");
  const example = page.locator('[data-example="combinations"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);
  const width = (await example.locator("[data-schedule-plot]").boundingBox())!.width;

  /* Lane 0: another shift's, fixed, and running past the right edge. The
     saturation says the first, a cap at 07:00 says the second, the fade at the
     right edge says the third - and the fade is what takes the cap that would
     have stood at the bar's own end, which lies outside the view. */
  const mid = LANE_HEIGHT / 2;
  const cap = await colour(example, "data", { x: Math.round(plot.x(7) + 3 - plot.box.x), y: mid });
  const faceColour = await colour(example, "data", { x: Math.round(plot.x(9) - plot.box.x), y: mid });
  expect(cap).not.toBe(faceColour);

  const solid = await rgba(example, "data", { x: width - 60, y: mid });
  expect(await distanceFrom(example, "data", { x: width - 2, y: mid }, solid)).toBeGreaterThan(
    await distanceFrom(example, "data", { x: width - 12, y: mid }, solid),
  );

  /* Lane 2 was given provisional then fixed: the later word wins, so it is
     capped and its face is filled. Lane 3 was given them the other way round
     and is hollow. */
  expect(await paintedShare(example, "data", face(plot, 2, 8))).toBeGreaterThan(0.95);
  expect(await paintedShare(example, "data", face(plot, 3, 8))).toBeLessThan(0.05);

  /* And no bar loses its label to an appearance. The hollow ones lie on the
     surface, so their text is the page's own; the filled ones take whatever
     reads on their fill. */
  const on = async (id: string) => await example.locator(`[data-bar-label="${id}"]`).getAttribute("data-on");
  expect(await on("reopened")).toBe("light");
  expect(await on("planned")).toBe("light");
  expect(await on("settled")).toBe("dark");
  /* A muted bar is the task colour mixed half into the surface, which lands in
     the middle of the range - and there the page's own text colour is the one
     that reads, in either theme. A single luminance threshold got this wrong
     and put white on a salmon bar; the contrast is measured instead. */
  expect(await on("all-three")).toBe("light");
});
