/* A field marked `autoFocus` inside a Modal or a Drawer holds the focus when
   the dialog opens; without one the dialog's own first tab stop gets it. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

for (const [page_, example, opener, name, field] of [
  ["modal", "the-cursor-in-the-field", "Edit the contact", "Edit the contact", "Phone"],
  ["drawer", "the-cursor-in-the-field", "Edit the shipment", "Edit the shipment", "Note"],
] as const) {
  test(`${page_}: the field with autoFocus holds the focus, and the trigger gets it back @quick`, async ({ page }) => {
    await openExample(page, page_, example);
    const trigger = page.getByRole("button", { name: opener });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: field })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test("a modal without autoFocus focuses its first tab stop @quick", async ({ page }) => {
  await openExample(page, "modal", "a-window");
  await page.getByRole("button", { name: "Open the modal" }).click();
  const dialog = page.getByRole("dialog", { name: "Create a project" });
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
});
