import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Modal } from "@umriss-ui/core";
import { ColumnGroup, ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "@umriss-ui/table";
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

/* ---------- live: virtual + group + select + edit + 500ms updates ---------- */
function Live() {
  const [rows, setRows] = useState(() => makeRows(2000));
  const log = useRef<any[]>([]);
  W.__log = log.current; W.__setRows = setRows;
  const [live, setLive] = useState(false);
  useEffect(() => {
    W.__tick = () => setRows((r) => r.map((x, i) => (i % 3 === 0 ? { ...x, amount: ((x.amount ?? 0) + 13) % 1000 } : x)));
    if (!live) return; const h = setInterval(W.__tick, 500); return () => clearInterval(h);
  }, [live]);
  const t = useTable(rows, { rowKey: (r) => r.id, virtual: true, defaultGrouping: "dept", onSelectionChange: (k) => log.current.push(k.length),
    });
  W.__t = t;
  const { Table, Column } = t;
  return <div style={{ padding: 8 }}>
    <label><input type="checkbox" id="live" checked={live} onChange={(e) => setLive(e.target.checked)} /> live</label>
    <Table aria-label="Live" grid selectable maxHeight="400px" stickyHeader editMode="cell" onCellEdit={(e) => { log.current.push("edit:" + e.rowKey + ":" + e.columnId + ":" + e.value); }}>
      <Toolbar><Search /><ColumnMenu /><Export /></Toolbar>
      <Column value="name" label="Name" rowHeader edit="text" />
      <Column value="dept" label="Dept" groupable filter="list" />
      <Column value="amount" label="Amount" edit="number" filter="range" aggregate="sum" />
      <Column value="when" label="When" format="dateTime" />
    </Table>
  </div>;
}

/* ---------- server mode controllable ---------- */
const TOTAL = 1234;
function Server() {
  const [answer, setAnswer] = useState<{ rows: Row[]; rowCount: number; req: TableRequest; err?: string } | null>(null);
  const pend = useRef<Array<{ req: TableRequest; resolve: (ok: boolean) => void }>>([]);
  const reqs = useRef<TableRequest[]>([]);
  W.__reqs = reqs.current; W.__pend = pend.current;
  const serve = (req: TableRequest) => {
    let all = makeRows(TOTAL);
    if (req.search) all = all.filter((r) => r.name.toLowerCase().includes(req.search.toLowerCase()));
    const c: any = req.conditions;
    if (c.dept) all = all.filter((r) => (c.dept as string[]).includes(r.dept));
    if (c.name?.terms?.length) { const v = c.name.terms[0].value.toLowerCase(); all = all.filter((r) => r.name.toLowerCase().includes(v)); }
    const s = req.sort[0]; if (s) all = [...all].sort((a: any, b: any) => (a[s.column] > b[s.column] ? 1 : -1) * (s.direction === "asc" ? 1 : -1));
    const st = (req.page - 1) * req.pageSize;
    return { rows: all.slice(st, st + req.pageSize), rowCount: all.length, req };
  };
  const t = useTable(answer?.rows ?? [], { rowKey: (r) => r.id, server: true, rowCount: answer?.rowCount ?? 0,
    answers: answer?.req,
    ...(answer?.err ? { error: answer.err } : {}),
    onRequest: (req) => { reqs.current.push(req);
      new Promise<boolean>((resolve) => pend.current.push({ req, resolve })).then((ok) => { if (ok) setAnswer(serve(req)); else setAnswer((a) => ({ rows: a?.rows ?? [], rowCount: a?.rowCount ?? 0, req, err: "Boom " + req.page })); }); },
    exportRows: async (req) => { W.__exportReq = req; if (W.__exportDelay) await new Promise((r) => setTimeout(r, W.__exportDelay)); if (W.__exportFail) throw new Error(W.__exportFail); return serve({ ...req, page: 1, pageSize: 100000 }).rows; },
    filterOptions: () => DEPTS,
  });
  W.__t = t;
  W.__custom = (req: TableRequest, rowCount: number, n: number) => setAnswer({ rows: makeRows(n), rowCount, req });
  W.__resolve = (i: number, ok = true) => { const p = pend.current[i]!; p.resolve(ok); };
  const { Table, Column } = t;
  return <div style={{ height: W.__h ?? 420, width: new URLSearchParams(location.search).get("w") ?? 700, maxWidth: "100%", border: "1px solid #888" }}>
    <Table aria-label="Server" selectable>
      <Toolbar><Search /><ColumnMenu /><Export /></Toolbar>
      <Column value="name" label="Name" rowHeader filter="text" />
      <Column value="dept" label="Dept" filter="list" />
      <Column value="amount" label="Amount" aggregate="sum" />
      <Pagination />
    </Table>
  </div>;
}

/* ---------- column groups, pin, resize, hide, flex ---------- */
function Groups() {
  const rows = useMemo(() => makeRows(40), []);
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 20 });
  W.__t = t;
  const { Table, Column } = t;
  const [w, setW] = useState(900);
  W.__setW = setW;
  return <div style={{ width: w, border: "1px solid #888", resize: "horizontal", overflow: "auto" }}>
    <Table aria-label="Groups" selectable stickyHeader>
      <Toolbar><ColumnMenu /></Toolbar>
      <Column value="name" label="Name" rowHeader pin="start" width={140} />
      <ColumnGroup label="Money">
        <Column value="amount" label="Amount" flex={1} minWidth={80} resizable />
        <Column value="qty" label="Qty" flex={1} minWidth={60} resizable />
      </ColumnGroup>
      <ColumnGroup label="Meta">
        <Column value="dept" label="Dept" width={100} resizable />
        <Column value="when" label="When" format="date" width={110} />
      </ColumnGroup>
      <Column value="note" label="Note" pin="end" width={90} />
      <Pagination />
    </Table>
  </div>;
}

