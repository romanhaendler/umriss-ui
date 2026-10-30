/* In a pane of definite height the list pages with a fitted page; with a bound
   it windows its rows; in flow it shows every row. jsdom lays nothing out: the
   table's frame answers the framed probe when the test says it is in a pane, a
   row is 20 px, and the scroll area's height is the one the test sets. */

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlarmList, alarmModel } from "../src";
import type { Alarm, AlarmType } from "../src";

const T0 = Date.UTC(2026, 2, 17, 10, 30, 0);
const TYPES: AlarmType[] = [{ id: "t", label: "Level high", priority: "medium" }];
const ALARMS: Alarm[] = Array.from({ length: 100 }, (_, i) => ({
  id: `a${i}`,
  type: "t",
  lifecycle: "active-unacknowledged" as const,
  raised: T0 - i * 1000,
}));
const view = () => alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 });

function pane(area: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const asked = this.style.height.startsWith("calc(100% - ");
    const row = this.tagName === "TR" || this.tagName === "THEAD" || this.tagName === "TFOOT";
    const height = row ? 20 : asked ? 93 : 100;
    return { height, top: 0, left: 0, bottom: height, right: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) };
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.querySelector(":scope > table") ? area : 0;
  });
}

const alarmRows = (container: HTMLElement) => container.querySelectorAll("tr[data-alarm-id]").length;

afterEach(() => vi.restoreAllMocks());

describe("AlarmList in a pane", () => {
  it("pages with the rows that fit in a pane of definite height", () => {
    pane(20 + 12 * 20);
    const { container } = render(<AlarmList view={view()} />);
    expect(alarmRows(container)).toBe(12);
    expect(screen.getByRole("navigation").textContent).toContain("1–12");
  });

  it("windows its rows with maxHeight, and has no pager", () => {
    pane(20 + 12 * 20);
    const { container } = render(<AlarmList view={view()} maxHeight="300px" />);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(alarmRows(container)).toBeGreaterThan(0);
  });

  it("shows every row in flow", () => {
    const { container } = render(<AlarmList view={view()} />);
    expect(alarmRows(container)).toBe(100);
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});
