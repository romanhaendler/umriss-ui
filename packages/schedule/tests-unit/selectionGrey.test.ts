/* The selection greys the work the planner is not working with (schedule-
   selection-emphasis 01): towards the grey of the colour's OWN lightness, never
   towards the surface, which is `muted`'s channel. */

import { describe, expect, it } from "vitest";
import { towardsGrey, workColour, type Colours } from "../src/sceneDraw";

/** The relative luminance, as WCAG defines it - what "lightness" means here. */
function luminance(colour: string): number {
  const [r, g, b] = colour.match(/[\d.]+/g)!.map((v) => {
    const c = Number(v) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const channels = (colour: string) => colour.match(/[\d.]+/g)!.map(Number);

describe("towardsGrey", () => {
  const blue = "rgb(37, 99, 235)";

  it("leaves the colour as it is at none of the way", () => {
    expect(channels(towardsGrey(blue, 0))).toEqual([37, 99, 235]);
  });

  it("is a grey all the way, of the colour's own lightness", () => {
    const [r, g, b] = channels(towardsGrey(blue, 1));
    expect(r).toBe(g);
    expect(g).toBe(b);
    expect(luminance(towardsGrey(blue, 1))).toBeCloseTo(luminance(blue), 2);
  });

  it("keeps the lightness halfway, and lies between the two", () => {
    const half = towardsGrey(blue, 0.5);
    expect(luminance(half)).toBeCloseTo(luminance(blue), 2);
    const [r, , b] = channels(half);
    const [gr, , gb] = channels(towardsGrey(blue, 1));
    expect(r).toBeGreaterThan(37);
    expect(r).toBeLessThan(gr!);
    expect(b).toBeLessThan(235);
    expect(b).toBeGreaterThan(gb!);
  });
});

describe("workColour", () => {
  const colours = {
    muted: "rgb(120, 120, 120)",
    tasks: new Map([
      ["a", "rgb(37, 99, 235)"],
      ["b", "rgb(220, 38, 38)"],
    ]),
    forced: false,
  } as unknown as Colours;
  const full = "rgb(37, 99, 235)";

  it("is the task colour while nothing is selected", () => {
    expect(workColour(colours, { selectedTask: null, selectedSubtask: null }, "a", "a1")).toBe(full);
  });

  it("keeps the selected subtask in full, its siblings halfway, the rest grey", () => {
    const selection = { selectedTask: "a", selectedSubtask: "a1" };
    expect(workColour(colours, selection, "a", "a1")).toBe(full);
    expect(workColour(colours, selection, "a", "a2")).toBe(towardsGrey(full, 0.5));
    expect(workColour(colours, selection, "b", "b1")).toBe(towardsGrey("rgb(220, 38, 38)", 1));
  });

  it("keeps a task selected by its dependency in full throughout", () => {
    const selection = { selectedTask: "a", selectedSubtask: null };
    expect(workColour(colours, selection, "a", "a2")).toBe(full);
    expect(workColour(colours, selection, "a", null)).toBe(full);
  });

  it("gives the selected task's dependencies its full colour", () => {
    expect(workColour(colours, { selectedTask: "a", selectedSubtask: "a1" }, "a", null)).toBe(full);
  });

  it("paints the selection in the text colour and the rest in GrayText under forced colours", () => {
    const forced = { ...colours, muted: "GrayText", tasks: new Map([["a", "CanvasText"], ["b", "CanvasText"]]), forced: true } as Colours;
    const selection = { selectedTask: "a", selectedSubtask: "a1" };
    expect(workColour(forced, selection, "a", "a2")).toBe("CanvasText");
    expect(workColour(forced, selection, "b", "b1")).toBe("GrayText");
  });
});
