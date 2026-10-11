/* How a test gets to a page or an example.

   Through the address, as a person does too. The address comes out of the
   demo's outline and not out of a second list here: a page that moves there
   moves here with it. The waiting stands with the shell (`@umriss-ui/demo`),
   because it waits on it.

   The outline import still names the German module of `demo/`; that directory
   is renamed by its own ticket. */

import type { Locator, Page } from "@playwright/test";
import { navigation } from "@umriss-ui/demo/checks/navigation";
import { addressOf } from "../demo/outline";

export { OUTLINE, ALL_PAGES, addressOf } from "../demo/outline";
export { allWithCode, aloneStage, settle, standstill } from "@umriss-ui/demo/checks/navigation";

export const { open, openExample, openScenario } = navigation(addressOf);

/** The clip of a picture of one component: its box and a margin, inside the
    window. A picture of the whole window would show the sidebar and the page
    list too, and change with them. */
export async function around(page: Page, subject: Locator, margin = 24) {
  /* The box at rest: a pane that grows by an observer is no animation the page
     lists, so two equal readings a frame apart are what "at rest" means here. */
  let box = (await subject.boundingBox())!;
  for (let reading = 0; reading < 30; reading += 1) {
    await page.evaluate(() => new Promise((frame) => requestAnimationFrame(frame)));
    const next = (await subject.boundingBox())!;
    const same = next.x === box.x && next.y === box.y && next.width === box.width && next.height === box.height;
    box = next;
    if (same) break;
  }
  /* Whole pixels, outwards: a fractional clip is rounded by the browser, and
     half a pixel then decides the picture's size. */
  const { width, height } = page.viewportSize()!;
  const x = Math.max(0, Math.floor(box.x - margin));
  const y = Math.max(0, Math.floor(box.y - margin));
  return {
    x,
    y,
    width: Math.min(width, Math.ceil(box.x + box.width + margin)) - x,
    height: Math.min(height, Math.ceil(box.y + box.height + margin)) - y,
  };
}