/* ---------- pager range with rows added/removed ---------- */
function Pager() {
  const [rows, setRows] = useState(() => makeRows(95));
  W.__setRows = setRows;
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 10 });
  W.__t = t;
  const { Table, Column } = t;
  return <div style={{ padding: 8 }}><Table aria-label="Pager"><Column value="name" label="Name" rowHeader /><Column value="amount" label="Amount" /><Pagination /></Table></div>;
}

/* ---------- text filter on null/number/date ---------- */
function TextF() {
  const rows = useMemo(() => [
    ...makeRows(30), { id: "x1", name: "", dept: "Ops", amount: 5, when: null, note: "", qty: 0 },
    { id: "x2", name: "ÄÖÜ ß İstanbul", dept: "Ops", amount: 5, when: null, note: "Ünï", qty: 0 },
  ], []);
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 100 });
  W.__t = t;
  const { Table, Column } = t;
  return <div style={{ padding: 8 }}><Table aria-label="TF"><Toolbar><Search /></Toolbar>
    <Column value="name" label="Name" rowHeader filter="text" />
    <Column value="note" label="Note" filter="text" />
    <Column value="dept" label="Dept" filter="list" />
    <Column value="amount" label="Amount" filter="range" />
    <Column value="when" label="When" format="date" filter="range" />
    <Pagination /></Table></div>;
}

/* ---------- selection change during filter/page ---------- */
function SelCh() {
  const rows = useMemo(() => makeRows(60), []);
  const log = useRef<string[][]>([]);
  W.__sel = log.current;
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 10, onSelectionChange: (k) => log.current.push(k) });
  W.__t = t;
  const { Table, Column } = t;
  return <div style={{ padding: 8 }}><Table aria-label="Sel" selectable><Toolbar><Search /></Toolbar><Column value="name" label="Name" rowHeader filter="text" /><Column value="dept" label="Dept" filter="list" /><Pagination /></Table></div>;
}

/* ---------- edit while resorted/removed ---------- */
function Edit() {
  const [rows, setRows] = useState(() => makeRows(12));
  W.__setRows = setRows;
  const log = useRef<any[]>([]); W.__log = log.current;
  const t = useTable(rows, { rowKey: (r) => r.id, defaultSort: { column: "amount", direction: "asc" } });
  W.__t = t;
  const { Table, Column } = t;
  return <div style={{ padding: 8 }}><Table aria-label="Edit" grid editMode="cell" onCellEdit={(e) => log.current.push(e)}>
    <Column value="name" label="Name" rowHeader edit="text" />
    <Column value="amount" label="Amount" edit="number" />
    <Column value="note" label="Note" edit="text" />
  </Table></div>;
}

