/* The label size token: an application sets `--u-label-size` on `:root` after
   the library's own, and a FormField's label takes it while the field inside
   keeps its text size. Measured as a user sees it, with the token added as
   unlayered CSS. */

import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const style = (page: Page, css: string) => page.addStyleTag({ content: `:root { ${css} }` });

const fontSize = (locator: Locator) =>
  locator.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));

test("A FormField's label takes the label token, and the field keeps its own size", { tag: "@quick" }, async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "formfield", "label-and-hint");
  const label = page.getByLabel("Label and hint").getByText("Cost centre", { exact: true });
  const input = page.getByLabel("Label and hint").getByPlaceholder("CC-0000");

  const textSm = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.8125);
  expect(await fontSize(label)).toBeCloseTo(textSm, 1);

  await style(page, "--u-label-size: 0.75rem");
  expect(await fontSize(label)).toBeCloseTo(12, 1);
  expect(await fontSize(input)).toBeCloseTo(textSm, 1);
});
