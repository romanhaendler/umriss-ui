/* Alarm model. The library receives alarms and owns their life course - it
   generates none. What is checked is the pure core: the four states, the default
   order, the return band, frequency and flood. No clock, every as-of time is a
   parameter. */

import { describe, expect, it } from "vitest";
import {
  detectFlood,
  frequencyByType,
  isStanding,
  hasReturned,
  ALARM_COLUMNS,
  alarmModel,
  alarmColumns,
  nextLifecycleState,
  acknowledge,
  countAcknowledgeable,
  type AlarmRow,
  type LifecycleState,
  type Alarm,
  type AlarmType,
  type Priority,
} from "../src/alarms/alarmModel";
import { DEFAULT_WORDING, mergeLanguage } from "@umriss-ui/core";

/* A fixed moment instead of a clock: 26.08.2026, 06:00 UTC. */
const T0 = Date.UTC(2026, 7, 26, 6, 0, 0);

/* library-audit 03: the seven column names stood in German in the pure module
   and reached the CSV header row and the column menu that way. The module can
   read no context; it is given the wording like `standardPresets`. */
describe("alarmColumns – the label from the wording", () => {
  const described = (columns: typeof ALARM_COLUMNS) =>
    columns.map((s) => ({ id: s.id, label: s.label, searchable: s.searchable, hideable: s.hideable }));

  it("ALARM_COLUMNS is the default wording's shape", () => {
    // The labels before the rebuild, from the module's history - not from its
    // new definition.
    expect(ALARM_COLUMNS.map((s) => s.label)).toEqual([
      "Alarm",
      "State",
      "Priority",
      "Acknowledgement",
      "Raised",
      "Age",
      "Frequency",
    ]);
    expect(described(ALARM_COLUMNS)).toEqual(described(alarmColumns(DEFAULT_WORDING)));
  });

  it("takes every label from the wording passed in", () => {
    const { wording } = mergeLanguage({ wording: { columnAge: "Alarm age", columnAcknowledgement: "Ack" } });
    const labels = new Map(alarmColumns(wording).map((s) => [s.id, s.label]));
    expect(labels.get("age")).toBe("Alarm age");
    expect(labels.get("acknowledgement")).toBe("Ack");
    expect(labels.get("type")).toBe("Alarm");
  });

  it("passes the caller's columns into the projection", () => {
    const { wording } = mergeLanguage({ wording: { columnLifecycleState: "Lifecycle" } });
    const projection = alarmModel({ alarms: [], types: [], asOf: T0, columns: alarmColumns(wording) });
    expect(projection.columns.find((s) => s.id === "lifecycle")?.label).toBe("Lifecycle");
  });

  it("takes the default columns without a statement", () => {
    const projection = alarmModel({ alarms: [], types: [], asOf: T0 });
    expect(projection.columns.find((s) => s.id === "lifecycle")?.label).toBe("State");
  });
});

const TYPES: AlarmType[] = [
  {
    id: "boiler-pressure",
    label: "Boiler pressure too high",
    priority: "high",
    returnBand: { direction: "obere", limit: 80, returnTo: 75 },
  },
  {
    id: "flow-temp",
    label: "Flow temperature too low",
    priority: "medium",
    returnBand: { direction: "untere", limit: 20, returnTo: 25 },
  },
  { id: "filter-change", label: "Change filter", priority: "low" },
];

const alarm = (
  id: string,
  type: string,
  lifecycle: LifecycleState,
  raised: number,
  rest: Partial<Alarm> = {},
): Alarm => ({ id, type, lifecycle, raised, ...rest });

const ids = (rows: readonly AlarmRow[]) => rows.map((row) => row.id);

/* All four states of one type, with times lying apart. */
const FOUR: Alarm[] = [
  alarm("m-au", "boiler-pressure", "standing-unacknowledged", T0 - 400_000),
  alarm("m-aq", "boiler-pressure", "standing-acknowledged", T0 - 300_000, { acknowledgedAt: T0 - 250_000 }),
  alarm("m-gu", "boiler-pressure", "cleared-unacknowledged", T0 - 200_000, { cleared: T0 - 150_000 }),
  alarm("m-gq", "boiler-pressure", "cleared-acknowledged", T0 - 100_000, {
    cleared: T0 - 50_000,
    acknowledgedAt: T0 - 40_000,
  }),
];

