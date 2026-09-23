/* Registration model and DEV checks of the scene (R-2.1, R-2.2, R-4.12, R-4.13).
   Runs without a DOM: the scene is fully usable up to the binding to canvas
   elements, and exactly that separation is held down here. */

import { describe, expect, it, vi, afterEach } from "vitest";
import { ChartScene } from "../src/scene";
import { FALLBACK_THEME } from "../src/theme";
import type {
  AreaSeriesConfig,
  AxisConfig,
  BarSeriesConfig,
  LineSeriesConfig,
  ScatterSeriesConfig,
} from "../src/types";

interface Row {
  t: number;
  a: number;
}

function xAxis(id = "x"): AxisConfig {
  return {
    id,
    orientation: "x",
    position: "bottom",
    accessor: (d) => (d as Row).t,
    domain: "nice",
  };
}

function yAxis(id = "y"): AxisConfig {
  return {
    id,
    orientation: "y",
    position: "left",
    accessor: (d) => (d as Row).a,
    domain: "nice",
  };
}

function lineSeries(part: Partial<LineSeriesConfig> = {}): LineSeriesConfig {
  return {
    kind: "line",
    accessor: (d) => (d as Row).a,
    xAxisId: "x",
    yAxisId: "y",
    strokeWidth: 1.5,
    markers: "auto",
    ...part,
  };
}

function scatterSeries(part: Partial<ScatterSeriesConfig> = {}): ScatterSeriesConfig {
  return {
    kind: "scatter",
    accessor: (d) => (d as Row).a,
    xAxisId: "x",
    yAxisId: "y",
    radius: 3,
    ...part,
  };
}

function areaSeries(part: Partial<AreaSeriesConfig> = {}): AreaSeriesConfig {
  return {
    kind: "area",
    accessor: (d) => (d as Row).a,
    xAxisId: "x",
    yAxisId: "y",
    fillOpacity: 0.18,
    strokeWidth: 1.5,
    ...part,
  };
}

function barSeries(part: Partial<BarSeriesConfig> = {}): BarSeriesConfig {
  return {
    kind: "bar",
    accessor: (d) => (d as Row).a,
    xAxisId: "x",
    yAxisId: "y",
    barWidth: 0.8,
    ...part,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("The extent per axis across series kinds", () => {
  const tall = [
    { t: 0, a: 100 },
    { t: 1, a: 140 },
    { t: 2, a: 120 },
  ];

  it("pulls the baseline of an area into the extent of its y axis", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(areaSeries());
    // Without this rule the axis would begin at 100 and cut off the foot.
    expect(scene.axisExtent("y", "y")).toEqual([0, 140]);
  });

  it("leaves other axes untouched by the baseline of an area", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerAxis(yAxis("right"));
    scene.registerSeries(areaSeries());
    scene.registerSeries(lineSeries({ yAxisId: "right" }));
    expect(scene.axisExtent("y", "y")).toEqual([0, 140]);
    expect(scene.axisExtent("y", "right")).toEqual([100, 140]);
  });

  it("draws in the values of a baseline accessor", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(areaSeries({ baseline: (d) => (d as Row).a - 60 }));
    expect(scene.axisExtent("y", "y")).toEqual([40, 140]);
  });

  it("pulls the foot of a bar into the extent of its y axis", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(barSeries());
    // A bar whose foot does not sit at 0 misrepresents its own size.
    expect(scene.axisExtent("y", "y")).toEqual([0, 140]);
  });

  it("takes half the step to the left and right into the x extent", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(barSeries());
    // A bar is centred on its x value. Without this rule the axis cuts into the
    // first and the last bar.
    expect(scene.axisExtent("x", "x")).toEqual([-0.5, 2.5]);
  });

  it("widens the x extent only for bars", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(lineSeries());
    expect(scene.axisExtent("x", "x")).toEqual([0, 2]);
  });

  it("re-materialises when an area gets a baseline", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    const id = scene.registerSeries(areaSeries());
    expect(scene.axisExtent("y", "y")).toEqual([0, 140]);
    // The baseline is an accessor: it belongs to what gets materialised. If it
    // changes, the second channel is stale.
    scene.updateSeries(id, areaSeries({ baseline: (d) => (d as Row).a - 60 }));
    expect(scene.axisExtent("y", "y")).toEqual([40, 140]);
  });

  it("re-materialises when a series changes its kind", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    const id = scene.registerSeries(lineSeries());
    expect(scene.axisExtent("y", "y")).toEqual([100, 140]);
    scene.updateSeries(id, barSeries());
    // As a bar the same series brings its foot along.
    expect(scene.axisExtent("y", "y")).toEqual([0, 140]);
    expect(scene.axisExtent("x", "x")).toEqual([-0.5, 2.5]);
  });

  it("binds a bar and a scatter to a second axis", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerAxis(yAxis("right"));
    scene.registerSeries(barSeries({ yAxisId: "right" }));
    scene.registerSeries(scatterSeries());
    // Every series kind can be bound to every axis (R-4.12).
    expect(scene.axisExtent("y", "right")).toEqual([0, 140]);
    expect(scene.axisExtent("y", "y")).toEqual([100, 140]);
  });

  it("leaves a line and a scatter without a baseline", () => {
    const scene = new ChartScene();
    scene.setData(tall);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(lineSeries());
    scene.registerSeries(scatterSeries());
    expect(scene.axisExtent("y", "y")).toEqual([100, 140]);
  });
});

