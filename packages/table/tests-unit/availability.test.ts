/* Availability - the second field beside the lifecycle (alarm-standards 01).

   ISA-18.2 knows, beside the lifecycle, three special states an alarm can be
   put into from any position: snoozed, suppressed, disabled (ISA: shelved,
   suppressed by design, out of service).
   They are a second field and never a fifth, sixth and seventh lifecycle
   value, because the two answer different questions - "what happened to the
   condition" and "is it in front of anyone" - and a snoozed alarm keeps
   its lifecycle underneath.

   The expected values are literals written from the rules in the spec, not
   computed by the module. The clock is a parameter: 26.08.2026, 06:00 UTC. */

import { describe, expect, it } from "vitest";
import {
  alarmModel,
  availabilityAt,
  isHidden,
  enable,
  snooze,
  disable,
  unsnooze,
  type Alarm,
  type AlarmType,
} from "../src/alarms/alarmModel";

const T0 = Date.UTC(2026, 7, 26, 6, 0, 0);
const MIN = 60_000;

const base: Alarm = { id: "a1", type: "temp", lifecycle: "active-unacknowledged", raised: T0 - 5 * MIN };
const snoozed: Alarm = { ...base, availability: "snoozed", snooze: { until: T0 + 30 * MIN, by: "M. Keller" } };
const suppressed: Alarm = { ...base, availability: "suppressed" };
const disabledOne: Alarm = { ...base, availability: "disabled" };

describe("snooze", () => {
  it("snoozes an alarm in service, with the time it returns and who snoozed it", () => {
    expect(snooze(base, T0 + 60 * MIN, "J. Weber")).toEqual({
      id: "a1",
      type: "temp",
      lifecycle: "active-unacknowledged",
      raised: T0 - 5 * MIN,
      availability: "snoozed",
      snooze: { until: T0 + 60 * MIN, by: "J. Weber" },
    });
  });

  it("snoozes anew what is snoozed - the later snooze replaces the earlier", () => {
    expect(snooze(snoozed, T0 + 90 * MIN, "J. Weber").snooze).toEqual({ until: T0 + 90 * MIN, by: "J. Weber" });
  });

  it("leaves a disabled or suppressed alarm as it is", () => {
    // The stronger removal is not overwritten by the weaker one: a snooze that
    // expired would otherwise put an alarm disabled for maintenance back in service.
    expect(snooze(disabledOne, T0 + 60 * MIN, "J. Weber")).toBe(disabledOne);
    expect(snooze(suppressed, T0 + 60 * MIN, "J. Weber")).toBe(suppressed);
  });

  it("never touches the lifecycle", () => {
    const resolved: Alarm = { ...base, lifecycle: "resolved-unacknowledged", resolved: T0 - MIN };
    expect(snooze(resolved, T0 + 60 * MIN, "J. Weber").lifecycle).toBe("resolved-unacknowledged");
  });
});

describe("unsnooze", () => {
  it("returns a snoozed alarm to service and drops the snooze", () => {
    expect(unsnooze(snoozed)).toEqual({ ...base, availability: "in-service" });
  });

  it("leaves everything that is not snoozed as it is", () => {
    expect(unsnooze(base)).toBe(base);
    expect(unsnooze(disabledOne)).toBe(disabledOne);
    expect(unsnooze(suppressed)).toBe(suppressed);
  });
});

describe("disable", () => {
  it("disables an alarm in service or snoozed, the snooze dropped", () => {
    expect(disable(base)).toEqual({ ...base, availability: "disabled" });
    expect(disable(snoozed)).toEqual({ ...base, availability: "disabled" });
  });

  it("leaves what is disabled or suppressed as it is", () => {
    // Suppressed is the application's logic's field; disabled and
    // enabled, it would come back in service with the suppression lost.
    expect(disable(disabledOne)).toBe(disabledOne);
    expect(disable(suppressed)).toBe(suppressed);
  });
});

describe("enable", () => {
  it("returns a disabled alarm to service", () => {
    expect(enable(disabledOne)).toEqual({ ...base, availability: "in-service" });
  });

  it("leaves a snoozed or suppressed alarm as it is - each has its own way back", () => {
    expect(enable(snoozed)).toBe(snoozed);
    expect(enable(suppressed)).toBe(suppressed);
    expect(enable(base)).toBe(base);
  });
});

describe("availabilityAt - the snooze expires by the model's clock", () => {
  it("is in service without a statement", () => {
    expect(availabilityAt(base, T0)).toBe("in-service");
  });

  it("is snoozed before the snooze's end", () => {
    expect(availabilityAt(snoozed, T0 + 30 * MIN - 1)).toBe("snoozed");
  });

  it("is back in service when the end is reached - reaching it is enough", () => {
    expect(availabilityAt(snoozed, T0 + 30 * MIN)).toBe("in-service");
    expect(availabilityAt(snoozed, T0 + 31 * MIN)).toBe("in-service");
  });

  it("lets the other two special states stand whatever the time", () => {
    expect(availabilityAt(disabledOne, T0 + 10_000 * MIN)).toBe("disabled");
    expect(availabilityAt(suppressed, T0 + 10_000 * MIN)).toBe("suppressed");
  });
});

describe("isHidden", () => {
  it("is everything but in service", () => {
    expect(isHidden("in-service")).toBe(false);
    expect(isHidden("snoozed")).toBe(true);
    expect(isHidden("suppressed")).toBe(true);
    expect(isHidden("disabled")).toBe(true);
  });
});

describe("alarmModel - hidden, never absent", () => {
  const TYPES: AlarmType[] = [
    { id: "temp", label: "Temperature", priority: "high" },
    { id: "level", label: "Level", priority: "medium" },
  ];
  const ALARMS: Alarm[] = [
    { ...snoozed, id: "snoozed-high" },
    { ...disabledOne, id: "disabled-high", raised: T0 - 2 * MIN },
    { id: "active-medium", type: "level", lifecycle: "active-unacknowledged", raised: T0 - 9 * MIN },
  ];
  const ids = (rows: readonly { id: string }[]) => rows.map((row) => row.id);

  it("keeps every hidden alarm in the list and counts them", () => {
    const projection = alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 });
    expect(ids(projection.filtered)).toHaveLength(3);
    expect(projection.hiddenAlarms).toBe(2);
  });

  it("orders what is in service above what is hidden, whatever the priority", () => {
    // Below it by kind: snoozed first - a person's own, time-limited
    // decision and the nearest to coming back - then disabled.
    const projection = alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 });
    expect(ids(projection.filtered)).toEqual(["active-medium", "snoozed-high", "disabled-high"]);
  });

  it("calls nobody to a hidden alarm: the live figure counts only what is in service", () => {
    const projection = alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 });
    expect(projection.activeUnacknowledged).toBe(1);
  });

  it("puts an expired snooze back in service at the as-of time, and it counts again", () => {
    const projection = alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 + 30 * MIN });
    const row = projection.filtered.find((r) => r.id === "snoozed-high");
    expect(row?.availability).toBe("in-service");
    expect(projection.hiddenAlarms).toBe(1);
    expect(projection.activeUnacknowledged).toBe(2);
    expect(ids(projection.filtered)[0]).toBe("snoozed-high");
  });

  it("is a view by the table's own filter: only what is hidden", () => {
    const projection = alarmModel(
      { alarms: ALARMS, types: TYPES, asOf: T0 },
      { filter: (row) => isHidden(row.availability) },
    );
    expect(ids(projection.filtered)).toEqual(["snoozed-high", "disabled-high"]);
    expect(projection.hiddenAlarms).toBe(2);
  });
});
