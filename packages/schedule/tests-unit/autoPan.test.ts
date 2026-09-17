/* Auto-pan: how fast the plot pans along while a drag is near its edge
   (schedule-refinement 02). Pixels per frame along one axis, from the pointer's
   position on that axis and the plot's size on it. */

import { describe, expect, it } from "vitest";
import { AUTO_PAN_MAX, AUTO_PAN_ZONE, autoPanSpeed } from "../src/autoPan";

describe("autoPanSpeed", () => {
  it("does not pan away from the edges", () => {
    expect(autoPanSpeed(400, 800)).toBe(0);
    expect(autoPanSpeed(AUTO_PAN_ZONE, 800)).toBe(0);
    expect(autoPanSpeed(800 - AUTO_PAN_ZONE, 800)).toBe(0);
  });

  it("pans backwards near the start and forwards near the end", () => {
    expect(autoPanSpeed(AUTO_PAN_ZONE / 2, 800)).toBeLessThan(0);
    expect(autoPanSpeed(800 - AUTO_PAN_ZONE / 2, 800)).toBeGreaterThan(0);
  });

  it("speeds up toward the edge", () => {
    const far = Math.abs(autoPanSpeed(AUTO_PAN_ZONE * 0.75, 800));
    const near = Math.abs(autoPanSpeed(AUTO_PAN_ZONE * 0.25, 800));
    expect(near).toBeGreaterThan(far);
  });

  it("reaches its top speed at the edge, and keeps it beyond", () => {
    expect(autoPanSpeed(0, 800)).toBe(-AUTO_PAN_MAX);
    expect(autoPanSpeed(-50, 800)).toBe(-AUTO_PAN_MAX);
    expect(autoPanSpeed(800, 800)).toBe(AUTO_PAN_MAX);
    expect(autoPanSpeed(900, 800)).toBe(AUTO_PAN_MAX);
  });

  it("does not pan a plot too small to have a middle", () => {
    expect(autoPanSpeed(10, 0)).toBe(0);
    expect(autoPanSpeed(10, 2 * AUTO_PAN_ZONE)).toBe(0);
  });
});
