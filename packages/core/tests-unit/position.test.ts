/* Popover geometry (popover-seam). Pure arithmetic on numbers: jsdom reports
   every element as zero-sized, which is why the positioning can only be
   tested here - and only for that reason can be tested at all. */

import { describe, expect, it } from "vitest";
import { computePosition } from "../src/components/Popover/position";

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
