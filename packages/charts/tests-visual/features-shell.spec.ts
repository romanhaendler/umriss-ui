/* The shell, checked against this demo. The tests stand once, with the shell
   (`@umriss-ui/demo/checks/shell.ts`), and run against all three demos; here
   stand the pages and queries they can be checked against in
   @umriss-ui/charts.

   What stays beside them is the one promise that is charts' own: the benchmark
   does not run on the front door. */

import { test, expect } from "@playwright/test";
import { checkShell } from "@umriss-ui/demo/checks/shell";

checkShell({
  packageId: "charts",
  notOnTheFrontDoor: ["line", "benchmark"],
  rail: { name: "Pareto", pageId: "pareto", rubricId: "limits-and-alarms" },
  low: { name: "Benchmark", pageId: "benchmark" },
  neighbours: [
    { name: "Line", pageId: "line" },
    { name: "Area", pageId: "area" },
  ],
  deepLink: { pageId: "matrix", absent: "line" },
  example: {
    pageId: "limitline",
    id: "limits-and-state",
    title: "Read limits above the states",
    pageName: "LimitLine",
  },
  palettePage: { query: "controlchart", name: "ControlChart", pageId: "controlchart", rubricName: "Limits and alarms" },
  abbreviation: { query: "sb", find: "StateBand", glyphs: ["S", "B"] },
  pointer: { wide: "a", narrow: "matrix" },
  moved: { from: "getting-started", pageId: "installation", example: "in-its-container" },
  contents: { pageId: "limitline", id: "limits-and-state", title: "Read limits above the states" },
  prop: { query: "padding", label: "padding", group: "charts · ChartProps", pageId: "chart", id: "ChartProps-padding" },
});

test("the Installation page says how German reaches a chart, where the other demos have a switch", async ({ page }) => {
  /* The shell suite asserts that this header carries no EN/DE switch; the
     reason stands here (.scratch/language-switch). */
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.goto("/installation/");
  const sentence = page.getByRole("main").locator("p", { hasText: "The charts take German per chart" });
  await expect(sentence).toContainText("GERMAN_CHARTS_WORDING");
  await expect(sentence.getByRole("link", { name: "the keyboard and screen reader example" })).toHaveAttribute("href", /chart\/#keyboard-and-screen-reader$/);
});

test("the benchmark does not run on the front door", async ({ page }) => {
  /* It measures the moment it exists. A front door is to measure nothing - and
     the reason the benchmark is not photographed either (R-5.1, `pages.ts`). */
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-example="benchmark"]')).toHaveCount(0);
});
