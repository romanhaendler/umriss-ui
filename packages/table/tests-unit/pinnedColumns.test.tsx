/* Pinned columns in a rendered table (table-column-pinning 01): the blocks in
   head, body, foot and export, what sticks with them, the view, and the lines of
   a grouped and of a virtualised table.

   Where a cell sticks is named here - a place in its block. That it really
   stays at the measured offset while the rest scrolls, and that the shadow
   shows only while content lies under it, only the browser can say
   (features-browser.spec.ts). */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { ColumnMenu, useTable } from "../src";
import type { Table, TableView } from "../src";

interface Machine {
  id: string;
  tag: string;
  line: string;
  area: string;
  output: number;
  scrap: number;
  verdict: string;
}

const MACHINES: Machine[] = [
  { id: "a", tag: "M-01", line: "Line 1", area: "North", output: 120, scrap: 3, verdict: "ok" },
  { id: "b", tag: "M-02", line: "Line 1", area: "South", output: 80, scrap: 1, verdict: "warning" },
  { id: "c", tag: "M-03", line: "Line 2", area: "North", output: 200, scrap: 9, verdict: "alarm" },
];

let current: Table<Machine> | null = null;
const capture = (t: Table<Machine>) => {
  current = t;
};

function Plant({
  initialView,
  grouping,
  stickyRowHeader = false,
  declared = true,
}: {
  initialView?: TableView;
  grouping?: string[];
  stickyRowHeader?: boolean;
  declared?: boolean;
}) {
  const t = useTable(MACHINES, { rowKey: (m) => m.id, initialView, defaultGrouping: grouping });
  capture(t);
  const { Table: Frame, Column, RowActions, Action, RowDetail } = t;
  return (
    <Frame selectable stickyRowHeader={stickyRowHeader}>
      <ColumnMenu />
      <Column value="line" label="Line" />
      <Column value="area" label="Area" />
      <Column value="output" label="Output" aggregate="sum" />
      <Column value="verdict" label="Verdict" pin={declared ? "end" : undefined} />
      <Column value="tag" label="Tag" rowHeader pin={declared ? "start" : undefined} />
      <Column value="scrap" label="Scrap" aggregate="sum" />
      <RowDetail>{(m) => m.tag}</RowDetail>
      <RowActions>
        <Action onSelect={() => {}}>Open</Action>
      </RowActions>
    </Frame>
  );
}

const headRow = (root: HTMLElement) => root.querySelector("thead tr") as HTMLTableRowElement;
const labels = (root: HTMLElement) => Array.from(headRow(root).cells).map((c) => c.textContent);
const place = (cell: Element) => {
  const style = (cell as HTMLElement).style;
  if (style.left) return `start ${/start-(\d+)/.exec(style.left)![1]}`;
  if (style.right) return `end ${/end-(\d+)/.exec(style.right)![1]}`;
  return "-";
};
const places = (row: HTMLTableRowElement) => Array.from(row.cells).map(place);

describe("the pinned blocks", () => {
  it("stand at either end in head, body and foot - the selection and the expander with the start, the actions with the end", () => {
    const { container } = render(<Plant />);
    expect(labels(container)).toEqual(["", "", "Tag", "Line", "Area", "Output", "Scrap", "Verdict", "Actions"]);
    const expected = ["start 0", "start 1", "start 2", "-", "-", "-", "-", "end 1", "end 0"];
    expect(places(headRow(container))).toEqual(expected);
    expect(places(container.querySelector("tbody tr") as HTMLTableRowElement)).toEqual(expected);
    expect(places(container.querySelector("tfoot tr") as HTMLTableRowElement)).toEqual(expected);
  });

  it("mark the inner edge of each block, where its shadow falls", () => {
    const { container } = render(<Plant />);
    const row = container.querySelector("tbody tr") as HTMLTableRowElement;
    expect(row.cells[2]!.className).toContain("pinStartEdge");
    expect(row.cells[7]!.className).toContain("pinEndEdge");
    expect(row.cells[1]!.className).not.toContain("Edge");
  });

  it("go into the export in the order they stand", () => {
    render(<Plant />);
    expect(current!.asCsv().replace("﻿", "").split("\r\n")[0]).toBe("Tag;Line;Area;Output;Scrap;Verdict");
  });

  it("leave a table without pins as it was - nothing sticks", () => {
    const { container } = render(<Plant declared={false} />);
    expect(labels(container).slice(2, 8)).toEqual(["Line", "Area", "Output", "Verdict", "Tag", "Scrap"]);
    expect(container.querySelector("[style*='--u-table-pin']")).toBeNull();
  });

  it("stickyRowHeader is `pin=\"start\"` on the row header, and nothing the view carries", () => {
    const { container } = render(<Plant declared={false} stickyRowHeader />);
    expect(labels(container).slice(2, 4)).toEqual(["Tag", "Line"]);
    expect(current!.pinned).toEqual({ tag: "start" });
    expect(current!.view.pinned).toBeUndefined();
  });

  it("measure their offsets off the head row, one per place", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 50 } as DOMRect);
    const { container } = render(<Plant />);
    const table = container.querySelector("table")!;
    expect(table.style.getPropertyValue("--u-table-pin-start-2")).toBe("100px");
    expect(table.style.getPropertyValue("--u-table-pin-end-1")).toBe("50px");
    vi.restoreAllMocks();
  });
});

