/* How a test reaches a page or an example - in every demo.

   By the address, the way a person does. The address comes from the demo's
   outline (`addressOf`) and not from a second list here: a page that moves
   there moves with it here. */

import type { Page } from "@playwright/test";

export function navigation(addressOf: (pageId: string, exampleId?: string) => string) {
  return {
    /** Opens a page and waits until it stands. */
    async open(page: Page, pageId: string): Promise<void> {
      await page.goto(pageId === "overview" ? "/" : addressOf(pageId));
      await page.evaluate(() => document.fonts.ready);
      await page.locator(`[data-block="${pageId}"]`).waitFor({ state: "visible" });
      await settle(page);
    },

    /** Opens a page and brings an example into view. */
    async openExample(page: Page, pageId: string, exampleId: string): Promise<void> {
      await page.goto(addressOf(pageId, exampleId));
      await page.evaluate(() => document.fonts.ready);
      await page.locator(`[data-example="${exampleId}"]`).waitFor({ state: "visible" });
      await settle(page);
    },
  };
}

/** Waits until the jump marker has run out.

    The marker is an animation. Whoever measures while it runs measures an
    intermediate colour - the accessibility check flickered on exactly that
    under load. */
export async function settle(page: Page): Promise<void> {
  await page.waitForFunction(() => document.querySelector("[data-highlight]") === null);
}

/** Waits until no animation is running any more.

    Needed by every test that measures an image or a position AFTER a
    choreography. A fixed wait would not do: it would be too short on a slower
    machine and wasted on every other one. */
export async function standstill(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished)).then(() => undefined),
  );
}

/** Switches on "all examples with code" on the open page. */
export async function allWithCode(page: Page): Promise<void> {
  await page.getByLabel("all examples with code").check();
}
