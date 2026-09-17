/* What makes a page operable: the code toggle, the page toggle and the copy
   button.

   None of it can be expressed in jsdom. The toggle hangs on a state two
   components share without either owning it; the clipboard does not exist
   there at all. Hence this stands here and not in the unit tests.

   The string rules themselves - no `title`, no `../../../src` - are checked in
   `packages/demo/tests-unit/source.test.ts`. Here it is checked that exactly
   WHAT stands there lands in the clipboard.

   Like the shell's suite it stands once and runs against every demo: their
   `funktionen-pageId.spec.ts` calls `checkPage` with a page that has three
   examples, and with a second one. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { allWithCode } from "./navigation";

export interface PageProbes {
  /** How the demo opens a page and an example (its `navigation.ts`). */
  open: (page: Page, pageId: string) => Promise<void>;
  openExample: (page: Page, pageId: string, example: string) => Promise<void>;
  /** A page with at least three examples, in their order. */
  pageId: string;
  examples: readonly [string, string, string];
  /** Another page, named in the sidebar. */
  other: { name: string; pageId: string };
  /** The package name the code block shows. */
  packageName: string;
  /** The page's import line, as it must land in the clipboard. */
  importLine: string;
}

export function checkPage(p: PageProbes): void {
const { open, openExample } = p;
const [first, second, third] = p.examples;

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const example = (page: Page, id: string) =>
  page.locator(`[data-example="${id}"]`);

const codeBlock = (page: Page, id: string) =>
  example(page, id).locator(".codeBlock");

test("the code toggle opens exactly one example", async ({ page }) => {
  await open(page, p.pageId);
  await expect(codeBlock(page, first)).toBeHidden();
  await expect(codeBlock(page, second)).toBeHidden();

  await example(page, first).getByRole("button", { name: "Code" }).click();

  await expect(codeBlock(page, first)).toBeVisible();
  // And only that one: the toggle belongs to the block, not to the page.
  await expect(codeBlock(page, second)).toBeHidden();
});

test("the page toggle opens all - and collapsing one leaves the rest open", async ({
  page,
}) => {
  await open(page, p.pageId);
  await allWithCode(page);

  await expect(codeBlock(page, first)).toBeVisible();
  await expect(codeBlock(page, second)).toBeVisible();
  await expect(codeBlock(page, third)).toBeVisible();

  /* This is the case the two controls have to agree on: the toggle sets the
     default, collapsing one sets an exception to it - and no second one. */
  await example(page, second).getByRole("button", { name: "Code" }).click();

  await expect(codeBlock(page, second)).toBeHidden();
  await expect(codeBlock(page, first)).toBeVisible();
  await expect(codeBlock(page, third)).toBeVisible();
});

test("the page toggle survives a jump within the page", async ({ page }) => {
  await open(page, p.pageId);
  await allWithCode(page);
  await expect(codeBlock(page, first)).toBeVisible();

  /* A jump to an example on the SAME page does not rebuild the page. If it
     did, the toggle would be off again afterwards, and opening every block
     would hold exactly until the first link. */
  await page.goto(`/#/${p.pageId}/${third}`);
  await expect(example(page, third)).toBeInViewport();
  await expect(page.getByLabel("all examples with code")).toBeChecked();
  await expect(codeBlock(page, first)).toBeVisible();
});

test("the page toggle starts closed again on the next page", async ({ page }) => {
  await open(page, p.pageId);
  await allWithCode(page);
  await page.getByRole("navigation", { name: "Components" }).getByText(p.other.name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.other.pageId}"]`)).toBeVisible();
  await expect(page.getByLabel("all examples with code")).not.toBeChecked();
});

test("the copy button puts exactly the shown source into the clipboard", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openExample(page, p.pageId, first);
  await example(page, first).getByRole("button", { name: "Code" }).click();

  const shown = (await codeBlock(page, first).locator("pre code").innerText()).trim();

  await codeBlock(page, first).getByRole("button", { name: "Copy" }).click();
  await expect(
    codeBlock(page, first).getByRole("button", { name: "Copied" }),
  ).toBeVisible();

  const content = (await page.evaluate(() => navigator.clipboard.readText())).trim();

  expect(content).toBe(shown);
  /* And the two rules that make the difference between file and display -
     here against what actually lies in the clipboard. */
  expect(content).toContain(`from "${p.packageName}"`);
  expect(content).not.toContain("../../../src");
  expect(content).not.toContain("export const title");
});

test("the import line copies itself as well", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, p.pageId);
  await page.locator(".importLine").getByRole("button", { name: "Copy" }).click();
  await expect(page.locator(".importLine").getByRole("button", { name: "Copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(p.importLine);
});
}
