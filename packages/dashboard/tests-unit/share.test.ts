import { expect, it } from "vitest";
import { shareOf } from "../src/share";

it("reads a share as a fraction glyph, as twelfths without one, and not at all for the whole width", () => {
  expect(shareOf({ columns: 3, rows: 2 })).toBe("¼");
  expect(shareOf({ columns: 5, rows: 2 })).toBe("5/12");
  expect(shareOf({ columns: 12, rows: 1 })).toBe("");
});
