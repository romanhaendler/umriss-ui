/* What a bar says besides its colour (schedule-legibility 05).

   A closed list, because a plan with twelve kinds of bar is a plan nobody can
   read. Two of them contradict - provisional work is not fixed work - and the
   rule for that is written down rather than left to the drawing order. */

import { describe, expect, it } from "vitest";
import { resolveAppearance } from "../src/appearance";

describe("resolveAppearance", () => {
  it("draws a plain bar where nothing is said", () => {
    expect(resolveAppearance(undefined)).toEqual({ dashed: false, hatched: false, muted: false, open: false });
  });

  it("dashes a provisional bar", () => {
    expect(resolveAppearance(["provisional"])).toMatchObject({ dashed: true, hatched: false });
  });

  it("hatches a fixed bar", () => {
    expect(resolveAppearance(["fixed"])).toMatchObject({ dashed: false, hatched: true });
  });

  it("lets the later of the two contradicting ones win", () => {
    expect(resolveAppearance(["provisional", "fixed"])).toMatchObject({ dashed: false, hatched: true });
    expect(resolveAppearance(["fixed", "provisional"])).toMatchObject({ dashed: true, hatched: false });
  });

  it("combines what does not contradict", () => {
    expect(resolveAppearance(["fixed", "muted", "open"])).toEqual({
      dashed: false,
      hatched: true,
      muted: true,
      open: true,
    });
  });

  it("ignores a repetition", () => {
    expect(resolveAppearance(["muted", "muted"])).toMatchObject({ muted: true });
  });
});
