/* A question inside a window, and a window under `Activity`, in a real browser:
   the jsdom units hold the events, the page's inertness and the focus are the browser's. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const EXAMPLE = "a-question-inside";

test("a ConfirmDialog inside a Modal closes alone on Escape, and the Modal stays", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "modal", EXAMPLE);
  await page.getByRole("button", { name: "Archive the project" }).click();
  const outer = page.getByRole("dialog", { name: "Archive Harbour redesign" });
  await outer.getByRole("button", { name: "Archive", exact: true }).click();
  const inner = page.getByRole("dialog", { name: "Archive for good?" });
  await expect(inner).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(inner).toBeHidden();
  await expect(outer).toBeVisible();

  await outer.getByRole("button", { name: "Archive", exact: true }).click();
  await inner.getByRole("button", { name: "Keep it" }).click();
  await expect(inner).toBeHidden();
  await expect(outer).toBeVisible();
});

test("a Modal under Activity closes with its part of the page and opens when it returns", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "modal", EXAMPLE);
  await page.getByRole("button", { name: "Archive the project" }).click();
  const dialog = page.getByRole("dialog", { name: "Archive Harbour redesign" });
  await expect(dialog).toBeVisible();

  /* The button stands behind the open window; a click reaches it as a script's does. */
  await page.getByRole("button", { name: "Hide this part of the page" }).dispatchEvent("click");
  await expect(dialog).toBeHidden();
  /* The page is not left inert: a real click reaches the button, and the scroll is free. */
  const show = page.getByRole("button", { name: "Show this part of the page" });
  await show.click();
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
});
