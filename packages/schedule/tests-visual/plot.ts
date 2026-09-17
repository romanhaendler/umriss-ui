/* Where a time and a lane lie on an example's plot - worked out from the
   example's own declared domain and lane height, not read from the component,
   so that a test aims where a person would. */

import type { Locator, Page } from "@playwright/test";

export const LANE_HEIGHT = 44;

/** A local time on Tuesday, 17 March 2026 - the day of the demo's plan. */
export const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

export interface Plot {
  /** Client x of a local time on the 17th. */
  x: (hours: number, minutes?: number) => number;
  /** Client y of the middle of a lane, by its index. */
  y: (lane: number) => number;
  box: { x: number; y: number; width: number; height: number };
}

export async function plotOf(page: Page, example: Locator, domain: readonly [number, number], laneHeight = LANE_HEIGHT): Promise<Plot> {
  const plot = example.locator("[data-schedule-plot]").first();
  await plot.scrollIntoViewIfNeeded();
  const box = await plot.boundingBox();
  if (box === null) throw new Error("plot not found");
  void page;
  return {
    box,
    x: (hours, minutes = 0) => box.x + ((at(hours, minutes) - domain[0]) / (domain[1] - domain[0])) * box.width,
    y: (lane) => box.y + lane * laneHeight + laneHeight / 2,
  };
}

/** The day of the plan as the examples declare it (`demo/data.ts`). */
export const DAY_OF_PLAN = [at(5, 30), at(18)] as const;

/** The stations of the plan, top to bottom (`demo/data.ts`). */
export const LANES = { saw: 0, lathe1: 1, lathe2: 2, mill: 3, press: 4, paint: 5, qa: 6 } as const;
