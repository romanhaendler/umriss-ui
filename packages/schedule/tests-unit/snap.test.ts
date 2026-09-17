/* Snapping: a wall-clock time onto a raster in local time (schedule 03).

   The time zone is Europe/Berlin (vitest.config.ts); expected instants are ISO
   text with their offset, winter and summer. */

import { describe, expect, it } from "vitest";
import { HOUR, MINUTE } from "@umriss-ui/charts";
import { snapTime } from "../src/snap";

const t = (iso: string) => Date.parse(iso);

describe("snapTime", () => {
  it("snaps onto the nearest quarter hour", () => {
    expect(snapTime(t("2026-03-17T08:07:00+01:00"), 15 * MINUTE)).toBe(t("2026-03-17T08:00:00+01:00"));
    expect(snapTime(t("2026-03-17T08:08:00+01:00"), 15 * MINUTE)).toBe(t("2026-03-17T08:15:00+01:00"));
  });

  it("snaps a shift raster onto local time, not UTC", () => {
    expect(snapTime(t("2026-03-17T13:10:00+01:00"), 8 * HOUR)).toBe(t("2026-03-17T16:00:00+01:00"));
    expect(snapTime(t("2026-07-17T09:10:00+02:00"), 8 * HOUR)).toBe(t("2026-07-17T08:00:00+02:00"));
  });

  it("leaves a time as it is without a raster", () => {
    const at = t("2026-03-17T08:07:31+01:00");
    expect(snapTime(at, 0)).toBe(at);
  });
});

describe("snapTime with an offset", () => {
  const SHIFTS = { step: 8 * HOUR, offset: 6 * HOUR };

  it("snaps onto shift changes at 06:00, 14:00 and 22:00", () => {
    expect(snapTime(t("2026-03-17T13:10:00+01:00"), SHIFTS)).toBe(t("2026-03-17T14:00:00+01:00"));
    expect(snapTime(t("2026-03-17T09:50:00+01:00"), SHIFTS)).toBe(t("2026-03-17T06:00:00+01:00"));
    expect(snapTime(t("2026-03-17T23:00:00+01:00"), SHIFTS)).toBe(t("2026-03-17T22:00:00+01:00"));
  });

  it("reaches back across midnight to the previous evening's shift", () => {
    expect(snapTime(t("2026-03-18T01:30:00+01:00"), SHIFTS)).toBe(t("2026-03-17T22:00:00+01:00"));
  });

  it("keeps the shifts on the plant's clock in summer time", () => {
    expect(snapTime(t("2026-07-17T13:10:00+02:00"), SHIFTS)).toBe(t("2026-07-17T14:00:00+02:00"));
  });

  it("means the same with a number as with an offset of zero", () => {
    const at = t("2026-03-17T13:10:00+01:00");
    expect(snapTime(at, { step: 2 * HOUR, offset: 0 })).toBe(snapTime(at, 2 * HOUR));
  });
});