/* library-audit 03: "Series n" stays the last resort of the legend - the package
   has no text layer, and a default name is exactly the kind of text it is not to
   bring along. It stays, but it is conspicuous.

   Freshly imported: `warnOnce` remembers its key module-wide, and a nameless
   series in a test further up would already have used the warning - the test would
   then pass with broken code as well. */
describe("A series without a name", () => {
  it("is still called after its place in the legend and warns once", async () => {
    vi.resetModules();
    const { ChartScene: FreshScene } = await import("../src/scene");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new FreshScene();
    scene.registerSeries(lineSeries({ name: "A" }));
    scene.registerSeries(lineSeries());
    expect(scene.legendItems().map((i) => i.name)).toEqual(["A", "Series 2"]);
    scene.legendItems();
    const withoutName = warn.mock.calls.filter(([text]) =>
      String(text).includes("the name belongs in"),
    );
    expect(withoutName).toHaveLength(1);
  });

  it("stays silent when every series has a name", async () => {
    vi.resetModules();
    const { ChartScene: FreshScene } = await import("../src/scene");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new FreshScene();
    scene.registerSeries(lineSeries({ name: "A" }));
    scene.legendItems();
    expect(
      warn.mock.calls.some(([text]) => String(text).includes("the name belongs in")),
    ).toBe(false);
  });
});

/* library-audit 05: the palette followed the place in the registration. A series
   that deregistered and registered again - a legend toggle, a conditional child -
   landed at the end, and EVERY series of the chart changed colour: A/B/C in
   blue/pink/green became B/C/A in blue/pink/green. "Blue is the temperature" held
   only until the first click.

   The palette now follows the name, the drawing still follows the registration. */
