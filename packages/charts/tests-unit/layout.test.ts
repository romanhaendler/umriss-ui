/* Layout engine (R-7.3): bands on all four sides, stacking order, gaps,
   hysteresis per band and the edge collision of the x labels.
   The text measurement is replaced by a deterministic stand-in, so that the
   expected values are exact independently of font and platform. */

import { describe, expect, it, vi } from "vitest";
import CHARTS_CSS from "../src/styles/charts.css?raw";
import { toOperatingTime, toWallClock } from "../src/operatingTime";
import {
  BAND_GAP,
  CLASS_TICK,
  TICK_GAP,
  TICK_LEN,
  computeLayout,
  type AxisInput,
  type AxisLayout,
} from "../src/layout";

/** Tick label: 7 px per character, line height 14; title: line height 16. */
function measure(text: string, className: string) {
  return className === CLASS_TICK
    ? { width: text.length * 7, height: 14 }
    : { width: text.length * 8, height: 16 };
}

const X_BAND = TICK_LEN + TICK_GAP + 14; // 23

function axis(part: Partial<AxisInput> & Pick<AxisInput, "id" | "orientation" | "position">): AxisInput {
  return {
    key: `${part.orientation}:${part.id}`,
    grid: false,
    extent: [0, 100],
    domainMode: "nice",
    ...part,
  };
}

function fixed(text: string) {
  return () => text;
}

function find(axes: readonly AxisLayout[], key: string): AxisLayout {
  const hit = axes.find((a) => a.key === key);
  if (hit === undefined) throw new Error(`axis ${key} is missing from the layout`);
  return hit;
}

/* library-audit 03: the default labelling of an operating time axis ran through
   `toLocaleString(undefined, …)` and thereby depended on the machine - in a
   workspace whose other package nails the notation down. A screenshot from a
   colleague would not have matched one's own. Since charts-essentials 01 the
   notation is en-GB by level, the same as a time axis without a calendar
   (timeAxis.test.ts) - fixed, never the machine's. */
describe("computeLayout - operating time without a formatter of its own", () => {
  it("labels the clock in en-GB and asks for no locale", () => {
    const spy = vi.spyOn(Date.prototype, "toLocaleString");
    const start = new Date(2026, 2, 16, 6, 0).getTime();
    const calendar = [{ from: start, to: start + 16 * 3_600_000 }];
    const layout = computeLayout({
      width: 900,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({
          id: "x",
          orientation: "x",
          position: "bottom",
          calendar,
          extent: [0, 16 * 3_600_000],
          domainMode: "data",
          tickCount: 8,
        }),
        axis({ id: "y", orientation: "y", position: "left" }),
      ],
      measure,
      hysteresis: new Map(),
    });

    const labels = find(layout.axes, "x:x").ticks.map((t) => t.label);
    expect(labels).toEqual(["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("computeLayout - the ground plan", () => {
  it("subtracts the axis bands and the padding from the container size (R-3.1)", () => {
    const layout = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({ id: "y", orientation: "y", position: "left", tickFormat: fixed("AAA") }),
        axis({ id: "x", orientation: "x", position: "bottom" }),
      ],
      measure,
      hysteresis: new Map(),
    });
    const yBand = TICK_LEN + TICK_GAP + 21; // 30
    expect(layout.plot).toEqual({
      x: 8 + yBand,
      y: 8,
      width: 500 - 8 - 8 - yBand,
      height: 300 - 8 - 8 - X_BAND,
    });
  });

  it("widens a y band for a limit label longer than its ticks", () => {
    const layout = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({ id: "y", orientation: "y", position: "left", tickFormat: fixed("AAA"), limitLabels: ["Warning"] }),
        axis({ id: "x", orientation: "x", position: "bottom" }),
      ],
      measure,
      hysteresis: new Map(),
    });
    // "Warning": 49px plus the label's 2px padding on either side.
    expect(layout.plot.x).toBe(8 + TICK_LEN + TICK_GAP + 49 + 4);
  });

  it("occupies all four sides at once", () => {
    const layout = computeLayout({
      width: 600,
      height: 400,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({ id: "l", orientation: "y", position: "left", tickFormat: fixed("AA") }),
        axis({ id: "r", orientation: "y", position: "right", tickFormat: fixed("AA") }),
        axis({ id: "b", orientation: "x", position: "bottom" }),
        axis({ id: "t", orientation: "x", position: "top" }),
      ],
      measure,
      hysteresis: new Map(),
    });
    const yBand = TICK_LEN + TICK_GAP + 14; // 23
    expect(layout.plot.x).toBe(8 + yBand);
    expect(layout.plot.width).toBe(600 - 16 - 2 * yBand);
    expect(layout.plot.y).toBe(8 + X_BAND);
    expect(layout.plot.height).toBe(400 - 16 - 2 * X_BAND);
    // Bands lie on their side and cover the edge of the plot.
    expect(find(layout.axes, "y:r").band.x).toBe(layout.plot.x + layout.plot.width);
    expect(find(layout.axes, "x:t").band.y).toBe(8);
  });

  it("never lets the plot area go negative", () => {
    const layout = computeLayout({
      width: 20,
      height: 20,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({ id: "y", orientation: "y", position: "left", tickFormat: fixed("AAAAAAAA") }),
        axis({ id: "x", orientation: "x", position: "bottom" }),
      ],
      measure,
      hysteresis: new Map(),
    });
    expect(layout.plot.width).toBe(0);
    expect(layout.plot.height).toBe(0);
  });
});

