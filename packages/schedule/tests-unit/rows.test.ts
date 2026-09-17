/* The rows of a plot (schedule-lane-groups 07).

   Every y in the package will come from this module, so it is written
   test-first and the first thing asked of it is that it changes NOTHING: a
   flat list of lanes has to lay out exactly as `laneIndex * laneHeight` did,
   pixel for pixel, or the whole picture moves for no reason.

   After that: a tree, a fold, a fold inside a fold, and the promise that
   `laneAt` is the inverse of `laneTop` over trees drawn at random - which is
   the property a binary search over prefix sums has to have and an arithmetic
   expression got for free. */

import { describe, expect, it } from "vitest";
import { effectiveCollapsed, layOutRows, rowAt, slotOf, type GroupNode, type RowsInput } from "../src/rows";

const LANE_HEIGHT = 44;

/** A flat plan, as every schedule has had until now. */
const flat = (count: number): RowsInput => ({
  lanes: Array.from({ length: count }, (_, i) => ({ id: `lane-${i}`, parent: undefined })),
  groups: [],
  collapsed: new Set<string>(),
  laneHeight: LANE_HEIGHT,
});

const group = (id: string, parent?: string): GroupNode => ({ id, parent });

describe("a flat plan lays out exactly as the arithmetic it replaces", () => {
  it("gives every lane its own row at the old top and the old height", () => {
    const rows = layOutRows(flat(7));
    expect(rows.rows).toHaveLength(7);
    rows.rows.forEach((row, i) => {
      expect(row.kind).toBe("lane");
      expect(row.top).toBe(i * LANE_HEIGHT);
      expect(row.height).toBe(LANE_HEIGHT);
    });
  });

  it("puts every lane in a slot that is its own whole row", () => {
    const rows = layOutRows(flat(4));
    for (let i = 0; i < 4; i++) {
      const slot = slotOf(rows, `lane-${i}`)!;
      expect(slot.top).toBe(i * LANE_HEIGHT);
      expect(slot.height).toBe(LANE_HEIGHT);
      expect(slot.miniature).toBe(false);
    }
  });

  it("ends where the lanes end", () => {
    expect(layOutRows(flat(7)).height).toBe(7 * LANE_HEIGHT);
    expect(layOutRows(flat(0)).height).toBe(0);
  });

  it("finds the row under a y, and nothing outside", () => {
    const rows = layOutRows(flat(3));
    expect(rowAt(rows, 0)?.kind).toBe("lane");
    expect(slotOf(rows, "lane-1")!.top).toBe(44);
    expect(rowAt(rows, 43)).toBe(rows.rows[0]);
    expect(rowAt(rows, 44)).toBe(rows.rows[1]);
    expect(rowAt(rows, 131)).toBe(rows.rows[2]);
    expect(rowAt(rows, 132)).toBeNull();
    expect(rowAt(rows, -1)).toBeNull();
  });
});

describe("a tree of groups", () => {
  /* Two presses in a hall, a saw outside it. */
  const nested: RowsInput = {
    lanes: [
      { id: "press-1", parent: "hall" },
      { id: "press-2", parent: "hall" },
      { id: "saw", parent: undefined },
    ],
    groups: [group("hall")],
    collapsed: new Set(),
    laneHeight: LANE_HEIGHT,
  };

  it("gives an open group a slim head of its own above its lanes", () => {
    const rows = layOutRows(nested);
    expect(rows.rows.map((r) => r.kind)).toEqual(["groupHead", "lane", "lane", "lane"]);
    expect(rows.rows[0]!.height).toBeLessThan(LANE_HEIGHT);
    expect(rows.rows[0]!.top).toBe(0);
    expect(rows.rows[1]!.top).toBe(rows.rows[0]!.height);
  });

  it("keeps the lanes in registration order, whatever their group", () => {
    const rows = layOutRows(nested);
    expect(rows.rows.slice(1).map((r) => r.lane)).toEqual(["press-1", "press-2", "saw"]);
  });

  it("says how deep each row lies, for the indent of its header", () => {
    const rows = layOutRows(nested);
    expect(rows.rows.map((r) => r.depth)).toEqual([0, 1, 1, 0]);
  });

  it("counts the lanes a group holds, however deep they lie", () => {
    const deep: RowsInput = {
      lanes: [
        { id: "a", parent: "line" },
        { id: "b", parent: "line" },
        { id: "c", parent: "hall" },
      ],
      groups: [group("hall"), group("line", "hall")],
      collapsed: new Set(),
      laneHeight: LANE_HEIGHT,
    };
    const rows = layOutRows(deep);
    const head = (id: string) => rows.rows.find((r) => r.group === id)!;
    expect(head("hall").lanes).toBe(3);
    expect(head("line").lanes).toBe(2);
  });
});

