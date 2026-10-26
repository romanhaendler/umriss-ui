/* A condition that went through JSON is read back (reviveCondition). */

import { describe, expect, it } from "vitest";
import { filterOf, reviveCondition } from "../src/columnFilter";

const range = filterOf("range")!;
const list = filterOf("list")!;
const a = new Date("2026-03-17T08:30:00.000Z");
const b = new Date("2026-04-01T00:00:00.000Z");

describe("reviveCondition", () => {
  it("a range of two JSON dates becomes two Dates, on any column", () => {
    const given = JSON.parse(JSON.stringify({ from: a, to: b }));
    expect(reviveCondition(range, given, "text")).toEqual({ from: a, to: b });
  });

  it("a list of JSON dates on a date column becomes Dates", () => {
    expect(reviveCondition(list, JSON.parse(JSON.stringify([a, b])), "date")).toEqual([a, b]);
  });

  it("a list of ISO-looking text on a text column stays text", () => {
    const given = [a.toISOString()];
    expect(reviveCondition(list, given, "text")).toEqual(given);
  });

  it("a day-only or malformed string stays a string", () => {
    expect(reviveCondition(range, { from: "2026-03-17", to: "2026-13-45T99:00:00.000Z" }, "date")).toEqual({
      from: "2026-03-17",
      to: "2026-13-45T99:00:00.000Z",
    });
    expect(reviveCondition(list, ["2026-03-17", "nope"], "date")).toEqual(["2026-03-17", "nope"]);
  });
});
