/* The shell, checked against this demo. The tests stand once, with the shell
   (`@umriss-ui/demo/checks/shell.ts`), and run against all three demos; here
   stand the pages and queries they can be checked against in
   @umriss-ui/charts.

   What stays beside them is the one promise that is charts' own: the benchmark
   does not run on the front door. */

import { test, expect } from "@playwright/test";
import { checkShell } from "@umriss-ui/demo/checks/shell";

checkShell({
  notOnTheFrontDoor: ["line", "benchmark"],
  chip: { name: "Line", pageId: "line", absent: ["matrix", "benchmark"] },
  rail: { name: "Pareto", pageId: "pareto", rubricId: "monitoring" },
  neighbours: [
    { name: "Line", pageId: "line" },
    { name: "Area", pageId: "area" },
  ],
  deepLink: { pageId: "matrix", absent: "line" },
  example: {
    pageId: "limitline",
    id: "limits-and-state",
    title: "Limits and state band",
    pageName: "LimitLine",
  },
  palettePage: { query: "controlchart", name: "ControlChart", pageId: "controlchart", rubricName: "Monitoring" },
  abbreviation: { query: "sb", find: "StateBand", glyphs: ["S", "B"] },
  pointer: { wide: "a", narrow: "matrix" },
});

test("the benchmark does not run on the front door", async ({ page }) => {
  /* It measures the moment it exists. A front door is to measure nothing - and
     the reason the benchmark is not photographed either (R-5.1, `pages.ts`). */
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-example="benchmark"]')).toHaveCount(0);
});
