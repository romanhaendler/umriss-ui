/* A dialog Popover puts the focus on its first tab stop: in a radio group the
   chosen option, not the first one. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

for (const how of ["pointer", "keyboard"] as const) {
  test(`A Popover opened by ${how} focuses the chosen option, and Space changes nothing`, async ({ page }) => {
    await openExample(page, "popover", "a-setting-in-a-panel");
    const trigger = page.getByRole("button", { name: "Density", exact: true });
    if (how === "pointer") {
      await trigger.click();
    } else {
      await trigger.focus();
      await page.keyboard.press("Enter");
    }
    const panel = page.getByRole("dialog", { name: "Density" });
    await expect(panel).toBeVisible();

    const chosen = panel.getByRole("radio", { name: "Spacious" });
    await expect(chosen).toBeFocused();
    await expect(chosen).toBeChecked();

    await page.keyboard.press("Space");
    await expect(chosen).toBeChecked();
    await expect(page.getByText("Density: spacious")).toBeVisible();
  });
}
