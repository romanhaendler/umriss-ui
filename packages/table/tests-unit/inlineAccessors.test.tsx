/* An accessor written in the call costs what a stable one costs: a new function
   of the same text is not a change. */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

// These tests count accessor calls to see the held functions kept; the development probe calls them too, and has tests of its own.
vi.mock("../src/dev", async (original) => ({ ...(await original<typeof import("../src/dev")>()), probeStale: () => {} }));

interface Item {
  id: string;
  size: number;
}
const ITEMS: Item[] = [
  { id: "a", size: 3 },
  { id: "b", size: 1 },
  { id: "c", size: 2 },
];

const calls = { value: 0, sort: 0, group: 0, key: 0, pre: 0 };

function List({ other }: { other: boolean }) {
  // Each accessor is a new function on every render; `other` changes the text.
  const key = other ? (r: Item) => (calls.key++, r.id + "") : (r: Item) => (calls.key++, r.id);
  const pre = other ? (r: Item) => (calls.pre++, r.size > 1) : (r: Item) => (calls.pre++, r.size > 0);
  const value = other ? (r: Item) => (calls.value++, r.size * 10) : (r: Item) => (calls.value++, r.size);
  const sort = other ? (v: string | number) => (calls.sort++, -Number(v)) : (v: string | number) => (calls.sort++, v);
  const group = other ? (v: string | number) => (calls.group++, Number(v) + 1) : (v: string | number) => (calls.group++, v);
  const { Table, Column } = useTable(ITEMS, {
    rowKey: key,
    preFilter: pre,
    defaultSort: { column: "size", direction: "asc" },
    defaultGrouping: "size",
  });
  return (
    <Table empty="none">
      <Column id="size" label="Size" value={value} sortValue={sort} groupValue={group} />
    </Table>
  );
}

describe("inline accessors", () => {
  it("a new function of the same text calls nothing again", () => {
    const { rerender } = render(<List other={false} />);
    rerender(<List other={false} />);
    const before = { ...calls };
    expect(before.value + before.key + before.pre + before.sort + before.group).toBeGreaterThan(0);
    rerender(<List other={false} />);
    rerender(<List other={false} />);
    /* The rendered rows read their keys in every render, and the pre-filter is
       applied in every render: it is the one accessor that may close over what
       changes, so its text says nothing about what it admits. */
    expect({ ...calls, key: 0, pre: 0 }).toEqual({ ...before, key: 0, pre: 0 });
  });

  it("a row key written in the call costs what a stable one costs", () => {
    // The rendered rows read their keys in every render; nothing more may.
    const keyCalls = (inline: boolean) => {
      let n = 0;
      const stable = (r: Item) => (n++, r.id);
      function K() {
        const { Table, Column } = useTable(ITEMS, { rowKey: inline ? (r: Item) => (n++, r.id) : stable });
        return (
          <Table empty="none">
            <Column value="size" label="Size" />
          </Table>
        );
      }
      const { rerender, unmount } = render(<K />);
      rerender(<K />);
      const before = n;
      rerender(<K />);
      unmount();
      return n - before;
    };
    expect(keyCalls(true)).toBe(keyCalls(false));
  });

  it("a function of another text does, and the cells show the new values", () => {
    const { rerender } = render(<List other={false} />);
    const before = { ...calls };
    rerender(<List other />);
    expect(calls.value).toBeGreaterThan(before.value);
    expect(calls.key).toBeGreaterThan(before.key);
    expect(calls.pre).toBeGreaterThan(before.pre);
    expect(screen.getByLabelText("Fold 31, 1")).toBeTruthy();
  });

  it("a bound function is compared by identity", () => {
    function Bound({ fn }: { fn: (r: Item) => number }) {
      const { Table, Column } = useTable(ITEMS, { rowKey: (r) => r.id });
      return (
        <Table empty="none">
          <Column id="size" label="Size" value={fn} />
        </Table>
      );
    }
    const a = ((r: Item) => r.size).bind(null);
    const b = ((r: Item) => r.size * 10).bind(null);
    const { rerender } = render(<Bound fn={a} />);
    rerender(<Bound fn={b} />);
    expect(screen.getAllByText("30").length).toBeGreaterThan(0);
  });
});
