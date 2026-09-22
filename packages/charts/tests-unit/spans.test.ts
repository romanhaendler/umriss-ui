/* Span geometry.
   A span has a beginning and an end of its own. Between two spans there may be
   nothing, and two spans may cover one another - a state band forbids both, and
   both are, in a schedule, the finding for whose sake somebody opens it. */

import { describe, expect, it } from "vitest";
import {
  isOpen,
  spanEnd,
  spanIndex,
  overlapDepth,
} from "../src/spans";

function f(...values: number[]): Float64Array {
  return Float64Array.from(values);
}

/** Every span in lane 0 - the lane condition has a block of its own. */
const oneLane = (n: number) => new Float64Array(n);

describe("A span is not a state band", () => {
  it("leaves a gap between two spans that stand apart", () => {
    // The proof that no partition is computed here: the first span ends at its own
    // `to` and not at the beginning of the second, and between them lies nothing -
    // no rectangle, no hit. Idle time between two jobs is a statement, and a state
    // band cannot make it.
    const from = f(0, 5);
    const to = f(2, 8);
    expect(spanEnd(to[0] as number, 100)).toBe(2);
    expect(spanEnd(to[1] as number, 100)).toBe(8);
    expect(spanIndex(from, to, oneLane(2), 2, 3, 0, 1, 100)).toBe(-1);
    expect(spanIndex(from, to, oneLane(2), 2, 4.999, 0, 1, 100)).toBe(-1);
    // And on either side of the gap there is indeed one span each.
    expect(spanIndex(from, to, oneLane(2), 2, 1, 0, 1, 100)).toBe(0);
    expect(spanIndex(from, to, oneLane(2), 2, 6, 0, 1, 100)).toBe(1);
  });
});

describe("spanEnd - where a span stops", () => {
  it("takes the given end where there is one", () => {
    expect(spanEnd(7, 100)).toBe(7);
    expect(spanEnd(-3, 100)).toBe(-3);
  });

  it("lets a span without an end run to the edge of the domain", () => {
    // A job that is still running is worth seeing; drawn with width zero it is
    // not.
    expect(spanEnd(NaN, 100)).toBe(100);
    expect(spanEnd(Number.POSITIVE_INFINITY, 100)).toBe(100);
  });
});

describe("isOpen - does the span have an end", () => {
  it("calls a span without a finite end open", () => {
    expect(isOpen(NaN)).toBe(true);
    expect(isOpen(Number.POSITIVE_INFINITY)).toBe(true);
  });

  it("calls a span with a finite end closed", () => {
    expect(isOpen(7)).toBe(false);
    expect(isOpen(0)).toBe(false);
  });
});

describe("overlapDepth - how many earlier spans lie beneath", () => {
  it("counts nothing where nothing covers anything", () => {
    const t = overlapDepth(f(0, 5), f(2, 8), 2, 100);
    expect(Array.from(t)).toEqual([0, 0]);
  });

  it("lets two spans on the same lane cover one another", () => {
    // No automatic packing into sub-lanes: packed, the double booking would look
    // like a layout decision, and it is the finding. The offset makes both
    // visible without changing the lane.
    const t = overlapDepth(f(0, 1), f(10, 9), 2, 100);
    expect(Array.from(t)).toEqual([0, 1]);
  });

  it("counts only spans registered earlier", () => {
    // The first stays in its place, however many join later - otherwise the
    // picture would jump as soon as somebody appended a job.
    const t = overlapDepth(f(0, 1, 2), f(10, 10, 10), 3, 100);
    expect(Array.from(t)).toEqual([0, 1, 2]);
  });

  it("counts only the spans that really cover one another", () => {
    // The third lies over the first, but not over the second.
    const t = overlapDepth(f(0, 50, 1), f(10, 60, 5), 3, 100);
    expect(Array.from(t)).toEqual([0, 0, 1]);
  });

  it("does not see touching at a shared edge as a covering", () => {
    // The end of the one is the beginning of the next: they abut, they do not lie
    // on top of one another.
    const t = overlapDepth(f(0, 10), f(10, 20), 2, 100);
    expect(Array.from(t)).toEqual([0, 0]);
  });

  it("counts an open span in as far as the end of the domain", () => {
    // Otherwise a job that is still running would cover nothing, although it lies
    // over everything that begins after it.
    const t = overlapDepth(f(0, 50), f(NaN, 60), 2, 100);
    expect(Array.from(t)).toEqual([0, 1]);
  });

  it("yields an empty field for no span", () => {
    expect(overlapDepth(f(), f(), 0, 100).length).toBe(0);
  });
});

