/* Pinned columns as pure model (table-column-pinning 01): the order they
   stand in, the declaration, the choice and what of it the view carries, and
   where a cell of a row sticks. */

import { describe, expect, it } from "vitest";
import { declaredPins, inPinOrder, pinOf, pinsForView, withPin } from "../src/model/pinning";

const ids = (columns: readonly { id: string }[]) => columns.map((c) => c.id);
const COLUMNS = ["a", "b", "c", "d", "e"].map((id) => ({ id }));

describe("the order pinned columns stand in", () => {
  it("puts the start block first and the end block last, each in its own order", () => {
    expect(ids(inPinOrder(COLUMNS, { d: "start", b: "start", a: "end" }))).toEqual(["b", "d", "c", "e", "a"]);
  });

  it("leaves an unpinned table as it is", () => {
    expect(ids(inPinOrder(COLUMNS, {}))).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("what the columns declare", () => {
  it("reads `pin` off the columns", () => {
    expect(declaredPins([{ id: "a", pin: "start" }, { id: "b" }, { id: "c", pin: "end" }])).toEqual({ a: "start", c: "end" });
  });

  it("reads `stickyRowHeader` as `pin: \"start\"` on the row header", () => {
    expect(declaredPins([{ id: "a" }, { id: "b" }], "b")).toEqual({ b: "start" });
  });

  it("lets the row header's own side win over `stickyRowHeader`", () => {
    expect(declaredPins([{ id: "b", pin: "end" }], "b")).toEqual({ b: "end" });
  });
});

describe("the user's choice", () => {
  it("pins, moves to the other side and unpins one column, the others untouched", () => {
    const pinned = withPin({ a: "start" }, "c", "end");
    expect(pinned).toEqual({ a: "start", c: "end" });
    expect(withPin(pinned, "c", "start")).toEqual({ a: "start", c: "start" });
    expect(withPin(pinned, "a", null)).toEqual({ c: "end" });
  });

  it("does not change the pins it was given", () => {
    const pins = { a: "start" } as const;
    withPin(pins, "a", null);
    expect(pins).toEqual({ a: "start" });
  });
});

describe("what the view carries", () => {
  const known = new Set(["a", "b", "c"]);

  it("nothing while the user has chosen nothing", () => {
    expect(pinsForView(null, { a: "start" }, known)).toBeUndefined();
  });

  it("nothing when the choice came back to the declaration", () => {
    expect(pinsForView({ a: "start" }, { a: "start" }, known)).toBeUndefined();
  });

  it("the whole choice when it deviates - an unpinned declaration as an empty one", () => {
    expect(pinsForView({ a: "start", c: "end" }, { a: "start" }, known)).toEqual({ a: "start", c: "end" });
    expect(pinsForView({}, { a: "start" }, known)).toEqual({});
  });

  it("without columns that do not exist - but whole while none is known yet", () => {
    expect(pinsForView({ a: "end", gone: "start" }, {}, known)).toEqual({ a: "end" });
    expect(pinsForView({ gone: "start" }, {}, new Set())).toEqual({ gone: "start" });
  });
});

describe("where a cell sticks", () => {
  /* Selection, row header, a pinned column | three that scroll | a pinned
     column, the actions. */
  const blocks = { start: 3, end: 2, count: 8 };

  it("a cell of the start block at its place from the left, the last one as the inner edge", () => {
    expect(pinOf(blocks, 0)).toEqual({ side: "start", at: 0, edge: false });
    expect(pinOf(blocks, 2)).toEqual({ side: "start", at: 2, edge: true });
  });

  it("a cell of the end block at its place from the right, the first one as the inner edge", () => {
    expect(pinOf(blocks, 7)).toEqual({ side: "end", at: 0, edge: false });
    expect(pinOf(blocks, 6)).toEqual({ side: "end", at: 1, edge: true });
  });

  it("a cell between the blocks does not stick", () => {
    expect(pinOf(blocks, 3)).toBeUndefined();
    expect(pinOf(blocks, 5)).toBeUndefined();
  });

  it("a cell over several columns sticks only inside its block", () => {
    expect(pinOf(blocks, 1, 2)).toEqual({ side: "start", at: 1, edge: true });
    expect(pinOf(blocks, 1, 3)).toBeUndefined();
    expect(pinOf(blocks, 5, 6)).toBeUndefined();
    expect(pinOf(blocks, 6, 7)).toEqual({ side: "end", at: 0, edge: true });
  });

  it("nothing sticks without blocks", () => {
    expect(pinOf({ start: 0, end: 0, count: 4 }, 0)).toBeUndefined();
    expect(pinOf({ start: 0, end: 0, count: 4 }, 3)).toBeUndefined();
  });
});