/* ---------------------------------------------------------------------- */

describe("alarmModel – the fleeting alarm", () => {
  /* It came, it went, nobody saw it. That is the state the ordinary
     implementation loses, and that is why it stands first. */

  it("stays in the model – only cleared and acknowledged leaves the list", () => {
    const projection = alarmModel({ alarms: FOUR, types: TYPES, asOf: T0 });
    expect(projection.filtered).toHaveLength(3);
    expect(ids(projection.filtered)).toContain("m-gu");
    expect(ids(projection.filtered)).not.toContain("m-gq");
  });

  it("stands in the default order before the acknowledged one that is still standing", () => {
    const projection = alarmModel({ alarms: FOUR, types: TYPES, asOf: T0 });
    // Equal priority: unacknowledged first (newest first), then acknowledged.
    expect(ids(projection.filtered)).toEqual(["m-gu", "m-au", "m-aq"]);
  });

  it("survives free-text search and paging", () => {
    const projection = alarmModel(
      { alarms: FOUR, types: TYPES, asOf: T0 },
      { search: "Boiler pressure", pageSize: 2 },
    );
    expect(projection.filtered).toHaveLength(3);
    expect(ids(projection.visible)).toEqual(["m-gu", "m-au"]);
  });

  it("disappears only through a filter that expressly wants standing ones only", () => {
    const projection = alarmModel(
      { alarms: FOUR, types: TYPES, asOf: T0 },
      { filter: (row) => isStanding(row.lifecycle) },
    );
    // The caller may do that - but it is his decision, not the model's, and
    // that is exactly why the state is one field with four values.
    expect(ids(projection.filtered)).toEqual(["m-au", "m-aq"]);
  });

  it("shows the alarm that is done as well on request", () => {
    const projection = alarmModel({
      alarms: FOUR,
      types: TYPES,
      asOf: T0,
      keepDone: true,
    });
    expect(projection.filtered).toHaveLength(4);
  });
});

describe("alarmModel – the four transitions", () => {
  it("comes: a new alarm stands and is unacknowledged", () => {
    expect(nextLifecycleState("cleared-acknowledged", "raised")).toBe("standing-unacknowledged");
  });

  it("acknowledged: the standing one stays standing", () => {
    expect(nextLifecycleState("standing-unacknowledged", "acknowledged")).toBe("standing-acknowledged");
  });

  it("clears before acknowledged: the fleeting alarm comes into being", () => {
    const cleared = nextLifecycleState("standing-unacknowledged", "cleared");
    expect(cleared).toBe("cleared-unacknowledged");
    expect(nextLifecycleState(cleared, "acknowledged")).toBe("cleared-acknowledged");
  });

  it("acknowledged before clears: the same final position, another way there", () => {
    const acknowledged = nextLifecycleState("standing-unacknowledged", "acknowledged");
    expect(acknowledged).toBe("standing-acknowledged");
    expect(nextLifecycleState(acknowledged, "cleared")).toBe("cleared-acknowledged");
  });

  it("a renewed coming demands a new acknowledgement", () => {
    expect(nextLifecycleState("standing-acknowledged", "raised")).toBe("standing-unacknowledged");
  });

  it("repeats without consequence", () => {
    expect(nextLifecycleState("cleared-acknowledged", "cleared")).toBe("cleared-acknowledged");
    expect(nextLifecycleState("standing-acknowledged", "acknowledged")).toBe("standing-acknowledged");
  });
});

