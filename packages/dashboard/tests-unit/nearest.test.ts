import { describe, expect, it } from "vitest";
import { nearestPlace } from "../src/pack";

describe("nearestPlace", () => {
  /* Three small widgets (3x2) in twelve columns: the cells are 100 wide, 50
     high, the gap 10, so places 0, 1, 2 start at x 0, 330, 660. */
  const geometry = { cell: 100, unit: 50, gap: 10 };
  const spans = [{ columns: 3, rows: 2 }, { columns: 3, rows: 2 }, { columns: 3, rows: 2 }];
  const near = (index: number, x: number, y: number) => nearestPlace(spans, 12, index, x, y, geometry);

  it("keeps a widget held at its own corner where it is", () => {
    expect(near(1, 330, 0)).toBe(1);
  });

  it("takes the place whose corner is nearest to where the widget is held", () => {
    expect(near(0, 700, 0)).toBe(2);
    expect(near(2, -50, 0)).toBe(0);
  });

  it("answers from the pointer alone: the same point gives the same place from any widget's start", () => {
    expect(near(0, 330, 0)).toBe(1);
    expect(near(2, 330, 0)).toBe(1);
  });

  it("takes the last place when held below everything", () => {
    const halves = [{ columns: 6, rows: 2 }, { columns: 6, rows: 2 }, { columns: 6, rows: 2 }];
    expect(nearestPlace(halves, 12, 0, 0, 900, geometry)).toBe(2);
  });
});
