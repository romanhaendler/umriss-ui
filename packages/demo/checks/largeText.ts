/* Every demo page with the root font size at 200 % - a reader who keeps a
   large default font. The type is in `rem` and grows; a surface with a fixed
   `px` height does not, and the type leaves it or is cut by it.
   One suite for all of them; each package's `large-text.spec.ts` calls it.

   Per page: the text of every example stage is measured at 100 %, then again
   with the root font size at 200 %, and a finding is what is new. Each text is
   measured against its surface - the nearest box around it with a background
   or an edge. Findings:
   - spills: the text leaves its surface at the top or bottom, no box between
     them clips or scrolls it;
   - cut: a box between them clips it at the top or bottom;
   - spills sideways: it leaves its surface at the side, nothing clips it.
   Not a finding: text cut at the side by an ellipsis or a clip, text in a box
   that scrolls or is clamped to some lines, the library's visually hidden text, text whose surface is the
   page. Vertically the glyphs' ink is measured, not the font's content area; the
   comparison with 100 % and a tolerance of 0.5 px (1.5 px sideways) take up the rest. */

import { test, expect, type Page } from "@playwright/test";
import type { ExampleAddress } from "./pages.ts";

export interface LargeTextSuite {
  /** The demo's package name, as `OPEN` names it. */
  demo: string;
  open: (page: Page, pageId: string) => Promise<void>;
  examples: readonly ExampleAddress[];
}

/** One finding, as the browser reports it. */
interface Raw {
  example: string;
  kind: string;
  /** The text's element and its surface, by component: `badge in badge`. */
  element: string;
  text: string;
  /** Pixels beyond the surface, vertically and sideways. */
  v: number;
  h: number;
  font: string;
}

/** A finding that is real and still open: named and handed on. Matched on
    demo, page, example and element - never on a whole rule. Empty is the
    intended state; every entry names what fixes it. */
export interface Open {
  demo: string;
  page: string;
  examples: readonly string[];
  element: string;
  reason: string;
  fix: string;
}

/* One function, because `page.evaluate` serialises it and nothing outside it. */
function probe(): Raw[] {
  const px = (v: string) => parseFloat(v) || 0;
  const surfaceOf = (el: Element): Element | null => {
    for (
      let e: Element | null = el;
      e && e !== document.body;
      e = e.parentElement
    ) {
      const s = getComputedStyle(e);
      const hasBg =
        s.backgroundColor !== "transparent" &&
        !/rgba\(.*,\s*0\)$/.test(s.backgroundColor);
      const hasEdge =
        px(s.borderTopWidth) > 0 ||
        px(s.borderBottomWidth) > 0 ||
        (s.boxShadow !== "" && s.boxShadow !== "none");
      // A hairline (a tick, a rule) is not a surface.
      const r = e.getBoundingClientRect();
      if ((hasBg || hasEdge) && r.width >= 2 && r.height >= 2) return e;
    }
    return null;
  };
  const name = (el: Element): string => {
    const own = [...el.classList].find((c) =>
      /^_[A-Za-z0-9]+_[a-z0-9]{5}_\d+$/.test(c),
    );
    return own
      ? (own.split("_")[1] ?? el.tagName.toLowerCase())
      : el.tagName.toLowerCase();
  };
  const hiddenText = (el: Element): boolean => {
    for (let e: Element | null = el; e; e = e.parentElement)
      if (name(e) === "hidden") return true;
    return false;
  };
  const found: Raw[] = [];
  const ctx = document
    .createElement("canvas")
    .getContext("2d") as CanvasRenderingContext2D;
  for (const stage of document.querySelectorAll(".exampleStage")) {
    const example =
      stage.closest("[data-example]")?.getAttribute("data-example") ?? "";
    const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent ?? "").trim();
      const el = n.parentElement;
      if (!text || !el || hiddenText(el)) continue;
      const st = getComputedStyle(el);
      if (st.visibility === "hidden" || st.display === "none") continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const rects = [...range.getClientRects()].filter(
        (r) => r.width > 0 && r.height > 0,
      );
      if (rects.length === 0) continue;
      // Vertically the ink of the glyphs, not the font's content area, which
      // is taller than they are; sideways the rectangle.
      // ponytail: the ink of the whole text for every fragment, so a wrapped
      // line is measured by the tallest of its lines.
      ctx.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
      const m = ctx.measureText(text);
      const ink = rects.map((r) => {
        const top =
          r.top +
          (r.height - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
        return {
          top: top + m.fontBoundingBoxAscent - m.actualBoundingBoxAscent,
          bottom: top + m.fontBoundingBoxAscent + m.actualBoundingBoxDescent,
        };
      });
      const t = {
        top: Math.min(...ink.map((r) => r.top)),
        bottom: Math.max(...ink.map((r) => r.bottom)),
        left: Math.min(...rects.map((r) => r.left)),
        right: Math.max(...rects.map((r) => r.right)),
      };
      const surface = surfaceOf(el);
      if (!surface) continue;
      const b = surface.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      const v = Math.max(b.top - t.top, t.bottom - b.bottom);
      const h = Math.max(b.left - t.left, t.right - b.right);
      // Tolerance: sub-pixel rounding of the metrics; the old badge's descenders hang 0.6 px.
      if (v <= 0.5 && h <= 1.5) continue;
      // The nearest box between the text and its surface (inclusive) that clips.
      let clip: CSSStyleDeclaration | null = null;
      let clamped = false;
      for (let e: Element | null = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.overflowX !== "visible" || cs.overflowY !== "visible") {
          clip = cs;
          // A line clamp clips by design, as an ellipsis does.
          const clamp = cs.getPropertyValue("-webkit-line-clamp");
          clamped = clamp !== "" && clamp !== "none";
          break;
        }
        if (e === surface) break;
      }
      let kind: string;
      if (v > 0.5)
        kind = clip
          ? /auto|scroll/.test(clip.overflowY)
            ? ""
            : "cut"
          : "spills";
      else kind = clip ? "" : "spills sideways";
      if (kind === "" || clamped) continue;
      found.push({
        example,
        kind,
        element: `${name(el)} in ${name(surface)}`,
        text: text.slice(0, 30),
        v: Math.round(v),
        h: Math.round(h),
        font: st.fontSize,
      });
    }
  }
  return found;
}

