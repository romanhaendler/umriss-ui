/* One page, checked against this demo: code toggle, page toggle, copy button.
   The tests stand with the shell (`@umriss-ui/demo/checks/page.ts`).

   Beside them the configurator, which only this demo has
   (.scratch/configurator): what the reader sees and copies on the Button page. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { checkFirstExample, checkInstall, checkPage } from "@umriss-ui/demo/checks/page";
import { ALL_PAGES, open, openExample } from "./navigation";

checkInstall({ open, pages: ALL_PAGES, command: "npm install @umriss-ui/core" });

/* Not the Button page: a configurator takes its first slot (.scratch/configurator). */
checkFirstExample({ open, pageId: "card", title: "Head and body" });

checkPage({
  open,
  openExample,
  pageId: "button",
  examples: ["variants", "sizes", "loading-and-disabled"],
  other: { name: "Tag", pageId: "tag" },
  packageName: "@umriss-ui/core",
  importLine: 'import { Button } from "@umriss-ui/core";',
});

test.describe("The Button's configurator", () => {
  const AT_REST = 'import { Button } from "@umriss-ui/core";\n\n<Button>Acknowledge</Button>';
  const configurator = (page: Page) => page.locator('[data-configurator="button"]');
  const code = async (page: Page) => (await configurator(page).locator("pre code").innerText()).trim();
  const staged = (page: Page) => configurator(page).locator(".exampleStage").getByRole("button", { name: "Acknowledge" });

  test("starts at the defaults: the bare element", async ({ page }) => {
    await open(page, "button");
    expect(await code(page)).toBe(AT_REST);
    await expect(configurator(page).getByRole("radiogroup", { name: "size" }).getByLabel("md (default)")).toBeChecked();
  });

  test("a choice changes the button and the code, and Reset takes both back", async ({ page }) => {
    await open(page, "button");
    const before = await staged(page).evaluate((el) => ({ height: el.getBoundingClientRect().height, background: getComputedStyle(el).backgroundColor }));

    await configurator(page).getByRole("radiogroup", { name: "variant" }).getByText("primary", { exact: true }).click();
    await configurator(page).getByRole("radiogroup", { name: "size" }).getByText("sm", { exact: true }).click();

    expect(await code(page)).toBe('import { Button } from "@umriss-ui/core";\n\n<Button variant="primary" size="sm">Acknowledge</Button>');
    const after = await staged(page).evaluate((el) => ({ height: el.getBoundingClientRect().height, background: getComputedStyle(el).backgroundColor }));
    expect(after.height).toBeLessThan(before.height);
    expect(after.background).not.toBe(before.background);

    await configurator(page).getByRole("button", { name: "Reset" }).click();
    expect(await code(page)).toBe(AT_REST);
    await expect(configurator(page).getByRole("radiogroup", { name: "variant" }).getByLabel("secondary")).toBeChecked();
  });

  test("the copy button puts exactly the shown code into the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, "button");
    await configurator(page).getByRole("radiogroup", { name: "variant" }).getByText("danger", { exact: true }).click();
    await configurator(page).getByRole("button", { name: "Copy" }).click();
    await expect(configurator(page).getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'import { Button } from "@umriss-ui/core";\n\n<Button variant="danger">Acknowledge</Button>',
    );
  });

  test("every control is reached by Tab and works with its keys", async ({ page }) => {
    await open(page, "button");
    const panel = configurator(page);
    await staged(page).focus();
    await page.keyboard.press("Tab");
    await expect(panel.getByRole("textbox", { name: "children" })).toBeFocused();
    /* Tab selects the text, and typing replaces it. */
    await page.keyboard.type("Save");

    await page.keyboard.press("Tab");
    await expect(panel.getByRole("radiogroup", { name: "variant" }).getByLabel("secondary")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Tab");
    await expect(panel.getByRole("radiogroup", { name: "size" }).getByLabel("md (default)")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Tab");
    await expect(panel.getByRole("switch", { name: "loading" })).toBeFocused();
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await expect(panel.getByRole("switch", { name: "disabled" })).toBeFocused();
    await page.keyboard.press("Space");

    expect(await code(page)).toBe(
      'import { Button } from "@umriss-ui/core";\n\n<Button variant="ghost" size="sm" loading disabled>Save</Button>',
    );

    await page.keyboard.press("Tab");
    await expect(panel.getByRole("button", { name: "Reset" })).toBeFocused();
    await page.keyboard.press("Enter");
    expect(await code(page)).toBe(AT_REST);
  });

  test("its controls stand beside the stage from 900 px, and under it below", async ({ page }) => {
    const panelBesideStage = async () => {
      const stage = await configurator(page).locator(".exampleStage").boundingBox();
      const panel = await configurator(page).locator(".configuratorPanel").boundingBox();
      return panel!.x >= stage!.x + stage!.width - 1 && panel!.y < stage!.y + stage!.height;
    };
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, "button");
    expect(await panelBesideStage()).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    const stage = await configurator(page).locator(".exampleStage").boundingBox();
    const panel = await configurator(page).locator(".configuratorPanel").boundingBox();
    expect(panel!.y).toBeGreaterThanOrEqual(stage!.y + stage!.height - 1);
  });

  test("the former first example stands as the first titled example, at its anchor", async ({ page }) => {
    await openExample(page, "button", "one-action");
    const examples = page.locator('[data-block="button"] .section [data-example]');
    await expect(examples.first()).toHaveAttribute("data-example", "one-action");
    await expect(examples.first().getByRole("heading", { name: "One action" })).toBeVisible();
    await expect(examples.first()).toBeInViewport();
  });
});
