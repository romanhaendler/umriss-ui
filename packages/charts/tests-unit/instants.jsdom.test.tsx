// @vitest-environment jsdom

/* chart-rows-as-they-come 04, ADR-0051: an instant is a value. A `Date` puts
   its axis in time; with `time` a string is read as an ISO 8601 instant; a
   place the caller names on a time axis may be a `Date`. Milliseconds stay
   what they were. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type ReactNode } from "react";
import { LimitLine, Tooltip, useChart } from "../src";
import { focusPlot, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

async function mount(element: ReactNode): Promise<HTMLElement> {
  const r = await renderChart(element);
  unmount = r.unmount;
  return r.host;
}

const ticks = (host: HTMLElement) => [...host.querySelectorAll(".uc-axis-x .uc-tick")].map((t) => t.textContent);
const warnings = (warn: { mock: { calls: unknown[][] } }) => warn.mock.calls.map((c) => String(c[0]));

/* Six hours of a local day, an hour apart - written without an offset, so
   that the strings and the dates mean the same wherever the test runs. */
const HOURS = ["2026-03-17T06:00", "2026-03-17T07:00", "2026-03-17T08:00", "2026-03-17T09:00", "2026-03-17T10:00", "2026-03-17T11:00"];
const SIGN_INS = [820, 1460, 2130, 2480, 2390, 2200];

const asMs = HOURS.map((iso, i) => ({ t: new Date(iso).getTime(), signIns: SIGN_INS[i]! }));
const asDates = HOURS.map((iso, i) => ({ t: new Date(iso), signIns: SIGN_INS[i]! }));
const asStrings = HOURS.map((iso, i) => ({ t: iso, signIns: SIGN_INS[i]! }));

function Hours<T extends { t: number | string | Date; signIns: number }>({
  rows,
  time,
  name = "Sign-ins",
  axisId,
}: {
  rows: readonly T[];
  time?: boolean;
  name?: string;
  /** An axis of its own: DEV says a thing once per axis. */
  axisId?: string;
}) {
  const { Chart, XAxis, YAxis, Line } = useChart<{ t: number | string | Date; signIns: number }>(rows);
  return (
    <Chart ariaLabel="Sign-ins per hour">
      <XAxis id={axisId} value="t" time={time} />
      <YAxis />
      <Line value="signIns" name={name} xAxisId={axisId} />
      <Tooltip mode="x" />
    </Chart>
  );
}

/** What a reader is shown: the ticks, and the tooltip at the second reading. */
async function shown(element: ReactNode): Promise<{ ticks: (string | null)[]; tooltip: string }> {
  const host = await mount(element);
  await focusPlot(host);
  await press(host, "Home");
  await press(host, "ArrowRight");
  const result = { ticks: ticks(host), tooltip: tooltipOf(host) };
  unmount?.();
  unmount = null;
  return result;
}

