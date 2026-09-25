/* Grid mode (table-grid-mode 02): `<Table grid>` at the table's public
   interface - one tab stop, the Active cell walked by every key, a cell's own
   controls behind Enter and Escape, the Active cell surviving a sort, a
   hidden column and a virtual window. Without `grid` nothing changes. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { Table } from "../src";

interface Pump {
  id: string;
  name: string;
  area: string;
  flow: number;
}

const PUMPS: Pump[] = [
  { id: "p1", name: "Pump 1", area: "North", flow: 12 },
  { id: "p2", name: "Pump 2", area: "South", flow: 30 },
  { id: "p3", name: "Pump 3", area: "North", flow: 7 },
];

let current: Table<Pump> | null = null;
const capture = (t: Table<Pump>) => {
  current = t;
};

function Pumps({ grid = true, grouped = false, rows = PUMPS, detail = false, selectable = true }: { grid?: boolean; grouped?: boolean; rows?: Pump[]; detail?: boolean; selectable?: boolean }) {
  const t = useTable(rows, { rowKey: (p) => p.id, defaultGrouping: grouped ? "area" : undefined });
  capture(t);
  const { Table: Frame, Column, RowDetail } = t;
  return (
    <Frame grid={grid} selectable={selectable} ariaLabel="Pumps">
      <Column value="name" label="Pump" rowHeader />
      <Column value="area" label="Area" />
      <Column value="flow" label="Flow" aggregate="sum" />
      {detail && <RowDetail>{(p) => <button type="button">Service {p.name}</button>}</RowDetail>}
    </Frame>
  );
}

const table = () => screen.getByRole(current?.grouping.length ? "treegrid" : "grid");
const tabStops = (root: Element) => Array.from(root.querySelectorAll<HTMLElement>("[tabindex='0'], button:not([tabindex]), input:not([tabindex])"));
const active = () => document.activeElement as HTMLElement;
const press = (key: string, init: Partial<KeyboardEventInit> = {}) => fireEvent.keyDown(active(), { key, ...init });
/** The Active cell's text, and its line's key. */
const at = () => [active().textContent, active().parentElement!.getAttribute("data-grid-line")];

describe("Grid mode", () => {
  it("leaves a table without it a native table: no role, no stops on its cells", () => {
    const { container } = render(<Pumps grid={false} />);
    const t = container.querySelector("table")!;
    expect(t.getAttribute("role")).toBeNull();
    expect(t.querySelector("[data-grid-line]")).toBeNull();
    expect(t.querySelector("td[tabindex], th[tabindex]")).toBeNull();
  });

  it("is a grid with one tab stop, the first cell of the body; the cells' controls are out of the tab order", () => {
    render(<Pumps />);
    const stops = tabStops(table());
    expect(stops).toHaveLength(1);
    expect(stops[0]!.parentElement!.getAttribute("data-grid-line")).toBe("row:p1");
    expect(screen.getByRole("checkbox", { name: "Select Pump 1" }).getAttribute("tabindex")).toBe("-1");
    expect(screen.getByRole("button", { name: /Pump/ }).getAttribute("tabindex")).toBe("-1");
    expect(table().getAttribute("aria-readonly")).toBe("true");
  });

  it("walks the cells with the arrows, and stays at an edge", () => {
    render(<Pumps />);
    act(() => tabStops(table())[0]!.focus());
    press("ArrowRight");
    expect(at()).toEqual(["Pump 1", "row:p1"]);
    press("ArrowRight");
    press("ArrowDown");
    expect(at()).toEqual(["South", "row:p2"]);
    press("ArrowLeft");
    press("ArrowUp");
    expect(at()).toEqual(["Pump 1", "row:p1"]);
    press("ArrowUp");
    expect(at()[1]).toBe("head");
    press("ArrowUp");
    expect(at()[1]).toBe("head");
  });

  it("goes to the row's ends with Home and End, and to the table's with Ctrl", () => {
    render(<Pumps />);
    act(() => tabStops(table())[0]!.focus());
    press("ArrowDown");
    press("End");
    expect(at()).toEqual(["30", "row:p2"]);
    press("Home");
    expect(at()[1]).toBe("row:p2");
    expect(active().querySelector("input[type=checkbox]")).not.toBeNull();
    press("End", { ctrlKey: true });
    /* The footer: the sum of the flow. */
    expect(at()[1]).toBe("foot");
    expect(active().textContent).toContain("49");
    press("Home", { ctrlKey: true });
    expect(at()[1]).toBe("head");
  });

  it("jumps by the rows in view with PageDown and PageUp", () => {
    render(<Pumps />);
    act(() => tabStops(table())[0]!.focus());
    press("PageDown");
    expect(at()[1]).toBe("foot");
    press("PageUp");
    expect(at()[1]).toBe("head");
  });

  it("makes a clicked cell the Active one, and moves the tab stop with it", () => {
    render(<Pumps />);
    const cell = screen.getByText("Pump 3");
    act(() => cell.focus());
    fireEvent.focus(cell);
    expect(cell.getAttribute("tabindex")).toBe("0");
    expect(tabStops(table())).toEqual([cell]);
  });

  it("reaches a cell's own control with Enter and leaves it with Escape", () => {
    render(<Pumps />);
    act(() => tabStops(table())[0]!.focus());
    const cell = active();
    press("Enter");
    const box = screen.getByRole("checkbox", { name: "Select Pump 1" });
    expect(document.activeElement).toBe(box);
    /* In the cell, its control is back in the tab order. */
    expect(box.getAttribute("tabindex")).toBeNull();
    press("Escape");
    expect(document.activeElement).toBe(cell);
    expect(box.getAttribute("tabindex")).toBe("-1");
  });

  /* table-grid-mode 05: as in AG Grid and MUI - the key a checkbox answers
     to, from anywhere in its row. */
  it("selects the Active cell's row with Space, and deselects it with the next", () => {
    render(<Pumps />);
    act(() => tabStops(table())[0]!.focus());
    press("ArrowRight");
    press("ArrowRight");
    press(" ");
    const box = screen.getByRole("checkbox", { name: "Select Pump 1" }) as HTMLInputElement;
    expect(box.checked).toBe(true);
    expect(at()).toEqual(["North", "row:p1"]);
    press(" ");
    expect(box.checked).toBe(false);
  });

  it("does nothing with Space where there is no selection, or no row", () => {
    render(<Pumps selectable={false} />);
    act(() => tabStops(table())[0]!.focus());
    const before = at();
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    active().dispatchEvent(event);
    expect(at()).toEqual(before);
    expect(event.defaultPrevented).toBe(false);
  });

  it("reaches the controls in a detail with F2", () => {
    render(<Pumps detail />);
    act(() => current!.toggleRow("p1"));
    act(() => tabStops(table())[0]!.focus());
    press("ArrowDown");
    expect(at()[1]).toBe("detail:p1");
    press("F2");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Service Pump 1" }));
    press("F2");
    expect(at()[1]).toBe("detail:p1");
  });

  it("holds on to its row across a sort", () => {
    render(<Pumps />);
    act(() => screen.getByText("Pump 1").focus());
    fireEvent.focus(screen.getByText("Pump 1"));
    act(() => current!.toggleSort("flow"));
    act(() => current!.toggleSort("flow"));
    /* Descending: Pump 2, Pump 1, Pump 3 - the tab stop went along. */
    expect(tabStops(table())[0]!.textContent).toBe("Pump 1");
    expect(tabStops(table())[0]!.parentElement!.getAttribute("data-grid-line")).toBe("row:p1");
  });

  it("skips a hidden column, and stands in the next one where its own is hidden", () => {
    render(<Pumps />);
    act(() => screen.getAllByText("North")[0]!.focus());
    fireEvent.focus(active());
    act(() => current!.toggleColumn("area"));
    expect(tabStops(table())[0]!.textContent).toBe("12");
    act(() => tabStops(table())[0]!.focus());
    press("ArrowLeft");
    expect(at()).toEqual(["Pump 1", "row:p1"]);
  });

  it("is a treegrid when grouped, and keeps its column through a group header", () => {
    render(<Pumps grouped />);
    expect(table().getAttribute("role")).toBe("treegrid");
    act(() => screen.getByText("12").focus());
    fireEvent.focus(active());
    press("ArrowUp");
    /* The group header's sum under the same column. */
    expect(at()).toEqual(["19", 'header:["value:North"]']);
    press("ArrowUp");
    expect(at()[1]).toBe("head");
    press("ArrowDown");
    press("ArrowDown");
    expect(at()).toEqual(["12", "row:p1"]);
  });
});

