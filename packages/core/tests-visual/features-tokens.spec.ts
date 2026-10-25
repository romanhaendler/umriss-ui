/* Tokens an application sets on `:root` after the library's own: a modal's
   three widths, the case of the spaced capitals and the button's press. Each
   is measured as a user sees it - a width, a computed style - with the token
   added the way an application adds it, as unlayered CSS. */

import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const style = (page: Page, css: string) => page.addStyleTag({ content: `:root { ${css} }` });

const WIDTHS = { sm: 400, md: 520, lg: 720 } as const;

/* The sheet is the dialog's child that holds the window's heading. */
async function sheetWidth(page: Page, size: keyof typeof WIDTHS) {
  await page.getByRole("button", { name: `Open ${size}`, exact: true }).click();
  const heading = page.getByRole("heading", { name: `A ${size} window` });
  await expect(heading).toBeVisible();
  const width = await heading.evaluate((element) => element.closest("dialog > div")!.getBoundingClientRect().width);
  await page.keyboard.press("Escape");
  await expect(heading).toBeHidden();
  return width;
}

for (const size of ["sm", "md", "lg"] as const) {
  test(`A ${size} modal is as wide as its token, and no wider than the window`, { tag: "@quick" }, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openExample(page, "modal", "sizes");
    expect(await sheetWidth(page, size)).toBeCloseTo(WIDTHS[size], 0);

    await style(page, `--u-modal-width-${size}: 600px`);
    expect(await sheetWidth(page, size)).toBeCloseTo(600, 0);

    await page.setViewportSize({ width: 360, height: 800 });
    expect(await sheetWidth(page, size)).toBeLessThanOrEqual(360);
  });
}

const caseOf = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).textTransform);

test("A card's eyebrow and a divider's label follow the capitals token", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "card", "eyebrow-and-actions");
  const eyebrow = page.getByText("Invoice", { exact: true });
  expect(await caseOf(eyebrow)).toBe("uppercase");
  await style(page, "--u-transform-caps: none");
  expect(await caseOf(eyebrow)).toBe("none");

  await page.goto("about:blank");
  await openExample(page, "divider", "strength-and-label");
  const label = page.getByText("Afternoon", { exact: true });
  expect(await caseOf(label)).toBe("uppercase");
  await style(page, "--u-transform-caps: none");
  expect(await caseOf(label)).toBe("none");
});

test("A pressed button is scaled by the press token", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "button", "one-action");
  const button = page.getByRole("button").first();
  const scaleWhilePressed = async () => {
    await button.hover();
    await page.mouse.down();
    const scale = await button.evaluate((element) => new Promise<number>((done) => setTimeout(() => done(new DOMMatrix(getComputedStyle(element).transform).a), 400)));
    await page.mouse.up();
    return scale;
  };
  expect(await scaleWhilePressed()).toBeCloseTo(0.98, 2);
  await style(page, "--u-button-press-scale: 1");
  expect(await scaleWhilePressed()).toBeCloseTo(1, 2);
});

/* A renamed token's alias (`--u-old: var(--u-new)` in the tokens layer) with a rule that reads the old name:
   either name set on `:root` reaches that rule. */
test("A token and its deprecated alias each reach a rule that reads the old name", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "button", "one-action");
  await page.addStyleTag({
    content: "@layer umriss.tokens { :root { --u-probe-old: var(--u-probe-new); } } .probe { color: var(--u-probe-old); }",
  });
  const probe = await page.locator("body").evaluateHandle((body) => {
    const element = document.createElement("div");
    element.className = "probe";
    body.append(element);
    return element;
  });
  const color = () => probe.evaluate((element) => getComputedStyle(element).color);
  await style(page, "--u-probe-new: rgb(1, 2, 3)");
  expect(await color()).toBe("rgb(1, 2, 3)");
  await style(page, "--u-probe-old: rgb(4, 5, 6)");
  expect(await color()).toBe("rgb(4, 5, 6)");
});
