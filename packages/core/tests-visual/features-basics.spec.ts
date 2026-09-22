/* Interaction tests – the basic stock, in the features-*.spec.ts pattern.
   Selectors aim at roles and visible texts of the demo, not at CSS classes.
   Run only in the light ui project (behaviour is theme-independent;
   screenshots cover dark). */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

/* This file touches several pages – layers, tabs, menu. Each test therefore
   opens what it means itself; a shared goto would exist only if the demo
   showed everything at once, and that is exactly what it deliberately does
   not do. */
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

/* The five table tests of this file went with the table (umriss-table 14).
   Their counterparts stand in
   `packages/table/tests-visual/features-table.spec.ts` and run against the
   demonstration of the demo of @umriss-ui/table. */

test("Modal opens and closes on Escape", async ({ page }) => {
  await openExample(page, "modal", "a-window");
  await page.getByRole("button", { name: "Open the modal", exact: true }).click();
  await expect(page.getByText("Create a project")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Create a project")).toBeHidden();
});

test("Toast appears with a title and a description", async ({ page }) => {
  await openExample(page, "toast", "feedback");
  await page.getByRole("button", { name: "Show a toast" }).click();
  await expect(page.getByText("Export finished")).toBeVisible();
  await expect(page.getByText("The project list is ready as a CSV.")).toBeVisible();
});

test("Tabs change the content", async ({ page }) => {
  await openExample(page, "tabs", "tabs");
  await page.getByRole("tab", { name: "Empty" }).click();
  await expect(page.getByText("Nothing to show.")).toBeVisible();
  await page.getByRole("tab", { name: "Details" }).click();
  await expect(page.getByText("Nothing to show.")).toBeHidden();
});

test("Menu opens and triggers an action", async ({ page }) => {
  await openExample(page, "menu", "actions");
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export as CSV" }).click();
  await expect(page.getByText("Last: Exported as CSV")).toBeVisible();
});

/* The context menu's one novelty is that it opens at a point, and jsdom has no
   layout to check that in (schedule-refinement 08). */
test("ContextMenu opens at the point of the right-click", async ({ page }) => {
  await openExample(page, "contextmenu", "at-the-pointer");
  const surface = page.locator('[data-example="at-the-pointer"] div', { hasText: "Right-click anywhere in here" }).last();
  const box = (await surface.boundingBox())!;
  const at = { x: Math.round(box.x + 40), y: Math.round(box.y + 30) };
  await page.mouse.click(at.x, at.y, { button: "right" });

  const menu = page.getByRole("menu", { name: "Actions for the surface" });
  await expect(menu).toBeVisible();
  const panel = (await menu.boundingBox())!;
  /* At the point, the way every popover of this library hangs from its
     anchor - a few pixels of the popover's own spacing aside. */
  expect(Math.abs(panel.x - at.x)).toBeLessThan(24);
  expect(Math.abs(panel.y - at.y)).toBeLessThan(24);
});

test("ContextMenu flips and stays inside the window at its edge", async ({ page }) => {
  await openExample(page, "contextmenu", "at-the-pointer");
  /* A window small enough that the surface reaches its corner: the panel
     cannot open down and to the right without leaving the window. */
  await page.setViewportSize({ width: 460, height: 340 });
  const surface = page.locator('[data-example="at-the-pointer"] div', { hasText: "Right-click anywhere in here" }).last();
  await surface.scrollIntoViewIfNeeded();
  const box = (await surface.boundingBox())!;
  const viewport = page.viewportSize()!;
  await page.mouse.click(Math.min(box.x + box.width - 4, viewport.width - 4), Math.min(box.y + box.height - 4, viewport.height - 4), {
    button: "right",
  });
  const menu = page.getByRole("menu", { name: "Actions for the surface" });
  await expect(menu).toBeVisible();
  // Where it comes to rest: the entrance slides it 6px, and a box measured
  // mid-slide lies outside by just that.
  await menu.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const panel = (await menu.boundingBox())!;
  expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.width);
  expect(panel.y + panel.height).toBeLessThanOrEqual(viewport.height);
});
