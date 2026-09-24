/* Availability - the second field beside the lifecycle (alarm-standards 01).

   ISA-18.2 knows, beside the lifecycle, three special states an alarm can be
   put into from any position: shelved, suppressed by design, out of service.
   They are a second field and never a fifth, sixth and seventh lifecycle
   value, because the two answer different questions - "what happened to the
   condition" and "is it in front of the operator" - and a shelved alarm keeps
   its lifecycle underneath.

   The expected values are literals written from the rules in the spec, not
   computed by the module. The clock is a parameter: 26.08.2026, 06:00 UTC. */

import { describe, expect, it } from "vitest";
import {
  alarmModel,
  availabilityAt,
  isHiddenFromOperation,
  returnToService,
  shelve,
  takeOutOfService,
  unshelve,
  type Alarm,
  type AlarmType,
} from "../src/alarms/alarmModel";

const T0 = Date.UTC(2026, 7, 26, 6, 0, 0);
const MIN = 60_000;

const base: Alarm = { id: "a1", type: "temp", lifecycle: "standing-unacknowledged", raised: T0 - 5 * MIN };
const shelved: Alarm = { ...base, availability: "shelved", shelf: { until: T0 + 30 * MIN, by: "M. Keller" } };
const suppressed: Alarm = { ...base, availability: "suppressed-by-design" };
const outOfService: Alarm = { ...base, availability: "out-of-service" };

describe("shelve", () => {
  it("shelves an alarm in service, with the time it returns and who shelved it", () => {
    expect(shelve(base, T0 + 60 * MIN, "J. Weber")).toEqual({
      id: "a1",
      type: "temp",
      lifecycle: "standing-unacknowledged",
      raised: T0 - 5 * MIN,
      availability: "shelved",
      shelf: { until: T0 + 60 * MIN, by: "J. Weber" },
    });
  });

  it("shelves anew what is shelved - the later shelf replaces the earlier", () => {
    expect(shelve(shelved, T0 + 90 * MIN, "J. Weber").shelf).toEqual({ until: T0 + 90 * MIN, by: "J. Weber" });
  });

  it("leaves an alarm out of service or suppressed by design as it is", () => {
    // The stronger removal is not overwritten by the weaker one: a shelf that
    // expired would otherwise put a pump under maintenance back in service.
    expect(shelve(outOfService, T0 + 60 * MIN, "J. Weber")).toBe(outOfService);
    expect(shelve(suppressed, T0 + 60 * MIN, "J. Weber")).toBe(suppressed);
  });

  it("never touches the lifecycle", () => {
    const cleared: Alarm = { ...base, lifecycle: "cleared-unacknowledged", cleared: T0 - MIN };
    expect(shelve(cleared, T0 + 60 * MIN, "J. Weber").lifecycle).toBe("cleared-unacknowledged");
  });
});

describe("unshelve", () => {
  it("returns a shelved alarm to service and drops the shelf", () => {
    expect(unshelve(shelved)).toEqual({ ...base, availability: "in-service" });
  });

  it("leaves everything that is not shelved as it is", () => {
    expect(unshelve(base)).toBe(base);
    expect(unshelve(outOfService)).toBe(outOfService);
    expect(unshelve(suppressed)).toBe(suppressed);
  });
});

describe("takeOutOfService", () => {
  it("takes an alarm in service or on a shelf out of service, the shelf dropped", () => {
    expect(takeOutOfService(base)).toEqual({ ...base, availability: "out-of-service" });
    expect(takeOutOfService(shelved)).toEqual({ ...base, availability: "out-of-service" });
  });

  it("leaves what is out of service or suppressed by design as it is", () => {
    // Suppressed by design is the plant's logic's field; taken out of service
    // and returned, it would come back in service with the suppression lost.
    expect(takeOutOfService(outOfService)).toBe(outOfService);
    expect(takeOutOfService(suppressed)).toBe(suppressed);
  });
});

