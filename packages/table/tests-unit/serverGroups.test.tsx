/* Groups from the server: the request carries the grouping and the folds, the
   answer names its group lines, and the table draws them - nothing is computed
   over the rows. A page counts lines. */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, groupPath, useTable } from "../src";
import type { ServerGroup, TableRequest } from "../src";
import { answeredLines } from "../src/model/grouping";

interface Row {
  id: string;
  status: string;
  line: string;
  amount: number;
}

const rows: Row[] = [
  { id: "a", status: "open", line: "L1", amount: 1 },
  { id: "b", status: "open", line: "L1", amount: 2 },
  { id: "c", status: "open", line: "L2", amount: 4 },
  { id: "d", status: "done", line: "L1", amount: 8 },
];

let asked: TableRequest[] = [];

function Server({
  groups,
  data = rows,
  grouping = ["status"],
  rowCount = 6,
  answers,
}: {
  groups?: readonly ServerGroup[];
  data?: Row[];
  grouping?: string[];
  rowCount?: number;
  answers?: TableRequest;
}) {
  const t = useTable(data, {
    rowKey: (r) => r.id,
    server: true,
    rowCount,
    pageSize: 10,
    defaultGrouping: grouping,
    onRequest: (request) => asked.push(request),
    ...(groups ? { groups } : {}),
    ...(answers ? { answers } : {}),
  });
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Orders">
      <Pagination />
      <Column value="id" label="Id" rowHeader />
      <Column value="status" label="Status" />
      <Column value="line" label="Line" />
      <Column value="amount" label="Amount" aggregate="sum" />
    </Frame>
  );
}

const kinds = () => Array.from(document.querySelectorAll("tbody tr")).map((tr) => (tr as HTMLElement).dataset.line ?? "row");

afterEach(() => {
  asked = [];
  vi.restoreAllMocks();
});

describe("the request", () => {
  it("carries the grouping and the folded groups, empty by default", () => {
    render(<Server groups={[]} data={[]} grouping={[]} />);
    expect(asked[0]).toMatchObject({ grouping: [], folded: [] });
  });

  it("carries a default grouping and sends one request when the fold changes", () => {
    const groups: ServerGroup[] = [
      { path: ["open"], count: 3, at: 0, totals: { amount: 7 } },
      { path: ["done"], count: 3, at: 3, totals: { amount: 8 } },
    ];
    render(<Server groups={groups} data={rows.slice(0, 3)} />);
    expect(asked).toHaveLength(1);
    expect(asked[0]?.grouping).toEqual(["status"]);
    fireEvent.click(screen.getAllByRole("button", { name: /Collapse|Fold|open/i })[0]!);
    expect(asked).toHaveLength(2);
    expect(asked[1]?.folded).toEqual([groupPath(["open"])]);
  });
});

describe("the drawing", () => {
  const groups: ServerGroup[] = [
    { path: ["open"], count: 30, at: 0, totals: { amount: 700 } },
    { path: ["done"], count: 12, at: 3, totals: { amount: 99 } },
  ];

  it("draws a header before the row at `at`, with the server's count and totals", () => {
    render(<Server groups={groups} />);
    expect(kinds()).toEqual(["header", "row", "row", "row", "header", "row"]);
    const header = document.querySelector("tr[data-line=header]") as HTMLElement;
    expect(header.textContent).toContain("open");
    expect(header.textContent).toContain("30");
    expect(header.textContent).toContain("700");
  });

  it("marks a group that began on an earlier page as continued", () => {
    render(<Server groups={[{ ...groups[0]!, continued: true }, groups[1]!]} />);
    expect(document.querySelector("tr[data-line=header][data-continued]")).not.toBeNull();
  });

  it("shows the rows ungrouped, and says why once, without groups", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Server />);
    expect(kinds()).toEqual(["row", "row", "row", "row"]);
    expect(warn.mock.calls.flat().join(" ")).toContain("`groups` does not answer the grouping");
  });

  it("shows the rows ungrouped when the groups do not fit", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Server groups={[{ path: ["open"], count: 3, at: 9 }]} />);
    expect(kinds()).toEqual(["row", "row", "row", "row"]);
  });

  it("draws two levels: a header, then spans, a folded span as one line", () => {
    const two: ServerGroup[] = [
      { path: ["open"], count: 3, at: 0 },
      { path: ["open", "L1"], count: 2, at: 0 },
      { path: ["open", "L2"], count: 1, at: 2 },
      { path: ["done"], count: 1, at: 3 },
      { path: ["done", "L1"], count: 1, at: 3 },
    ];
    render(<Server groups={two} grouping={["status", "line"]} />);
    expect(kinds()).toEqual(["header", "row", "row", "row", "header", "row"]);
    const folded: ServerGroup[] = [...two.slice(0, 4), { path: ["done", "L1"], count: 1, at: 3 }];
    render(<Server groups={folded} data={rows.slice(0, 3)} grouping={["status", "line"]} />);
    expect(document.querySelector("tr[data-line=folded]")).not.toBeNull();
  });
});

describe("paging", () => {
  it("counts lines: the server's rowCount is headers and rows, and cuts the pages", () => {
    function Probe() {
      const t = useTable(rows, { rowKey: (r) => r.id, server: true, rowCount: 25, pageSize: 10, defaultGrouping: ["status"], onRequest: () => {} });
      return (
        <t.Table aria-label="Orders">
          <Pagination />
          <t.Column value="id" label="Id" rowHeader />
          <output>{t.pageCount}</output>
        </t.Table>
      );
    }
    render(<Probe />);
    expect(document.querySelector("output")?.textContent).toBe("3");
  });
});

describe("answeredLines", () => {
  it("reads one level", () => {
    const read = answeredLines(["x", "y", "z"], [{ path: ["a"], count: 9, at: 0 }, { path: ["b"], count: 1, at: 2 }], 1);
    expect(typeof read).toBe("object");
    if (typeof read === "string") return;
    expect(read.lines.map((l) => l.kind)).toEqual(["header", "row", "row", "header", "row"]);
    expect(read.groups.map((g) => g.size)).toEqual([9, 1]);
  });

  it("names the first thing wrong", () => {
    expect(answeredLines(["x"], [{ path: ["a", "b"], count: 1, at: 0 }], 2)).toMatch(/does not stand under/);
    expect(answeredLines(["x"], [{ path: ["a"], count: 1, at: 1 }, { path: ["b"], count: 1, at: 0 }], 1)).toMatch(/\.at/);
    expect(answeredLines(["x"], [], 1)).toMatch(/stands in no group/);
    expect(answeredLines(["x"], "no", 1)).toMatch(/not an array/);
  });
});
