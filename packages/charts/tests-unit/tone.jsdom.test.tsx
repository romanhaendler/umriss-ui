// @vitest-environment jsdom

/* charts-essentials 06: `tone` on Area, Bar and ControlChart as on Line and
   Scatter - a role the theme resolves. The legend chip shows what the canvas
   draws. */

import { afterEach, describe, expect, it } from "vitest";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ControlChart, Legend, useChart, type ChartParts } from "../src";
import { FALLBACK_THEME } from "../src/theme";

interface Row {
  t: number;
  a: number;
}

const data: Row[] = Array.from({ length: 12 }, (_, t) => ({ t, a: 10 + (t % 3) }));

let cleanup: (() => void) | null = null;
afterEach(() => {
  cleanup?.();
  cleanup = null;
});

type Series = (parts: ChartParts<Row>) => ReactNode;

function Toned({ series }: { series: Series }) {
  const parts = useChart(data);
  const { Chart, XAxis, YAxis } = parts;
  return (
    <Chart ariaLabel="Tone" height={200}>
      <XAxis value="t" />
      <YAxis value="a" />
      {series(parts)}
      <Legend />
    </Chart>
  );
}

async function chips(series: Series): Promise<string[]> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(<Toned series={series} />);
  });
  await act(async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  });
  cleanup = () => {
    act(() => root.unmount());
    host.remove();
  };
  return [...host.querySelectorAll<HTMLElement>(".uc-legend-chip")].map((c) => c.style.background);
}

const colour = (css: string) => {
  const probe = document.createElement("span");
  probe.style.background = css;
  return probe.style.background;
};

describe("tone", () => {
  it("colours an area and a bar by their role", async () => {
    expect(
      await chips(({ Area, Bar }) => (
        <>
          <Area value="a" name="Scrap" tone="alarm" />
          <Bar value="a" name="Rework" tone="warning" />
        </>
      )),
    ).toEqual([colour(FALLBACK_THEME.colorAlarm), colour(FALLBACK_THEME.colorWarning)]);
  });

  it("colours a control chart's line by its role", async () => {
    const [line] = await chips(() => (
      <ControlChart
        accessor={(d: Row) => d.a}
        data={data}
        origin={{ kind: "given", center: 11, sigma: 1 }}
        name="Feature"
        violationName="Violations"
        tone="ok"
      />
    ));
    expect(line).toBe(colour(FALLBACK_THEME.colorOk));
  });
});
