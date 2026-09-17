/* The time axis of the schedule: the fine step for a zoom, the ticks of the
   fine band, the days of the coarse band, zoom and pan (schedule 03). Snapping
   has its own file, `snap.test.ts`.

   The time zone is Europe/Berlin (vitest.config.ts). Expected instants are
   written as ISO text with their offset - the independent source - and the
   clock change of 29.03.2026 is the real one. */

import { describe, expect, it } from "vitest";
import { DAY, HOUR, MINUTE } from "@umriss-ui/charts";
import { days, fineStep, fineTicks, panDomain, zoomDomain } from "../src/timeAxis";

const t = (iso: string) => Date.parse(iso);

describe("fineStep", () => {
  it("steps in quarter hours when zoomed in close", () => {
    // 56 pixels are ten minutes.
    expect(fineStep((10 * MINUTE) / 56)).toBe(15 * MINUTE);
  });

  it("never steps finer than the quarter hour", () => {
    expect(fineStep(MINUTE / 56)).toBe(15 * MINUTE);
  });

  it("steps in hours further out", () => {
    expect(fineStep((50 * MINUTE) / 56)).toBe(HOUR);
  });

  it("takes the next readable step, not a five-hour one", () => {
    expect(fineStep((5 * HOUR) / 56)).toBe(6 * HOUR);
  });

  it("stops at the day - days are the coarse band's", () => {
    expect(fineStep((3 * DAY) / 56)).toBe(DAY);
  });
});

describe("fineTicks", () => {
  it("puts hour ticks on the local full hours", () => {
    const ticks = fineTicks([t("2026-03-17T06:10:00+01:00"), t("2026-03-17T09:00:00+01:00")], HOUR);
    expect(ticks.map((k) => k.wallClock)).toEqual([
      t("2026-03-17T07:00:00+01:00"),
      t("2026-03-17T08:00:00+01:00"),
      t("2026-03-17T09:00:00+01:00"),
    ]);
  });

  it("puts a three-hour step on local midnight, not on UTC's", () => {
    const ticks = fineTicks([t("2026-03-17T00:00:00+01:00"), t("2026-03-17T07:00:00+01:00")], 3 * HOUR);
    expect(ticks.map((k) => k.wallClock)).toEqual([
      t("2026-03-17T00:00:00+01:00"),
      t("2026-03-17T03:00:00+01:00"),
      t("2026-03-17T06:00:00+01:00"),
    ]);
  });

  it("drops ticks in removed time and places the rest in operating time", () => {
    const calendar = [
      { from: t("2026-03-17T06:00:00+01:00"), to: t("2026-03-17T08:00:00+01:00") },
      { from: t("2026-03-17T10:00:00+01:00"), to: t("2026-03-17T12:00:00+01:00") },
    ];
    // The domain is in operating time: 0 is 06:00, four hours is 12:00.
    const ticks = fineTicks([0, 4 * HOUR], HOUR, calendar);
    expect(ticks).toEqual([
      { wallClock: t("2026-03-17T06:00:00+01:00"), operatingTime: 0 },
      { wallClock: t("2026-03-17T07:00:00+01:00"), operatingTime: HOUR },
      { wallClock: t("2026-03-17T08:00:00+01:00"), operatingTime: 2 * HOUR },
      { wallClock: t("2026-03-17T11:00:00+01:00"), operatingTime: 3 * HOUR },
      { wallClock: t("2026-03-17T12:00:00+01:00"), operatingTime: 4 * HOUR },
    ]);
  });
});

describe("days", () => {
  it("gives the local days a domain touches, across the clock change", () => {
    const found = days([t("2026-03-28T12:00:00+01:00"), t("2026-03-30T12:00:00+02:00")]);
    expect(found.map((d) => [d.start, d.end])).toEqual([
      [t("2026-03-28T00:00:00+01:00"), t("2026-03-29T00:00:00+01:00")],
      [t("2026-03-29T00:00:00+01:00"), t("2026-03-30T00:00:00+02:00")],
      [t("2026-03-30T00:00:00+02:00"), t("2026-03-31T00:00:00+02:00")],
    ]);
    // The day of the change has 23 hours.
    expect(found[1]!.end - found[1]!.start).toBe(23 * HOUR);
  });

  it("places a day in operating time, collapsed where the calendar removes it", () => {
    const calendar = [
      { from: t("2026-03-17T06:00:00+01:00"), to: t("2026-03-17T22:00:00+01:00") },
      { from: t("2026-03-18T06:00:00+01:00"), to: t("2026-03-18T22:00:00+01:00") },
    ];
    const found = days([0, 32 * HOUR], calendar);
    expect(found.map((d) => [d.from, d.to])).toEqual([
      [0, 16 * HOUR],
      [16 * HOUR, 32 * HOUR],
    ]);
  });
});

describe("zoomDomain", () => {
  it("keeps the instant under the pointer where it is", () => {
    const zoomed = zoomDomain([0, 100 * MINUTE], 25 * MINUTE, 0.5, { min: MINUTE, max: DAY });
    expect(zoomed).toEqual([12.5 * MINUTE, 62.5 * MINUTE]);
  });

  it("stops at the narrowest span", () => {
    const zoomed = zoomDomain([0, 2 * HOUR], HOUR, 0.1, { min: HOUR, max: DAY });
    expect(zoomed).toEqual([30 * MINUTE, 90 * MINUTE]);
  });

  it("stops at the widest span", () => {
    const zoomed = zoomDomain([0, 20 * HOUR], 0, 3, { min: HOUR, max: DAY });
    expect(zoomed).toEqual([0, DAY]);
  });
});

describe("panDomain", () => {
  it("moves both ends by the same amount", () => {
    expect(panDomain([10 * MINUTE, 70 * MINUTE], -5 * MINUTE)).toEqual([5 * MINUTE, 65 * MINUTE]);
  });
});
