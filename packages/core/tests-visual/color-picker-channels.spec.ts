/* The ColorPicker panel's R, G, B fields and its eyedropper, in a real browser. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test("A channel set in the panel changes the colour, and Cancel puts it back over a channel still being edited", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "colorpicker", "a-colour");
  const trigger = page.getByRole("button", { name: "Line colour" });
  await trigger.click();
  const panel = page.getByRole("dialog", { name: "Choose colour" });
  await panel.getByRole("textbox", { name: "Red" }).fill("255");
  await panel.getByRole("textbox", { name: "Red" }).press("Enter");
  await expect(page.getByText("value: #ff63eb")).toBeVisible();

  const green = panel.getByRole("textbox", { name: "Green" });
  await green.fill("0");
  await panel.getByRole("button", { name: "Cancel" }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByText("value: #2563eb")).toBeVisible();
});

test("The eyedropper button picks a colour where the browser has EyeDropper", { tag: "@quick" }, async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { EyeDropper: unknown }).EyeDropper = class {
      open = () => Promise.resolve({ sRGBHex: "#ff0000" });
    };
  });
  await openExample(page, "colorpicker", "a-colour");
  await page.getByRole("button", { name: "Line colour" }).click();
  await page.getByRole("dialog", { name: "Choose colour" }).getByRole("button", { name: "Pick a colour from the screen" }).click();
  await expect(page.getByText("value: #ff0000")).toBeVisible();
});
