// @vitest-environment jsdom

/* jsdom smoke test: the complete composition mounts and unmounts without an
   error, even though jsdom provides no real 2D context. */

import { describe, expect, it } from "vitest";
import { StrictMode, act } from "react";
import { createRoot } from "react-dom/client";
import { Chart, Line, XAxis, YAxis, Legend, Tooltip } from "../src";

interface Row {
  t: number;
  a: number;
  b: number | null;
}

const data: Row[] = [
  { t: 0, a: 1, b: 5 },
  { t: 1, a: 2, b: null },
  { t: 2, a: 3, b: 7 },
];

describe("Mount in jsdom", () => {
  it("mounts the full composition and unmounts without an error", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => {
      root.render(
        <StrictMode>
          <Chart data={data} ariaLabel="jsdom test" height={200}>
            <XAxis accessor={(d: Row) => d.t} label="Index" />
            <YAxis accessor={(d: Row) => d.a} />
            <YAxis id="two" position="right" accessor={(d: Row) => d.b ?? 0} />
            <Line accessor={(d: Row) => d.a} name="A" />
            <Line accessor={(d: Row) => d.b} yAxisId="two" name="B" dash={[4, 4]} />
            <Legend placement="top" />
            <Tooltip mode="x" />
          </Chart>
        </StrictMode>,
      );
    });

    // The scene draws and publishes its state inside the rAF - wait one frame.
    await act(async () => {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    });

    const container = host.querySelector(".uc-root");
    expect(container).not.toBeNull();
    expect(container?.querySelectorAll("canvas")).toHaveLength(2);
    expect(container?.querySelectorAll("canvas[aria-hidden='true']")).toHaveLength(2);
    // The legend renders the registered series.
    expect(host.querySelectorAll(".uc-legend-item")).toHaveLength(2);

    /* library-audit 05: `role="img"` stood on the root, and the root contains the
       legend. The descendants of an image are presentational to a screen reader -
       which made the only operable element of the chart unreachable. The image is
       now the plot area - and, with a tooltip, the tab stop that walks its hits
       (charts-a11y, ADR-0030). */
    const plot = host.querySelector(".uc-plot");
    expect(container?.hasAttribute("role")).toBe(false);
    expect(plot?.getAttribute("role")).toBe("application");
    expect(plot?.getAttribute("aria-label")).toBe("jsdom test");
    for (const entry of host.querySelectorAll(".uc-legend-item")) {
      expect(plot?.contains(entry)).toBe(false);
    }

    await act(async () => {
      root.unmount();
    });
    expect(host.querySelector(".uc-root")).toBeNull();
  });

});