describe("Grid mode through a spanning cell", () => {
  interface Part {
    id: string;
    kind: string;
    name: string;
    maker: string;
    stock: number;
  }
  const PARTS: Part[] = [
    { id: "a", kind: "Valve", name: "V-1", maker: "Keller", stock: 4 },
    { id: "b", kind: "Valve", name: "V-2", maker: "Brandt", stock: 2 },
  ];

  function Parts() {
    const { Table: Frame, Column } = useTable(PARTS, { rowKey: (p) => p.id, defaultGrouping: "kind" });
    return (
      <Frame grid>
        <Column value="kind" label="Kind" />
        <Column value="name" label="Part" rowHeader />
        <Column value="maker" label="Maker" />
        <Column value="stock" label="Stock" aggregate="sum" />
      </Frame>
    );
  }

  it("keeps its column through a group header whose label spans it", () => {
    render(<Parts />);
    act(() => screen.getByText("Keller").focus());
    fireEvent.focus(active());
    /* The header's label spans Part and Maker; up and up again lands on Maker's head. */
    press("ArrowUp");
    expect(at()[1]).toBe('header:["value:Valve"]');
    press("ArrowUp");
    expect(active().textContent).toBe("Maker");
    press("ArrowDown");
    press("ArrowDown");
    expect(at()).toEqual(["Keller", "row:a"]);
  });
});

describe("Grid mode in a virtual window", () => {
  interface Reading {
    id: string;
    tag: string;
  }
  const MANY: Reading[] = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), tag: `M-${i}` }));

  function Big() {
    const { Table: Frame, Column } = useTable(MANY, { rowKey: (m) => m.id, virtual: { rowHeight: 20 } });
    return (
      <Frame grid maxHeight="100px">
        <Column value="tag" label="Tag" rowHeader />
      </Frame>
    );
  }

  it("carries the tab stop on a cell, not on the row, and walks to a row not rendered yet", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    const { container } = render(<Big />);
    expect(container.querySelector("tr[tabindex]")).toBeNull();
    act(() => screen.getByText("M-0").focus());
    fireEvent.focus(active());
    press("End", { ctrlKey: true });
    /* M-999 is rendered once the window has moved there, and then focused. */
    const scroll = container.querySelector("table")!.parentElement!;
    fireEvent.scroll(scroll);
    expect(screen.getByText("M-999").getAttribute("tabindex")).toBe("0");
  });
});
