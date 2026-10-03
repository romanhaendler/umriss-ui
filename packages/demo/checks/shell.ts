/* The demo shell: outline, jump palette, addresses.

   The other test files go straight to a page through `open()` and see of the
   shell only what it passes through. This one is the only place where sidebar,
   header, scenarios page and palette themselves run in a browser.

   It stands once, with the shell, and runs against every demo that uses it:
   `packages/<package>/tests-visual/features-shell.spec.ts` calls
   `checkShell` with the pages and queries it can be checked against in THAT
   demo. The promises are the same; only the names are not.

   WHAT DELIBERATELY CHANGED ABOUT THE PALETTE (`command-palette` 07). The
   palette is no longer a private function of this shell but `CommandPalette`
   from the library. Two of the four tests here checked behaviour this work
   package deliberately changed; the changes stand at the test in question, so
   that a reader can tell an improvement from a regression:

   1. RESTING STATE. Before, every candidate stood there ahead of the first
      character. Now none does. A list that is already full can only shrink -
      the growing that makes the window feel alive cannot be produced at all.
   2. SUBSEQUENCE INSTEAD OF SUBSTRING. `dtp` used to find nothing and now
      finds `DateTimePicker`. The price is that a search finds more than it
      used to - which is why the palette marks the characters it hit. */

import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STANDARDS, findings } from "./accessibility";
import { pageTitle, type TitleManifest } from "../src/tooling/title";
import { PACKAGES } from "../src/packages";

interface NamedPage {
  /** The name in sidebar and palette. */
  name: string;
  /** The address of the page. */
  pageId: string;
}

export interface ShellProbes {
  /** This demo's package, as the package list names it. */
  packageId: string;
  /** Two pages, neither of which the front door may show. */
  notOnTheFrontDoor: readonly [string, string];
  /** An entry in the sidebar and the id of its rubric. */
  rail: NamedPage & { rubricId: string };
  /** Two pages of the same rubric. */
  neighbours: readonly [NamedPage, NamedPage];
  /** A page for the deep link - and one that must not appear with it. */
  deepLink: { pageId: string; absent: string };
  /** An example with its title and the name of its page. */
  example: { pageId: string; id: string; title: string; pageName: string };
  /** A query whose first find is a page, with the name of its rubric. */
  palettePage: NamedPage & { query: string; rubricName: string };
  /** An abbreviation as a subsequence, and the characters it hits in the first find. */
  abbreviation: { query: string; find: string; glyphs: readonly string[] };
  /** A query with more than five finds, and a longer one with fewer. */
  pointer: { wide: string; narrow: string };
  /** A scenario's anchor, where the demo has one. */
  scenario?: string;
  /** A scenario whose table pins a block on a wide stage, where the demo has one. */
  pinnedScenario?: string;
  /** A page id that changed (`MOVED` in the outline), the page it is now and
      an example on it - where the demo has one. */
  moved?: { from: string; pageId: string; example: string };
  /** A page with several examples and an API section, and one of its
      examples after the first, for "On this page". */
  contents: { pageId: string; id: string; title: string };
  /** A page whose entry lies low in the sidebar (core: Tag; elsewhere the
      last page). */
  low: NamedPage;
  /** A row of a props table long enough to fold, in a secondary group - its
      page and its anchor `<Type>-<prop>` - where the demo has one. */
  foldedRow?: { pageId: string; id: string };
  /** Another library's word for a page, which only its lede carries
      (.scratch/one-search) - where the demo has one. */
  synonyms?: readonly (NamedPage & { query: string })[];
}

/** The title the prerendering writes for a page - by the same function, from
    the manifest of the package under test (`<package>/tests-visual/..`). */
function prerenderedTitle(pageName?: string): string {
  const manifest = JSON.parse(readFileSync(join(test.info().project.testDir, "..", "package.json"), "utf8")) as TitleManifest;
  return pageTitle(manifest, pageName);
}

export function checkShell(p: ShellProbes): void {
test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("the front door is the scenarios page, and no component page", async ({ page }) => {
  await expect(page.locator('[data-block="scenarios"]')).toBeVisible();
  await expect(page.locator(`[data-block="${p.notOnTheFrontDoor[0]}"]`)).toHaveCount(0);
  await expect(page.locator(`[data-block="${p.notOnTheFrontDoor[1]}"]`)).toHaveCount(0);
});

test("the sidebar's first entry leads back to the scenarios page", async ({ page }) => {
  const rail = page.getByRole("navigation", { name: "Components" });
  await rail.getByText(p.rail.name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.rail.pageId}"]`)).toBeVisible();
  await rail.getByRole("link", { name: "Scenarios", exact: true }).click();
  await expect(page.locator('[data-block="scenarios"]')).toBeVisible();
  await expect(page.locator(`[data-block="${p.rail.pageId}"]`)).toHaveCount(0);
});

test("the sidebar's entries are links with their page's address", async ({ page }) => {
  /* So that a middle click opens a new tab and "copy link" copies the page -
     a plain click still moves without a reload. */
  const rail = page.getByRole("navigation", { name: "Components" });
  await expect(rail.getByRole("button")).toHaveCount(0);
  await expect(rail.getByRole("link", { name: "Scenarios", exact: true })).toHaveAttribute("href", "/");
  const entry = rail.getByRole("link", { name: p.rail.name, exact: true });
  await expect(entry).toHaveAttribute("href", `/${p.rail.pageId}/`);

  await page.evaluate(() => ((window as unknown as { __noReload?: boolean }).__noReload = true));
  await entry.click();
  await expect(page.locator(`[data-block="${p.rail.pageId}"]`)).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);
});

