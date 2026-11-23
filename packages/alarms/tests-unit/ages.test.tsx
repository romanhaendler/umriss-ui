import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AlarmBanner, AlarmList, alarmModel } from "../src";
import type { AlarmInput } from "../src";

const NOW = new Date("2026-03-17T10:30:00Z").getTime();
const view = alarmModel({ alarms: [], types: [], asOf: NOW });
const OLD = NOW - 3_600_000;

type Ages = { stale: number; lost: number };
type P = { asOf?: number | null; ages?: Ages; freshness?: Ages };
const components = {
  AlarmList: (p: P) => <AlarmList view={view} aria-label="List" {...p} />,
  AlarmBanner: (p: P) => <AlarmBanner view={view} {...p} />,
};

describe.each(Object.entries(components))("%s ages", (name, Component) => {
  afterEach(cleanup);
  const lost = () => document.querySelector('[data-freshness="lost"]');

  it("judges the data by ages", () => {
    render(<Component asOf={OLD} ages={{ stale: 1000, lost: 2000 }} />);
    expect(lost()).not.toBeNull();
  });

  it("keeps freshness for one minor and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = render(<Component asOf={OLD} freshness={{ stale: 1000, lost: 2000 }} />);
    rerender(<Component asOf={OLD} freshness={{ stale: 1000, lost: 2000 }} />);
    expect(lost()).not.toBeNull();
    expect(warn.mock.calls.filter(([m]) => String(m).includes(`${name} freshness`))).toHaveLength(1);
    warn.mockRestore();
  });

  it("lets ages win over freshness", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Component asOf={OLD} ages={{ stale: 1e12, lost: 2e12 }} freshness={{ stale: 1000, lost: 2000 }} />);
    expect(lost()).toBeNull();
  });

  it("reads a null as-of time as lost, with no age", () => {
    render(<Component asOf={null} ages={{ stale: 1000, lost: 2000 }} />);
    expect(lost()).not.toBeNull();
    expect(screen.queryByText(/ago|·/)).toBeNull();
  });
});

describe("alarmModel asOf", () => {
  it("takes a Date as it takes milliseconds", () => {
    const alarms = [{ id: "1", type: "x", lifecycle: "active-unacknowledged" as const, raised: NOW - 5000 }];
    const input: AlarmInput = { alarms, types: [], asOf: new Date(NOW) };
    expect(alarmModel(input).filtered[0]!.age).toBe(5000);
  });
});
