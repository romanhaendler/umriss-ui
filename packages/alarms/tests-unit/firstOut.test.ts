/* First-out, the first of a flood and the flood rate: pure calculation with
   literal times. */

import { describe, expect, it } from "vitest";
import { alarmModel, detectFlood } from "../src/alarmModel";
import type { Alarm, AlarmBase, AlarmType } from "../src/alarmModel";

const T0 = Date.UTC(2026, 7, 26, 6, 0, 0);
const TYPES: AlarmType[] = [{ id: "a", label: "A", priority: "high" }];
const alarm = (id: string, raised: number, extra: Partial<AlarmBase> = {}): Alarm => ({
  id,
  type: "a",
  lifecycle: "active-unacknowledged",
  raised,
  ...extra,
});
const firstOuts = (alarms: Alarm[]) =>
  alarmModel({ alarms, types: TYPES, asOf: T0 + 5_000, keepDone: true }).filtered
    .filter((row) => row.firstOut)
    .map((row) => row.id);

describe("first-out", () => {
  it("marks exactly the earliest of 40 alarms of one group raised within 2 s", () => {
    const alarms = Array.from({ length: 40 }, (_, i) => alarm(`t${i}`, T0 + ((i * 37) % 40) * 50, { group: "trip" }));
    expect(firstOuts(alarms)).toEqual(["t0"]);
  });

  it("gives equal times to the lower sequence, then to the input order", () => {
    const g = { group: "trip" };
    expect(firstOuts([alarm("a", T0, { ...g, sequence: 7 }), alarm("b", T0, { ...g, sequence: 3 })])).toEqual(["b"]);
    expect(firstOuts([alarm("a", T0, g), alarm("b", T0, g)])).toEqual(["a"]);
    expect(firstOuts([alarm("a", T0, { ...g, sequence: 1 }), alarm("b", T0, g)])).toEqual(["a"]);
  });

  it("marks one per group, never an alarm without a group, and counts done ones", () => {
    const done = alarm("done", T0, { group: "g1", lifecycle: "resolved-acknowledged" });
    const rows = alarmModel({
      alarms: [alarm("x", T0 + 10), done, alarm("y", T0 + 20, { group: "g2" }), alarm("z", T0)],
      types: TYPES,
      asOf: T0 + 1000,
    }).filtered;
    expect(rows.filter((r) => r.firstOut).map((r) => r.id)).toEqual(["y"]);
  });

  it("gives a first-out to a group whose earliest alarm is done and not shown", () => {
    const done = alarm("done", T0, { group: "g1", lifecycle: "resolved-acknowledged" });
    const rows = alarmModel({ alarms: [done, alarm("late", T0 + 10, { group: "g1" })], types: TYPES, asOf: T0 + 1000 }).filtered;
    expect(rows.map((r) => [r.id, r.firstOut])).toEqual([["late", false]]);
  });
});

describe("the flood's first and the rate", () => {
  const rule = { windowMs: 600_000, atLeast: 2 };
  it("names the earliest alarm of the flood by the same rule", () => {
    const flood = detectFlood([alarm("b", T0, { sequence: 2 }), alarm("a", T0, { sequence: 1 }), alarm("c", T0 + 1)], rule, T0 + 1000);
    expect(flood?.first).toBe("a");
  });

  it("counts the alarms of the last ten minutes, the window's lower edge excluded and the as-of time included", () => {
    const asOf = T0 + 600_000;
    const alarms = [alarm("edge", T0), alarm("in", T0 + 1), alarm("now", asOf), alarm("future", asOf + 1)];
    const projection = alarmModel({ alarms, types: TYPES, asOf, flood: rule });
    expect(projection.rate).toBe(2);
    expect(projection.flood?.first).toBe("in");
    expect(projection.flood?.count).toBe(2);
  });
});
