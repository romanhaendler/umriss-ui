/* Quality on the tile: the third axis. What is checked is the accessible name
   and the text, never the line style that marks the figure. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stat } from "../src/components/Stat";
import { DEFAULT_WORDING } from "../src/lib/language";
import type { LimitSet } from "../src/lib/limit";

const FURNACE: LimitSet = {
  limits: [
    { value: 820, side: "upper", severity: "warning" },
    { value: 860, side: "upper", severity: "alarm" },
  ],
};
const AGES = { stale: 120_000, lost: 600_000 };
const NOW = new Date("2026-10-26T12:00:00Z").getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

const nameOf = () => screen.getByRole("group").getAttribute("aria-label");

describe("A Stat says its quality", () => {
  it("is what it was without quality, and with good", () => {
    const { rerender } = render(<Stat label="Furnace" value={805} unit="°C" limits={FURNACE} />);
    const before = nameOf();
    rerender(<Stat label="Furnace" value={805} unit="°C" limits={FURNACE} quality="good" />);
    expect(nameOf()).toBe(before);
    expect(screen.queryByText(DEFAULT_WORDING.qualityGood)).toBeNull();
    expect(screen.queryByText(DEFAULT_WORDING.qualityBad)).toBeNull();
  });

  it.each([
    ["uncertain", DEFAULT_WORDING.qualityUncertain],
    ["bad", DEFAULT_WORDING.qualityBad],
  ] as const)("shows %s and appends it to the name after the verdict", (quality, word) => {
    render(<Stat label="Furnace" value={905} unit="°C" limits={FURNACE} quality={quality} />);
    expect(screen.getByText(word)).toBeTruthy();
    expect(nameOf()).toBe(`Furnace: 905 °C, ${DEFAULT_WORDING.verdictAlarm}, ${word}`);
  });

  it("keeps the alarm of a bad value", () => {
    render(<Stat label="Furnace" value={905} limits={FURNACE} quality="bad" />);
    expect(screen.getByText(DEFAULT_WORDING.verdictAlarm)).toBeTruthy();
    expect(nameOf()).toContain(DEFAULT_WORDING.verdictAlarm);
  });

  it("shows the quality word and the freshness word of a stale, bad value", () => {
    render(<Stat label="Furnace" value={805} limits={FURNACE} quality="bad" asOf={NOW - 300_000} ages={AGES} />);
    expect(screen.getByText(DEFAULT_WORDING.freshnessStale)).toBeTruthy();
    expect(screen.getByText(DEFAULT_WORDING.qualityBad)).toBeTruthy();
  });

  it("says no value and bad quality for a null, bad value", () => {
    render(<Stat label="Furnace" value={null} limits={FURNACE} quality="bad" />);
    expect(screen.getByRole("group").textContent).toContain(DEFAULT_WORDING.qualityBad);
    expect(nameOf()).toBe(`Furnace: ${DEFAULT_WORDING.verdictUnknown}, ${DEFAULT_WORDING.qualityBad}`);
  });
});
