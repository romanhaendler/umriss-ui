/* A bounded list renders the rows in view; an unbounded one renders them all. */

import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AlarmList, alarmModel } from "../src";
import type { Alarm, AlarmType } from "../src";

const T0 = Date.UTC(2026, 2, 17, 10, 30, 0);
const TYPES: AlarmType[] = [{ id: "t", label: "Level high", priority: "medium" }];
const ALARMS: Alarm[] = Array.from({ length: 500 }, (_, i) => ({
  id: `a${i}`,
  type: "t",
  lifecycle: "active-unacknowledged" as const,
  raised: T0 - i * 1000,
}));

const rows = (maxHeight?: string) =>
  render(<AlarmList view={alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 })} maxHeight={maxHeight} />).container.querySelectorAll("tr[data-alarm-id]").length;

describe("AlarmList windowing", () => {
  it("renders a window of a bounded list", () => {
    expect(rows("300px")).toBeLessThan(100);
  });
  it("renders every row of an unbounded list", () => {
    expect(rows()).toBe(500);
  });
});
