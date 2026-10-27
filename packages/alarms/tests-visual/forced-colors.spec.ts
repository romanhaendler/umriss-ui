/* The alarm list under forced colours – the Windows contrast mode, emulated. The
   suite stands with the shell (`@umriss-ui/demo/checks/forcedColors.ts`). */

import { test } from "@playwright/test";
import { checkForcedColours } from "@umriss-ui/demo/checks/forcedColors";
import { EXAMPLE_ADDRESSES, SAMPLE } from "./pages";
import { open, openExample } from "./navigation";

test.beforeEach(async ({ page }) => {
  // The flood example renders a thousand rows; axe needs longer than the default for them.
  test.slow();
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

checkForcedColours({ open, openExample, examples: EXAMPLE_ADDRESSES, sample: SAMPLE });
