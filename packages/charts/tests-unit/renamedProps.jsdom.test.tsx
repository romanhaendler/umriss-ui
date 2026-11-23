// @vitest-environment jsdom

/* The old names of the renamed props: `tone` is `verdict`, a matrix' and a state band's `value` is `row` and
   `state`. Each still works, warns once and loses to the new name. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Legend, useChart, type ChartParts } from "../src";
import { FALLBACK_THEME } from "../src/theme";

interface Row {
  t: number;
  a: number;
  r: string;
}

const data: Row[] = Array.from({ length: 6 }, (_, t) => ({ t, a: t % 2, r: t % 2 ? "x" : "y" }));
const STATES = [{ label: "Off", color: "grey" }, { label: "On", color: "green" }];

let cleanup: (() => void) | null = null;
afterEach(() => {
  cleanup?.();
  cleanup = null;
  vi.restoreAllMocks();
});

function Host({ series }: { series: (parts: ChartParts<Row>) => ReactNode }) {
  const parts = useChart(data);
  const { Chart, XAxis, YAxis } = parts;
  return (
    <Chart aria-label="Renamed" height={200}>
      <XAxis value="t" />
      <YAxis />
      {series(parts)}
      <Legend />
    </Chart>
  );
}

async function render(series: (parts: ChartParts<Row>) => ReactNode): Promise<HTMLElement> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(<Host series={series} />);
  });
  await act(async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  });
  cleanup = () => {
    act(() => root.unmount());
    host.remove();
  };
  return host;
}

const chip = (host: HTMLElement) => host.querySelector<HTMLElement>(".uc-legend-chip")!.style.background;
const colour = (css: string) => {
  const probe = document.createElement("span");
  probe.style.background = css;
  return probe.style.background;
};

describe("the renamed props", () => {
  it("keeps `tone` working, warns once, and lets `verdict` win", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const old = await render(({ Line }) => <Line value="a" name="Old" tone="alarm" />);
    expect(chip(old)).toBe(colour(FALLBACK_THEME.colorAlarm));
    cleanup?.();
    const both = await render(({ Line }) => <Line value="a" name="Both" tone="alarm" verdict="ok" />);
    expect(chip(both)).toBe(colour(FALLBACK_THEME.colorOk));
    expect(warn.mock.calls.filter(([m]) => String(m).includes("tone on Line"))).toHaveLength(1);
    expect(String(warn.mock.calls.find(([m]) => String(m).includes("tone on Line"))![0])).toContain("use verdict");
  });

  it("keeps `value` of a matrix and a state band working, warns once, and lets `row` and `state` win", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(({ Matrix, StateBand }) => (
      <>
        <Matrix value="r" level="a" name="Old matrix" />
        <StateBand value="a" states={STATES} name="Old band" />
      </>
    ));
    cleanup?.();
    await render(({ Matrix, StateBand }) => (
      <>
        <Matrix value="t" row="r" level="a" name="New matrix" />
        <StateBand value="t" state="a" states={STATES} name="New band" />
      </>
    ));
    const said = (what: string) => warn.mock.calls.filter(([m]) => String(m).includes(what)).length;
    expect(said("value on Matrix")).toBe(1);
    expect(said("value on StateBand")).toBe(1);
  });
});
