/* Column groups: a second head row over the columns of a `ColumnGroup`, spans
   that follow what is visible, a group that cannot be left by reordering, and
   the groups' names in the export. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColumnGroup, ColumnMenu, Export, Toolbar, useTable } from "../src";
import type { ExportFormat, ExportSheet, Table } from "../src";

const ROWS = [{ id: "a", name: "Bolt", jan: 1, feb: 2, mar: 3, apr: 4 }];

let current: Table<(typeof ROWS)[number]> | null = null;
const capture = (t: Table<(typeof ROWS)[number]>) => {
  current = t;
};

function Report({ pinFeb = false, format }: { pinFeb?: boolean; format?: ExportFormat<string> }) {
  const t = useTable(ROWS, { rowKey: (r) => r.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Report">
      <Toolbar>
        <ColumnMenu />
        {format && <Export format={format} label="Out" />}
      </Toolbar>
      <Column value="name" label="Name" rowHeader />
      <ColumnGroup label="Q1">
        <Column value="jan" label="Jan" />
        <Column value="feb" label="Feb" pin={pinFeb ? "start" : undefined} />
        <Column value="mar" label="Mar" />
      </ColumnGroup>
      <Column value="apr" label="Apr" />
    </Frame>
  );
}

const rows = (root: HTMLElement) => Array.from(root.querySelectorAll("thead tr"));
const cells = (row: Element) => Array.from((row as HTMLTableRowElement).cells).map((c) => [c.textContent, (c as HTMLTableCellElement).colSpan]);

describe("the head of grouped columns", () => {
  it("has two rows; the group cell spans its columns and carries the column-group scope", () => {
    const { container } = render(<Report />);
    expect(rows(container)).toHaveLength(2);
    expect(cells(rows(container)[0]!)).toEqual([["", 1], ["Q1", 3], ["", 1]]);
    const group = screen.getByRole("columnheader", { name: "Q1" });
    expect(group.getAttribute("scope")).toBe("colgroup");
    expect(cells(rows(container)[1]!).map(([t]) => t)).toEqual(["Name", "Jan", "Feb", "Mar", "Apr"]);
  });

  it("narrows the span when a column hides, and goes when the last one does", () => {
    const { container } = render(<Report />);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Jan" }));
    expect(cells(rows(container)[0]!)[1]).toEqual(["Q1", 2]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Feb" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Mar" }));
    expect(rows(container)).toHaveLength(1);
  });

  it("shows the label over each part of a group that pinning splits", () => {
    const { container } = render(<Report pinFeb />);
    expect(cells(rows(container)[0]!).map(([t, span]) => `${t}:${span}`)).toEqual(["Q1:1", ":1", "Q1:2", ":1"]);
  });

  it("is a single row without a group", () => {
    const Plain = () => {
      const { Table: Frame, Column } = useTable(ROWS, { rowKey: (r) => r.id });
      return (
        <Frame aria-label="Plain">
          <Column value="name" label="Name" />
        </Frame>
      );
    };
    const { container } = render(<Plain />);
    expect(rows(container)).toHaveLength(1);
  });
});

describe("reordering in the column menu", () => {
  it("keeps a column inside its group", () => {
    render(<Report />);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.getByText("Q1", { selector: "li" })).toBeTruthy();
    const disabled = (name: string) => (screen.getByRole("button", { name }) as HTMLButtonElement).disabled;
    expect(disabled("Move Jan forward")).toBe(true);
    expect(disabled("Move Mar backward")).toBe(true);
    expect(disabled("Move Feb forward")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Move Feb forward" }));
    expect(current!.asCsv().replace("﻿", "").split("\r\n")[0]).toBe("Name,Q1 · Feb,Q1 · Jan,Q1 · Mar,Apr");
  });
});

describe("the export", () => {
  it("writes one header row with \"<group> · <column>\"", () => {
    render(<Report />);
    expect(current!.asCsv().replace("﻿", "").split("\r\n")[0]).toBe("Name,Q1 · Jan,Q1 · Feb,Q1 · Mar,Apr");
  });

  it("hands the same labels to a format of one's own, which is what XLSX writes", () => {
    const write = vi.fn((sheet: ExportSheet) => sheet.columns.map((c) => c.label).join("|"));
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<Report format={{ extension: "txt", mime: "text/plain", write } as ExportFormat<string>} />);
    fireEvent.click(screen.getByRole("button", { name: "Out" }));
    expect(write.mock.results[0]!.value).toBe("Name|Q1 · Jan|Q1 · Feb|Q1 · Mar|Apr");
  });
});