test("the active entry stands in the sidebar's view, after load and after a jump", async ({ page }) => {
  const rail = page.getByRole("navigation", { name: "Components" });
  const entry = rail.getByRole("link", { name: p.low.name, exact: true });
  const pageScroll = () => page.evaluate(() => document.documentElement.scrollTop);

  await page.goto(`/${p.low.pageId}/`);
  await expect(entry).toHaveAttribute("aria-current", "page");
  await expect(entry).toBeInViewport({ ratio: 1 });
  expect(await pageScroll()).toBe(0);

  await page.goto("/");
  await page.keyboard.press("ControlOrMeta+k");
  const field = page.getByRole("combobox", { name: "Search umriss-ui" });
  await field.fill(p.low.name);
  await expect(page.getByRole("dialog").getByRole("option").first()).toContainText(p.low.name);
  await field.press("Enter");
  await expect(page.locator(`[data-block="${p.low.pageId}"]`)).toBeVisible();
  await expect(entry).toBeInViewport({ ratio: 1 });
  expect(await pageScroll()).toBe(0);
});

test("an entry in the sidebar opens its page", async ({ page }) => {
  await page.getByRole("navigation", { name: "Components" }).getByText(p.rail.name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.rail.pageId}"]`)).toBeVisible();
  // The rubric is NOT in the address (CONTEXT.md, "Rubric").
  expect(new URL(page.url()).pathname).toBe(`/${p.rail.pageId}/`);
  expect(page.url()).not.toContain(p.rail.rubricId);
});

test("two pages of the same rubric in turn", async ({ page }) => {
  const rail = page.getByRole("navigation", { name: "Components" });
  await rail.getByText(p.neighbours[0].name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.neighbours[0].pageId}"]`)).toBeVisible();

  await rail.getByText(p.neighbours[1].name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.neighbours[1].pageId}"]`)).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(`/${p.neighbours[1].pageId}/`);

  // And back again.
  await rail.getByText(p.neighbours[0].name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.neighbours[0].pageId}"]`)).toBeVisible();
});

test("history carries: back and forward again", async ({ page }) => {
  const rail = page.getByRole("navigation", { name: "Components" });
  await rail.getByText(p.neighbours[0].name, { exact: true }).click();
  await rail.getByText(p.neighbours[1].name, { exact: true }).click();
  await page.goBack();
  await expect(page.locator(`[data-block="${p.neighbours[0].pageId}"]`)).toBeVisible();
  await page.goForward();
  await expect(page.locator(`[data-block="${p.neighbours[1].pageId}"]`)).toBeVisible();
});

/* THE HEAD FOLLOWS THE PAGE (.scratch/pages-as-markdown 02). The title and
   the one alternate link to the page's Markdown twin are set in one place of
   the shell, on the first load and on every move; the twin itself is a file
   the server serves at that address. The title is the very one the
   prerendering writes for the page (`shell-across-packages` 03). */
test("the head follows the page: its title, and one link to its Markdown twin", async ({ page }) => {
  const twins = page.locator('head link[rel="alternate"][type="text/markdown"]');
  await expect(twins).toHaveCount(1);
  await expect(twins).toHaveAttribute("href", "/index.md");
  await expect(page).toHaveTitle(prerenderedTitle());

  const rail = page.getByRole("navigation", { name: "Components" });
  await rail.getByText(p.neighbours[0].name, { exact: true }).click();
  await rail.getByText(p.neighbours[1].name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.neighbours[1].pageId}"]`)).toBeVisible();
  await expect(twins).toHaveCount(1);
  await expect(twins).toHaveAttribute("href", `/${p.neighbours[1].pageId}.md`);
  await expect(page).toHaveTitle(prerenderedTitle(p.neighbours[1].name));
  const twin = await page.request.get(`/${p.neighbours[1].pageId}.md`);
  expect(twin.ok()).toBe(true);
  expect((await twin.text()).startsWith(`# ${p.neighbours[1].name}\n`)).toBe(true);

  await page.goBack();
  await expect(twins).toHaveAttribute("href", `/${p.neighbours[0].pageId}.md`);
  await expect(page).toHaveTitle(prerenderedTitle(p.neighbours[0].name));

  // An example's anchor stands in its page's text and keeps the title.
  await page.goto(`/${p.example.pageId}/#${p.example.id}`);
  await expect(page).toHaveTitle(prerenderedTitle(p.example.pageName));
});

