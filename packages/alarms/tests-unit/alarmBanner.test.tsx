import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AlarmBanner, alarmModel } from "../src";
import type { Alarm, AlarmType } from "../src";

const NOW = new Date("2026-03-17T10:30:00Z").getTime();
const TYPES: AlarmType[] = [
  { id: "c", label: "Reactor trip", priority: "critical" },
  { id: "h", label: "Furnace hot", priority: "high" },
  { id: "l", label: "Filter fouled", priority: "low" },
];
const alarm = (id: string, type: string, lifecycle: Alarm["lifecycle"] = "active-unacknowledged", raised = NOW - 60_000): Alarm => ({ id, type, lifecycle, raised });
const view = (alarms: Alarm[]) => alarmModel({ alarms, types: TYPES, asOf: NOW });

describe("AlarmBanner", () => {
  it("shows the worst alarm and the counts per priority", () => {
    render(<AlarmBanner view={view([alarm("1", "l"), alarm("2", "c"), alarm("3", "h"), alarm("4", "h")])} />);
    const region = screen.getByRole("region", { name: "Alarms" });
    expect(region.textContent).toContain("Reactor trip");
    expect(region.textContent).toContain("3 more");
    expect(screen.getByRole("group", { name: "Priority 2, high: 2" })).toBeTruthy();
  });

  it("says what holds without unacknowledged alarms", () => {
    const { rerender } = render(<AlarmBanner view={view([alarm("1", "c", "active-acknowledged")])} />);
    expect(screen.getByText("No unacknowledged alarms")).toBeTruthy();
    rerender(<AlarmBanner view={view([])} asOf={NOW - 3_600_000} freshness={{ stale: 1000, lost: 2000 }} />);
    expect(screen.getAllByText(/connection/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("No unacknowledged alarms")).toBeNull();
  });

  it("reports intents only with their handlers", () => {
    const onAcknowledge = vi.fn();
    const onOpen = vi.fn();
    const { rerender } = render(<AlarmBanner view={view([alarm("1", "c")])} />);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<AlarmBanner view={view([alarm("1", "c")])} onAcknowledge={onAcknowledge} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Acknowledge" }));
    fireEvent.click(screen.getByRole("button", { name: "Open list" }));
    expect(onAcknowledge).toHaveBeenCalledWith(["1"]);
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("alerts only for a new alarm of higher priority than the one shown", () => {
    const alert = () => screen.getByRole("alert");
    const { rerender } = render(<AlarmBanner view={view([alarm("1", "h")])} />);
    expect(alert().textContent).toBe("");
    rerender(<AlarmBanner view={view([alarm("1", "h"), alarm("2", "h")])} />);
    expect(alert().textContent).toBe("");
    rerender(<AlarmBanner view={view([alarm("1", "h"), alarm("2", "h"), alarm("3", "l")])} />);
    expect(alert().textContent).toBe("");
    rerender(<AlarmBanner view={view([alarm("1", "h", "active-acknowledged"), alarm("2", "h"), alarm("3", "l")])} />);
    expect(alert().textContent).toBe("");
    rerender(<AlarmBanner view={view([alarm("1", "h"), alarm("2", "h"), alarm("3", "l"), alarm("4", "c")])} />);
    expect(alert().textContent).toContain("critical");
    expect(alert().textContent).toContain("Reactor trip");
  });

  it("annunciates new alarms with the highest priority, and the last one's going", () => {
    const onAnnunciate = vi.fn();
    const { rerender } = render(<AlarmBanner view={view([alarm("1", "h")])} onAnnunciate={onAnnunciate} />);
    expect(onAnnunciate).not.toHaveBeenCalled();
    rerender(<AlarmBanner view={view([alarm("1", "h"), alarm("2", "l"), alarm("3", "c")])} onAnnunciate={onAnnunciate} />);
    expect(onAnnunciate).toHaveBeenLastCalledWith({ kind: "new", priority: "critical" });
    rerender(<AlarmBanner view={view([alarm("1", "h", "active-acknowledged"), alarm("2", "l"), alarm("3", "c")])} onAnnunciate={onAnnunciate} />);
    expect(onAnnunciate).toHaveBeenCalledTimes(1);
    rerender(<AlarmBanner view={view([alarm("1", "h", "active-acknowledged"), alarm("2", "l", "active-acknowledged"), alarm("3", "c", "active-acknowledged")])} onAnnunciate={onAnnunciate} />);
    expect(onAnnunciate).toHaveBeenLastCalledWith({ kind: "cleared" });
    expect(onAnnunciate).toHaveBeenCalledTimes(2);
  });

  it("counts a shelve that ran out as new", () => {
    const onAnnunciate = vi.fn();
    const shelved = (asOf: number) =>
      alarmModel({
        alarms: [{ ...alarm("1", "c", "active-acknowledged"), availability: "snoozed", snooze: { until: NOW, by: "A" } } as Alarm],
        types: TYPES,
        asOf,
      });
    const { rerender } = render(<AlarmBanner view={shelved(NOW - 1000)} onAnnunciate={onAnnunciate} />);
    rerender(<AlarmBanner view={shelved(NOW)} onAnnunciate={onAnnunciate} />);
    expect(onAnnunciate).toHaveBeenCalledWith({ kind: "new", priority: "critical" });
  });

  it("counts per priority over the filtered set", () => {
    const filtered = alarmModel(
      { alarms: [alarm("1", "c"), alarm("2", "l")], types: TYPES, asOf: NOW },
      { filter: (row) => row.priority === "low" },
    );
    expect(filtered.unacknowledgedByPriority).toEqual({ critical: 0, high: 0, medium: 0, low: 1 });
  });
});