describe("computeLayout - stacking and gaps (R-3.2)", () => {
  it("stacks axes of the same side from the inside outwards in registration order", () => {
    const layout = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({ id: "a", orientation: "y", position: "left", tickFormat: fixed("AAA") }),
        axis({ id: "b", orientation: "y", position: "left", tickFormat: fixed("BBBBB") }),
        axis({ id: "x", orientation: "x", position: "bottom" }),
      ],
      measure,
      hysteresis: new Map(),
    });
    const a = find(layout.axes, "y:a");
    const b = find(layout.axes, "y:b");
    expect(a.size).toBe(TICK_LEN + TICK_GAP + 21);
    expect(b.size).toBe(TICK_LEN + TICK_GAP + 35);
    expect(a.stack).toBe(0);
    expect(b.stack).toBe(1);
    // The axis registered first lies at the plot …
    expect(a.band.x + a.band.width).toBe(layout.plot.x);
    // … the second outside it, separated by exactly one gap.
    expect(a.band.x - (b.band.x + b.band.width)).toBe(BAND_GAP);
    expect(b.band.x).toBe(8);
  });

  it("stacks correctly on the right and at the bottom too", () => {
    const layout = computeLayout({
      width: 600,
      height: 400,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({ id: "r1", orientation: "y", position: "right", tickFormat: fixed("AA") }),
        axis({ id: "r2", orientation: "y", position: "right", tickFormat: fixed("AAAA") }),
        axis({ id: "b1", orientation: "x", position: "bottom" }),
        axis({ id: "b2", orientation: "x", position: "bottom" }),
      ],
      measure,
      hysteresis: new Map(),
    });
    const r1 = find(layout.axes, "y:r1");
    const r2 = find(layout.axes, "y:r2");
    expect(r1.band.x).toBe(layout.plot.x + layout.plot.width);
    expect(r2.band.x - (r1.band.x + r1.band.width)).toBe(BAND_GAP);

    const b1 = find(layout.axes, "x:b1");
    const b2 = find(layout.axes, "x:b2");
    expect(b1.band.y).toBe(layout.plot.y + layout.plot.height);
    expect(b2.band.y - (b1.band.y + b1.band.height)).toBe(BAND_GAP);
  });

  it("counts the rotated y title into the band width", () => {
    const without = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [axis({ id: "y", orientation: "y", position: "left", tickFormat: fixed("AAA") })],
      measure,
      hysteresis: new Map(),
    });
    const withTitle = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({
          id: "y",
          orientation: "y",
          position: "left",
          label: "Title",
          tickFormat: fixed("AAA"),
        }),
      ],
      measure,
      hysteresis: new Map(),
    });
    // Title height 16 plus a gap of 4 - the width of the title text plays no part,
    // because it stands rotated.
    expect(find(withTitle.axes, "y:y").size - find(without.axes, "y:y").size).toBe(20);
  });
});

