/* A table under rows that change every second (table-rows-that-keep-arriving
   01): `rows` is a new array each second - values move, a row appears, one
   goes, one moves under the sort. No API is involved; what is asserted is what
   the table keeps of its own state across those ticks: the sort, the
   selection by key, an open Row draft, the Active cell, the scroll position
   and the virtual window. Fake timers drive the clock, as in the server mode.

   What jsdom cannot show - the real scroll under a changing height, focus
   under the row motion - stands in `tests-visual/rows-that-keep-arriving.spec.ts`.
   Grouping and tree rows are not tried here. A case that found a fault is
   skipped with the ticket that owns the fault. */

import { useEffect, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toolbar, useTable } from "../src";
import type { Table } from "../src";

interface Loop {
  id: string;
  name: string;
  level: number;
  note: string;
}

const row = (id: string, level: number, note = ""): Loop => ({ id, name: `Loop ${id}`, level, note });

/** Every second the next of these is the whole `rows` - always a fresh array of fresh objects. */
function Plant({
  script,
  sort,
  grid,
  editMode,
  virtual,
  selectable,
}: {
  script: Loop[][];
  sort?: boolean;
  grid?: boolean;
  editMode?: "row";
  virtual?: boolean;
  selectable?: boolean;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const clock = setInterval(() => setTick((t) => Math.min(t + 1, script.length - 1)), 1000);
    return () => clearInterval(clock);
  }, [script.length]);
  const rows = script[tick]!.map((r) => ({ ...r }));
  const t = useTable(rows, { rowKey: (l) => l.id, virtual, defaultSort: sort ? { column: "level", direction: "asc" } : undefined });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame ariaLabel="Loops" grid={grid} editMode={editMode} onRowSave={() => undefined} selectable={selectable} maxHeight={virtual ? "100px" : undefined}>
      {selectable && <Toolbar />}
      <Column value="name" label="Loop" rowHeader />
      <Column value="level" label="Level" edit="number" />
      <Column value="note" label="Note" edit="text" />
    </Frame>
  );
}

let current: Table<Loop> | null = null;
const capture = (t: Table<Loop>) => {
  current = t;
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  current = null;
});

const second = () => act(() => vi.advanceTimersByTime(1000));
/** The loops in the order they stand, by the id in their name. */
const idOf = (tr: Element) => tr.querySelector("th")!.textContent!.replace("Loop ", "");
const order = () => screen.getAllByRole("row").slice(1).map(idOf);
const cellOf = (text: string) => screen.getByText(text).closest<HTMLElement>("td, th")!;
const active = () => document.activeElement as HTMLElement;
const press = (key: string) => fireEvent.keyDown(active(), { key });

describe("The sort", () => {
  /* Levels 1, 2, 3 -> one value rises past another, a row arrives, one goes. */
  const SCRIPT = [
    [row("a", 1), row("b", 2), row("c", 3)],
    [row("a", 2.5), row("b", 2), row("c", 3)],
    [row("a", 2.5), row("b", 2), row("c", 3), row("d", 0)],
    [row("a", 2.5), row("c", 3), row("d", 0)],
  ];

  it("stays the same sort, and the rows stand in the order it asks for after every tick", () => {
    render(<Plant script={SCRIPT} sort />);
    const header = () => screen.getByRole("columnheader", { name: /Level/ });
    expect(header().getAttribute("aria-sort")).toBe("ascending");
    expect(order()).toEqual(["a", "b", "c"]);
    second();
    expect(order()).toEqual(["b", "a", "c"]);
    second();
    expect(order()).toEqual(["d", "b", "a", "c"]);
    second();
    expect(order()).toEqual(["d", "a", "c"]);
    expect(header().getAttribute("aria-sort")).toBe("ascending");
  });

  it("keeps a sort the user turned, not only the default", () => {
    render(<Plant script={SCRIPT} sort />);
    fireEvent.click(screen.getByRole("button", { name: /Level/ }));
    expect(screen.getByRole("columnheader", { name: /Level/ }).getAttribute("aria-sort")).toBe("descending");
    second();
    second();
    expect(order()).toEqual(["c", "a", "b", "d"]);
    expect(screen.getByRole("columnheader", { name: /Level/ }).getAttribute("aria-sort")).toBe("descending");
  });

  it("keeps the DOM of a row that only moved: rows are keyed", () => {
    render(<Plant script={SCRIPT} sort />);
    const a = cellOf("Loop a").parentElement;
    second();
    expect(cellOf("Loop a").parentElement).toBe(a);
  });
});

describe("The selection", () => {
  const SCRIPT = [
    [row("a", 1), row("b", 2), row("c", 3)],
    [row("a", 9), row("b", 2), row("c", 3)],
    [row("b", 2), row("c", 3)],
    [row("a", 9), row("b", 2), row("c", 3)],
  ];
  const tickedOf = (name: string) => (screen.getByRole("checkbox", { name: `Select ${name}` }) as HTMLInputElement).checked;

  it("holds a ticked row ticked while its values change", () => {
    render(<Plant script={SCRIPT} selectable />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Loop a" }));
    second();
    expect(tickedOf("Loop a")).toBe(true);
    expect(screen.getByText("1 selected")).toBeTruthy();
  });

  it("counts only the rows that are there when a ticked one goes, keeps its key, and ticks it again if it returns", () => {
    render(<Plant script={SCRIPT} selectable />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Loop a" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Loop b" }));
    expect(screen.getByText("2 selected")).toBeTruthy();
    second();
    second();
    // The row a is gone: the count follows the rows, the key waits in the set.
    expect(screen.getByText("1 selected")).toBeTruthy();
    expect(current!.selection.selected.has("a")).toBe(true);
    second();
    expect(tickedOf("Loop a")).toBe(true);
    expect(screen.getByText("2 selected")).toBeTruthy();
  });
});

