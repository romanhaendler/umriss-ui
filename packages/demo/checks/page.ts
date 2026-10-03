/* What makes a page operable: the code toggle, the page toggle and the copy
   button - and, on the page that installs, the install command. Beside them,
   where a page's known limits lead.

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
import { PACKAGES } from "../src/packages.ts";
import { ADR_0032 } from "../src/outline.ts";

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
  /** A page with known limits. */
  limits: string;
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
  await page.goto(`/${p.pageId}/#${third}`);
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

/* What umriss-ui is not is a page of the site (.scratch/concepts-and-changelog-pages):
   the known limits stay on it, the closing line and every limit that names
   the ADR alike. */
test("the known limits link what umriss-ui is not on the site", async ({ page }) => {
  await open(page, p.limits);
  const links = page.getByRole("region", { name: "Known limits" }).getByRole("link", { name: "ADR-0032" });
  await expect(links.first()).toBeVisible();
  for (const link of await links.all()) await expect(link).toHaveAttribute("href", ADR_0032);
});
}

export interface InstallProbes {
  open: (page: Page, pageId: string) => Promise<void>;
  /** The demo's pages: the one flagged `installs` is opened, and the landing
      leads to the one the package list names to start with. */
  pages: readonly { id: string; name: string; installs?: true }[];
  /** The install command, as it must land in the clipboard. */
  command: string;
}

/** The page that installs and the landing: the command stands on both and
    copies itself, exactly. It runs against all five demos - those without `checkPage` call
    it alone. */
export function checkInstall({ open, pages, command }: InstallProbes): void {
  test("the install command stands on the page that installs and copies itself", async ({ page, context }) => {
    test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
    const installing = pages.filter((one) => one.installs === true);
    expect(installing).toHaveLength(1);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, installing[0]!.id);
    const line = page.locator(".installLine");
    await expect(line.locator("code")).toHaveText(command);
    await line.getByRole("button", { name: "Copy" }).click();
    await expect(line.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command);
  });

  /* The landing names its package, installs it with the same command and
     says where to begin - on a page of this demo, which the link opens. */
  test("the landing names its package, installs it and says where to start", async ({ page, context }) => {
    test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
    const npm = command.split(" ")[2];
    const start = pages.find((one) => one.id === PACKAGES.find((entry) => entry.npm === npm)?.start);
    expect(start, `the package list names a page of ${npm} to start with`).toBeDefined();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, "scenarios");
    const head = page.locator('[data-block="scenarios"] .pageHead');
    await expect(head.getByRole("heading", { level: 1 })).toHaveText(npm!);
    const line = head.locator(".installLine");
    await expect(line.locator("code")).toHaveText(command);
    await line.getByRole("button", { name: "Copy" }).click();
    await expect(line.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command);
    await head.getByRole("link", { name: `Start with ${start!.name} →` }).click();
    await expect(page.locator(`[data-block="${start!.id}"] h1`)).toHaveText(start!.name);
  });

  /* The page that installs names its ADRs in most demos - and the shell links
     them as the prerendered page does (.scratch/props-table-hygiene, 03). */
  test("the page that installs names no requirement and no ADR outside a link", async ({ page }) => {
    test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
    await open(page, pages.find((one) => one.installs === true)!.id);
    const leaks = await page.locator("article.page").evaluate((article) => {
      const found: string[] = [];
      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
        if (node.parentElement?.closest("a, pre") !== null) continue;
        found.push(...(node.textContent!.match(/ADR-\d{4}|\bR-\d+(?:\.\d+)*/g) ?? []));
      }
      return found;
    });
    expect(leaks).toEqual([]);
  });
}

export interface FirstExampleProbes {
  open: (page: Page, pageId: string) => Promise<void>;
  /** A page, and the title of its first example. */
  pageId: string;
  title: string;
}

/** A page's first example starts with the component: no head row, its code
    toggle under the stage. It runs against all five demos - the card is the
    shell's, so one page each stands for every page. */
export function checkFirstExample({ open, pageId, title }: FirstExampleProbes): void {
  test("the first example starts with its stage, and its code toggle follows it", async ({ page }) => {
    test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
    await open(page, pageId);
    const first = page.locator("[data-example]").first();

    /* Named by its title for assistive technology, though no heading shows it. */
    await expect(page.getByRole("region", { name: title, exact: true })).toHaveAttribute(
      "data-example",
      (await first.getAttribute("data-example"))!,
    );
    await expect(first.locator("header")).toHaveCount(0);
    await expect(first.getByRole("heading")).toHaveCount(0);

    /* No example card on the page has a head row that names nothing. */
    for (const head of await page.locator("[data-example] > header").all()) {
      await expect(head.getByRole("heading")).toHaveText(/\S/);
    }

    /* The toggle stands under the stage, and after it in the tab order: no
       positive tabindex reorders the shell, so the order is the document's. */
    const stage = first.locator(".exampleStage");
    const toggle = first.getByRole("button", { name: "Code", exact: true });
    const stageBox = (await stage.boundingBox())!;
    const toggleBox = (await toggle.boundingBox())!;
    expect(toggleBox.y).toBeGreaterThanOrEqual(stageBox.y + stageBox.height);
    const follows = await toggle.evaluate(
      (button, before) => !!(before!.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING),
      await stage.elementHandle(),
    );
    expect(follows).toBe(true);

    /* And it opens the code. */
    await toggle.click();
    await expect(first.locator(".codeBlock")).toBeVisible();
  });
}
