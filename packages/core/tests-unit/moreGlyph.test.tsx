/* MoreGlyph: three dots, each a zero-length stroke with round caps, to the glyph specification. */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MoreGlyph } from "../src";

describe("MoreGlyph", () => {
  it("draws three round dots as zero-length strokes at the nominal box, hidden, in the text colour", () => {
    const { container } = render(<MoreGlyph />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 10 10");
    expect(svg.getAttribute("width")).toBe("12");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    const dots = [...svg.querySelectorAll("path")];
    expect(dots).toHaveLength(3);
    for (const dot of dots) {
      expect(dot.getAttribute("fill")).toBe("none");
      expect(dot.getAttribute("stroke")).toBe("currentColor");
      expect(dot.getAttribute("stroke-width")).toBe("1.4");
      expect(dot.getAttribute("stroke-linecap")).toBe("round");
    }
  });

  it("takes a size and a ref like every glyph", () => {
    const ref = { current: null as SVGSVGElement | null };
    const { container } = render(<MoreGlyph ref={ref} size={16} />);
    expect(container.querySelector("svg")!.getAttribute("width")).toBe("16");
    expect(ref.current).toBe(container.querySelector("svg"));
  });
});
