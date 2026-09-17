/* How a transport is drawn: the route between its two ends and where on the
   bars those ends sit (schedule-legibility 04).

   The route decides the shape, the anchor decides the corner - and neither
   decides whether the transport is late: that is what `leaves` and `arrives`
   are for, and these tests never touch them. */

import { describe, expect, it } from "vitest";
import { LinearScale } from "@umriss-ui/charts";
import { subtaskBox, transportPath } from "../src/geometry";
import type { Viewport } from "../src/geometry";
import type { Subtask, Transport } from "../src/model";

const MIN = 60_000;
const at = (minutes: number) => Date.UTC(2026, 2, 17, 6, 0) + minutes * MIN;

/* Ten pixels to the minute, four lanes of forty. */
const view: Viewport = {
  scale: new LinearScale([at(0), at(100)], [0, 1000]),
  calendar: [],
  laneHeight: 40,
  scrollY: 0,
};

const subtask = (id: string, lane: string, from: number, to: number): Subtask => ({
  id,
  task: "t",
  lane,
  from: at(from),
  to: at(to),
});

const first = subtaskBox(view, subtask("a", "one", 0, 20), 0, 0);
const below = subtaskBox(view, subtask("b", "three", 40, 60), 2, 0);
const above = subtaskBox(view, subtask("c", "one", 40, 60), 0, 0);
const sameLane = subtaskBox(view, subtask("d", "two", 40, 60), 1, 0);
const fromSecond = subtaskBox(view, subtask("e", "two", 0, 20), 1, 0);

const move: Transport = { id: "x", from: "a", to: "b", duration: 5 * MIN };

const middle = (box: { y: number; height: number }) => Math.round(box.y + box.height / 2);

describe("the centre anchor", () => {
  it("leaves and arrives at the middle of both bars", () => {
    const path = transportPath(view, move, fromSecond, below, { route: "curve", anchor: "centre", ends: "dot" });
    expect(path.y1).toBe(middle(fromSecond));
    expect(path.y2).toBe(middle(below));
  });
});

describe("the nearest anchor", () => {
  it("leaves at the bottom edge and arrives at the top edge where the next stop lies below", () => {
    const path = transportPath(view, move, fromSecond, below, { route: "curve", anchor: "nearest", ends: "dot" });
    expect(path.y1).toBe(Math.round(fromSecond.y + fromSecond.height));
    expect(path.y2).toBe(Math.round(below.y));
  });

  it("mirrors that where the next stop lies above", () => {
    const path = transportPath(view, move, fromSecond, above, { route: "curve", anchor: "nearest", ends: "dot" });
    expect(path.y1).toBe(Math.round(fromSecond.y));
    expect(path.y2).toBe(Math.round(above.y + above.height));
  });

  it("keeps to the middle within one lane, where there is no nearer corner", () => {
    const path = transportPath(view, move, fromSecond, sameLane, { route: "curve", anchor: "nearest", ends: "dot" });
    expect(path.y1).toBe(middle(fromSecond));
    expect(path.y2).toBe(middle(sameLane));
  });

  it("is shorter than the centre anchor between two lanes", () => {
    const length = (points: readonly number[]) => {
      let total = 0;
      for (let i = 0; i + 3 < points.length; i += 2) {
        total += Math.hypot(points[i + 2]! - points[i]!, points[i + 3]! - points[i + 1]!);
      }
      return total;
    };
    const centre = transportPath(view, move, fromSecond, below, { route: "straight", anchor: "centre", ends: "dot" });
    const nearest = transportPath(view, move, fromSecond, below, { route: "straight", anchor: "nearest", ends: "dot" });
    expect(length(nearest.points)).toBeLessThan(length(centre.points));
  });
});

describe("the routes", () => {
  it("draws a straight line as its two ends and nothing between", () => {
    const path = transportPath(view, move, first, below, { route: "straight", anchor: "centre", ends: "dot" });
    expect(path.kind).toBe("straight");
    expect(path.points).toEqual([path.x1, path.y1, path.x2, path.y2]);
  });

  it("draws an orthogonal route in axis-parallel segments", () => {
    const path = transportPath(view, move, first, below, { route: "orthogonal", anchor: "centre", ends: "dot" });
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
    const path = transportPath(view, move, first, below, { route: "curve", anchor: "centre", ends: "dot" });
    expect(path.kind).toBe("curve");
    expect(path.points.length).toBeGreaterThan(8);
    expect(path.points.slice(0, 2)).toEqual([path.x1, path.y1]);
    expect(path.points.slice(-2)).toEqual([path.x2, path.y2]);
  });
});

describe("the ends", () => {
  it("carry a dot unless the schedule says otherwise", () => {
    expect(transportPath(view, move, first, below, { route: "curve", anchor: "centre", ends: "dot" }).ends).toBe("dot");
    expect(transportPath(view, move, first, below, { route: "curve", anchor: "centre", ends: "none" }).ends).toBe("none");
  });
});

describe("a transport of its own mind", () => {
  it("overrides the schedule's route, anchor and ends", () => {
    const own: Transport = { ...move, route: "straight", anchor: "nearest", ends: "none" };
    const path = transportPath(view, own, fromSecond, below, { route: "curve", anchor: "centre", ends: "dot" });
    expect(path.kind).toBe("straight");
    expect(path.ends).toBe("none");
    expect(path.y1).toBe(Math.round(fromSecond.y + fromSecond.height));
  });
});
