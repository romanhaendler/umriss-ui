/* EndGlyph: a chevron against a bar, drawn to the glyph specification. */

import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { EndGlyph } from "../src";

it("draws a stroked chevron and a bar at the nominal box, hidden, in the text colour", () => {
  const { container } = render(<EndGlyph size={16} />);
  const svg = container.querySelector("svg")!;
  expect(svg.getAttribute("viewBox")).toBe("0 0 10 10");
  expect(svg.getAttribute("width")).toBe("16");
  expect(svg.getAttribute("aria-hidden")).toBe("true");
  const path = svg.querySelector("path")!;
  expect(path.getAttribute("fill")).toBe("none");
  expect(path.getAttribute("stroke")).toBe("currentColor");
  expect(path.getAttribute("stroke-width")).toBe("1.4");
  expect(path.getAttribute("stroke-linecap")).toBe("round");
});
