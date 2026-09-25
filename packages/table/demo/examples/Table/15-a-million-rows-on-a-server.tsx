import { useRef, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "../../../src";
import type { ManualView } from "../../../src";

export const title = "Load pages from a server";
export const lead = "`manual` hands the table one page and the server's `rowCount`; `onViewChange` reports search, conditions, sort and page to fetch the next.";

/* The server below is a fake: a million requests computed from their index,
   every answer delayed by 400 ms. Dropping a late answer to an older view is
   the application's part, and it stands here in full. */

interface Request {
  id: string;
  service: string;
  duration: number;
}

const COUNT = 1_000_000;
const LATENCY = 400;
const SERVICES = ["Checkout", "Billing", "Sign-in", "Search", "Image service", "Notifications", "Webhooks", "Reporting"] as const;
const BY_ID = { column: "id", direction: "asc" } as const;

/* A row from its index alone - the same every run, and no array of a million. */
const mix = (i: number, salt: number) => {
  let h = Math.imul(i ^ salt, 2654435761) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
  return (h ^ (h >>> 13)) >>> 0;
};
const request = (i: number): Request => ({
  id: `REQ-${String(i + 1).padStart(7, "0")}`,
  service: SERVICES[mix(i, 7) % SERVICES.length]!,
  duration: 20 + (mix(i, 11) % 900),
});

/* Filter, sort, then the page. The order of the last filter and sort is kept,
   the way a database keeps an index warm. */
let warm: { key: string; order: Int32Array | null } = { key: "", order: null };

function serve(view: ManualView): { rows: Request[]; rowCount: number } {
  const search = view.search.trim().toLowerCase();
  const services = view.conditions.service as readonly string[] | undefined;
  const sort = view.sort[0] ?? BY_ID;
  const key = JSON.stringify([search, services, sort]);
  if (warm.key !== key) {
    let order: Int32Array | null = null;
    if (search || services || sort.column !== "id") {
      const hits: number[] = [];
      for (let i = 0; i < COUNT; i++) {
        const r = request(i);
        if (services && !services.includes(r.service)) continue;
        if (search && !r.id.toLowerCase().includes(search) && !r.service.toLowerCase().includes(search)) continue;
        hits.push(i);
      }
      order = Int32Array.from(hits);
      if (sort.column === "duration") {
        const values = new Float64Array(COUNT);
        for (const i of order) values[i] = request(i).duration;
        order.sort((a, b) => values[a]! - values[b]! || a - b);
      }
    }
    warm = { key, order };
  }
  const { order } = warm;
  const rowCount = order ? order.length : COUNT;
  const descending = sort.direction === "desc";
  const start = (view.page - 1) * view.pageSize;
  const rows: Request[] = [];
  for (let n = start; n < Math.min(start + view.pageSize, rowCount); n++) {
    const at = descending ? rowCount - 1 - n : n;
    rows.push(request(order ? order[at]! : at));
  }
  return { rows, rowCount };
}

const FIRST: ManualView = { search: "", conditions: {}, sort: [BY_ID], page: 1, pageSize: 10 };
const same = (a: ManualView, b: ManualView) =>
  JSON.stringify([a.search, a.conditions, a.sort, a.page, a.pageSize]) ===
  JSON.stringify([b.search, b.conditions, b.sort, b.page, b.pageSize]);

export default function AMillionRowsOnAServer() {
  /* The first page comes with the document, as from a server that renders it. */
  const [answer, setAnswer] = useState(() => ({ view: FIRST, ...serve(FIRST) }));
  const [loading, setLoading] = useState(false);
  const latest = useRef(FIRST);

  const t = useTable(answer.rows, {
    rowKey: (r) => r.id,
    defaultSort: BY_ID,
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
    filterOptions: (column) => (column === "service" ? SERVICES : []),
  });
  const { Table, Column } = t;
  const { search, sort, page, pageSize } = answer.view;

  return (
    <Stack gap={2}>
      <Table selectable loading={loading} ariaLabel="Requests on the server">
        <Toolbar>
          <Search placeholder="Request or service" />
          <ColumnMenu />
          <Export />
        </Toolbar>
        <Column value="id" label="Request" rowHeader />
        <Column value="service" label="Service" filter="list" sortable={false} />
        <Column value="duration" label="Duration (ms)" />
        <Pagination />
      </Table>
      <Text size="xs" tone="muted" mono>
        Answered: page {page} · {pageSize} rows · {sort.map((s) => `${s.column} ${s.direction}`).join(", ")}
        {search && ` · “${search}”`} · {t.selection.count} selected
      </Text>
    </Stack>
  );
}
