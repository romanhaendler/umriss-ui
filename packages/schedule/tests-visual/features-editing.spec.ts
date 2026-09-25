/* Editing through the seam (schedule 06, ADR-0023): a browser test performs the
   drag and asserts the findings shown on the ghost and the reported intent -
   not the pixel mechanics in between. Light only. */

import { test, expect, type Locator } from "@playwright/test";
import { overlayOffenders } from "@umriss-ui/demo/checks/overlays";
import { openExample, openScenario } from "./navigation";
import { painted } from "./pixels";
import { DAY_OF_PLAN, LANE_HEIGHT, at, plotOf } from "./plot";

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

test("a drag shows the ghost with its findings before the drop, and reports the intent after it", async ({ page }) => {
  await openExample(page, "move-and-lane", "move-to-another-lane");
  const example = page.locator('[data-example="move-to-another-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* C-2046 on van FP 402 R, 13:00 to 14:30 - dragged three hours earlier,
     onto the time C-2043 holds the van. */
  await page.mouse.move(plot.x(13, 45), plot.y("van-402"));
  await page.mouse.down();
  await page.mouse.move(plot.x(12), plot.y("van-402"), { steps: 5 });
  await page.mouse.move(plot.x(10, 45), plot.y("van-402"), { steps: 5 });

  const ghost = example.locator("[data-ghost]");
  await expect(ghost).toBeVisible();
  /* The tooltip steps aside while a drag is in flight. */
  await expect(example.locator("[data-schedule-tooltip]")).toHaveCount(0);
  await expect(ghost).toContainText("10:00–11:30");
  await expect(ghost).toContainText("Overlap");
  await expect(ghost).toHaveAttribute("data-findings", /overlap/);
  /* Nothing is reported while the drag is in flight. */
  await expect(example.locator("[data-last-intent]")).toHaveText("No intent yet");

  await page.mouse.up();
  await expect(ghost).toHaveCount(0);
  await expect(example.locator("[data-last-intent]")).toHaveText(
    JSON.stringify({ kind: "move", subtask: "c-2046-2", from: at(10), to: at(11, 30) }),
  );
});

test("a drop on another lane reports a lane intent", async ({ page }) => {
  await openExample(page, "move-and-lane", "move-to-another-lane");
  const example = page.locator('[data-example="move-to-another-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await page.mouse.move(plot.x(13, 45), plot.y("van-402"));
  await page.mouse.down();
  await page.mouse.move(plot.x(13, 45), plot.y("truck-520"), { steps: 5 });
  await page.mouse.move(plot.x(13, 45), plot.y("van-455"), { steps: 5 });
  await page.mouse.up();

  await expect(example.locator("[data-last-intent]")).toHaveText(JSON.stringify({ kind: "lane", subtask: "c-2046-2", lane: "van-455" }));
});

test("a drag held at the edge pans the plot along, and the drop lands beyond what was in view", async ({ page }) => {
  await openExample(page, "move-and-lane", "move-to-another-lane");
  const example = page.locator('[data-example="move-to-another-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await page.mouse.move(plot.x(13, 45), plot.y("van-402"));
  await page.mouse.down();
  await page.mouse.move(plot.box.x + plot.box.width - 4, plot.y("van-402"), { steps: 8 });
  /* Held still at the right edge: the plot pans until the ghost starts after
     the 18:00 the view ended at. */
  await expect
    .poll(async () => (await example.locator("[data-ghost]").textContent()) ?? "", { timeout: 5000 })
    .toMatch(/^(19|2\d):\d\d–/);
  await page.mouse.up();

  const intent = JSON.parse((await example.locator("[data-last-intent]").textContent()) ?? "{}") as { kind: string; from: number };
  expect(intent.kind).toBe("move");
  expect(intent.from).toBeGreaterThan(at(18));
});

test("Escape cancels a drag: the ghost goes, and nothing is reported", async ({ page }) => {
  await openExample(page, "move-and-lane", "move-to-another-lane");
  const example = page.locator('[data-example="move-to-another-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await page.mouse.move(plot.x(13, 45), plot.y("van-402"));
  await page.mouse.down();
  await page.mouse.move(plot.x(11), plot.y("van-402"), { steps: 5 });
  await expect(example.locator("[data-ghost]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(example.locator("[data-ghost]")).toHaveCount(0);
  await page.mouse.up();
  await expect(example.locator("[data-last-intent]")).toHaveText("No intent yet");
});

test("a schedule without intents starts no drag: pressing a subtask pans", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const noon = example.locator("[data-schedule-ticks] span span", { hasText: "12:00" });
  const before = (await noon.boundingBox())!.x;

  await page.mouse.move(plot.x(13, 45), plot.y("van-1"));
  await page.mouse.down();
  await page.mouse.move(plot.x(13, 45) - 100, plot.y("van-1"), { steps: 5 });
  await expect(example.locator("[data-ghost]")).toHaveCount(0);
  await page.mouse.up();
  expect((await noon.boundingBox())!.x).toBeCloseTo(before - 100, -1);
});

test("lead-in grips appear on the selected subtask, and dragging one changes the lead-in", async ({ page }) => {
  await openExample(page, "stretch", "change-lead-in-and-lead-out");
  const example = page.locator('[data-example="change-lead-in-and-lead-out"]');
  const plot = await plotOf(page, example, [at(6), at(13, 30)]);
  const grips = example.locator("[data-grip]");
  await expect(grips).toHaveCount(0);

  /* Tour T-01, 08:00 to 10:00 with half an hour of loading. */
  await page.mouse.click(plot.x(9), plot.y("van-214"));
  await expect(grips).toHaveCount(2);
  const leadIn = example.locator('[data-grip="leadIn"]');
  const before = (await leadIn.boundingBox())!;
  expect(before.x + before.width / 2).toBeCloseTo(plot.x(7, 30), -1);

  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(plot.x(7, 5), before.y + before.height / 2, { steps: 6 });
  await expect(example.locator("[data-ghost]")).toContainText("07:00–10:15");
  await page.mouse.up();

  /* The example applies the intent: the grip now stands an hour before 08:00. */
  await expect.poll(async () => {
    const box = await leadIn.boundingBox();
    return box === null ? NaN : Math.round(box.x + box.width / 2);
  }).toBeCloseTo(plot.x(7), -1);
});

test("stretching the main time at its edge reports a stretch", async ({ page }) => {
  await openExample(page, "stretch", "change-lead-in-and-lead-out");
  const example = page.locator('[data-example="change-lead-in-and-lead-out"]');
  const plot = await plotOf(page, example, [at(6), at(13, 30)]);
  const grips = example.locator("[data-grip]");

  /* Tour T-02 ends at 12:30; drag its end to 13:00, then select it to read
     where its lead-out grip - at the end, with no lead-out - now stands. */
  await page.mouse.move(plot.x(12, 30), plot.y("van-377"));
  await page.mouse.down();
  await page.mouse.move(plot.x(13), plot.y("van-377"), { steps: 6 });
  await expect(example.locator("[data-ghost]")).toContainText("11:00–13:00");
  await page.mouse.up();

  await page.mouse.click(plot.x(11, 30), plot.y("van-377"));
  await expect(grips).toHaveCount(2);
  const leadOut = (await example.locator('[data-grip="leadOut"]').boundingBox())!;
  expect(leadOut.x + leadOut.width / 2).toBeCloseTo(plot.x(13), -1);
});

test("the scenario: a right-click opens the context menu, and an entry changes the plan through an intent", async ({ page }) => {
  await openScenario(page, "replan-the-day-on-the-line");
  const example = page.locator('[data-scenario="replan-the-day-on-the-line"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const summary = example.locator("[data-findings-summary]");
  await expect(summary).toHaveText("1 overlap, 1 violated dependency");

  /* The bracket in the paint shop, noon: its dependency from the mill is violated. */
  await page.mouse.click(plot.x(13), plot.y("paint"), { button: "right" });
  const menu = page.getByRole("menu", { name: "Actions for a-2043-3" });
  await expect(menu).toBeVisible();
  const menuBox = (await menu.boundingBox())!;
  expect(Math.abs(menuBox.x - plot.x(13))).toBeLessThan(12);

  await menu.getByRole("menuitem", { name: "Later by a quarter hour", exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(example.locator("[data-intent-log]")).toContainText("move a-2043-3");
  /* Later by a quarter hour the dependency fits - and the lead-out now reaches
     into the flange's lead-in: the fix of one finding is visible as the next. */
  await expect(summary).toHaveText("2 overlaps, 0 violated dependencies");
});

test("a drag on the handover raster lands on a handover", async ({ page }) => {
  await openExample(page, "snapping", "snap-to-handovers");
  const example = page.locator('[data-example="snap-to-handovers"]');
  /* The watch runs 06:00 to 14:00; the schedule shows 04:00 to midnight
     and snaps to 06:00, 14:00, 22:00. */
  const plot = await plotOf(page, example, [at(4), at(24)], 110 - 56);

  await page.mouse.move(plot.x(10), plot.y("primary"));
  await page.mouse.down();
  await page.mouse.move(plot.x(16), plot.y("primary"), { steps: 8 });
  /* Six hours of pointer become eight: the raster decides, not the pointer. */
  await expect(example.locator("[data-ghost]").first()).toContainText("14:00–22:00");
  await page.mouse.up();

  await page.mouse.move(plot.x(18), plot.y("primary"));
  await expect(example.locator("[data-schedule-tooltip]").first()).toContainText("14:00–22:00");
});

test("the scenario shifts a whole order through one intent per stop", async ({ page }) => {
  await openScenario(page, "replan-the-day-on-the-line");
  const example = page.locator('[data-scenario="replan-the-day-on-the-line"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const summary = example.locator("[data-findings-summary]");
  await expect(summary).toHaveText("1 overlap, 1 violated dependency");

  await page.mouse.click(plot.x(13), plot.y("paint"), { button: "right" });
  const menu = page.getByRole("menu", { name: "Actions for a-2043-3" });
  await menu.getByRole("menuitem", { name: "The whole order later by a quarter hour" }).click();

  const log = example.locator("[data-intent-log]");
  for (const stop of ["a-2043-1", "a-2043-2", "a-2043-3"]) await expect(log).toContainText(`move ${stop}`);
  /* Every stop moved by the same amount, so the dependencies still fit as they
     did - the violated one is still violated, and the lead-out now reaches into the
     flange's lead-in. */
  await expect(summary).toHaveText("2 overlaps, 1 violated dependency");
});

test("work dragged in from a list shows its ghost and is reported as a place intent", async ({ page }) => {
  await openExample(page, "placing", "drag-from-the-backlog");
  const example = page.locator('[data-example="drag-from-the-backlog"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const ghost = example.locator("[data-ghost]");
  const last = example.locator("[data-last-place]");
  await expect(last).toHaveText("Drag an item onto a person");

  /* The audit takes four hours; dropped on Chloe at 09:00 it collides with
     the basket work she holds from 09:30. */
  await example.locator('[data-waiting="w-123"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(8), plot.y("chloe"), { steps: 6 });
  await page.mouse.move(plot.x(9), plot.y("chloe"), { steps: 6 });
  await expect(ghost).toContainText("09:00–13:00");
  await expect(ghost).toContainText("Overlap");
  await expect(ghost).toHaveAttribute("data-findings", /overlap/);
  /* Nothing is on the plan while the drag is in flight. */
  await expect(last).toHaveText("Drag an item onto a person");

  await page.mouse.up();
  await expect(ghost).toHaveCount(0);
  await expect(last).toHaveText("place w-123 on chloe as w-123-1");
});

test("a drag from a list that leaves the lanes places nothing", async ({ page }) => {
  await openExample(page, "placing", "drag-from-the-backlog");
  const example = page.locator('[data-example="drag-from-the-backlog"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await example.locator('[data-waiting="w-122"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(10), plot.y("arjun"), { steps: 6 });
  await expect(example.locator("[data-ghost]")).toBeVisible();
  /* Below the last lane there is no lane to place it on. */
  await page.mouse.move(plot.x(10), plot.box.y + plot.box.height - 2, { steps: 6 });
  await expect(example.locator("[data-ghost]")).toHaveCount(0);
  await page.mouse.up();
  await expect(example.locator("[data-last-place]")).toHaveText("Drag an item onto a person");
});

test("a drag into a removed night stops at the seam where time counts again", async ({ page }) => {
  await openExample(page, "time-axis", "working-calendar");
  const example = page.locator('[data-example="working-calendar"]');
  const plot = example.locator("[data-schedule-plot]");
  const box = (await plot.boundingBox())!;

  /* The line haul runs 18:00 to 21:30 on the truck, the first lane; the depot
     closes at 22:00 and starts again at 06:00. Dragged to the right it can only
     land on the seam - 06:00 of the next morning. */
  await page.mouse.move(box.x + box.width * 0.28, box.y + 22);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.355, box.y + 22, { steps: 8 });
  await expect(example.locator("[data-ghost]")).toContainText("06:00–09:30");
  await page.mouse.up();

  /* And the plan took it: the line haul now starts in the morning. */
  await page.mouse.move(box.x + box.width * 0.37, box.y + 22);
  await expect(example.locator("[data-schedule-tooltip]")).toContainText("06:00–09:30");
});

test("Escape during a drag from outside places nothing", async ({ page }) => {
  await openExample(page, "placing", "drag-from-the-backlog");
  const example = page.locator('[data-example="drag-from-the-backlog"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await example.locator('[data-waiting="w-121"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(12), plot.y("eva"), { steps: 6 });
  await expect(example.locator("[data-ghost]")).toBeVisible();

  /* The browser delivers no key events while it runs a drag of its own: Escape
     ends that drag, and the schedule hears it as the leave and the `dragend`
     the browser sends. */
  await page.keyboard.press("Escape");
  await expect(example.locator("[data-ghost]")).toHaveCount(0);
  await page.mouse.up();
  await expect(example.locator("[data-last-place]")).toHaveText("Drag an item onto a person");
});

test("a drag from outside held at the edge pans the plot along", async ({ page }) => {
  await openExample(page, "placing", "drag-from-the-backlog");
  const example = page.locator('[data-example="drag-from-the-backlog"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await example.locator('[data-waiting="w-122"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(12), plot.y("eva"), { steps: 4 });
  await page.mouse.move(plot.box.x + plot.box.width - 4, plot.y("eva"), { steps: 6 });
  /* Held still at the right edge: the plot pans until the ghost starts after
     the 18:00 the view ended at. */
  await expect
    .poll(async () => (await example.locator("[data-ghost]").textContent()) ?? "", { timeout: 5000 })
    .toMatch(/^(19|2\d):\d\d–/);
  await page.mouse.up();
  await expect(example.locator("[data-last-place]")).toContainText("place w-122 on eva");
});

test("the ghost's label stays inside the plot, even on the topmost lane", async ({ page }) => {
  await openExample(page, "move-and-lane", "move-to-another-lane");
  const example = page.locator('[data-example="move-to-another-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* C-2041 on the truck, the first lane: above its bar there is no room for
     a label, so it belongs under it - and inside the plot either way. */
  await page.mouse.move(plot.x(6, 30), plot.y("truck-118"));
  await page.mouse.down();
  await page.mouse.move(plot.x(8), plot.y("truck-118"), { steps: 6 });
  const label = example.locator("[data-ghost]");
  await expect(label).toBeVisible();
  /* The same invariant the check of schedule-legibility 02 walks the pages
     with - here in the one moment a static page cannot reach: a drag in
     flight. */
  expect(await overlayOffenders(page)).toEqual([]);
  const box = (await label.boundingBox())!;
  /* Under the bar, not over the lane above it. */
  expect(box.y).toBeGreaterThan(plot.y("truck-118"));
  await page.mouse.up();
});

test("the ghost's label stays inside the plot at the right edge of the plan", async ({ page }) => {
  await openExample(page, "move-and-lane", "move-to-another-lane");
  const example = page.locator('[data-example="move-to-another-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* C-2045 on van FP 290 E ends the day at 16:30; dragged to the right edge
     its label would hang out of the plot. */
  await page.mouse.move(plot.x(16), plot.y("van-290"));
  await page.mouse.down();
  await page.mouse.move(plot.box.x + plot.box.width - 20, plot.y("van-290"), { steps: 6 });
  const box = (await example.locator("[data-ghost]").boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(plot.box.x + plot.box.width);
  await page.mouse.up();
});

test("a lane a subtask may not go to refuses the drop, and the ghost stays where it may", async ({ page }) => {
  await openExample(page, "where-it-may-go", "lanes-that-fit");
  const example = page.locator('[data-example="lanes-that-fit"]');
  const plot = await plotOf(page, example, [at(6, 30), at(15)]);
  const ghost = example.locator("[data-ghost]");
  const last = example.locator("[data-last-move]");

  /* The vaccines fit the two cooled vans only; the dry van is the third
     lane. Dragged onto it, the ghost stays on cooled van 2 and says why. */
  await page.mouse.move(plot.x(10, 30), plot.y("cool-2"));
  await page.mouse.down();
  await page.mouse.move(plot.x(10, 30), plot.y("dry"), { steps: 8 });
  await expect(ghost).toBeVisible();
  await expect(ghost).toHaveAttribute("data-refused", "");
  await expect(ghost).toContainText("Not this lane");
  /* Still on cooled van 2 - the lane it was allowed to be on. */
  const box = (await ghost.boundingBox())!;
  expect(box.y).toBeLessThan(plot.y("dry") - 10);

  await page.mouse.up();
  await expect(last).toHaveText("Drag the vaccines onto the dry van");
});

test("the same subtask may still be moved in time, and onto the lane it fits", async ({ page }) => {
  await openExample(page, "where-it-may-go", "lanes-that-fit");
  const example = page.locator('[data-example="lanes-that-fit"]');
  const plot = await plotOf(page, example, [at(6, 30), at(15)]);

  /* Cooled van 2 to cooled van 1: allowed, and reported. */
  await page.mouse.move(plot.x(10, 30), plot.y("cool-2"));
  await page.mouse.down();
  await page.mouse.move(plot.x(10, 30), plot.y("cool-1"), { steps: 8 });
  await expect(example.locator("[data-ghost]")).not.toHaveAttribute("data-refused", "");
  await page.mouse.up();
  await expect(example.locator("[data-last-move]")).toHaveText("vaccines: lane");
});

test("a drag from a list holds its ghost on the last lane that allowed it", async ({ page }) => {
  await openExample(page, "where-it-may-go", "dragged-in");
  const example = page.locator('[data-example="dragged-in"]');
  const plot = await plotOf(page, example, [at(6, 30), at(15)]);
  const ghost = example.locator("[data-ghost]");

  /* First over cooled van 1, which the chilled delivery fits: the ghost stands there. */
  await example.locator('[data-waiting="insulin"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(12), plot.y("cool-1"), { steps: 6 });
  await expect(ghost).toBeVisible();
  await expect(ghost).not.toHaveAttribute("data-refused", "");

  /* Then over the dry van, which it does not fit. On the way the pointer
     crosses cooled van 2, which it DOES fit, so that is where the ghost was
     last allowed - and that is where it stays. */
  await page.mouse.move(plot.x(12), plot.y("dry"), { steps: 6 });
  await expect(ghost).toHaveAttribute("data-refused", "");
  await expect(ghost).toContainText("Not this lane");
  const box = (await ghost.boundingBox())!;
  expect(box.y).toBeLessThan(plot.y("dry") - LANE_HEIGHT / 2);

  /* And the drop lands where the ghost stood, because the ghost is the promise
     of where a drop lands - here as in a drag inside the plot. */
  await page.mouse.up();
  await expect(example.locator("[data-last-place]")).toHaveText("insulin: place on cool-2");
});

/* ------------------------------------------------------------------ */
/* A refusal one can see (schedule-lane-groups 01)                      */
/* ------------------------------------------------------------------ */

test("the lanes a subtask may not go to are marked the moment the drag begins", async ({ page }) => {
  await openExample(page, "where-it-may-go", "lanes-that-fit");
  const example = page.locator('[data-example="lanes-that-fit"]');
  const plot = await plotOf(page, example, [at(6, 30), at(15)]);
  const weld = example.locator('[data-lane="dry"]');

  await expect(weld).not.toHaveAttribute("data-refused", "");

  /* The drag takes hold on cooled van 2 and has not left it. The dry van is
     already marked: nobody has to try a lane to learn it is closed. */
  await page.mouse.move(plot.x(10, 30), plot.y("cool-2"));
  await page.mouse.down();
  await page.mouse.move(plot.x(10, 45), plot.y("cool-2"), { steps: 6 });
  await expect(example.locator("[data-ghost]")).toBeVisible();
  await expect(weld).toHaveAttribute("data-refused", "");
  await expect(example.locator('[data-lane="cool-1"]')).not.toHaveAttribute("data-refused", "");

  /* And the lane itself is drawn back and hatched, while cooled van 1 - which
     the vaccines fit - is left alone. */
  const lane = (top: number) => ({ x: 4, y: top + 6, width: 60, height: LANE_HEIGHT - 12 });
  expect(await painted(example, "overlay", lane(2 * LANE_HEIGHT))).toBeGreaterThan(0);
  expect(await painted(example, "overlay", lane(0))).toBe(0);

  await page.mouse.up();
  await expect(weld).not.toHaveAttribute("data-refused", "");
});

test("over a refused lane the cursor says so, and says otherwise again on leaving it", async ({ page }) => {
  await openExample(page, "where-it-may-go", "lanes-that-fit");
  const example = page.locator('[data-example="lanes-that-fit"]');
  const plot = await plotOf(page, example, [at(6, 30), at(15)]);
  const surface = example.locator("[data-schedule-plot]");

  await page.mouse.move(plot.x(10, 30), plot.y("cool-2"));
  await page.mouse.down();
  await page.mouse.move(plot.x(10, 30), plot.y("dry"), { steps: 8 });
  await expect(surface).toHaveCSS("cursor", "not-allowed");

  await page.mouse.move(plot.x(10, 30), plot.y("cool-1"), { steps: 8 });
  await expect(surface).toHaveCSS("cursor", "grabbing");
  await page.mouse.up();
});

test("a line ties the held ghost to the pointer it is not following", async ({ page }) => {
  await openExample(page, "where-it-may-go", "lanes-that-fit");
  const example = page.locator('[data-example="lanes-that-fit"]');
  const plot = await plotOf(page, example, [at(6, 30), at(15)]);
  const ghost = example.locator("[data-ghost]");

  /* Measured on cooled van 2, in the gap between the ghost's bar and the
     boundary of the dry van: that strip lies on a lane which is NOT refused, so
     nothing but the tether can paint it. */
  const x = plot.x(10, 30) - plot.box.x;
  const strip = { x: x - 2, y: 2 * LANE_HEIGHT - 5, width: 5, height: 4 };

  await page.mouse.move(plot.x(10, 30), plot.y("cool-2"));
  await page.mouse.down();
  await page.mouse.move(plot.x(10, 30), plot.y("cool-1"), { steps: 8 });
  await expect(ghost).not.toHaveAttribute("data-refused", "");
  expect(await painted(example, "overlay", strip)).toBe(0);

  await page.mouse.move(plot.x(10, 30), plot.y("dry"), { steps: 8 });
  await expect(ghost).toHaveAttribute("data-refused", "");
  expect(await painted(example, "overlay", strip)).toBeGreaterThan(0);
  await page.mouse.up();
});

test("a refused lane costs the lane and not the move in time", async ({ page }) => {
  await openExample(page, "where-it-may-go", "lanes-that-fit");
  const example = page.locator('[data-example="lanes-that-fit"]');
  const plot = await plotOf(page, example, [at(6, 30), at(15)]);

  /* Down onto the dry van AND an hour earlier: the lane is refused, the
     hour is not. One refusal must not cost the other half of the gesture. */
  await page.mouse.move(plot.x(10, 30), plot.y("cool-2"));
  await page.mouse.down();
  await page.mouse.move(plot.x(9, 30), plot.y("dry"), { steps: 10 });
  await expect(example.locator("[data-ghost]")).toHaveAttribute("data-refused", "");
  await page.mouse.up();

  await expect(example.locator("[data-last-move]")).toHaveText("vaccines: move");
});

test("a drag from outside is marked and refused in the same language", async ({ page }) => {
  await openExample(page, "where-it-may-go", "dragged-in");
  const example = page.locator('[data-example="dragged-in"]');
  const plot = await plotOf(page, example, [at(6, 30), at(15)]);
  const weld = example.locator('[data-lane="dry"]');

  /* The browser's own answer to a drag, read after the schedule gave it:
     React listens on the root container, so a listener on the document runs
     last. */
  await page.evaluate(() => {
    const window_ = window as unknown as { lastDropEffect?: string };
    document.addEventListener("dragover", (event) => {
      window_.lastDropEffect = (event as DragEvent).dataTransfer?.dropEffect;
    });
  });
  const dropEffect = () => page.evaluate(() => (window as unknown as { lastDropEffect?: string }).lastDropEffect);

  /* The dry van is marked as soon as the drag reaches the plot, exactly as
     it is for a drag inside it. */
  await example.locator('[data-waiting="insulin"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(12), plot.y("cool-1"), { steps: 6 });
  await expect(weld).toHaveAttribute("data-refused", "");
  await expect(example.locator("[data-ghost]")).toBeVisible();
  expect(await dropEffect()).toBe("copy");

  /* And back over the dry van it stays "copy": the ghost still stands on
     cooled van 1, and a ghost is the promise of where a drop lands. The refusal is
     said in the marks, not by taking the gesture away. */
  await page.mouse.move(plot.x(12), plot.y("dry"), { steps: 6 });
  await expect(example.locator("[data-ghost]")).toHaveAttribute("data-refused", "");
  expect(await dropEffect()).toBe("copy");

  await page.mouse.up();
  await expect(weld).not.toHaveAttribute("data-refused", "");
});

/* ------------------------------------------------------------------ */
/* Dragging over a fold (schedule-lane-groups 10)                       */
/* ------------------------------------------------------------------ */

/** The folded group's row, in plot coordinates. */
async function foldedRow(example: Locator, group: string): Promise<{ top: number; height: number }> {
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

test("resting a drag over a folded group opens it, and the drop lands on a real lane inside", async ({ page }) => {
  await openExample(page, "lane-groups", "the-miniature");
  const example = page.locator('[data-example="the-miniature"]');
  const plot = await plotOf(page, example, [at(6), at(16)]);
  const row = await foldedRow(example, "north");
  const lanes = () => example.locator("[data-schedule-headers] [data-lane]");

  /* Folded, the depot has no lanes of its own. */
  await expect(lanes()).toHaveCount(2);

  /* A drag from the van below, held over the depot. A miniature is no drop
     target, so nothing lands until it opens - and it opens because the pointer
     rested, not because it crossed. */
  await page.mouse.move(plot.x(14), plot.y("van-3"));
  await page.mouse.down();
  await page.mouse.move(plot.x(14), plot.box.y + row.top + row.height / 2, { steps: 6 });
  await expect.poll(async () => await lanes().count(), { timeout: 4000 }).toBe(4);
  await expect(example.locator('[data-schedule-headers] [data-lane="van-2"]')).toHaveCount(1);
});

test("what a gesture opened, it closes again - and the application is never told", async ({ page }) => {
  await openExample(page, "lane-groups", "the-miniature");
  const example = page.locator('[data-example="the-miniature"]');
  const plot = await plotOf(page, example, [at(6), at(16)]);
  const row = await foldedRow(example, "north");
  const lanes = () => example.locator("[data-schedule-headers] [data-lane]");

  await page.mouse.move(plot.x(14), plot.y("van-3"));
  await page.mouse.down();
  await page.mouse.move(plot.x(14), plot.box.y + row.top + row.height / 2, { steps: 6 });
  await expect.poll(async () => await lanes().count(), { timeout: 4000 }).toBe(4);

  /* Dropped on van FP 214 K, the first lane of the depot. The intent
     names the REAL lane - a group is never a lane (ADR-0025). */
  const after = await plotOf(page, example, [at(6), at(16)]);
  await page.mouse.move(plot.x(14), after.y("van-1"), { steps: 4 });
  await page.mouse.up();

  /* And the depot folds again by itself: the application did not fold anything,
     so its own list is untouched and it hears nothing. The example passes
     `onCollapsedGroupsChange` straight into its state, so the group coming
     back is the proof. */
  await expect.poll(async () => await lanes().count(), { timeout: 4000 }).toBe(2);
  await expect(example.getByRole("button", { name: /Unfold group: North depot/ })).toHaveCount(1);
});

test("Escape closes what the gesture opened", async ({ page }) => {
  await openExample(page, "lane-groups", "the-miniature");
  const example = page.locator('[data-example="the-miniature"]');
  const plot = await plotOf(page, example, [at(6), at(16)]);
  const row = await foldedRow(example, "north");
  const lanes = () => example.locator("[data-schedule-headers] [data-lane]");

  await page.mouse.move(plot.x(14), plot.y("van-3"));
  await page.mouse.down();
  await page.mouse.move(plot.x(14), plot.box.y + row.top + row.height / 2, { steps: 6 });
  await expect.poll(async () => await lanes().count(), { timeout: 4000 }).toBe(4);

  await page.keyboard.press("Escape");
  await expect.poll(async () => await lanes().count(), { timeout: 4000 }).toBe(2);
  await page.mouse.up();
});

test("crossing a folded group does not open it", async ({ page }) => {
  await openExample(page, "lane-groups", "the-miniature");
  const example = page.locator('[data-example="the-miniature"]');
  const plot = await plotOf(page, example, [at(6), at(16)]);
  const lanes = () => example.locator("[data-schedule-headers] [data-lane]");

  /* From the truck at the top straight past the depot to the van below: the
     pointer never rests, so the drawer stays shut. */
  await page.mouse.move(plot.x(7), plot.y("truck"));
  await page.mouse.down();
  await page.mouse.move(plot.x(7), plot.y("van-3"), { steps: 10 });
  await expect(lanes()).toHaveCount(2);
  await page.mouse.up();
});
