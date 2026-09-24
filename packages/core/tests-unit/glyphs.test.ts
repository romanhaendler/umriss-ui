/* One stroke width at one nominal size, held by a check rather than by a
   document (`docs/glyphs.md`). Reads every component source of
   @umriss-ui/core as text and holds each inline `<svg>` to the specification;
   the rules stand once, in `scripts/glyphs.ts`, for every package. */

import { describe, expect, it } from "vitest";
import { glyphOffenders, glyphsIn, offencesOf } from "../../../scripts/glyphs.ts";

const SOURCES = import.meta.glob("../src/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const sources = Object.fromEntries(Object.entries(SOURCES).map(([path, text]) => [path.replace("../src/", ""), text]));

/** Drawings that are not glyphs, by file - each one with a reason. */
const NOT_GLYPHS: Readonly<Record<string, string>> = {
  "components/Spinner/Spinner.tsx":
    "An animated loading ring with role=\"status\" and an accessible name - a state that is announced, not decoration.",
  "components/DataViz/Sparkline.tsx":
    "A chart: its viewBox is the data's extent, and the course has a gradient fill beneath it.",
  "components/Checkbox/Checkbox.tsx":
    "The tick carries pathLength for the drawing animation and is sized by CSS on a filled box - an animated state, not a character.",
};

describe("Glyphs of @umriss-ui/core", () => {
  it("find glyphs at all", () => {
    expect(Object.values(sources).flatMap(glyphsIn).length).toBeGreaterThan(10);
  });

  it("all keep one stroke width at the nominal size, in currentColor, without fill, hidden", () => {
    expect(glyphOffenders(sources, NOT_GLYPHS)).toEqual([]);
  });

  it("name every exception with a reason, and only drawings that still exist", () => {
    for (const [file, reason] of Object.entries(NOT_GLYPHS)) {
      expect(glyphsIn(sources[file] ?? ""), `${file} is stale`).not.toEqual([]);
      expect(reason.length).toBeGreaterThan(20);
    }
  });
});

describe("The glyph rules", () => {
  const glyph = (open: string, body: string) => `<svg ${open}>${body}</svg>`;
  const path = (width: string) => `<path d="M1 1h8" fill="none" stroke="currentColor" strokeWidth="${width}" />`;

  it("accept a glyph to the specification, cropped or not", () => {
    expect(offencesOf(glyph('viewBox="0 0 10 10" aria-hidden="true"', path("1.4")))).toEqual([]);
    expect(offencesOf(glyph('viewBox="0 0 10 6" aria-hidden="true"', path("1.4")))).toEqual([]);
  });

  it("name each offence", () => {
    expect(offencesOf(glyph('viewBox="0 0 14 14"', path("1.5")))).toEqual([
      "viewBox 0 0 14 14: the longer side is not 10",
      "no aria-hidden",
      "strokeWidth 1.5",
    ]);
    expect(
      offencesOf(glyph('viewBox="0 0 10 10" aria-hidden="true"', '<path fill={on ? "currentColor" : "none"} stroke="red" strokeWidth="1.4" />')),
    ).toEqual(["fill computed", "stroke red"]);
  });
});
