/* One page, checked against this demo: code toggle, page toggle, copy button.
   The tests stand with the shell (`@umriss-ui/demo/checks/page.ts`). */

import { checkPage } from "@umriss-ui/demo/checks/page";
import { open, openExample, openScenario } from "./navigation";

checkPage({
  open,
  openExample,
  pageId: "appearances",
  examples: ["provisional", "fixed", "muted"],
  other: { name: "Lanes", pageId: "lane" },
  packageName: "@umriss-ui/schedule",
  importLine: 'import { Subtasks, resolveAppearance } from "@umriss-ui/schedule";',
});

/* ------------------------------------------------------------------ */
/* An example that shows a file beside itself (schedule-lane-groups 04) */
/* ------------------------------------------------------------------ */

import { test, expect } from "@playwright/test";

test("the scenario shows its plan in a second tab, and Copy takes the tab in front", async ({ page, context }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openScenario(page, "replan-the-day");

  const example = page.locator('[data-scenario="replan-the-day"]');
  await example.getByRole("button", { name: "Code" }).click();
  const tabs = example.getByRole("group", { name: "Files of this example" }).getByRole("button");
  await expect(tabs).toHaveText(["01-replan-the-day.tsx", "plant.ts"]);

  /* The example itself is in front, and Copy takes it. */
  const copy = async () => {
    await example.getByRole("button", { name: "Copy" }).click();
    await expect(example.getByRole("button", { name: "Copied" })).toBeVisible();
    return (await page.evaluate(() => navigator.clipboard.readText())).trim();
  };
  const first = await copy();
  expect(first).toContain("export default function");
  expect(first).toContain('from "@umriss-ui/schedule"');
  /* Neither the demo's own bookkeeping: a pasted file must not carry it. */
  expect(first).not.toContain("export const title");
  expect(first).not.toContain("export const shows");

  /* The plant, in the second tab - and Copy follows the tab, not the
     example. */
  await tabs.nth(1).click();
  const second = await copy();
  expect(second).toContain("export const STEPS");
  expect(second).toContain('from "@umriss-ui/schedule"');
  expect(second).not.toBe(first);
});

test("an example that shows nothing has no tabs at all", async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  await example.getByRole("button", { name: "Code" }).click();
  await expect(example.getByRole("group", { name: "Files of this example" })).toHaveCount(0);
  await expect(example.locator(".codeLanguage")).toHaveText("tsx");
});
