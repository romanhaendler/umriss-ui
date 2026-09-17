/* Nothing the library draws in the DOM may be in its own way
   (schedule-legibility 02).

   A schedule draws its marks on canvas and everything a reader has to read in
   the DOM: lane headers, both band labels, the labels in the bars, the ghost's
   label, the tooltip, the grips. Each of those lies inside a box that clips -
   the plot, the day band, the time band - and a label that leaves its box is
   simply cut off. That is how the ghost's label was lost in the topmost lane,
   and it was found by eye, which is the part this check replaces.

   Two invariants, and both are read off the rendered boxes:

   1. **Inside.** Every element marked `data-schedule-overlay` lies within the
      nearest enclosing `data-schedule-clip`.
   2. **Apart.** No two overlays that carry the same `data-schedule-overlay`
      value intersect - two labels of the same kind over one another are two
      labels nobody can read. Overlays of different kinds may: a tooltip is
      meant to cover what it explains.

   It reads only boxes, so it says nothing about the canvas underneath. The
   pictures carry that, and the geometry has its own unit tests.

   The same function serves both callers: `checkOverlays` walks a demo's pages
   with nothing in flight, and `overlayOffenders` is called by a feature test in
   the middle of a drag, where the ghost's label exists at all. One definition,
   two moments. */

import { test, expect, type Page } from "@playwright/test";

/** One pixel of slack: a box measured through the protocol can differ from its
    layout by a fraction, and a fraction is not a clipped label. */
const SLACK = 1;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const covers = (outer: Box, inner: Box): boolean =>
  inner.x >= outer.x - SLACK &&
  inner.y >= outer.y - SLACK &&
  inner.x + inner.width <= outer.x + outer.width + SLACK &&
  inner.y + inner.height <= outer.y + outer.height + SLACK;

const intersects = (a: Box, b: Box): boolean =>
  a.x + a.width > b.x + SLACK &&
  b.x + b.width > a.x + SLACK &&
  a.y + a.height > b.y + SLACK &&
  b.y + b.height > a.y + SLACK;

/** Every overlay that leaves its clipping box, and every pair of the same kind
    that covers one another - each as one readable line. */
export async function overlayOffenders(page: Page): Promise<string[]> {
  const found = await page.evaluate(() => {
    const box = (element: Element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return [...document.querySelectorAll("[data-schedule-overlay]")]
      .filter((element) => {
        const r = element.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map((element) => {
        const clip = element.closest("[data-schedule-clip]");
        const example = element.closest("[data-example], [data-block]");
        return {
          kind: element.getAttribute("data-schedule-overlay") ?? "",
          where: example?.getAttribute("data-example") ?? example?.getAttribute("data-block") ?? "?",
          text: (element.textContent ?? "").trim().slice(0, 24),
          box: box(element),
          clip: clip === null ? null : box(clip),
          clipName: clip?.getAttribute("data-schedule-clip") ?? "none",
        };
      });
  });

  const offenders: string[] = [];
  for (const overlay of found) {
    if (overlay.clip === null) {
      offenders.push(`${overlay.where}: ${overlay.kind} "${overlay.text}" lies in no clipping box`);
      continue;
    }
    if (!covers(overlay.clip, overlay.box)) {
      offenders.push(
        `${overlay.where}: ${overlay.kind} "${overlay.text}" leaves its ${overlay.clipName}` +
          ` (${Math.round(overlay.box.x)},${Math.round(overlay.box.y)} ${Math.round(overlay.box.width)}×${Math.round(overlay.box.height)}` +
          ` outside ${Math.round(overlay.clip.x)},${Math.round(overlay.clip.y)} ${Math.round(overlay.clip.width)}×${Math.round(overlay.clip.height)})`,
      );
    }
  }
  for (let i = 0; i < found.length; i++) {
    for (let j = i + 1; j < found.length; j++) {
      const a = found[i]!;
      const b = found[j]!;
      if (a.kind !== b.kind || a.where !== b.where) continue;
      if (intersects(a.box, b.box)) {
        offenders.push(`${a.where}: two ${a.kind} cover each other - "${a.text}" and "${b.text}"`);
      }
    }
  }
  return offenders;
}

export interface OverlayProbes {
  /** How a page of this demo is opened (`tests-visual/navigation.ts`). */
  open: (page: Page, pageId: string) => Promise<void>;
  /** The pages to walk. */
  pages: readonly string[];
  /** Offenders that may stay, as "line: reason". */
  tolerated?: Readonly<Record<string, string>>;
}

export function checkOverlays(p: OverlayProbes): void {
  const tolerated = p.tolerated ?? {};

  test.describe("nothing the schedule draws is in its own way", () => {
    test.skip(({ colorScheme }) => colorScheme === "dark", "measured boxes, once (light)");

    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
    });

    for (const pageId of p.pages) {
      test(`${pageId}: every overlay inside its box, and no two of a kind over each other`, async ({ page }) => {
        await p.open(page, pageId);
        const offenders = (await overlayOffenders(page)).filter((offender) => !(offender in tolerated));
        expect(offenders).toEqual([]);
      });
    }
  });
}
