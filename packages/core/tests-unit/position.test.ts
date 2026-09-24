/* Popover geometry (popover-seam). Pure arithmetic on numbers: jsdom reports
   every element as zero-sized, which is why the positioning can only be
   tested here - and only for that reason can be tested at all. */

import { describe, expect, it } from "vitest";
import { computePosition, motionOrigin } from "../src/components/Popover/position";
import type { Align, Side } from "../src/components/Popover/position";

const VIEWPORT = { width: 1000, height: 800 };
const anchor = (left: number, top: number, width = 120, height = 32) => ({
  left,
  top,
  right: left + width,
  bottom: top + height,
  width,
  height,
});

describe("computePosition – horizontal", () => {
  it("puts the panel flush left below the anchor", () => {
    const pos = computePosition(anchor(200, 100), { width: 300, height: 200 }, VIEWPORT);
    expect(pos.left).toBe(200);
    expect(pos.top).toBe(100 + 32 + 6);
    expect(pos.flipped).toBe(false);
  });

  it("clamps at the right edge instead of sticking out", () => {
    // Anchor far to the right: 900 + 300 = 1200 > 1000.
    const pos = computePosition(anchor(900, 100), { width: 300, height: 200 }, VIEWPORT);
    expect(pos.left).toBe(VIEWPORT.width - 300 - 8);
  });

  it("clamps at the left edge", () => {
    const pos = computePosition(anchor(-50, 100), { width: 300, height: 200 }, VIEWPORT);
    expect(pos.left).toBe(8);
  });

  it("puts a panel wider than the viewport against the left edge", () => {
    const pos = computePosition(anchor(200, 100), { width: 1200, height: 200 }, VIEWPORT);
    expect(pos.left).toBe(8);
  });

  it("aligns to the right anchor edge on request", () => {
    const pos = computePosition(anchor(500, 100), { width: 300, height: 200 }, VIEWPORT, { align: "end" });
    // right anchor edge 620, panel 300 wide -> 320
    expect(pos.left).toBe(320);
  });
});

describe("computePosition – vertical", () => {
  it("flips upwards when there is too little room below and enough above", () => {
    // Anchor low down: bottom 700, 100px below it; the panel needs 300.
    const pos = computePosition(anchor(200, 668), { width: 300, height: 300 }, VIEWPORT);
    expect(pos.flipped).toBe(true);
    expect(pos.top).toBe(668 - 6 - 300);
  });

  it("does not flip when there is enough room below", () => {
    const pos = computePosition(anchor(200, 100), { width: 300, height: 300 }, VIEWPORT);
    expect(pos.flipped).toBe(false);
  });

  /* Where it fits neither below nor above, it stays below: flipping upwards
     would only cut the panel off at the other edge. */
  it("stays below when it fits nowhere", () => {
    const pos = computePosition(anchor(200, 300), { width: 300, height: 900 }, VIEWPORT);
    expect(pos.flipped).toBe(false);
  });

  it("is pulled into the window when it fits on neither side", () => {
    // 500 high: 262 below the anchor, 294 above it - neither is enough.
    const pos = computePosition(anchor(200, 300), { width: 300, height: 500 }, VIEWPORT);
    expect(pos.top).toBe(800 - 500 - 8);
    // Taller than the window: the top edge stays in it.
    expect(computePosition(anchor(200, 300), { width: 300, height: 900 }, VIEWPORT).top).toBe(8);
  });

  it("takes the measured panel height seriously", () => {
    const tight = computePosition(anchor(200, 600), { width: 300, height: 150 }, VIEWPORT);
    const tall = computePosition(anchor(200, 600), { width: 300, height: 400 }, VIEWPORT);
    expect(tight.flipped).toBe(false);
    expect(tall.flipped).toBe(true);
  });
});

describe("computePosition – centred alignment", () => {
  it("centres the panel over the middle of the anchor", () => {
    // Anchor 200..320, middle 260; panel 100 wide -> 210.
    const pos = computePosition(anchor(200, 100), { width: 100, height: 40 }, VIEWPORT, { align: "center" });
    expect(pos.left).toBe(210);
  });

  it("clamps at the edge when centred too", () => {
    const right = computePosition(anchor(960, 100, 40), { width: 200, height: 40 }, VIEWPORT, { align: "center" });
    expect(right.left).toBe(VIEWPORT.width - 200 - 8);
    const left = computePosition(anchor(0, 100, 40), { width: 200, height: 40 }, VIEWPORT, { align: "center" });
    expect(left.left).toBe(8);
  });
});