describe("The palette follows the name", () => {
  const colorsByName = (scene: ChartScene) =>
    Object.fromEntries(scene.legendItems().map((i) => [i.name, i.color]));

  it("distributes by JSX order on the first mount, as before", () => {
    const scene = new ChartScene();
    scene.registerSeries(lineSeries({ name: "A" }));
    scene.registerSeries(lineSeries({ name: "B" }));
    scene.registerSeries(lineSeries({ name: "C" }));
    expect(scene.legendItems().map((i) => i.color)).toEqual(FALLBACK_THEME.series.slice(0, 3));
  });

  it("gives a series that comes back under the same name its colour back", () => {
    const scene = new ChartScene();
    const a = scene.registerSeries(lineSeries({ name: "A" }));
    scene.registerSeries(lineSeries({ name: "B" }));
    scene.registerSeries(lineSeries({ name: "C" }));
    const before = colorsByName(scene);
    scene.unregisterSeries(a);
    scene.registerSeries(lineSeries({ name: "A" }));
    expect(colorsByName(scene)).toEqual(before);
    // The drawing still happens in registration order.
    expect(scene.seriesInOrder().map((e) => e.config.name)).toEqual(["B", "C", "A"]);
  });

  it("does not give a new name the colour of a series that went away", () => {
    const scene = new ChartScene();
    scene.registerSeries(lineSeries({ name: "A" }));
    const b = scene.registerSeries(lineSeries({ name: "B" }));
    scene.registerSeries(lineSeries({ name: "C" }));
    const blue = colorsByName(scene).B;
    scene.unregisterSeries(b);
    scene.registerSeries(lineSeries({ name: "D" }));
    scene.registerSeries(lineSeries({ name: "B" }));
    const after = colorsByName(scene);
    expect(after.B).toBe(blue);
    expect(new Set(Object.values(after)).size).toBe(4);
  });

  it("keeps the colour across a rename", () => {
    const scene = new ChartScene();
    scene.registerSeries(lineSeries({ name: "A" }));
    const b = scene.registerSeries(lineSeries({ name: "B" }));
    const before = colorsByName(scene).B;
    scene.updateSeries(b, lineSeries({ name: "Beta" }));
    expect(colorsByName(scene).Beta).toBe(before);
  });

  /* Review finding: the rename left the old name standing on the place, and a new
     series under the old name got the colour of the renamed one. */
  it("does not give a name a rename has left behind the colour of the renamed series", () => {
    const scene = new ChartScene();
    scene.registerSeries(lineSeries({ name: "A" }));
    const b = scene.registerSeries(lineSeries({ name: "B" }));
    scene.updateSeries(b, lineSeries({ name: "Beta" }));
    scene.registerSeries(lineSeries({ name: "B" }));
    const colors = colorsByName(scene);
    expect(colors.B).not.toBe(colors.Beta);
    expect(new Set(Object.values(colors)).size).toBe(3);
  });

  it("does not share a colour between two series of the same name standing at once", () => {
    const scene = new ChartScene();
    scene.registerSeries(lineSeries({ name: "A" }));
    scene.registerSeries(lineSeries({ name: "A" }));
    const colors = scene.legendItems().map((i) => i.color);
    expect(colors[0]).not.toBe(colors[1]);
  });

  it("shifts series without a name as before and warns once when it happens", async () => {
    vi.resetModules();
    const { ChartScene: FreshScene } = await import("../src/scene");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new FreshScene();
    const first = scene.registerSeries(lineSeries());
    const second = scene.registerSeries(lineSeries());
    scene.registerSeries(lineSeries());
    const before = new Map(scene.legendItems().map((i) => [i.seriesIds[0], i.color]));

    scene.unregisterSeries(first);
    scene.registerSeries(lineSeries());
    const after = new Map(scene.legendItems().map((i) => [i.seriesIds[0], i.color]));
    scene.legendItems();

    // Without a name there is no identity: the second series moves up onto the
    // first colour.
    expect(after.get(second)).not.toBe(before.get(second));
    expect(after.get(second)).toBe(before.get(first));
    const changed = warn.mock.calls.filter(([text]) => String(text).includes("colour"));
    expect(changed).toHaveLength(1);
  });

  it("does not warn when series without a name are mounted only once", async () => {
    vi.resetModules();
    const { ChartScene: FreshScene } = await import("../src/scene");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new FreshScene();
    scene.registerSeries(lineSeries());
    scene.registerSeries(lineSeries());
    scene.legendItems();
    scene.legendItems();
    expect(warn.mock.calls.some(([text]) => String(text).includes("colour"))).toBe(false);
  });
});

/* charts-review, bug 2: the check ran for the first materialised series only,
   and warned falsely for a matrix, whose x values run row-major and are
   legitimately unsorted. Freshly imported for the same reason as above. */
describe("The sortedness check (R-2.6)", () => {
  const unsorted = (warn: { mock: { calls: unknown[][] } }) =>
    warn.mock.calls.map(([text]) => String(text)).filter((text) => text.includes("not sorted"));

  it("checks every series and names the one that is unsorted", async () => {
    vi.resetModules();
    const { ChartScene: FreshScene } = await import("../src/scene");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new FreshScene();
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(lineSeries({ name: "Sorted", data: [{ t: 0, a: 1 }, { t: 1, a: 2 }] }));
    scene.registerSeries(scatterSeries({ name: "Shuffled", data: [{ t: 1, a: 1 }, { t: 0, a: 2 }] }));
    scene.axisExtent("x", "x");
    const warnings = unsorted(warn);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Shuffled");
  });

  it("leaves a row-major matrix alone", async () => {
    vi.resetModules();
    const { ChartScene: FreshScene } = await import("../src/scene");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new FreshScene();
    scene.setData([
      { t: 0, a: 0 },
      { t: 1, a: 0 },
      { t: 0, a: 1 },
      { t: 1, a: 1 },
    ]);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries({
      kind: "matrix",
      name: "Cells",
      accessor: (d) => (d as Row).a,
      value: (d) => (d as Row).a,
      coloring: { kind: "gradient", stops: ["#eee", "#333"] },
      xAxisId: "x",
      yAxisId: "y",
    });
    scene.axisExtent("x", "x");
    expect(unsorted(warn)).toEqual([]);
  });
});

