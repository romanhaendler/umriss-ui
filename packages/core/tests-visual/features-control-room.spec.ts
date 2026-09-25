/* The control room's clock and its regions (control-room-demo, R3 and R4).

   The plant's clock advances by what the wall clock says has passed, so these
   tests move the wall clock by hand - `setFixedTime` to a later instant - and
   never wait for real seconds: a frozen clock is a still page, a moved one is
   the plant that many minutes on. Light only; nothing here is appearance. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const T0 = new Date("2026-03-17T10:30:00");
const later = (seconds: number) => new Date(T0.getTime() + seconds * 1000);

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(T0);
});

const room = (page: import("@playwright/test").Page) => page.locator('[data-example="demonstration"]');

test("stands still while the wall clock does, and runs a minute per second", async ({ page }) => {
  await openExample(page, "control-room", "demonstration");
  const clock = room(page).getByText(/^\d\d:\d\d$/).first();
  await expect(clock).toHaveText("11:00");
  await page.waitForTimeout(600);
  await expect(clock).toHaveText("11:00");

  await page.clock.setFixedTime(later(5));
  await expect(clock).toHaveText("11:05");
});

test("pause stops the plant", async ({ page }) => {
  await openExample(page, "control-room", "demonstration");
  await room(page).getByRole("button", { name: "Pause the shift" }).click();
  await page.clock.setFixedTime(later(5));
  await page.waitForTimeout(600);
  await expect(room(page).getByText(/^\d\d:\d\d$/).first()).toHaveText("11:00");
  await expect(room(page).getByRole("button", { name: "Run the shift" })).toBeVisible();
});

test("stands still under reduced motion until asked to run", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openExample(page, "control-room", "demonstration");
  const clock = room(page).getByText(/^\d\d:\d\d$/).first();
  await page.clock.setFixedTime(later(5));
  await page.waitForTimeout(600);
  await expect(clock).toHaveText("11:00");

  await room(page).getByRole("button", { name: "Run the shift" }).click();
  await page.clock.setFixedTime(later(8));
  await expect(clock).toHaveText("11:03");
});

test("every region is a landmark, and its skip link moves the focus, not the address", async ({ page }) => {
  await openExample(page, "control-room", "demonstration");
  const address = page.url();
  for (const name of ["Line status", "Kiln trend", "Alarms", "Tile length", "Plan", "OEE so far"]) {
    await expect(room(page).getByRole("region", { name, exact: true })).toBeVisible();
  }
  await room(page).getByRole("navigation", { name: "Regions of the control room" }).getByRole("link", { name: "Plan" }).click();
  await expect(room(page).getByRole("region", { name: "Plan", exact: true })).toBeFocused();
  expect(page.url()).toBe(address);
});
