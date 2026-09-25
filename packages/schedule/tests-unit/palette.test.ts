/* The canvas palette under forced colours (forced-colors 04): the selection
   colour is the active subtask's alone, the findings take the text colour -
   their dash says what they are -, and the present steps back to GrayText. */

import { describe, expect, it } from "vitest";
import { canvasTokens } from "../src/sceneDraw";

describe("the canvas palette", () => {
  it("gives the selection colour to the active subtask alone under forced colours", () => {
    const forced = canvasTokens(true);
    expect(Object.entries(forced).filter(([, colour]) => colour === "Highlight").map(([name]) => name)).toEqual(["active"]);
    expect(forced.alarm).toBe("CanvasText");
    expect(forced.now).toBe("GrayText");
  });

  it("names only system colours under forced colours, and only tokens outside them", () => {
    const system = new Set(["Canvas", "CanvasText", "GrayText", "Highlight"]);
    expect(Object.values(canvasTokens(true)).every((colour) => system.has(colour))).toBe(true);
    expect(Object.values(canvasTokens(false)).every((colour) => colour.startsWith("var(--u-"))).toBe(true);
    expect(Object.keys(canvasTokens(true))).toEqual(Object.keys(canvasTokens(false)));
  });
});
