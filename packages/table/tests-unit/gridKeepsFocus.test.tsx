/* Grid mode: the keys and the editor keep focus and input - a removed row, the
   column groups' row, Space on a head, Cmd with the arrows, a click that
   selects, and the names a screen reader reads. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColumnGroup, Pagination, useTable } from "../src";

interface Pump {
  id: string;
  name: string;
  flow: number;
}

const PUMPS: Pump[] = [
  { id: "p1", name: "Pump 1", flow: 12 },
  { id: "p2", name: "Pump 2", flow: 30 },
  { id: "p3", name: "Pump 3", flow: 7 },
];

const active = () => document.activeElement as HTMLElement;
const press = (key: string, init: Partial<KeyboardEventInit> = {}) => fireEvent.keyDown(active(), { key, ...init });
const cellOf = (text: string) => screen.getByText(text).closest<HTMLElement>("td, th")!;
const line = () => active().parentElement!.getAttribute("data-grid-line");

function Editable({ rows, onCellEdit, grouped = false }: { rows: Pump[]; onCellEdit?: (e: unknown) => void; grouped?: boolean }) {
  const { Table: Frame, Column } = useTable(rows, { rowKey: (p) => p.id });
  const columns = (
    <>
      <Column value="name" label="Pump" rowHeader edit="text" />
      <Column value="flow" label="Flow" edit="number" />
    </>
  );
  return (
    <Frame grid selectable onCellEdit={onCellEdit as never} aria-label="Pumps">
      {grouped ? <ColumnGroup label="Duty">{columns}</ColumnGroup> : columns}
    </Frame>
  );
}

describe("An edit whose row a live update removes", () => {
  it("is reported, and the focus goes to the row now at its place", () => {
    const onCellEdit = vi.fn();
    const { rerender } = render(<Editable rows={PUMPS} onCellEdit={onCellEdit} />);
    act(() => cellOf("Pump 2").focus());
    press("Enter");
    const input = active() as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Pump 2b" } });
    rerender(<Editable rows={PUMPS.filter((p) => p.id !== "p2")} onCellEdit={onCellEdit} />);
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ rowKey: "p2", columnId: "name", value: "Pump 2b" }));
    expect(active()).not.toBe(document.body);
    expect(line()).toBe("row:p3");
  });
});

describe("A focused cell that leaves the document", () => {
  it("hands the focus to the cell now at its place, not to the body", () => {
    const { rerender } = render(<Editable rows={PUMPS} />);
    act(() => cellOf("Pump 3").focus());
    rerender(<Editable rows={PUMPS.slice(0, 2)} />);
    expect(active()).not.toBe(document.body);
    expect(line()).toBe("row:p2");
  });
});

describe("Ctrl+Home deep in a virtual grid", () => {
  const MANY = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), tag: `M-${i}` }));
  function Big({ sticky }: { sticky: boolean }) {
    const { Table: Frame, Column } = useTable(MANY, { rowKey: (m) => m.id, virtual: true });
    return (
      <Frame grid stickyHeader={sticky} maxHeight="100px">
        <Column value="tag" label="Tag" rowHeader />
      </Frame>
    );
  }

  it.each([true, false])("scrolls to the top and focuses the head, stickyHeader %s", (sticky) => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    const { container } = render(<Big sticky={sticky} />);
    const scroll = container.querySelector("table")!.parentElement!;
    act(() => cellOf("M-0").focus());
    press("End", { ctrlKey: true });
    fireEvent.scroll(scroll);
    expect(scroll.scrollTop).toBeGreaterThan(0);
    act(() => cellOf("M-999").focus());
    press("Home", { ctrlKey: true });
    expect(scroll.scrollTop).toBe(0);
    expect(line()).toBe("head");
  });
});

describe("The column groups' row", () => {
  it("is reached by ArrowUp from the head and left by ArrowDown; its blank cells are no gridcells", () => {
    const { container } = render(<Editable rows={PUMPS} grouped />);
    const blanks = container.querySelectorAll("tr[data-head-group] td");
    expect(blanks.length).toBeGreaterThan(0);
    blanks.forEach((b) => expect(b.getAttribute("role")).toBe("presentation"));
    act(() => screen.getByRole("columnheader", { name: "Flow" }).focus());
    expect(line()).toBe("head");
    press("ArrowUp");
    expect(active().textContent).toBe("Duty");
    expect(active().closest("tr")!.hasAttribute("data-head-group")).toBe(true);
    press("ArrowDown");
    expect(line()).toBe("head");
  });
});

describe("Keys on a head cell", () => {
  it("never leave Space to the browser, which scrolls with it", () => {
    render(<Editable rows={PUMPS} />);
    act(() => screen.getByRole("columnheader", { name: "Flow" }).focus());
    const notPrevented = fireEvent.keyDown(active(), { key: " " });
    expect(notPrevented).toBe(false);
  });

  it("go to the edges with Cmd and the arrows, as with Ctrl and Home", () => {
    render(<Editable rows={PUMPS} />);
    act(() => cellOf("Pump 2").focus());
    press("ArrowDown", { metaKey: true });
    expect(line()).toBe("row:p3");
    press("ArrowUp", { metaKey: true });
    expect(line()).toBe("head");
    act(() => cellOf("Pump 2").focus());
    press("ArrowRight", { metaKey: true });
    expect(active().textContent).toContain("30");
    press("ArrowLeft", { metaKey: true });
    expect((active() as HTMLTableCellElement).cellIndex).toBe(0);
    press("End", { metaKey: true });
    expect(line()).toBe("row:p3");
  });
});

describe("A click that opens an editor", () => {
  it("selects the value, so that typing replaces it", () => {
    render(<Editable rows={PUMPS} />);
    const cell = cellOf("12");
    fireEvent.focus(cell);
    act(() => cell.focus());
    fireEvent.click(cell);
    const input = active() as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
  });
});

describe("What a screen reader reads", () => {
  it("counts the columns of the grid", () => {
    render(<Editable rows={PUMPS} />);
    expect(screen.getByRole("grid").getAttribute("aria-colcount")).toBe("3");
  });

  interface Unit {
    id: string;
    name: string;
    children?: Unit[];
  }
  const UNITS: Unit[] = [{ id: "v", name: "Sales", children: [{ id: "vn", name: "North" }] }];
  function Units() {
    const { Table: Frame, Column } = useTable(UNITS, { rowKey: (u) => u.id, childRows: (u) => u.children, pageSize: 5 });
    return (
      <Frame grid aria-label="Units" onRowAdd={() => undefined} newRow={() => ({})}>
        <Pagination />
        <Column value="name" label="Unit" rowHeader edit="text" />
      </Frame>
    );
  }

  it("names a tree row by its value, not by its fold's label", () => {
    render(<Units />);
    expect(screen.getByRole("rowheader", { name: "Sales" })).toBeTruthy();
  });

  it("gives a new-row draft an aria-rowindex where the rows have one", () => {
    function Paged() {
      const { Table: Frame, Column } = useTable(PUMPS, { rowKey: (p) => p.id, pageSize: 5 });
      return (
        <Frame grid aria-label="Pumps" onRowAdd={() => undefined} newRow={() => ({})}>
          <Pagination />
          <Column value="name" label="Pump" rowHeader edit="text" />
        </Frame>
      );
    }
    const { container } = render(<Paged />);
    fireEvent.click(screen.getByRole("button", { name: "New row" }));
    expect(container.querySelector('tr[data-grid-line="new"]')!.getAttribute("aria-rowindex")).toBe("2");
  });
});
