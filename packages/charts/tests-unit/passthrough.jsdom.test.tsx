// @vitest-environment jsdom

/* The pass-through guard of the charts (ADR-0068): the chart is a composite -
   ref, class, style and the rest reach its root, the three names reach the
   plot - and everything else it exports registers with a chart or is drawn
   inside its root. The `Chart` is read from a harness, so that it stands among
   the exports the guard lists. */

import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { render, renderHook } from "@testing-library/react";
import * as charts from "../src";
import { useChart } from "../src";
import { passThroughGuard } from "../../demo/tests-support/passThroughGuard.tsx";
import type { PassThroughCase } from "../../demo/tests-support/passThroughGuard.tsx";

const ROWS = [{ t: 0, a: 1 }];

function Harness({ through }: { through?: object }) {
  const c = useChart(ROWS);
  return (
    <c.Chart {...through}>
      <c.XAxis value="t" />
      <c.YAxis />
      <c.Line value="a" name="A" />
    </c.Chart>
  );
}

const CASES: Record<string, PassThroughCase> = {
  Chart: {
    render: (probe) => <Harness through={probe as object} />,
    shape: "composite",
    named: (root) => root.querySelector(".uc-plot"),
  },
};

const { result, unmount } = renderHook(() => useChart(ROWS));
const { Chart } = result.current;
unmount();

const registers = "registers with the chart that holds it; the chart draws it, no element of its own stands in the page";
passThroughGuard("charts", { ...charts, Chart }, CASES, {
  Legend: "drawn inside the chart's root, by the chart's scene",
  Tooltip: "drawn inside the chart's root, by the chart's scene",
  DataTable: "drawn inside the chart's root, beside the plot",
  LimitLine: registers,
  LimitBand: registers,
  ControlChart: "a composition of series and limits that register with the chart; no element of its own",
  ChartsWordingProvider: "a context provider; renders no element of its own",
  LinearScale: "a class of arithmetic, not a component",
});

describe("the name and the root of the chart", () => {
  it("puts data-testid on the root and gives the ref the same root", () => {
    const ref = createRef<HTMLDivElement>();
    const { getByTestId } = render(<Harness through={{ "data-testid": "trend", ref }} />);
    expect(ref.current).toBe(getByTestId("trend"));
    expect(ref.current!.classList.contains("uc-root")).toBe(true);
  });

  it("names the plot by the heading and lists the summary before the caller's description", () => {
    const { container } = render(
      <>
        <h2 id="h">Trend</h2>
        <Harness through={{ "aria-labelledby": "h", "aria-describedby": "note" }} />
      </>,
    );
    const plot = container.querySelector(".uc-plot")!;
    expect(plot.getAttribute("aria-labelledby")).toBe("h");
    const ids = plot.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids[1]).toBe("note");
    expect(container.querySelector(`[id="${ids[0]}"]`)).not.toBeNull();
  });

  it("a chart without a name warns naming aria-label", async () => {
    /* The warnings are once per module: this test reads a fresh one. */
    vi.resetModules();
    const fresh = await import("../src");
    function Fresh({ through }: { through?: object }) {
      const c = fresh.useChart(ROWS);
      return (
        <c.Chart {...through}>
          <c.XAxis value="t" />
          <c.YAxis />
          <c.Line value="a" name="A" />
        </c.Chart>
      );
    }
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Fresh />);
    render(<Fresh />);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("Chart without aria-label"))).toHaveLength(1);
    warn.mockRestore();
  });
});
