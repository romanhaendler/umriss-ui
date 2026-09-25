/* How a dependency is drawn: the route between its two ends and where on the
   bars those ends sit (schedule-legibility 04).

   The route decides the shape, the attach decides the corner - and neither
   decides whether the dependency is violated: that is what `leaves` and `arrives`
   are for, and these tests never touch them. */

import { describe, expect, it } from "vitest";
import { LinearScale } from "@umriss-ui/charts";
import { subtaskBox, dependencyPath } from "../src/geometry";
import type { Viewport } from "../src/geometry";
import { layOutRows, slotOf } from "../src/rows";
import type { Subtask, Dependency } from "../src/model";

const MIN = 60_000;
const at = (minutes: number) => Date.UTC(2026, 2, 17, 6, 0) + minutes * MIN;

/* Ten pixels to the minute, three lanes of forty - flat, so the rows are
   exactly what the multiplication gave (`rows.ts`). */
const rows = layOutRows({
  lanes: [{ id: "one", parent: undefined }, { id: "two", parent: undefined }, { id: "three", parent: undefined }],
  groups: [],
  collapsed: new Set(),
  laneHeight: 40,
});

const view: Viewport = {
  scale: new LinearScale([at(0), at(100)], [0, 1000]),
  calendar: [],
  laneHeight: 40,
  scrollY: 0,
  rows,
};

const subtask = (id: string, lane: string, from: number, to: number): Subtask => ({
  id,
  task: "t",
  lane,
  from: at(from),
  to: at(to),
});

const boxOn = (s: Subtask) => subtaskBox(view, s, s.lane, slotOf(rows, s.lane)!, 0);

const first = boxOn(subtask("a", "one", 0, 20));
const below = boxOn(subtask("b", "three", 40, 60));
const above = boxOn(subtask("c", "one", 40, 60));
const sameLane = boxOn(subtask("d", "two", 40, 60));
const fromSecond = boxOn(subtask("e", "two", 0, 20));

const move: Dependency = { id: "x", from: "a", to: "b", lag: 5 * MIN };

/* The fixture, worked out by hand: lanes are forty pixels high, a bar is
   nineteen of them and sits ten below the lane's top. So lane 1 holds its bar
   over the rows 50 … 68, lane 2 over 90 … 108, lane 0 over 10 … 28 - and the
   middles are 60, 100 and 20. A line that attaches to an edge attaches to the
   last ROW of the bar, not to the boundary beneath it. */
const LANE_ONE = { top: 50, bottom: 68, middle: 60 };
const LANE_TWO = { top: 90, bottom: 108, middle: 100 };
const LANE_ZERO = { top: 10, bottom: 28, middle: 20 };

describe("the centre attach", () => {
  it("leaves and arrives at the middle of both bars", () => {
    const path = dependencyPath(view, move, fromSecond, below, { route: "curve", attach: "centre", ends: "dot" });
    expect(path.y1).toBe(LANE_ONE.middle);
    expect(path.y2).toBe(LANE_TWO.middle);
  });
});

describe("the nearest attach", () => {
  /* A pixel inside the bar, not on its boundary: a line centred on the
     boundary lies beside the bar and reads as a gap. */
  it("leaves at the bottom edge and arrives at the top edge where the next stop lies below", () => {
    const path = dependencyPath(view, move, fromSecond, below, { route: "curve", attach: "nearest", ends: "dot" });
    expect(path.y1).toBe(LANE_ONE.bottom);
    expect(path.y2).toBe(LANE_TWO.top + 1);
  });

  it("mirrors that where the next stop lies above", () => {
    const path = dependencyPath(view, move, fromSecond, above, { route: "curve", attach: "nearest", ends: "dot" });
    expect(path.y1).toBe(LANE_ONE.top + 1);
    expect(path.y2).toBe(LANE_ZERO.bottom);
  });

  it("touches the bar at both ends, never a pixel beside it", () => {
    const path = dependencyPath(view, move, fromSecond, below, { route: "straight", attach: "nearest", ends: "dot" });
    expect(path.y1).toBeGreaterThanOrEqual(LANE_ONE.top);
    expect(path.y1).toBeLessThanOrEqual(LANE_ONE.bottom);
    expect(path.y2).toBeGreaterThanOrEqual(LANE_TWO.top);
    expect(path.y2).toBeLessThanOrEqual(LANE_TWO.bottom);
  });

  it("keeps to the middle within one lane, where there is no nearer corner", () => {
    const path = dependencyPath(view, move, fromSecond, sameLane, { route: "curve", attach: "nearest", ends: "dot" });
    expect(path.y1).toBe(LANE_ONE.middle);
    expect(path.y2).toBe(LANE_ONE.middle);
  });

  it("is shorter than the centre attach between two lanes", () => {
    const length = (points: readonly number[]) => {
      let total = 0;
      for (let i = 0; i + 3 < points.length; i += 2) {
        total += Math.hypot(points[i + 2]! - points[i]!, points[i + 3]! - points[i + 1]!);
      }
      return total;
    };
    const centre = dependencyPath(view, move, fromSecond, below, { route: "straight", attach: "centre", ends: "dot" });
    const nearest = dependencyPath(view, move, fromSecond, below, { route: "straight", attach: "nearest", ends: "dot" });
    expect(length(nearest.points)).toBeLessThan(length(centre.points));
  });
});

describe("the routes", () => {
  it("draws a straight line as its two ends and nothing between", () => {
    const path = dependencyPath(view, move, first, below, { route: "straight", attach: "centre", ends: "dot" });
    expect(path.kind).toBe("straight");
    expect(path.points).toEqual([path.x1, path.y1, path.x2, path.y2]);
  });

  it("draws an orthogonal route in axis-parallel segments", () => {
    const path = dependencyPath(view, move, first, below, { route: "orthogonal", attach: "centre", ends: "dot" });
    expect(path.kind).toBe("orthogonal");
    for (let i = 0; i + 3 < path.points.length; i += 2) {
      const horizontal = path.points[i + 1] === path.points[i + 3];
      const vertical = path.points[i] === path.points[i + 2];
      expect(horizontal || vertical).toBe(true);
    }
    expect(path.points.slice(0, 2)).toEqual([path.x1, path.y1]);
    expect(path.points.slice(-2)).toEqual([path.x2, path.y2]);
  });

  it("samples the curve into a polyline that starts and ends on its ends", () => {
    const path = dependencyPath(view, move, first, below, { route: "curve", attach: "centre", ends: "dot" });
    expect(path.kind).toBe("curve");
    expect(path.points.length).toBeGreaterThan(8);
    expect(path.points.slice(0, 2)).toEqual([path.x1, path.y1]);
    expect(path.points.slice(-2)).toEqual([path.x2, path.y2]);
  });
});

describe("the ends", () => {
  it("carry a dot unless the schedule says otherwise", () => {
    expect(dependencyPath(view, move, first, below, { route: "curve", attach: "centre", ends: "dot" }).ends).toBe("dot");
    expect(dependencyPath(view, move, first, below, { route: "curve", attach: "centre", ends: "none" }).ends).toBe("none");
  });
});

describe("a dependency of its own mind", () => {
  it("overrides the schedule's route, attach and ends", () => {
    const own: Dependency = { ...move, route: "straight", attach: "nearest", ends: "none" };
    const path = dependencyPath(view, own, fromSecond, below, { route: "curve", attach: "centre", ends: "dot" });
    expect(path.kind).toBe("straight");
    expect(path.ends).toBe("none");
    expect(path.y1).toBe(LANE_ONE.bottom);
  });
});
