/* The resting places of a dock (floating-dock 01).

   Pure calculation, without a DOM: the zone arithmetic is the part of this
   component in which something is really calculated, and an edge-case error in
   it survives every test that looks for it through a rendered element and a
   synthetic pointer.

   Every expected value is worked out by hand and stands beside its calculation.
   None of them comes out of the implementation. */

import { describe, expect, it } from "vitest";
import {
  isUpright,
  stripLength,
  nearestFittingPlace,
  fits,
  placeAtPointer,
  placeForKey,
  type StripMetrics,
} from "../src/components/Dock/place";

/* The host: left 100, top 50, 800 x 400.
   The centre (500, 250), half the width 400, half the height 200. */
const HOST = { left: 100, top: 50, width: 800, height: 400 };

/* What the CSS really produces, set here by hand:
   length(n) = 2*6 + 20 + n*(8 + 32) = 32 + 40n. */
const METRICS: StripMetrics = {
  tool: 32,
  grip: 20,
  gap: 8,
  padding: 6,
  thickness: 44,
  margin: 12,
};

describe("isUpright", () => {
  it("stands the dock up at the side edges and lays it down at the horizontal ones", () => {
    expect(isUpright("left")).toBe(true);
    expect(isUpright("right")).toBe(true);
    expect(isUpright("top")).toBe(false);
    expect(isUpright("bottom")).toBe(false);
  });
});

describe("placeAtPointer - the four zones", () => {
  it("hits the edge it belongs to in the middle of every zone", () => {
    // (500, 100): dx = 0, dy = -150/200 = -0.75 -> the vertical axis, top.
    expect(placeAtPointer({ x: 500, y: 100 }, HOST)).toBe("top");
    // (500, 400): dy = +150/200 = +0.75.
    expect(placeAtPointer({ x: 500, y: 400 }, HOST)).toBe("bottom");
    // (200, 250): dx = -300/400 = -0.75, dy = 0 -> the horizontal axis, left.
    expect(placeAtPointer({ x: 200, y: 250 }, HOST)).toBe("left");
    // (800, 250): dx = +300/400 = +0.75.
    expect(placeAtPointer({ x: 800, y: 250 }, HOST)).toBe("right");
  });
});

describe("placeAtPointer - the diagonals", () => {
  /* On the diagonal |dx| and |dy| are equally large. The decision then falls on
     the lying edge - not arbitrarily, but because a lying dock has room more
     often than a standing one (hosts are as a rule wider than they are high), so
     the doubtful point falls on the place that is more likely to exist. */
  it("falls on the lying edge where both axes are equally far", () => {
    // dx = -0.5, dy = -0.5 -> x = 500-200 = 300, y = 250-100 = 150.
    expect(placeAtPointer({ x: 300, y: 150 }, HOST)).toBe("top");
    // dx = +0.5, dy = -0.5 -> (700, 150).
    expect(placeAtPointer({ x: 700, y: 150 }, HOST)).toBe("top");
    // dx = -0.5, dy = +0.5 -> (300, 350).
    expect(placeAtPointer({ x: 300, y: 350 }, HOST)).toBe("bottom");
    // dx = +0.5, dy = +0.5 -> (700, 350).
    expect(placeAtPointer({ x: 700, y: 350 }, HOST)).toBe("bottom");
  });

  it("gives the centre the resting place a dock starts with", () => {
    // dx = dy = 0. Both axes equally far, so the same rule as above - and of the
    // two lying edges the lower one, the default.
    expect(placeAtPointer({ x: 500, y: 250 }, HOST)).toBe("bottom");
  });

  it("resolves the four corners instead of leaving them to chance", () => {
    // Every corner has |dx| = |dy| = 1.
    expect(placeAtPointer({ x: 100, y: 50 }, HOST)).toBe("top");
    expect(placeAtPointer({ x: 900, y: 50 }, HOST)).toBe("top");
    expect(placeAtPointer({ x: 100, y: 450 }, HOST)).toBe("bottom");
    expect(placeAtPointer({ x: 900, y: 450 }, HOST)).toBe("bottom");
  });
});

