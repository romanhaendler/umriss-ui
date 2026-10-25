/* The 24 px floor under a finger (WCAG 2.5.8, ADR-0070): nothing the library
   draws is a target smaller than 24 x 24 px. Every demo page is opened under
   touch emulation (`hasTouch`, 375 px, Chromium, light) and every target on its
   example stages is measured. One suite for all demos; each package's
   `target-floor.spec.ts` calls `checkTargetFloor`. A surface a test opens
   (a menu, a list, the date panel, the palette, a toast) is measured by the same
   function, `belowTheFloor`.

   A target is a button, a link outside running text, a field, a tab, an option,
   a menu item, a checkbox, a radio, a switch, a slider, a separator that takes
   the focus - anything that takes a pointer. It passes when a 24 px square
   centred on it hits it at nine points (corners, edge midpoints, centre),
   by `elementFromPoint`: a hit on something inside it, or on its pseudo-element,
   is a hit. So a glyph passes by an invisible pad, a box by its size - and a pad
   that reaches into a neighbour fails the neighbour.
   Not measured: a link inside running text (exempt in WCAG), a disabled
   control, a target that is hidden, clipped or covered at its centre, and the
   library's visually hidden text. A native input that the library hides behind
   its own drawing is measured as what is drawn: its label, else the box after it. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import type { ExampleAddress } from "./pages.ts";

const FLOOR = 24;

export interface TargetFloorSuite {
  /** The demo's package name, as `OPEN` names it. */
  demo: string;
  open: (page: Page, pageId: string) => Promise<void>;
  examples: readonly ExampleAddress[];
}

/** One finding, as the browser reports it. */
interface Raw {
  example: string;
  /** The target, by component and role: `tag-remove`, `stepper (button)`. */
  element: string;
  label: string;
  width: number;
  height: number;
  /** How many of the nine points do not hit the target. */
  missed: number;
  /** What the first missed point hits instead. */
  instead: string;
}

/** A finding that is real and still open: named and handed on. Matched on
    demo, page, example and element - never on a whole rule. Empty is the
    intended state; every entry names what fixes it. */
export interface Open {
  demo: string;
  page: string;
  examples: readonly string[];
  element: string;
  /** Narrows the match where several targets share an element name. */
  label?: RegExp;
  /** The finding stands in an opened panel, not on the stage. */
  panel?: true;
  reason: string;
  fix: string;
}

/* One function, because `page.evaluate` serialises it and nothing outside it.
   Called with the roots to measure; the example is found from each target. */
export function probe(roots: Element[], floor: number): Raw[] {
  const TARGETS = [
    "button",
    "a[href]",
    "input:not([type=hidden])",
    "select",
    "textarea",
    "summary",
    "[role=treeitem]",
    "[data-target]",
    "[role=button]",
    "[role=tab]",
    "[role=option]",
    "[role=menuitem]",
    "[role=menuitemcheckbox]",
    "[role=menuitemradio]",
    "[role=checkbox]",
    "[role=radio]",
    "[role=switch]",
    "[role=slider]",
    "[role=separator][tabindex]",
    "[role=link]",
  ].join(",");
  const name = (el: Element): string => {
    const own = [...el.classList]
      .filter((c) => /^_[A-Za-z0-9]+_[a-z0-9]{5}_\d+$/.test(c))
      .map((c) => c.split("_")[1]);
    return own.length ? own.join("+") : el.tagName.toLowerCase();
  };
  const describe = (el: Element) => {
    const role = el.getAttribute("role");
    return role && !/^(button|tab|option)$/.test(role) ? `${name(el)} (${role})` : name(el);
  };
  const inactive = (el: Element) => {
    for (let e: Element | null = el; e; e = e.parentElement)
      if (e.getAttribute("aria-hidden") === "true" || e.hasAttribute("inert")) return true;
    return false;
  };
  const inRunningText = (a: Element) => {
    if (getComputedStyle(a).display !== "inline") return false;
    const parent = a.parentElement;
    if (!parent) return false;
    const own = (a.textContent ?? "").trim();
    return (parent.textContent ?? "").trim().length > own.length;
  };
  const resolve = (el: Element): Element | null => {
    if (el instanceof HTMLInputElement && /^(checkbox|radio)$/.test(el.type)) {
      return el.closest("label") ?? el.labels?.[0] ?? el.nextElementSibling;
    }
    return el;
  };
  const found: Raw[] = [];
  const seen = new Set<Element>();
  const candidates = roots.flatMap((root) => [
    ...(root.matches(TARGETS) ? [root] : []),
    ...root.querySelectorAll(TARGETS),
  ]);
  for (const raw of candidates) {
    if ((raw as HTMLButtonElement).disabled || raw.getAttribute("aria-disabled") === "true") continue;
    if (inactive(raw) && !raw.hasAttribute("data-target")) continue;
    const target = resolve(raw);
    if (!target || seen.has(target)) continue;
    seen.add(target);
    const style = getComputedStyle(target);
    if (style.visibility === "hidden" || style.display === "none") continue;
    if (inRunningText(raw)) continue;
    target.scrollIntoView({ block: "center", inline: "center" });
    const r = target.getBoundingClientRect();
    if (r.width <= 1 && r.height <= 1) continue;
    // Big enough: the square lies inside it (a rounded corner is no miss).
    if (r.width >= floor && r.height >= floor) continue;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const at = (x: number, y: number) =>
      x < 0 || y < 0 || x >= innerWidth || y >= innerHeight ? undefined : document.elementFromPoint(x, y);
    // Covered or clipped at its centre: a finger does not reach it.
    const middle = at(cx, cy);
    if (middle && !target.contains(middle) && !(middle instanceof Element && raw.contains(middle))) continue;
    const half = floor / 2 - 0.5;
    let missed = 0;
    let instead = "";
    for (const dx of [-half, 0, half])
      for (const dy of [-half, 0, half]) {
        const hit = at(cx + dx, cy + dy);
        if (hit === undefined) continue;
        if (!hit || !(target.contains(hit) || raw.contains(hit))) {
          missed += 1;
          instead ||= hit ? describe(hit) : "nothing";
        }
      }
    if (missed === 0) continue;
    found.push({
      example:
        target.closest("[data-example]")?.getAttribute("data-example") ?? "",
      element: describe(raw),
      label: (raw.getAttribute("aria-label") ?? raw.textContent ?? "").trim().slice(0, 30),
      width: Math.round(r.width * 10) / 10,
      height: Math.round(r.height * 10) / 10,
      missed,
      instead,
    });
  }
  return found;
}

