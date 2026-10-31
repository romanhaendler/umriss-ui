import { useRef, useState } from "react";
import {
  Button, Checkbox, Combobox, CommandPalette, ConfirmDialog, DatePicker, DateRangePicker, DateTimePicker, Drawer, FormField, Input, Menu, MenuItem,
  Modal, ModalBody, ModalFooter, ModalHeader, MultiSelect, NumberInput, Popover, RadioGroup, Select, Slider, Switch, Tab, TabList, TabPanel, Tabs,
  Textarea, ToastProvider, useToast, TreeView, useTree, Tooltip, Accordion, AccordionItem, SegmentedControl, Stack,
} from "@umriss-ui/core";
import { ColumnGroup, ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "@umriss-ui/table";

interface P { id: string; name: string; team: string; role: string; cap: number; from: Date; city: string; note: string }
const TEAMS = ["Web", "Apps", "Data", "Ops"];
const CITIES = ["Leeds", "Bath", "York", "Bristol", "Ulm"];
const mk = (n: number): P[] => Array.from({ length: n }, (_, i) => ({
  id: "p" + i, name: "Person " + String(i).padStart(4, "0"), team: TEAMS[i % 4]!, role: i % 3 ? "Developer" : "Designer",
  cap: 10 + (i % 31), from: new Date(2026, 2, 1 + (i % 28)), city: CITIES[i % 5]!, note: "",
}));
interface TN { id: string; label: string; children?: TN[] }
const NODES: TN[] = [{ id: "x", label: "Alpha", children: [{ id: "x1", label: "Alpha 1" }, { id: "x2", label: "Alpha 2" }] }, { id: "y", label: "Beta" }];
const SMALL = mk(23);
const BIG = mk(2000);

export function ReadTable() {
  const t = useTable(SMALL, { rowKey: (p) => p.id, pageSize: 5 });
  const { Table, Column, RowActions, Action, RowDetail } = t;
  return (
    <Table aria-label="People" selectable stickyHeader>
      <Toolbar><Search aria-label="Search people" /><ColumnMenu /><Export /></Toolbar>
      <Column value="name" label="Name" rowHeader />
      <ColumnGroup label="Work">
        <Column value="team" label="Team" filter="list" />
        <Column value="role" label="Role" filter="text" />
      </ColumnGroup>
      <ColumnGroup label="Numbers">
        <Column value="cap" label="Capacity" numeric filter="range" />
        <Column value="from" label="From" format="date" />
      </ColumnGroup>
      <RowActions>
        <Action onSelect={() => undefined}>Open</Action>
        <Action onSelect={() => undefined}>Copy</Action>
        <Action onSelect={() => undefined}>Archive</Action>
      </RowActions>
      <RowDetail>{(r) => <div>Detail of {r.name}</div>}</RowDetail>
      <Pagination pageSizes={[5, 10]} />
    </Table>
  );
}

function GridInner({ virtual, grouped, rows, mode, extra }: { virtual?: boolean; grouped?: boolean; rows: P[]; mode?: "cell" | "row"; extra?: boolean }) {
  const [data, setData] = useState(rows);
  const [log, setLog] = useState("");
  const t = useTable(data, { rowKey: (p) => p.id, virtual: virtual || undefined, pageSize: 8, defaultGrouping: grouped ? "team" : undefined });
  const { Table, Column, RowActions, Action } = t;
  return (
    <>
      <p role="status" id="log">{log}</p>
      <Table
        grid stickyHeader={new URLSearchParams(location.search).get("sticky") === "1"} aria-label="Grid people" maxHeight={virtual ? "300px" : undefined} editMode={mode}
        onCellEdit={(e) => { setLog(`edit ${e.rowKey} ${e.columnId} ${String(e.value)}`); setData((all) => all.map((p) => (p.id === e.rowKey ? { ...p, [e.columnId]: e.value } : p))); }}
        onRowSave={extra ? (s) => { setLog(`save ${s.rowKey} ${JSON.stringify(s.changes)}`); setData((all) => all.map((p) => (p.id === s.rowKey ? { ...p, ...s.changes } : p))); } : undefined}
        onRowAdd={extra ? (a) => setLog("add " + JSON.stringify(a.values)) : undefined}
        onRowDelete={extra ? (d) => { setLog("delete " + d.rowKey); setData((all) => all.filter((p) => p.id !== d.rowKey)); } : undefined}
        newRow={extra ? () => ({ team: "Web" }) : undefined}
        selectable
      >
        <Toolbar><Search aria-label="Search" /><ColumnMenu /></Toolbar>
        <Column value="name" label="Name" rowHeader pin="start" width={160} edit="text" />
        <ColumnGroup label="Work">
          <Column value="team" label="Team" width={110} edit="select" editOptions={TEAMS} filter="list" />
          <Column value="role" label="Role" width={120} filter="text" />
        </ColumnGroup>
        <Column value="cap" label="Capacity" numeric width={120} edit="number" validate={(v) => (v === null || v < 4 || v > 40 ? "Between 4 and 40" : undefined)} />
        <Column value="from" label="From" format="date" width={150} edit="date" />
        <Column value="city" label="City" width={120} />
        <Column value="note" label="Note" width={160} edit="text" pin="end" />
        <RowActions><Action onSelect={() => undefined}>Open</Action></RowActions>
        {!virtual && <Pagination pageSizes={[8, 16]} />}
      </Table>
    </>
  );
}
export const Grid = () => <GridInner rows={SMALL} />;
export const GridRow = () => <GridInner rows={SMALL} mode="row" extra />;
export const GridVirtual = () => <GridInner rows={BIG} virtual />;
export const GridGrouped = () => <GridInner rows={SMALL} grouped />;
export const GridGroupedVirtual = () => <GridInner rows={BIG} grouped virtual />;

interface U { id: string; name: string; n: number; children?: U[] }
const UNITS: U[] = [
  { id: "a", name: "Sales", n: 42, children: [{ id: "a1", name: "North", n: 18, children: [{ id: "a1x", name: "Leeds", n: 9 }] }, { id: "a2", name: "South", n: 24 }] },
  { id: "b", name: "Finance", n: 11 },
  { id: "c", name: "Ops", n: 96, children: [{ id: "c1", name: "Site", n: 81 }] },
];
export function TreeTable({ grid }: { grid?: boolean }) {
  const t = useTable(UNITS, { rowKey: (u) => u.id, childRows: (u) => u.children });
  const { Table, Column } = t;
  return (
    <Table aria-label="Org" grid={grid}>
      <Column value="name" label="Unit" rowHeader />
      <Column value="n" label="Headcount" numeric />
    </Table>
  );
}

function Toaster() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: "Saved", description: "All good" })}>Toast</Button>;
}
function PopoverDemo() {
  const [o, setO] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (<><Button ref={ref} onClick={() => setO(!o)} aria-expanded={o} aria-haspopup="dialog">Popover</Button>
    <Popover open={o} onOpenChange={setO} anchorRef={ref} role="dialog" aria-label="Pop"><Input aria-label="in popover" /><Button>Inside</Button></Popover></>);
}
export function CoreForm() {
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [d, setD] = useState<Date | null>(null);
  const [r, setR] = useState<unknown>(null);
  const [dt, setDt] = useState<Date | null>(null);
  const [ms, setMs] = useState<string[]>([]);
  const [cb, setCb] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [conf, setConf] = useState(false);
  const [dr, setDr] = useState(false);
  const [pal, setPal] = useState(false);
  const [tab, setTab] = useState("one");
  const [sl, setSl] = useState(30);
  const tree = useTree<TN>(NODES, { reader: { key: (n) => n.id, children: (n) => n.children, label: (n) => n.label } });
  return (
    <ToastProvider>
      <form noValidate onSubmit={(e) => { e.preventDefault(); const n: Record<string, string> = {}; const f = new FormData(e.currentTarget); if (!f.get("name")) n.name = "Name is required"; if (!f.get("email")) n.email = "Email is required"; if (!d) n.date = "Pick a date"; setErrs(n); }}>
        <Stack gap={3}>
          <FormField label="Name" error={errs.name} required><Input name="name" /></FormField>
          <FormField label="Email" error={errs.email} hint="We never write" required><Input name="email" type="email" /></FormField>
          <FormField label="Date" error={errs.date}><DatePicker value={d} onChange={setD as never} /></FormField>
          <FormField label="Range"><DateRangePicker value={r as never} onChange={setR as never} /></FormField>
          <FormField label="DateTime"><DateTimePicker value={dt} onChange={setDt as never} /></FormField>
          <FormField label="Team"><Select value={sel ?? ""} onChange={(e) => setSel(e.target.value)}>{TEAMS.map((x) => <option key={x}>{x}</option>)}</Select></FormField>
          <FormField label="City"><Combobox value={cb} onChange={setCb as never} options={CITIES.map((x) => ({ value: x, label: x }))} /></FormField>
          <FormField label="Cities"><MultiSelect value={ms} onChange={setMs as never} options={CITIES.map((x) => ({ value: x, label: x }))} /></FormField>
          <FormField label="Amount"><NumberInput value={null} onChange={() => undefined} /></FormField>
          <FormField label="Notes"><Textarea /></FormField>
          <FormField label="Level"><Slider min={0} max={100} value={sl} onChange={setSl as never} /></FormField>
          <RadioGroup aria-label="Kind" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} />
          <Checkbox label="Agree" />
          <Switch label="Live" />
          <SegmentedControl aria-label="Seg" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} {...({ value: "a", onChange: () => undefined } as object)} />
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
      <hr />
      <Stack direction="row" gap={2} wrap>
        <Menu trigger={<Button>Menu</Button>}><MenuItem onSelect={() => undefined}>One</MenuItem><MenuItem onSelect={() => undefined}>Two</MenuItem><MenuItem disabled>Three</MenuItem></Menu>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Button onClick={() => setConf(true)}>Confirm</Button>
        <Button onClick={() => setDr(true)}>Drawer</Button>
        <Button onClick={() => setPal(true)}>Palette</Button>
        <PopoverDemo />
        <Tooltip content="Tip text"><Button>Tooltip</Button></Tooltip>
        <Toaster />
      </Stack>
      <Tabs value={tab} onChange={setTab as never}>
        <TabList aria-label="Tabs"><Tab value="one">One</Tab><Tab value="two">Two</Tab><Tab value="three">Three</Tab></TabList>
        <TabPanel value="one">Panel one <Button>In panel</Button></TabPanel>
        <TabPanel value="two">Panel two</TabPanel>
        <TabPanel value="three">Panel three</TabPanel>
      </Tabs>
      <Accordion><AccordionItem value="a" title="Sect A">Body A</AccordionItem><AccordionItem value="b" title="Sect B">Body B</AccordionItem></Accordion>
      <TreeView tree={tree} aria-label="Tree">{(e) => e.node.label}</TreeView>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Edit thing" /><ModalBody><Input aria-label="m1" /><Button>Mid</Button></ModalBody>
        <ModalFooter><Button onClick={() => setOpen(false)}>Close</Button></ModalFooter>
      </Modal>
      <ConfirmDialog open={conf} onClose={() => setConf(false)} onConfirm={() => setConf(false)} title="Sure?" {...({} as object)} />
      <Drawer open={dr} onClose={() => setDr(false)}><ModalHeader title="Drawer" /><ModalBody>Body</ModalBody></Drawer>
      <CommandPalette open={pal} onClose={() => setPal(false)} items={[{ id: "1", label: "Alpha" }, { id: "2", label: "Beta" }] as never} onChoose={() => setPal(false)} {...({} as object)} />
    </ToastProvider>
  );
}

export function Fitted() {
  const t = useTable(SMALL, { rowKey: (p) => p.id });
  const { Table, Column } = t;
  return (
    <div style={{ height: new URLSearchParams(location.search).get("h") || "360px" }}>
      <Table grid aria-label="Fitted" style={{ height: "100%" }}>
        <Column value="name" label="Name" rowHeader />
        <Column value="team" label="Team" />
        <Pagination pageSizes={[5, 10]} />
      </Table>
    </div>
  );
}
const MAP: Record<string, () => React.JSX.Element> = {
  read: ReadTable, grid: Grid, gridrow: GridRow, virtual: GridVirtual, grouped: GridGrouped, groupedvirtual: GridGroupedVirtual,
  tree: () => <TreeTable />, treegrid: () => <TreeTable grid />, core: CoreForm, fit: Fitted,
};
export function Screens() {
  const k = location.hash.slice(1) || "read";
  const C = MAP[k] ?? ReadTable;
  return <main><h1>{k}</h1><C /></main>;
}