describe("computeLayout - hysteresis per band (R-3.4)", () => {
  const build = (label: string, hysteresis: Map<string, number>) =>
    computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({ id: "a", orientation: "y", position: "left", tickFormat: fixed(label) }),
        axis({ id: "b", orientation: "y", position: "right", tickFormat: fixed("AAA") }),
      ],
      measure,
      hysteresis,
    });

  it("grows at once, shrinks only from 8 px of excess", () => {
    const hysteresis = new Map<string, number>();
    expect(find(build("AAAAAA", hysteresis).axes, "y:a").size).toBe(TICK_LEN + TICK_GAP + 42);
    // One character less: 7 px of excess - the band stays put.
    expect(find(build("AAAAA", hysteresis).axes, "y:a").size).toBe(TICK_LEN + TICK_GAP + 42);
    // Four characters less: 28 px of excess - the band shrinks.
    expect(find(build("AA", hysteresis).axes, "y:a").size).toBe(TICK_LEN + TICK_GAP + 14);
    // And grows again at once.
    expect(find(build("AAAAAAA", hysteresis).axes, "y:a").size).toBe(TICK_LEN + TICK_GAP + 49);
  });

  it("stabilises every band individually", () => {
    const hysteresis = new Map<string, number>();
    build("AAAAAA", hysteresis);
    const second = build("AA", hysteresis);
    // Only band a has changed; b stays at its own size.
    expect(find(second.axes, "y:b").size).toBe(TICK_LEN + TICK_GAP + 21);
    expect(hysteresis.get("y:a")).toBe(TICK_LEN + TICK_GAP + 14);
    expect(hysteresis.get("y:b")).toBe(TICK_LEN + TICK_GAP + 21);
  });
});

describe("computeLayout - ticks and the edge collision", () => {
  it("keeps the first and last x label inside the container (R-3.3)", () => {
    const layout = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({
          id: "x",
          orientation: "x",
          position: "bottom",
          extent: [0, 100],
          tickFormat: fixed("XXXXXXXXXX"), // 70 px wide
        }),
      ],
      measure,
      hysteresis: new Map(),
    });
    const ticks = find(layout.axes, "x:x").ticks;
    const first = ticks[0];
    const last = ticks[ticks.length - 1];
    expect(first).toBeDefined();
    expect(last).toBeDefined();
    // Centred, the first label would lie at -27 px - it is shifted, not cut off.
    expect(first?.labelLeft).toBe(0);
    expect(first?.labelWidth).toBe(70);
    expect((last?.labelLeft ?? 0) + 70).toBe(500);
    // The tick mark itself does not travel with it.
    expect(first?.px).toBe(layout.plot.x);
  });

  it("places ticks on the domain and respects tickCount", () => {
    const layout = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({
          id: "y",
          orientation: "y",
          position: "left",
          extent: [3, 97],
          tickCount: 5,
        }),
      ],
      measure,
      hysteresis: new Map(),
    });
    const y = find(layout.axes, "y:y");
    expect(y.domain).toEqual([0, 100]);
    expect(y.ticks.map((t) => t.value)).toEqual([0, 20, 40, 60, 80, 100]);
    // The y range is inverted: the minimum lies at the bottom.
    expect(y.scale.toPx(0)).toBe(layout.plot.y + layout.plot.height);
    expect(y.scale.toPx(100)).toBe(layout.plot.y);
  });

  it("takes over a fixed domain unchanged", () => {
    const layout = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({
          id: "y",
          orientation: "y",
          position: "left",
          extent: [3, 97],
          domainMode: [0, 50],
        }),
      ],
      measure,
      hysteresis: new Map(),
    });
    expect(find(layout.axes, "y:y").domain).toEqual([0, 50]);
  });

  it("lets a fixed domain win against an extent widened by the baseline too", () => {
    // An area or a bar pulls the 0 into the extent. Whoever gives the domain
    // themselves gets it unchanged all the same.
    const layout = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({
          id: "y",
          orientation: "y",
          position: "left",
          extent: [0, 140],
          domainMode: [100, 140],
        }),
      ],
      measure,
      hysteresis: new Map(),
    });
    expect(find(layout.axes, "y:y").domain).toEqual([100, 140]);
  });

  it("takes the data boundaries exactly for domain=\"data\"", () => {
    const layout = computeLayout({
      width: 500,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({
          id: "y",
          orientation: "y",
          position: "left",
          extent: [3.4, 96.6],
          domainMode: "data",
        }),
      ],
      measure,
      hysteresis: new Map(),
    });
    expect(find(layout.axes, "y:y").domain).toEqual([3.4, 96.6]);
  });
});

/* charts-fixes 08: "labels of x limits get no band space". A y limit's label
   stands beside the ticks and is as wide as it is - the band has to widen for
   it (above). An x limit's label stands in the row of the tick labels, and that
   row is one tick line high in every x band. So the label fits exactly when it is
   set as a tick label is - and that is what holds it, rather than a reservation
   that would add nothing. */
