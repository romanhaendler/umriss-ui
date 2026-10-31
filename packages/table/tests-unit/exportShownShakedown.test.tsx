import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { Table } from "../src";
import { asCsv } from "../src/model/csv";

interface Row {
  id: string;
  grp: string;
  n: number;
  when: Date;
  thing?: unknown;
}

const ROWS: Row[] = [
  { id: "a", grp: "B", n: 1, when: new Date(2026, 2, 17) },
  { id: "b", grp: "A", n: 2, when: new Date(2026, 2, 18, 9, 30) },
  { id: "c", grp: "B", n: 3, when: new Date(2026, 2, 19) },
  { id: "d", grp: "A", n: 4, when: new Date(2026, 2, 20) },
];

let current: Table<Row> | null = null;
const capture = (t: Table<Row>) => {
  current = t;
};
function Host({ rows = ROWS, format, extra }: { rows?: Row[]; format?: "date" | "dateTime"; extra?: boolean }) {
  const t = useTable(rows, { rowKey: (r) => r.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Rows" selectable>
      <Column value="id" label="Id" rowHeader />
      <Column value="grp" label="Group" />
      <Column value="n" label="N" />
      <Column value="when" label="When" format={format} />
      {extra && <Column value="thing" label="Thing">{() => null}</Column>}
    </Frame>
  );
}
const lines = (text: string) => text.replace("﻿", "").split("\r\n").slice(1);

describe("the export writes what the screen shows", () => {
  it("writes a grouped table in the groups' order, folded groups included", () => {
    render(<Host />);
    act(() => current!.setGrouping(["grp"]));
    expect(lines(current!.asCsv()).map((l) => l[0])).toEqual(["b", "d", "a", "c"]);
    act(() => current!.foldAll());
    expect(lines(current!.asCsv()).map((l) => l[0])).toEqual(["b", "d", "a", "c"]);
    act(() => current!.selection.set(["a", "b"], true));
    expect(current!.selectionAsText().split("\n").slice(1).map((l) => l[0])).toEqual(["b", "a"]);
  });

  it("a column with format date writes days even when an exported row has a time, and one without by the screen", () => {
    const { unmount } = render(<Host format="date" />);
    expect(lines(current!.asCsv()).map((l) => l.split(",")[3])).toEqual(["2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20"]);
    unmount();
    render(<Host format="dateTime" rows={ROWS.filter((r) => r.id !== "b")} />);
    expect(lines(current!.asCsv()).map((l) => l.split(",")[3])).toEqual(ROWS.filter((r) => r.id !== "b").map((r) => r.when.toISOString()));
  });

  it("a column without format keeps its day when a search leaves only midnights", () => {
    render(<Host />);
    act(() => current!.setSearch("d"));
    expect(lines(current!.asCsv()).map((l) => l.split(",")[3])).toEqual([ROWS[3]!.when.toISOString()]);
  });

  it("leaves out an object column with a warning, but keeps a mixed one that has text somewhere", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rows: Row[] = [
      { ...ROWS[0]!, thing: { a: 1 } },
      { ...ROWS[1]!, thing: "text" },
    ];
    render(<Host rows={rows} extra />);
    expect(lines(current!.asCsv())[1]!.split(",").slice(-1)).toEqual(["text"]);
    expect(lines(current!.asCsv())[0]!.split(",").slice(-1)).toEqual([""]);
    warn.mockClear();
    render(<Host rows={ROWS.map((r) => ({ ...r, thing: { a: 1 } }))} extra />);
    current!.asCsv();
    expect(warn.mock.calls.some((c) => String(c[0]).includes('"thing"'))).toBe(true);
    warn.mockRestore();
  });

  it("toggleColumn on the row header changes nothing", () => {
    render(<Host />);
    act(() => current!.toggleColumn("id"));
    expect(current!.hidden).toEqual([]);
    act(() => current!.toggleColumn("n"));
    expect(current!.hidden).toEqual(["n"]);
  });

  it("a tree's selection copy carries the level", () => {
    interface Node {
      id: string;
      kids?: Node[];
    }
    const tree: Node[] = [{ id: "p", kids: [{ id: "c" }] }];
    let t: Table<Node> | null = null;
    const captureTree = (table: Table<Node>) => {
      t = table;
    };
    function Tree() {
      const table = useTable(tree, { rowKey: (n) => n.id, childRows: (n) => n.kids });
      captureTree(table);
      const { Table: Frame, Column } = table;
      return (
        <Frame aria-label="Tree" selectable>
          <Column value="id" label="Id" />
        </Frame>
      );
    }
    render(<Tree />);
    act(() => t!.selection.set(["c"], true));
    expect(t!.selectionAsText()).toMatch(/^[^\t]+\tId\n2\tc$/);
  });
});

describe("the CSV writes numbers plainly", () => {
  const c = { separator: ",", decimal: ".", yes: "yes", no: "no" };
  it.each([
    [1e21, "1000000000000000000000"],
    [1.5e-7, "0.00000015"],
    [-2.5e25, "-25000000000000000000000000"],
    [123456789.125, "123456789.125"],
    [NaN, ""],
    [Infinity, ""],
    [-Infinity, ""],
  ])("%s", (n, text) => {
    expect(asCsv([n], [{ id: "x", label: "x", value: (v: number) => v }], c).split("\r\n")[1]).toBe(text);
  });
});
