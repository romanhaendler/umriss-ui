import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import {
  UmrissProvider, ToastProvider, useToast, Button, Modal, ModalHeader, ModalBody, ModalFooter, ConfirmDialog,
  Drawer, Input, NumberInput, Switch, SegmentedControl, Splitter, Stack, Text,
} from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Pagination, Search, Toolbar, useTable } from "@umriss-ui/table";

const W = window as any;
const q = new URLSearchParams(location.search);
const MODE = q.get("mode") ?? "client"; // client | server
const REFRESH = Number(q.get("refresh") ?? 500);
const OUTSIDE = !!q.get("outside");
const LATENCY = Number(q.get("latency") ?? 150);

/* ---- the fake backend: bad shapes on purpose ---- */
const STATUSES = ["NEW", "PAID", "SHIPPED", "CANCELLED"];
let nextId = 1000;
const mk = (i: number): any => ({
  id: i % 9 === 0 ? String(1000 + i) : 1000 + i, // number or string
  customer: i % 4 === 0 ? null : "Customer " + (i % 7),
  status: STATUSES[i % 4],
  qty: i % 3 === 0 ? String(i % 10 + 1) : (i % 10) + 1, // string or number
  price: (10 + i * 1.5).toFixed(2), // string
  created: i % 2 ? new Date(2026, 9, 1 + (i % 28), 10, 0).toISOString() : new Date(2026, 9, 1 + (i % 28), 10, 0).getTime(),
});
let db: any[] = Array.from({ length: 40 }, (_, i) => mk(i));
nextId = 1040;
W.__db = () => db;
W.__insert = () => { db = [{ ...mk(nextId++ - 1000), id: nextId }, ...db]; };
W.__removeId = (id: string) => { db = db.filter((r) => String(r.id) !== id); };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clone = (x: any) => JSON.parse(JSON.stringify(x));
async function fetchAll() { await sleep(LATENCY); return clone(db); }
async function fetchPage(req: any) {
  await sleep(LATENCY);
  let rows = db.map((r) => clone(r));
  const s = (req.search ?? "").toLowerCase();
  if (s) rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  const start = (req.page - 1) * req.pageSize;
  return { rows: rows.slice(start, start + req.pageSize), count: rows.length };
}
async function saveQty(id: string, qty: number) { await sleep(LATENCY); db = db.map((r) => (String(r.id) === id ? { ...r, qty } : r)); }

interface Order { id: string; customer: string; status: string; qty: number; price: number; created: Date }
const norm = (r: any): Order => ({
  id: String(r.id) + (q.get("churn") ? "-" + Math.floor(Date.now() / 1500) : ""), customer: r.customer ?? "", status: r.status, qty: Number(r.qty), price: Number(r.price),
  created: new Date(r.created),
});

