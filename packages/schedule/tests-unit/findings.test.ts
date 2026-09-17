/* Findings: overlaps on a lane and late transports (schedule 03).

   The expected values are worked out by hand from the fixtures, in minutes
   after a fixed morning - never by running the module's own arithmetic. */

import { describe, expect, it } from "vitest";
import { findings, lateTransports, overlapDepth, overlaps } from "../src/findings";
import type { Subtask, Transport } from "../src/model";

const MIN = 60_000;
const at = (minutes: number) => Date.UTC(2026, 2, 17, 6, 0) + minutes * MIN;

function subtask(id: string, lane: string, from: number, to: number, extra: Partial<Subtask> = {}): Subtask {
  return { id, task: "t", lane, from: at(from), to: at(to), ...extra };
}

describe("overlaps", () => {
  it("finds two subtasks that cover the same time on one lane", () => {
    const found = overlaps([subtask("a", "press", 0, 60), subtask("b", "press", 45, 90)]);
    expect(found).toEqual([{ lane: "press", first: "a", second: "b", from: at(45), to: at(60) }]);
  });

  it("does not count touching at a shared edge", () => {
    expect(overlaps([subtask("a", "press", 0, 60), subtask("b", "press", 60, 90)])).toEqual([]);
  });

  it("does not compare subtasks on different lanes", () => {
    expect(overlaps([subtask("a", "press", 0, 60), subtask("b", "saw", 30, 90)])).toEqual([]);
  });

  it("counts a teardown that reaches into the next subtask's setup", () => {
    const found = overlaps([
      subtask("a", "press", 0, 60, { teardown: 20 * MIN }),
      subtask("b", "press", 90, 120, { setup: 15 * MIN }),
    ]);
    // a occupies until 80, b from 75.
    expect(found).toEqual([{ lane: "press", first: "a", second: "b", from: at(75), to: at(80) }]);
  });

  it("names the earlier-starting subtask first, whatever the order of the data", () => {
    const found = overlaps([subtask("late", "press", 30, 90), subtask("early", "press", 0, 60)]);
    expect(found.map((o) => [o.first, o.second])).toEqual([["early", "late"]]);
  });

  it("reports every pair of three subtasks on one lane that cover each other", () => {
    const found = overlaps([
      subtask("a", "press", 0, 100),
      subtask("b", "press", 10, 20),
      subtask("c", "press", 15, 30),
    ]);
    expect(found.map((o) => `${o.first}/${o.second}`).sort()).toEqual(["a/b", "a/c", "b/c"]);
  });

  it("ignores a subtask that covers no time", () => {
    expect(overlaps([subtask("a", "press", 0, 60), subtask("b", "press", 30, 30)])).toEqual([]);
  });
});

describe("overlapDepth", () => {
  it("offsets a subtask by the number of earlier ones in the data it covers", () => {
    const depth = overlapDepth([
      subtask("a", "press", 0, 100),
      subtask("b", "press", 10, 20),
      subtask("c", "press", 15, 30),
      subtask("d", "press", 200, 300),
    ]);
    expect(Object.fromEntries(depth)).toEqual({ a: 0, b: 1, c: 2, d: 0 });
  });

  it("keeps an offset when a later subtask joins", () => {
    const before = overlapDepth([subtask("a", "press", 0, 100), subtask("b", "press", 10, 20)]);
    const after = overlapDepth([subtask("a", "press", 0, 100), subtask("b", "press", 10, 20), subtask("c", "press", 5, 8)]);
    expect(after.get("a")).toBe(before.get("a"));
    expect(after.get("b")).toBe(before.get("b"));
  });
});

describe("lateTransports", () => {
  const cut = subtask("cut", "saw", 0, 60, { teardown: 10 * MIN });
  const press = subtask("press", "press", 100, 160, { setup: 20 * MIN });

  it("finds nothing where the transport fits", () => {
    // leaves after the teardown (70), arrives before the setup (80): 10 minutes.
    const transport: Transport = { id: "x", from: "cut", to: "press", duration: 10 * MIN };
    expect(lateTransports([cut, press], [transport])).toEqual([]);
  });

  it("finds a transport that does not fit, and by how much", () => {
    const transport: Transport = { id: "x", from: "cut", to: "press", duration: 25 * MIN };
    expect(lateTransports([cut, press], [transport])).toEqual([
      { transport: "x", departure: at(70), arrival: at(80), shortBy: 15 * MIN },
    ]);
  });

  it("anchors at the main time where the transport says so", () => {
    // leaves at the main end (60), arrives at the main start (100): 40 minutes.
    const transport: Transport = { id: "x", from: "cut", to: "press", duration: 45 * MIN, leaves: "main", arrives: "main" };
    expect(lateTransports([cut, press], [transport])).toEqual([
      { transport: "x", departure: at(60), arrival: at(100), shortBy: 5 * MIN },
    ]);
  });

  it("finds a successor that starts before its predecessor ends", () => {
    const early = subtask("press", "press", 30, 90);
    const transport: Transport = { id: "x", from: "cut", to: "press", duration: 0 };
    expect(lateTransports([cut, early], [transport])).toEqual([
      { transport: "x", departure: at(70), arrival: at(30), shortBy: 40 * MIN },
    ]);
  });

  it("passes over a transport whose subtasks are not in the data", () => {
    const transport: Transport = { id: "x", from: "cut", to: "missing", duration: 5 * MIN };
    expect(lateTransports([cut], [transport])).toEqual([]);
  });
});

describe("findings", () => {
  it("gives both kinds at once", () => {
    const result = findings(
      [subtask("a", "press", 0, 60), subtask("b", "press", 30, 90)],
      [{ id: "x", from: "a", to: "b", duration: 0 }],
    );
    expect(result.overlaps).toHaveLength(1);
    expect(result.lateTransports).toEqual([{ transport: "x", departure: at(60), arrival: at(30), shortBy: 30 * MIN }]);
  });
});