describe("alarmModel – the default order", () => {
  /* Twelve alarms: four states × three priorities. The expectation is formed by
     hand from the rule - priority, then acknowledgement, then time (newest
     first) -, not read off a run. */
  const TYPE_PER_PRIORITY: Record<Priority, string> = {
    high: "boiler-pressure",
    medium: "flow-temp",
    low: "filter-change",
  };
  const OFFSET: Record<string, number> = { au: 100_000, gu: 200_000, aq: 300_000, gq: 400_000 };
  const LIFECYCLE: Record<string, LifecycleState> = {
    au: "standing-unacknowledged",
    gu: "cleared-unacknowledged",
    aq: "standing-acknowledged",
    gq: "cleared-acknowledged",
  };

  // Built the wrong way round, so that the sort has something to do.
  const TWELVE: Alarm[] = ["gq", "aq", "gu", "au"].flatMap((short) =>
    (["low", "medium", "high"] as const).map((p) =>
      alarm(`${p}-${short}`, TYPE_PER_PRIORITY[p], LIFECYCLE[short]!, T0 - OFFSET[short]!),
    ),
  );

  it("orders priority, then acknowledgement, then time", () => {
    const projection = alarmModel({
      alarms: TWELVE,
      types: TYPES,
      asOf: T0,
      keepDone: true,
    });
    expect(ids(projection.filtered)).toEqual([
      "high-au",
      "high-gu",
      "high-aq",
      "high-gq",
      "medium-au",
      "medium-gu",
      "medium-aq",
      "medium-gq",
      "low-au",
      "low-gu",
      "low-aq",
      "low-gq",
    ]);
  });

  it("can be replaced by another value, not merely shouted over", () => {
    const projection = alarmModel(
      { alarms: TWELVE, types: TYPES, asOf: T0, keepDone: true },
      { sort: { column: "raised", direction: "asc" } },
    );
    // Oldest first: gq (400_000), then aq, gu, au - stable within each group in
    // input order, so low, medium, high.
    expect(ids(projection.filtered).slice(0, 3)).toEqual(["low-gq", "medium-gq", "high-gq"]);
    expect(ids(projection.filtered).at(-1)).toBe("high-au");
  });

  it("counts the standing and unacknowledged ones for the screen reader", () => {
    const projection = alarmModel({ alarms: TWELVE, types: TYPES, asOf: T0 });
    expect(projection.standingUnacknowledged).toBe(3);
  });
});

describe("alarmModel – the return band", () => {
  const upper = { direction: "obere", limit: 80, returnTo: 75 } as const;
  const lower = { direction: "untere", limit: 20, returnTo: 25 } as const;

  it("upper bound: below the bound but not back – the alarm goes on standing", () => {
    expect(hasReturned(upper, 79)).toBe(false);
    expect(hasReturned(upper, 75.5)).toBe(false);
  });

  it("upper bound: on and below the return value it clears", () => {
    expect(hasReturned(upper, 75)).toBe(true);
    expect(hasReturned(upper, 74)).toBe(true);
  });

  it("lower bound: above the bound but not back – the alarm goes on standing", () => {
    expect(hasReturned(lower, 21)).toBe(false);
    expect(hasReturned(lower, 24.5)).toBe(false);
  });

  it("lower bound: on and above the return value it clears", () => {
    expect(hasReturned(lower, 25)).toBe(true);
    expect(hasReturned(lower, 26)).toBe(true);
  });

  it("a value beyond the bound leaves it standing all the more", () => {
    expect(hasReturned(upper, 81)).toBe(false);
    expect(hasReturned(lower, 19)).toBe(false);
  });
});

