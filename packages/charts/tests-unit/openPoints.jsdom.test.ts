// @vitest-environment jsdom

/* charts-review, the open points: what the scene hands the canvas and the HTML
   layer for a caller's colour, a band's last state, an x limit's label at the
   right edge and the tooltip header over readings a second apart. jsdom has no
   2D context and measures nothing; where a size or a colour matters, a stub
   plays the browser's part. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { ChartScene } from "../src/scene";
import { TextMeasurer } from "../src/measure";
import { invalidateTheme } from "../src/theme";
import type { AxisConfig, LineSeriesConfig, SeriesConfig, StateSeriesConfig } from "../src/types";

interface Row {
  t: number;
  a: number;
}

const xAxis: AxisConfig = {
  id: "x",
  orientation: "x",
  position: "bottom",
  accessor: (d) => (d as Row).t,
  domain: "data",
};

const yAxis: AxisConfig = {
  id: "y",
  orientation: "y",
  position: "left",
  accessor: (d) => (d as Row).a,
  domain: [0, 100],
};

const line: LineSeriesConfig = {
  kind: "line",
  accessor: (d) => (d as Row).a,
  xAxisId: "x",
  yAxisId: "y",
  strokeWidth: 1.5,
  markers: "auto",
  name: "A",
};

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

async function scene(
  rows: readonly Row[],
  series: readonly SeriesConfig[],
  x: AxisConfig = xAxis,
): Promise<ChartScene> {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const s = new ChartScene();
  s.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
  s.registerAxis(x);
  s.registerAxis(yAxis);
  for (const c of series) s.registerSeries(c);
  s.registerTooltip({ mode: "x" });
  s.setData(rows);
  s.requestResize(400, 300);
  await frame();
  return s;
}

const items = (s: ChartScene) =>
  (s as unknown as { drawItems(): { color: string; colors?: string[]; lastEnd?: number }[] }).drawItems();

afterEach(() => {
  vi.restoreAllMocks();
  invalidateTheme();
  document.body.innerHTML = "";
});

/* Finding 15: a `color` reached the canvas as the text it was given. */
describe("a caller's colour", () => {
  /** A browser that resolves `var(--plan)` - light or dark. */
  function browser(scheme: { current: "light" | "dark" }) {
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) => {
      const computed = real(el);
      const inline = (el as HTMLElement).style?.color ?? "";
      return new Proxy(computed, {
        get(target, prop) {
          if (prop === "color" && inline === "var(--plan)") {
            return scheme.current === "light" ? "rgb(1, 2, 3)" : "rgb(4, 5, 6)";
          }
          return Reflect.get(target, prop);
        },
      });
    });
  }

  const rows = [
    { t: 0, a: 10 },
    { t: 1, a: 20 },
  ];

  it("reaches the canvas resolved, and again after a theme change", async () => {
    const scheme = { current: "light" as "light" | "dark" };
    browser(scheme);
    const s = await scene(rows, [{ ...line, color: "var(--plan)" }]);
    expect(items(s)[0]?.color).toBe("rgb(1, 2, 3)");
    scheme.current = "dark";
    invalidateTheme();
    await frame();
    expect(items(s)[0]?.color).toBe("rgb(4, 5, 6)");
    s.unbind();
  });

  it("is resolved for a band's states and a limit too", async () => {
    browser({ current: "light" });
    const band: StateSeriesConfig = {
      kind: "state",
      name: "State",
      accessor: () => 0,
      states: [{ label: "Run", color: "var(--plan)" }],
      xAxisId: "x",
      yAxisId: "y",
    };
    const s = await scene(rows, [band]);
    s.registerLimit({
      kind: "line",
      value: 50,
      orientation: "y",
      severity: "alarm",
      role: "specification",
      color: "var(--plan)",
      inExtent: true,
    });
    await frame();
    expect(items(s)[0]?.colors).toEqual(["rgb(1, 2, 3)"]);
    const limits = (s as unknown as { limitItems(band: boolean): { color: string }[] }).limitItems(false);
    expect(limits[0]?.color).toBe("rgb(1, 2, 3)");
    s.unbind();
  });
});

/* Finding 16: the last state ran to the end of the padded domain. */
describe("a band's last segment", () => {
  const band: StateSeriesConfig = {
    kind: "state",
    name: "State",
    accessor: () => 0,
    states: [{ label: "Run", color: "#2e7d32" }],
    xAxisId: "x",
    yAxisId: "y",
  };
  const every = (n: number, step: number) => Array.from({ length: n }, (_, i) => ({ t: i * step, a: 50 }));

  it("ends at the latest reading of the chart, not at the domain's padding", async () => {
    const s = await scene(every(4, 2), [
      { ...band, data: every(3, 2) },
      { ...line, data: every(4, 2) },
    ], { ...xAxis, domain: [0, 20] });
    expect(items(s)[0]?.lastEnd).toBe(6);
    const x = s.getLayoutSnapshot().layout.axes.find((a) => a.orientation === "x")?.scale;
    s.pointerMove(x?.toPx(10) ?? 0, 150);
    expect(s.getHoverSnapshot().hover?.hit.points.map((p) => p.seriesName)).not.toContain("State");
    s.unbind();
  });

  it("is drawn under domain=\"data\" where the band ends last, one step long", async () => {
    const s = await scene(every(3, 2), [band, line]);
    expect(s.getLayoutSnapshot().layout.axes.find((a) => a.orientation === "x")?.domain).toEqual([0, 6]);
    expect(items(s)[0]?.lastEnd).toBe(6);
    s.unbind();
  });
});

/* An x limit's label ran past the container's right edge. */
describe("an x limit's label", () => {
  it("stays inside the container like a tick label", async () => {
    vi.spyOn(TextMeasurer.prototype, "measure").mockImplementation((text: string) => ({
      width: text.length * 7,
      height: 14,
    }));
    const s = await scene(
      [
        { t: 0, a: 10 },
        { t: 10, a: 20 },
      ],
      [line],
    );
    s.registerLimit({
      kind: "line",
      value: 10,
      orientation: "x",
      severity: "alarm",
      role: "specification",
      label: "Changeover",
      inExtent: true,
    });
    await frame();
    const label = s.getLayoutSnapshot().limits[0];
    // "Changeover": 70 px of text, 2 px padding either side.
    expect(label?.labelLeft).toBe(400 - 74);
    s.unbind();
  });
});

/* Readings a second apart shared one tooltip header. */
describe("the tooltip header on a time axis", () => {
  const T0 = new Date(2026, 2, 17, 15, 23).getTime();

  async function header(step: number): Promise<string | undefined> {
    const rows = Array.from({ length: 10 }, (_, i) => ({ t: T0 + i * step, a: 50 }));
    const s = await scene(rows, [line], { ...xAxis, time: true });
    const x = s.getLayoutSnapshot().layout.axes.find((a) => a.orientation === "x")?.scale;
    s.pointerMove(x?.toPx(T0 + 5 * step) ?? 0, 150);
    const label = s.getHoverSnapshot().xLabel;
    s.unbind();
    return label;
  }

  it("carries the seconds where the readings are less than a minute apart", async () => {
    expect(await header(1000)).toBe("17 Mar 15:23:05");
  });

  it("does not where they are a minute apart or more", async () => {
    expect(await header(60_000)).toBe("17 Mar 15:28");
  });
});
