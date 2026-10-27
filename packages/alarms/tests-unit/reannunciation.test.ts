/* A shelve that runs out brings its alarm back to be seen (ISA-18.2 A6.4).
   Times are literals: 26.08.2026, 06:00 UTC plus minutes. */

import { describe, expect, it } from "vitest";
import { acknowledge, alarmModel, countAcknowledgeable, snooze, unsnooze } from "../src/alarmModel";
import type { Alarm, AlarmType } from "../src/alarmModel";

const T0 = Date.UTC(2026, 7, 26, 6, 0, 0);
const MIN = 60_000;
const UNTIL = T0 + 10 * MIN;
const TYPES: AlarmType[] = [{ id: "temp", label: "Temperature", priority: "high" }];
const acked: Alarm = { id: "a", type: "temp", lifecycle: "active-acknowledged", raised: T0 - MIN, acknowledgedAt: T0 - MIN / 2 };
const shelved = snooze(acked, UNTIL, "M. Weber");

const rowAt = (alarm: Alarm, asOf: number) => alarmModel({ alarms: [alarm], types: TYPES, asOf, keepDone: true }).visible[0]!;

describe("a shelve that ends", () => {
  it("one millisecond before until the alarm is shelved and acknowledged", () => {
    const row = rowAt(shelved, UNTIL - 1);
    expect(row.availability).toBe("snoozed");
    expect(row.lifecycle).toBe("active-acknowledged");
    expect(countAcknowledgeable([shelved], ["a"], UNTIL - 1)).toBe(0);
  });

  it("at until it is in alarm and unacknowledged, counted, and acknowledgeable", () => {
    const view = alarmModel({ alarms: [shelved], types: TYPES, asOf: UNTIL });
    expect(view.visible[0]!.availability).toBe("in-service");
    expect(view.visible[0]!.lifecycle).toBe("active-unacknowledged");
    expect(view.activeUnacknowledged).toBe(1);
    expect(countAcknowledgeable([shelved], ["a"], UNTIL)).toBe(1);
    const result = acknowledge([shelved], ["a"], UNTIL);
    expect(result.count).toBe(1);
    expect(result.alarms[0]).toMatchObject({ lifecycle: "active-acknowledged", acknowledgedAt: UNTIL, availability: "in-service" });
    expect(result.alarms[0]!.snooze).toBeUndefined();
  });

  it("does not acknowledge a shelve that has not ended", () => {
    expect(acknowledge([shelved], ["a"], UNTIL - 1).count).toBe(0);
  });

  it("after unsnooze an alarm acknowledged before its shelve is still acknowledged", () => {
    expect(rowAt(unsnooze(shelved), UNTIL + MIN).lifecycle).toBe("active-acknowledged");
  });

  it("a resolved alarm keeps its stored lifecycle", () => {
    const resolved: Alarm = { ...shelved, lifecycle: "resolved-acknowledged", resolved: T0 };
    expect(rowAt(resolved, UNTIL + MIN).lifecycle).toBe("resolved-acknowledged");
    const unseen: Alarm = { ...shelved, lifecycle: "resolved-unacknowledged", resolved: T0 };
    expect(rowAt(unseen, UNTIL + MIN).lifecycle).toBe("resolved-unacknowledged");
  });
});
