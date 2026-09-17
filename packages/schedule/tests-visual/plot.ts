/* Where a time and a lane lie on an example's plot - worked out from the
   example's own declared domain and lane height, not read from the component,
   so that a test aims where a person would.

   Lanes are named, not numbered. Every example carries its own data since
   schedule-lane-groups 04, so a shared table of lane indices would be a second
   list of what the examples contain, and it would drift the first time an
   example gained a lane. The order is read from the headers the example itself
   rendered - which is the same thing a person reads.

   Where a row LIES is read from those headers too, and not multiplied out of a
   lane height. Since lane groups (08) the rows are not all the same height: an
   open group carries a slim head above its lanes, and a folded one is one row
   of its own. Multiplying an index by 44 would have been right until it
   silently was not. */

import type { Locator, Page } from "@playwright/test";

/** A local time on Tuesday, 17 March 2026 - the day of the demo's plans. */
export const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

export const LANE_HEIGHT = 44;

/** The day the demo's plans run on. Several examples declare it - each in its
    own file since schedule-lane-groups 04 - and a test that opens one of them
    states the same two instants the example did. */
export const DAY_OF_PLAN = [at(5, 30), at(18)] as const;

export interface Plot {
  /** Client x of a local time on the 17th. */
  x: (hours: number, minutes?: number) => number;
  /** Client y of the middle of a lane, by the id the example gave it. */
  y: (lane: string) => number;
  /** A lane's row, in plot coordinates - its top and its height as the plot
      really laid them out. */
  row: (lane: string) => { top: number; height: number };
  /** The lane's place among the LANES from the top, counting from zero. A
      group's head and a folded group's row are not lanes and are not counted. */
  index: (lane: string) => number;
  /** The lane ids, top to bottom, as the example declared them - the ones that
      have a row of their own. A lane inside a folded group has none. */
  lanes: readonly string[];
  box: { x: number; y: number; width: number; height: number };
}

export async function plotOf(page: Page, example: Locator, domain: readonly [number, number], laneHeight = LANE_HEIGHT): Promise<Plot> {
  const plot = example.locator("[data-schedule-plot]").first();
  await plot.scrollIntoViewIfNeeded();
  const box = await plot.boundingBox();
  if (box === null) throw new Error("plot not found");
  /* The headers of the same schedule, in the order they stand. An example with
     two schedules has two sets; the first plot's is the first set. */
  /* The headers of the same schedule, with where each really lies. The header
     column is moved as a whole by the scroll, and every row's own top follows
     from the run of them - which is exactly what the plot laid out. */
  const figure = example.locator("[data-schedule-headers]").first();
  const rows = await figure.locator("[data-row]").evaluateAll((nodes) => {
    let top = 0;
    return nodes.map((node) => {
      const height = node.getBoundingClientRect().height;
      const at = { lane: node.getAttribute("data-lane"), top, height };
      top += height;
      return at;
    });
  });
  void page;
  void laneHeight;
  const lanes = rows.flatMap((r) => (r.lane === null ? [] : [r.lane]));
  const index = (lane: string) => {
    const found = lanes.indexOf(lane);
    if (found === -1) throw new Error(`no lane \`${lane}\` with a row of its own here; this plot has ${lanes.join(", ")}`);
    return found;
  };
  const row = (lane: string) => {
    const found = rows.find((r) => r.lane === lane);
    if (found === undefined) throw new Error(`no lane \`${lane}\` with a row of its own here; this plot has ${lanes.join(", ")}`);
    return { top: found.top, height: found.height };
  };
  return {
    box,
    lanes,
    index,
    row,
    x: (hours, minutes = 0) => box.x + ((at(hours, minutes) - domain[0]) / (domain[1] - domain[0])) * box.width,
    y: (lane) => box.y + row(lane).top + row(lane).height / 2,
  };
}