/* ---------- 100k ---------- */
function Big() {
  const rows = useMemo(() => makeRows(100000), []);
  const t = useTable(rows, { rowKey: (r) => r.id, virtual: true });
  W.__t = t;
  const { Table, Column } = t;
  return <div style={{ padding: 8 }}><Table aria-label="Big" maxHeight="400px" stickyHeader><Toolbar><Search /><Export /></Toolbar>
    <Column value="name" label="Name" rowHeader /><Column value="amount" label="Amount" filter="range" /><Column value="dept" label="Dept" filter="list" /><Column value="when" label="When" format="dateTime" /></Table></div>;
}

/* ---------- containers ---------- */
function Inner({ virtual, pager }: { virtual?: boolean; pager?: boolean }) {
  const rows = useMemo(() => makeRows(300), []);
  const t = useTable(rows, { rowKey: (r) => r.id, virtual, pageSize: 10 });
  W.__t = t;
  const { Table, Column } = t;
  return <Table aria-label="C" maxHeight={virtual && !new URLSearchParams(location.search).get("nomax") ? "300px" : undefined}><Column value="name" label="Name" rowHeader /><Column value="amount" label="Amount" />{pager && <Pagination />}</Table>;
}
function Containers() {
  const [tab, setTab] = useState(0); const [open, setOpen] = useState(false);
  const mode = new URLSearchParams(location.search).get("m") ?? "tab";
  let body: ReactNode;
  if (mode === "tab") body = <><button id="t0" onClick={() => setTab(0)}>a</button><button id="t1" onClick={() => setTab(1)}>b</button>
    <div style={{ display: tab === 0 ? "block" : "none" }} id="pane"><Inner virtual /></div><div>{tab === 1 ? "other" : ""}</div></>;
  else if (mode === "tabfit") body = <><button id="t0" onClick={() => setTab(0)}>a</button><button id="t1" onClick={() => setTab(1)}>b</button>
    <div style={{ height: 400, border: "1px solid red" }}><div id="pane" style={{ display: tab === 0 ? "block" : "none", height: "100%" }}><Inner pager /></div></div></>;
  else if (mode === "tabhidden") body = <><button id="t1" onClick={() => setTab(1)}>show</button>
    <div style={{ height: 400, border: "1px solid red" }}><div id="pane" style={{ display: tab === 1 ? "block" : "none", height: "100%" }}><Inner pager /></div></div></>;
  else if (mode === "flex") body = <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}><div>head</div><div style={{ flex: 1 }}><Inner virtual /></div></div>;
  else if (mode === "flexfill") body = <div style={{ display: "flex", flexDirection: "column", height: 500 }}><div>head</div><div style={{ flex: 1, minHeight: 0 }}><Inner pager /></div></div>;
  else if (mode === "modal") body = <><Button id="open" onClick={() => setOpen(true)}>open</Button><Modal open={open} onClose={() => setOpen(false)} title="T"><div style={{ height: 400, width: 600 }}><Inner pager /></div></Modal></>;
  else body = <div style={{ height: 0 }}><Inner /></div>;
  return <div style={{ padding: 8 }}>{body}</div>;
}

