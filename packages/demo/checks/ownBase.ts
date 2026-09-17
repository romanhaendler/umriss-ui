/* What a component must carry itself, once nothing around it does (ADR-0021).

   The library has no base layer any more, and the demo page puts every example
   back on the browser's defaults (`.exampleStage` in page.css). A screenshot
   shows most of what a component took from its surroundings - but not all of
   it: a focus ring appears only on focus, and a dependency can happen to look
   identical. These three checks ask the computed style instead of the image:

   1. **Own type.** Every element in an example that renders text of its own
      computes a font family other than the stage's - which is the browser
      default, so an element that shows it inherited it.
   2. **Own box.** Every element carrying a class of the library - a CSS module
      class of core or table, or a `uc-` class of the charts - computes
      `box-sizing: border-box`.
   3. **Visible focus.** Tabbing through an example, every element that takes
      the focus shows it: its `box-shadow` or `outline`, or that of an ancestor
      inside the example (a field that rings its wrapper through
      `:focus-within`), differs from the unfocused state. The browser's own
      ring does not count - it is what shows when a component brought none.

   Each offender is named as `<example> › <element>`, so that the component
   that owes it can be found from the output. Like the shell's and the page's
   checks it stands once and runs against every demo: their
   `own-base.spec.ts` calls `checkOwnBase` with their pages. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export interface OwnBaseProbes {
  /** How the demo opens a page (its `navigation.ts`). */
  open: (page: Page, pageId: string) => Promise<void>;
  /** The pages to check - every page that carries examples. */
  pages: readonly string[];
  /** Offenders that are not the library's, as "<example> › <element>" with
      the reason - an example's own loose text, for instance. */
  tolerated?: Readonly<Record<string, string>>;
}

/** A short, stable name for an element: its tag, its first class without the
    module hash, and the start of its text. */
const DESCRIBE = `(el) => {
  const cls = [...el.classList][0];
  const name = cls ? "." + cls.replace(/^_(.+)_[a-z0-9]{5}_\\d+$/, "$1") : "";
  const text = (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 24);
  return el.tagName.toLowerCase() + name + (text ? ' "' + text + '"' : "");
}`;

async function ownType(page: Page): Promise<string[]> {
  return page.evaluate((describe) => {
    const name = new Function(`return ${describe}`)() as (el: Element) => string;
    const found: string[] = [];
    for (const example of document.querySelectorAll<HTMLElement>("[data-example]")) {
      const stage = example.querySelector<HTMLElement>(".exampleStage");
      if (!stage) continue;
      const stageFont = getComputedStyle(stage).fontFamily;
      for (const el of stage.querySelectorAll<HTMLElement>("*")) {
        const ownText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim() !== "");
        if (!ownText || el.getClientRects().length === 0) continue;
        if (getComputedStyle(el).fontFamily === stageFont) found.push(`${example.dataset.example} › ${name(el)}`);
      }
    }
    return found;
  }, DESCRIBE);
}

async function ownBox(page: Page): Promise<string[]> {
  return page.evaluate((describe) => {
    const name = new Function(`return ${describe}`)() as (el: Element) => string;
    const LIBRARY = /(^|\s)(_[A-Za-z][\w]*_[a-z0-9]{5}_\d+|uc-[\w-]+)(\s|$)/;
    const found: string[] = [];
    for (const example of document.querySelectorAll<HTMLElement>("[data-example]")) {
      for (const el of example.querySelectorAll<HTMLElement>(".exampleStage *")) {
        if (!LIBRARY.test(el.getAttribute("class") ?? "")) continue;
        if (getComputedStyle(el).boxSizing !== "border-box") found.push(`${example.dataset.example} › ${name(el)}`);
      }
    }
    return found;
  }, DESCRIBE);
}

/** The focus indication of an element, of its ancestors inside the stage and
    of its next sibling - a visually hidden input rings the box drawn beside it
    (`.input:focus-visible + .box`). The browser's own ring
    (`outline-style: auto`) does not count: it is what an element shows when
    the component brought nothing, and it is not the library's ring. */
const INDICATION = `(el) => {
  const stage = el.closest(".exampleStage");
  const out = [];
  const around = [el.nextElementSibling];
  for (let n = el; n && n !== stage; n = n.parentElement) around.push(n);
  for (const n of around) {
    if (!n) continue;
    const s = getComputedStyle(n);
    const outline = s.outlineStyle === "auto" || s.outlineStyle === "none" ? "none" : s.outlineStyle + " " + s.outlineWidth + " " + s.outlineColor;
    out.push(s.boxShadow + "|" + outline);
  }
  return out.join("/");
}`;

/* Tab moves the focus on, and that is the comparison: the indication an
   element shows while it has the focus, against the one it shows once Tab has
   taken the focus to the next element. No `blur()` - that would run the
   component's own handlers where a user never would. */
async function visibleFocus(page: Page): Promise<string[]> {
  const found: string[] = [];
  const ids = await page
    .locator("[data-example]")
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.example!));
  for (const id of ids) {
    const example = page.locator(`[data-example="${id}"]`);
    if ((await example.locator(".exampleStage").count()) === 0) continue;
    await example.locator(".exampleToggle").first().focus();
    await page.evaluate(() => {
      (window as unknown as { __focusProbe: unknown }).__focusProbe = { prev: null, focused: "", seen: new WeakSet() };
    });
    for (let step = 0; step < 80; step++) {
      await page.keyboard.press("Tab");
      const { verdict, done } = await page.evaluate(
        ({ exampleId, indication, describe }) => {
          const read = new Function(`return ${indication}`)() as (el: Element) => string;
          const name = new Function(`return ${describe}`)() as (el: Element) => string;
          const probe = (window as unknown as {
            __focusProbe: { prev: Element | null; focused: string; seen: WeakSet<Element> };
          }).__focusProbe;
          const verdict = probe.prev ? { name: name(probe.prev), shows: read(probe.prev) !== probe.focused } : null;
          const el = document.activeElement;
          const stage = el?.closest(".exampleStage");
          const inside = !!el && !!stage && stage.closest("[data-example]")?.getAttribute("data-example") === exampleId;
          if (!inside || probe.seen.has(el!)) {
            probe.prev = null;
            return { verdict, done: true };
          }
          probe.seen.add(el!);
          probe.prev = el;
          probe.focused = read(el!);
          return { verdict, done: false };
        },
        { exampleId: id, indication: INDICATION, describe: DESCRIBE },
      );
      if (verdict && !verdict.shows) found.push(`${id} › ${verdict.name}`);
      if (done) break;
    }
  }
  return found;
}

export function checkOwnBase(p: OwnBaseProbes): void {
  const tolerated = p.tolerated ?? {};
  const untolerated = (offenders: string[]) => [...new Set(offenders)].filter((o) => !(o in tolerated));

  test.describe("the components carry their own base (ADR-0021)", () => {
    test.skip(({ colorScheme }) => colorScheme === "dark", "computed style, once (light)");

    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
    });

    for (const pageId of p.pages) {
      test(`${pageId}: text in its own type, own elements in border-box, focus visible`, async ({ page }) => {
        await p.open(page, pageId);
        const offenders = {
          type: untolerated(await ownType(page)),
          box: untolerated(await ownBox(page)),
          focus: untolerated(await visibleFocus(page)),
        };
        expect(offenders).toEqual({ type: [], box: [], focus: [] });
      });
    }
  });
}