describe("alarmModel – frequency and chatter", () => {
  const WINDOW = 60_000;
  const FREQUENT: Alarm[] = [
    alarm("f0", "boiler-pressure", "cleared-unacknowledged", T0 - WINDOW),
    alarm("f1", "boiler-pressure", "cleared-unacknowledged", T0 - WINDOW + 1),
    alarm("f2", "boiler-pressure", "standing-unacknowledged", T0),
    alarm("f3", "boiler-pressure", "standing-unacknowledged", T0 + 1),
    alarm("g1", "flow-temp", "standing-unacknowledged", T0 - 1),
  ];

  it("counts per type, not per occurrence", () => {
    const per = frequencyByType(FREQUENT, WINDOW, T0);
    expect(per.get("boiler-pressure")).toBe(2);
    expect(per.get("flow-temp")).toBe(1);
  });

  it("respects the window boundary from both sides", () => {
    // Exactly on the old edge lies outside, one millisecond later inside; the
    // as-of time itself lies inside, after it is the future.
    const per = frequencyByType(FREQUENT, WINDOW, T0);
    expect(per.get("boiler-pressure")).toBe(2); // f1 and f2, not f0 and not f3
  });

  it("marks chatter from the threshold on, without taking anything away", () => {
    const projection = alarmModel({
      alarms: FREQUENT,
      types: TYPES,
      asOf: T0,
      chatter: { windowMs: WINDOW, atLeast: 2 },
    });
    expect(projection.filtered).toHaveLength(5);
    const boiler = projection.filtered.filter((row) => row.type.id === "boiler-pressure");
    expect(boiler).toHaveLength(4);
    expect(boiler.every((row) => row.chatters)).toBe(true);
    expect(projection.filtered.filter((row) => row.chatters)).toHaveLength(4);
  });

  it("counts every occurrence of the type without a rule and marks nothing", () => {
    const projection = alarmModel({ alarms: FREQUENT, types: TYPES, asOf: T0 });
    const one = projection.filtered.find((row) => row.id === "f2");
    expect(one?.frequency).toBe(3); // f0, f1, f2 - f3 lies in the future
    expect(one?.chatters).toBe(false);
  });
});

describe("alarmModel – the flood", () => {
  const WINDOW = 90_000;
  const series = (count: number): Alarm[] =>
    Array.from({ length: count }, (_, i) =>
      alarm(`i${i}`, "boiler-pressure", "standing-unacknowledged", T0 - 1_000 * (i + 1)),
    );

  it("detects no flood one alarm below the threshold", () => {
    expect(detectFlood(series(4), { windowMs: WINDOW, atLeast: 5 }, T0)).toBeNull();
  });

  it("detects the flood exactly on the threshold", () => {
    const flood = detectFlood(series(5), { windowMs: WINDOW, atLeast: 5 }, T0);
    expect(flood?.count).toBe(5);
  });

  it("detects the flood one alarm above the threshold", () => {
    const flood = detectFlood(series(6), { windowMs: WINDOW, atLeast: 5 }, T0);
    expect(flood?.count).toBe(6);
    expect(flood?.from).toBe(T0 - 6_000);
    expect(flood?.to).toBe(T0 - 1_000);
  });

  it("counts only what lies within the window", () => {
    const spread = [
      ...series(3),
      alarm("old", "boiler-pressure", "standing-unacknowledged", T0 - WINDOW),
      alarm("barely", "boiler-pressure", "standing-unacknowledged", T0 - WINDOW + 1),
    ];
    expect(detectFlood(spread, { windowMs: WINDOW, atLeast: 4 }, T0)?.count).toBe(4);
    expect(detectFlood(spread, { windowMs: WINDOW, atLeast: 5 }, T0)).toBeNull();
  });

  it("suppresses nothing: forty alarms are forty rows plus one marking", () => {
    const projection = alarmModel({
      alarms: series(40),
      types: TYPES,
      asOf: T0,
      flood: { windowMs: WINDOW, atLeast: 10 },
    });
    expect(projection.filtered).toHaveLength(40);
    expect(projection.flood?.count).toBe(40);
    expect(projection.filtered.filter((row) => row.inFlood)).toHaveLength(40);
  });

  it("marks nothing without a rule", () => {
    const projection = alarmModel({ alarms: series(40), types: TYPES, asOf: T0 });
    expect(projection.flood).toBeNull();
    expect(projection.filtered.filter((row) => row.inFlood)).toHaveLength(0);
  });
});

