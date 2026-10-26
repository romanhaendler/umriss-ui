/* The Menu triggers of core's examples draw the "more" glyph, not the text "⋯". */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test("A Menu per row opens from a drawn glyph and no text", async ({ page }) => {
  await openExample(page, "menu", "per-row");
  const trigger = page.getByRole("button", { name: /^Actions for INC-/ }).first();
  await expect(trigger).toBeVisible();
  await expect(trigger.locator("svg")).toHaveCount(1);
  await expect(trigger).toHaveText("");
  await trigger.click();
  await expect(page.getByRole("menu").first()).toBeVisible();
});
