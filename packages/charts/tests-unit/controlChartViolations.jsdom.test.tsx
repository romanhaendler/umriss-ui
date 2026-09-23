// @vitest-environment jsdom

/* The violations reach the caller once per change (charts-fixes 07).

   A caller that keeps them in state renders anew with every report - and each
   render handed the control chart a new inline accessor and a new origin, which
   recomputed the limits, which made a new list of violations, which was
   reported again. The chart rendered forever. */

import { afterEach, describe, expect, it } from "vitest";
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { Chart, ControlChart, XAxis, YAxis, type Violation } from "../src";

interface Point {
  n: number;
  value: number;
}

const DATA: Point[] = [
  ...Array.from({ length: 20 }, (_, n) => ({ n, value: 10 + ((n % 3) - 1) * 0.05 })),
  { n: 20, value: 20 },
];

let teardown: (() => Promise<void>) | null = null;

afterEach(async () => {
  await teardown?.();
  teardown = null;
});

describe("ControlChart - onViolations", () => {
  it("settles after one report when the caller keeps the violations in state", async () => {
    let reports = 0;
    let shown: readonly Violation[] = [];

    function Caller() {
      const [found, setFound] = useState<readonly Violation[]>([]);
      shown = found;
      return (
        <Chart data={DATA} ariaLabel="Control chart" height={240}>
          <XAxis accessor={(d: Point) => d.n} />
          <YAxis accessor={(d: Point) => d.value} />
          <ControlChart
            accessor={(d: Point) => d.value}
            data={DATA}
            origin={{ kind: "given", center: 10, sigma: 0.1 }}
            name="Feature"
            onViolations={(v) => {
              reports++;
              // A bound, so that a loop ends the test instead of hanging it.
              if (reports < 10) setFound(v);
            }}
          />
        </Chart>
      );
    }

    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => root.render(<Caller />));
    teardown = async () => {
      await act(async () => root.unmount());
      host.remove();
    };

    expect(reports).toBe(1);
    expect(shown).toEqual([{ rule: "outlier", indices: [20] }]);
  });

  it("does not recompute the limits for an inline accessor and origin", async () => {
    let calls = 0;
    const draw = () => (
      <Chart data={DATA} ariaLabel="Control chart" height={240}>
        <XAxis accessor={(d: Point) => d.n} />
        <YAxis accessor={(d: Point) => d.value} />
        <ControlChart
          accessor={(d: Point) => {
            calls++;
            return d.value;
          }}
          data={DATA}
          origin={{ kind: "given", center: 10, sigma: 0.1 }}
          name="Feature"
        />
      </Chart>
    );
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => root.render(draw()));
    teardown = async () => {
      await act(async () => root.unmount());
      host.remove();
    };
    const first = calls;
    await act(async () => root.render(draw()));
    await act(async () => root.render(draw()));
    expect(first).toBeGreaterThan(0);
    expect(calls).toBe(first);
  });
});