describe("Registration", () => {
  it("holds the JSX order as the drawing order", () => {
    const scene = new ChartScene();
    const a = scene.registerSeries(lineSeries({ name: "A" }));
    const b = scene.registerSeries(lineSeries({ name: "B" }));
    expect(scene.seriesInOrder().map((e) => e.config.name)).toEqual(["A", "B"]);
    scene.unregisterSeries(a);
    expect(scene.seriesInOrder().map((e) => e.config.name)).toEqual(["B"]);
    scene.unregisterSeries(b);
    expect(scene.seriesInOrder()).toHaveLength(0);
  });

  it("assigns legend names and palette colours by order", () => {
    const scene = new ChartScene();
    scene.registerSeries(lineSeries({ name: "A" }));
    scene.registerSeries(lineSeries());
    scene.registerSeries(lineSeries({ color: "rebeccapurple" }));
    const items = scene.legendItems();
    expect(items.map((i) => i.name)).toEqual(["A", "Series 2", "Series 3"]);
    expect(items[2]?.color).toBe("rebeccapurple");
    // Without a resolved theme the built-in palette applies.
    expect(items[0]?.color).not.toBe(items[1]?.color);
  });

  it("keeps a single order across series kinds", () => {
    const scene = new ChartScene();
    scene.registerSeries(scatterSeries({ name: "Measurements" }));
    scene.registerSeries(lineSeries({ name: "Fit" }));
    scene.registerSeries(scatterSeries({ name: "Rest" }));
    // Registration order, not grouped by kind: the series kind changes nothing
    // about the order (CONTEXT.md, Registration order).
    expect(scene.seriesInOrder().map((e) => e.config.kind)).toEqual([
      "scatter",
      "line",
      "scatter",
    ]);
    const items = scene.legendItems();
    expect(items.map((i) => i.name)).toEqual(["Measurements", "Fit", "Rest"]);
    // The palette counts through across every kind - not from the start per kind.
    expect(new Set(items.map((i) => i.color)).size).toBe(3);
  });
});

describe("validate - DEV invariants", () => {
  it("warns when bars of one group give different barWidth", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(barSeries({ barWidth: 0.8 }));
    scene.registerSeries(barSeries({ barWidth: 0.4 }));
    scene.validate();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("barWidth"));
  });

  it("stays silent when the group agrees", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    // An axis id of its own: warnOnce remembers its key module-wide, and with "x"
    // this test would pass with broken code as well.
    scene.registerAxis(xAxis("agreed"));
    scene.registerAxis(yAxis());
    scene.registerSeries(barSeries({ xAxisId: "agreed", barWidth: 0.8 }));
    scene.registerSeries(barSeries({ xAxisId: "agreed", barWidth: 0.8 }));
    scene.validate();
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("barWidth"));
  });

  it("demands an own id for the second axis of the same orientation (R-4.12)", () => {
    const scene = new ChartScene();
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerAxis(yAxis()); // both are called "y"
    expect(() => scene.validate()).toThrow(/own id/);
  });

  it("allows equal ids in different orientations", () => {
    const scene = new ChartScene();
    scene.registerAxis(xAxis("same"));
    scene.registerAxis(yAxis("same"));
    expect(() => scene.validate()).not.toThrow();
  });

  it("reports series with an unknown axis reference", () => {
    const scene = new ChartScene();
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(lineSeries({ name: "A", yAxisId: "missing" }));
    expect(() => scene.validate()).toThrow(/missing/);
  });

  it("reports a limit with an unknown axis reference, as for a series", () => {
    // It used to draw nothing, silently.
    const scene = new ChartScene();
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(lineSeries());
    scene.registerLimit({
      kind: "line",
      value: 1,
      axisId: "shift",
      orientation: "x",
      severity: "alarm",
      role: "specification",
      inExtent: true,
    });
    expect(() => scene.validate()).toThrow(/shift/);
  });

  it("warns at an axis without a bound series (R-4.13)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerAxis(yAxis("withoutSeries"));
    scene.registerSeries(lineSeries());
    scene.validate();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("y:withoutSeries"));
  });

  it("warns when several axes draw grid explicitly (R-4.15)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.registerAxis({ ...xAxis(), grid: true });
    scene.registerAxis({ ...yAxis(), grid: true });
    scene.registerSeries(lineSeries());
    scene.validate();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("grid"));
  });
});

