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

/* ---------------- The foundations (core-foundations) ----------------

   What jsdom cannot show of them: the platform's keys on the native controls,
   the dialog's focus trap and focus return, the drawer's motion under reduced
   motion, and a breadcrumb folding at a real width. */

test("Switch toggles on Space and on its label", async ({ page }) => {
  await openExample(page, "switch", "on-and-off");
  const control = page.getByRole("switch", { name: "Night setback", exact: true });
  await expect(control).toBeChecked();
  await control.focus();
  await page.keyboard.press("Space");
  await expect(control).not.toBeChecked();
  await page.locator('[data-example="on-and-off"]').getByText("Night setback").click();
  await expect(control).toBeChecked();
});

test("Slider follows the keys of the slider pattern", async ({ page }) => {
  await openExample(page, "slider", "a-setpoint");
  const slider = page.getByRole("slider", { name: "Hall temperature" });
  /* The ring stands on the thumb, a pseudo-element neither the own-base probe
     nor getComputedStyle reads - so it is looked at: the focused slider has
     to look different from the resting one. */
  const resting = await slider.screenshot({ animations: "disabled" });
  await page.keyboard.press("Tab"); // a keyboard focus, so :focus-visible holds
  await slider.focus();
  const focused = await slider.screenshot({ animations: "disabled" });
  expect(focused.equals(resting)).toBe(false);
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("20");
  await page.keyboard.press("PageUp");
  await expect(slider).toHaveValue("21");
  await page.keyboard.press("End");
  await expect(slider).toHaveValue("26");
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("14");
  await expect(slider).toHaveAttribute("aria-valuetext", "14.0");
});

test("Drawer holds the focus, closes on Escape and gives the focus back", async ({ page }) => {
  await openExample(page, "drawer", "a-detail-from-the-edge");
  const opener = page.getByRole("button", { name: "Show the order" });
  await opener.click();
  const drawer = page.getByRole("dialog", { name: "Order 4711-03" });
  await expect(drawer).toBeVisible();
  // It stands at the right edge of the window, once it has come in.
  const sheet = drawer.locator("> div");
  await sheet.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const box = (await sheet.boundingBox())!;
  expect(Math.round(box.x + box.width)).toBe(page.viewportSize()!.width);
  /* Across more Tabs than the drawer has stops, the focus never lands on the
     page behind it. Chrome lets it pass through its own chrome between the
     last stop and the first - the page then reports the body - and that is
     the platform's trap, not a leak. */
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Tab");
    const where = await drawer.evaluate((el) =>
      el.contains(document.activeElement) ? "inside" : document.activeElement === document.body ? "chrome" : "page",
    );
    expect(where).not.toBe("page");
  }
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(opener).toBeFocused();
});

test("Drawer appears and goes at once under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openExample(page, "drawer", "a-detail-from-the-edge");
  await page.getByRole("button", { name: "Show the order" }).click();
  const drawer = page.getByRole("dialog", { name: "Order 4711-03" });
  await expect(drawer).toBeVisible();
  expect(await drawer.locator("> div").evaluate((el) => el.getAnimations().length)).toBe(0);
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
});

test("Accordion walks its headers by the arrows and opens on Enter", async ({ page }) => {
  await openExample(page, "accordion", "one-section-at-a-time");
  const example = page.locator('[data-example="one-section-at-a-time"]');
  const shift = example.getByRole("button", { name: "Shift handover" });
  await shift.focus();
  await page.keyboard.press("ArrowDown");
  const quality = example.getByRole("button", { name: "Quality" });
  await expect(quality).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(quality).toHaveAttribute("aria-expanded", "true");
  await expect(shift).toHaveAttribute("aria-expanded", "false");
  await expect(example.getByRole("region", { name: "Quality" })).toBeVisible();
});

test("Breadcrumb folds at a narrow width and is walked through its menu", async ({ page }) => {
  await openExample(page, "breadcrumb", "folded-when-narrow");
  const example = page.locator('[data-example="folded-when-narrow"]');
  const narrow = example.getByRole("navigation").first();
  const wide = example.getByRole("navigation").nth(1);
  // Both keep the ends; the narrow one folds more than the wide one.
  for (const nav of [narrow, wide]) {
    await expect(nav.getByRole("link", { name: "Plant Nord" })).toBeVisible();
    await expect(nav.locator('[aria-current="page"]')).toHaveText("Valve 12");
  }
  const shown = (nav: typeof narrow) => nav.locator("ol:not([aria-hidden]) > li").count();
  expect(await shown(narrow)).toBeLessThan(await shown(wide));
  // Nothing of the narrow trail runs past its place.
  expect(await narrow.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);

  const more = narrow.getByRole("button", { name: "Show the levels in between" });
  await more.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const first = menu.getByRole("menuitem").first();
  await expect(first).toHaveText("Production");
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(menu.getByRole("menuitem").nth(1)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(more).toBeFocused();
});
