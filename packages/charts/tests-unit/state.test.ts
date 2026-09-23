/* State band geometry.
   A state band is a partition: every segment ends where the next begins, and the
   last one runs to the end of the domain. The arithmetic behind it is small, but it
   answers a different question from nearestIndex - and that is exactly why it
   stands here and is not used from there. */

import { describe, expect, it } from "vitest";
import { lastSegmentEnd, medianStep, segmentEnd, segmentIndex } from "../src/state";
import { nearestIndex } from "../src/hit";

function x(...values: number[]): Float64Array {
  return Float64Array.from(values);
}

describe("segmentIndex - which segment contains the target", () => {
  it("yields that segment in the right half of a segment", () => {
    // The whole reason nearestIndex is not reused here: in the right half the
    // nearest point is the one at which the FOLLOWING segment begins - and its
    // state does not hold yet here.
    const values = x(0, 10, 20, 30);
    expect(segmentIndex(values, 4, 19)).toBe(1);
    expect(segmentIndex(values, 4, 19.999)).toBe(1);
    expect(nearestIndex(values, 4, 19)).toBe(2); // the wrong answer
  });

  it("yields the same segment in the left half and in the middle", () => {
    const values = x(0, 10, 20, 30);
    expect(segmentIndex(values, 4, 11)).toBe(1);
    expect(segmentIndex(values, 4, 15)).toBe(1);
  });

  it("counts a boundary to the segment that begins there", () => {
    // Not to the one that ends there: the new state holds from its own x value,
    // otherwise the switching point would be shifted by one segment.
    const values = x(0, 10, 20, 30);
    expect(segmentIndex(values, 4, 10)).toBe(1);
    expect(segmentIndex(values, 4, 20)).toBe(2);
    expect(segmentIndex(values, 4, 0)).toBe(0);
  });

  it("reports nothing before the first point", () => {
    // Before the first point no state is known, and an unknown state is no
    // statement about the interval.
    const values = x(0, 10, 20);
    expect(segmentIndex(values, 3, -0.001)).toBe(-1);
    expect(segmentIndex(values, 3, -100)).toBe(-1);
  });

  it("reports the last segment beyond the last point", () => {
    // The last segment runs to the end of the domain; it is the current state, and
    // that is read first.
    const values = x(0, 10, 20);
    expect(segmentIndex(values, 3, 20)).toBe(2);
    expect(segmentIndex(values, 3, 1e9)).toBe(2);
  });

  it("copes with one point and with none", () => {
    expect(segmentIndex(x(7), 1, 7)).toBe(0);
    expect(segmentIndex(x(7), 1, 1000)).toBe(0);
    expect(segmentIndex(x(7), 1, 6.999)).toBe(-1);
    expect(segmentIndex(new Float64Array(0), 0, 5)).toBe(-1);
  });

  it("takes the segment beginning last at duplicate x values", () => {
    // Two segments at the same place: the first has length zero and is superseded
    // at once, so the later one holds.
    const values = x(0, 10, 10, 20);
    expect(segmentIndex(values, 4, 10)).toBe(2);
    expect(segmentIndex(values, 4, 15)).toBe(2);
  });

  it("works correctly on large arrays too", () => {
    const large = new Float64Array(100_000);
    for (let i = 0; i < large.length; i++) large[i] = i * 0.5;
    expect(segmentIndex(large, large.length, 12_345.4)).toBe(24_690);
    expect(segmentIndex(large, large.length, 12_345.5)).toBe(24_691);
  });
});

describe("segmentEnd - where a segment stops", () => {
  it("ends at the x value of the next point", () => {
    // The partition: no interstice, every end is the next beginning.
    const values = x(0, 10, 20);
    expect(segmentEnd(values, 3, 0, 100)).toBe(10);
    expect(segmentEnd(values, 3, 1, 100)).toBe(20);
  });

  it("lets the last segment run to the end of the domain", () => {
    // Leaving it out would lose the current state - the one read first.
    const values = x(0, 10, 20);
    expect(segmentEnd(values, 3, 2, 100)).toBe(100);
  });

  it("gives a single point a segment to the end of the domain", () => {
    expect(segmentEnd(x(7), 1, 0, 42)).toBe(42);
  });

  it("covers the whole domain without a gap together with segmentIndex", () => {
    const values = x(0, 10, 20);
    for (let i = 0; i < 2; i++) {
      expect(segmentEnd(values, 3, i, 100)).toBe(values[i + 1] as number);
    }
    // Every boundary belongs to the segment that begins there: the end of one is
    // the beginning of the next, and between them lies nothing.
    expect(segmentIndex(values, 3, segmentEnd(values, 3, 0, 100))).toBe(1);
  });
});

describe("Gaps", () => {
  it("reports the segment of the gap, not the one before it", () => {
    // The gap is NaN in the state channel, not in the x channel: the segment
    // exists, it is only that nothing is known about it. Whoever tests the channel
    // reports a gap as a gap - and does not fall back on the state before it,
    // because that would be a claim about an interval about which nothing is
    // known.
    const values = x(0, 10, 20);
    const states = Float64Array.from([1, NaN, 2]);
    const i = segmentIndex(values, 3, 15);
    expect(i).toBe(1);
    expect(Number.isNaN(states[i] as number)).toBe(true);
  });

  it("leaves the segments on either side of the gap untouched", () => {
    const values = x(0, 10, 20);
    expect(segmentIndex(values, 3, 5)).toBe(0);
    expect(segmentIndex(values, 3, 25)).toBe(2);
  });
});

/* charts-review, finding 16: the last segment ran to the end of the padded
   domain - a state claimed for a time nobody reported, and none at all under
   `domain="data"`. It ends at the latest x of the chart's data; where that is
   the band's own last point, one median step after it; never beyond the
   domain. */
describe("lastSegmentEnd - where the last state stops", () => {
  it("ends at the latest x of the chart's data", () => {
    expect(lastSegmentEnd(x(0, 10, 20), 3, 27, 10, 100)).toBe(27);
  });

  it("runs one step past the band's own last point where that is the latest", () => {
    expect(lastSegmentEnd(x(0, 10, 20), 3, 20, 10, 100)).toBe(30);
  });

  it("never runs beyond the domain", () => {
    expect(lastSegmentEnd(x(0, 10, 20), 3, 20, 10, 25)).toBe(25);
    expect(lastSegmentEnd(x(0, 10, 20), 3, 90, 10, 50)).toBe(50);
  });

  it("gives a single point the domain, having no step", () => {
    expect(lastSegmentEnd(x(7), 1, 7, 0, 42)).toBe(42);
  });
});

describe("medianStep - the band's own rhythm", () => {
  it("takes the median of the distances, not the smallest", () => {
    expect(medianStep(x(0, 1, 11, 21, 31), 5)).toBe(10);
  });

  it("is 0 where there is no distance", () => {
    expect(medianStep(x(7), 1)).toBe(0);
    expect(medianStep(x(3, 3), 2)).toBe(0);
  });
});