const line = (f: Raw) =>
  `${f.example ? `${f.example}: ` : ""}"${f.label}" (${f.element}) ${f.width} x ${f.height} px, ${f.missed} of 9 points miss it, hitting ${f.instead}`;


/** The findings in `raw` that the open list does not name, and the open
    entries that nothing matched any more - each as one readable line. */
function judge(demo: string, pageId: string, raw: Raw[], inPanel: boolean) {
  const listed = OPEN.filter((o) => o.demo === demo && o.page === pageId && (o.panel ?? false) === inPanel);
  const matches = (o: Open, f: Raw) =>
    o.element === f.element && o.examples.includes(f.example) && (o.label?.test(f.label) ?? true);
  return {
    found: raw.filter((f) => !listed.some((o) => matches(o, f))).map(line),
    stale: listed
      .filter((o) => !raw.some((f) => matches(o, f)))
      .map((o) => `stale open finding: ${o.page} / ${o.element} (${o.fix})`),
  };
}

/** For a test that has opened a surface under touch emulation (a menu, a
    list, the date panel, the palette, a toast): no target inside `within` is
    smaller than the floor, bar what the open list names. A surface lies
    outside its example's stage, so `example` names the one that opened it. */
export async function expectOnTheFloor(
  page: Page,
  within: Locator,
  demo: string,
  pageId: string,
  example: string,
): Promise<void> {
  expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches), "touch emulation").toBe(true);
  const raw = (await within.evaluateAll(probe, FLOOR)).map((f) => ({ ...f, example: f.example || example }));
  const { found, stale } = judge(demo, pageId, raw, true);
  expect(found, `${pageId} / ${example} under a finger`).toEqual([]);
  expect(stale, `${pageId} / ${example}`).toEqual([]);
}

export function checkTargetFloor({ demo, open, examples }: TargetFloorSuite): void {
  test.skip(
    ({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium",
    "the floor does not change with the theme: once (light, Chromium)",
  );
  test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
  const pages = [...new Set(examples.map((e) => e.pageId))];

  for (const pageId of pages) {
    test(`Page ${pageId} has no target under 24 px under a finger`, async ({ page }) => {
      await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
      await open(page, pageId);
      await page.evaluate(() => document.fonts.ready);
      // A control that fades in (the input's clear key) is measured at rest; a
      // spinner never rests, so the wait is capped.
      await page.waitForTimeout(300);
      const raw = await page.locator(".exampleStage").evaluateAll(probe, FLOOR);
      expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches), "touch emulation").toBe(true);
      const { found, stale } = judge(demo, pageId, raw, false);
      expect(found, `${pageId} under a finger`).toEqual([]);
      expect(stale, `${pageId}`).toEqual([]);
    });
  }
}

/**
 * Findings that are real and still open. Empty is the intended state; a new
 * entry names its follow-up.
 */
export const OPEN: readonly Open[] = [
  {
    demo: "schedule",
    page: "lane-groups",
    examples: ["nesting"],
    element: "chevron",
    label: /^Fold group: North depot$/,
    reason: "two open group heads stand directly above each other, 24 px apart: the chevron's 24 px square overlaps the next chevron's by under a pixel",
    fix: "schedule: an open group's head is 25 px under a finger (`GROUP_HEAD_HEIGHT`, which the plot's rows share)",
  },
  {
    demo: "table",
    page: "first-table",
    examples: [
      "search-and-page-from-a-header-of-your-own",
      "sort-arrange-and-export-from-controls-of-your-own",
    ],
    element: "button+ring+text+secondary+sm",
    label: /^(Next|Previous) page$/,
    reason: "a core Button sm whose label is one glyph is 16 px wide",
    fix: "core: a Button's minimum width under a finger, 24 px",
  },
  {
    demo: "table",
    page: "first-table",
    examples: ["sort-arrange-and-export-from-controls-of-your-own"],
    element: "button+ring+text+ghost+sm",
    label: /^Move /,
    reason: "a core Button sm whose label is one glyph is 21 px wide",
    fix: "core: a Button's minimum width under a finger, 24 px",
  },
  {
    demo: "core",
    panel: true,
    page: "datetimepicker",
    examples: ["set-an-instant"],
    element: "button",
    label: /^(Increase|Decrease) /,
    reason: "the time fields' arrows are 18 x 12.5 px; a pad would lie on the neighbouring field's arrow",
    fix: "the native-picker spec, .scratch/date-jump-and-typed-entry/, which replaces the arrows",
  },
];
