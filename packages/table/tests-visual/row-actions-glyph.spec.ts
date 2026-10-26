/* The row-actions trigger draws the "more" glyph of core, not a character. The
   trigger is the same button in both themes, so the layout check runs in both. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

const example = (page: import("@playwright/test").Page, id: string) => page.locator(`[data-example="${id}"]`);

test("The row-actions trigger holds a drawn glyph of the nominal box and no text", async ({ page }) => {
  await openExample(page, "rowactions", "more-than-two");
  const trigger = example(page, "more-than-two").getByRole("button", { name: "Actions: INV-26-0318" });
  await expect(trigger).toBeVisible();
  await expect(trigger.locator("svg")).toHaveCount(1);
  await expect(trigger).toHaveText("");
  const glyph = (await trigger.locator("svg").boundingBox())!;
  // The glyph is drawn at its default edge of 12 pixels, as the glyph set's MoreGlyph.
  expect(Math.round(glyph.width)).toBe(12);
  expect(Math.round(glyph.height)).toBe(12);
});
