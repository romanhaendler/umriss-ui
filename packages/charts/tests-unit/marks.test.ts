/* charts-alternatives 02 (C3): the marks a palette place gives a series - the
   pure mapping, and the geometry the canvas and the legend draw from it. */

import { describe, expect, it } from "vitest";
import { hatchFor, hatchLines, markerPath, marksFor, stateHatches, type PathSink } from "../src/marks";

describe("The marks of a palette place", () => {
  it("leaves the first place plain: solid, a circle, no hatch", () => {
    expect(marksFor(0)).toEqual({ dash: [], marker: "circle", hatch: "none" });
  });

  it("gives each of the six places its own dash, marker and hatch", () => {
    const six = [0, 1, 2, 3, 4, 5].map(marksFor);
    expect(new Set(six.map((m) => m.dash.join(","))).size).toBe(6);
    expect(new Set(six.map((m) => m.marker)).size).toBe(6);
    expect(new Set(six.map((m) => m.hatch)).size).toBe(6);
  });

  it("names them in the palette's order", () => {
    expect([0, 1, 2, 3, 4, 5].map((s) => marksFor(s).marker)).toEqual([
      "circle",
      "square",
      "triangle",
      "diamond",
      "triangleDown",
      "plus",
    ]);
    expect(marksFor(1).dash).toEqual([7, 4]);
    expect(marksFor(2).dash).toEqual([1, 4]);
  });

  it("cycles as the palette's six colours do", () => {
    expect(marksFor(6)).toEqual(marksFor(0));
    expect(marksFor(13)).toEqual(marksFor(1));
  });

  it("hatches states and cells by their index, the first plain", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(hatchFor)).toEqual([
      "none",
      "rising",
      "falling",
      "horizontal",
      "vertical",
      "crossed",
      "none",
    ]);
  });
});

/* charts-alternatives 04: a state is hatched by its name, so two bands that
   list one state at different places hatch it alike - and the legend, which
   shows it once, agrees with both. */
describe("The hatch of a state", () => {
  it("follows the name, in the order the names first come", () => {
    const hatches = stateHatches([
      [{ label: "Running" }, { label: "Fault" }],
      [{ label: "Setup" }, { label: "Fault" }, { label: "Running" }],
    ]);
    expect(hatches.get("Running")).toBe("none");
    expect(hatches.get("Fault")).toBe("rising");
    expect(hatches.get("Setup")).toBe("falling");
  });

  it("is the index hatch for a single band", () => {
    const states = ["A", "B", "C", "D", "E", "F", "G"].map((label) => ({ label }));
    const hatches = stateHatches([states]);
    expect(states.map((z) => hatches.get(z.label))).toEqual(states.map((_, k) => hatchFor(k)));
  });
});

/** Segments as [x1, y1, x2, y2] tuples. */
function segments(flat: number[]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < flat.length; i += 4) out.push(flat.slice(i, i + 4));
  return out;
}

describe("The lines of a hatch", () => {
  const box = { x: 0, y: 0, width: 12, height: 6 };

  it("draws nothing for none", () => {
    expect(hatchLines(box, "none", 3)).toEqual([]);
  });

  it("lays horizontal and vertical lines on a grid of the plane", () => {
    expect(segments(hatchLines(box, "horizontal", 3))).toEqual([
      [0, 0, 12, 0],
      [0, 3, 12, 3],
      [0, 6, 12, 6],
    ]);
    expect(segments(hatchLines({ x: 1, y: 0, width: 5, height: 6 }, "vertical", 3))).toEqual([
      [3, 0, 3, 6],
      [6, 0, 6, 6],
    ]);
  });

  it("rises from lower left to upper right, one line per spacing along the diagonal", () => {
    const lines = segments(hatchLines(box, "rising", 6));
    for (const [x1, y1, x2, y2] of lines) {
      expect(y1).toBe(6);
      expect(y2).toBe(0);
      expect((x2 as number) - (x1 as number)).toBe(6); // 45°
    }
    // c = x + y from 0 to 18: four lines.
    expect(lines).toHaveLength(4);
  });

  it("falls the other way, and crosses both", () => {
    for (const [x1, y1, x2, y2] of segments(hatchLines(box, "falling", 6))) {
      expect(y1).toBe(0);
      expect(y2).toBe(6);
      expect((x2 as number) - (x1 as number)).toBe(6);
    }
    expect(hatchLines(box, "crossed", 6)).toHaveLength(hatchLines(box, "rising", 6).length + hatchLines(box, "falling", 6).length);
  });

  it("continues across two neighbouring boxes", () => {
    const left = segments(hatchLines({ x: 0, y: 0, width: 6, height: 6 }, "vertical", 3)).map((s) => s[0]);
    const right = segments(hatchLines({ x: 6, y: 0, width: 6, height: 6 }, "vertical", 3)).map((s) => s[0]);
    expect([...left, ...right]).toEqual([0, 3, 6, 6, 9, 12]);
  });
});

describe("A marker's path", () => {
  function record(shape: Parameters<typeof markerPath>[1]): string[] {
    const calls: string[] = [];
    const sink: PathSink = {
      moveTo: () => calls.push("M"),
      lineTo: () => calls.push("L"),
      arc: () => calls.push("A"),
      closePath: () => calls.push("Z"),
    };
    markerPath(sink, shape, 10, 10, 3);
    return calls;
  }

  it("is one closed sub-path per shape, so a series stays one fill", () => {
    expect(record("circle")).toEqual(["M", "A"]);
    expect(record("square")).toEqual(["M", "L", "L", "L", "Z"]);
    expect(record("triangle")).toEqual(["M", "L", "L", "Z"]);
    expect(record("diamond")).toEqual(["M", "L", "L", "L", "Z"]);
    expect(record("plus").filter((c) => c === "L")).toHaveLength(11);
  });
});
