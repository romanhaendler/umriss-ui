/* Tree rows under live data: `rows` is a fresh array of fresh objects every
   tick. Open branches, the selection by key and the focused cell must outlive
   the ticks - for a loaded tree, and for a lazy one whose children arrive
   through `childRows` after `onBranchOpen`. */

import { useEffect, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { Table } from "../src";

interface Unit {
  id: string;
  name: string;
  load: number;
  kids?: Unit[] | null;
}

const fresh = (tick: number, lazyKids: Unit[] | null): Unit[] => [
  {
    id: "v",
    name: "Sales",
    load: tick,
    kids: [
      { id: "vn", name: "North", load: tick, kids: [{ id: "vnh", name: "Hamburg", load: tick }] },
      { id: "vs", name: "South", load: tick },
    ],
  },
  { id: "d", name: "Docs", load: tick, kids: lazyKids },
  { id: "s", name: "Staff", load: tick },
];

let current: Table<Unit> | null = null;
const capture = (t: Table<Unit>) => {
  current = t;
};

function Live({ lazy, open }: { lazy?: boolean; open?: (key: string) => void }) {
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const clock = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(clock);
  }, []);
  const rows = fresh(tick, lazy ? (loaded ? [{ id: "d1", name: "Report", load: tick }] : null) : [{ id: "d1", name: "Report", load: tick }]);
  const t = useTable(rows, {
    rowKey: (u) => u.id,
    childRows: (u) => u.kids,
    onBranchOpen: (key) => {
      open?.(key);
      setLoaded(true);
    },
  });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Units" selectable grid>
      <Column value="name" label="Unit" rowHeader />
      <Column value="load" label="Load" />
    </Frame>
  );
}

const names = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLTableRowElement>("tbody tr[data-motion]")).map((tr) => tr.querySelector("th")?.textContent?.replace(/,.*$/, "").trim());
const tick = (n = 1) => act(() => void vi.advanceTimersByTime(500 * n));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  current = null;
});

describe("tree rows under live data", () => {
  it("keeps open branches, the selection and the focused cell across ticks (loaded tree)", () => {
    const { container } = render(<Live />);
    fireEvent.click(screen.getByRole("button", { name: "Unfold rows under Sales" }));
    fireEvent.click(screen.getByRole("button", { name: "Unfold rows under North" }));
    const before = names(container);
    expect(before).toEqual(["Sales", "North", "Hamburg", "South", "Docs", "Staff"]);
    fireEvent.click(screen.getByRole("checkbox", { name: /Hamburg/ }));
    expect(current?.selection.selected.has("vnh")).toBe(true);
    const cell = screen.getByRole("rowheader", { name: /Hamburg/ });
    act(() => cell.focus());

    tick(6);

    expect(names(container)).toEqual(before);
    expect(current?.branches).toEqual(["v", "vn"]);
    expect(current?.selection.selected.has("vnh")).toBe(true);
    expect(document.activeElement?.textContent).toContain("Hamburg");
    expect(screen.getByRole("checkbox", { name: /Hamburg/ })).toHaveProperty("checked", true);
  });

  it("keeps a lazily loaded branch open, its children, the selection and focus across ticks", () => {
    const open = vi.fn();
    const { container } = render(<Live lazy open={open} />);
    fireEvent.click(screen.getByRole("button", { name: "Unfold rows under Docs" }));
    expect(open).toHaveBeenCalledTimes(1);
    expect(names(container)).toEqual(["Sales", "Docs", "Report", "Staff"]);
    fireEvent.click(screen.getByRole("checkbox", { name: /Report/ }));
    act(() => screen.getByRole("rowheader", { name: /Report/ }).focus());

    tick(6);

    expect(open).toHaveBeenCalledTimes(1);
    expect(names(container)).toEqual(["Sales", "Docs", "Report", "Staff"]);
    expect(current?.branches).toEqual(["d"]);
    expect(current?.selection.selected.has("d1")).toBe(true);
    expect(document.activeElement?.textContent).toContain("Report");
  });

  it("keeps the loading line of a pending branch across ticks, then shows the rows", async () => {
    let done!: () => void;
    function Pending() {
      const [n, setN] = useState(0);
      const [loaded, setLoaded] = useState(false);
      useEffect(() => {
        const c = setInterval(() => setN((x) => x + 1), 500);
        return () => clearInterval(c);
      }, []);
      const t = useTable(fresh(n, loaded ? [{ id: "d1", name: "Report", load: n }] : null), {
        rowKey: (u) => u.id,
        childRows: (u) => u.kids,
        onBranchOpen: () => new Promise<void>((resolve) => (done = () => (setLoaded(true), resolve()))),
      });
      const { Table: Frame, Column } = t;
      return (
        <Frame aria-label="Pending">
          <Column value="name" label="Unit" rowHeader />
        </Frame>
      );
    }
    render(<Pending />);
    fireEvent.click(screen.getByRole("button", { name: "Unfold rows under Docs" }));
    tick(6);
    expect(screen.getByRole("status").textContent).toContain("Loading rows under Docs");
    await act(async () => done());
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("Report")).toBeTruthy();
  });

  it("does not ask for children again while a lazy branch stays unloaded across ticks", () => {
    const open = vi.fn();
    function Never() {
      const [n, setN] = useState(0);
      useEffect(() => {
        const c = setInterval(() => setN((x) => x + 1), 500);
        return () => clearInterval(c);
      }, []);
      const t = useTable(fresh(n, null), { rowKey: (u) => u.id, childRows: (u) => u.kids, onBranchOpen: (k) => void open(k) });
      const { Table: Frame, Column } = t;
      return (
        <Frame aria-label="Never">
          <Column value="name" label="Unit" rowHeader />
        </Frame>
      );
    }
    render(<Never />);
    fireEvent.click(screen.getByRole("button", { name: "Unfold rows under Docs" }));
    tick(6);
    expect(open).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Fold rows under Docs" })).toBeTruthy();
  });
});
