/* The control room in plant time: the scenario names Europe/Berlin in its
   formats, and a head office reads it. Under a reader in New York the trend's
   time axis, the alarm table's time column and the schedule's axis name the
   zone and write Berlin times; under a reader in Berlin nothing is named. The
   pickers' label is pinned with the pickers. Light only; nothing here is
   appearance. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openScenario } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const PLANT = "Europe/Berlin";

const room = (page: Page) => page.locator('[data-scenario="watch-a-kiln-line"]');

/** What the zone is called, as the browser under test spells it. */
const plantName = (page: Page) =>
  page.evaluate(
    (timeZone) =>
      new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "shortGeneric" })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")!.value,
    PLANT,
  );

/** Every error the page reports while it loads, a hydration warning among them. */
async function openQuietly(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.setFixedTime(new Date("2026-03-17T08:00:00Z"));
  await openScenario(page, "watch-a-kiln-line");
  await expect(room(page).getByRole("region", { name: "Plan", exact: true })).toBeVisible();
  return errors;
}

/** The times the alarm table writes, as minutes of the day. */
async function alarmTimes(page: Page): Promise<number[]> {
  const cells = room(page).getByRole("region", { name: "Alarms", exact: true }).locator("td", { hasText: /^\d\d:\d\d$/ });
  const texts = await cells.allTextContents();
  return texts.map((text) => Number(text.slice(0, 2)) * 60 + Number(text.slice(3)));
}

test.describe("read from New York", () => {
  test.use({ timezoneId: "America/New_York" });

  test("the trend, the alarm table and the schedule name the zone once, and write Berlin times", { tag: "@quick" }, async ({ page }) => {
    const errors = await openQuietly(page);
    const name = await plantName(page);
    const trend = room(page).getByRole("region", { name: "Kiln trend", exact: true });
    const alarms = room(page).getByRole("region", { name: "Alarms", exact: true });
    const plan = room(page).getByRole("region", { name: "Plan", exact: true });

    await expect(trend.getByText(name).first()).toBeVisible();
    await expect(alarms.getByRole("columnheader", { name: /Raised/ })).toContainText(name);
    await expect(plan.locator('[data-schedule-overlay="zone label"]')).toHaveText(name);

    /* The shift runs 06:00 to 14:00 in the plant; in New York those are the small hours. */
    const times = await alarmTimes(page);
    expect(times.length).toBeGreaterThan(0);
    for (const minute of times) {
      expect(minute).toBeGreaterThanOrEqual(6 * 60);
      expect(minute).toBeLessThanOrEqual(14 * 60);
    }
    expect(errors).toEqual([]);
  });

  test("the switch changes every time on the page at once", async ({ page }) => {
    await openQuietly(page);
    const name = await plantName(page);
    const plan = room(page).getByRole("region", { name: "Plan", exact: true });
    const before = await alarmTimes(page);

    await room(page).getByRole("radio", { name: "Your time" }).click();
    await expect(plan.locator('[data-schedule-overlay="zone label"]')).toHaveCount(0);
    await expect(room(page).getByRole("region", { name: "Kiln trend", exact: true }).getByText(name)).toHaveCount(0);
    const after = await alarmTimes(page);
    expect(after.length).toBe(before.length);
    for (const [index, minute] of after.entries()) {
      /* New York is five hours behind Berlin on 17 March. */
      expect(before[index]! - minute).toBe(5 * 60);
    }

    await room(page).getByRole("radio", { name: "Plant time" }).click();
    expect(await alarmTimes(page)).toEqual(before);
  });
});

test.describe("read from Berlin", () => {
  test.use({ timezoneId: PLANT });

  test("no view names the zone", async ({ page }) => {
    const errors = await openQuietly(page);
    const name = await plantName(page);
    await expect(room(page).locator('[data-schedule-overlay="zone label"]')).toHaveCount(0);
    await expect(room(page).getByText(name)).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
