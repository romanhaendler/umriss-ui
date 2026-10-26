/* The schedule plans in the zone the formats name. The reader's zone is
   Europe/Berlin (vitest.config.ts); instants are ISO text with their offset. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { HOUR, MINUTE } from "@umriss-ui/charts";
import { LanguageProvider, useFormats } from "@umriss-ui/core";
import { useSchedule } from "../src";
import { snapTime } from "../src/snap";
import { days, fineTicks, timeText } from "../src/timeAxis";

const t = (iso: string) => Date.parse(iso);
const NY = "America/New_York";

describe("the time axis in a named zone", () => {
  // 1 November 2026: New York's clocks go back from 02:00 EDT to 01:00 EST.
  const domain: [number, number] = [t("2026-11-01T00:00:00-04:00"), t("2026-11-01T04:00:00-05:00")];

  it("ticks every half hour through the doubled hour", () => {
    const ticks = fineTicks(domain, 30 * MINUTE, [], NY).map((k) => k.wallClock);
    expect(ticks).toContain(t("2026-11-01T01:30:00-04:00"));
    expect(ticks).toContain(t("2026-11-01T01:00:00-05:00"));
    expect(ticks).toContain(t("2026-11-01T01:30:00-05:00"));
    expect(ticks).toHaveLength(11);
  });

  it("keeps a two-hour step on even hours on both sides", () => {
    const ticks = fineTicks(domain, 2 * HOUR, [], NY).map((k) => k.wallClock);
    expect(ticks).toEqual([
      t("2026-11-01T00:00:00-04:00"),
      t("2026-11-01T02:00:00-05:00"),
      t("2026-11-01T04:00:00-05:00"),
    ]);
  });

  it("starts its days on the zone's midnights", () => {
    const found = days([t("2026-10-31T12:00:00-04:00"), t("2026-11-02T12:00:00-05:00")], [], NY);
    expect(found.map((d) => d.start)).toEqual([
      t("2026-10-31T00:00:00-04:00"),
      t("2026-11-01T00:00:00-04:00"),
      t("2026-11-02T00:00:00-05:00"),
    ]);
  });
});

describe("snapTime in a named zone", () => {
  const SHIFTS = { step: 8 * HOUR, offset: 6 * HOUR };
  it("snaps handovers to 06:00, 14:00 and 22:00 Berlin time across the change", () => {
    const Berlin = "Europe/Berlin";
    expect(snapTime(t("2026-10-24T13:40:00+02:00"), SHIFTS, Berlin)).toBe(t("2026-10-24T14:00:00+02:00"));
    expect(snapTime(t("2026-10-25T21:40:00+01:00"), SHIFTS, Berlin)).toBe(t("2026-10-25T22:00:00+01:00"));
    expect(snapTime(t("2026-10-26T05:40:00+01:00"), SHIFTS, Berlin)).toBe(t("2026-10-26T06:00:00+01:00"));
  });

  it("snaps to the zone's hours, not the reader's", () => {
    expect(snapTime(t("2026-03-17T13:10:00-04:00"), SHIFTS, NY)).toBe(t("2026-03-17T14:00:00-04:00"));
  });
});

describe("timeText", () => {
  function Texts({ at }: { at: number[] }) {
    const formats = useFormats();
    return <p>{at.map((instant) => timeText(formats, instant)).join("|")}</p>;
  }
  it("carries the offset inside the doubled hour only", () => {
    const { container } = render(
      <LanguageProvider formats={{ timeZone: "Europe/Berlin" }}>
        <Texts at={[t("2026-10-25T02:00:00+02:00"), t("2026-10-25T02:30:00+01:00"), t("2026-10-25T03:00:00+01:00")]} />
      </LanguageProvider>,
    );
    expect(container.textContent).toBe("02:00 GMT+2|02:30 GMT+1|03:00");
  });
});

describe("the zone label", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, width: 800, height: 200, right: 800, bottom: 200, toJSON: () => ({}),
    });
  });
  afterEach(() => vi.restoreAllMocks());

  function Plan() {
    const { Schedule, Lane } = useSchedule({ initialView: { domain: [t("2026-03-17T06:00:00+01:00"), t("2026-03-17T14:00:00+01:00")] } });
    return (
      <Schedule aria-label="Plan">
        <Lane id="press" label="Press" />
      </Schedule>
    );
  }
  const zoned = (timeZone: string) =>
    render(
      <LanguageProvider formats={{ timeZone }}>
        <Plan />
      </LanguageProvider>,
    );

  it("names a zone that is not the reader's, once", () => {
    const { container } = zoned(NY);
    const labels = container.querySelectorAll('[data-schedule-overlay="zone label"]');
    expect(labels).toHaveLength(1);
    expect(labels[0]?.textContent).toBe("New York Time");
  });

  it("is absent for the reader's own zone", () => {
    const { container } = zoned("Europe/Berlin");
    expect(container.querySelector('[data-schedule-overlay="zone label"]')).toBeNull();
  });
});