describe("spanIndex - which span lies under the pointer", () => {
  it("finds the span that contains the target", () => {
    const from = f(0, 20);
    const to = f(10, 30);
    expect(spanIndex(from, to, oneLane(2), 2, 5, 0, 1, 100)).toBe(0);
    expect(spanIndex(from, to, oneLane(2), 2, 25, 0, 1, 100)).toBe(1);
  });

  it("reports the span registered last under a covering", () => {
    // The written rule: the largest index wins. Defined, not arbitrary - and the
    // same answer on every call.
    const from = f(0, 2);
    const to = f(10, 8);
    expect(spanIndex(from, to, oneLane(2), 2, 5, 0, 1, 100)).toBe(1);
    expect(spanIndex(from, to, oneLane(2), 2, 5, 0, 1, 100)).toBe(1);
    // Outside the upper one, the lower one lies there again.
    expect(spanIndex(from, to, oneLane(2), 2, 9, 0, 1, 100)).toBe(0);
  });

  it("hits a covering span where it is drawn, moved by its depth", () => {
    // Two spans on lane 0, height 1; the second is drawn half a unit lower.
    const from = f(0, 2);
    const to = f(10, 8);
    const depth = new Int32Array([0, 1]);
    // Above the moved span only the first one is seen - and hit.
    expect(spanIndex(from, to, oneLane(2), 2, 5, 0.3, 1, 100, depth, -0.5)).toBe(0);
    // Below lane 0's own edge the moved span still lies.
    expect(spanIndex(from, to, oneLane(2), 2, 5, -0.8, 1, 100, depth, -0.5)).toBe(1);
  });

  it("counts the beginning to the span and the end no longer", () => {
    // The same boundary rule as in the state band: a boundary belongs to whatever
    // begins there. Otherwise a point would belong to two abutting spans.
    const from = f(0, 10);
    const to = f(10, 20);
    expect(spanIndex(from, to, oneLane(2), 2, 0, 0, 1, 100)).toBe(0);
    expect(spanIndex(from, to, oneLane(2), 2, 10, 0, 1, 100)).toBe(1);
    expect(spanIndex(from, to, oneLane(2), 2, 20, 0, 1, 100)).toBe(-1);
  });

  it("hits an open span as far as the end of the domain", () => {
    expect(spanIndex(f(0), f(NaN), oneLane(1), 1, 90, 0, 1, 100)).toBe(0);
    expect(spanIndex(f(0), f(NaN), oneLane(1), 1, 100, 0, 1, 100)).toBe(-1);
  });

  it("reports nothing outside every span", () => {
    const from = f(10, 30);
    const to = f(20, 40);
    expect(spanIndex(from, to, oneLane(2), 2, 0, 0, 1, 100)).toBe(-1);
    expect(spanIndex(from, to, oneLane(2), 2, 100, 0, 1, 100)).toBe(-1);
    expect(spanIndex(new Float64Array(0), new Float64Array(0), oneLane(0), 0, 5, 0, 1, 100)).toBe(-1);
  });
});

describe("Gaps, points in time and backwards running spans", () => {
  it("never draws and never hits a missing span", () => {
    // The gap is NaN - the encoding every series kind of this library uses. A NaN
    // in the beginning means: there is no span here at all.
    const from = f(0, NaN, 20);
    const to = f(10, NaN, 30);
    expect(spanIndex(from, to, oneLane(3), 3, 15, 0, 1, 100)).toBe(-1);
    expect(Array.from(overlapDepth(from, to, 3, 100))).toEqual([0, 0, 0]);
    // The neighbours stay untouched.
    expect(spanIndex(from, to, oneLane(3), 3, 5, 0, 1, 100)).toBe(0);
    expect(spanIndex(from, to, oneLane(3), 3, 25, 0, 1, 100)).toBe(2);
  });

  it("treats a span of length zero as a point in time without extent", () => {
    // Decision: it is a valid statement - an event without duration - and is not
    // reinterpreted as a gap. But it covers no interval: so it covers nothing, is
    // covered by nothing and is not hit. A hit demands extent, and building it an
    // exception would mean giving up the boundary rule in one place.
    const from = f(0, 5);
    const to = f(10, 5);
    expect(spanEnd(to[1] as number, 100)).toBe(5);
    expect(isOpen(to[1] as number)).toBe(false);
    expect(spanIndex(from, to, oneLane(2), 2, 5, 0, 1, 100)).toBe(0);
    expect(Array.from(overlapDepth(from, to, 2, 100))).toEqual([0, 0]);
  });

  it("does not turn a backwards running span around", () => {
    // Decision: that is a data error. Silently swapping it would be the wrong
    // kindness - the statement would then look right. spanEnd passes the end
    // through unchanged, so that to - from stays negative and the error is
    // visible; the interval itself is empty, so it covers nothing and is not hit.
    const from = f(20);
    const to = f(10);
    expect(spanEnd(to[0] as number, 100)).toBe(10);
    expect(spanIndex(from, to, oneLane(1), 1, 15, 0, 1, 100)).toBe(-1);
    expect(spanIndex(from, to, oneLane(1), 1, 20, 0, 1, 100)).toBe(-1);
    expect(spanIndex(from, to, oneLane(1), 1, 10, 0, 1, 100)).toBe(-1);
    const mixed = overlapDepth(f(0, 20), f(30, 10), 2, 100);
    expect(Array.from(mixed)).toEqual([0, 0]);
  });
});

describe("spanIndex - the lane belongs to the question", () => {
  it("hits only what lies in the lane under the pointer", () => {
    // Without the lane condition the span registered last would catch everything
    // lying anywhere beneath it - in a schedule with four resources that would be
    // every one of them.
    const from = f(0, 0);
    const to = f(10, 10);
    const lane = f(0, 3);
    expect(spanIndex(from, to, lane, 2, 5, 0, 1, 100)).toBe(0);
    expect(spanIndex(from, to, lane, 2, 5, 3, 1, 100)).toBe(1);
    expect(spanIndex(from, to, lane, 2, 5, 1.5, 1, 100)).toBe(-1);
  });

  it("takes half the span height upwards and downwards", () => {
    const from = f(0);
    const to = f(10);
    const lane = f(2);
    expect(spanIndex(from, to, lane, 1, 5, 2.4, 1, 100)).toBe(0);
    expect(spanIndex(from, to, lane, 1, 5, 2.6, 1, 100)).toBe(-1);
  });

  it("passes over a span without a lane", () => {
    const from = f(0);
    const to = f(10);
    const lane = f(NaN);
    expect(spanIndex(from, to, lane, 1, 5, 0, 1, 100)).toBe(-1);
  });

  it("takes the one registered last under a covering in the same lane", () => {
    const from = f(0, 5);
    const to = f(20, 25);
    const lane = f(1, 1);
    expect(spanIndex(from, to, lane, 2, 10, 1, 1, 100)).toBe(1);
  });
});
