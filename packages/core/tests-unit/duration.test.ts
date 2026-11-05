import { describe, expect, it } from "vitest";
import { formatDuration } from "../src/lib/duration";
import { DEFAULT_WORDING } from "../src/lib/language/wording";
import { GERMAN_WORDING } from "../src/lib/language/de";

const S = 1000;
const MIN = 60 * S;
const HOUR = 60 * MIN;

describe("formatDuration", () => {
  it("rounds 1 h 29 min 40 s to the whole minute, in both languages", () => {
    const ms = HOUR + 29 * MIN + 40 * S;
    expect(formatDuration(ms, DEFAULT_WORDING)).toBe(`${DEFAULT_WORDING.hoursShort(1)} ${DEFAULT_WORDING.minutesShort(30)}`);
    expect(formatDuration(ms, GERMAN_WORDING)).toBe("1 Std 30 Min");
  });
  it("drops zero units but keeps a lone zero minute", () => {
    expect(formatDuration(2 * HOUR, DEFAULT_WORDING)).toBe(DEFAULT_WORDING.hoursShort(2));
    expect(formatDuration(0, DEFAULT_WORDING)).toBe(DEFAULT_WORDING.minutesShort(0));
  });
  it("counts days only on request", () => {
    const ms = 26 * HOUR;
    expect(formatDuration(ms, DEFAULT_WORDING)).toBe(DEFAULT_WORDING.hoursShort(26));
    expect(formatDuration(ms, DEFAULT_WORDING, { days: true })).toBe(`${DEFAULT_WORDING.days(1)} ${DEFAULT_WORDING.hoursShort(2)}`);
    expect(formatDuration(24 * HOUR, DEFAULT_WORDING, { days: true })).toBe(DEFAULT_WORDING.days(1));
  });
});
