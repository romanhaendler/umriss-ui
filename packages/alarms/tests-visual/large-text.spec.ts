/* The alarm list with the root font size at 200 % (text-at-double-size). The suite
   stands with the shell (`@umriss-ui/demo/checks/largeText`). */

import { test } from "@playwright/test";
import { checkLargeText } from "@umriss-ui/demo/checks/largeText";
import { EXAMPLE_ADDRESSES } from "./pages";
import { open } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

checkLargeText({ demo: "alarms", open, examples: EXAMPLE_ADDRESSES });
