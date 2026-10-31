import { useState } from "react";
import { ColumnMenu, Pagination, Toolbar, groupPath, useTable } from "../../../src";
import type { ServerGroup, TableRequest } from "../../../src";

interface Order {
  id: string;
  status: "open" | "packed" | "shipped" | "returned";
  region: "east" | "north" | "river";
  amount: number;
}

const STATUS = ["open", "packed", "shipped", "returned"] as const;
const REGION = ["north", "river", "east"] as const;

const ORDERS: readonly Order[] = Array.from({ length: 400 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(4, "0")}`,
  status: STATUS[(i * 7) % 11 % STATUS.length]!,
  region: REGION[(i * 5) % 7 % REGION.length]!,
  amount: 40 + ((i * 7919) % 900),
}));

export const title = "Groups from the server";
export const lead =
  "The request carries `grouping` and `folded`; the answer names its group lines as `groups` - each with its path, its count and totals over every match, and the index in `rows` it stands before. A page counts lines, headers and rows alike, so `rowCount` counts lines too. The table computes nothing over the rows.";

interface Item {
  /** A header line, or a folded innermost group. */
  group?: ServerGroup;
  row?: Order;
  /** The headers around it. */
  ancestors: readonly ServerGroup[];
  /** The innermost of several levels: its value stands on its first row. */
  span?: ServerGroup;
  first?: boolean;
}

const sum = (rows: readonly Order[]) => rows.reduce((total, o) => total + o.amount, 0);

/** The fake server: filters and sorts, groups what is asked, folds what is
    folded and cuts the pages by lines, repeating the headers a page begins
    inside of, which take their room from the page. */
function serve(request: TableRequest) {
  const hits = [...ORDERS];
  const sort = request.sort[0];
  if (sort) {
    const key = sort.column as keyof Order;
    const sign = sort.direction === "asc" ? 1 : -1;
    hits.sort((a, b) => (a[key] < b[key] ? -sign : a[key] > b[key] ? sign : 0));
  }
  const by = (request.grouping ?? []) as (keyof Order)[];
  const folded = new Set(request.folded);
  const items: Item[] = [];
  const walk = (rows: readonly Order[], level: number, parent: readonly string[], ancestors: readonly ServerGroup[]) => {
    const values = [...new Set(rows.map((o) => String(o[by[level]!])))].sort();
    for (const value of values) {
      const part = rows.filter((o) => String(o[by[level]!]) === value);
      const group: ServerGroup = { path: [...parent, value], count: part.length, totals: { id: part.length, amount: sum(part) }, at: 0 };
      const shut = folded.has(groupPath(group.path));
      const innermost = level === by.length - 1;
      if (!innermost || by.length === 1) {
        items.push({ group, ancestors });
        if (shut) continue;
        if (innermost) part.forEach((row) => items.push({ row, ancestors: [...ancestors, group] }));
        else walk(part, level + 1, group.path as string[], [...ancestors, group]);
      } else if (shut) {
        items.push({ group, ancestors });
      } else {
        part.forEach((row, i) => items.push({ row, ancestors, span: group, first: i === 0 }));
      }
    }
  };
  if (by.length === 0) hits.forEach((row) => items.push({ row, ancestors: [] }));
  else walk(hits, 0, [], []);

  /* The pages are cut one after the other; one that begins inside a group has
     its headers above it, and they count against its size. */
  const starts = [0];
  for (let at = 0; ; ) {
    at += Math.max(1, request.pageSize - (items[at]?.ancestors.length ?? 0));
    if (at >= items.length) break;
    starts.push(at);
  }
  const page = Math.min(Math.max(1, request.page), starts.length);
  const slice = items.slice(starts[page - 1], starts[page] ?? items.length);
  const rows: Order[] = [];
  const groups: ServerGroup[] = [];
  const head = slice[0];
  if (head) {
    for (const group of head.ancestors) groups.push({ ...group, at: 0, continued: true });
    if (head.span && !head.first) groups.push({ ...head.span, at: 0, continued: true });
  }
  for (const item of slice) {
    if (item.group) groups.push({ ...item.group, at: rows.length });
    else {
      if (item.span && item.first) groups.push({ ...item.span, at: rows.length });
      rows.push(item.row!);
    }
  }
  return { rows, groups, answers: request, rowCount: items.length, totals: { id: hits.length, amount: sum(hits) } };
}

const FIRST: TableRequest = { search: "", conditions: {}, sort: [], page: 1, pageSize: 12, grouping: ["status"], folded: [] };

export default function GroupsFromTheServer() {
  const [answer, setAnswer] = useState(() => serve(FIRST));
  const { Table, Column } = useTable(answer.rows, {
    rowKey: (o) => o.id,
    server: true,
    rowCount: answer.rowCount,
    pageSize: FIRST.pageSize,
    defaultGrouping: ["status"],
    answers: answer.answers,
    groups: answer.groups,
    totals: answer.totals,
    onRequest: (request) => setAnswer(serve(request)),
  });

  return (
    <Table aria-label="Orders grouped on the server">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="id" label="Order" rowHeader aggregate="count" />
      <Column value="status" label="Status" />
      <Column value="region" label="Region" />
      <Column value="amount" label="Amount" aggregate="sum" />
      <Pagination />
    </Table>
  );
}
