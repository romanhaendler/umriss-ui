/* scrollToSubtask on a plan of sixty lanes: the bar the finding names is on
   screen afterwards - its lane header inside the frame, its bar painted in the
   row. Light only: behaviour, not appearance. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";
import { paintedShare } from "./pixels";

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

test("after scrollToSubtask on a plan with sixty lanes the bar is visible", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "handle", "show-a-finding");
  const example = page.locator('[data-example="show-a-finding"]');
  await example.locator('[data-finding="step-58"]').click();

  const headers = example.locator("[data-schedule-headers]");
  const plot = example.locator("[data-schedule-plot]");
  await expect(headers.getByText("Station 58")).toBeInViewport();
  await expect
    .poll(async () => {
      const frame = (await headers.boundingBox())!;
      const header = (await headers.getByText("Station 58").boundingBox())!;
      const box = (await plot.boundingBox())!;
      if (header.y < frame.y - 1 || header.y + header.height > frame.y + frame.height + 1) return 0;
      return paintedShare(example, "data", { x: 0, y: Math.round(header.y - box.y) + 4, width: Math.round(box.width), height: 20 });
    })
    .toBeGreaterThan(0.1);
});
