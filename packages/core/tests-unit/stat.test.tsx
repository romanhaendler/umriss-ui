/* The metric tile (judging-values 05). What is checked is what a person or a
   screen reader can perceive: the accessible name, the text, the role. Never
   the class that produced the colour – otherwise the test checks the
   stylesheet and not the statement.

   The first case is the most important one in the whole package: an absent
   value must not look like a good one. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stat } from "../src/components/Stat";
import { DEFAULT_WORDING } from "../src/lib/language";
import type { LimitSet } from "../src/lib/limit";

const FURNACE: LimitSet = {
  target: 800,
  limits: [
    { value: 820, side: "upper", severity: "warning" },
    { value: 860, side: "upper", severity: "alarm" },
    { value: 760, side: "lower", severity: "warning" },
  ],
};

describe("An absent value is not ok", () => {
  it("says „kein Wert“ instead of showing a number", () => {
    render(<Stat label="Furnace temperature" value={null} unit="°C" limits={FURNACE} />);
    expect(screen.getByText(DEFAULT_WORDING.verdictUnknown)).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
  });

  it("names the label and the absence of a value in the accessible name", () => {
    render(<Stat label="Furnace temperature" value={undefined} limits={FURNACE} />);
    const group = screen.getByRole("group");
    expect(group.getAttribute("aria-label")).toContain("Furnace temperature");
    expect(group.getAttribute("aria-label")).toContain(DEFAULT_WORDING.verdictUnknown);
  });

  it("shows no unit without a value – a unit without a number claims a measurement", () => {
    render(<Stat label="Furnace temperature" value={Number.NaN} unit="°C" limits={FURNACE} />);
    expect(screen.queryByText("°C")).toBeNull();
  });
});

describe("The four verdicts asOf there as a word", () => {
  const cases: readonly [number, string][] = [
    [790, DEFAULT_WORDING.verdictOk],
    [830, DEFAULT_WORDING.verdictWarning],
    [900, DEFAULT_WORDING.verdictAlarm],
  ];

  for (const [value, word] of cases) {
    it(`${value} reads as "${word}"`, () => {
      render(<Stat label="Furnace temperature" value={value} unit="°C" limits={FURNACE} />);
      // Visible, not merely coloured: colour alone carries no meaning.
      expect(screen.getByText(word)).toBeTruthy();
    });
  }

  it("names the verdict in the accessible name too, as soon as it is not „ok“", () => {
    render(<Stat label="Furnace temperature" value={900} limits={FURNACE} />);
    expect(screen.getByRole("group").getAttribute("aria-label")).toContain(
      DEFAULT_WORDING.verdictAlarm,
    );
  });
});

describe("Value, unit and deviation", () => {
  it("shows value and unit separately", () => {
    render(<Stat label="Auslastung" value={82.4} unit="%" decimals={1} />);
    expect(screen.getByText("82,4")).toBeTruthy();
    expect(screen.getByText("%")).toBeTruthy();
  });

  it("shows the deviation from the target where there is one", () => {
    render(<Stat label="Furnace temperature" value={812} limits={FURNACE} />);
    expect(screen.getByText(DEFAULT_WORDING.deviationAbove("12"))).toBeTruthy();
  });

  it("shows no deviation without a target", () => {
    render(<Stat label="Piece count" value={412} />);
    expect(screen.queryByText(/Ziel/)).toBeNull();
  });

  it("reaches no verdict at all without limits", () => {
    // „In Ordnung“ would be a claim nobody has made. Without a rule the tile
    // stays neutral – that is the honest display of a number for which no
    // rule was named.
    render(<Stat label="Piece count" value={412} />);
    expect(screen.getByRole("group").getAttribute("data-verdict")).toBeNull();
    expect(screen.queryByText(DEFAULT_WORDING.verdictOk)).toBeNull();
    expect(screen.queryByText(DEFAULT_WORDING.verdictAlarm)).toBeNull();
  });

  it("does however say when there is no value – even without a rule", () => {
    // An absent value is unknown whether or not anyone has named a rule. That
    // is not an assessment but an observation.
    render(<Stat label="Piece count" value={null} />);
    expect(screen.getByText(DEFAULT_WORDING.verdictUnknown)).toBeTruthy();
  });

  it("names only a target, without reaching a verdict because of it", () => {
    render(<Stat label="Piece count" value={412} limits={{ target: 400 }} />);
    expect(screen.getByRole("group").getAttribute("data-verdict")).toBeNull();
    expect(screen.getByText(DEFAULT_WORDING.deviationAbove("12"))).toBeTruthy();
  });
});

describe("History", () => {
  it("draws no history line without a series", () => {
    const { container } = render(<Stat label="Piece count" value={412} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("draws one as soon as a series is there", () => {
    const { container } = render(
      <Stat label="Piece count" value={412} history={[1, 2, 3, 4]} />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("Freshness is a different axis from the verdict (ADR-0010)", () => {
  const AGES = { stale: 5 * 60_000, lost: 30 * 60_000 };
  /* The hook reads the clock – that is its job. So that the test does not do
     it, the clock stands still (repo convention: no test reads the clock). */
  const NOW = new Date("2026-03-17T10:30:00Z");

  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, shouldAdvanceTime: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps its verdict on a stale value", () => {
    // The core of the whole bundle: were `stale` the same as `unknown`, a lost
    // connection would take away exactly what a person needs then.
    const tenMinutesAgo = NOW.getTime() - 10 * 60_000;
    render(
      <Stat
        label="Furnace temperature"
        value={900}
        limits={FURNACE}
        asOf={tenMinutesAgo}
        ages={AGES}
      />,
    );
    expect(screen.getByText(DEFAULT_WORDING.verdictAlarm)).toBeTruthy();
    expect(screen.getByText(DEFAULT_WORDING.freshnessStale)).toBeTruthy();
    expect(screen.getByRole("group").getAttribute("data-verdict")).toBe("alarm");
  });

  it("tells „veraltet“ apart from „keine Verbindung“", () => {
    const oneHourAgo = NOW.getTime() - 60 * 60_000;
    render(
      <Stat label="Furnace temperature" value={900} asOf={oneHourAgo} ages={AGES} />,
    );
    expect(screen.getByText(DEFAULT_WORDING.freshnessDisconnected)).toBeTruthy();
    expect(screen.queryByText(DEFAULT_WORDING.freshnessStale)).toBeNull();
  });

  it("shows no freshness at all without ages – and starts no cadence", () => {
    render(<Stat label="Furnace temperature" value={900} asOf={NOW.getTime()} />);
    expect(screen.queryByText(DEFAULT_WORDING.freshnessFresh)).toBeNull();
  });
});