const key = (f: { example: string; element: string; text: string }) =>
  `${f.example}|${f.element}|${f.text}`;

export function checkLargeText({ demo, open, examples }: LargeTextSuite): void {
  test.skip(
    ({ colorScheme }) => colorScheme === "dark",
    "the larger font does not change with the theme: once (light)",
  );
  const pages = [...new Set(examples.map((e) => e.pageId))];

  for (const pageId of pages) {
    test(`Page ${pageId} keeps its text on its surface at 200 %`, async ({
      page,
    }) => {
      await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
      await open(page, pageId);
      const at100 = await page.evaluate(probe);
      await page.addStyleTag({
        content: "html { font-size: 200% !important; }",
      });
      await page.evaluate(
        () =>
          new Promise((done) =>
            requestAnimationFrame(() => requestAnimationFrame(done)),
          ),
      );
      const at200 = await page.evaluate(probe);
      const before = new Set(at100.map(key));
      const open_ = OPEN.filter((o) => o.demo === demo && o.page === pageId);
      const fresh = at200.filter((f) => !before.has(key(f)));
      const matches = (o: Open, f: Raw) =>
        o.element === f.element && o.examples.includes(f.example);
      const stale = open_
        .filter((o) => !fresh.some((f) => matches(o, f)))
        .map((o) => `stale open finding: ${o.page} / ${o.element} (${o.fix})`);
      const found = fresh
        .filter(
          (f) =>
            !open_.some(
              (o) => o.element === f.element && o.examples.includes(f.example),
            ),
        )
        .map(
          (f) =>
            `${pageId} / ${f.example}: "${f.text}" (${f.element}, ${f.font}) ${f.kind} by ${f.kind === "spills sideways" ? f.h : f.v} px`,
        );
      expect(found, `${pageId} at a root font size of 200 %`).toEqual([]);
      expect(stale, `${pageId}`).toEqual([]);
    });
  }
}

/**
 * Findings that are real and still open. Empty is the intended state; a new
 * entry names its follow-up.
 */
export const OPEN: readonly Open[] = [];
