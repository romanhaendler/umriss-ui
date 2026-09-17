/* The two calculations of the multi-line field (foundation-primitives 01).
   Both are pure so that they can be checked without a DOM: the height
   measurement itself needs a layout, the decision about what happens to the
   measured value does not. */

import { describe, expect, it } from "vitest";
import { clampedHeight, remainingChars } from "../src/components/Textarea/measure";

describe("remainingChars", () => {
  it("reports nothing where there is no limit", () => {
    expect(remainingChars("however long it is", undefined)).toBeUndefined();
  });

  it("counts down", () => {
    expect(remainingChars("abc", 10)).toBe(7);
  });

  it("reports the full limit for an empty field", () => {
    expect(remainingChars("", 10)).toBe(10);
  });

  it("reports zero where the limit is reached exactly", () => {
    expect(remainingChars("abcde", 5)).toBe(0);
  });

  it("reports a negative number where the text exceeds the limit", () => {
    /* Can happen: a value set from outside does not know maxLength. Then
       the display is meant to show that, rather than stay standing at zero
       and pretend everything is in order. */
    expect(remainingChars("abcdefg", 5)).toBe(-2);
  });

  it("counts the way the browser counts, not by written characters", () => {
    // The browser's maxLength counts UTF-16 units; an emoji is two.
    expect(remainingChars("🙂", 10)).toBe(8);
  });

  it("counts line breaks as well", () => {
    expect(remainingChars("a\nb", 10)).toBe(7);
  });
});

describe("clampedHeight", () => {
  it("gives the measured height where there is no upper bound", () => {
    expect(clampedHeight(200, 20, undefined)).toBe(200);
  });

  it("leaves the measured height below the bound untouched", () => {
    expect(clampedHeight(60, 20, 5)).toBe(60);
  });

  it("clamps to the bound", () => {
    expect(clampedHeight(400, 20, 5)).toBe(100);
  });

  it("clamps exactly on the bound, not beside it", () => {
    expect(clampedHeight(100, 20, 5)).toBe(100);
  });

  it("tolerates a line height of zero without clamping everything to zero", () => {
    /* Happens as long as the font has not been loaded yet. Were the bound
       zero then, the field would visibly collapse while loading. */
    expect(clampedHeight(200, 0, 5)).toBe(200);
  });

  it("tolerates a bound of zero like no bound at all", () => {
    expect(clampedHeight(200, 20, 0)).toBe(200);
  });
});
