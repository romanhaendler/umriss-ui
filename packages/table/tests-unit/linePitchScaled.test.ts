import { describe, expect, it } from "vitest";
import { layoutHeight, linePitch } from "../src/pinned";

/* A table inside a window that opens with `transform: scale(0.96)` reports
   boxes 4 % too small for as long as the animation runs. The pitch and the fit
   read layout sizes: a scaled box must give the same figure as an unscaled one,
   or each frame of the animation moves the pitch, the held height and the page. */

function row(layout: { width: number; height: number }, scale: number) {
  const tr = document.createElement("tr");
  Object.defineProperty(tr, "offsetWidth", { value: layout.width });
  tr.getBoundingClientRect = () => ({ width: layout.width * scale, height: layout.height * scale }) as DOMRect;
  return tr;
}

describe("layoutHeight", () => {
  it.each([1, 0.96, 1.5])("is the layout height under a scale of %s", (scale) => {
    expect(layoutHeight(row({ width: 600, height: 36 }, scale))).toBeCloseTo(36, 6);
  });

  it("falls back to the box where nothing is laid out", () => {
    const tr = document.createElement("tr");
    tr.getBoundingClientRect = () => ({ width: 0, height: 20 }) as DOMRect;
    expect(layoutHeight(tr)).toBe(20);
  });
});

describe("linePitch", () => {
  it("is the same in a scaled window", () => {
    const table = document.createElement("table");
    const head = table.createTHead();
    const tr = row({ width: 600, height: 36 }, 0.96);
    head.appendChild(tr);
    expect(linePitch(table)).toBeCloseTo(36, 6);
  });
});
