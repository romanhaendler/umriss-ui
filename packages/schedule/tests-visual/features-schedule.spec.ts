/* Behaviour of the schedule in the browser: its chrome, pan and zoom, hover,
   click, right-click and selection (schedule 05). Observed through what the DOM
   says - band labels, lane headers, what an example writes down - never the
   pixel mechanics in between. Light only: behaviour, not appearance. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { overlayOffenders } from "@umriss-ui/demo/checks/overlays";
import { openExample } from "./navigation";
import { colour, distanceFrom, painted, paintedShare, rgba } from "./pixels";
import { DAY_OF_PLAN, LANE_HEIGHT, at, plotOf } from "./plot";
import type { Plot } from "./plot";

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

/** Whether the schedule consumed the last wheel or released it to the page.

    It reads the mechanism itself: the schedule prevents the default exactly
    while it is using the wheel, and lets it through when it is not. The
    listener sits on the document, so it runs after the plot's own and sees the
    verdict.

    It replaced a measurement of the page's scroll position, which asked the
    same question of the wrong thing: once the demo was cut into chapters
    (schedule-lane-groups 05) its pages became short enough not to scroll at
    all, and a promise about a schedule would have failed for a reason that had
    nothing to do with schedules. */
async function watchWheel(page: Page): Promise<() => Promise<boolean | undefined>> {
  await page.evaluate(() => {
    const window_ = window as unknown as { lastWheelPrevented?: boolean };
    window_.lastWheelPrevented = undefined;
    document.addEventListener("wheel", (event) => {
      window_.lastWheelPrevented = event.defaultPrevented;
    });
  });
  return () => page.evaluate(() => (window as unknown as { lastWheelPrevented?: boolean }).lastWheelPrevented);
}

test("the schedule carries its name, and the lane headers are text", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const figure = page.locator('[data-example="first-schedule"]').getByRole("figure", { name: "Plan of Tuesday, 17 March" });
  await expect(figure).toBeVisible();
  await expect(figure.locator("[data-schedule-headers]")).toHaveText(/Saw 1.*Mill.*Press 2.*Paint shop/);
  await expect(figure.locator("canvas").first()).toHaveAttribute("aria-hidden", "true");
});

test("the day band names the day, and the fine band steps in hours", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  await expect(example.locator("[data-schedule-days]")).toContainText("17 March 2026");
  expect(await tickLabels(example)).toEqual(expect.arrayContaining(["06:00", "07:00", "12:00", "17:00"]));
});