describe("returnToService", () => {
  it("returns an alarm out of service to service", () => {
    expect(returnToService(outOfService)).toEqual({ ...base, availability: "in-service" });
  });

  it("leaves a shelved or suppressed alarm as it is - each has its own way back", () => {
    expect(returnToService(shelved)).toBe(shelved);
    expect(returnToService(suppressed)).toBe(suppressed);
    expect(returnToService(base)).toBe(base);
  });
});

describe("availabilityAt - the shelf expires by the model's clock", () => {
  it("is in service without a statement", () => {
    expect(availabilityAt(base, T0)).toBe("in-service");
  });

  it("is shelved before the shelf's end", () => {
    expect(availabilityAt(shelved, T0 + 30 * MIN - 1)).toBe("shelved");
  });

  it("is back in service when the end is reached - reaching it is enough", () => {
    expect(availabilityAt(shelved, T0 + 30 * MIN)).toBe("in-service");
    expect(availabilityAt(shelved, T0 + 31 * MIN)).toBe("in-service");
  });

  it("lets the other two special states stand whatever the time", () => {
    expect(availabilityAt(outOfService, T0 + 10_000 * MIN)).toBe("out-of-service");
    expect(availabilityAt(suppressed, T0 + 10_000 * MIN)).toBe("suppressed-by-design");
  });
});

describe("isHiddenFromOperation", () => {
  it("is everything but in service", () => {
    expect(isHiddenFromOperation("in-service")).toBe(false);
    expect(isHiddenFromOperation("shelved")).toBe(true);
    expect(isHiddenFromOperation("suppressed-by-design")).toBe(true);
    expect(isHiddenFromOperation("out-of-service")).toBe(true);
  });
});

describe("alarmModel - hidden, never absent", () => {
  const TYPES: AlarmType[] = [
    { id: "temp", label: "Temperature", priority: "high" },
    { id: "level", label: "Level", priority: "medium" },
  ];
  const ALARMS: Alarm[] = [
    { ...shelved, id: "shelved-high" },
    { ...outOfService, id: "oos-high", raised: T0 - 2 * MIN },
    { id: "standing-medium", type: "level", lifecycle: "standing-unacknowledged", raised: T0 - 9 * MIN },
  ];
  const ids = (rows: readonly { id: string }[]) => rows.map((row) => row.id);

  it("keeps every hidden alarm in the list and counts them", () => {
    const projection = alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 });
    expect(ids(projection.filtered)).toHaveLength(3);
    expect(projection.hiddenFromOperation).toBe(2);
  });

  it("orders what is in service above what is hidden, whatever the priority", () => {
    // Below it by kind: shelved first - the operator's own, time-limited
    // decision and the nearest to coming back - then out of service.
    const projection = alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 });
    expect(ids(projection.filtered)).toEqual(["standing-medium", "shelved-high", "oos-high"]);
  });

  it("calls nobody to a hidden alarm: the live figure counts only what is in service", () => {
    const projection = alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 });
    expect(projection.standingUnacknowledged).toBe(1);
  });

  it("puts an expired shelf back in service at the as-of time, and it counts again", () => {
    const projection = alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 + 30 * MIN });
    const row = projection.filtered.find((r) => r.id === "shelved-high");
    expect(row?.availability).toBe("in-service");
    expect(projection.hiddenFromOperation).toBe(1);
    expect(projection.standingUnacknowledged).toBe(2);
    expect(ids(projection.filtered)[0]).toBe("shelved-high");
  });

  it("is a view by the table's own filter: only what is hidden from operation", () => {
    const projection = alarmModel(
      { alarms: ALARMS, types: TYPES, asOf: T0 },
      { filter: (row) => isHiddenFromOperation(row.availability) },
    );
    expect(ids(projection.filtered)).toEqual(["shelved-high", "oos-high"]);
    expect(projection.hiddenFromOperation).toBe(2);
  });
});
