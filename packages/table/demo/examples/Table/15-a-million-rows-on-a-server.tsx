import { useRef, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "../../../src";
import type { ManualView } from "../../../src";

export const title = "Manual mode: a million rows on a server";

/* The browser holds one page. `manual` hands the table the page and the
   server's count; `onViewChange` receives the view - search, conditions, sort,
   page and page size, always complete - once when the table first stands and
   once per change. The table sorts, filters and pages nothing of its own.

   While an answer is out, `loading` lays placeholders over the previous page,
   as many as it had rows, so that nothing below jumps. A list filter offers
   what `filterOptions` names: the table cannot count values it does not hold.
   "Select all" selects the page and says so; a row selected on another page
   stays selected. The export writes the page, and its button says so. There
   is no grouping and no footer - both would be the page's, not the server's.

   The server below is a fake: a million rows computed from their index, and
   every answer delayed by 400 ms. A late answer to an older view is dropped -
   that is the application's part, and it stands here in full. The first page
   comes with the document, as it would from a server that renders it. */

interface Reading {
  id: string;
  tag: string;
  station: string;
  value: number;
}

const COUNT = 1_000_000;
const LATENCY = 400;
const STATIONS = ["North", "East", "South", "West", "Centre", "Harbour", "Ring", "Valley"] as const;
const BY_TAG = { column: "tag", direction: "asc" } as const;

/* A row from its index alone - the same every run, and no array of a million. */
const mix = (i: number, salt: number) => {
  let h = Math.imul(i ^ salt, 2654435761) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
  return (h ^ (h >>> 13)) >>> 0;
};
const reading = (i: number): Reading => ({
  id: `r${i}`,
  tag: `MW-${String(i + 1).padStart(7, "0")}`,
  station: STATIONS[mix(i, 7) % STATIONS.length]!,
  value: (mix(i, 11) % 9000) / 10,
});

/* The server: filter, sort, then the page. The order of the last filter and
   sort is kept, the way a database keeps an index warm. */
let warm: { key: string; order: Int32Array | null } = { key: "", order: null };

function serve(view: ManualView): { rows: Reading[]; rowCount: number } {
  const search = view.search.trim().toLowerCase();
  const stations = view.conditions.station as readonly string[] | undefined;
  const sort = view.sort[0] ?? BY_TAG;
  const key = JSON.stringify([search, stations, sort]);
  if (warm.key !== key) {
    let order: Int32Array | null = null;
    if (search || stations || sort.column !== "tag") {
      const hits: number[] = [];
      for (let i = 0; i < COUNT; i++) {
        const r = reading(i);
        if (stations && !stations.includes(r.station)) continue;
        if (search && !r.tag.toLowerCase().includes(search) && !r.station.toLowerCase().includes(search)) continue;
        hits.push(i);
      }
      order = Int32Array.from(hits);
      if (sort.column === "value") {
        const values = new Float64Array(COUNT);
        for (const i of order) values[i] = reading(i).value;
        order.sort((a, b) => values[a]! - values[b]! || a - b);
      }
    }
    warm = { key, order };
  }
  const { order } = warm;
  const rowCount = order ? order.length : COUNT;
  const descending = sort.direction === "desc";
  const start = (view.page - 1) * view.pageSize;
  const rows: Reading[] = [];
  for (let n = start; n < Math.min(start + view.pageSize, rowCount); n++) {
    const at = descending ? rowCount - 1 - n : n;
    rows.push(reading(order ? order[at]! : at));
  }
  return { rows, rowCount };
}

const FIRST: ManualView = { search: "", conditions: {}, sort: [BY_TAG], page: 1, pageSize: 10 };
const same = (a: ManualView, b: ManualView) =>
  JSON.stringify([a.search, a.conditions, a.sort, a.page, a.pageSize]) ===
  JSON.stringify([b.search, b.conditions, b.sort, b.page, b.pageSize]);

export default function AMillionRowsOnAServer() {
  const [answer, setAnswer] = useState(() => ({ view: FIRST, ...serve(FIRST) }));
  const [loading, setLoading] = useState(false);
  const latest = useRef(FIRST);

  const t = useTable(answer.rows, {
    rowKey: (r) => r.id,
    defaultSort: BY_TAG,
    manual: true,
    rowCount: answer.rowCount,
    onViewChange: (view) => {
      latest.current = view;
      /* Back to the view on screen before its successor was answered: the
         pending answer is dropped, so nothing is loading any more. */
      if (same(view, answer.view)) return setLoading(false);
      setLoading(true);
      setTimeout(() => {
        if (latest.current !== view) return;
        setAnswer({ view, ...serve(view) });
        setLoading(false);
      }, LATENCY);
    },
    filterOptions: (column) => (column === "station" ? STATIONS : []),
  });
  const { Table, Column } = t;
  const { search, sort, page, pageSize } = answer.view;

  return (
    <Stack gap={2}>
      <Table selectable loading={loading} ariaLabel="Readings on the server">
        <Toolbar>
          <Search placeholder="Tag or station" />
          <ColumnMenu />
          <Export />
        </Toolbar>
        <Column value="tag" label="Tag" rowHeader />
        <Column value="station" label="Station" filter="list" sortable={false} />
        <Column value="value" label="Reading" format={{ decimals: 1 }} />
        <Pagination />
      </Table>
      <Text size="xs" tone="muted" mono>
        Answered: page {page} · {pageSize} rows · {sort.map((s) => `${s.column} ${s.direction}`).join(", ")}
        {search && ` · “${search}”`} · {t.selection.count} selected
      </Text>
    </Stack>
  );
}
