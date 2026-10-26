import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useChart } from "@umriss-ui/charts";
import { Alert, Button, SegmentedControl, Stack, Text } from "@umriss-ui/core";
import { HeadingType, useDashboard } from "../../src";
import type { DashboardView, HeadingOptions } from "../../src";

/* Data from the logistics world, written out here so the example runs on its own. */

export const title = "Arrange the start screen";

export const lead =
  "A dispatcher at Ferrow Parcel opens the same start screen every day and wants the figure she looks at fifty times a day first. Four cases walk through what the screen does at other widths, while she rearranges it, when something goes wrong and what the application stays in charge of.";

export const callouts = [
  "The case: each one starts the dashboard anew, with the arrangement the application chose for the role.",
  "What the application does - the window it is opened in, a navigation away, a stored value from an old release, a lock - as buttons. What the reader does stands in the sentence beside them: the real controls are in the dashboard.",
  "What happened, in a sentence.",
  "The dashboard itself. It measures its own width, so the stage narrows and widens it without a window.",
  "What the application was told: once per \"Done\" that changed something, with the whole arrangement.",
];

export const builtFrom = [
  "dashboard",
  { name: "Chart", page: "@umriss-ui/charts#chart" },
  { name: "SegmentedControl", page: "@umriss-ui/core#segmented-control" },
  { name: "Alert", page: "@umriss-ui/core#alert" },
  { name: "Text", page: "@umriss-ui/core#text" },
];

type Verdict = "ok" | "warn" | "bad";

const MARK: Record<Verdict, CSSProperties> = {
  ok: { background: "var(--u-color-success)", borderRadius: "50%" },
  warn: { background: "var(--u-color-warning)", borderRadius: 2 },
  bad: { background: "var(--u-color-danger)", transform: "rotate(45deg)" },
};

const hairline = "1px solid var(--u-hairline)";

/** A status mark whose shape says it too: circle, square, diamond. */
function Dot({ verdict }: { verdict: Verdict }) {
  return <span aria-hidden="true" style={{ flex: "none", width: 8, height: 8, ...MARK[verdict] }} />;
}

/** A figure: a large value with its unit, and a status line under it. */
function Kz({ value, unit, verdict, note }: { value: string; unit?: string; verdict: Verdict; note: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "var(--u-space-1)", height: "100%", minWidth: 0 }}>
      <Text as="div" size="2xl" weight="semibold" leading="tight" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
        {/* The unit keeps its words together and goes under the value where the tile is too narrow for both. */}
        {unit && <Text as="span" size="sm" tone="muted" style={{ marginInlineStart: "var(--u-space-1)", fontWeight: "var(--u-weight-regular)", whiteSpace: "nowrap" }}>{unit}</Text>}
      </Text>
      <Text as="div" size="xs" tone="secondary" style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
        <Dot verdict={verdict} />
        {note}
      </Text>
    </div>
  );
}

