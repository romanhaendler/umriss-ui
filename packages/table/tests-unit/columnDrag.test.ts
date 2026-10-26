import { describe, expect, it } from "vitest";
import { dropPlace } from "../src/columnDrag";

/* Five entries, 20 px high, 4 px apart: tops 0, 24, 48, 72, 96. */
const boxes = [0, 1, 2, 3, 4].map((i) => ({ top: i * 24, bottom: i * 24 + 20 }));

describe("the drop place of a dragged column entry", () => {
  it("is the entry's own place while the pointer stays by it", () => {
    expect(dropPlace(boxes, 82, 3, 0, 4)).toBe(3);
  });

  it("moves up past the midpoints it crosses", () => {
    expect(dropPlace(boxes, 30, 3, 0, 4)).toBe(1);
    expect(dropPlace(boxes, 36,3, 0, 4)).toBe(2);
  });

  it("is the first place above the first entry, the last below the last", () => {
    expect(dropPlace(boxes, -50, 3, 0, 4)).toBe(0);
    expect(dropPlace(boxes, 500, 1, 0, 4)).toBe(4);
  });

  it("stays inside the entry's block", () => {
    expect(dropPlace(boxes, -50, 3, 2, 4)).toBe(2);
    expect(dropPlace(boxes, 500, 3, 1, 3)).toBe(3);
  });
});