test("zooming in with Ctrl and the wheel steps the fine band down to the quarter hour", async ({ page }) => {
  await openExample(page, "pan-and-zoom", "pan-and-zoom");
  const example = page.locator('[data-example="pan-and-zoom"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  await wheel(page, plot.x(10), plot.y("press"), -120, 25, "Control");
  await expect.poll(async () => (await tickLabels(example)).some((label) => label.endsWith(":15"))).toBe(true);
  /* The instant under the pointer kept its place: 10:00 is still in view. */
  expect(await tickLabels(example)).toContain("10:00");
});

test("zooming out with Ctrl and the wheel steps the fine band up past the hour", async ({ page }) => {
  await openExample(page, "pan-and-zoom", "pan-and-zoom");
  const example = page.locator('[data-example="pan-and-zoom"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  await wheel(page, plot.x(12), plot.y("press"), 120, 12, "Control");
  await expect.poll(async () => (await tickLabels(example)).includes("07:00")).toBe(false);
});

test("the plain wheel does not zoom, and is released to the page where the lanes fit", async ({ page }) => {
  await openExample(page, "pan-and-zoom", "pan-and-zoom");
  const example = page.locator('[data-example="pan-and-zoom"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const labels = await tickLabels(example);
  const prevented = await watchWheel(page);

  /* Three lanes in this plot: there is nothing to scroll, so the schedule has
     no business with the wheel and says so. */
  await wheel(page, plot.x(10), plot.y("press"), 120, 3);
  expect(await tickLabels(example)).toEqual(labels);
  expect(await prevented()).toBe(false);
});

test("the wheel scrolls the lanes, and lets the page scroll on at their end", async ({ page }) => {
  await openExample(page, "lane", "many-lanes");
  const example = page.locator('[data-example="many-lanes"]');
  const headers = example.locator("[data-schedule-headers]");
  const last = headers.getByText("Cell 20");
  const plot = example.locator("[data-schedule-plot]");
  const box = (await plot.boundingBox())!;
  const frame = (await headers.boundingBox())!;
  const prevented = await watchWheel(page);

  /* Twenty lanes of 32 pixels in a plot of about 244: some 400 pixels to go,
     and while there are, the wheel belongs to the lanes. */
  await wheel(page, box.x + box.width / 2, box.y + box.height / 2, 100, 2);
  expect(await prevented()).toBe(true);

  await wheel(page, box.x + box.width / 2, box.y + box.height / 2, 100, 6);
  const moved = (await last.boundingBox())!;
  expect(moved.y + moved.height).toBeLessThanOrEqual(frame.y + frame.height + 1);

  /* At their end it goes back to the page: a plan halfway down a page must not
     swallow the scroll that was meant for the page. */
  await wheel(page, box.x + box.width / 2, box.y + box.height / 2, 100, 1);
  expect(await prevented()).toBe(false);
});

test("panning moves the time, and the headers and bands hold still", async ({ page }) => {
  await openExample(page, "pan-and-zoom", "pan-and-zoom");
  const example = page.locator('[data-example="pan-and-zoom"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const headers = example.locator("[data-schedule-headers]");
  const headerBefore = await headers.boundingBox();
  const bandBefore = await example.locator("[data-schedule-ticks]").boundingBox();
  const before = await tickPositions(example);

  /* On the empty inspection lane at 08:00: nothing to drag there, so it pans. */
  await page.mouse.move(plot.x(8), plot.y("press"));
  await page.mouse.down();
  await page.mouse.move(plot.x(8) - 150, plot.y("press"), { steps: 6 });
  await page.mouse.up();

  const after = await tickPositions(example);
  expect(after["12:00"]).toBeCloseTo(before["12:00"]! - 150, -1);
  expect(await headers.boundingBox()).toEqual(headerBefore);
  expect(await example.locator("[data-schedule-ticks]").boundingBox()).toEqual(bandBefore);
});

test("dragging up brings the lower lanes into view, headers with them", async ({ page }) => {
  await openExample(page, "lane", "many-lanes");
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
  await openExample(page, "interactions", "interactions");
  const example = page.locator('[data-example="interactions"]');
  const status = example.locator("[data-last-interaction]");
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* A-2041 on the saw, 06:00 to 07:00. */
  await page.mouse.move(plot.x(6, 30), plot.y("saw"));
  await expect(status).toHaveText("hover: subtask a-2041-1 (main) at 06:30");
  await page.mouse.move(plot.x(5, 50), plot.y("saw"));
  await expect(status).toHaveText(/^hover: subtask a-2041-1 \(leadIn\)/);

  await page.mouse.click(plot.x(15), plot.y("saw"), { button: "right" });
  /* A pixel is about a minute here; where the pointer lands on it decides. */
  await expect(status).toHaveText(/^contextmenu: lane saw at (14:59|15:00|15:01)$/);

  await page.mouse.click(plot.x(6, 30), plot.y("saw"));
  await expect(status).toHaveText("click: subtask a-2041-1 (main) at 06:30");
});

test("a click selects the whole task with the stop it hit, and a click on nothing clears it", async ({ page }) => {
  await openExample(page, "selection", "selection");
  const example = page.locator('[data-example="selection"]');
  const selected = example.locator("[data-selected-order]");
  await expect(selected).toHaveText("Selected: A-2043 Bracket");
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* The shaft's second subtask, on lathe 1 at 10:00. */
  await page.mouse.click(plot.x(10), plot.y("lathe-1"));
  await expect(selected).toHaveText("Selected: A-2042 Shaft, at a-2042-2");

  /* Another stop of the same order: the task does not change, the stop does. */
  await page.mouse.click(plot.x(8), plot.y("saw"));
  await expect(selected).toHaveText("Selected: A-2042 Shaft, at a-2042-1");

  await page.mouse.click(plot.x(17), plot.y("saw"));
  await expect(selected).toHaveText("Selected: nothing");
});

test("resting on a subtask shows its order, times, parts and findings", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const tooltip = example.locator("[data-schedule-tooltip]");
  await expect(tooltip).toHaveCount(0);

  /* The bracket in the paint shop, noon to 14:00: its dependency from the mill
     is fifteen minutes short. */
  await page.mouse.move(plot.x(13), plot.y("paint"));
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText("A-2043 Bracket");
  await expect(tooltip).toContainText("12:00–14:00");
  await expect(tooltip).toContainText("Lead-in 20 min");
  await expect(tooltip).toContainText("Lead-out 20 min");
  await expect(tooltip).toContainText("Violated dependency, 15 min short");

  /* The housing on the mill shares its time with the bracket's milling. */
  await page.mouse.move(plot.x(9), plot.y("mill"));
  await expect(tooltip).toContainText("A-2041 Housing");
  await expect(tooltip).toContainText("Overlap with a-2043-2");

  await page.mouse.move(plot.x(17), plot.y("saw"));
  await expect(tooltip).toHaveCount(0);
});

test("resting on a dependency names its route, its lag and that it is violated", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  /* The bracket's move from the mill (11:30) to the paint shop's lead-in (11:40):
     a symmetric curve passes through the middle of its two ends. */
  await page.mouse.move((plot.x(11, 30) + plot.x(11, 40)) / 2, plot.y("press"));
  const tooltip = example.locator("[data-schedule-tooltip]");
  await expect(tooltip).toContainText("a-2043-2 → a-2043-3");
  await expect(tooltip).toContainText("Dependency 25 min");
  await expect(tooltip).toContainText("Violated dependency, 15 min short");
});

test("an application's own tooltip content replaces the default", async ({ page }) => {
  await openExample(page, "tooltip", "own-tooltip");
  const example = page.locator('[data-example="own-tooltip"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  await page.mouse.move(plot.x(13), plot.y("paint"));
  const tooltip = example.locator("[data-schedule-tooltip]");
  await expect(tooltip).toContainText("Northworks");
  await expect(tooltip).toContainText("1 finding");
  await expect(tooltip).not.toContainText("12:00–14:00");
});

test("the now line stands at the present", async ({ page }) => {
  await openExample(page, "now-line", "now-line");
  const example = page.locator('[data-example="now-line"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const mark = example.locator("[data-now]");
  const box = (await mark.boundingBox())!;
  /* The clock is frozen at 10:30. */
  expect(box.x + box.width / 2).toBeCloseTo(plot.x(10, 30), -1);
  await expect(page.locator('[data-example="first-schedule"] [data-now]')).toHaveCount(0);
});

test("two schedules move together, and the span is reported", async ({ page }) => {
  await openExample(page, "linked-schedules", "in-step");
  const example = page.locator('[data-example="in-step"]');
  const span = example.locator("[data-span]");
  await expect(span).toHaveText("05:30 – 18:00");

  const noonAt = async (which: number) => {
    const box = await example.locator("[data-schedule-ticks]").nth(which).locator("span span", { hasText: "12:00" }).boundingBox();
    return box === null ? NaN : box.x;
  };
  const before = await noonAt(1);

  const upper = example.locator("[data-schedule-plot]").first();
  const box = (await upper.boundingBox())!;
  /* Panned on the upper plan, on its last lane where nothing is drawn. */
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height - 8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5 - 120, box.y + box.height - 8, { steps: 8 });
  await page.mouse.up();

  /* The lower plan followed, and the span says where they stand. How FAR it
     followed is deliberately not asserted: the pan is this test's means, not
     its subject, and a move event coalesced under load would otherwise fail a
     test about something else.

     Nor is it asserted that the two agree to the pixel. They can stand one
     frame apart - a span is reported once per frame and handed back as the
     other's `initialDomain`, and the round trip through React can arrive after
     the plan has moved on. That is a defect of the synchronisation and not of
     this example; it is recorded in `.scratch/schedule-lane-groups/issues/
     04-examples-that-run-as-copied.md` and belongs to nothing in this
     spec. */
  await expect.poll(async () => await noonAt(1)).toBeLessThan(before - 20);
  await expect(span).not.toHaveText("05:30 – 18:00");
});

test("the handle places the application's own mark at a time", async ({ page }) => {
  await openExample(page, "handle", "handle");
  const example = page.locator('[data-example="handle"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const pin = example.locator("[data-pin]");
  const box = (await pin.boundingBox())!;
  /* `clientPointOf(14:00)` - the pin stands over the 14:00 of the upper plan. */
  expect(box.x + box.width / 2).toBeCloseTo(plot.x(14), -1);
});

test.describe("touch", () => {
  test.use({ hasTouch: true });

  test("a pinch zooms the time scale", async ({ page, context }) => {
    await openExample(page, "pan-and-zoom", "pan-and-zoom");
    const example = page.locator('[data-example="pan-and-zoom"]');
    const plot = await plotOf(page, example, DAY_OF_PLAN);
    const before = (await tickLabels(example)).length;

    /* Two fingers, spread apart: Chromium turns the touches into pointer
       events of type "touch", which is what the schedule listens to. There is
       no multi-touch API in Playwright, so the events come through the
       protocol. */
    const cdp = await context.newCDPSession(page);
    const middle = plot.y("press");
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

test("the working calendar holds through pan and zoom: no removed hour gets a tick", async ({ page }) => {
  await openExample(page, "time-axis", "working-calendar");
  const example = page.locator('[data-example="working-calendar"]');
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
  await openExample(page, "bar-labels", "bar-labels");
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
  await wheel(page, plot.x(12), plot.y("qa"), 120, 8, "Control");
  await expect.poll(async () => example.locator("[data-bar-label]").count()).toBeLessThan(before);
  await expect(example.locator('[data-bar-label="a-2046-3"]')).toHaveCount(0);
});

test("a bar that began before the view keeps its label at the edge", async ({ page }) => {
  await openExample(page, "bar-labels", "bar-labels");
  const example = page.locator('[data-example="bar-labels"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const label = example.locator('[data-bar-label="a-2041-2"]');

  /* Panned until the milling starts left of the view: its label follows to
     the edge instead of leaving with it. */
  await page.mouse.move(plot.x(8), plot.y("qa"));
  await page.mouse.down();
  await page.mouse.move(plot.x(8) - 200, plot.y("qa"), { steps: 8 });
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
   these read the pixels the plot actually put down. Each has a chapter of its
   own and an example of its own, with the marked bar beside an unmarked one at
   the same times - which is the only way a statement about a MARK can be
   checked: against the thing it is not.

   A bar sits centred in its lane, `laneHeight - 2 * BAR_INSET - MAX_DEPTH *
   DEPTH_STEP` high - 23 of 44 - so its middle band is a safe place to ask
   about, and a strip a few pixels wide is enough to tell a filled face from an
   empty one. */
const APPEARANCE_DOMAIN = [at(6, 30), at(11)] as const;

/** The middle of a lane's row, in plot coordinates. */
const middleOf = (plot: Plot, lane: string) => plot.row(lane).top + plot.row(lane).height / 2;

/** The middle third of a bar on a lane, over an hour of it. */
const face = (plot: Plot, lane: string, hour: number) => ({
  x: plot.x(hour) - plot.box.x,
  y: middleOf(plot, lane) - 4,
  width: plot.x(hour + 1) - plot.x(hour),
  height: 8,
});

/** A point in the middle of a lane, at a time. */
const spotOn = (plot: Plot, lane: string, hour: number, minutes = 0) => ({
  x: Math.round(plot.x(hour, minutes) - plot.box.x),
  y: middleOf(plot, lane),
});

test("a provisional bar is hollow, and a released one is not", async ({ page }) => {
  await openExample(page, "appearances", "provisional");
  const example = page.locator('[data-example="provisional"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);

  /* Both bars run 07:00 to 10:00, so the same strip of each is asked about.

     Hollow is not "nothing at all": the grid's time ticks run the height of
     the plot beneath the bars, and a bar with no fill lets them through. That
     is the picture being right, not the test being loose - a hollow bar shows
     what is behind it, which is what hollow means. */
  expect(await paintedShare(example, "data", face(plot, "released", 8))).toBeGreaterThan(0.95);
  expect(await paintedShare(example, "data", face(plot, "draft", 8))).toBeLessThan(0.05);
});

test("a fixed bar is marked at its ends and keeps its face clear", async ({ page }) => {
  await openExample(page, "appearances", "fixed");
  const example = page.locator('[data-example="fixed"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);

  /* The cap is three pixels in the colour the label takes, sitting two pixels
     INSIDE the end and framed by the bar's own colour. Flush with the end it
     was no mark at all: a light cap at the start of a bar on a light page
     reads as the bar beginning a little later. */
  const at7 = spotOn(plot, "nailed", 7);
  const faceColour = await colour(example, "data", spotOn(plot, "nailed", 8, 30));

  expect(await colour(example, "data", at7)).toBe(faceColour);
  expect(await colour(example, "data", { ...at7, x: at7.x + 3 })).not.toBe(faceColour);
  const at10 = spotOn(plot, "nailed", 10);
  expect(await colour(example, "data", { ...at10, x: at10.x - 1 })).toBe(faceColour);
  expect(await colour(example, "data", { ...at10, x: at10.x - 4 })).not.toBe(faceColour);

  /* Between the caps the face is one colour throughout: no hatch. The hatch
     left the bars and went to the refused lane, where "not available" is what
     it says. */
  for (const hour of [8, 9]) expect(await colour(example, "data", spotOn(plot, "nailed", hour))).toBe(faceColour);
  expect(await paintedShare(example, "data", face(plot, "nailed", 8))).toBeGreaterThan(0.95);

  /* And the bar that may move carries no cap: the same place is its face. */
  const movable = await colour(example, "data", spotOn(plot, "movable", 8, 30));
  const at7Movable = spotOn(plot, "movable", 7);
  expect(await colour(example, "data", { ...at7Movable, x: at7Movable.x + 3 })).toBe(movable);
});

test("muted work is a paler colour at full height, and cannot be read as a lead-in", async ({ page }) => {
  await openExample(page, "appearances", "muted");
  const example = page.locator('[data-example="muted"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);

  /* The lower lane carries another shift's work from 07:00 with half an hour
     of lead-in before it: the two lie side by side in one picture, which is the
     only way to prove they cannot be confused. */
  const onBar = spotOn(plot, "theirs", 8);
  const inLeadIn = spotOn(plot, "theirs", 6, 45);

  /* Full height: the bar's top rows are painted. A half-height bar - which is
     what muted used to be - would leave them empty. */
  expect(
    await paintedShare(example, "data", { x: onBar.x, y: plot.row("theirs").top + 12, width: 20, height: 3 }),
  ).toBe(1);

  /* And a different colour from the lead-in beside it, by a margin and not by a
     rounding: user story 4 asks for "without doubt", so the test asks for a
     distance and not merely for inequality. */
  expect(await distanceFrom(example, "data", onBar, await rgba(example, "data", inLeadIn))).toBeGreaterThan(50);

  /* Nor is it simply the task colour - that is the whole point of the
     channel. */
  expect(await distanceFrom(example, "data", onBar, await rgba(example, "data", spotOn(plot, "ours", 8)))).toBeGreaterThan(50);
});

test("the progress rail lies within the main time and stops at its end", async ({ page }) => {
  await openExample(page, "appearances", "progress");
  const example = page.locator('[data-example="progress"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);

  /* 07:00 to 10:00 at 65 per cent, with half an hour of lead-out after it. The
     rail is a mark ON the bar, so it lies above the bar's own bottom edge -
     and it measures the WORK, so it must stop where the main time does. */
  const bottom = middleOf(plot, "started") + 11 - 4;
  const done = plot.x(7) + 0.65 * (plot.x(10) - plot.x(7));
  const spot = (x: number) => ({ x: Math.round(x - plot.box.x), y: bottom });

  const onWork = await colour(example, "data", spot(plot.x(8)));
  const stillToDo = await colour(example, "data", spot(done + 20));
  const underLeadOut = await colour(example, "data", spot(plot.x(10, 15)));
  /* Done, still to do, and the lead-out: three different things at that
     height. If the rail ran on, the last two would be one. */
  expect(onWork).not.toBe(stillToDo);
  expect(underLeadOut).not.toBe(onWork);
  expect(underLeadOut).not.toBe(stillToDo);

  /* And it is inset: the bar's lowest row is the bar, not the rail. */
  const lowest = { x: Math.round(plot.x(8) - plot.box.x), y: middleOf(plot, "started") + 10 };
  expect(await colour(example, "data", lowest)).not.toBe(onWork);

  /* A bar that says nothing about progress carries no rail at all. */
  const quiet = { x: Math.round(plot.x(8) - plot.box.x), y: middleOf(plot, "unclaimed") + 7 };
  expect(await colour(example, "data", quiet)).toBe(await colour(example, "data", spotOn(plot, "unclaimed", 8)));
});

test("a bar fades at whichever edge of the view it passes", async ({ page }) => {
  await openExample(page, "appearances", "open");
  const example = page.locator('[data-example="open"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);
  const width = (await example.locator("[data-schedule-plot]").boundingBox())!.width;
  const mid = (lane: string) => middleOf(plot, lane);

  /* One bar runs past the right edge, one began before the left one. A fade is
     a gradient into the surface, so the test asks how far each place stands
     from the bar's own solid colour: further, the nearer the edge. */
  const solidRight = await rgba(example, "data", { x: width - 60, y: mid("runs-on") });
  const near = await distanceFrom(example, "data", { x: width - 2, y: mid("runs-on") }, solidRight);
  const far = await distanceFrom(example, "data", { x: width - 12, y: mid("runs-on") }, solidRight);
  expect(near).toBeGreaterThan(far);
  expect(far).toBeGreaterThan(0);

  const solidLeft = await rgba(example, "data", { x: 60, y: mid("began") });
  const nearLeft = await distanceFrom(example, "data", { x: 1, y: mid("began") }, solidLeft);
  const farLeft = await distanceFrom(example, "data", { x: 11, y: mid("began") }, solidLeft);
  expect(nearLeft).toBeGreaterThan(farLeft);
  expect(farLeft).toBeGreaterThan(0);

  /* And a bar that passes NEITHER edge carries no fade: the fade says "the
     edge of the screen is not the end of this work", and both of this one's
     ends are in view. It matters beyond tidiness - the painting order lets a
     fade eat a FIXED bar's cap, which is the truth at the view's edge and a
     lie anywhere else. */
  const solidWhole = await rgba(example, "data", { x: Math.round(plot.x(8, 30) - plot.box.x), y: mid("whole") });
  const atItsEnd = { x: Math.round(plot.x(10) - plot.box.x) - 3, y: mid("whole") };
  expect(await distanceFrom(example, "data", atItsEnd, solidWhole)).toBe(0);
});

test("three statements on one bar stay three statements", async ({ page }) => {
  await openExample(page, "appearances", "combinations");
  const example = page.locator('[data-example="combinations"]');
  const plot = await plotOf(page, example, APPEARANCE_DOMAIN);
  const width = (await example.locator("[data-schedule-plot]").boundingBox())!.width;

  /* The first lane: another shift's, fixed, and running past the right edge.
     The saturation says the first, a cap at 07:00 says the second, the fade at
     the right edge says the third - and the fade is what takes the cap that
     would have stood at the bar's own end, which lies outside the view. */
  const mid = LANE_HEIGHT / 2;
  const cap = await colour(example, "data", { x: Math.round(plot.x(7) + 3 - plot.box.x), y: mid });
  const faceColour = await colour(example, "data", { x: Math.round(plot.x(9) - plot.box.x), y: mid });
  expect(cap).not.toBe(faceColour);

  const solid = await rgba(example, "data", { x: width - 60, y: mid });
  expect(await distanceFrom(example, "data", { x: width - 2, y: mid }, solid)).toBeGreaterThan(
    await distanceFrom(example, "data", { x: width - 12, y: mid }, solid),
  );

  /* The lane given provisional then fixed: the later word wins, so it is
     capped and its face is filled. The one given them the other way round is
     hollow. */
  expect(await paintedShare(example, "data", face(plot, "settled", 8))).toBeGreaterThan(0.95);
  expect(await paintedShare(example, "data", face(plot, "reopened", 8))).toBeLessThan(0.05);

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

/* ------------------------------------------------------------------ */
/* Hover is not selection (schedule-lane-groups 03)                     */
/* ------------------------------------------------------------------ */

test("hovering a selected bar still shows something, because the two are different kinds of mark", async ({ page }) => {
  await openExample(page, "selection", "selection");
  const example = page.locator('[data-example="selection"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* A-2043 is selected from the start: its stop on the press, 06:30 to 08:00.
     Selection outlines it; hover washes it. Both at once has to be visible,
     which two outlines of the same colour never were. */
  const onBar = { x: Math.round(plot.x(7) - plot.box.x), y: LANE_HEIGHT * plot.index("press") + LANE_HEIGHT / 2 };
  const before = await rgba(example, "overlay", onBar);

  await page.mouse.move(plot.x(7), plot.y("press"));
  await expect(example.locator("[data-schedule-tooltip]")).toBeVisible();
  /* Polled: the overlay is redrawn in a frame of its own, and under load that
     frame can arrive after the tooltip's element does. */
  await expect.poll(async () => await distanceFrom(example, "overlay", onBar, before)).toBeGreaterThan(10);

  /* And it goes when the pointer does. */
  await page.mouse.move(plot.box.x + 4, plot.box.y + 4);
  await expect.poll(async () => await distanceFrom(example, "overlay", onBar, before)).toBe(0);
});

test("the subtask that was clicked is told from its task's other bars", async ({ page }) => {
  await openExample(page, "selection", "selection");
  const example = page.locator('[data-example="selection"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* A-2043 has three stops, and selection takes all of them. The one that was
     CLICKED carries the heavier outline, because the grips belong to it and a
     task with three stops would otherwise offer no way to tell which.

     Measured on one and the same bar - the stop on the press - in both roles:
     first clicked, then a sibling after another stop of the same task was
     clicked. Everything else about that column is then identical, so what is
     left of the difference is the outline's weight. */
  const column = {
    x: Math.round(plot.x(7) - plot.box.x),
    y: LANE_HEIGHT * plot.index("press"),
    width: 3,
    height: LANE_HEIGHT,
  };
  const idle = async () => {
    await page.mouse.move(plot.box.x + 4, plot.box.y + 4);
    await expect(example.locator("[data-schedule-tooltip]")).toHaveCount(0);
  };

  await page.mouse.click(plot.x(7), plot.y("press"));
  await expect(example.locator("[data-selected-order]")).toContainText("a-2043-1");
  await idle();
  const asClicked = await painted(example, "data", column);

  /* The stop on the paint shop, 12:00 to 14:00 - the same task, so the press
     bar stays selected and becomes a sibling. */
  await page.mouse.click(plot.x(13), plot.y("paint"));
  await expect(example.locator("[data-selected-order]")).toContainText("a-2043-3");
  await idle();
  const asSibling = await painted(example, "data", column);

  expect(asClicked).toBeGreaterThan(asSibling);
  /* And a sibling is still outlined: the whole task is selected. */
  expect(asSibling).toBeGreaterThan(LANE_HEIGHT);
});

/* ------------------------------------------------------------------ */
/* Lane groups (schedule-lane-groups 08)                                */
/* ------------------------------------------------------------------ */

test("a group is structure over lanes: a head above them, and its lanes in the order they were declared", async ({ page }) => {
  await openExample(page, "lane-groups", "a-group");
  const example = page.locator('[data-example="a-group"]');
  const headers = example.locator("[data-schedule-headers] [data-row]");

  await expect(headers).toHaveCount(5);
  await expect(headers.nth(0)).toHaveAttribute("data-row", "groupHead");
  await expect(headers.nth(0)).toContainText("Press shop");
  await expect(headers.nth(0)).toContainText("2 lanes");
  /* The lanes, in the order the example declared them - group or no group. */
  const lanes = await example.locator("[data-schedule-headers] [data-lane]").evaluateAll((n) => n.map((e) => e.getAttribute("data-lane")));
  expect(lanes).toEqual(["press-1", "press-2", "weld", "paint"]);
});

test("the fold control is a real button, and says whether its group is open", async ({ page }) => {
  await openExample(page, "lane-groups", "a-group");
  const example = page.locator('[data-example="a-group"]');
  const chevron = example.getByRole("button", { name: /Fold group: Press shop/ });

  await expect(chevron).toHaveAttribute("aria-expanded", "true");
  /* What it controls exists: the rows that lie inside the group. */
  const controls = (await chevron.getAttribute("aria-controls"))!.split(" ");
  expect(controls.length).toBeGreaterThan(0);
  /* By attribute, not by `#id`: React's own ids carry characters a CSS
     selector would have to escape. */
  for (const id of controls) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);

  await chevron.click();
  const folded = example.getByRole("button", { name: /Unfold group: Press shop/ });
  await expect(folded).toHaveAttribute("aria-expanded", "false");
  /* One row for the whole group, and its lanes have none of their own. */
  await expect(example.locator("[data-schedule-headers] [data-row]")).toHaveCount(3);
  await expect(example.locator('[data-schedule-headers] [data-lane="press-1"]')).toHaveCount(0);
  /* And it still controls something that exists - the miniature's row. */
  for (const id of (await folded.getAttribute("aria-controls"))!.split(" ")) {
    await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  }
});

test("a group folds by keyboard, because the control is a button", async ({ page }) => {
  await openExample(page, "lane-groups", "a-group");
  const example = page.locator('[data-example="a-group"]');
  const chevron = example.getByRole("button", { name: /group: Press shop/ });

  await chevron.focus();
  await expect(chevron).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(example.getByRole("button", { name: /Unfold group: Press shop/ })).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Space");
  await expect(example.getByRole("button", { name: /Fold group: Press shop/ })).toHaveAttribute("aria-expanded", "true");
});

test("groups fold from outside, and the state is the application's", async ({ page }) => {
  await openExample(page, "lane-groups", "controlled");
  const example = page.locator('[data-example="controlled"]');
  const readout = example.locator("[data-folded]");

  await expect(readout).toHaveText("welding");
  await example.locator("[data-fold-all]").click();
  await expect(readout).toHaveText("presses, welding");
  await expect(example.locator("[data-schedule-headers] [data-lane]")).toHaveCount(0);

  await example.locator("[data-unfold-all]").click();
  await expect(readout).toHaveText("nothing folded");
  await expect(example.locator("[data-schedule-headers] [data-lane]")).toHaveCount(4);

  /* And the chevron reports to the application rather than deciding for it. */
  await example.getByRole("button", { name: /Fold group: Press shop/ }).click();
  await expect(readout).toHaveText("presses");
});

test("an inner group keeps its state while the outer one is folded", async ({ page }) => {
  await openExample(page, "lane-groups", "nesting");
  const example = page.locator('[data-example="nesting"]');
  const rows = () => example.locator("[data-schedule-headers] [data-row]");

  /* Hall A holds a turning line of three and a press: two heads and four
     lanes, plus the paint shop outside. */
  await expect(rows()).toHaveCount(7);
  /* Folded, the line is one row: the hall's head, that row, the press and the
     paint shop. */
  await example.getByRole("button", { name: /Fold group: Turning line/ }).click();
  await expect(rows()).toHaveCount(4);

  /* Fold the hall around it, then open the hall again: the line is still
     folded, because folding the hall never touched the line's own state. */
  await example.getByRole("button", { name: /Fold group: Hall A/ }).click();
  await expect(rows()).toHaveCount(2);
  await example.getByRole("button", { name: /Unfold group: Hall A/ }).click();
  await expect(rows()).toHaveCount(4);
  await expect(example.getByRole("button", { name: /Unfold group: Turning line/ })).toHaveCount(1);
});

test("a subtask on a folded lane is drawn on no other row", async ({ page }) => {
  await openExample(page, "lane-groups", "a-group");
  const example = page.locator('[data-example="a-group"]');
  const plot = await plotOf(page, example, [at(6), at(15)]);

  /* The welding bay's bar, 10:00 to 12:00, before and after the press shop
     folds. Its row moves up by what the two press lanes gave back, and
     nothing of the presses' work is drawn on it. */
  const at11 = Math.round(plot.x(11) - plot.box.x);
  expect(
    await paintedShare(example, "data", { x: at11, y: middleOf(plot, "weld") - 4, width: 20, height: 8 }),
  ).toBeGreaterThan(0.9);

  await example.getByRole("button", { name: /Fold group: Press shop/ }).click();
  const after = await plotOf(page, example, [at(6), at(15)]);
  /* The welding bay moved up: the two press lanes gave their rows back. */
  expect(after.index("weld")).toBe(0);
  expect(middleOf(after, "weld")).toBeLessThan(middleOf(plot, "weld"));
  /* Its own bar came with it. */
  expect(
    await paintedShare(example, "data", { x: at11, y: middleOf(after, "weld") - 4, width: 20, height: 8 }),
  ).toBeGreaterThan(0.9);
  /* And at 07:30 the presses are busy while the welding bay is not: its row
     has to be empty there. The press shop's work stayed in the press shop's
     row. */
  expect(
    await paintedShare(example, "data", {
      x: Math.round(after.x(7, 30) - after.box.x),
      y: middleOf(after, "weld") - 4,
      width: 20,
      height: 8,
    }),
  ).toBeLessThan(0.05);
});

/* ------------------------------------------------------------------ */
/* The miniature (schedule-lane-groups 09)                              */
/* ------------------------------------------------------------------ */

/** The miniature's row of the example, in plot coordinates. It has no
    `data-lane`, so it is found by its group. */
async function miniatureOf(example: Locator, group: string): Promise<{ top: number; height: number }> {
  return await example.locator("[data-schedule-headers]").first().evaluate((headers, id) => {
    let top = 0;
    for (const node of headers.querySelectorAll("[data-row]")) {
      const height = node.getBoundingClientRect().height;
      if (node.getAttribute("data-group") === id && node.getAttribute("data-row") === "miniature") return { top, height };
      top += height;
    }
    throw new Error(`no folded group \`${id}\` here`);
  }, group);
}

test("a folded group draws the work of every lane in it", async ({ page }) => {
  await openExample(page, "lane-groups", "the-miniature");
  const example = page.locator('[data-example="the-miniature"]');
  const plot = await plotOf(page, example, [at(6), at(16)]);
  const row = await miniatureOf(example, "hall");

  /* The lathe runs 07:00 to 09:00 and the mill 09:00 to 11:30 - two lanes, two
     strips, one above the other inside the one row. */
  const upper = { x: Math.round(plot.x(8) - plot.box.x), y: row.top + row.height * 0.3, width: 12, height: 3 };
  const lower = { x: Math.round(plot.x(10) - plot.box.x), y: row.top + row.height * 0.7, width: 12, height: 3 };
  expect(await paintedShare(example, "data", upper)).toBe(1);
  expect(await paintedShare(example, "data", lower)).toBe(1);
  /* And each keeps its own hours: at 10:00 the lathe is done, so its strip is
     empty there but for the grid's time ticks, which run the height of the
     plot behind everything. */
  expect(await paintedShare(example, "data", { ...upper, x: lower.x })).toBeLessThan(0.2);
});

test("a dependency into a folded group arrives at the strip of its lane", async ({ page }) => {
  await openExample(page, "lane-groups", "the-miniature");
  const example = page.locator('[data-example="the-miniature"]');
  const plot = await plotOf(page, example, [at(6), at(16)]);
  const row = await miniatureOf(example, "hall");

  /* The housing leaves the saw at 08:15 and reaches the mill's lead-in at 08:30.
     The mill is the LOWER of the two strips, so the line has to come down past
     the middle of the row - not stop at its top edge, which is where a lane
     index would have put it. */
  const between = {
    x: Math.round(plot.x(8, 30) - plot.box.x) - 6,
    y: Math.round(row.top + row.height * 0.55),
    width: 12,
    height: 6,
  };
  expect(await painted(example, "data", between)).toBeGreaterThan(0);
});

test("a finding inside a folded group is marked on its row", async ({ page }) => {
  await openExample(page, "lane-groups", "the-miniature");
  const example = page.locator('[data-example="the-miniature"]');
  const plot = await plotOf(page, example, [at(6), at(16)]);
  const row = await miniatureOf(example, "hall");

  /* The two orders claim the mill from 10:45 to 11:30. A three-pixel strip is
     not where an alarm can live alone, so the mark goes on the ROW as well -
     folding is a planner tidying the view, never a planner hiding a finding. */
  const onRow = { x: Math.round(plot.x(11) - plot.box.x), y: row.top + 1, width: 10, height: 3 };
  const quiet = { ...onRow, x: Math.round(plot.x(7) - plot.box.x) };
  expect(await paintedShare(example, "data", onRow)).toBe(1);
  /* An hour where nothing overlaps carries nothing there but the grid's ticks,
     and in a different colour: the mark is the danger tone. */
  expect(await paintedShare(example, "data", quiet)).toBeLessThan(0.2);
  expect(await colour(example, "data", { x: onRow.x, y: onRow.y + 1 })).not.toBe(
    await colour(example, "data", { x: quiet.x, y: quiet.y + 1 }),
  );
});

test("a strip can be hovered and selected, and carries neither label nor grips", async ({ page }) => {
  await openExample(page, "lane-groups", "the-miniature");
  const example = page.locator('[data-example="the-miniature"]');
  const plot = await plotOf(page, example, [at(6), at(16)]);
  const row = await miniatureOf(example, "hall");
  const onMill = { x: plot.box.x + plot.x(10) - plot.box.x, y: plot.box.y + row.top + row.height * 0.7 };

  /* Folding costs detail, never access: the tooltip names the stop. */
  await page.mouse.move(onMill.x, onMill.y);
  await expect(example.locator("[data-schedule-tooltip]")).toContainText("A-2041 Housing");

  /* And a click takes its whole task, here across a folded group and the saw
     outside it: the saw's bar gains an outline it did not have. */
  const edgeOfSaw = {
    x: Math.round(plot.x(7) - plot.box.x),
    y: plot.row("saw").top + 6,
    width: 10,
    height: 6,
  };
  await page.mouse.move(plot.box.x + 4, plot.box.y + 4);
  const before = await painted(example, "data", edgeOfSaw);
  await page.mouse.click(onMill.x, onMill.y);
  await page.mouse.move(plot.box.x + 4, plot.box.y + 4);
  await expect.poll(async () => await painted(example, "data", edgeOfSaw)).toBeGreaterThan(before);

  /* No grips on a strip - a bar three pixels high is not something to stretch
     by three pixels - and no label on one either. */
  await expect(example.locator("[data-grip]")).toHaveCount(0);
  await expect(example.locator("[data-bar-label]")).toHaveCount(0);
});

test("a violated dependency into a folded group is marked on its row", async ({ page }) => {
  await openExample(page, "lane-groups", "the-miniature");
  const example = page.locator('[data-example="the-miniature"]');
  const plot = await plotOf(page, example, [at(6), at(16)]);
  const row = await miniatureOf(example, "hall");

  /* The housing leaves the saw at 08:15 and takes twenty minutes; the mill's
     lead-in had to begin at 08:30. Five minutes short, and those five minutes
     are what the row marks. A line between two strips is a few pixels of a few
     pixels, so the row says it instead. */
  const onRow = { x: Math.round(plot.x(8, 31) - plot.box.x), y: row.top + 1, width: 4, height: 3 };
  expect(await paintedShare(example, "data", onRow)).toBe(1);
  /* And it is the danger tone, not a grid line: an hour with nothing short
     carries the one and not the other. Asked by colour rather than by a share,
     because a four-pixel box with a time tick through it is a quarter
     painted. */
  const alarm = await colour(example, "data", { x: onRow.x, y: onRow.y + 1 });
  expect(await colour(example, "data", { x: Math.round(plot.x(14) - plot.box.x), y: onRow.y + 1 })).not.toBe(alarm);
  expect(await colour(example, "data", { x: Math.round(plot.x(7) - plot.box.x), y: onRow.y + 1 })).not.toBe(alarm);
});
