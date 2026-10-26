// @vitest-environment jsdom

/* A chart that follows the printed page: the change of matchMedia("print")
   takes the plot's new size and draws it in the same task, without a frame. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { useChart } from "../src";
import { renderChart, sizePlot } from "./renderChart";

const rows = [
  { t: 0, a: 1 },
  { t: 1, a: 2 },
];

function Plain() {
  const { Chart, XAxis, YAxis, Line } = useChart(rows);
  return (
    <Chart aria-label="print" height={200}>
      <XAxis value="t" />
      <YAxis />
      <Line value="a" name="A" />
    </Chart>
  );
}

const listeners = new Map<string, Set<() => void>>();

function fakeMatchMedia(query: string) {
  const set = listeners.get(query) ?? new Set<() => void>();
  listeners.set(query, set);
  return {
    matches: false,
    media: query,
    addEventListener: (_: string, fn: () => void) => set.add(fn),
    removeEventListener: (_: string, fn: () => void) => set.delete(fn),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  listeners.clear();
});

describe("Printing", () => {
  it("takes the plot's size at the change of the print media query, in the same task", async () => {
    vi.stubGlobal("matchMedia", fakeMatchMedia);
    const ctx = new Proxy({}, { get: () => () => ({ width: 0 }), set: () => true });
    vi.stubGlobal("Path2D", function () { return ctx; });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as never);
    sizePlot(400, 200);
    const { host, unmount } = await renderChart(<Plain />);
    const canvas = host.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.style.width).toBe("400px");

    sizePlot(250, 200);
    act(() => listeners.get("print")?.forEach((fn) => fn()));
    expect(canvas.style.width).toBe("250px");

    unmount();
    expect(listeners.get("print")?.size).toBe(0);
  });
});
