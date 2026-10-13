/* The steps and the instruments the tests of the toasts above a modal share:
   the example "Inside a modal" of the Toast page, and the frames of what stands
   on the screen while its toasts move. */

import { expect, type Page } from "@playwright/test";
import { openExample } from "./navigation";

/** The example opened and its modal standing. */
export async function openTheModal(page: Page) {
  await openExample(page, "toast", "inside-a-modal");
  await page.getByRole("button", { name: "Edit the profile" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit the profile" });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** The modal standing and "Save" pressed: the toast of the failure is shown. */
export async function failToSave(page: Page) {
  const dialog = await openTheModal(page);
  const save = dialog.getByRole("button", { name: "Save" });
  await save.click();
  const region = page.getByRole("region", { name: "Messages (Alt+T)" });
  await expect(region.getByText("Profile not saved")).toBeVisible();
  return { dialog, save, region };
}

/** What one card looked like in one frame. */
export interface CardFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  /** The height of the card's surface, which a card behind the front one sets. */
  surface: number;
  /** The surface's opacity: the entrance runs on it. */
  opacity: number;
}

/**
 * Starts reading every toast card's box in every animation frame; the cards
 * are looked up anew each time, since a move builds the region again. The
 * returned function ends the reading and gives the frames - in each, the cards
 * in document order.
 */
export async function sampleFrames(page: Page): Promise<() => Promise<CardFrame[][]>> {
  await page.evaluate(() => {
    const state = { running: true, frames: [] as unknown[][] };
    (window as unknown as { __frames: typeof state }).__frames = state;
    const frame = () => {
      state.frames.push(
        [...document.querySelectorAll<HTMLElement>("[data-toast]")].map((card) => {
          const box = card.getBoundingClientRect();
          const surface = card.parentElement!;
          return {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
            surface: Math.round(surface.getBoundingClientRect().height),
            opacity: Number(getComputedStyle(surface).opacity),
          };
        }),
      );
      if (state.running) requestAnimationFrame(frame);
    };
    frame();
  });
  return () =>
    page.evaluate(() => {
      const state = (window as unknown as { __frames: { running: boolean; frames: unknown[][] } }).__frames;
      state.running = false;
      return state.frames as CardFrame[][];
    });
}

/** The distinct values a card's measure took, and the frames it was missing in. */
export function seen(frames: CardFrame[][], index: number, field: keyof CardFrame) {
  return {
    values: [...new Set(frames.flatMap((cards) => cards.slice(index, index + 1).map((card) => card[field])))],
    missing: frames.filter((cards) => !cards[index]).length,
  };
}
