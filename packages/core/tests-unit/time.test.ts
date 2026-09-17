/* The daylight-saving change (picker-shared-modules). The hardest piece of
   correctness in the package, and until now checked only with throwaway
   scripts. Europe/Berlin 2026: on 29.03. the clock jumps from 02:00 to 03:00
   (02:30 does not exist), on 25.10. from 03:00 back to 02:00 (02:30 exists
   twice). */

import { describe, expect, it } from "vitest";
import { dstChoiceFor, resolveLocalTime, truncateInstant } from "../src/components/DatePicker/time";

/* The two 02:30 of 25.10.2026, built from UTC and not from wall-clock time:
   the wall-clock time is precisely what is ambiguous here. */
const EARLIER_0230 = new Date("2026-10-25T00:30:00Z"); // 02:30 CEST
const LATER_0230 = new Date("2026-10-25T01:30:00Z"); // 02:30 CET

/* library-audit 02: reopening always set the choice to "earlier" and shifted a
   later value by an hour on the next "Apply". */
describe("dstChoiceFor", () => {
  it("calls the earlier 02:30 earlier", () => {
    expect(dstChoiceFor(EARLIER_0230)).toBe("earlier");
  });

  it("calls the later 02:30 later", () => {
    expect(dstChoiceFor(LATER_0230)).toBe("later");
  });

  it("holds the choice with seconds and milliseconds too", () => {
    expect(dstChoiceFor(new Date(LATER_0230.getTime() + 42_123))).toBe("later");
    expect(dstChoiceFor(new Date(EARLIER_0230.getTime() + 42_123))).toBe("earlier");
  });

  it("calls an unambiguous time earlier", () => {
    expect(dstChoiceFor(new Date(2026, 5, 15, 10, 0, 0))).toBe("earlier");
  });
});

/* "Now" is an exact instant and has nothing to resolve. To truncate through the
   wall-clock time (`setSeconds(0)`) would be the same mistake once more:
   ECMAScript resolves a doubled wall-clock time to the earlier one. */
describe("truncateInstant", () => {
  it("truncates to the minute without seconds and stays in the later 02:30", () => {
    const now = new Date(LATER_0230.getTime() + 40_500);
    expect(truncateInstant(now, false).getTime()).toBe(LATER_0230.getTime());
  });

  it("keeps the second with seconds and throws away only the milliseconds", () => {
    const now = new Date(LATER_0230.getTime() + 40_500);
    expect(truncateInstant(now, true).getTime()).toBe(LATER_0230.getTime() + 40_000);
  });
});

describe("resolveLocalTime", () => {
  it("runs in the time zone Europe/Berlin", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("Europe/Berlin");
  });

  it("reports an ordinary time as ok", () => {
    const status = resolveLocalTime(2026, 5, 15, 10, 0, 0);
    expect(status.kind).toBe("ok");
    if (status.kind !== "ok") throw new Error("unexpected");
    expect([status.date.getHours(), status.date.getMinutes()]).toEqual([10, 0]);
  });

  it("recognises the skipped hour when the clock goes forward", () => {
    const status = resolveLocalTime(2026, 2, 29, 2, 30, 0);
    expect(status.kind).toBe("missing");
  });

  it("leaves 03:30 on the day of the change untouched", () => {
    expect(resolveLocalTime(2026, 2, 29, 3, 30, 0).kind).toBe("ok");
  });

  it("recognises the doubled hour when the clock goes back", () => {
    const status = resolveLocalTime(2026, 9, 25, 2, 30, 0);
    expect(status.kind).toBe("ambiguous");
    if (status.kind !== "ambiguous") throw new Error("unexpected");
    // Exactly one hour apart, earlier before later, the same wall-clock time.
    expect(status.later.getTime() - status.earlier.getTime()).toBe(3_600_000);
    expect(status.earlier.getHours()).toBe(2);
    expect(status.later.getHours()).toBe(2);
  });

  it("leaves 01:30 on the day of the change back untouched", () => {
    expect(resolveLocalTime(2026, 9, 25, 1, 30, 0).kind).toBe("ok");
  });
});
