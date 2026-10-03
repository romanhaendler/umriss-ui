/* No page may be silent about what its examples ask of a reader
   (.scratch/a11y-and-finish).

   It looks only inside the example stages - what the library renders, not the
   shell around it - and asks two things of every page:

   1. **Keys.** If anything in a stage is in the tab order, the page carries a
      Keyboard section: a table of its own, or `keysOf` naming the pages whose
      keys apply, or both. "In the tab order" is what Tab reaches, not what a
      selector guesses: a scroller Chromium makes focusable counts, a disabled
      button does not.
   2. **Announcements.** If anything in a stage is a live region - `aria-live`
      other than `off`, or a role of status, alert, log, timer, progressbar or
      meter - the page carries an Accessibility section.

   The sections are read off the page as a reader meets them, by their anchors
   (`keyboard-<page>`, `accessibility-<page>`). The exceptions stand below,
   each with its reason; there is no other way out. Like the own-base check it
   stands once and runs against every demo: their `silent-pages.spec.ts` calls
   `checkSilentPages` with their pages. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { focusBeforeStage } from "./navigation";

export interface SilentPagesProbes {
  /** How the demo opens a page (its `navigation.ts`). */
  open: (page: Page, pageId: string) => Promise<void>;
  /** The pages to check - every page that carries examples. */
  pages: readonly string[];
}

/** What makes a live region, as one selector. */
const LIVE = ["status", "alert", "log", "timer", "progressbar", "meter"]
  .map((role) => `[role="${role}"]`)
  .concat('[aria-live]:not([aria-live="off"])')
  .join(", ");

/** Live regions that need no Accessibility section on the page they stand on,
    as a selector, with the reason. */
const UNANNOUNCED: Readonly<Record<string, string>> = {
  ".uc-sr[aria-live]":
    "The chart's readout speaks only after a key on the plot, so a page where it can speak has a Keyboard section, and every chart page's leads by `keysOf` to Chart, whose Accessibility section describes the readout.",
};

/** The first element of the page's stages that Tab reaches, named, or null. */
async function firstTabStop(page: Page): Promise<string | null> {
  const ids = await page
    .locator("[data-example]")
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.example!));
  for (const id of ids) {
    const example = page.locator(`[data-example="${id}"]`);
    if ((await example.locator(".exampleStage").count()) === 0) continue;
    await focusBeforeStage(example);
    await page.keyboard.press("Tab");
    const reached = await page.evaluate((exampleId) => {
      const el = document.activeElement;
      const stage = el?.closest(".exampleStage");
      if (!el || !stage || stage.closest("[data-example]")?.getAttribute("data-example") !== exampleId) return null;
      return el.tagName.toLowerCase() + (el.getAttribute("aria-label") ? ` "${el.getAttribute("aria-label")}"` : "");
    }, id);
    if (reached) return `${id} › ${reached}`;
  }
  return null;
}

/** The first live region in the page's stages that no exception covers. */
async function firstLiveRegion(page: Page): Promise<string | null> {
  return page.evaluate(
    ({ live, excepted }) => {
      for (const el of document.querySelectorAll(`.exampleStage :is(${live})`)) {
        if (excepted.some((selector) => el.matches(selector))) continue;
        const example = el.closest("[data-example]")?.getAttribute("data-example");
        const role = el.getAttribute("role");
        return `${example} › ${el.tagName.toLowerCase()}${role ? `[role=${role}]` : `[aria-live=${el.getAttribute("aria-live")}]`}`;
      }
      return null;
    },
    { live: LIVE, excepted: Object.keys(UNANNOUNCED) },
  );
}

export function checkSilentPages(p: SilentPagesProbes): void {
  test.describe("no page is silent about its keys or its announcements", () => {
    test.skip(({ colorScheme }) => colorScheme === "dark", "the page's structure, once (light)");

    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
    });

    for (const pageId of p.pages) {
      test(`${pageId}: a Keyboard section where a stage takes Tab, an Accessibility section where it announces`, async ({
        page,
      }) => {
        await p.open(page, pageId);
        const has = (anchor: string) => page.locator(`[id="${anchor}-${pageId}"]`).count().then((n) => n > 0);
        const faults: string[] = [];
        const tabStop = await firstTabStop(page);
        if (tabStop && !(await has("keyboard"))) faults.push(`${pageId}: ${tabStop} takes Tab, and the page has no Keyboard section`);
        const live = await firstLiveRegion(page);
        if (live && !(await has("accessibility")))
          faults.push(`${pageId}: ${live} announces, and the page has no Accessibility section`);
        expect(faults).toEqual([]);
      });
    }
  });
}
