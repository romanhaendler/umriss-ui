/* One page, checked against this demo: code toggle, page toggle, copy button.
   The tests stand with the shell (`@umriss-ui/demo/checks/page.ts`).

   Beside them the configurator, which only this demo has
   (.scratch/configurator): what the reader sees and copies on the Button page.
   And the API tables' type cells, which only the app draws more than the
   prerendered page: a long union broken, a definition previewed. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { checkFirstExample, checkInstall, checkPage } from "@umriss-ui/demo/checks/page";
import { STANDARDS, findings } from "@umriss-ui/demo/checks/accessibility";
import { ALL_PAGES, open, openExample } from "./navigation";

checkInstall({ open, pages: ALL_PAGES, command: "npm install @umriss-ui/core" });

/* A page without a configurator, which would take the first slot (.scratch/configurator). */
checkFirstExample({ open, pageId: "treeview", title: "A tree" });

checkPage({
  open,
  openExample,
  pageId: "button",
  examples: ["variants", "sizes", "loading-and-disabled"],
  other: { name: "Tag", pageId: "tag" },
  packageName: "@umriss-ui/core",
  importLine: 'import { Button } from "@umriss-ui/core";',
  limits: "button",
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

/* The type cells (.scratch/a11y-and-finish, 07): a long union one member a
   line, and a link to a definition that previews it in core's Tooltip. */
test.describe("The API tables' type cells", () => {
  test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

  const values = (page: Page, row: string) => page.locator(`[id="${row}"] .apiType + br + code`);

  test("a union of more than two members stands one member a line", async ({ page }) => {
    await open(page, "button");
    expect(await values(page, "ButtonProps-variant").innerText()).toBe('| "primary"\n| "secondary"\n| "ghost"\n| "plain"\n| "danger"');
    /* Two members stay on one line. */
    expect(await values(page, "ButtonProps-size").innerText()).toBe('"sm" | "md"');
    await open(page, "typography");
    expect(await values(page, "TextProps-size").innerText()).toBe('| "xs"\n| "sm"\n| "md"\n| "lg"\n| "xl"\n| "2xl"');
  });

  test("a link to a definition previews it on hover and on focus, Escape closes it, a click follows it", async ({ page }) => {
    await open(page, "button");
    const link = page.locator('[id="ButtonProps-size"] .apiType a');
    const tip = page.getByRole("tooltip");
    await expect(link).toHaveText("ButtonSize");

    await link.hover();
    await expect(tip).toContainText('"sm" | "md"');
    await expect(link).toHaveAccessibleDescription(/"sm" \| "md"/);
    await page.mouse.move(0, 0);
    await expect(tip).toHaveCount(0);

    /* The link before it in the reading order is the row's own name. */
    await page.locator('[id="ButtonProps-size"] th a').focus();
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(tip).toContainText('"sm" | "md"');
    await page.keyboard.press("Escape");
    await expect(tip).toHaveCount(0);

    await link.click();
    await expect(page).toHaveURL(/#type-ButtonSize$/);
    await expect(page.locator('[id="type-ButtonSize"]')).toBeInViewport();
  });

  test("the Button page passes axe with a preview open", async ({ page }) => {
    await open(page, "button");
    await page.locator('[id="ButtonProps-size"] .apiType a').hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(STANDARDS).analyze();
    expect(findings(result).map((f) => `${f.rule}: ${f.where}`)).toEqual([]);
  });
});

test.describe("The other configurators", () => {
  const code = async (page: Page, pageId: string) =>
    (await page.locator(`[data-configurator="${pageId}"] pre code`).innerText()).trim();

  test("the IconButton's required glyph stands between the tags, and its name joins the import", async ({ page }) => {
    await open(page, "iconbutton");
    expect(await code(page, "iconbutton")).toBe(
      'import { IconButton, PlusGlyph } from "@umriss-ui/core";\n\n<IconButton aria-label="Add a stop"><PlusGlyph /></IconButton>',
    );
    await expect(page.locator('[data-configurator="iconbutton"] .exampleStage').getByRole("button", { name: "Add a stop" })).toBeVisible();
  });

  test("the Meter's value steps by a hundredth of its bounds, and the bar follows", async ({ page }) => {
    await open(page, "meter");
    const configurator = page.locator('[data-configurator="meter"]');
    const meter = configurator.locator(".exampleStage").getByRole("meter");
    const value = configurator.getByLabel("value", { exact: true });
    await expect(meter).toHaveAttribute("aria-valuenow", "80");
    await value.press("ArrowUp");
    expect(await code(page, "meter")).toBe('import { Meter } from "@umriss-ui/core";\n\n<Meter value={0.81} />');
    await expect(meter).toHaveAttribute("aria-valuenow", "81");
    await value.press("Shift+ArrowUp");
    await value.press("Shift+ArrowUp");
    expect(await code(page, "meter")).toBe('import { Meter } from "@umriss-ui/core";\n\n<Meter value={1} />');
  });

  test("the Typography page configures Text, and a Divider's label is typed in", async ({ page }) => {
    await open(page, "typography");
    await page.locator('[data-configurator="typography"]').getByRole("radiogroup", { name: "tone" }).getByText("muted", { exact: true }).click();
    expect(await code(page, "typography")).toBe(
      'import { Text } from "@umriss-ui/core";\n\n<Text tone="muted">Takes card and wallet payments for every booking.</Text>',
    );

    await open(page, "divider");
    const divider = page.locator('[data-configurator="divider"]');
    await divider.getByLabel("label", { exact: true }).fill("Returns");
    expect(await code(page, "divider")).toBe('import { Divider } from "@umriss-ui/core";\n\n<Divider label="Returns" />');
    await expect(divider.locator(".exampleStage").getByText("Returns")).toBeVisible();
  });

  test("the Sparkline's required data is written as its code, and its width steps by a pixel", async ({ page }) => {
    await open(page, "sparkline");
    const width = page.locator('[data-configurator="sparkline"]').getByLabel("width", { exact: true });
    await width.press("ArrowUp");
    expect(await code(page, "sparkline")).toBe(
      'import { Sparkline } from "@umriss-ui/core";\n\n<Sparkline data={[42, 58, 71, 66, 80, 74, 88]} width={97} />',
    );
  });

  test("the NumberInput's code writes its value as state, and the staged field takes a key", async ({ page }) => {
    await open(page, "numberinput");
    const configurator = page.locator('[data-configurator="numberinput"]');
    const field = configurator.locator(".exampleStage").getByRole("textbox", { name: "Parcel weight" });
    await configurator.getByRole("radiogroup", { name: "size" }).getByText("sm", { exact: true }).click();
    expect(await code(page, "numberinput")).toBe(
      'import { NumberInput } from "@umriss-ui/core";\n\n<NumberInput aria-label="Parcel weight" value={weight} onChange={setWeight} size="sm" />',
    );
    await field.press("ArrowUp");
    await expect(field).toHaveValue("19.5");
    /* The step is bounded: it cannot fall to 0, at which the field would
       never move. */
    await configurator.getByLabel("step", { exact: true }).press("Shift+ArrowDown");
    expect(await code(page, "numberinput")).toBe(
      'import { NumberInput } from "@umriss-ui/core";\n\n<NumberInput aria-label="Parcel weight" value={weight} onChange={setWeight} size="sm" step={0.1} />',
    );
    await field.press("ArrowUp");
    await expect(field).toHaveValue("19.6");
  });

  test("the RadioGroup's required options stand in its code as written", async ({ page }) => {
    await open(page, "radiogroup");
    expect(await code(page, "radiogroup")).toBe(
      'import { RadioGroup } from "@umriss-ui/core";\n\n<RadioGroup aria-label="If nobody is home" options={[{ value: "door", label: "Leave at the door" }, { value: "neighbour", label: "Hand to a neighbour" }, { value: "depot", label: "Take back to the depot" }]} defaultValue="neighbour" />',
    );
    await expect(page.locator('[data-configurator="radiogroup"] .exampleStage').getByRole("radio", { name: "Hand to a neighbour" })).toBeChecked();
  });
});
