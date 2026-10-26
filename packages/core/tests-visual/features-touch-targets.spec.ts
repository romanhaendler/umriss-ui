/* The 24 px floor under a finger, for what only a test opens (ADR-0070): the
   surfaces that lie outside an example's stage - a menu, a list, the date panel,
   the palette, a toast - are measured by the same function the page check
   calls. And under a fine pointer the targets the floor changed keep their
   drawn size and layout. Chromium only; light only. */

import { existsSync } from "node:fs";
import { test, expect, webkit } from "@playwright/test";
import { expectOnTheFloor } from "@umriss-ui/demo/checks/floor";
import { openExample } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

test.describe("under a finger", () => {
  test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  });

  test("an open Menu has no target under 24 px", async ({ page }) => {
    await openExample(page, "menu", "actions");
    await page.getByRole("button", { name: "Actions", exact: true }).click();
    await expectOnTheFloor(page, page.getByRole("menu"), "core", "menu", "actions");
  });

  test("a Combobox's list has no target under 24 px", async ({ page }) => {
    await openExample(page, "combobox", "pick-a-driver");
    await page.getByRole("combobox").first().click();
    await expectOnTheFloor(page, page.getByRole("listbox"), "core", "combobox", "pick-a-driver");
  });

  test("a Select's list under a mouse has no target under 24 px", async ({ page }) => {
    await openExample(page, "select", "select");
    // The mouse's click opens the library's own list; a finger's tap opens the system's (ADR-0043).
    await page.getByRole("combobox", { name: "Cost centre" }).click();
    await expectOnTheFloor(page, page.getByRole("listbox", { name: "Cost centre" }), "core", "select", "select");
  });

  for (const [pageId, exampleId] of [
    ["datepicker", "pick-a-day"],
    ["datetimepicker", "set-an-instant"],
    ["datetimerangepicker", "a-downtime-window"],
  ] as const) {
    test(`the ${pageId} panel has no target under 24 px`, async ({ page }) => {
      await openExample(page, pageId, exampleId);
      await page.locator(`[data-example="${exampleId}"] .exampleStage button`).first().click();
      await expectOnTheFloor(page, page.getByRole("dialog"), "core", pageId, exampleId);
    });
  }

  test("the CommandPalette has no target under 24 px", async ({ page }) => {
    await openExample(page, "commandpalette", "commands");
    await page.getByRole("button", { name: "Open the palette" }).click();
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();
    await expectOnTheFloor(page, dialog, "core", "commandpalette", "commands");
  });

  test("a toast has no target under 24 px", async ({ page }) => {
    await openExample(page, "toast", "show-a-toast");
    await page.getByRole("button", { name: "Show a toast" }).click();
    const toast = page.locator("[data-toast]").first();
    await expect(toast).toBeVisible();
    await expectOnTheFloor(page, toast, "core", "toast", "show-a-toast");
  });
});

/* The floor is reached under a finger only: with a mouse every one of these is
   as drawn before, so a dense screen on a touch laptop keeps its pitch. */
test.describe("under a fine pointer", () => {
  const size = async (locator: import("@playwright/test").Locator) => {
    const box = (await locator.first().boundingBox())!;
    return { width: Math.round(box.width * 10) / 10, height: Math.round(box.height * 10) / 10 };
  };

  test("the targets keep their drawn size and layout", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(false);

    await openExample(page, "tag", "removable");
    expect(await size(page.locator('[data-example="removable"]').getByRole("button", { name: /^Remove / }))).toEqual({ width: 16, height: 16 });

    await openExample(page, "numberinput", "number-field");
    expect(await size(page.locator('[data-example="number-field"]').getByRole("button", { name: "Increase value" }))).toEqual({ width: 20, height: 22 });

    await openExample(page, "checkbox", "checkbox");
    expect((await size(page.locator('[data-example="checkbox"] label'))).height).toBeCloseTo(16.9, 1);

    await openExample(page, "switch", "on-and-off");
    expect((await size(page.locator('[data-example="on-and-off"] label'))).height).toBeCloseTo(16.9, 1);

    await openExample(page, "radiogroup", "radio-group");
    expect((await size(page.locator('[data-example="radio-group"] label:has(input[type=radio])'))).height).toBe(19.5);

    await openExample(page, "treeview", "a-tree");
    expect(await size(page.locator('[data-example="a-tree"] [data-target]'))).toEqual({ width: 16, height: 16 });

    await openExample(page, "splitter", "two-panes");
    expect((await size(page.locator('[data-example="two-panes"]').getByRole("separator"))).width).toBe(8);

    await openExample(page, "slider", "canary-traffic");
    expect((await size(page.locator('[data-example="canary-traffic"] input[type=range]'))).height).toBe(20);
  });
});

/* WebKit on an iPhone drops a typed digit when a touch has undone the selection
   a time field relies on; and no arrows are drawn under a finger. Launched as
   the calculation's density suite launches WebKit. */
test("in WebKit under touch, 0930 typed into the time fields gives 09:30", async ({ baseURL }) => {
  test.skip(!existsSync(webkit.executablePath()), "WebKit is not installed: npx playwright install webkit");
  const browser = await webkit.launch();
  try {
    const context = await browser.newContext({ baseURL, hasTouch: true, isMobile: true, viewport: { width: 375, height: 667 } });
    const page = await context.newPage();
    await openExample(page, "datetimepicker", "set-an-instant");
    await page.locator('[data-example="set-an-instant"] .exampleStage button').first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: /^(Increase|Decrease) / }).first()).toBeHidden();
    await dialog.getByLabel("Hour").tap();
    await page.keyboard.type("0930");
    await expect(dialog.getByLabel("Hour")).toHaveValue("09");
    await expect(dialog.getByLabel("Minute")).toHaveValue("30");
  } finally {
    await browser.close();
  }
});