describe("An open Row draft", () => {
  const SCRIPT = [
    [row("a", 1, "first"), row("b", 2)],
    [row("a", 7, "first"), row("b", 2)],
    [row("a", 7, "changed elsewhere"), row("b", 2)],
    [row("b", 2)],
  ];
  const open = () => {
    const cell = cellOf("first");
    act(() => cell.focus());
    fireEvent.click(cell);
  };

  it("stays open, with what was typed, while its row's values change", () => {
    render(<Plant script={SCRIPT} grid editMode="row" />);
    open();
    const note = screen.getByLabelText("Edit Note: Loop a") as HTMLInputElement;
    fireEvent.change(note, { target: { value: "first, typed" } });
    second();
    second();
    expect(screen.getByLabelText("Edit Note: Loop a")).toBe(note);
    expect(note.value).toBe("first, typed");
    expect(document.activeElement).toBe(note);
  });

  it("keeps the draft's field that was not typed in as the draft began, not the new value of its row", () => {
    render(<Plant script={SCRIPT} grid editMode="row" />);
    open();
    second();
    // The row's level moved on to 7 meanwhile; a draft is a copy of the row as it was opened (ADR-0036).
    expect((screen.getByLabelText("Edit Level: Loop a") as HTMLInputElement).value).toBe("1");
  });

  it("closes when its row is gone from `rows`, and only then", () => {
    render(<Plant script={SCRIPT} grid editMode="row" />);
    open();
    second();
    second();
    expect(screen.queryByLabelText("Edit Note: Loop a")).not.toBeNull();
    second();
    expect(screen.queryByLabelText("Edit Note: Loop a")).toBeNull();
    expect(screen.getByText("Loop b")).toBeTruthy();
  });
});

describe("The Active cell", () => {
  const SCRIPT = [
    [row("a", 1), row("b", 2), row("c", 3)],
    [row("a", 5), row("b", 2), row("c", 3)],
    [row("a", 5), row("c", 3), row("d", 4)],
  ];
  const line = () => active().parentElement!.getAttribute("data-grid-line");

  it("stays on the same row by key while a re-sort moves it", () => {
    render(<Plant script={SCRIPT} grid sort />);
    act(() => cellOf("Loop a").focus());
    fireEvent.focus(active());
    expect(line()).toBe("row:a");
    second();
    expect(order()).toEqual(["b", "c", "a"]);
    // The tab stop and the walk both stand on a, now the last line.
    expect(active()).toBe(cellOf("Loop a"));
    expect(cellOf("Loop a").getAttribute("tabindex")).toBe("0");
    press("ArrowUp");
    expect(line()).toBe("row:c");
  });

  it("takes the cell now at its index where its row is gone", () => {
    render(<Plant script={SCRIPT} grid sort />);
    second();
    act(() => cellOf("Loop b").focus());
    fireEvent.focus(active());
    expect(line()).toBe("row:b");
    second();
    // b is gone; the order is now c(3), d(4), a(5) - the first line is c, where b stood.
    expect(order()).toEqual(["c", "d", "a"]);
    expect(cellOf("Loop c").getAttribute("tabindex")).toBe("0");
  });
});

describe("The scroll position and the virtual window", () => {
  const MANY = (n: number, level = 0) => Array.from({ length: n }, (_, i) => row(String(i), level + i));
  const SCRIPT = [MANY(1000), MANY(1000, 0.5), MANY(1001), MANY(999)];

  function scroller(container: HTMLElement) {
    return container.querySelector("table")!.parentElement as HTMLElement;
  }
  /* jsdom lays nothing out: the box is 100 px high, a row 36. */
  function scrollTo(container: HTMLElement, top: number) {
    const box = scroller(container);
    box.scrollTop = top;
    fireEvent.scroll(box);
  }
  const rendered = () => Array.from(document.querySelectorAll<HTMLElement>("[data-row]")).map(idOf);
  /** The empty rows standing in for what is not rendered. */
  const fillers = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>("tbody tr:not([data-row])")).map((r) => r.style.height || r.querySelector<HTMLElement>("td")?.style.height || "");

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
  });

  it("leaves the scroll position alone, and the window on the same rows by key, when values change", () => {
    const { container } = render(<Plant script={SCRIPT} virtual />);
    scrollTo(container, 36 * 400);
    const before = rendered();
    expect(before).toContain("400");
    second();
    expect(scroller(container).scrollTop).toBe(36 * 400);
    expect(rendered()).toEqual(before);
  });

  it("leaves the scroll position alone when a row is added or removed below the window", () => {
    const { container } = render(<Plant script={SCRIPT} virtual />);
    scrollTo(container, 36 * 400);
    const before = rendered();
    second();
    second();
    expect(scroller(container).scrollTop).toBe(36 * 400);
    expect(rendered()).toEqual(before);
    second();
    expect(scroller(container).scrollTop).toBe(36 * 400);
    expect(rendered()).toEqual(before);
  });

  it("lets the filler heights follow the count", () => {
    const { container } = render(<Plant script={SCRIPT} virtual />);
    scrollTo(container, 36 * 400);
    const total = () => fillers(container).join("|");
    const at1000 = total();
    second();
    second();
    expect(total()).not.toBe(at1000);
    second();
    expect(total()).not.toBe(at1000);
  });
});
