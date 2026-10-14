/* The scenarios page of the demo of @umriss-ui/dashboard: each scenario
   photographed as a whole, and the page against WCAG 2.1 AA. The scenario ids
   come from the files under `demo/scenarios/`. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STANDARDS, findings } from "@umriss-ui/demo/checks/accessibility";
import { scenarioIds } from "@umriss-ui/demo/checks/pages";
import { aloneStage, open, openScenario } from "./navigation";

const SCENARIO_IDS = scenarioIds(join(dirname(fileURLToPath(import.meta.url)), "..", "demo", "scenarios"));

for (const scenarioId of SCENARIO_IDS) {
  test(`Scenario ${scenarioId}`, { tag: "@quick" }, async ({ page }, testInfo) => {
    await openScenario(page, scenarioId);
    const target = await aloneStage(page, scenarioId);
    await expect(target).toHaveScreenshot(`scenario-${scenarioId}-${testInfo.project.name}.png`);
  });
}

test("The scenarios page is accessible", async ({ page }, testInfo) => {
  await open(page, "scenarios");
  const result = await new AxeBuilder({ page }).include('[data-block="scenarios"]').withTags(STANDARDS).analyze();
  expect(findings(result), `scenarios (${testInfo.project.name})`).toEqual([]);
});