describe("computePosition – preferred side", () => {
  it("puts the panel above the anchor on request", () => {
    const pos = computePosition(anchor(200, 300), { width: 100, height: 40 }, VIEWPORT, { side: "top" });
    expect(pos.top).toBe(300 - 6 - 40);
    expect(pos.flipped).toBe(false);
  });

  it("flips from above to below when there is no room above", () => {
    const pos = computePosition(anchor(200, 10), { width: 100, height: 40 }, VIEWPORT, { side: "top" });
    expect(pos.flipped).toBe(true);
    expect(pos.top).toBe(10 + 32 + 6);
  });

  it("stays above when it fits neither above nor below", () => {
    const pos = computePosition(anchor(200, 10), { width: 100, height: 900 }, VIEWPORT, { side: "top" });
    expect(pos.flipped).toBe(false);
  });
});

/* On a phone the visible part of the page is not the window: a pinch or the
   zoom into a small field moves it, and the on-screen keyboard shortens it
   (the visual viewport). Anchor and panel still count from the window's corner
   (the layout viewport); the visible rectangle carries its offset in `top` and
   `left`. */
describe("computePosition – visible part of the window", () => {
  // 390 × 400 visible, scrolled 300 down and 40 across inside the window.
  const VISIBLE = { top: 300, left: 40, width: 390, height: 400 };

  it("does not flip when there is room below inside the visible part", () => {
    const pos = computePosition(anchor(60, 350), { width: 300, height: 200 }, VISIBLE);
    expect(pos.flipped).toBe(false);
    expect(pos.top).toBe(350 + 32 + 6);
  });

  it("flips when the keyboard covers the room below", () => {
    const pos = computePosition(anchor(60, 600), { width: 300, height: 200 }, VISIBLE);
    expect(pos.flipped).toBe(true);
    expect(pos.top).toBe(600 - 6 - 200);
  });

  it("clamps to the visible edges, not to the window's", () => {
    expect(computePosition(anchor(20, 350), { width: 300, height: 200 }, VISIBLE).left).toBe(40 + 8);
    expect(computePosition(anchor(300, 350), { width: 300, height: 200 }, VISIBLE).left).toBe(40 + 390 - 300 - 8);
  });

  it("pulls a panel that fits nowhere into the visible part", () => {
    const pos = computePosition(anchor(60, 450), { width: 300, height: 300 }, VISIBLE);
    expect(pos.top).toBe(300 + 400 - 300 - 8);
  });
});

/* The motion origin (visuelle-wertigkeit 02): the point a panel grows out of,
   as the stylesheet's `transform-origin`. Checked are properties of the
   mapping, not its formula. */
describe("motionOrigin", () => {
  const SIDES: Side[] = ["top", "bottom"];
  const ALIGNS: Align[] = ["start", "center", "end"];
  const combinations = SIDES.flatMap((side) => ALIGNS.map((align) => [side, align] as const));

  it("lies on the edge opposite the panel: a panel below its anchor grows from its top", () => {
    for (const align of ALIGNS) {
      expect(motionOrigin("bottom", align).split(" ")[1]).toBe("top");
      expect(motionOrigin("top", align).split(" ")[1]).toBe("bottom");
    }
  });

  it("follows the alignment across", () => {
    for (const side of SIDES) {
      expect(motionOrigin(side, "start").split(" ")[0]).toBe("left");
      expect(motionOrigin(side, "center").split(" ")[0]).toBe("center");
      expect(motionOrigin(side, "end").split(" ")[0]).toBe("right");
    }
  });

  it("yields a valid transform-origin for every combination, and a different one each", () => {
    for (const [side, align] of combinations) {
      expect(motionOrigin(side, align)).toMatch(/^(left|center|right) (top|bottom)$/);
    }
    expect(new Set(combinations.map(([side, align]) => motionOrigin(side, align))).size).toBe(combinations.length);
  });

  it("reads the side the position took, so a flipped panel grows from its bottom", () => {
    const up = computePosition(anchor(200, 700), { width: 300, height: 200 }, VIEWPORT);
    expect(up.side).toBe("top");
    expect(motionOrigin(up.side, "start")).toBe("left bottom");
    const down = computePosition(anchor(200, 100), { width: 300, height: 200 }, VIEWPORT, { side: "top" });
    expect(down.side).toBe("bottom");
    expect(motionOrigin(down.side, "end")).toBe("right top");
  });
});
