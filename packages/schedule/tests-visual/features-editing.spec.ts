/* Editing through the seam (schedule 06, ADR-0023): a browser test performs the
   drag and asserts the findings shown on the ghost and the reported intent -
   not the pixel mechanics in between. Light only. */

import { test, expect } from "@playwright/test";
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

  await menu.getByRole("menuitem", { name: "Later by a quarter hour" }).click();
  await expect(menu).toHaveCount(0);
  await expect(example.locator("[data-intent-log]")).toContainText("move a-2043-3");
  /* Later by a quarter hour the transport fits - and the teardown now reaches
     into the flange's setup: the fix of one finding is visible as the next. */
  await expect(summary).toHaveText("2 overlaps, 0 late transports");
});