/** The trend: this week as a line with a faint area, last week dashed and muted, on one scale; with `previous` the legend too. */
function TrendChart({ data, previous, labels = ["this week", "last week"] }: { data: readonly number[]; previous?: readonly number[]; labels?: readonly [string, string] }) {
  const rows = data.map((now, i) => ({ i, now, before: previous?.[i] ?? now }));
  const { Chart, XAxis, YAxis, Line, Area } = useChart(rows);
  const swatch = (color: string, dashed = false): CSSProperties => ({ display: "inline-block", width: 14, borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}`, verticalAlign: "middle", marginInlineEnd: 5 });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--u-space-2)", height: "100%", minWidth: 0 }}>
      {previous && (
        <Text as="div" size="xs" tone="secondary" style={{ display: "flex", gap: 14 }}>
          <span><i style={swatch("var(--u-color-accent)")} />{labels[0]}</span>
          <span><i style={swatch("var(--u-color-text-muted)", true)} />{labels[1]}</span>
        </Text>
      )}
      <div style={{ flex: "1 1 0", minHeight: 0 }}>
        <Chart aria-label={previous ? `${labels[0]} and ${labels[1]}` : labels[0]} padding={4} style={{ minHeight: 0, height: "100%" }}>
          <XAxis value="i" domain="data" grid={false} tickFormat={() => ""} />
          <YAxis grid tickFormat={() => ""} />
          {previous && <Line value="before" name={labels[1]} color="var(--u-color-text-muted)" strokeWidth={1.25} dash={[3, 3]} markers="never" />}
          <Area value="now" name={labels[0]} color="var(--u-color-accent)" fillOpacity={0.09} strokeWidth={1.75} />
        </Chart>
      </div>
    </div>
  );
}

/** Rows under each other, a hairline between them: a mark, a text, what belongs to it at the end. */
function Rows({ rows }: { rows: ReadonlyArray<{ verdict: Verdict; text: string; meta?: string }> }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {rows.map(({ verdict, text, meta }, i) => (
        <li key={text} style={{ display: "flex", alignItems: "center", gap: "var(--u-space-3)", padding: "6px 0", borderTop: i ? hairline : undefined }}>
          <Dot verdict={verdict} />
          <Text as="span" size="sm" style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</Text>
          {meta && <Text as="span" size="xs" tone="muted" style={{ whiteSpace: "nowrap" }}>{meta}</Text>}
        </li>
      ))}
    </ul>
  );
}

/** A table with a muted head and a hairline between the rows; `numeric` columns stand right. */
function DataTable({ head, rows, numeric = [] }: { head: readonly string[]; rows: ReadonlyArray<readonly ReactNode[]>; numeric?: readonly number[] }) {
  const align = (i: number): CSSProperties => ({ textAlign: numeric.includes(i) ? "right" : "left", paddingBlock: 5, paddingInline: "0 var(--u-space-2)", whiteSpace: "nowrap" });
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--u-text-sm)", fontVariantNumeric: "tabular-nums" }}>
      <thead>
        <tr>
          {head.map((name, i) => (
            <th key={name} style={{ ...align(i), color: "var(--u-color-text-muted)", fontSize: "var(--u-text-xs)", fontWeight: "var(--u-weight-medium)" }}>{name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, r) => (
          <tr key={r}>
            {cells.map((cell, i) => (
              <td key={i} style={{ ...align(i), borderTop: hairline }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const FIGURES = {
  Orders: { value: "1,284", unit: "per day", verdict: "ok", note: "+3.1% on last week" },
  Utilisation: { value: "87.4", unit: "%", verdict: "ok", note: "on target" },
  Complaints: { value: "2.9", unit: "%", verdict: "warn", note: "just above target" },
  Backlog: { value: "38", unit: "", verdict: "bad", note: "target missed" },
} as const satisfies Record<string, { value: string; unit: string; verdict: Verdict; note: string }>;
type Figure = keyof typeof FIGURES;

const TREND: Record<Figure, { now: readonly number[]; before: readonly number[] }> = {
  Orders: { now: [58, 52, 55, 51, 49, 53, 47, 52, 56, 60, 57, 55, 56, 58, 54, 52, 52, 49, 46, 49, 52, 55, 62, 58, 61, 55, 57, 62], before: [56, 56, 50, 53, 53, 60, 66, 68, 66, 64, 56, 52, 49, 50, 48, 49, 47, 45, 42, 38, 36, 36, 32, 30, 28, 34, 34, 30] },
  Utilisation: { now: [60, 62, 66, 64, 68, 70, 72, 71, 74, 73, 76, 78], before: [58, 59, 57, 60, 61, 60, 63, 62, 64, 63, 65, 66] },
  Complaints: { now: [66, 72, 70, 62, 55, 62, 68, 54, 55, 58, 50, 52, 48, 51, 49, 47, 47, 47, 47, 58, 59, 52, 50, 53, 58, 60], before: [64, 66, 62, 60, 58, 56, 55, 53, 54, 52, 50, 49, 48, 47, 46, 46, 45, 45, 45, 46, 47, 47, 46, 46, 45, 45] },
  Backlog: { now: [22, 25, 31, 29, 34, 36, 38], before: [30, 28, 27, 29, 26, 25, 24] },
};

const ALERTS = [
  { verdict: "bad", text: "Tour 14 is 25 min late", meta: "12 min ago" },
  { verdict: "warn", text: "Dock 3 is out of service", meta: "34 min ago" },
  { verdict: "warn", text: "Call: Oakridge Pharmacy", meta: "1 h ago" },
] as const satisfies ReadonlyArray<{ verdict: Verdict; text: string; meta: string }>;

const ORDERS = [
  ["A-2041", "Holloway Garden Supplies", "120", "Packed"],
  ["A-2042", "Marlow & Finch Books", "490", "Picking"],
  ["A-2043", "Brixley Cycles", "860", "Late"],
];

const heading = (id: string, text: string) => ({ id, type: "heading", size: "full" as const, options: { text } satisfies HeadingOptions });

const DISPATCH: DashboardView = {
  widgets: [
    heading("h1", "Overview"),
    { id: "f1", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "f2", type: "figure", size: "small", options: { name: "Utilisation" } },
    { id: "f3", type: "figure", size: "small", options: { name: "Complaints" } },
    { id: "f4", type: "figure", size: "small", options: { name: "Backlog" } },
    heading("h2", "Trend"),
    { id: "t1", type: "trend", size: "large", options: { name: "Orders" } },
    { id: "a1", type: "alerts", size: "tall", options: {} },
    heading("h3", "Work in hand"),
    { id: "o1", type: "orders", size: "full", options: {} },
  ],
};

const MANAGEMENT: DashboardView = {
  widgets: [
    heading("h1", "The week"),
    { id: "t1", type: "trend", size: "wide", options: { name: "Utilisation" } },
    { id: "t2", type: "trend", size: "wide", options: { name: "Complaints" } },
    { id: "f1", type: "figure", size: "medium", options: { name: "Orders" } },
  ],
};

const ROLES = { dispatch: DISPATCH, management: MANAGEMENT } as const;
type Role = keyof typeof ROLES;

/** What an older release stored: a widget type that is gone, and a size the trend no longer offers. */
const OLD = {
  widgets: [
    { id: "f1", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "x1", type: "weather", size: "small", options: {} },
    { id: "t1", type: "trend", size: "huge", options: { name: "Orders" } },
    { id: "t2", type: "trend", size: "wide", options: { name: "Backlog" } },
  ],
} as unknown as DashboardView;

const CASES = [
  { value: "monitors", label: "Other monitors" },
  { value: "rearranging", label: "Rearranging" },
  { value: "wrong", label: "When something goes wrong" },
  { value: "governs", label: "What the application governs" },
] as const;
type Case = (typeof CASES)[number]["value"];

const INTRO: Record<Case, string> = {
  monitors:
    "The arrangement of the role has three sections, each with a heading across the width, and four figures in a row at the top. Open it on other screens and see whether every widget stays beside its neighbours.",
  rearranging:
    "Editing is a mode and a draft. A widget's head is the grip, and its menu does everything without a drag. After \"Edit\", try it yourself: drag a head, open a menu, or Tab to a head and press an arrow key. Undo goes back one step.",
  wrong:
    "A drag goes wrong, and a removed widget must not be lost. Undo takes one step back, \"Cancel\" all of them, and the application decides what happens when someone leaves with a draft open.",
  governs:
    "The arrangement is a value the application keeps and hands over. It owes the reader a lenient reading of an old value, a frame that outlives a widget that fails, a way back to its default and the choice to lock editing.",
};

function Stage({ shown }: { shown: Case }) {
  const [said, setSaid] = useState("");
  const [width, setWidth] = useState<number | null>(null);
  const [role, setRole] = useState<Role>("dispatch");
  const [locked, setLocked] = useState(false);
  const [broken, setBroken] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<string[]>([]);
  const kept = useRef<Partial<Record<Role, DashboardView>>>({});

  const parts = useDashboard({
    defaultView: ROLES[role],
    allowEdit: !locked,
    onDraftChange: setOpen,
    onViewChange: (view) => {
      kept.current[role] = view;
      setReports((all) => [...all, `${role === "dispatch" ? "Dispatch" : "Management"}: ${view.widgets.length} widgets`]);
    },
  });
  const { Dashboard, WidgetType } = parts;
  const edit = () => {
    parts.edit();
    setSaid("The frame, the label \"Editing\" and the changed heads show the mode. The widgets' content rests while it lasts.");
  };

  const buttons: Record<Case, ReactNode> = {
    monitors: [1920, 2560, 820, 390].map((px) => (
      <Button
        key={px}
        onClick={() => {
          setWidth(px);
          setSaid(
            px >= 1920
              ? "The dashboard stands at its maximum width, at the start. The room beside it belongs to the application."
              : px > 400
                ? "The same twelve columns, narrower. Every neighbour stands where it stood."
                : "Below the width a column can be read at, the dashboard is a list, in the same order.",
          );
        }}
      >
        {`Open at ${px} px`}
      </Button>
    )),
    rearranging: [
      <Button key="edit" onClick={edit} disabled={parts.editing}>Edit</Button>,
      <Button key="undo" onClick={() => { parts.undo(); setSaid("One step back, not all of them."); }} disabled={!parts.editing}>Undo</Button>,
      <Button key="catalogue" onClick={() => { parts.catalogue(); setSaid("Every widget type with its name, a sentence and the room it takes. A new widget shows something at once and stands at the end."); }} disabled={!parts.editing}>Add a widget</Button>,
      <Button key="done" onClick={() => { parts.done(); setSaid("Only now, and once, the application is told the whole arrangement."); }} disabled={!parts.editing}>Done</Button>,
    ],
    wrong: [
      <Button key="edit" onClick={edit} disabled={parts.editing}>Edit</Button>,
      <Button key="undo" onClick={() => { parts.undo(); setSaid("One step back; what you did before it stays."); }} disabled={!parts.editing}>Undo</Button>,
      <Button key="cancel" onClick={() => { parts.cancel(); setSaid("Everything stands as before \"Edit\". Nothing was reported."); }} disabled={!parts.editing}>Cancel</Button>,
      <Button
        key="leave"
        onClick={() => {
          if (open) setLeaving(true);
          else setSaid("The application navigates. Nothing was open.");
        }}
      >
        Navigate away
      </Button>,
    ],
    governs: [
      <Button key="old" onClick={() => { parts.cancel(); parts.setView(OLD); setSaid("The stored value named a weather widget whose type is not declared and a trend in a size it no longer offers: the weather widget is not drawn and stays in the stored value, the trend stands at its starting size, and the room beside it is free. Nothing broke."); }}>Load an old arrangement</Button>,
      <Button key="crash" onClick={() => { setBroken(true); setSaid("A trend threw while drawing. Its frame, head and menu stand; everything else keeps working."); }}>Let a widget fail</Button>,
      <Button key="reset" onClick={() => { parts.edit(); parts.reset(); setSaid("Back to the application's arrangement for this role - one more step of the draft: Undo brings yours back."); }} disabled={locked}>Reset to the default</Button>,
      <Button key="lock" onClick={() => { parts.cancel(); setLocked(!locked); setSaid(locked ? "Editing is allowed." : "Without editing the dashboard is complete as it is: the same arrangement, no button, no mode."); }}>{locked ? "Allow editing" : "Lock editing"}</Button>,
      <Button
        key="role"
        onClick={() => {
          const next: Role = role === "dispatch" ? "management" : "dispatch";
          parts.cancel();
          setRole(next);
          parts.setView(kept.current[next] ?? ROLES[next]);
          setSaid("Another role, another default. Each role keeps its own value.");
        }}
      >
        {role === "dispatch" ? "Sign in as management" : "Sign in as dispatch"}
      </Button>,
    ],
  };

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={2} wrap data-callout="2">
        {buttons[shown]}
      </Stack>
      <Text data-callout="3" tone="secondary" size="sm" aria-live="polite">{said || INTRO[shown]}</Text>
      {leaving && (
        <Alert
          tone="warning"
          title="Unsaved changes"
          actions={
            <Stack direction="row" gap={2}>
              <Button size="sm" onClick={() => { setLeaving(false); setSaid("The draft is untouched."); }}>Keep editing</Button>
              <Button size="sm" onClick={() => { parts.cancel(); setLeaving(false); setSaid("The draft is gone and the application navigates."); }}>Discard and leave</Button>
            </Stack>
          }
        >
          The library tells the application that a draft is open. What it makes of that is its own business; here it asks.
        </Alert>
      )}
      <div data-callout="4" style={{ overflowX: "auto" }}>
        <div style={{ width: width ?? "100%" }}>
          <Dashboard aria-label="Dispatch, today">
            <HeadingType />
            <WidgetType
              name="figure"
              label="Figure"
              sentence="One number."
              sizes={{ small: { columns: 3, rows: 2 }, medium: { columns: 4, rows: 2 } }}
              start="small"
              defaultOptions={{ name: "Orders" as Figure }}
              title={(options) => options.name}
              form={({ options, change }) => (
                <SegmentedControl
                  aria-label="Figure"
                  options={(Object.keys(FIGURES) as Figure[]).map((name) => ({ value: name, label: name }))}
                  value={options.name}
                  onChange={(name) => change({ name })}
                />
              )}
            >
              {({ options }) => {
                return <Kz {...FIGURES[options.name]} />;
              }}
            </WidgetType>
            <WidgetType
              name="trend"
              label="Trend"
              sentence="A figure over the last seven days."
              sizes={{ wide: { columns: 6, rows: 4 }, large: { columns: 8, rows: 4 } }}
              start="wide"
              defaultOptions={{ name: "Orders" as Figure }}
              title={(options) => `${options.name}, last 7 days`}
            >
              {({ options, size }) => {
                if (broken && options.name === "Orders") throw new Error("The trend could not be drawn");
                return <TrendChart data={TREND[options.name].now} previous={size === "large" ? TREND[options.name].before : undefined} />;
              }}
            </WidgetType>
            <WidgetType name="alerts" label="Open alerts" sentence="What needs attention now." sizes={{ tall: { columns: 4, rows: 4 } }} start="tall" defaultOptions={{}}>
              {() => <Rows rows={ALERTS} />}
            </WidgetType>
            <WidgetType name="orders" label="Orders" sentence="The work in hand." sizes={{ full: { columns: 12, rows: 4 } }} start="full" defaultOptions={{}}>
              {() => <DataTable head={["No.", "Customer", "Quantity", "Status"]} numeric={[2]} rows={ORDERS} />}
            </WidgetType>
          </Dashboard>
        </div>
      </div>
      <Text data-callout="5" size="sm" tone="muted">
        {reports.length === 0 ? "Told to the application: nothing yet." : `Told to the application: ${reports.join("; ")}.`}
      </Text>
    </Stack>
  );
}

export default function ArrangeTheStartScreen() {
  const [current, setCurrent] = useState<Case>("monitors");
  return (
    <Stack gap={4}>
      <div data-callout="1">
        <SegmentedControl aria-label="Case" options={CASES.map((one) => ({ value: one.value, label: one.label }))} value={current} onChange={setCurrent} />
      </div>
      <Stage key={current} shown={current} />
    </Stack>
  );
}
