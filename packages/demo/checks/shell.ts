/* The demo shell: outline, jump palette, addresses.

   The other test files go straight to a page through `open()` and see of the
   shell only what it passes through. This one is the only place where sidebar,
   header, overview and palette themselves run in a browser.

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

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STANDARDS } from "./accessibility";

interface NamedPage {
  /** The name in sidebar, chip and palette. */
  name: string;
  /** The address of the page. */
  pageId: string;
}

export interface ShellProbes {
  /** Two pages, neither of which the front door may show. */
  notOnTheFrontDoor: readonly [string, string];
  /** A chip on the overview - and two pages it does not bring along. */
  chip: NamedPage & { absent: readonly [string, string] };
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
}

export function checkShell(p: ShellProbes): void {
test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("the front door shows the rubrics and no page yet", async ({ page }) => {
  // That is exactly the purpose: the overview first, then the depth.
  await expect(page.locator('[data-block="overview"]')).toBeVisible();
  await expect(page.locator(`[data-block="${p.notOnTheFrontDoor[0]}"]`)).toHaveCount(0);
  await expect(page.locator(`[data-block="${p.notOnTheFrontDoor[1]}"]`)).toHaveCount(0);
});

test("a chip on the overview opens its page - and only it", async ({ page }) => {
  await page.getByRole("button", { name: p.chip.name, exact: true }).first().click();
  await expect(page.locator(`[data-block="${p.chip.pageId}"]`)).toBeVisible();
  // What does not belong to the page is not in the document either - that is
  // the difference between "hidden" and "not there", and only the second
  // really shortens the scrolling.
  await expect(page.locator(`[data-block="${p.chip.absent[0]}"]`)).toHaveCount(0);
  await expect(page.locator(`[data-block="${p.chip.absent[1]}"]`)).toHaveCount(0);
});

test("an entry in the sidebar opens its page", async ({ page }) => {
  await page.getByRole("navigation", { name: "Components" }).getByText(p.rail.name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.rail.pageId}"]`)).toBeVisible();
  // The rubric is NOT in the address (CONTEXT.md, "Rubric").
  expect(page.url()).toContain(`#/${p.rail.pageId}`);
  expect(page.url()).not.toContain(p.rail.rubricId);
});

test("two pages of the same rubric in turn", async ({ page }) => {
  const rail = page.getByRole("navigation", { name: "Components" });
  await rail.getByText(p.neighbours[0].name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.neighbours[0].pageId}"]`)).toBeVisible();

  await rail.getByText(p.neighbours[1].name, { exact: true }).click();
  await expect(page.locator(`[data-block="${p.neighbours[1].pageId}"]`)).toBeVisible();
  expect(page.url()).toContain(`#/${p.neighbours[1].pageId}`);

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

test("the address is the place: a deep link lands on the page", async ({ page }) => {
  await page.goto(`/#/${p.deepLink.pageId}`);
  await expect(page.locator(`[data-block="${p.deepLink.pageId}"]`)).toBeVisible();
  await expect(page.locator(`[data-block="${p.deepLink.absent}"]`)).toHaveCount(0);
});

test("the address of an example brings it into view", async ({ page }) => {
  await page.goto(`/#/${p.example.pageId}/${p.example.id}`);
  const target = page.locator(`[data-example="${p.example.id}"]`);
  await expect(target).toBeInViewport();
});

test("an unknown address lands on the overview, not on nothing", async ({ page }) => {
  await page.goto("/#/gibtesnicht");
  await expect(page.locator('[data-block="overview"]')).toBeVisible();
});

test("the palette filters and jumps", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  const field = page.getByRole("combobox", { name: "Search a page or example" });
  await expect(field).toBeFocused();

  /* CHANGED (see the head, point 1): every entry used to stand here. The
     empty query is now not one that matches everything but one that matches
     nothing. */
  await expect(page.getByRole("option")).toHaveCount(0);

  await field.fill(p.palettePage.query);
  const finds = page.getByRole("option");
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
  const field = page.getByRole("combobox", { name: "Search a page or example" });
  await field.fill(p.example.title);
  const finds = page.getByRole("option");
  await expect(finds.first()).toContainText(p.example.title);
  await expect(finds.first()).toContainText(p.example.pageName);
  await field.press("Enter");
  await expect(page.locator(`[data-example="${p.example.id}"]`)).toBeInViewport();
});

test("the palette finds abbreviations and is operable with the arrows", async ({ page }) => {
  await page.keyboard.press("/");
  const field = page.getByRole("combobox", { name: "Search a page or example" });

  /* CHANGED (see the head, point 2): the query used to be "tabelle" and hit
     as a substring. `dtp` is the case the module was built for - as a
     substring it found nothing. */
  await field.fill(p.abbreviation.query);
  const finds = page.getByRole("option");
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
  const field = page.getByRole("combobox", { name: "Search a page or example" });

  const restingHeight = (await pane.boundingBox())!.height;
  // The field is 56 high; nothing more stands there at rest.
  expect(restingHeight).toBeLessThan(70);

  await field.fill(p.pointer.wide);
  await expect(page.getByRole("option").first()).toBeVisible();
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
  const field = page.getByRole("combobox", { name: "Search a page or example" });
  const finds = page.getByRole("option");

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
  const field = page.getByRole("combobox", { name: "Search a page or example" });
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
     called "Search", so a loose /Search/ matches the rail entry and the
     overview chip as well. */
  const trigger = page.getByRole("button", { name: "Search … ⌘K" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Focus goes back where it came from - otherwise it stands at the top of
  // the page after closing.
  await expect(trigger).toBeFocused();
});


test("the shell is accessible - header, sidebar, overview", async ({ page }) => {
  const result = await new AxeBuilder({ page }).withTags(STANDARDS).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
});

test("the opened palette is accessible", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(STANDARDS).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
});
}
