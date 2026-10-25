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
    <Frame aria-label="Units" selectable grid={grid} onCellEdit={editable ? () => undefined : undefined}>
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

  const openEditor = () => {
    render(<Units grid editable />);
    const cell = screen.getByText("300").closest<HTMLElement>("td")!;
    act(() => cell.focus());
    fireEvent.focus(cell);
    fireEvent.keyDown(cell, { key: "Enter" });
    return { cell, input: screen.getByLabelText("Edit Budget: Sales") as HTMLInputElement };
  };

  it("copy what stands in an open editor when nothing is marked in it", async () => {
    const { cell, input } = openEditor();
    fireEvent.change(input, { target: { value: "415" } });
    expect(copy(input)).toBe(false);
    expect(await voice()).toBe("Cell copied");
    expect(writeText).toHaveBeenCalledWith("415");
    expect(cell.hasAttribute("data-copied")).toBe(true);
  });

  it("leave the key to the browser where text is marked in the editor", () => {
    const { cell, input } = openEditor();
    input.setSelectionRange(0, 2);
    expect(copy(input)).toBe(true);
    expect(writeText).not.toHaveBeenCalled();
    expect(cell.hasAttribute("data-copied")).toBe(false);
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

/* The flash (table-copy-rows 03): `data-copied` on the copied cells, taken off
   when the animation ends. jsdom runs no animation; the end is fired by hand. */
describe("The flash of a copy", () => {
  const flashed = () => Array.from(document.querySelectorAll("[data-copied]"));

  it("marks the cells of the copied rows and loses the mark when the animation ends", async () => {
    render(<Units />);
    pick("s", "o");
    copy(screen.getByText("Sales"));
    await voice();
    const marked = flashed();
    expect(marked).toHaveLength(8);
    expect(new Set(marked.map((c) => c.closest("tr"))).size).toBe(2);
    marked.forEach((c) => fireEvent.animationEnd(c));
    expect(flashed()).toHaveLength(0);
  });

  it("copies, announces and marks the rows with the focus on a checkbox, a row's or the header's", async () => {
    render(<Units />);
    const [all, ...boxes] = screen.getAllByRole("checkbox") as HTMLInputElement[];
    for (const box of [boxes[0]!, boxes[1]!]) {
      fireEvent.click(box);
      act(() => box.focus());
    }
    expect(copy(document.activeElement!)).toBe(false);
    expect(await voice()).toBe("2 rows copied");
    expect(writeText).toHaveBeenLastCalledWith(current!.selectionAsText());
    expect(flashed().length).toBe(8);
    flashed().forEach((c) => fireEvent.animationEnd(c));
    act(() => all!.focus());
    copy(all!);
    expect(await voice()).toBe("2 rows copied");
    expect(flashed().length).toBe(8);
  });

  it("marks the Active cell alone", async () => {
    render(<Units grid />);
    const cell = screen.getByText("Sales").closest<HTMLElement>("th, td")!;
    act(() => cell.focus());
    fireEvent.keyDown(cell, { key: "ArrowRight" });
    copy(document.activeElement!);
    await voice();
    expect(flashed()).toEqual([document.activeElement]);
  });

  it("starts again with a second copy", async () => {
    render(<Units />);
    pick("o");
    copy(screen.getByText("Ops"));
    await voice();
    const first = flashed();
    expect(first.length).toBeGreaterThan(0);
    const remove = vi.spyOn(first[0]!, "removeAttribute");
    copy(screen.getByText("Ops"));
    await voice();
    expect(remove).toHaveBeenCalledWith("data-copied");
    expect(flashed()).toHaveLength(first.length);
  });

  it("marks nothing when the copy fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    writeText.mockRejectedValue(new Error("denied"));
    render(<Units />);
    pick("s");
    copy(screen.getByText("Sales"));
    await voice();
    expect(flashed()).toHaveLength(0);
  });
});