function Weird() {
  const rows = useMemo(() => [
    { id: "a", n: "=1+1", v: 12.5, d: new Date(2026, 2, 29, 2, 30) },
    { id: "b", n: "line\nbreak \"q\"; semi, comma", v: NaN, d: new Date("invalid") },
    { id: "c", n: "+SUM(A1)", v: Infinity, d: new Date(8.64e15) },
    { id: "d", n: "@cmd\t", v: 1e21, d: new Date(-62198755200000) },
    { id: "e", n: "x".repeat(40000), v: -0, d: new Date(2026, 9, 25, 2, 30) },
    { id: "f", n: "", v: 0.1 + 0.2, d: new Date(2026, 0, 1) },
    { id: "g", n: "12,50", v: "12,50" as any, d: "2026-03-01" as any },
    { id: "h", n: undefined as any, v: undefined as any, d: undefined as any },
    { id: "i", n: "🙂 emoji ‮rtl", v: 1234567.891, d: new Date(2026, 5, 1) },
  ], []);
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 20 });
  W.__t = t;
  const { Table, Column } = t;
  return <div style={{ padding: 8 }}><Table aria-label="Weird"><Toolbar><Search /><Export /></Toolbar>
    <Column value="n" label="Text" rowHeader filter="text" />
    <Column value="v" label="Number" filter="range" aggregate="sum" />
    <Column value="d" label="Date" format="dateTime" filter="range" />
    <Pagination /></Table></div>;
}

function Dates() {
  const rows = useMemo(() => {
    const base = [
      "2026-03-28T22:30:00Z", "2026-03-28T23:30:00Z", "2026-03-29T00:30:00Z", "2026-03-29T01:30:00Z", "2026-03-29T21:59:00Z", "2026-03-29T22:00:00Z", "2026-03-29T23:59:59Z",
      "2026-10-24T21:59:00Z", "2026-10-24T22:00:00Z", "2026-10-25T00:30:00Z", "2026-10-25T01:30:00Z", "2026-10-25T22:59:00Z", "2026-10-25T23:00:00Z",
      "2026-12-31T23:30:00Z", "2027-01-01T00:30:00Z", "2027-01-03T12:00:00Z", "2027-01-04T12:00:00Z", "2024-12-30T12:00:00Z", "2026-02-28T23:59:59.999Z", "2026-03-01T00:00:00Z",
    ];
    return base.map((iso, i) => ({ id: "d" + i, iso, d: new Date(iso), n: i }));
  }, []);
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 50, defaultGrouping: new URLSearchParams(location.search).get("g") ?? undefined });
  W.__t = t;
  const { Table, Column } = t;
  return <div style={{ padding: 8 }}><Table aria-label="Dates"><Toolbar><ColumnMenu /></Toolbar>
    <Column value="iso" label="ISO" rowHeader />
    <Column value="d" label="Day" format="date" filter="range" group="day" />
    <Column value="d" id="wk" label="Week" format="date" group="week" />
    <Column value="d" id="mo" label="Month" format="date" group="month" />
    <Column value="d" id="time" label="Time" format="dateTimeWithSeconds" />
    <Pagination /></Table></div>;
}

function BigLive() {
  const [rows, setRows] = useState(() => makeRows(100000));
  W.__bigTick = () => setRows((r) => { const n = r.slice(); for (let i = 0; i < 1000; i++) { const k = (i * 97) % n.length; n[k] = { ...n[k]!, amount: (n[k]!.amount ?? 0) + 1 }; } return n; });
  const t = useTable(rows, { rowKey: (r) => r.id, virtual: true, defaultSort: { column: "amount", direction: "desc" } });
  W.__t = t;
  const { Table, Column } = t;
  return <div style={{ padding: 8 }}><Table aria-label="BigLive" maxHeight="400px" stickyHeader><Toolbar><Search /></Toolbar>
    <Column value="name" label="Name" rowHeader /><Column value="amount" label="Amount" filter="range" /><Column value="dept" label="Dept" filter="list" /></Table></div>;
}

function Toggle() {
  const [on, setOn] = useState(true);
  W.__toggle = (v?: boolean) => setOn((x) => v ?? !x);
  const inner = new URLSearchParams(location.search).get("inner") ?? "live";
  const C = SCENES[inner]!;
  return <div><button id="tg" onClick={() => setOn((x) => !x)}>toggle</button>{on && <C />}</div>;
}

export const SCENES: Record<string, () => ReactNode> = { live: Live, server: Server, groups: Groups, pager: Pager, textf: TextF, selch: SelCh, edit: Edit, big: Big, cont: Containers, weird: Weird, dates: Dates, toggle: Toggle, biglive: BigLive };