describe("An instant on the x axis", () => {
  it("is a Date, and puts the axis in time without `time` being said", async () => {
    const inMs = await shown(<Hours rows={asMs} time />);
    expect(inMs.ticks.length).toBeGreaterThan(1);
    expect(inMs.tooltip).toContain("07:00");
    expect(await shown(<Hours rows={asDates} />)).toEqual(inMs);
  });

  it("is an ISO 8601 string where the axis says `time`, and DEV has nothing to say", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const inMs = await shown(<Hours rows={asMs} time />);
    expect(await shown(<Hours rows={asStrings} time />)).toEqual(inMs);
    expect(warnings(warn)).toEqual([]);
  });

  it("is read anew where `time` is said later, and where it is taken back", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const inMs = await shown(<Hours rows={asMs} time />);
    const r = await renderChart(<Hours rows={asStrings} name="Said later" />);
    unmount = r.unmount;
    expect(ticks(r.host)).toEqual(HOURS);
    await r.rerender(<Hours rows={asStrings} time name="Said later" />);
    expect(ticks(r.host)).toEqual(inMs.ticks);
    await r.rerender(<Hours rows={asStrings} name="Said later" />);
    expect(ticks(r.host)).toEqual(HOURS);
  });

  it("is named in DEV where a series mixes numbers with dates: after a number first, only numbers are read", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const rows = [asMs[0]!, { t: new Date(HOURS[1]!), signIns: 5 }, asMs[2]!];
    await mount(<Hours rows={rows} time name="Numbers, then a date" />);
    expect(warnings(warn).some((m) => m.includes('"Numbers, then a date"') && m.includes("row 1"))).toBe(true);
  });

  it("is named in DEV where a Date stands among numbers", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    function Mixed() {
      const { Chart, XAxis, YAxis, Line } = useChart<{ t: number | Date; signIns: number }>(asMs);
      return (
        <Chart ariaLabel="Mixed">
          <XAxis value="t" />
          <YAxis />
          <Line value="signIns" name="In numbers" />
          <Line data={asDates} value="signIns" name="In dates" />
        </Chart>
      );
    }
    await mount(<Mixed />);
    expect(warnings(warn).some((m) => m.includes('"In dates"') && m.includes("Date"))).toBe(true);
  });

  it("is not drawn where the string is no instant, and DEV names the series and the row", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const rows = [asStrings[0]!, { t: "next Tuesday", signIns: 5 }, asStrings[1]!, asStrings[2]!];
    const host = await mount(<Hours rows={rows} time name="With a bad row" />);
    await focusPlot(host);
    await press(host, "Home");
    await press(host, "ArrowRight");
    // The second reading is 07:00: the row between was left out.
    expect(tooltipOf(host)).toContain("07:00");
    expect(warnings(warn).some((m) => m.includes('"With a bad row"') && m.includes("row 1") && m.includes("next Tuesday"))).toBe(true);
  });
});

describe("Strings on an axis that does not say `time`", () => {
  it("are categories, and DEV asks whether `time` was meant where each is an instant with a time", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const host = await mount(<Hours rows={asStrings} axisId="asked" />);
    expect(ticks(host)).toEqual(HOURS);
    expect(warnings(warn).some((m) => m.includes('"asked"') && m.includes("`time`"))).toBe(true);
  });

  it("raise nothing where they are months or days", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const host = await mount(
      <Hours
        rows={[
          { t: "2026-01", signIns: 1 },
          { t: "2026-02", signIns: 2 },
        ]}
      />,
    );
    expect(ticks(host)).toEqual(["2026-01", "2026-02"]);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("A place the caller names on a time axis", () => {
  function Day({ dates }: { dates: boolean }) {
    const { Chart, XAxis, YAxis, Line } = useChart(asMs);
    const from = new Date("2026-03-17T00:00");
    const to = new Date("2026-03-18T00:00");
    const freeze = new Date("2026-03-17T08:30");
    return (
      <Chart ariaLabel="A day of sign-ins">
        <XAxis value="t" time domain={dates ? [from, to] : [from.getTime(), to.getTime()]} />
        <YAxis />
        <Line value="signIns" name="Sign-ins" />
        <LimitLine orientation="x" value={dates ? freeze : freeze.getTime()} label="Release freeze" />
      </Chart>
    );
  }

  /** The ticks with their places, and where the limit's label stands. */
  const places = (host: HTMLElement) => ({
    ticks: [...host.querySelectorAll<HTMLElement>(".uc-axis-x .uc-tick")].map((t) => `${t.textContent}@${t.style.left}`),
    limit: [...host.querySelectorAll<HTMLElement>(".uc-limit-label")].map((l) => `${l.textContent}@${l.style.left}`),
  });

  it("may be a Date: a fixed domain and a limit stand where their milliseconds stand", async () => {
    const inMs = places(await mount(<Day dates={false} />));
    unmount?.();
    unmount = null;
    expect(inMs.ticks.length).toBeGreaterThan(1);
    expect(inMs.limit).toHaveLength(1);
    expect(places(await mount(<Day dates />))).toEqual(inMs);
  });
});
