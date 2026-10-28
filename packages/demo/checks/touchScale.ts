/* `touch-scale.css` (ADR-0079): with the stylesheet on and a finger as the
   pointer, a `md` control is 44 px, and nothing around it may have been built
   for 32. Every demo page is opened under touch emulation (`hasTouch`, 375 px,
   Chromium, light), the shell's touch-scale switch is pressed, and every `md`
   control on the example stages is looked at: it must not be cut off by an
   ancestor that clips, and must not stand outside the ancestor that is meant to
   hold it. One suite for all demos; each package's `touch-scale.spec.ts` calls
   `checkTouchScale`.

   A `md` control is a button, a field, a select, a combobox or a segmented
   control that measures the grown height. Not looked at: a control that is
   hidden, one inside a scrolling ancestor (it is reached by scrolling) or
   inside a clipping ancestor folded to nothing (a closed panel), and the
   ancestors beyond an out-of-flow one (a popover lies outside its anchor by
   design). Horizontal fit is not judged here: a row that wraps or scrolls
   sideways is the application's layout, and the height is what the stylesheet
   changes. */

import { test, expect, type Page } from "@playwright/test";
import type { ExampleAddress } from "./pages.ts";

export interface TouchScaleSuite {
  open: (page: Page, pageId: string) => Promise<void>;
  examples: readonly ExampleAddress[];
}

/** The grown height of a `md` control, as `touch-scale.css` sets it. */
export const GROWN = 44;

/** The shell's switch, pressed: the stylesheet is on the page. */
export async function turnOnTouchScale(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: "Touch scale", exact: true });
  if ((await toggle.getAttribute("aria-pressed")) !== "true") await toggle.click();
  await page.locator("style[data-touch-scale]").waitFor({ state: "attached" });
}

interface Finding {
  example: string;
  control: string;
  problem: string;
}

/* One function, because `page.evaluate` serialises it and nothing outside it. */
export function probe(roots: Element[], grown: number): Finding[] {
  const CONTROLS = [
    "button",
    "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file])",
    "select",
    "[role=combobox]",
    "[role=radiogroup]",
  ].join(",");
  const describe = (el: Element) => {
    const text = (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 24);
    return `${el.tagName.toLowerCase()}${el.getAttribute("role") ? `[${el.getAttribute("role")}]` : ""} "${text}"`;
  };
  const found: Finding[] = [];
  const seen = new Set<Element>();
  for (const root of roots) {
    for (const el of root.querySelectorAll(CONTROLS)) {
      if (seen.has(el)) continue;
      seen.add(el);
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      el.scrollIntoView({ block: "center", inline: "center" });
      const r = el.getBoundingClientRect();
      if (Math.abs(r.height - grown) > 0.5) continue;
      const example = el.closest("[data-example]")?.getAttribute("data-example") ?? "";
      for (let a = el.parentElement; a && a !== root.parentElement; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (s.display === "contents" || s.display === "inline") continue;
        if (s.position === "absolute" || s.position === "fixed") break;
        if (/(auto|scroll)/.test(s.overflowY)) break;
        const box = a.getBoundingClientRect();
        const clips = /(hidden|clip)/.test(s.overflowY);
        // Folded to nothing (a closed accordion panel): not on show, so not cut off.
        if (box.height === 0 && clips) break;
        if (box.height === 0) continue;
        const out = Math.max(box.top - r.top, r.bottom - box.bottom);
        if (out > 1) {
          found.push({
            example,
            control: describe(el),
            problem: `${clips ? "clipped by" : "overflows"} ${a.tagName.toLowerCase()}.${[...a.classList][0] ?? ""} by ${Math.round(out)} px`,
          });
          break;
        }
      }
    }
  }
  return found;
}

export function checkTouchScale({ open, examples }: TouchScaleSuite): void {
  test.skip(
    ({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium",
    "the stylesheet does not change with the theme: once (light, Chromium)",
  );
  test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
  const pages = [...new Set(examples.map((e) => e.pageId))];

  for (const pageId of pages) {
    test(`Page ${pageId} has no clipped or overflowing md control with touch-scale.css`, async ({ page }) => {
      await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
      await open(page, pageId);
      await turnOnTouchScale(page);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches), "touch emulation").toBe(true);
      const found = await page.locator(".exampleStage").evaluateAll(probe, GROWN);
      expect(
        found.map((f) => `${f.example}: ${f.control} ${f.problem}`),
        `${pageId} with touch-scale.css under a finger`,
      ).toEqual([]);
    });
  }
}