describe("pinning as the user chooses", () => {
  it("setPin moves a column into a block and out again; the view carries the whole choice", () => {
    const { container } = render(<Plant />);
    act(() => current!.setPin("scrap", "end"));
    expect(labels(container).slice(2, 8)).toEqual(["Tag", "Line", "Area", "Output", "Verdict", "Scrap"]);
    expect(current!.view.pinned).toEqual({ tag: "start", verdict: "end", scrap: "end" });
    act(() => current!.setPin("scrap", null));
    expect(labels(container).slice(2, 8)).toEqual(["Tag", "Line", "Area", "Output", "Scrap", "Verdict"]);
    expect(current!.view.pinned).toBeUndefined();
  });

  it("an undone declaration stands in the view as an empty choice, and a view hands it back", () => {
    render(<Plant />);
    act(() => current!.setPin("tag", null));
    act(() => current!.setPin("verdict", null));
    expect(current!.view.pinned).toEqual({});
    const { container } = render(<Plant initialView={{ pinned: { area: "start" } }} />);
    expect(labels(container).slice(2, 8)).toEqual(["Area", "Line", "Output", "Verdict", "Tag", "Scrap"]);
    expect(current!.pinned).toEqual({ area: "start" });
  });
});

describe("the lines of a grouped table", () => {
  it("a group header's label sticks over the span and the pinned columns; its aggregates stick in their block", () => {
    const { container } = render(<Plant grouping={["line", "area"]} />);
    expect(labels(container)).toEqual(["", "", "Area", "Tag", "Output", "Scrap", "Verdict", "Actions"]);
    const header = container.querySelector("tbody tr[data-line='header']") as HTMLTableRowElement;
    // Selection, expander | label over the span and Tag | Output, Scrap | Verdict, actions.
    expect(places(header)).toEqual(["start 0", "start 1", "start 2", "-", "-", "end 1", "end 0"]);
    expect(header.cells[2]!.colSpan).toBe(2);
    expect(header.cells[2]!.textContent).toContain("Line 1");
    const row = container.querySelector("tbody tr[data-line='row']") as HTMLTableRowElement;
    expect(places(row)).toEqual(["start 0", "start 1", "start 2", "start 3", "-", "-", "end 1", "end 0"]);
  });

  it("a folded span sticks with its count; the leading run stops before the end block", () => {
    const { container } = render(<Plant grouping={["line", "area"]} />);
    const fold = container.querySelectorAll<HTMLButtonElement>("tbody tr[data-line='row'] [data-fold-path]")[0]!;
    act(() => fold.click());
    const folded = container.querySelector("tbody tr[data-line='folded']") as HTMLTableRowElement;
    expect(places(folded)).toEqual(["start 0", "start 1", "start 2", "start 3", "-", "-", "end 1", "end 0"]);
    expect(folded.cells[3]!.textContent).toMatch(/entr/);
  });

  it("an end-pinned column without an aggregate stands as an empty cell in the end block, not under the label", () => {
    const { container } = render(<Plant grouping={["line"]} initialView={{ pinned: { tag: "start", verdict: "end", area: "end" } }} />);
    const header = container.querySelector("tbody tr[data-line='header']") as HTMLTableRowElement;
    expect(labels(container)).toEqual(["", "", "Tag", "Output", "Scrap", "Area", "Verdict", "Actions"]);
    expect(places(header)).toEqual(["start 0", "start 1", "start 2", "-", "-", "end 2", "end 1", "end 0"]);
  });
});