describe("placeAtPointer - outside the host", () => {
  /* The zones are cones out of the centre and do not stop at the edge. A pointer
     that leaves the host while dragging thereby stays in the zone through which
     it has passed out - and never yields "no place". */
  it("still yields a place for every side outside", () => {
    // dx = (-500-500)/400 = -2.5, dy = 0.
    expect(placeAtPointer({ x: -500, y: 250 }, HOST)).toBe("left");
    // dx = (2000-500)/400 = +3.75.
    expect(placeAtPointer({ x: 2000, y: 250 }, HOST)).toBe("right");
    // dy = (-300-250)/200 = -2.75.
    expect(placeAtPointer({ x: 500, y: -300 }, HOST)).toBe("top");
    // dy = (1000-250)/200 = +3.75.
    expect(placeAtPointer({ x: 500, y: 1000 }, HOST)).toBe("bottom");
  });

  it("decides by the axis further away diagonally outside as well", () => {
    // dx = -2.5, dy = -2.75 -> |dy| larger, so top.
    expect(placeAtPointer({ x: -500, y: -300 }, HOST)).toBe("top");
    // dx = (2000-500)/400 = 3.75, dy = (-300-250)/200 = -2.75 -> right.
    expect(placeAtPointer({ x: 2000, y: -300 }, HOST)).toBe("right");
  });

  it("stays total even for a host without an extent", () => {
    // Without an area there are no zones; the answer is the resting place a dock
    // starts with.
    expect(placeAtPointer({ x: 0, y: 0 }, { left: 0, top: 0, width: 0, height: 400 })).toBe("bottom");
    expect(placeAtPointer({ x: 0, y: 0 }, { left: 0, top: 0, width: 800, height: 0 })).toBe("bottom");
  });
});

describe("stripLength", () => {
  it("adds up the padding, the grip, the fields and the gaps", () => {
    // 2*6 + 20 = 32.
    expect(stripLength(0, METRICS)).toBe(32);
    // 32 + 1*40 = 72.
    expect(stripLength(1, METRICS)).toBe(72);
    // 32 + 9*40 = 392.
    expect(stripLength(9, METRICS)).toBe(392);
  });
});

describe("fits", () => {
  /* Along, a standing dock has 400 - 2*12 = 376 available.
     32 + 40n <= 376  ->  n <= 8.6. Eight fits (352), nine does not (392). */
  it("names the exact number at which a standing place stops fitting", () => {
    expect(fits("left", 8, HOST, METRICS)).toBe(true);
    expect(fits("left", 9, HOST, METRICS)).toBe(false);
    expect(fits("right", 8, HOST, METRICS)).toBe(true);
    expect(fits("right", 9, HOST, METRICS)).toBe(false);
  });

  /* Lying it is 800 - 24 = 776.  32 + 40n <= 776  ->  n <= 18.6. */
  it("names the same number for the lying places", () => {
    expect(fits("bottom", 18, HOST, METRICS)).toBe(true);
    expect(fits("bottom", 19, HOST, METRICS)).toBe(false);
    expect(fits("top", 18, HOST, METRICS)).toBe(true);
    expect(fits("top", 19, HOST, METRICS)).toBe(false);
  });

  it("checks the thickness across the running direction as well", () => {
    // A host of 800 x 50: across, 50 - 24 = 26 remain, the thickness is 44.
    const flat = { left: 0, top: 0, width: 800, height: 50 };
    expect(fits("bottom", 1, flat, METRICS)).toBe(false);
    // 800 x 80: across 56 >= 44, along 776 >= 72.
    const tight = { left: 0, top: 0, width: 800, height: 80 };
    expect(fits("bottom", 1, tight, METRICS)).toBe(true);
  });
});

describe("placeForKey", () => {
  it("maps the four arrows absolutely onto the four places", () => {
    expect(placeForKey("ArrowUp")).toBe("top");
    expect(placeForKey("ArrowRight")).toBe("right");
    expect(placeForKey("ArrowDown")).toBe("bottom");
    expect(placeForKey("ArrowLeft")).toBe("left");
  });

  it("answers every other key with \"no place\"", () => {
    expect(placeForKey("Enter")).toBeUndefined();
    expect(placeForKey("a")).toBeUndefined();
    expect(placeForKey("")).toBeUndefined();
  });
});

describe("nearestFittingPlace", () => {
  it("leaves a place standing that fits", () => {
    expect(nearestFittingPlace("bottom", 8, HOST, METRICS)).toBe("bottom");
  });

  it("goes from a side edge to the nearest lying one when it becomes too short", () => {
    // Nine tools do not stand in 376. Equally far are "top" and "bottom"; the
    // decision falls in favour of the default resting place.
    expect(nearestFittingPlace("left", 9, HOST, METRICS)).toBe("bottom");
    expect(nearestFittingPlace("right", 9, HOST, METRICS)).toBe("bottom");
  });

  it("goes from a lying edge to a standing one when the host is narrow", () => {
    // 400 wide, 900 high: lying 400-24 = 376 < 392, standing 900-24 = 876.
    const narrow = { left: 0, top: 0, width: 400, height: 900 };
    expect(nearestFittingPlace("bottom", 9, narrow, METRICS)).toBe("right");
  });

  it("answers with nothing when no place fits", () => {
    const tiny = { left: 0, top: 0, width: 100, height: 100 };
    expect(nearestFittingPlace("bottom", 9, tiny, METRICS)).toBeUndefined();
  });
});