describe("alarmModel – age and duration", () => {
  it("works out the age from the as-of time passed in", () => {
    const projection = alarmModel({ alarms: FOUR, types: TYPES, asOf: T0 });
    const row = projection.filtered.find((row) => row.id === "m-au");
    expect(row?.age).toBe(400_000);
  });

  it("shifts with the as-of time, without reading a clock", () => {
    const later = alarmModel({ alarms: FOUR, types: TYPES, asOf: T0 + 60_000 });
    expect(later.filtered.find((row) => row.id === "m-au")?.age).toBe(460_000);
  });

  it("measures the standing time of a cleared alarm up to its clearing", () => {
    const projection = alarmModel({
      alarms: FOUR,
      types: TYPES,
      asOf: T0 + 60_000,
      keepDone: true,
    });
    // m-gu: raised T0-200_000, cleared T0-150_000.
    expect(projection.filtered.find((row) => row.id === "m-gu")?.duration).toBe(50_000);
    // The standing one measures up to the as-of time.
    expect(projection.filtered.find((row) => row.id === "m-au")?.duration).toBe(460_000);
  });
});

describe("alarmModel – acknowledging", () => {
  it("counts what an acknowledgement would change before it happens", () => {
    expect(countAcknowledgeable(FOUR, ["m-au", "m-gu", "m-aq"])).toBe(2);
  });

  it("counts what it changed – and nothing the second time", () => {
    const first = acknowledge(FOUR, ["m-au", "m-gu"], T0);
    expect(first.count).toBe(2);
    const second = acknowledge(first.alarms, ["m-au", "m-gu"], T0);
    expect(second.count).toBe(0);
  });

  it("leads the fleeting alarm into the final position and out of the list", () => {
    const after = acknowledge(FOUR, ["m-gu"], T0).alarms;
    expect(after.find((m) => m.id === "m-gu")?.lifecycle).toBe("cleared-acknowledged");
    const projection = alarmModel({ alarms: after, types: TYPES, asOf: T0 });
    expect(ids(projection.filtered)).toEqual(["m-au", "m-aq"]);
  });

  it("records the moment of the acknowledgement and leaves the uninvolved untouched", () => {
    const after = acknowledge(FOUR, ["m-au"], T0).alarms;
    expect(after.find((m) => m.id === "m-au")?.acknowledgedAt).toBe(T0);
    expect(after.find((m) => m.id === "m-gu")?.lifecycle).toBe("cleared-unacknowledged");
  });

  it("passes over unknown ids instead of choking on them", () => {
    expect(acknowledge(FOUR, ["gibtesnicht"], T0).count).toBe(0);
  });
});

describe("alarmModel – what must not disappear", () => {
  it("keeps an alarm whose type is unknown and classifies it high", () => {
    const foreign = [alarm("x1", "not-in-catalogue", "standing-unacknowledged", T0 - 1_000)];
    const projection = alarmModel({ alarms: [...FOUR, ...foreign], types: TYPES, asOf: T0 });
    const row = projection.filtered.find((row) => row.id === "x1");
    expect(row).toBeDefined();
    expect(row?.priority).toBe("high");
    // Highest priority and unacknowledged, and the newest as well - it stands on top.
    expect(ids(projection.filtered)[0]).toBe("x1");
  });

  it("holds the table's guarantee: figures from the filtered set", () => {
    const projection = alarmModel(
      { alarms: FOUR, types: TYPES, asOf: T0 },
      { pageSize: 1 },
    );
    expect(projection.filtered).toHaveLength(3);
    expect(projection.visible).toHaveLength(1);
    expect(projection.pageCount).toBe(3);
    expect(projection.standingUnacknowledged).toBe(1);
  });
});

describe("A flood with very many alarms", () => {
  it("detects it without blowing the call stack", () => {
    // Exactly the case the function exists for. A spread as an argument list
    // (`Math.min(...times)`) falls over here; a loop does not. The test is here
    // so that the convenience does not come back.
    const asOf = 1_000_000_000;
    const alarms = Array.from({ length: 200_000 }, (_, i) => ({
      id: `m${i}`,
      type: "a",
      lifecycle: "standing-unacknowledged" as const,
      raised: asOf - i,
    }));
    const flood = detectFlood(alarms, { windowMs: 600_000, atLeast: 10 }, asOf);
    expect(flood).not.toBeNull();
    expect(flood?.count).toBe(200_000);
    expect(flood?.to).toBe(asOf);
  });
});