describe("a group header over a pinned column with an aggregate", () => {
  it("keeps one cell per column: the label takes the first column's place", () => {
    const { container } = render(<Plant grouping={["line"]} initialView={{ pinned: { output: "start" } }} />);
    const header = container.querySelector("tbody tr[data-line='header']") as HTMLTableRowElement;
    const span = (row: HTMLTableRowElement) => Array.from(row.cells).reduce((n, c) => n + c.colSpan, 0);
    expect(span(header)).toBe(headRow(container).cells.length);
    expect(places(header).slice(0, 3)).toEqual(["start 0", "start 1", "start 2"]);
  });
});

describe("a virtualised table", () => {
  interface Reading {
    id: string;
    tag: string;
    value: number;
  }
  const MANY: Reading[] = Array.from({ length: 200 }, (_, i) => ({ id: String(i), tag: `T-${i}`, value: i }));

  function Big() {
    const { Table: Frame, Column } = useTable(MANY, { rowKey: (r) => r.id, virtual: { rowHeight: 20 } });
    return (
      <Frame maxHeight="100px" selectable>
        <Column value="value" label="Value" />
        <Column value="tag" label="Tag" rowHeader pin="start" />
      </Frame>
    );
  }

  it("pins the cells of every row of the window", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    const { container } = render(<Big />);
    const rows = Array.from(container.querySelectorAll<HTMLTableRowElement>("tbody tr[data-row]"));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(places(row)).toEqual(["start 0", "start 1", "-"]);
    vi.restoreAllMocks();
  });
});

describe("pinning in the column menu (table-column-pinning 02)", () => {
  const openMenu = () => {
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    return screen.getByRole("dialog");
  };
  const entries = (menu: HTMLElement) =>
    within(menu).getAllByRole("checkbox").map((k) => k.closest("label")!.textContent);

  it("lists the columns in the order they stand, and offers each side or the way back", () => {
    render(<Plant />);
    const menu = openMenu();
    expect(entries(menu)).toEqual(["Tag", "Line", "Area", "Output", "Scrap", "Verdict"]);
    within(menu).getByRole("button", { name: "Unpin Tag" });
    within(menu).getByRole("button", { name: "Pin Tag to end" });
    within(menu).getByRole("button", { name: "Pin Line to start" });
    within(menu).getByRole("button", { name: "Pin Line to end" });
    within(menu).getByRole("button", { name: "Unpin Verdict" });
  });

  it("pins to the end: the column joins the end block on the screen and in the menu, and the view carries it", () => {
    const { container } = render(<Plant />);
    const menu = openMenu();
    fireEvent.click(within(menu).getByRole("button", { name: "Pin Line to end" }));
    expect(labels(container).slice(2, 8)).toEqual(["Tag", "Area", "Output", "Scrap", "Line", "Verdict"]);
    expect(entries(menu)).toEqual(["Tag", "Area", "Output", "Scrap", "Line", "Verdict"]);
    expect(current!.view.pinned).toEqual({ tag: "start", verdict: "end", line: "end" });
    fireEvent.click(within(menu).getByRole("button", { name: "Unpin Line" }));
    expect(labels(container).slice(2, 8)).toEqual(["Tag", "Line", "Area", "Output", "Scrap", "Verdict"]);
  });

  it("the other side's key moves a pinned column across", () => {
    const { container } = render(<Plant />);
    const menu = openMenu();
    fireEvent.click(within(menu).getByRole("button", { name: "Pin Tag to end" }));
    expect(labels(container).slice(2, 8)).toEqual(["Line", "Area", "Output", "Scrap", "Verdict", "Tag"]);
  });

  it("moves a column only inside its block", () => {
    render(<Plant />);
    const menu = openMenu();
    const disabled = (name: string) => (within(menu).getByRole("button", { name }) as HTMLButtonElement).disabled;
    expect(disabled("Move Line forward")).toBe(true);
    expect(disabled("Move Scrap backward")).toBe(true);
    expect(disabled("Move Area forward")).toBe(false);
    expect(disabled("Move Tag backward")).toBe(true);
  });

  it("speaks German from the provider's wording", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <Plant />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Spalten" }));
    const menu = screen.getByRole("dialog");
    within(menu).getByRole("button", { name: "Line am Anfang fixieren" });
    within(menu).getByRole("button", { name: "Line am Ende fixieren" });
    within(menu).getByRole("button", { name: "Fixierung von Tag lösen" });
  });
});