describe("computeLayout - the label of an x limit", () => {
  const declarations = (selector: string) => {
    const body = CHARTS_CSS.split(`${selector} {`)[1]?.split("}")[0] ?? "";
    const pick = (property: string) => new RegExp(`${property}:\\s*([^;]+);`).exec(body)?.[1];
    return { fontSize: pick("font-size"), lineHeight: pick("line-height") };
  };

  it("is set in the tick labels' size and line height, so the tick row holds it", () => {
    const tick = declarations(".uc-tick-label");
    expect(tick.fontSize).toBeDefined();
    expect(tick.lineHeight).toBeDefined();
    expect(declarations(".uc-limit-label")).toEqual(tick);
  });
});

/* charts-fixes 09: an operating-time axis stood its day and half-day ticks on
   UTC's midnight and labelled them in local time - "01:00" under a day change
   in CET - and took explicit ticks as operating time. The tests run under
   Europe/Berlin (vitest.config.ts). */
describe("computeLayout - ticks of an operating-time axis", () => {
  const HOUR = 3_600_000;
  const start = new Date(2026, 2, 16, 0, 0).getTime();

  function xAxisOf(calendar: { from: number; to: number }[], part: Partial<AxisInput> = {}) {
    const total = calendar.reduce((sum, i) => sum + i.to - i.from, 0);
    return computeLayout({
      width: 900,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        axis({
          id: "x",
          orientation: "x",
          position: "bottom",
          calendar,
          extent: [0, total],
          domainMode: "data",
          ...part,
        }),
        axis({ id: "y", orientation: "y", position: "left" }),
      ],
      measure,
      hysteresis: new Map(),
    });
  }

  it("stands half-day ticks on local midnight and noon", () => {
    const layout = xAxisOf([{ from: start, to: start + 72 * HOUR }]);
    const ticks = find(layout.axes, "x:x").ticks;
    expect(ticks.length).toBeGreaterThan(2);
    for (const tick of ticks) {
      const d = new Date(toWallClock(tick.value, [{ from: start, to: start + 72 * HOUR }]));
      expect([0, 12]).toContain(d.getHours());
      expect(d.getMinutes()).toBe(0);
    }
  });

  it("takes explicit ticks in wall-clock time and maps them, dropping removed time", () => {
    const calendar = [
      { from: start + 6 * HOUR, to: start + 14 * HOUR },
      { from: start + 30 * HOUR, to: start + 38 * HOUR },
    ];
    const wall = [start + 8 * HOUR, start + 20 * HOUR, start + 32 * HOUR];
    const layout = xAxisOf(calendar, { tickValues: wall });
    const values = find(layout.axes, "x:x").ticks.map((t) => t.value);
    expect(values).toEqual([toOperatingTime(wall[0] as number, calendar), toOperatingTime(wall[2] as number, calendar)]);
    expect(values).toEqual([2 * HOUR, 10 * HOUR]);
  });
});

/* charts-long-series 05: `alignTicks` on a further y axis puts its ticks on
   the rows of the first y axis' grid. */
describe("computeLayout - alignTicks", () => {
  function layout(align: boolean, firstPosition: "left" | "right" = "left") {
    return computeLayout({
      width: 600,
      height: 300,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      axes: [
        axis({ id: "x", orientation: "x", position: "bottom" }),
        axis({ id: "t", orientation: "y", position: firstPosition, extent: [596, 855], grid: true }),
        axis({ id: "g", orientation: "y", position: firstPosition === "left" ? "right" : "left", extent: [0, 107], alignTicks: align }),
      ],
      measure,
      hysteresis: new Map(),
    }).axes;
  }

  it("stands every tick of the aligned axis on a grid row of the first", () => {
    for (const side of ["left", "right"] as const) {
      const axes = layout(true, side);
      const first = find(axes, "y:t").ticks.map((t) => t.px);
      const aligned = find(axes, "y:g").ticks.map((t) => t.px);
      expect(aligned).toHaveLength(first.length);
      aligned.forEach((px, i) => expect(px).toBeCloseTo(first[i] as number, 6));
    }
  });

  it("keeps the extent inside and the steps 1-2-5", () => {
    const g = find(layout(true), "y:g");
    expect(g.domain[0]).toBeLessThanOrEqual(0);
    expect(g.domain[1]).toBeGreaterThanOrEqual(107);
    const step = (g.ticks[1]?.value ?? 0) - (g.ticks[0]?.value ?? 0);
    expect([1, 2, 5]).toContain(step / 10 ** Math.floor(Math.log10(step)));
  });

  it("changes nothing without it", () => {
    const g = find(layout(false), "y:g");
    expect(g.ticks.map((t) => t.px)).not.toEqual(find(layout(false), "y:t").ticks.map((t) => t.px));
  });
});
