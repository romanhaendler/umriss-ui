import { useState } from "react";
import { createRoot } from "react-dom/client";
import { UmrissProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { ColumnGroup, ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "@umriss-ui/table";
import { xlsx } from "@umriss-ui/table/xlsx";
import { ROWS as BASE, TREE, HOSTILE } from "../data.mjs";
const ROWS = cfg0().extra ? [...BASE, ...HOSTILE] : BASE;
function cfg0() { return JSON.parse(new URLSearchParams(location.search).get("cfg") ?? "{}"); }

type Row = (typeof ROWS)[number];
type Node = { id: string; name: string; qty: number; kids?: Node[] };
const q = new URLSearchParams(location.search);
const cfg = { lang: "en", virtual: false, tree: false, server: false, groups: false, groupBy: false, detail: false, selectable: true, pageSize: 10, fit: false, ...JSON.parse(q.get("cfg") ?? "{}") };
const w = window as any;
w.exp = [] as unknown[];
const LANG = cfg.lang === "de" ? { wording: GERMAN_WORDING, formats: GERMAN_FORMATS } : undefined;

function Flat() {
  const serve = (r: any) => {
    const m = (ROWS as Row[]).filter((x) => !r.search || x.name.toLowerCase().includes(r.search.toLowerCase()));
    const sorted = r.sort?.length ? [...m].sort((a: any, b: any) => (a[r.sort[0].column] > b[r.sort[0].column] ? 1 : -1) * (r.sort[0].direction === "asc" ? 1 : -1)) : m;
    return { rows: sorted.slice((r.page - 1) * r.pageSize, r.page * r.pageSize), count: m.length, all: sorted };
  };
  const [ans, setAns] = useState(() => serve({ search: "", sort: [], page: 1, pageSize: cfg.pageSize }));
  const t = useTable<Row>(cfg.server ? ans.rows : (ROWS as Row[]), {
    rowKey: (r) => r.id,
    pageSize: cfg.pageSize,
    virtual: cfg.virtual || undefined,
    ...(cfg.server ? ({ server: true, rowCount: ans.count, onRequest: (r: any) => { w.req = r; setAns(serve(r)); }, exportRows: async (r: any) => { w.exportReq = r; return serve(r).all; } } as any) : {}),
  } as any);
  w.t = t;
  const { Table, Column, VerdictColumn, RowDetail, GroupBy } = t as any;
  const cols = (
    <>
      <Column value="id" label="ID" rowHeader width={90} />
      <Column value="name" label="Name" filter="text" aggregate="count">{(v: string) => <b>{v.toUpperCase()}</b>}</Column>
      <Column value="qty" label="Qty" filter="range" aggregate="sum" />
      <Column value="price" label="Price" format={{ decimals: 2 }} aggregate="avg" />
      <Column value="when" label="When" format="dateTime" filter="range" />
      <Column value="day" label="Day" format="date" aggregate="max" />
      <Column value="ok" label="OK" />
      <Column value="note" label="Note" filter="list" />
      <Column id="tags" value="tags" label="Tags" exportValue={(v: string[]) => v.join("|")} searchable>{(v: string[]) => v.join(" ")}</Column>
      <Column value="obj" label="Obj">{(v: { a: number }) => `o${v.a}`}</Column>
      <Column id="own" value="when" label="OwnDate" exportValue={(d: Date) => d.getTime()} />
      <Column id="plain" value={(r: Row) => r.score} label="Computed" />
      <VerdictColumn id="verdict" label="Verdict" value={(r: Row) => r.score} limits={{ target: 50, limits: [{ value: 80, side: "upper", severity: "alarm" }] }} />
      <Column value="grp" label="Group" />
      <Column value="sub" label="Sub" />
    </>
  );
  const grouped = (
    <>
      <Column value="id" label="ID" rowHeader width={90} />
      <ColumnGroup label="Who">
        <Column value="name" label="Name" filter="text" />
        <Column value="grp" label="Group" />
      </ColumnGroup>
      <ColumnGroup label="Numbers">
        <Column value="qty" label="Qty" aggregate="sum" />
        <Column value="price" label="Price" format={{ decimals: 2 }} aggregate="sum" />
      </ColumnGroup>
      <Column value="sub" label="Sub" />
    </>
  );
  return (
    <Table aria-label="h8" selectable={cfg.selectable} style={{ maxHeight: 500 }}>
      <Toolbar>
        <Search />
        <ColumnMenu />
        <Export onExport={(c: unknown) => w.exp.push(c)} />
        <Export format={xlsx} label="XLSX" onExport={(c: Uint8Array) => w.exp.push(Array.from(c))} />
        <Export format={xlsx} label="XLSXfile" filename="h8.xlsx" />
        <Export label="CSVfile" />
      </Toolbar>
      {cfg.groups ? grouped : cols}
      {cfg.groupBy && <GroupBy id="decade" value={(r: Row) => Math.floor(r.price / 300) * 300} label="Price band" />}
      {cfg.detail && <RowDetail>{(r: Row) => <div>detail {r.id}</div>}</RowDetail>}
      {!cfg.virtual && <Pagination />}
    </Table>
  );
}
function Tree() {
  const t = useTable<Node>(TREE as Node[], { rowKey: (r) => r.id, childRows: (r: Node) => r.kids } as any);
  w.t = t;
  const { Table, Column } = t as any;
  return (
    <Table aria-label="tree" selectable>
      <Toolbar><Search /><Export onExport={(c: unknown) => w.exp.push(c)} /></Toolbar>
      <Column value="name" label="Name" rowHeader />
      <Column value="qty" label="Qty" aggregate="sum" />
    </Table>
  );
}
createRoot(document.getElementById("root")!).render(
  <UmrissProvider language={LANG as any}>{cfg.tree ? <Tree /> : <Flat />}</UmrissProvider>,
);