test("the address is the place: a deep link lands on the page", async ({ page }) => {
  await page.goto(`/${p.deepLink.pageId}/`);
  await expect(page.locator(`[data-block="${p.deepLink.pageId}"]`)).toBeVisible();
  await expect(page.locator(`[data-block="${p.deepLink.absent}"]`)).toHaveCount(0);
});

test("an old hash address is forwarded to its path (ADR-0037)", async ({ page }) => {
  await page.goto(`/#/${p.example.pageId}/${p.example.id}`);
  await expect(page.locator(`[data-example="${p.example.id}"]`)).toBeInViewport();
  const url = new URL(page.url());
  expect(url.pathname + url.hash).toBe(`/${p.example.pageId}/#${p.example.id}`);
});

test("a moved address lands on the page, under its current address", async ({ page }) => {
  test.skip(p.moved === undefined, "this demo has no moved page");
  const { from, pageId, example } = p.moved!;
  await page.goto(`/${from}/`);
  await expect(page.locator(`[data-block="${pageId}"]`)).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(`/${pageId}/`);

  await page.goto(`/${from}/#${example}`);
  const target = page.locator(`[data-example="${example}"]`);
  await expect(target).toBeInViewport();
  await expect(target).toHaveAttribute("data-highlight", "");
  const url = new URL(page.url());
  expect(url.pathname + url.hash).toBe(`/${pageId}/#${example}`);
});

test("the address of an example brings it into view", async ({ page }) => {
  await page.goto(`/${p.example.pageId}/#${p.example.id}`);
  const target = page.locator(`[data-example="${p.example.id}"]`);
  await expect(target).toBeInViewport();
});

test("an unknown address lands on the scenarios page, not on nothing", async ({ page }) => {
  await page.goto("/gibtesnicht/");
  await expect(page.locator('[data-block="scenarios"]')).toBeVisible();
});

test("the address of a scenario brings it into view", async ({ page }) => {
  test.skip(p.scenario === undefined, "this demo has no scenario yet");
  await page.goto(`/#${p.scenario}`);
  await expect(page.locator(`[data-scenario="${p.scenario}"]`)).toBeInViewport();
});

/* "On this page" (page-orientation 01). From 1300 px a column beside the
   page, narrower a closed disclosure under its head. */
const onThisPage = (page: Page) => page.getByRole("navigation", { name: "On this page" });

test("on this page stands beside the content, and an example entry jumps to it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/${p.contents.pageId}/`);
  const list = onThisPage(page);
  await expect(list).toBeVisible();
  const head = await page.locator(`[data-block="${p.contents.pageId}"] .pageHead`).boundingBox();
  const beside = await list.boundingBox();
  expect(beside!.x).toBeGreaterThanOrEqual(head!.x + head!.width);

  await list.getByRole("link", { name: p.contents.title, exact: true }).click();
  const target = page.locator(`[data-example="${p.contents.id}"]`);
  await expect(target).toBeInViewport();
  await expect(target).toHaveAttribute("data-highlight", "");
  const url = new URL(page.url());
  expect(url.pathname + url.hash).toBe(`/${p.contents.pageId}/#${p.contents.id}`);
});

test("on this page: a section entry puts its heading below the header, unmarked", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/${p.contents.pageId}/`);
  await onThisPage(page).getByRole("link", { name: "API", exact: true }).click();
  // Not an unknown example: the page stays, and does not start at the top.
  await expect(page.locator(`[data-block="${p.contents.pageId}"]`)).toBeVisible();
  const heading = page.getByRole("heading", { name: "API", exact: true, level: 2 });
  await expect(heading).toBeInViewport();
  const header = await page.locator(".shellHead").boundingBox();
  const box = await heading.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
  // At the top of the window - or as high as the page's end lets it go.
  const atEnd = await page.evaluate(
    () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1,
  );
  if (!atEnd) expect(box!.y).toBeLessThan(header!.y + header!.height + 60);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  expect(new URL(page.url()).hash).toBe(`#api-${p.contents.pageId}`);
  await expect(page.locator("[data-highlight]")).toHaveCount(0);
});

