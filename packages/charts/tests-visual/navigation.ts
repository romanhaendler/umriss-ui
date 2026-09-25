/* How a test reaches a page or an example: through the address, the way a human
   does too. The address comes from the demo's outline; the waiting stands with
   the shell (`@umriss-ui/demo`), because it is the shell it waits for.

   What charts adds to it is its own and belongs here: a chart is not drawn when
   it is visible. The scene binds itself to its canvas on mounting and measures
   through a ResizeObserver, so the sequence is layout -> measure -> draw, and
   every step of it happens in a frame of its own.

   WAITING FOR TWO FRAMES IS NOT ENOUGH, and what is waited for here instead is
   the drawing itself: the charts have come to rest when two frames in a row are
   pixel-identical on every canvas and every plot rectangle stands still. That is
   the thing the picture is of, and it cannot be outrun by a resize or a theme.

   It removed a real layout race, in which the axis labels were measured at two
   different heights. The pictures that still wandered by a whole pixel after it
   were not a waiting problem and not the rasterisation either: the scene kept a
   y band as wide as the fallback font had measured it, when a layout ran before
   Geist arrived (fixed in `ChartScene`, see `docs/testing.md`, Known open). */

import type { Page } from "@playwright/test";
import { navigation } from "@umriss-ui/demo/checks/navigation";
import { addressOf } from "../demo/outline";

export { OUTLINE, ALL_PAGES, addressOf } from "../demo/outline";
export { allWithCode, settle, standstill } from "@umriss-ui/demo/checks/navigation";

const shell = navigation(addressOf);

/** Two frames: the scene binds to its canvas and draws inside the rAF. */
async function twoFrames(page: Page): Promise<void> {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

/** What the charts currently show: the size of every plot area and a signature
    of every canvas' pixels.

    The signature is cheap on purpose - a rolling sum over the raw bytes. It has
    to notice that something changed, not what. */
async function drawing(page: Page): Promise<string> {
  return page.evaluate(() => {
    const plots = [...document.querySelectorAll(".uc-plot")].map((el) => {
      const r = el.getBoundingClientRect();
      return `${r.x}:${r.y}:${r.width}:${r.height}`;
    });
    const canvases = [...document.querySelectorAll("canvas")].map((el) => {
      const c = el as HTMLCanvasElement;
      const ctx = c.getContext("2d");
      if (ctx === null || c.width === 0 || c.height === 0) return `${c.width}x${c.height}`;
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let sum = 0;
      /* Every fourth byte is enough to notice a moved line, and reading a
         million pixels per frame is not. */
      for (let i = 0; i < data.length; i += 16) sum = (sum + (data[i] as number) * (i % 1021)) % 2147483647;
      return `${c.width}x${c.height}#${sum}`;
    });
    return [...plots, ...canvases].join("|");
  });
}

/** Waits until the charts have come to rest.

    Two readings in a row that agree - with a bound on the attempts, so that a
    genuinely oscillating page fails as a timeout instead of hanging. A page
    with no chart on it (the scenarios page) agrees with itself at once. */
export async function drawn(page: Page): Promise<void> {
  /* The fonts first, and again here: the shell awaits them before the page is
     visible, and the labels this demo measures are laid out after that. */
  await page.evaluate(() => document.fonts.ready);
  await twoFrames(page);
  let previous = await drawing(page);
  for (let attempt = 0; attempt < 40; attempt++) {
    await twoFrames(page);
    const current = await drawing(page);
    if (current === previous) return;
    previous = current;
  }
  throw new Error("the charts do not come to rest");
}

export async function open(page: Page, pageId: string): Promise<void> {
  await shell.open(page, pageId);
  await drawn(page);
}

export async function openScenario(page: Page, scenarioId: string): Promise<void> {
  await shell.openScenario(page, scenarioId);
  await drawn(page);
}

export async function openExample(page: Page, pageId: string, exampleId: string): Promise<void> {
  await shell.openExample(page, pageId, exampleId);
  await drawn(page);
}
