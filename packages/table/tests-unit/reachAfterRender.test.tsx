/* A row brought into view is shown once it is rendered: the Active cell of a
   row on another page, the current row of a grouped paged table, the scroll
   area. The parts keep the names they compute and the defaults a caller may
   replace. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, Search, useTable } from "../src";
import type { Table } from "../src";

interface Item {
  id: string;
  tag: string;
  group: string;
}

const ROWS: Item[] = Array.from({ length: 30 }, (_, i) => ({ id: String(i), tag: `T-${i}`, group: i < 15 ? "a" : "b" }));

let current: Table<Item> | null = null;
const capture = (x: Table<Item>) => {
  current = x;
};

function Paged({ grid = false, grouping, currentRow }: { grid?: boolean; grouping?: string; currentRow?: string }) {
  const hook = useTable(ROWS, { rowKey: (r) => r.id, pageSize: 10, defaultGrouping: grouping });
  capture(hook);
  const { Table: Frame, Column } = hook;
  return (
    <Frame grid={grid} currentRow={currentRow}>
      <Search autoComplete="on" enterKeyHint="go" />
      <Column value="tag" label="Tag" rowHeader />
      <Column value="group" label="Group" groupable />
      <Pagination aria-label="Mine" />
    </Frame>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  current = null;
});

describe("after the render", () => {
  it("focusCell on a row of page 3 from page 1: ArrowDown lands on the next row", () => {
    render(<Paged grid />);
    act(() => void current!.focusCell("21", "group"));
    const cell = document.activeElement as HTMLElement;
    expect(cell.parentElement!.getAttribute("data-grid-line")).toBe("row:21");
    fireEvent.keyDown(cell, { key: "ArrowDown" });
    expect((document.activeElement as HTMLElement).parentElement!.getAttribute("data-grid-line")).toBe("row:22");
  });

  it("a current row of a grouped, paged table opens its page", () => {
    const { rerender } = render(<Paged grouping="group" />);
    rerender(<Paged grouping="group" currentRow="29" />);
    expect(screen.getByText("T-29").closest("tr")!.getAttribute("aria-current")).toBe("true");
    expect(screen.queryByText("T-0")).toBeNull();
  });

  it("a row of a scroll area is brought into view once rendered, and the call says true", () => {
    const into = vi.fn();
    HTMLElement.prototype.scrollIntoView = into;
    function Plain() {
      const hook = useTable(ROWS, { rowKey: (r) => r.id });
      capture(hook);
      return (
        <hook.Table maxHeight="100px">
          <hook.Column value="tag" label="Tag" rowHeader />
        </hook.Table>
      );
    }
    render(<Plain />);
    let ok = false;
    act(() => void (ok = current!.scrollToRow("20")));
    expect(ok).toBe(true);
    expect(into).toHaveBeenCalledTimes(1);
    expect(into.mock.contexts[0]).toBe(screen.getByText("T-20").closest("tr"));
  });
});

describe("what the parts compute and what a caller replaces", () => {
  it("Pagination keeps the name it computes", () => {
    render(<Paged />);
    expect(screen.queryByRole("navigation", { name: "Mine" })).toBeNull();
    expect(screen.getByRole("navigation")).toBeTruthy();
  });

  it("Search takes a caller's autoComplete and enterKeyHint", () => {
    render(<Paged />);
    const search = screen.getByRole("searchbox");
    expect(search.getAttribute("autocomplete")).toBe("on");
    expect(search.getAttribute("enterkeyhint")).toBe("go");
  });
});
