/* Editing through the seam (schedule 06, ADR-0023): a browser test performs the
   drag and asserts the findings shown on the ghost and the reported intent -
   not the pixel mechanics in between. Light only. */

import { test, expect } from "@playwright/test";
import { overlayOffenders } from "@umriss-ui/demo/checks/overlays";
import { openExample } from "./navigation";
import { DAY_OF_PLAN, LANES, at, plotOf } from "./plot";

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

test("a drag shows the ghost with its findings before the drop, and reports the intent after it", async ({ page }) => {
  await openExample(page, "intent", "move-and-lane");
  const example = page.locator('[data-example="move-and-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* A-2046 on the mill, 13:00 to 14:30 - dragged three hours earlier, onto the
     time A-2043 holds the mill. */
  await page.mouse.move(plot.x(13, 45), plot.y(LANES.mill));
  await page.mouse.down();
  await page.mouse.move(plot.x(12), plot.y(LANES.mill), { steps: 5 });
  await page.mouse.move(plot.x(10, 45), plot.y(LANES.mill), { steps: 5 });

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
    JSON.stringify({ kind: "move", subtask: "a-2046-2", from: at(10), to: at(11, 30) }),
  );
});

test("a drop on another lane reports a lane intent", async ({ page }) => {
  await openExample(page, "intent", "move-and-lane");
  const example = page.locator('[data-example="move-and-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await page.mouse.move(plot.x(13, 45), plot.y(LANES.mill));
  await page.mouse.down();
  await page.mouse.move(plot.x(13, 45), plot.y(LANES.press), { steps: 5 });
  await page.mouse.move(plot.x(13, 45), plot.y(LANES.paint), { steps: 5 });
  await page.mouse.up();

  await expect(example.locator("[data-last-intent]")).toHaveText(JSON.stringify({ kind: "lane", subtask: "a-2046-2", lane: "paint" }));
});

test("a drag held at the edge pans the plot along, and the drop lands beyond what was in view", async ({ page }) => {
  await openExample(page, "intent", "move-and-lane");
  const example = page.locator('[data-example="move-and-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await page.mouse.move(plot.x(13, 45), plot.y(LANES.mill));
  await page.mouse.down();
  await page.mouse.move(plot.box.x + plot.box.width - 4, plot.y(LANES.mill), { steps: 8 });
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
  await openExample(page, "intent", "move-and-lane");
  const example = page.locator('[data-example="move-and-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await page.mouse.move(plot.x(13, 45), plot.y(LANES.mill));
  await page.mouse.down();
  await page.mouse.move(plot.x(11), plot.y(LANES.mill), { steps: 5 });
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

  await page.mouse.move(plot.x(13, 45), plot.y(LANES.mill));
  await page.mouse.down();
  await page.mouse.move(plot.x(13, 45) - 100, plot.y(LANES.mill), { steps: 5 });
  await expect(example.locator("[data-ghost]")).toHaveCount(0);
  await page.mouse.up();
  expect((await noon.boundingBox())!.x).toBeCloseTo(before - 100, -1);
});

test("setup grips appear on the selected subtask, and dragging one changes the setup", async ({ page }) => {
  await openExample(page, "intent", "stretch-setup-teardown");
  const example = page.locator('[data-example="stretch-setup-teardown"]');
  const plot = await plotOf(page, example, [at(6), at(13, 30)]);
  const grips = example.locator("[data-grip]");
  await expect(grips).toHaveCount(0);

  /* The turning, 08:00 to 10:00 with half an hour of setup. */
  await page.mouse.click(plot.x(9), plot.y(0));
  await expect(grips).toHaveCount(2);
  const setup = example.locator('[data-grip="setup"]');
  const before = (await setup.boundingBox())!;
  expect(before.x + before.width / 2).toBeCloseTo(plot.x(7, 30), -1);

  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(plot.x(7, 5), before.y + before.height / 2, { steps: 6 });
  await expect(example.locator("[data-ghost]")).toContainText("07:00–10:15");
  await page.mouse.up();

  /* The example applies the intent: the grip now stands an hour before 08:00. */
  await expect.poll(async () => {
    const box = await setup.boundingBox();
    return box === null ? NaN : Math.round(box.x + box.width / 2);
  }).toBeCloseTo(plot.x(7), -1);
});

test("stretching the main time at its edge reports a stretch", async ({ page }) => {
  await openExample(page, "intent", "stretch-setup-teardown");
  const example = page.locator('[data-example="stretch-setup-teardown"]');
  const plot = await plotOf(page, example, [at(6), at(13, 30)]);
  const grips = example.locator("[data-grip]");

  /* The grinding ends at 12:30; drag its end to 13:00, then select it to read
     where its teardown grip - at the end, with no teardown - now stands. */
  await page.mouse.move(plot.x(12, 30), plot.y(1));
  await page.mouse.down();
  await page.mouse.move(plot.x(13), plot.y(1), { steps: 6 });
  await expect(example.locator("[data-ghost]")).toContainText("11:00–13:00");
  await page.mouse.up();

  await page.mouse.click(plot.x(11, 30), plot.y(1));
  await expect(grips).toHaveCount(2);
  const teardown = (await example.locator('[data-grip="teardown"]').boundingBox())!;
  expect(teardown.x + teardown.width / 2).toBeCloseTo(plot.x(13), -1);
});

test("the demonstration: a right-click opens the context menu, and an entry changes the plan through an intent", async ({ page }) => {
  await openExample(page, "intent", "demonstration");
  const example = page.locator('[data-example="demonstration"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const summary = example.locator("[data-findings-summary]");
  await expect(summary).toHaveText("1 overlap, 1 late transport");

  /* The bracket in the paint shop, noon: its transport from the mill is late. */
  await page.mouse.click(plot.x(13), plot.y(LANES.paint), { button: "right" });
  const menu = page.getByRole("menu", { name: "Actions for a-2043-3" });
  await expect(menu).toBeVisible();
  const menuBox = (await menu.boundingBox())!;
  expect(Math.abs(menuBox.x - plot.x(13))).toBeLessThan(12);

  await menu.getByRole("menuitem", { name: "Later by a quarter hour", exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(example.locator("[data-intent-log]")).toContainText("move a-2043-3");
  /* Later by a quarter hour the transport fits - and the teardown now reaches
     into the flange's setup: the fix of one finding is visible as the next. */
  await expect(summary).toHaveText("2 overlaps, 0 late transports");
});

test("a drag on the shift raster lands on a shift change", async ({ page }) => {
  await openExample(page, "intent", "snapping");
  const example = page.locator('[data-example="snapping"]');
  /* The curing runs 06:00 to 14:00; the upper schedule shows 04:00 to
     midnight and snaps to 06:00, 14:00, 22:00. */
  const plot = await plotOf(page, example, [at(4), at(24)], 110 - 56);

  await page.mouse.move(plot.x(10), plot.y(0));
  await page.mouse.down();
  await page.mouse.move(plot.x(16), plot.y(0), { steps: 8 });
  /* Six hours of pointer become eight: the raster decides, not the pointer. */
  await expect(example.locator("[data-ghost]").first()).toContainText("14:00–22:00");
  await page.mouse.up();

  await page.mouse.move(plot.x(18), plot.y(0));
  await expect(example.locator("[data-schedule-tooltip]").first()).toContainText("14:00–22:00");
});

test("the demonstration shifts a whole order through one intent per stop", async ({ page }) => {
  await openExample(page, "intent", "demonstration");
  const example = page.locator('[data-example="demonstration"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const summary = example.locator("[data-findings-summary]");
  await expect(summary).toHaveText("1 overlap, 1 late transport");

  await page.mouse.click(plot.x(13), plot.y(LANES.paint), { button: "right" });
  const menu = page.getByRole("menu", { name: "Actions for a-2043-3" });
  await menu.getByRole("menuitem", { name: "The whole order later by a quarter hour" }).click();

  const log = example.locator("[data-intent-log]");
  for (const stop of ["a-2043-1", "a-2043-2", "a-2043-3"]) await expect(log).toContainText(`move ${stop}`);
  /* Every stop moved by the same amount, so the transports still fit as they
     did - the late one is still late, and the teardown now reaches into the
     flange's setup. */
  await expect(summary).toHaveText("2 overlaps, 1 late transport");
});

test("work dragged in from a list shows its ghost and is reported as a place intent", async ({ page }) => {
  await openExample(page, "intent", "drag-in");
  const example = page.locator('[data-example="drag-in"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const ghost = example.locator("[data-ghost]");
  const last = example.locator("[data-last-place]");
  await expect(last).toHaveText("Drag an order onto a lane");

  /* The plate takes four hours; dropped on the press at 09:00 it collides with
     the flange that holds the press from 09:05. */
  await example.locator('[data-waiting="a-2049"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(8), plot.y(LANES.press), { steps: 6 });
  await page.mouse.move(plot.x(9), plot.y(LANES.press), { steps: 6 });
  await expect(ghost).toContainText("09:00–13:00");
  await expect(ghost).toContainText("Overlap");
  await expect(ghost).toHaveAttribute("data-findings", /overlap/);
  /* Nothing is on the plan while the drag is in flight. */
  await expect(last).toHaveText("Drag an order onto a lane");

  await page.mouse.up();
  await expect(ghost).toHaveCount(0);
  await expect(last).toHaveText("place a-2049 on press as a-2049-1");
});

test("a drag from a list that leaves the lanes places nothing", async ({ page }) => {
  await openExample(page, "intent", "drag-in");
  const example = page.locator('[data-example="drag-in"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await example.locator('[data-waiting="a-2048"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(10), plot.y(LANES.saw), { steps: 6 });
  await expect(example.locator("[data-ghost]")).toBeVisible();
  /* Below the last lane there is no lane to place it on. */
  await page.mouse.move(plot.x(10), plot.box.y + plot.box.height - 2, { steps: 6 });
  await expect(example.locator("[data-ghost]")).toHaveCount(0);
  await page.mouse.up();
  await expect(example.locator("[data-last-place]")).toHaveText("Drag an order onto a lane");
});

test("a drag into a removed night stops at the seam where time counts again", async ({ page }) => {
  await openExample(page, "schedule", "operating-calendar");
  const example = page.locator('[data-example="operating-calendar"]');
  const plot = example.locator("[data-schedule-plot]");
  const box = (await plot.boundingBox())!;

  /* The pouring runs 18:00 to 21:30 on the foundry, the first lane; the plant
     stops at 22:00 and starts again at 06:00. Dragged to the right it can only
     land on the seam - 06:00 of the next morning. */
  await page.mouse.move(box.x + box.width * 0.28, box.y + 22);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.355, box.y + 22, { steps: 8 });
  await expect(example.locator("[data-ghost]")).toContainText("06:00–09:30");
  await page.mouse.up();

  /* And the plan took it: the pouring now starts in the morning. */
  await page.mouse.move(box.x + box.width * 0.37, box.y + 22);
  await expect(example.locator("[data-schedule-tooltip]")).toContainText("06:00–09:30");
});

test("Escape during a drag from outside places nothing", async ({ page }) => {
  await openExample(page, "intent", "drag-in");
  const example = page.locator('[data-example="drag-in"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await example.locator('[data-waiting="a-2047"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(12), plot.y(LANES.qa), { steps: 6 });
  await expect(example.locator("[data-ghost]")).toBeVisible();

  /* The browser delivers no key events while it runs a drag of its own: Escape
     ends that drag, and the schedule hears it as the leave and the `dragend`
     the browser sends. */
  await page.keyboard.press("Escape");
  await expect(example.locator("[data-ghost]")).toHaveCount(0);
  await page.mouse.up();
  await expect(example.locator("[data-last-place]")).toHaveText("Drag an order onto a lane");
});

test("a drag from outside held at the edge pans the plot along", async ({ page }) => {
  await openExample(page, "intent", "drag-in");
  const example = page.locator('[data-example="drag-in"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  await example.locator('[data-waiting="a-2048"]').hover();
  await page.mouse.down();
  await page.mouse.move(plot.x(12), plot.y(LANES.qa), { steps: 4 });
  await page.mouse.move(plot.box.x + plot.box.width - 4, plot.y(LANES.qa), { steps: 6 });
  /* Held still at the right edge: the plot pans until the ghost starts after
     the 18:00 the view ended at. */
  await expect
    .poll(async () => (await example.locator("[data-ghost]").textContent()) ?? "", { timeout: 5000 })
    .toMatch(/^(19|2\d):\d\d–/);
  await page.mouse.up();
  await expect(example.locator("[data-last-place]")).toContainText("place a-2048 on qa");
});

test("the ghost's label stays inside the plot, even on the topmost lane", async ({ page }) => {
  await openExample(page, "intent", "move-and-lane");
  const example = page.locator('[data-example="move-and-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* The housing on the saw, the first lane: above its bar there is no room for
     a label, so it belongs under it - and inside the plot either way. */
  await page.mouse.move(plot.x(6, 30), plot.y(LANES.saw));
  await page.mouse.down();
  await page.mouse.move(plot.x(8), plot.y(LANES.saw), { steps: 6 });
  const label = example.locator("[data-ghost]");
  await expect(label).toBeVisible();
  /* The same invariant the check of schedule-legibility 02 walks the pages
     with - here in the one moment a static page cannot reach: a drag in
     flight. */
  expect(await overlayOffenders(page)).toEqual([]);
  const box = (await label.boundingBox())!;
  /* Under the bar, not over the lane above it. */
  expect(box.y).toBeGreaterThan(plot.y(LANES.saw));
  await page.mouse.up();
});

test("the ghost's label stays inside the plot at the right edge of the plan", async ({ page }) => {
  await openExample(page, "intent", "move-and-lane");
  const example = page.locator('[data-example="move-and-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* The inspection of A-2045 ends the day at 16:30; dragged to the right edge
     its label would hang out of the plot. */
  await page.mouse.move(plot.x(16), plot.y(LANES.qa));
  await page.mouse.down();
  await page.mouse.move(plot.box.x + plot.box.width - 20, plot.y(LANES.qa), { steps: 6 });
  const box = (await example.locator("[data-ghost]").boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(plot.box.x + plot.box.width);
  await page.mouse.up();
});