test("on this page marks where the reader is, the last entry at the end", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/${p.contents.pageId}/`);
  const list = onThisPage(page);
  const current = list.locator('[aria-current="location"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText(await page.locator(".pageName").innerText());
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(list.getByRole("link").last()).toHaveAttribute("aria-current", "location");
  await expect(current).toHaveCount(1);
});

test("on this page is a closed disclosure under the head at 1000 px", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto(`/${p.contents.pageId}/`);
  const block = page.locator(`[data-block="${p.contents.pageId}"]`);
  const summary = block.locator("summary", { hasText: "On this page" });
  await expect(summary).toBeVisible();
  await expect(onThisPage(page)).toBeHidden();
  // After the head, before the first example.
  const head = await block.locator(".pageHead").boundingBox();
  const hero = await block.locator("[data-hero]").boundingBox();
  const at = await summary.boundingBox();
  expect(at!.y).toBeGreaterThan(head!.y + head!.height);
  expect(at!.y + at!.height).toBeLessThan(hero!.y);

  await summary.click();
  await onThisPage(page).getByRole("link", { name: p.contents.title, exact: true }).click();
  await expect(page.locator(`[data-example="${p.contents.id}"]`)).toBeInViewport();
  const url = new URL(page.url());
  expect(url.pathname + url.hash).toBe(`/${p.contents.pageId}/#${p.contents.id}`);
});

test("on this page on the scenarios page lists the scenarios", async ({ page }) => {
  test.skip(p.scenario === undefined, "this demo has no scenario yet");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const entry = onThisPage(page).locator(`a[href$="#${p.scenario}"]`);
  await expect(entry).toBeVisible();
  await entry.click();
  await expect(page.locator(`[data-scenario="${p.scenario}"]`)).toBeInViewport();
});

test("section headings are set larger than the examples' titles", async ({ page }) => {
  await page.goto(`/${p.contents.pageId}/`);
  const size = (selector: string) =>
    page.locator(selector).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(await size(".sectionTitle")).toBeGreaterThan(await size("h3.exampleTitle"));
});

test("a scenario's Code toggle is an example's, apart from its ids", async ({ page }) => {
  const markup = (where: string) =>
    page
      .locator(where)
      .first()
      .getByRole("button", { name: "Code", exact: true })
      .evaluate((el) => el.outerHTML.replace(/ aria-controls="[^"]*"/, ""));
  const scenario = await markup(".scenario");
  await page.goto(`/${p.example.pageId}/#${p.example.id}`);
  expect(scenario).toBe(await markup(`[data-example="${p.example.id}"]`));
});

/* Every mark's box against every box of visible text in its stage and every
   other mark, every table
   cell that sticks, and how far the page reaches sideways. Text a screen keeps
   for the screen reader only - one pixel, clipped - is no text a mark covers. */
const scenarioFaults = (page: Page) =>
  page.evaluate(() => {
    const faults: string[] = [];
    for (const stage of document.querySelectorAll<HTMLElement>(".scenarioStage")) {
      const id = stage.closest<HTMLElement>("[data-scenario]")!.dataset.scenario;
      const marks = [...stage.querySelectorAll<HTMLElement>(".calloutMark")].map((m) => [m.textContent, m.getBoundingClientRect()] as const);
      const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
        const parent = node.parentElement!;
        const own = parent.getBoundingClientRect();
        if (parent.closest(".calloutMark") || !node.textContent!.trim() || own.width <= 1 || own.height <= 1 || !parent.checkVisibility()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          for (const [n, m] of marks) {
            if (m.left < r.right && r.left < m.right && m.top < r.bottom && r.top < m.bottom) faults.push(`${id}: mark ${n} on "${node.textContent!.trim().slice(0, 30)}"`);
          }
        }
      }
      for (const [n, m] of marks) {
        for (const [k, other] of marks) {
          if (Number(n) < Number(k) && m.left < other.right && other.left < m.right && m.top < other.bottom && other.top < m.bottom) faults.push(`${id}: marks ${n} and ${k} on each other`);
        }
      }
      if (stage.querySelector('td[style*="--u-table-pin"], th[style*="--u-table-pin"]')) faults.push(`${id}: a pinned block`);
    }
    const root = document.documentElement;
    if (root.scrollWidth > root.clientWidth) faults.push(`the page scrolls sideways by ${root.scrollWidth - root.clientWidth} px`);
    return faults;
  });

test.describe("the scenarios on a phone, 390 px wide", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("no mark lies on a text of its screen or on another mark, no table pins a block, and the page does not scroll sideways", async ({ page }) => {
    await expect.poll(() => scenarioFaults(page)).toEqual([]);
  });
});

test("from a stage of 640 px the marks stand at their corners and a table keeps its pins", async ({ page }) => {
  for (const stage of await page.locator(".scenarioStage").all()) {
    expect((await stage.boundingBox())!.width).toBeGreaterThanOrEqual(640);
    await expect(stage).not.toHaveAttribute("data-narrow");
  }
  if (p.pinnedScenario === undefined) return;
  await expect(page.locator(`[data-scenario="${p.pinnedScenario}"] td[style*="--u-table-pin"]`).first()).toBeAttached();
});

