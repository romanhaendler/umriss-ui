/* The keyboard's walk as a pure module (schedule-a11y 01): which subtask a key
   leads to, over rows as the plot lays them out. Literals throughout - an hour
   is 3_600_000 ms, and the plan is small enough to read. */

import { describe, expect, it } from "vitest";
import type { Subtask, Dependency } from "../src/model";
import { layOutRows } from "../src/rows";
import { alongDependency, stepSubtask, walkRows } from "../src/walk";

const H = 3_600_000;
const s = (id: string, lane: string, from: number, to: number): Subtask => ({ id, task: "t", lane, from: from * H, to: to * H });

/* Three lanes; the middle one empty, the last two in a group "hall". */
const WORK = [
  s("a3", "a", 10, 12),
  s("a1", "a", 2, 4),
  s("a2", "a", 6, 8),
  s("c1", "c", 5, 9),
  s("c2", "c", 11, 13),
];
const layout = (collapsed: string[] = []) =>
  layOutRows({
    lanes: [{ id: "a" }, { id: "b", parent: "hall" }, { id: "c", parent: "hall" }],
    groups: [{ id: "hall" }],
    collapsed: new Set(collapsed),
    laneHeight: 44,
  });
const VIEW = [0, 20 * H] as const;
const ids = (rows: Subtask[][]) => rows.map((row) => row.map((x) => x.id));

describe("the rows the walk goes over", () => {
  it("are the lanes with work, top to bottom, each in time order", () => {
    expect(ids(walkRows(layout(), WORK))).toEqual([
      ["a1", "a2", "a3"],
      ["c1", "c2"],
    ]);
  });

  it("make a folded group one row, its lanes' work merged in time order", () => {
    const work = [...WORK, s("b1", "b", 7, 8)];
    expect(ids(walkRows(layout(["hall"]), work))).toEqual([
      ["a1", "a2", "a3"],
      ["c1", "b1", "c2"],
    ]);
  });

  it("orders two with one start by their end", () => {
    expect(ids(walkRows(layout(), [s("long", "a", 1, 5), s("short", "a", 1, 2)]))).toEqual([["short", "long"]]);
  });
});

describe("a step", () => {
  const rows = walkRows(layout(), WORK);
  const step = (from: string | null, move: Parameters<typeof stepSubtask>[2], view: readonly [number, number] = VIEW) =>
    stepSubtask(rows, from, move, view)?.id ?? null;

  it("goes along the lane with ←/→ and stays at its ends", () => {
    expect(step("a1", "next")).toBe("a2");
    expect(step("a2", "previous")).toBe("a1");
    expect(step("a3", "next")).toBe("a3");
    expect(step("a1", "previous")).toBe("a1");
  });

  it("goes to the lane's first and last with Home/End", () => {
    expect(step("a2", "first")).toBe("a1");
    expect(step("a2", "last")).toBe("a3");
  });

  it("passes over an empty lane to the one below, nearest in time", () => {
    /* a2 runs 06-08, its middle 07:00 lies inside c1 (05-09). */
    expect(step("a2", "down")).toBe("c1");
    /* a3's middle, 11:00, is the start of c2 and two hours after c1. */
    expect(step("a3", "down")).toBe("c2");
    expect(step("c2", "up")).toBe("a3");
  });

  it("takes the earlier of two as near", () => {
    /* z's middle is 06:00, two hours after x ends and two before y starts. */
    const tie = walkRows(layout(), [s("x", "a", 2, 4), s("y", "a", 8, 10), s("z", "c", 5, 7)]);
    expect(stepSubtask(tie, "z", "up", VIEW)?.id).toBe("x");
  });

  it("stays on the top and bottom row", () => {
    expect(step("a1", "up")).toBe("a1");
    expect(step("c1", "down")).toBe("c1");
  });

  it("jumps a tenth of the visible span with PageUp/PageDown, and stops at the ends", () => {
    /* A span of 40 hours: a tenth is four hours. From a1 (02:00) the first
       start at 06:00 or later is a2's; from a3 (10:00) the last at 06:00 or
       earlier is a2 as well. */
    const wide = [0, 40 * H] as const;
    expect(step("a1", "pageNext", wide)).toBe("a2");
    expect(step("a3", "pagePrevious", wide)).toBe("a2");
    expect(step("a2", "pageNext", [0, 100 * H])).toBe("a3");
    expect(step("a2", "pagePrevious", [0, 100 * H])).toBe("a1");
  });

  it("starts from nowhere at the first subtask in view on the topmost row with one", () => {
    expect(step(null, "next")).toBe("a1");
    expect(step(null, "last", [4.5 * H, 20 * H])).toBe("a2");
    /* Nothing of lane a in view: the walk starts on c. */
    expect(step(null, "next", [12.5 * H, 20 * H])).toBe("c2");
    /* Nothing in view at all: the plan's first. */
    expect(step(null, "next", [30 * H, 40 * H])).toBe("a1");
  });

  it("starts anew where the subtask it stood on is gone", () => {
    expect(step("gone", "next")).toBe("a1");
  });

  it("has nowhere to go in an empty plan", () => {
    expect(stepSubtask([], null, "next", VIEW)).toBeNull();
  });
});

describe("along a dependency", () => {
  const byId = new Map(WORK.map((x) => [x.id, x] as const));
  const T: Dependency[] = [
    { id: "t1", from: "a2", to: "c1", lag: H },
    { id: "t2", from: "c1", to: "a3", lag: H },
    { id: "dangling", from: "c2", to: "nowhere", lag: H },
  ];
  const at = (kind: "subtask" | "dependency", id: string) => ({ kind, id });

  it("goes out from a subtask onto the dependency that leaves it, and on to the stop it reaches", () => {
    expect(alongDependency(T, byId, at("subtask", "a2"), "out")).toEqual(at("dependency", "t1"));
    expect(alongDependency(T, byId, at("dependency", "t1"), "out")).toEqual(at("subtask", "c1"));
    expect(alongDependency(T, byId, at("subtask", "c1"), "out")).toEqual(at("dependency", "t2"));
  });

  it("goes back onto the dependency that arrives, and on to the stop it left", () => {
    expect(alongDependency(T, byId, at("subtask", "c1"), "back")).toEqual(at("dependency", "t1"));
    expect(alongDependency(T, byId, at("dependency", "t1"), "back")).toEqual(at("subtask", "a2"));
  });

  it("stays where there is nothing to follow, or its other end is not in the plan", () => {
    expect(alongDependency(T, byId, at("subtask", "a1"), "out")).toEqual(at("subtask", "a1"));
    expect(alongDependency(T, byId, at("subtask", "a2"), "back")).toEqual(at("subtask", "a2"));
    expect(alongDependency(T, byId, at("subtask", "c2"), "out")).toEqual(at("subtask", "c2"));
  });
});
