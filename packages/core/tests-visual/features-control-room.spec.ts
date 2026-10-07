/* The control room's clock and its regions (control-room-demo, R3 and R4).

   The plant's clock advances by what the wall clock says has passed, so these
   tests move the wall clock by hand - `setFixedTime` to a later instant - and
   never wait for real seconds: a frozen clock is a still page, a moved one is
   the plant that many minutes on. Light only; nothing here is appearance. */

import { test, expect } from "@playwright/test";
import { openScenario } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const T0 = new Date("2026-03-17T10:30:00");
const later = (seconds: number) => new Date(T0.getTime() + seconds * 1000);

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(T0);
});

/** A reading of the room's clock, so many plant minutes on. */
const plus = (time: string, minutes: number) => {
  const [h, m] = time.split(":").map(Number) as [number, number];
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const room = (page: import("@playwright/test").Page) => page.locator('[data-scenario="watch-a-kiln-line"]');

test("stands still while the wall clock does, and runs a minute per second", async ({ page }) => {
  await openScenario(page, "watch-a-kiln-line");
  const clock = room(page).getByText(/^\d\d:\d\d$/).first();
  const opened = (await clock.textContent())!;
  await page.waitForTimeout(600);
  await expect(clock).toHaveText(opened);

  await page.clock.setFixedTime(later(5));
  await expect(clock).toHaveText(plus(opened, 5));
});

test("pause stops the plant", async ({ page }) => {
  await openScenario(page, "watch-a-kiln-line");
  const clock = room(page).getByText(/^\d\d:\d\d$/).first();
  const opened = (await clock.textContent())!;
  await room(page).getByRole("button", { name: "Pause the shift" }).click();
  await page.clock.setFixedTime(later(5));
  await page.waitForTimeout(600);
  await expect(clock).toHaveText(opened);
  await expect(room(page).getByRole("button", { name: "Run the shift" })).toBeVisible();
});

test("stands still under reduced motion until asked to run", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openScenario(page, "watch-a-kiln-line");
  const clock = room(page).getByText(/^\d\d:\d\d$/).first();
  const opened = (await clock.textContent())!;
  await page.clock.setFixedTime(later(5));
  await page.waitForTimeout(600);
  await expect(clock).toHaveText(opened);

  await room(page).getByRole("button", { name: "Run the shift" }).click();
  await page.clock.setFixedTime(later(8));
  await expect(clock).toHaveText(plus(opened, 3));
});

test("every region is a landmark, and its skip link moves the focus, not the address", async ({ page }) => {
  await openScenario(page, "watch-a-kiln-line");
  const address = page.url();
  for (const name of ["Line status", "Kiln trend", "Alarms", "Tile length", "Plan", "OEE so far"]) {
    await expect(room(page).getByRole("region", { name, exact: true })).toBeVisible();
  }
  const plan = room(page).getByRole("region", { name: "Plan", exact: true });
  const resting = await plan.evaluate((el) => getComputedStyle(el).boxShadow);
  await room(page).getByRole("navigation", { name: "Regions of the control room" }).getByRole("link", { name: "Plan" }).click();
  await expect(plan).toBeFocused();
  /* Where it landed shows the ring. */
  expect(await plan.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(resting);
  expect(page.url()).toBe(address);
});

/* A chart without `height` fills its card, and the card the row's height
   (chart-fills-its-frame 01): measured boxes, polled - never a fixed wait. */
test("the tile length chart fills its card beside the OEE, and follows the row both ways", async ({ page }) => {
  await openScenario(page, "watch-a-kiln-line");
  const quality = room(page).getByRole("region", { name: "Tile length", exact: true });
  const oee = room(page).getByRole("region", { name: "OEE so far", exact: true });
  const plot = quality.locator(".uc-plot");
  const body = quality.locator("xpath=./div[last()]");
  const box = async (target: typeof plot) => (await target.boundingBox())!;
  const bottom = async (target: typeof plot) => {
    const b = await box(target);
    return b.y + b.height;
  };
  const padding = async () =>
    body.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));

  /* The two cards end on one line, and the plot area ends at the body's padding. */
  await expect.poll(async () => Math.abs((await bottom(quality)) - (await bottom(oee)))).toBeLessThan(1);
  await expect.poll(async () => Math.abs((await bottom(body)) - (await padding()) - (await bottom(plot)))).toBeLessThan(1);
  const first = (await box(plot)).height;
  const row = (await box(oee)).height;

  /* The groups of the OEE folded open make the row taller than the chart's
     floor; the plot area grows by as much. */
  for (const group of ["Availability", "Performance", "Quality"]) {
    await oee.getByRole("button", { name: `Show how ${group} is derived` }).click();
  }
  await expect.poll(async () => (await box(oee)).height).toBeGreaterThan(row + 20);
  await expect.poll(async () => (await box(plot)).height - first).toBeCloseTo((await box(oee)).height - row, 0);
  const opened = (await box(plot)).height;
  expect(opened).toBeGreaterThan(first + 20);

  /* Folded closed, it shrinks back to its first height. */
  for (const group of ["Availability", "Performance", "Quality"]) {
    await oee.getByRole("button", { name: `Hide how ${group} is derived` }).click();
  }
  await expect.poll(async () => (await box(plot)).height).toBeCloseTo(first, 0);
});
