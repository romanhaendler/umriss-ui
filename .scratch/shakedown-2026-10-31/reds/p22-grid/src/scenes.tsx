import { useRef, useState, type ReactNode } from "react";
import { ColumnGroup, ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "@umriss-ui/table";
import { xlsx } from "@umriss-ui/table/xlsx";
import type { TableRequest } from "@umriss-ui/table";

const W = window as any;
interface Row { id: string; name: string; dept: string; amount: number | null; when: Date | null; note: string | null; qty: number }
const DEPTS = ["Ops", "Sales", "R&D", "HR"];
export function makeRows(n: number, off = 0): Row[] {
  return Array.from({ length: n }, (_, i) => {
    const k = i + off;
    return { id: "r" + k, name: "Item " + k, dept: DEPTS[k % 4]!, amount: k % 7 === 0 ? null : (k * 37) % 1000, when: k % 5 === 0 ? null : new Date(2026, 2, 28 + (k % 5), 1, 30), note: k % 3 === 0 ? null : "n" + k, qty: k % 50 };
  });
}
const frame = (h: number, c: ReactNode) => <div id="frame" style={{ height: h, width: 1000, margin: 16, display: "flex", flexDirection: "column" }}>{c}</div>;

function Main() {
  const [rows, setRows] = useState(() => makeRows(200));
  const sel = useRef<string[][]>([]); W.__sel = sel.current; W.__setRows = setRows; W.__edits = W.__edits ?? [];
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 10, onSelectionChange: (k) => sel.current.push(k), initialView: JSON.parse(sessionStorage.getItem("v") ?? "{}"), onViewChange: (v) => { W.__view = v; sessionStorage.setItem("v", JSON.stringify(v)); } });
  W.__t = t;
  const { Table, Column } = t;
  return frame(560, <Table aria-label="Grid" grid selectable stickyHeader onCellEdit={(e) => { W.__edits.push(e); setRows((rs) => rs.map((r) => (r.id === e.rowKey ? { ...r, [e.columnId]: e.value } : r))); }}>
    <Toolbar><Search /><ColumnMenu /><Export /><Export format={xlsx} onExport={(c) => (W.__xlsx = c)} label="XLSX" /></Toolbar>
    <Column value="name" label="Name" rowHeader flex={2} minWidth={120} edit="text" filter="text" />
    <ColumnGroup label="Money">
      <Column value="amount" label="Amount" numeric format="count" filter="range" edit="number" aggregate="sum" flex={1} />
      <Column value="qty" label="Qty" numeric edit="number" flex={1} />
    </ColumnGroup>
    <ColumnGroup label="Meta">
      <Column value="dept" label="Dept" filter="list" groupable edit="select" editOptions={DEPTS} width={120} />
      <Column value="when" label="When" format="dateTime" filter="range" edit="date" group="month" width={170} />
    </ColumnGroup>
    <Column value="note" label="Note" filter="text" edit="text" width={100} />
    <Pagination />
  </Table>);
}

function Virt() {
  const rows = useRef(makeRows(100000)).current;
  const t = useTable(rows, { rowKey: (r) => r.id, virtual: true, defaultSort: { column: "amount", direction: "desc" } });
  W.__t = t;
  const { Table, Column } = t;
  return frame(500, <Table aria-label="Big" grid stickyHeader selectable>
    <Toolbar><Search /><ColumnMenu /></Toolbar>
    <Column value="name" label="Name" rowHeader flex={1} filter="text" />
    <Column value="amount" label="Amount" numeric filter="range" aggregate="sum" width={140} />
    <Column value="dept" label="Dept" filter="list" groupable width={120} />
  </Table>);
}

const ALL = makeRows(237);
function serve(v: TableRequest) {
  let h = ALL.filter((r) => !v.search || r.name.toLowerCase().includes(v.search.toLowerCase()));
  const s = v.sort[0];
  if (s) h = [...h].sort((a: any, b: any) => (a[s.column] > b[s.column] ? 1 : -1) * (s.direction === "asc" ? 1 : -1));
  const st = (v.page - 1) * v.pageSize;
  return { rows: h.slice(st, st + v.pageSize), rowCount: h.length };
}
function Server() {
  const [ans, setAns] = useState(() => serve({ search: "", conditions: {}, sort: [], page: 1, pageSize: 10 }));
  W.__reqs = W.__reqs ?? [];
  const t = useTable(ans.rows, { rowKey: (r) => r.id, server: true, rowCount: ans.rowCount, pageSize: 10, onRequest: (v) => { W.__reqs.push({ ...v, at: Date.now() }); setTimeout(() => setAns(serve(v)), W.__delay ?? 150); } });
  W.__t = t;
  const { Table, Column } = t;
  return frame(Number(new URLSearchParams(location.search).get("h") ?? 420), <Table aria-label="Server" selectable>
    <Toolbar><Search /></Toolbar>
    <Column value="name" label="Name" rowHeader />
    <Column value="amount" label="Amount" numeric />
    <Column value="dept" label="Dept" />
    <Pagination />
  </Table>);
}

interface Node { id: string; name: string; v: number; kids?: Node[] }
const TREE: Node[] = [{ id: "a", name: "A", v: 1, kids: [{ id: "a1", name: "A1", v: 2 }, { id: "a2", name: "A2", v: 3, kids: [{ id: "a21", name: "A21", v: 4 }] }] }, { id: "b", name: "B", v: 5 }];
function Tree() {
  const t = useTable<Node>(TREE, { rowKey: (r: Node) => r.id, childRows: (r: Node) => r.kids });
  W.__t = t;
  const { Table, Column } = t;
  return frame(300, <Table aria-label="Tree" selectable><Column value="name" label="Name" rowHeader /><Column value="v" label="V" numeric /></Table>);
}
export const SCENES: Record<string, () => ReactNode> = { main: Main, virt: Virt, server: Server, tree: Tree };

