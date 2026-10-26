/* The format seam of the export: a format is a value handed to `Export`, and it
   receives the sheet - typed cells, widths, a tree's level. */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { Export, Toolbar, csv, useTable } from "../src";
import type { ExportFormat, ExportSheet, Table } from "../src";

interface Part {
  id: string;
  name: string;
  weight: number;
  due: Date;
  ok: boolean;
}

const PARTS: Part[] = [
  { id: "a", name: "Bolt", weight: 3.5, due: new Date(2026, 2, 17), ok: true },
  { id: "b", name: "Nut", weight: 2, due: new Date(2026, 2, 18), ok: false },
];

let current: Table<Part> | null = null;

const capture = (t: Table<Part>) => {
  current = t;
};

function Parts({ children }: { children: React.ReactNode }) {
  const t = useTable(PARTS, { rowKey: (p) => p.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Parts">
      <Toolbar>{children}</Toolbar>
      <Column value="name" label="Name" rowHeader width={120} />
      <Column value="weight" label="Weight" />
      <Column value="due" label="Due" />
      <Column value="ok" label="Fine" />
    </Frame>
  );
}

const count: ExportFormat<number> = {
  extension: "cnt",
  mime: "application/x-count",
  write: (sheet) => sheet.rows.length,
};

afterEach(() => vi.restoreAllMocks());

describe("a format handed to Export", () => {
  it("receives the sheet with typed cells and widths, and its output reaches onExport", () => {
    let seen: ExportSheet | undefined;
    const spy: ExportFormat<string> = {
      extension: "x",
      mime: "text/x",
      write: (sheet) => {
        seen = sheet;
        return "out";
      },
    };
    const onExport = vi.fn();
    render(
      <Parts>
        <Export format={spy} onExport={onExport} />
      </Parts>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    expect(onExport).toHaveBeenCalledWith("out");
    expect(seen!.columns.map((c) => c.label)).toEqual(["Name", "Weight", "Due", "Fine"]);
    expect(seen!.columns[0]!.width).toBe(120);
    expect(seen!.rows[0]).toEqual(["Bolt", 3.5, new Date(2026, 2, 17), true]);
    expect(seen!.rows[0]![2]).toBeInstanceOf(Date);
  });

  it("downloads with the format's MIME type and extension", () => {
    const blobs: Blob[] = [];
    URL.createObjectURL = vi.fn((b: Blob | MediaSource) => (blobs.push(b as Blob), "blob:x"));
    URL.revokeObjectURL = vi.fn();
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    render(
      <Parts>
        <Export format={count} label="Count" />
        <Export label="Text" />
      </Parts>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Count" }));
    fireEvent.click(screen.getByRole("button", { name: "Text" }));
    expect(names).toEqual(["table.cnt", "table.csv"]);
    expect(blobs[0]!.type).toBe("application/x-count");
    expect(blobs[1]!.type).toBe("text/csv;charset=utf-8");
  });

  it("keeps the default label, and label replaces it", () => {
    render(
      <Parts>
        <Export />
        <Export label="Excel" />
      </Parts>,
    );
    expect(screen.getByRole("button", { name: "Export" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Excel" })).toBeTruthy();
  });
});

describe("exportAs", () => {
  it("agrees with asCsv, writes a column of days as its day, and types a custom format", () => {
    render(<Parts>{null}</Parts>);
    const t = current!;
    expect(t.exportAs(csv)).toBe(t.asCsv());
    expect(t.asCsv()).toContain("2026-03-17");
    expect(t.exportAs(count)).toBe(2);
    expectTypeOf(t.exportAs(count)).toEqualTypeOf<number>();
    expectTypeOf(t.exportAs(csv)).toEqualTypeOf<string>();
  });
});