/* Previous and next (page-orientation 02): at the foot of every page, in the
   sidebar's order across rubrics. The chain is read off the sidebar, so it
   needs no probe - its order IS the order to follow. */
const turn = (page: Page) => page.getByRole("navigation", { name: "Previous and next page" });
const blockOf = (href: string) => `[data-block="${href.replace(/^\/|\/$/g, "") || "scenarios"}"]`;

test("next on a rubric's last page opens the next rubric's first page, and names both", async ({ page }) => {
  const rubrics = page.getByRole("navigation", { name: "Components" }).locator(".railRubric");
  const last = (await rubrics.nth(0).getByRole("link").last().getAttribute("href"))!;
  const first = rubrics.nth(1).getByRole("link").first();
  const href = (await first.getAttribute("href"))!;
  const name = (await first.textContent())!;
  const rubric = (await rubrics.nth(1).locator(".railHead > span").first().textContent())!;

  await page.goto(last);
  const next = turn(page).getByRole("link", { name: /^Next/ });
  await expect(next).toContainText(rubric);
  await expect(next).toContainText(name);
  await expect(next).toHaveAttribute("href", href);

  await page.evaluate(() => ((window as unknown as { __noReload?: boolean }).__noReload = true));
  await next.click();
  await expect(page.locator(blockOf(href))).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(href);
  expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);
});

test("the chain begins at the scenarios page and ends at the last page", async ({ page }) => {
  const entries = page.getByRole("navigation", { name: "Components" }).locator(".railRubric").getByRole("link");
  const first = (await entries.first().getAttribute("href"))!;
  const last = (await entries.last().getAttribute("href"))!;

  // The scenarios page has a next link only, to the first page.
  await expect(turn(page).getByRole("link")).toHaveCount(1);
  await turn(page).getByRole("link", { name: /^Next/ }).click();
  await expect(page.locator(blockOf(first))).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(first);

  // The first page's previous link leads back to it.
  const previous = turn(page).getByRole("link", { name: /^Previous/ });
  await expect(previous).toContainText("Scenarios");
  await previous.click();
  await expect(page.locator(blockOf("/"))).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/");

  // The last page has no next link.
  await page.goto(last);
  await expect(turn(page).getByRole("link", { name: /^Previous/ })).toHaveCount(1);
  await expect(turn(page).getByRole("link", { name: /^Next/ })).toHaveCount(0);
});

/* A fold never hides a target (.scratch/props-table-hygiene, 02): the shell
   opens the folded group before it scrolls, on a full load and on a jump
   without one alike. */
test("the address of a row in a folded group opens the group and shows the row", async ({ page }) => {
  test.skip(p.foldedRow === undefined, "this demo has no table long enough to fold");
  const { pageId, id } = p.foldedRow!;
  await page.goto(`/${pageId}/#${id}`);
  const row = page.locator(`[id="${id}"]`);
  await expect(row).toBeInViewport();
  await expect(page.locator("details", { has: row })).toHaveAttribute("open", "");
});

test("a jump to a row in a folded group, without a reload, opens the group", async ({ page }) => {
  test.skip(p.foldedRow === undefined, "this demo has no table long enough to fold");
  const { pageId, id } = p.foldedRow!;
  /* A link in a page's text or a search find would carry the address; the
     shell takes the click and moves without a reload. */
  await page.evaluate(
    ([pageId, id]) => {
      (window as unknown as { stayed: boolean }).stayed = true;
      const link = document.createElement("a");
      link.href = `${pageId}/#${id}`;
      link.textContent = "to the row";
      document.querySelector("main")!.prepend(link);
    },
    [pageId, id] as const,
  );
  await page.getByRole("link", { name: "to the row" }).click();
  const row = page.locator(`[id="${id}"]`);
  await expect(row).toBeInViewport();
  await expect(page.locator("details", { has: row })).toHaveAttribute("open", "");
  expect(await page.evaluate(() => (window as unknown as { stayed?: boolean }).stayed)).toBe(true);
});

test("a fold is a disclosure the keyboard opens, and the API section stays accessible", async ({ page }) => {
  test.skip(p.foldedRow === undefined, "this demo has no table long enough to fold");
  const { pageId, id } = p.foldedRow!;
  await page.goto(`/${pageId}/`);
  const fold = page.locator("details", { has: page.locator(`[id="${id}"]`) });
  await expect(fold).not.toHaveAttribute("open");
  /* With the page suite's tolerated colour pairs - the column heads are the
     muted token (`accessibility.ts`). */
  const violations = async () =>
    findings(await new AxeBuilder({ page }).include(".apiTables").withTags(STANDARDS).analyze()).map((f) => `${f.rule}: ${f.where}`);
  expect(await violations()).toEqual([]);
  await fold.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(fold).toHaveAttribute("open", "");
  await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  expect(await violations()).toEqual([]);
});