function Auto() {
  const t = useTable(makeRows(30), { rowKey: (r) => r.id });
  W.__t = t;
  const { Table, Column } = t;
  return frame(500, <Table aria-label="Auto" grid><Toolbar><ColumnMenu /></Toolbar>
    <Column value="name" label="Name" resizable />
    <Column value="dept" label="Dept" width={300} resizable />
    <Column value="amount" label="Amount" numeric format="count" width={80} resizable />
    <Column value="note" label="A very long column label indeed" resizable />
  </Table>);
}
SCENES.auto = Auto;

function RowsScene() {
  const [rows, setRows] = useState(() => makeRows(40));
  W.__saves = W.__saves ?? [];
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 8 });
  W.__t = t;
  const { Table, Column, RowDetail, RowActions, Action } = t;
  return frame(520, <Table aria-label="Rows" grid selectable editMode="row" newRow={() => ({ name: "", dept: "Ops", qty: 0 })}
    onRowSave={(s) => { W.__saves.push(s); setRows((rs) => rs.map((r) => (r.id === s.rowKey ? { ...r, ...s.changes } : r))); }}
    onRowAdd={(a) => { W.__saves.push({ add: a }); setRows((rs) => [{ ...makeRows(1)[0]!, id: "n" + rs.length, ...(a.values as any) }, ...rs]); }}
    onRowDelete={(d) => { W.__saves.push({ del: d.rowKey }); setRows((rs) => rs.filter((r) => r.id !== d.rowKey)); }}>
    <Toolbar><Search /><ColumnMenu /></Toolbar>
    <Column value="name" label="Name" rowHeader edit="text" validate={(v: any) => (String(v).trim() ? null : "Name required")} />
    <ColumnGroup label="G">
      <Column value="qty" label="Qty" numeric edit="number" validate={(v: any) => (Number(v) < 0 ? "No negatives" : null)} />
      <Column value="dept" label="Dept" edit="select" editOptions={DEPTS} />
    </ColumnGroup>
    <RowDetail>{(r: Row) => <div id="detail">Detail of {r.name}</div>}</RowDetail>
    <RowActions><Action onSelect={() => {}}>Open</Action></RowActions>
    <Pagination />
  </Table>);
}
SCENES.rows = RowsScene;

function Wide() {
  const rows = useRef(Array.from({ length: 500 }, (_, i) => Object.fromEntries([["id", "r" + i], ...Array.from({ length: 150 }, (_, c) => ["c" + c, i * c])]))).current as any[];
  const t = useTable(rows, { rowKey: (r: any) => r.id, virtual: true });
  W.__t = t;
  const { Table, Column } = t;
  return frame(500, <Table aria-label="Wide" grid stickyHeader maxHeight="450px">
    <Column value="id" label="Id" rowHeader pin="start" />
    {Array.from({ length: 150 }, (_, c) => <Column key={c} value={"c" + c as any} label={"Col " + c} numeric width={90} />)}
  </Table>);
}
SCENES.wide = Wide;
function SrvVirt() {
  const [ans] = useState(() => ({ rows: makeRows(100), rowCount: 5000 }));
  const t = useTable(ans.rows, { rowKey: (r) => r.id, server: true, virtual: true, rowCount: ans.rowCount, onRequest: (v) => { (W.__reqs = W.__reqs ?? []).push(v); } } as any);
  W.__t = t;
  const { Table, Column } = t;
  return frame(500, <Table aria-label="SV" stickyHeader maxHeight="450px"><Column value="name" label="Name" rowHeader /><Column value="qty" label="Qty" numeric /></Table>);
}
SCENES.srvvirt = SrvVirt;

function Narrow() {
  const t = useTable(makeRows(12), { rowKey: (r) => r.id });
  W.__t = t;
  const { Table, Column } = t;
  return frame(400, <Table aria-label="Narrow" grid><Toolbar><ColumnMenu /></Toolbar>
    <Column value="name" label="Name" width={110} resizable />
    <ColumnGroup label="A rather long group label"><Column value="qty" label="Qty" numeric width={60} resizable /></ColumnGroup>
    <ColumnGroup label="Two"><Column value="dept" label="Dept" width={80} resizable /><Column value="note" label="Note" width={80} resizable /></ColumnGroup>
  </Table>);
}
SCENES.narrow = Narrow;

interface Flag { id: string; name: string; active: boolean; text: string; tags: string[] }
function Bools() {
  const [rows, setRows] = useState<Flag[]>(() => Array.from({ length: 30 }, (_, i) => ({ id: "f" + i, name: "Flag " + i, active: i % 3 === 0, text: "A long long long text that wants to wrap onto several lines " + i, tags: ["a", "b"] })));
  const t = useTable(rows, { rowKey: (r) => r.id });
  W.__t = t;
  const { Table, Column } = t;
  return frame(500, <Table aria-label="Bools" grid onCellEdit={(e) => { W.__edits = (W.__edits ?? []).concat(e); setRows((rs) => rs.map((r) => (r.id === e.rowKey ? { ...r, [e.columnId]: e.value } : r))); }}>
    <Toolbar><Search /><ColumnMenu /></Toolbar>
    <Column value="name" label="Name" rowHeader />
    <Column value="active" label="Active" filter="list" />
    <Column value="active" id="a2" label="Active (own editor)" edit={({ value, commit }: any) => <input type="checkbox" checked={!!value} onChange={(e) => commit(e.target.checked)} />} />
    <Column value="text" label="Text" width={160} />
    <Column value="tags" label="Tags" />
  </Table>);
}
SCENES.bools = Bools;
