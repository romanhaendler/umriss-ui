/* Copying rows (table-copy-rows 01 and 02): `selectionAsText()` and the key
   that writes it. The text is the export's values, tab-separated, under a
   header line; the key is heard on the frame and leaves the browser's own copy
   alone wherever text is marked or typed. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Search, Toolbar, useTable } from "../src";
import type { Table } from "../src";

interface Unit {
  id: string;
  name: string;
  budget: number;
  open: boolean;
  children?: Unit[];
}

const UNITS: Unit[] = [
  {
    id: "s",
    name: "Sales",
    budget: 300,
    open: true,
    children: [
      { id: "sn", name: "North", budget: 120.5, open: false },
      { id: "ss", name: "South", budget: 180, open: true },
    ],
  },
  { id: "o", name: "Ops", budget: 90, open: false },
];

let current: Table<Unit> | null = null;
const capture = (t: Table<Unit>) => {
  current = t;
};

function Units({ tree = false, grid = false, editable = false, search = false }: { tree?: boolean; grid?: boolean; editable?: boolean; search?: boolean }) {
  const t = useTable(UNITS, { rowKey: (u) => u.id, childRows: tree ? (u) => u.children : undefined });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame ariaLabel="Units" selectable grid={grid} onCellEdit={editable ? () => undefined : undefined}>
      {search && (
        <Toolbar>
          <Search />
        </Toolbar>
      )}
      <Column value="name" label="Unit" rowHeader searchable />
      <Column value="budget" label="Budget" edit={editable ? "number" : undefined} />
      <Column value="open" label="Open" />
    </Frame>
  );
}

const pick = (...keys: string[]) => act(() => keys.forEach((k) => current!.selection.toggle(k)));
/* The library's one voice (core's `announce`): a region of the body, written
   once the announcements have rested - 150 ms - and after the clipboard's promise. */
const region = () => document.querySelector("[data-umriss-announcer]");
const voice = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(150);
  });
  return region()?.textContent ?? "";
};
const copy = (target: Element, init: Partial<KeyboardEventInit> = { ctrlKey: true }) => fireEvent.keyDown(target, { key: "c", ...init });

let writeText: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.useFakeTimers();
  region()?.replaceChildren();
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
});

describe("selectionAsText", () => {
  it("is empty with nothing selected", () => {
    render(<Units />);
    expect(current!.selectionAsText()).toBe("");
  });

  it("writes a header line and the selected rows in the shown order, without hidden columns", () => {
    render(<Units />);
    act(() => {
      current!.toggleColumn("open");
      current!.setOrder(["budget"]);
    });
    pick("o", "s");
    expect(current!.selectionAsText()).toBe("Budget\tUnit\n300\tSales\n90\tOps");
  });

  it("uses the formats' decimal mark and the wording's yes/no", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Units tree />
      </LanguageProvider>,
    );
    act(() => current!.unfoldAllBranches());
    pick("sn");
    expect(current!.selectionAsText()).toBe("Unit\tBudget\tOpen\nNorth\t120,5\tnein");
  });

  it("writes a selected branch without its unselected children, no level column, closed or open", () => {
    render(<Units tree />);
    pick("s");
    expect(current!.selectionAsText()).toBe("Unit\tBudget\tOpen\nSales\t300\tyes");
  });

  it("leaves a selected row outside the filter out", () => {
    render(<Units />);
    pick("s", "o");
    act(() => current!.setSearch("Ops"));
    expect(current!.selectionAsText()).toBe("Unit\tBudget\tOpen\nOps\t90\tno");
  });
});

describe("Ctrl+C and Cmd+C", () => {
  it("write the text of selectionAsText() and announce the count, twice if pressed twice", async () => {
    render(<Units />);
    pick("s", "o");
    const row = screen.getByText("Sales");
    copy(row);
    expect(await voice()).toBe("2 rows copied");
    expect(region()!.getAttribute("role")).toBe("status");
    expect(writeText).toHaveBeenCalledWith(current!.selectionAsText());
    const before = region()!.firstChild;
    copy(row, { metaKey: true });
    expect(await voice()).toBe("2 rows copied");
    expect(region()!.firstChild).not.toBe(before);
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it("take the key, and only with ctrl xor meta, without Alt or Shift", () => {
    render(<Units />);
    pick("s");
    const row = screen.getByText("Sales");
    for (const init of [{ ctrlKey: true, shiftKey: true }, { ctrlKey: true, altKey: true }, { ctrlKey: true, metaKey: true }, {}]) {
      expect(copy(row, init)).toBe(true);
    }
    expect(writeText).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(row, { key: "x", ctrlKey: true })).toBe(true);
    expect(copy(row)).toBe(false);
  });

  it("leave the key to the browser where text is marked", () => {
    render(<Units />);
    pick("s");
    vi.spyOn(window, "getSelection").mockReturnValue({ toString: () => "Sal" } as Selection);
    expect(copy(screen.getByText("Sales"))).toBe(true);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("leave the key to a focused input", () => {
    render(<Units search />);
    pick("s");
    expect(copy(screen.getByRole("searchbox"))).toBe(true);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("pass with no selection in a table that is not a grid", async () => {
    render(<Units />);
    expect(copy(screen.getByText("Sales"))).toBe(true);
    expect(writeText).not.toHaveBeenCalled();
    expect(await voice()).toBe("");
  });

  it("copy the Active cell of a grid with no selection, the rows with one", async () => {
    render(<Units grid />);
    const cell = screen.getByText("Sales").closest<HTMLElement>("th, td")!;
    act(() => cell.focus());
    fireEvent.keyDown(cell, { key: "ArrowRight" });
    copy(document.activeElement!);
    expect(await voice()).toBe("Cell copied");
    expect(writeText).toHaveBeenLastCalledWith("300");
    pick("o");
    copy(document.activeElement!);
    expect(await voice()).toBe("1 row copied");
    expect(writeText).toHaveBeenLastCalledWith("Unit\tBudget\tOpen\nOps\t90\tno");
  });

  it("are not swallowed by the grid's own handler", async () => {
    render(<Units grid />);
    const cell = screen.getByText("Sales").closest<HTMLElement>("th, td")!;
    act(() => cell.focus());
    fireEvent.focus(cell);
    expect(copy(cell)).toBe(false);
    await voice();
    expect(writeText).toHaveBeenCalledWith("Sales");
  });

  it("leave a grid editor's own copy alone", () => {
    render(<Units grid editable />);
    const cell = screen.getByText("300").closest<HTMLElement>("td")!;
    act(() => cell.focus());
    fireEvent.focus(cell);
    fireEvent.keyDown(cell, { key: "Enter" });
    const input = screen.getByLabelText("Edit Budget: Sales");
    expect(copy(input)).toBe(true);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("say that the copy failed when the clipboard refuses or is missing", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    writeText.mockRejectedValue(new Error("denied"));
    render(<Units />);
    pick("s");
    copy(screen.getByText("Sales"));
    expect(await voice()).toBe("Could not copy");
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    copy(screen.getByText("Sales"));
    const before = region()!.firstChild;
    expect(await voice()).toBe("Could not copy");
    expect(region()!.firstChild).not.toBe(before);
  });
});
