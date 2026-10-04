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
  /** A page whose props table names an example on that page; `pageId`
      where omitted. */
  tablePageId?: string;
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

/* Suggest an edit (.scratch/concepts-and-changelog-pages): a page's last link
   opens GitHub's new-issue form, already naming the page - its title and its
   address - on the first page and after a move to another. */
test("the page ends with a suggested edit on GitHub that names it", async ({ page }) => {
  const expectNamed = async () => {
    const link = page.getByRole("link", { name: "Suggest an edit on GitHub" });
    await expect(page.locator("main a").last()).toHaveText("Suggest an edit on GitHub");
    const href = new URL((await link.getAttribute("href")) ?? "");
    const here = new URL(page.url());
    expect(href.origin + href.pathname).toBe("https://github.com/romanhaendler/umriss-ui/issues/new");
    expect(href.searchParams.get("title")).toBe(`Docs: ${await page.title()}`);
    expect(href.searchParams.get("body")).toBe(`${here.origin}${here.pathname}\n\n`);
  };
  await open(page, p.pageId);
  await expectNamed();
  await page.getByRole("navigation", { name: "Components" }).getByText(p.other.name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.other.pageId}"]`)).toBeVisible();
  await expectNamed();
});

/* Every row names the examples that show it, and is an address of its own
   (.scratch/props-to-examples). A row outside a closed fold. */
const tablePage = p.tablePageId ?? p.pageId;
const rows = (page: Page) => page.locator(".apiTables tbody tr").filter({ visible: true });

test("a row's \"Shown in\" link lands on the example, in view", async ({ page }) => {
  await open(page, tablePage);
  const link = rows(page).locator(`.apiShown a[href^="../${tablePage}/#"]`).first();
  const anchor = (await link.getAttribute("href"))!.split("#")[1]!;
  await link.click();
  await expect(page).toHaveURL(new RegExp(`/${tablePage}/#${anchor}$`));
  /* On a page that opens with a configurator, the first row it sets names it. */
  await expect(example(page, anchor).or(page.locator(`[id="${anchor}"]`))).toBeInViewport();
});

test("a row's name puts the row's anchor into the address", async ({ page }) => {
  await open(page, tablePage);
  const row = rows(page).first();
  const id = (await row.getAttribute("id"))!;
  expect(id).toMatch(/^[A-Z]\w*-/);
  await row.locator("th a").click();
  await expect(page).toHaveURL(new RegExp(`/${tablePage}/#${id}$`));
  await expect(row).toBeInViewport();
});

/* A feature page shows the props it is about (.scratch/props-to-examples, 02):
   "On this page" names the section, and a row's name leads to the full row on
   the page of the full table. */
test("a feature page's \"Props on this page\" leads to the full row", async ({ page }) => {
  test.skip(p.tablePageId === undefined, "the page has a table of its own");
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, p.pageId);
  await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Props on this page", exact: true })).toHaveAttribute(
    "href",
    new RegExp(`#props-${p.pageId}$`),
  );
  const link = page.getByRole("region", { name: "Props on this page", exact: true }).locator("tbody th a").first();
  const id = (await link.getAttribute("href"))!.split("#")[1]!;
  await link.click();
  await expect(page).toHaveURL(new RegExp(`/${tablePage}/#${id}$`));
  await expect(page.locator(`tr[id="${id}"]`)).toBeInViewport();
});

/* "Copy page" (.scratch/pages-as-markdown, 03): what lands on the clipboard
   is exactly what the server serves at the page's twin - and after a move in
   the app, the new page's, never the one the reader came from. */
const head = (page: Page, pageId: string) => page.locator(`[data-block="${pageId}"] .pageHead`);
const twinOf = async (page: Page, address: string, name: string) => {
  const twin = await (await page.request.get(address)).text();
  expect(twin.startsWith(`# ${name}\n`), `${address} is the twin of ${name}`).toBe(true);
  return twin;
};

test("Copy page puts the page's Markdown twin on the clipboard, and follows the page", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "scenarios");
  await page.getByRole("navigation", { name: "Components" }).getByText(p.other.name, { exact: true }).click();
  const here = head(page, p.other.pageId);
  await here.getByRole("button", { name: "Copy page", exact: true }).click();
  await expect(here.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  /* The label alone is not reliably announced; the status region is. */
  await expect(here.getByRole("status")).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await twinOf(page, `/${p.other.pageId}.md`, p.other.name),
  );
  await expect(here.getByRole("button", { name: "Copy page", exact: true })).toBeVisible();
  await expect(here.getByRole("status")).toHaveText("");
});

test("the Copy page menu: the keys of core's menu, the twin, and the prompt for two assistants", async ({ page, context }) => {
  await context.route(/^https:\/\/(claude\.ai|chatgpt\.com)\//, (route) => route.fulfill({ body: "" }));
  await open(page, p.other.pageId);
  const origin = new URL(page.url()).origin;
  const version = (await page.locator(".shellVersion").textContent())!;
  const triggerOf = (pageId: string) => head(page, pageId).getByRole("button", { name: "More ways to use this page" });
  const trigger = triggerOf(p.other.pageId);
  const menu = page.getByRole("menu");
  const items = menu.getByRole("menuitem");

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(items).toHaveText(["View as Markdown", "Open in Claude", "Open in ChatGPT"]);
  await expect(items.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(items.nth(2)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(items.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(items.nth(2)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();

  const opened = async (name: string, pageId = p.other.pageId) => {
    await triggerOf(pageId).click();
    const popup = page.waitForEvent("popup");
    await items.getByText(name, { exact: true }).click();
    const tab = await popup;
    await tab.waitForLoadState();
    const url = tab.url();
    await tab.close();
    return url;
  };
  const twin = `${origin}/${p.other.pageId}.md`;
  expect(await opened("View as Markdown")).toBe(twin);
  const prompt = encodeURIComponent(
    `Read ${twin} — the documentation of ${p.other.name} in ${p.packageName}@${version}. Then help me use it in my React app.`,
  );
  expect(await opened("Open in Claude")).toBe(`https://claude.ai/new?q=${prompt}`);
  expect(await opened("Open in ChatGPT")).toBe(`https://chatgpt.com/?hints=search&q=${prompt}`);

  /* The scenarios page has a twin as well, and the prompt names it so. */
  await open(page, "scenarios");
  await twinOf(page, "/index.md", p.packageName);
  expect(await opened("Open in Claude", "scenarios")).toBe(
    `https://claude.ai/new?q=${encodeURIComponent(
      `Read ${origin}/index.md — the documentation of the scenarios in ${p.packageName}@${version}. Then help me use it in my React app.`,
    )}`,
  );
});

test("Copy page fits the rubric line at 390 px and moves nothing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const pageId of ["scenarios", p.pageId]) {
    await open(page, pageId);
    const line = head(page, pageId).locator(".pageRubricLine");
    const rubric = (await line.locator(".pageRubric").boundingBox())!;
    const lineBox = (await line.boundingBox())!;
    const button = (await line.getByRole("group").boundingBox())!;
    const pageHead = (await head(page, pageId).boundingBox())!;
    /* The line is as tall as the rubric's words: the button adds no height,
       so the title below stands where it stood. */
    expect(lineBox.height).toBeCloseTo(rubric.height, 0);
    expect(Math.abs(button.y + button.height / 2 - (rubric.y + rubric.height / 2))).toBeLessThan(1);
    expect(button.x + button.width).toBeLessThanOrEqual(pageHead.x + pageHead.width + 0.5);
    expect(button.x).toBeGreaterThan(rubric.x + rubric.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
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