describe("Snapshots", () => {
  it("yields stable snapshot identities (a precondition for useSyncExternalStore)", () => {
    const scene = new ChartScene();
    expect(scene.getLayoutSnapshot()).toBe(scene.getLayoutSnapshot());
    expect(scene.getHoverSnapshot()).toBe(scene.getHoverSnapshot());
    expect(scene.getLayoutServerSnapshot()).toBe(scene.getLayoutServerSnapshot());
  });

  it("notifies subscribers no longer only after they have unsubscribed", () => {
    const scene = new ChartScene();
    const call = vi.fn();
    const off = scene.subscribeHover(call);
    scene.registerTooltip({ mode: "x" });
    expect(call).toHaveBeenCalledTimes(1);
    off();
    scene.unregisterTooltip();
    expect(call).toHaveBeenCalledTimes(1);
  });
});

/* charts-essentials 04: a hidden series is controlled by the caller. It keeps
   its legend entry and its colour, and gives up its say in the extent. */
describe("A hidden series", () => {
  const rows = [
    { t: 0, a: 10 },
    { t: 1, a: 20 },
  ];

  it("does not count for its axis' extent", () => {
    const scene = new ChartScene();
    scene.setData(rows);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(lineSeries({ name: "A" }));
    scene.registerSeries(lineSeries({ name: "B", accessor: (d) => (d as Row).a * 10, hidden: true }));
    expect(scene.axisExtent("y", "y")).toEqual([10, 20]);
  });

  it("stays in the legend with its colour, marked hidden", () => {
    const scene = new ChartScene();
    scene.setData(rows);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    scene.registerSeries(lineSeries({ name: "A", hidden: true }));
    scene.registerSeries(lineSeries({ name: "B" }));
    const items = scene.legendItems();
    expect(items.map((i) => [i.name, i.hidden])).toEqual([
      ["A", true],
      ["B", false],
    ]);
    expect(items[0]?.color).toBe(FALLBACK_THEME.series[0]);
  });

  it("hides a state's entry only when every band sharing it is hidden", () => {
    const scene = new ChartScene();
    scene.setData(rows);
    scene.registerAxis(xAxis());
    scene.registerAxis(yAxis());
    const states = [{ label: "Run", color: "#0a0" }];
    const band = { kind: "state" as const, accessor: () => 0, states, xAxisId: "x", yAxisId: "y" };
    scene.registerSeries({ ...band, name: "M1", hidden: true });
    const second = scene.registerSeries({ ...band, name: "M2" });
    expect(scene.legendItems()[0]?.hidden).toBe(false);
    scene.updateSeries(second, { ...band, name: "M2", hidden: true });
    expect(scene.legendItems()[0]?.hidden).toBe(true);
  });
});


/* charts-long-series 02: `domain="visible"` on a y axis - the extent of what
   the x domain shows. */
describe("A y axis on the visible domain", () => {
  const course = [
    { t: 0, a: 500 },
    { t: 1, a: 20 },
    { t: 2, a: 30 },
    { t: 3, a: 25 },
    { t: 4, a: -400 },
  ];

  function visibleScene(x: AxisConfig["domain"]): ChartScene {
    const scene = new ChartScene();
    scene.setData(course);
    scene.registerAxis({ ...xAxis(), domain: x });
    scene.registerAxis({ ...yAxis(), domain: "visible" });
    return scene;
  }

  it("fits the points inside a fixed x domain", () => {
    const scene = visibleScene([1, 3]);
    scene.registerSeries(lineSeries());
    expect(scene.axisExtent("y", "y")).toEqual([20, 30]);
  });

  it("fits the whole course where the x domain is not fixed - it shows all of it", () => {
    const scene = visibleScene("nice");
    scene.registerSeries(lineSeries());
    expect(scene.axisExtent("y", "y")).toEqual([-400, 500]);
  });

  it("keeps a fixed baseline, a hidden series' silence and a limit", () => {
    const scene = visibleScene([1, 3]);
    scene.registerSeries(areaSeries());
    scene.registerSeries(lineSeries({ accessor: (d) => (d as Row).a * 10, hidden: true }));
    expect(scene.axisExtent("y", "y")).toEqual([0, 30]);
    scene.registerLimit({
      kind: "line",
      axisId: "y",
      orientation: "y",
      severity: "alarm",
      role: "specification",
      inExtent: true,
      value: 45,
    });
    expect(scene.axisExtent("y", "y")).toEqual([0, 45]);
  });

  it("follows a new x domain", () => {
    const scene = visibleScene([1, 3]);
    const x = scene.axesInOrder()[0];
    scene.registerSeries(lineSeries());
    if (x === undefined) throw new Error("no x axis");
    scene.updateAxis(x.order, { ...x.config, domain: [0, 2] });
    expect(scene.axisExtent("y", "y")).toEqual([20, 500]);
  });
});