describe("a folded group", () => {
  const plan = (collapsed: string[]): RowsInput => ({
    lanes: [
      { id: "press-1", parent: "hall" },
      { id: "press-2", parent: "hall" },
      { id: "saw", parent: undefined },
    ],
    groups: [group("hall")],
    collapsed: new Set(collapsed),
    laneHeight: LANE_HEIGHT,
  });

  it("becomes one row, and its lanes have none of their own", () => {
    const rows = layOutRows(plan(["hall"]));
    expect(rows.rows.map((r) => r.kind)).toEqual(["miniature", "lane"]);
    expect(rows.rows[1]!.lane).toBe("saw");
  });

  it("still gives every lane in it a slot - a strip inside the row", () => {
    const rows = layOutRows(plan(["hall"]));
    const first = slotOf(rows, "press-1")!;
    const second = slotOf(rows, "press-2")!;
    expect(first.miniature).toBe(true);
    expect(second.miniature).toBe(true);
    /* Inside the miniature's row, in order, and not overlapping. */
    expect(first.top).toBeGreaterThanOrEqual(rows.rows[0]!.top);
    expect(second.top).toBeGreaterThan(first.top);
    expect(second.top + second.height).toBeLessThanOrEqual(rows.rows[0]!.top + rows.rows[0]!.height);
  });

  it("gives a strip at least three pixels", () => {
    const many: RowsInput = {
      lanes: Array.from({ length: 30 }, (_, i) => ({ id: `l-${i}`, parent: "hall" })),
      groups: [group("hall")],
      collapsed: new Set(["hall"]),
      laneHeight: LANE_HEIGHT,
    };
    const rows = layOutRows(many);
    for (let i = 0; i < 30; i++) expect(slotOf(rows, `l-${i}`)!.height).toBeGreaterThanOrEqual(3);
    /* A large group folds to a TALLER row rather than an unreadable one. */
    expect(rows.rows[0]!.height).toBeGreaterThan(LANE_HEIGHT);
  });

  it("is never shorter than a lane, however few it holds", () => {
    const one: RowsInput = {
      lanes: [{ id: "only", parent: "hall" }],
      groups: [group("hall")],
      collapsed: new Set(["hall"]),
      laneHeight: LANE_HEIGHT,
    };
    expect(layOutRows(one).rows[0]!.height).toBe(LANE_HEIGHT);
  });
});

describe("a fold inside a fold", () => {
  const plan = (collapsed: string[]): RowsInput => ({
    lanes: [
      { id: "a", parent: "line" },
      { id: "b", parent: "line" },
      { id: "c", parent: "hall" },
      { id: "d", parent: undefined },
    ],
    groups: [group("hall"), group("line", "hall")],
    collapsed: new Set(collapsed),
    laneHeight: LANE_HEIGHT,
  });

  it("shows the inner fold inside the open outer group", () => {
    const rows = layOutRows(plan(["line"]));
    expect(rows.rows.map((r) => r.kind)).toEqual(["groupHead", "miniature", "lane", "lane"]);
  });

  it("hides the inner group entirely when the outer one folds", () => {
    const rows = layOutRows(plan(["hall", "line"]));
    expect(rows.rows.map((r) => r.kind)).toEqual(["miniature", "lane"]);
    /* And every lane of the outer group is still a strip in it - the inner
       fold changes nothing about what is there, only about what the reader
       would see if the outer one were opened. */
    for (const id of ["a", "b", "c"]) expect(slotOf(rows, id)!.miniature).toBe(true);
  });

  it("keeps the inner group's state while the outer one is folded", () => {
    /* Folded outer, folded inner - opening the outer one gives back the inner
       fold, because the set was never touched. */
    const both = plan(["hall", "line"]);
    const opened = layOutRows({ ...both, collapsed: new Set(["line"]) });
    expect(opened.rows.map((r) => r.kind)).toEqual(["groupHead", "miniature", "lane", "lane"]);
  });
});

