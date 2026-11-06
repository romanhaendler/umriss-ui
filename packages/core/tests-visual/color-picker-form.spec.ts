/* ColorPicker in a form: Send posts the colour, Clear in the panel posts an empty text. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test("a ColorPicker in a form posts its colour, and Clear in the panel posts an empty text", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "colorpicker", "in-a-form");
  const posted = page.getByTestId("posted");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(posted).toContainText("accent = #2563eb");
  await expect(posted).not.toContainText("locked");

  await page.getByRole("button", { name: "Brand colour", exact: true }).click();
  await page.getByRole("dialog", { name: "Choose colour" }).getByRole("button", { name: "Clear" }).click();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(posted).toContainText(/accent = (\n|$)/);
});