function Screen() {
  const toast = useToast();
  const [rows, setRows] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [editing, setEditing] = useState<Order | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [cancelAsk, setCancelAsk] = useState<Order[] | null>(null);
  const [split, setSplit] = useState(70);
  const reqRef = useRef<any>({ search: "", conditions: {}, sort: [], page: 1, pageSize: 10 });
  const [answers, setAnswers] = useState<any>(reqRef.current);
  const log = useRef<string[]>([]);
  W.__log = log.current;

  const load = async () => {
    if (MODE === "server") {
      const req = reqRef.current;
      const { rows, count } = await fetchPage(req);
      if (req !== reqRef.current) return;
      setRows(rows.map(norm)); setCount(count); setAnswers(req);
    } else setRows((await fetchAll()).map(norm));
  };
  useEffect(() => { load(); if (!REFRESH) return; const h = setInterval(load, REFRESH); return () => clearInterval(h); }, []);
  W.__load = load;

  const serverOpts: any = MODE === "server"
    ? { server: true, rowCount: count, answers, onRequest: (v: any) => { reqRef.current = v; log.current.push("req p" + v.page + " s" + v.pageSize + " q" + v.search); load(); } }
    : {};
  const t = useTable(rows, {
    rowKey: (o: Order) => o.id, defaultGrouping: MODE === "client" && !q.get("pager") ? ["status"] : undefined,
    onSelectionChange: (k: string[]) => log.current.push("sel " + k.join(",")),
    ...serverOpts,
  } as any);
  W.__t = t;
  const { Table, Column, RowActions, Action } = t;

  const remove = (o: Order) => {
    const before = clone(db);
    db = db.filter((r) => String(r.id) !== o.id);
    load();
    toast.toast({ title: "Order " + o.id + " deleted", action: { label: "Undo", onClick: () => { db = before; load(); } } });
  };
  const cancel = (list: Order[]) => {
    const ids = new Set(list.map((o) => o.id));
    const before = clone(db);
    db = db.map((r) => (ids.has(String(r.id)) ? { ...r, status: "CANCELLED" } : r));
    load();
    toast.toast({ title: list.length + " orders cancelled", action: { label: "Undo", onClick: () => { db = before; load(); } } });
  };

  const CONFIRM = (
<ConfirmDialog open={confirm} tone="danger" title={"Delete order " + editing?.id + "?"} confirmLabel="Delete"
  onClose={() => { log.current.push("confirm-onClose"); setConfirm(false); }}
  onConfirm={() => { remove(editing!); setConfirm(false); setEditing(null); }} />
  );
  const table = (
    <Table
      grid selectable aria-label="Orders" maxHeight={MODE === "client" && !q.get("pager") ? "420px" : undefined}
      onCellEdit={async (e: any) => {
        log.current.push("edit " + e.rowKey + " " + e.columnId + " " + JSON.stringify(e.value));
        setRows((all) => all.map((o) => (o.id === e.rowKey ? { ...o, qty: Number(e.value) } : o)));
        await saveQty(e.rowKey, Number(e.value));
      }}
    >
      <Toolbar><Search /></Toolbar>
      <Column value="id" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="status" label="Status" groupable filter="list" />
      <Column value="qty" label="Qty" edit="number" format="count" numeric />
      <Column value="price" label="Price" numeric format={{ style: "currency", currency: "EUR" } as any} />
      <Column value="created" label="Created" format="dateTime" />
      <RowActions>
        <Action onSelect={(o: Order) => setEditing(o)}>Edit</Action>
        <Action onSelect={(o: Order) => setDetail(o.id)}>Details</Action>
        <Action tone="danger" bulk onSelect={(l: any) => setCancelAsk(Array.isArray(l) ? l : [l])}>Cancel orders</Action>
      </RowActions>
      {MODE === "server" || q.get("pager") ? <Pagination /> : null}
    </Table>
  );
  const d = rows.find((o) => o.id === detail);
  return (
    <Stack gap={3}>
      <div style={{ height: MODE === "server" || q.get("pager") ? 420 : undefined }}>
        {q.get("pane") ? (
          <Splitter orientation="vertical" value={split} onChange={setSplit} style={{ height: "100%" }}>
            <div style={{ height: "100%" }}>{table}</div><div>footer</div>
          </Splitter>
        ) : table}
      </div>
      <Text role="status" id="count">{t.rowCount} orders, {t.selection.count} selected</Text>
      <Modal open={!!editing} onClose={() => { log.current.push("modal-onClose"); setEditing(null); }}>
        <ModalHeader title={"Edit order " + editing?.id} />
        <ModalBody>
          <Input aria-label="Customer" defaultValue={editing?.customer} />
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={() => setConfirm(true)}>Delete</Button>
          <Button onClick={() => setEditing(null)}>Save</Button>
        </ModalFooter>
        {!OUTSIDE && CONFIRM}
      </Modal>
      {OUTSIDE && CONFIRM}
      <ConfirmDialog open={!!cancelAsk} tone="danger" title={"Cancel " + cancelAsk?.length + " orders?"} confirmLabel="Cancel orders"
        onClose={() => setCancelAsk(null)} onConfirm={() => { cancel(cancelAsk!); setCancelAsk(null); }} />
      <Drawer open={!!detail} onClose={() => setDetail(null)}>
        <ModalHeader title={"Order " + detail} />
        <ModalBody><Text id="detail">{d ? `${d.customer} / ${d.qty} / ${d.status}` : "gone"}</Text></ModalBody>
      </Drawer>
    </Stack>
  );
}

function Raw() {
  const [rows] = useState<any[]>(() => db.map(clone));
  const t = useTable(rows as any[], { rowKey: (r: any) => String(r.id), pageSize: 50 } as any);
  W.__traw = t;
  const { Table, Column } = t as any;
  return (
    <Table aria-label="Raw" selectable>
      <Column value="id" label="Order" rowHeader />
      <Column value="customer" label="Customer" filter="text" />
      <Column value="status" label="Status" filter="list" groupable />
      <Column value="qty" label="Qty" numeric aggregate="sum" filter="range" />
      <Column value="price" label="Price" numeric format={{ style: "currency", currency: "EUR" }} aggregate="sum" filter="range" />
      <Column value="created" label="Created" format="dateTime" filter="range" />
    </Table>
  );
}

function App() {
  const [de, setDe] = useState(q.get("lang") === "de");
  const [dark, setDark] = useState(!!q.get("dark"));
  useEffect(() => { document.documentElement.style.colorScheme = dark ? "dark" : "light"; }, [dark]);
  return (
    <UmrissProvider language={de ? { formats: GERMAN_FORMATS, wording: GERMAN_WORDING } : undefined}>
      <ToastProvider>
        <div style={{ padding: 16 }}>
          <Stack direction="row" gap={3} align="center">
            <SegmentedControl options={[{ value: "en", label: "EN" }, { value: "de", label: "DE" }]} value={de ? "de" : "en"} onChange={(v) => setDe(v === "de")} />
            <Switch checked={dark} onChange={(e: any) => setDark(e.target.checked)} aria-label="Dark" />
          </Stack>
          {q.get("raw") ? <Raw /> : <Screen />}
        </div>
      </ToastProvider>
    </UmrissProvider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