describe("laneAt is the inverse of laneTop", () => {
  /* Over trees drawn at random: a binary search over prefix sums has to agree
     with the sums it searches, at every y of every row, and that is a property
     the multiplication it replaces had for free. */
  const random = (seed: number): RowsInput => {
    let state = seed;
    const next = (n: number) => {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state % n;
    };
    const groups: GroupNode[] = [];
    for (let i = 0; i < 4; i++) {
      const parent = i > 0 && next(2) === 0 ? `g-${next(i)}` : undefined;
      groups.push(group(`g-${i}`, parent));
    }
    const lanes = Array.from({ length: 12 }, (_, i) => ({
      id: `l-${i}`,
      parent: next(3) === 0 ? undefined : `g-${next(4)}`,
    }));
    const collapsed = new Set(groups.filter(() => next(3) === 0).map((g) => g.id));
    return { lanes, groups, collapsed, laneHeight: LANE_HEIGHT };
  };

  it("finds the row a y lies in, for every y of every row", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rows = layOutRows(random(seed));
      for (const row of rows.rows) {
        for (const y of [row.top, row.top + Math.floor(row.height / 2), row.top + row.height - 1]) {
          expect(rowAt(rows, y), `seed ${seed}, y ${y}`).toBe(row);
        }
      }
      expect(rowAt(rows, rows.height)).toBeNull();
    }
  });

  it("gives every lane exactly one slot, and every slot lies inside its row", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const input = random(seed);
      const rows = layOutRows(input);
      for (const lane of input.lanes) {
        const slot = slotOf(rows, lane.id);
        expect(slot, `seed ${seed}, lane ${lane.id}`).not.toBeNull();
        const row = rowAt(rows, slot!.top);
        expect(row).not.toBeNull();
        expect(slot!.top + slot!.height).toBeLessThanOrEqual(row!.top + row!.height);
      }
    }
  });

  it("lays the rows out end to end, with no gap and no overlap", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rows = layOutRows(random(seed));
      let y = 0;
      for (const row of rows.rows) {
        expect(row.top, `seed ${seed}`).toBe(y);
        y += row.height;
      }
      expect(rows.height).toBe(y);
    }
  });
});

describe("what it refuses to invent", () => {
  it("ignores a lane whose group does not exist", () => {
    /* A `parent` naming nothing is a caller's slip, not a new group: the lane
       stands at the top level rather than vanishing. */
    const rows = layOutRows({
      lanes: [{ id: "orphan", parent: "nowhere" }],
      groups: [],
      collapsed: new Set(),
      laneHeight: LANE_HEIGHT,
    });
    expect(rows.rows.map((r) => r.kind)).toEqual(["lane"]);
    expect(slotOf(rows, "orphan")!.top).toBe(0);
  });

  it("drops a group that holds no lane at all", () => {
    /* An empty group is a head with nothing under it: a row that says nothing
       and costs a planner a line. */
    const rows = layOutRows({
      lanes: [{ id: "a", parent: undefined }],
      groups: [group("empty")],
      collapsed: new Set(),
      laneHeight: LANE_HEIGHT,
    });
    expect(rows.rows.map((r) => r.kind)).toEqual(["lane"]);
  });

  it("answers nothing for a lane it does not have", () => {
    expect(slotOf(layOutRows(flat(2)), "nowhere")).toBeNull();
  });
});

describe("what a gesture holds open", () => {
  /* A drag that rests over a folded group opens it for the gesture and lets go
     when the gesture ends. The one thing worth being sure of without a pointer
     is that the caller's list goes in unchanged and comes out unchanged: the
     application did not fold anything, so it must never be told that it did
     (schedule-lane-groups 10). */
  it("leaves the caller's list alone", () => {
    const callers = new Set(["hall", "line"]);
    const shown = effectiveCollapsed(callers, new Set(["line"]));
    expect([...callers]).toEqual(["hall", "line"]);
    expect([...shown]).toEqual(["hall"]);
  });

  it("gives back the same set where nothing is held open", () => {
    const callers = new Set(["hall"]);
    expect(effectiveCollapsed(callers, new Set())).toBe(callers);
  });

  it("ignores a group that is not folded anyway", () => {
    expect([...effectiveCollapsed(new Set(["hall"]), new Set(["nowhere"]))]).toEqual(["hall"]);
  });

  it("lays out as if the group were open", () => {
    const plan = (open: string[]) =>
      layOutRows({
        lanes: [
          { id: "a", parent: "hall" },
          { id: "b", parent: "hall" },
          { id: "c", parent: undefined },
        ],
        groups: [group("hall")],
        collapsed: effectiveCollapsed(new Set(["hall"]), new Set(open)),
        laneHeight: LANE_HEIGHT,
      });
    expect(plan([]).rows.map((r) => r.kind)).toEqual(["miniature", "lane"]);
    /* Held open: real rows, so there is a real lane to drop on. */
    expect(plan(["hall"]).rows.map((r) => r.kind)).toEqual(["groupHead", "lane", "lane", "lane"]);
    expect(slotOf(plan(["hall"]), "a")!.miniature).toBe(false);
  });
});
