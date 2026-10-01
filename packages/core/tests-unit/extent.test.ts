/* `chars` as a field's width (control-sizes 02, ADR-0041): the pure half -
   which count reaches the stylesheet, and when the field is fixed to it. What
   the count does in a real layout stands in the browser suite
   (features-widths.spec.ts). */

import { describe, expect, it } from "vitest";
import { extentStyle } from "../src/lib/extent";

describe("extentStyle", () => {
  it("says nothing without a count: the field fills its place, and its natural width is the stylesheet's", () => {
    expect(extentStyle(undefined)).toBeUndefined();
  });

  it("fixes the field to its own natural width at the count", () => {
    expect(extentStyle(5)).toEqual({ "--_chars": 5, inlineSize: "fit-content" });
  });

  it("rounds a fraction - a field holds whole characters", () => {
    expect(extentStyle(7.6)).toEqual({ "--_chars": 8, inlineSize: "fit-content" });
  });

  it("holds at least one character", () => {
    expect(extentStyle(0)).toEqual({ "--_chars": 1, inlineSize: "fit-content" });
    expect(extentStyle(-3)).toEqual({ "--_chars": 1, inlineSize: "fit-content" });
  });

  it("ignores what is no count, rather than drawing a field of no width", () => {
    expect(extentStyle(Number.NaN)).toBeUndefined();
    expect(extentStyle(Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  it("takes a natural count of the field's own - a date picker's is its format's length - without fixing the field", () => {
    expect(extentStyle(undefined, { natural: 10 })).toEqual({ "--_chars": 10 });
    expect(extentStyle(4, { natural: 10 })).toEqual({ "--_chars": 4, inlineSize: "fit-content" });
  });

  it("adds what a field shows beside its value - a number's prefix and suffix - given a count or not", () => {
    expect(extentStyle(undefined, { extra: 3 })).toEqual({ "--_extra": 3 });
    expect(extentStyle(10, { extra: 3 })).toEqual({ "--_chars": 10, "--_extra": 3, inlineSize: "fit-content" });
    expect(extentStyle(undefined, { extra: 0 })).toBeUndefined();
  });
});
