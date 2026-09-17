/* How a test reaches a page or an example: through the address, the way a human
   does too. The address comes from the demo's outline; the waiting for the
   shell stands with the shell (`@umriss-ui/demo`).

   What the schedule adds is the charts' finding (`packages/charts/tests-visual/
   navigation.ts`): a canvas is not drawn when it is visible. The scene binds on
   mounting, measures through a ResizeObserver and draws in a frame of its own,
   so what is waited for is the drawing itself - two readings in a row, a frame
   apart, in which every schedule stands still and every canvas is
   pixel-identical. */

import type { Page } from "@playwright/test";
import { navigation } from "@umriss-ui/demo/checks/navigation";
import { addressOf } from "../demo/outline";

export { OUTLINE, ALL_PAGES, addressOf } from "../demo/outline";
export { allWithCode, settle, standstill } from "@umriss-ui/demo/checks/navigation";

const shell = navigation(addressOf);

async function twoFrames(page: Page): Promise<void> {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

/** The size of every plot and a cheap signature of every canvas' pixels. */
async function drawing(page: Page): Promise<string> {
  return page.evaluate(() => {
    const plots = [...document.querySelectorAll("[data-schedule-plot]")].map((el) => {
      const r = el.getBoundingClientRect();
      return `${r.x}:${r.y}:${r.width}:${r.height}`;
    });
    const canvases = [...document.querySelectorAll("canvas")].map((el) => {
      const c = el as HTMLCanvasElement;
      const ctx = c.getContext("2d");
      if (ctx === null || c.width === 0 || c.height === 0) return `${c.width}x${c.height}`;
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 16) sum = (sum + (data[i] as number) * (i % 1021)) % 2147483647;
      return `${c.width}x${c.height}#${sum}`;
    });
    return [...plots, ...canvases].join("|");
  });
}

/** Waits until every schedule has come to rest. */
export async function drawn(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await twoFrames(page);
  let previous = await drawing(page);
  for (let attempt = 0; attempt < 40; attempt++) {
    await twoFrames(page);
    const current = await drawing(page);
    if (current === previous) return;
    previous = current;
  }
  throw new Error("the schedules do not come to rest");
}

export async function open(page: Page, pageId: string): Promise<void> {
  await shell.open(page, pageId);
  await drawn(page);
}

export async function openExample(page: Page, pageId: string, exampleId: string): Promise<void> {
  await shell.openExample(page, pageId, exampleId);
  await drawn(page);
}