test("the palette filters and jumps", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  const field = page.getByRole("combobox", { name: "Search umriss-ui" });
  await expect(field).toBeFocused();

  /* CHANGED (see the head, point 1): every entry used to stand here. The
     empty query is now not one that matches everything but one that matches
     nothing. */
  await expect(page.getByRole("dialog").getByRole("option")).toHaveCount(0);

  await field.fill(p.palettePage.query);
  const finds = page.getByRole("dialog").getByRole("option");
  await expect(finds.first()).toContainText(p.palettePage.name);
  // The find names its rubric - otherwise one does not know, after the jump,
  // where one has landed.
  await expect(finds.first()).toContainText(p.palettePage.rubricName);

  await field.press("Enter");
  await expect(page.locator(`[data-block="${p.palettePage.pageId}"]`)).toBeVisible();
});

test("the palette finds an example too, under its component", async ({ page }) => {
  /* The reason it carries both: "look at this" becomes a link, and that is
     half the purpose of an address space. */
  await page.keyboard.press("ControlOrMeta+k");
  const field = page.getByRole("combobox", { name: "Search umriss-ui" });
  await field.fill(p.example.title);
  const finds = page.getByRole("dialog").getByRole("option");
  await expect(finds.first()).toContainText(p.example.title);
  await expect(finds.first()).toContainText(p.example.pageName);
  await field.press("Enter");
  await expect(page.locator(`[data-example="${p.example.id}"]`)).toBeInViewport();
});

test("a component's name finds its page first, above its examples", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  const field = page.getByRole("combobox", { name: "Search umriss-ui" });
  await field.fill(p.example.pageName);
  await expect(page.getByRole("dialog").getByRole("option", { name: p.example.title })).toBeVisible();
  await field.press("Enter");
  await expect(page.locator(`[data-block="${p.example.pageId}"]`)).toBeVisible();
  // The page itself, not an example on it: no anchor.
  await expect(page).toHaveURL(new RegExp(`/${p.example.pageId}/$`));
});

for (const synonym of p.synonyms ?? []) {
  test(`another library's "${synonym.query}" finds ${synonym.name}`, async ({ page }) => {
    /* The word stands only in the page's lede, which arrives with the
       package's search fragment on the first opening. */
    await page.keyboard.press("ControlOrMeta+k");
    const field = page.getByRole("combobox", { name: "Search umriss-ui" });
    await field.fill(synonym.query);
    const find = page.getByRole("dialog").getByRole("option").filter({ has: page.getByText(synonym.name, { exact: true }) });
    await expect(find.first()).toBeVisible();
    // A keyword find marks nothing: the word is not in the name.
    await expect(find.first().locator("span span")).toHaveCount(0);
    await find.first().click();
    await expect(page.locator(`[data-block="${synonym.pageId}"]`)).toBeVisible();
  });
}

test("the palette finds abbreviations and is operable with the arrows", async ({ page }) => {
  await page.keyboard.press("/");
  const field = page.getByRole("combobox", { name: "Search umriss-ui" });

  /* CHANGED (see the head, point 2): the query used to be "tabelle" and hit
     as a substring. `dtp` is the case the module was built for - as a
     substring it found nothing. */
  await field.fill(p.abbreviation.query);
  const finds = page.getByRole("dialog").getByRole("option");
  await expect(finds.first()).toContainText(p.abbreviation.find);

  /* And the characters that explain the find stand there marked - the right
     ones at that: not the first `t` in "Date" but the `T` of "Time". The
     matcher computes exhaustively and not greedily, for exactly this reason. */
  await expect(finds.first().locator("span span")).toHaveText([...p.abbreviation.glyphs]);

  await expect(finds.first()).toHaveAttribute("aria-selected", "true");
  await field.press("ArrowDown");
  await expect(finds.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(finds.first()).toHaveAttribute("aria-selected", "false");
});

test("before the first character the palette is only the field, and then grows", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  const pane = page.locator("dialog[open] > div").first();
  const field = page.getByRole("combobox", { name: "Search umriss-ui" });

  const restingHeight = (await pane.boundingBox())!.height;
  // The field is 56 high; nothing more stands there at rest.
  expect(restingHeight).toBeLessThan(70);

  await field.fill(p.pointer.wide);
  await expect(page.getByRole("dialog").getByRole("option").first()).toBeVisible();
  await expect
    .poll(async () => (await pane.boundingBox())!.height)
    .toBeGreaterThan(restingHeight + 100);

  // And back again: the window follows what is typed.
  await field.fill("");
  await expect.poll(async () => (await pane.boundingBox())!.height).toBeLessThan(70);
});

