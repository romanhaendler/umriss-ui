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
/* A scenario copied alone runs: its data stands in the file            */
/* ------------------------------------------------------------------ */

import { test, expect } from "@playwright/test";

test("Copy takes the scenario with its plan in it, and nothing of the demo", async ({ page, context }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openScenario(page, "replan-the-day-on-the-line");

  const example = page.locator('[data-scenario="replan-the-day-on-the-line"]');
  await example.getByRole("button", { name: "Code" }).click();
  await expect(example.locator(".codeLanguage")).toHaveText("tsx");
  await example.getByRole("button", { name: "Copy" }).click();
  await expect(example.getByRole("button", { name: "Copied" })).toBeVisible();
  const copied = (await page.evaluate(() => navigator.clipboard.readText())).trim();

  expect(copied).toContain("export default function");
  expect(copied).toContain('from "@umriss-ui/schedule"');
  /* The plan itself, not an import of it. */
  expect(copied).toContain("const STEPS");
  expect(copied).not.toContain("@umriss-ui/demo");
  /* Neither the demo's own bookkeeping: a pasted file must not carry it. */
  expect(copied).not.toContain("export const title");
  expect(copied).not.toContain("export const shows");
});