test("the resting pointer does not take the tick away from the keyboard", async ({ page }) => {
  /* The defect to prevent here: you type, the list gets shorter, a different
     row slides under the motionless mouse, and Enter lands somewhere other
     than shown. jsdom cannot express it, because it hangs on the difference
     between `pointermove` and `pointerenter` under a repaint - which is why
     it stands here. */
  await page.keyboard.press("ControlOrMeta+k");
  const field = page.getByRole("combobox", { name: "Search umriss-ui" });
  const finds = page.getByRole("dialog").getByRole("option");

  await field.fill(p.pointer.wide);
  const earlier = await finds.count();
  expect(earlier).toBeGreaterThan(5);

  /* The pointer moves onto the fourth row - a real movement, it counts.
     `hover()` and not `mouse.move()` to a place measured by hand: the list
     grows animated, and a box measured while it does points somewhere else by
     the time the movement runs. `hover()` waits until the row has stood still
     for two frames. Walked into once under full load. */
  await finds.nth(3).hover();
  await expect(finds.nth(3)).toHaveAttribute("aria-selected", "true");

  /* Now it is typed without touching the mouse. Eleven rows become four, a
     different one lies under the pointer afterwards - and the tick stays
     where the keyboard puts it. */
  await field.fill(p.pointer.narrow);
  await expect.poll(async () => finds.count()).toBeLessThan(earlier);
  await expect(finds.first()).toHaveAttribute("aria-selected", "true");
});

test("the field carries no focus ring", async ({ page }) => {
  /* The pane IS the focus indicator. The base layer set the ring in
     global.css as a `box-shadow`, not as an `outline` (it is gone since
     ADR-0021, the lesson is not) - so an `outline: none`
     alone left it standing, and because the field fills the pane's width,
     `overflow: hidden` cut it away left, right and top. What remained was a
     four-pixel bar in the accent colour under the field, looking like a very
     thick coloured rule.

     No screenshot would have found it: the baseline was taken with the defect
     in it. That is why the computed style is asked here rather than the image
     compared. */
  await page.keyboard.press("ControlOrMeta+k");
  const field = page.getByRole("combobox", { name: "Search umriss-ui" });
  await expect(field).toBeFocused();
  const style = await field.evaluate((el) => {
    const s = getComputedStyle(el);
    return { shadow: s.boxShadow, outline: s.outlineStyle };
  });
  expect(style.shadow).toBe("none");
  expect(style.outline).toBe("none");
});

test("the pane rests on the translucent material", async ({ page }) => {
  /* The substitute evidence ADR-0012 provides for: the contrast test cannot
     judge a translucent surface, and the example photographs the trigger and
     not the topmost layer. What is checked here is therefore that the window
     really carries the material - alpha and blur. */
  await page.keyboard.press("ControlOrMeta+k");
  const pane = page.locator("dialog[open] > div").first();
  const style = await pane.evaluate((el) => {
    const s = getComputedStyle(el);
    return { surface: s.backgroundColor, blur: s.backdropFilter, radius: s.borderTopLeftRadius };
  });
  expect(style.surface).toMatch(/^rgba\(.*0\.8[0-9]?\)$/);
  expect(style.blur).toContain("blur(24px)");
  // The step above the card (12px) - a window, not a form panel.
  expect(style.radius).toBe("18px");
});

test("Escape closes the palette and gives focus back", async ({ page }) => {
  /* The shell's own search button, named exactly: core and table both have a page
     called "Search", so a loose /Search/ matches the rail entry as well. */
  const trigger = page.getByRole("button", { name: "Search … ⌘K" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Focus goes back where it came from - otherwise it stands at the top of
  // the page after closing.
  await expect(trigger).toBeFocused();
});

/* THE HEADER. The same bar on every page of every demo: the way to the front
   page, to the other packages and out of the site. The test build stands
   alone at `/`, so the site's root is `/` here and a package's directory is
   `/<package>/` below it - the same formula that gives `/umriss-ui/` and
   `/umriss-ui/<package>/` on the site. */

test("the header leads to the front page and to every package", async ({ page }) => {
  const head = page.getByRole("banner");
  await expect(head.getByRole("link", { name: "umriss-ui", exact: true })).toHaveAttribute("href", "/");

  const packages = head.getByRole("navigation", { name: "Packages" }).getByRole("link");
  await expect(packages).toHaveCount(PACKAGES.length);
  for (const [i, pkg] of PACKAGES.entries()) {
    const link = packages.nth(i);
    if (pkg.id === p.packageId) {
      await expect(link).toHaveAttribute("aria-current", "page");
      // Its version beside its name.
      await expect(link).toHaveText(new RegExp(`^${pkg.name}\\s*\\d+\\.\\d+\\.\\d+`));
    } else {
      await expect(link).toHaveText(pkg.name);
      await expect(link).not.toHaveAttribute("aria-current");
      await expect(link).toHaveAttribute("href", `/${pkg.id}/`);
    }
  }

  const npm = PACKAGES.find((pkg) => pkg.id === p.packageId)!.npm;
  await expect(head.getByRole("link", { name: "Source on GitHub" })).toHaveAttribute("href", /^https:\/\/github\.com\//);
  await expect(head.getByRole("link", { name: `${npm} on npm` })).toHaveAttribute("href", `https://www.npmjs.com/package/${npm}`);
  await expect(head.getByRole("link", { name: "llms.txt for coding agents" })).toHaveAttribute("href", "/llms.txt");
});

test("the header stands on every page, not only the front door", async ({ page }) => {
  await page.goto(`/${p.deepLink.pageId}/`);
  const head = page.getByRole("banner");
  await expect(head.getByRole("link", { name: "umriss-ui", exact: true })).toBeVisible();
  await expect(head.getByRole("navigation", { name: "Packages" }).getByRole("link")).toHaveCount(PACKAGES.length);
});

test("on a phone the header takes two lines, loses no destination, and the page does not scroll sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const head = page.getByRole("banner");
  const packages = head.getByRole("navigation", { name: "Packages" });
  // The second line: below the wordmark.
  const mark = (await head.getByRole("link", { name: "umriss-ui", exact: true }).boundingBox())!;
  expect((await packages.boundingBox())!.y).toBeGreaterThanOrEqual(mark.y + mark.height);
  for (const link of await packages.getByRole("link").all()) {
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeInViewport({ ratio: 1 });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  // GitHub, npm and llms.txt stand at the foot of the sidebar instead.
  await expect(head.getByRole("link", { name: "Source on GitHub" })).toBeHidden();
  const rail = page.getByRole("navigation", { name: "Components" });
  for (const name of ["Source on GitHub", "on npm", "llms.txt for coding agents"]) {
    await expect(rail.getByRole("link", { name })).toBeVisible();
  }
});

/* THE THEME. One choice for the site, stored under one key, standing before
   the first paint (`ThemeSwitch.tsx` and the script in each `index.html`).
   What is asserted is what a reader gets: the root's `color-scheme`, the key in
   storage, the switch's name - never the shell's state. */

const THEME_KEY = "umriss-ui:theme";
const scheme = (page: Page) => page.evaluate(() => document.documentElement.style.colorScheme);

/** Records the root's `color-scheme` the moment parsing ends - after the
    head's script, before the app's module runs - as `window.__firstScheme`. */
async function recordFirstScheme(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener("readystatechange", () => {
      const w = window as unknown as { __firstScheme?: string };
      if (document.readyState === "interactive" && w.__firstScheme === undefined) {
        w.__firstScheme = getComputedStyle(document.documentElement).colorScheme;
      }
    });
  });
}

test("the theme switch stores its choice, and a reload is dark before the app runs", async ({ page }) => {
  await recordFirstScheme(page);
  expect(await scheme(page)).toBe("light");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect(await scheme(page)).toBe("dark");
  expect(await page.evaluate((key) => localStorage.getItem(key), THEME_KEY)).toBe("dark");

  await page.reload();
  expect(await page.evaluate(() => (window as unknown as { __firstScheme?: string }).__firstScheme)).toBe("dark");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  expect(await scheme(page)).toBe("dark");
});

test("with nothing stored the system decides, live", async ({ page }) => {
  await recordFirstScheme(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => scheme(page)).toBe("dark");
  await page.reload();
  expect(await page.evaluate(() => (window as unknown as { __firstScheme?: string }).__firstScheme)).toBe("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => scheme(page)).toBe("light");
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
});

test("with storage throwing, the switch still switches", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
  });
  await page.reload();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect(await scheme(page)).toBe("dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  expect(await scheme(page)).toBe("light");
  expect(errors).toEqual([]);
});

test("the shell is accessible - header, sidebar, scenarios page", async ({ page }) => {
  /* The screens themselves are the demo's, checked with its pages
     (accessibility.spec.ts, "scenarios"); here the frame around them. */
  const result = await new AxeBuilder({ page }).exclude(".scenarioStage").withTags(STANDARDS).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
});

test("on this page is accessible, as a column and as an open disclosure", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const axe = () => new AxeBuilder({ page }).exclude(".scenarioStage").withTags(STANDARDS).analyze();
  let result = await axe();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.locator("summary", { hasText: "On this page" }).click();
  await expect(onThisPage(page)).toBeVisible();
  result = await axe();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
});

test("the opened palette is accessible", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(STANDARDS).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
});
}
