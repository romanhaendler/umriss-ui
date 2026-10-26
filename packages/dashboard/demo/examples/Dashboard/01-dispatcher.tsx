import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useChart } from "@umriss-ui/charts";
import { FormField, Select, Text } from "@umriss-ui/core";
import { HeadingType, useDashboard } from "../../../src";
import type { DashboardView, HeadingOptions } from "../../../src";

export const title = "The start screen of a dispatcher";
export const lead = "Declare each widget type once, hand over the arrangement for the role: the widgets stand in that order, each at its size.";

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
  "On-time delivery": { value: "96.2", unit: "%", verdict: "ok", note: "on target" },
} as const satisfies Record<string, { value: string; unit: string; verdict: Verdict; note: string }>;

const TREND = {
  Orders: { now: [58, 52, 55, 51, 49, 53, 47, 52, 56, 60, 57, 55, 56, 58, 54, 52, 52, 49, 46, 49, 52, 55, 62, 58, 61, 55, 57, 62], before: [56, 56, 50, 53, 53, 60, 66, 68, 66, 64, 56, 52, 49, 50, 48, 49, 47, 45, 42, 38, 36, 36, 32, 30, 28, 34, 34, 30] },
  Complaints: { now: [66, 72, 70, 62, 55, 62, 68, 54, 55, 58, 50, 52, 48, 51, 49, 47, 47, 47, 47, 58, 59, 52, 50, 53, 58, 60], before: [64, 66, 62, 60, 58, 56, 55, 53, 54, 52, 50, 49, 48, 47, 46, 46, 45, 45, 45, 46, 47, 47, 46, 46, 45, 45] },
} as const;

const ALERTS = [
  { verdict: "bad", text: "Tour 14 is 25 min late", meta: "12 min ago" },
  { verdict: "warn", text: "Dock 3 is out of service", meta: "34 min ago" },
  { verdict: "warn", text: "Call: Oakridge Pharmacy", meta: "1 h ago" },
  { verdict: "warn", text: "Tour 9 left without a sign-off", meta: "1 h ago" },
  { verdict: "bad", text: "Cold chain: bay 2 above 8 degrees", meta: "2 h ago" },
  { verdict: "warn", text: "Pallet A-2043 has no label", meta: "2 h ago" },
  { verdict: "ok", text: "Maintenance on line 3 finished", meta: "2 h ago" },
  { verdict: "ok", text: "Tour 6 is back, 10 min early", meta: "3 h ago" },
  { verdict: "warn", text: "Call: Elmstead Surgery", meta: "3 h ago" },
] as const satisfies ReadonlyArray<{ verdict: Verdict; text: string; meta: string }>;

const ORDERS = [
  ["A-2041", "Holloway Co", "120", "Packed"],
  ["A-2042", "Marlow Books", "490", "Picking"],
  ["A-2043", "Brixley Bikes", "860", "Late"],
  ["A-2044", "Ferrow Bakery", "75", "Planned"],
];

const heading = (id: string, text: string) => ({ id, type: "heading", size: "full" as const, options: { text } satisfies HeadingOptions });

const VIEW: DashboardView = {
  widgets: [
    heading("h1", "Overview"),
    { id: "f1", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "f2", type: "figure", size: "small", options: { name: "Utilisation" } },
    { id: "f3", type: "figure", size: "small", options: { name: "Complaints" } },
    { id: "f4", type: "figure", size: "small", options: { name: "On-time delivery" } },
    heading("h2", "Trend"),
    { id: "t1", type: "trend", size: "large", options: { name: "Orders" } },
    { id: "t2", type: "trend", size: "wide", options: { name: "Complaints" } },
    heading("h3", "Work in hand"),
    { id: "o1", type: "orders", size: "wide", options: {} },
    { id: "a1", type: "alerts", size: "tall", options: {} },
  ],
};

export default function Dispatcher() {
  const [open, setOpen] = useState(false);
  const [kept, setKept] = useState(0);
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: VIEW,
    allowEdit: true,
    onDraftChange: setOpen,
    onViewChange: () => setKept((count) => count + 1),
  });
  return (
    <Dashboard headingLevel={4} aria-label="Dispatch, today" catalogue={["figure", "trend", "alerts"]} data-draft={open || undefined} data-kept={kept}>
      <HeadingType />
      <WidgetType
        name="figure"
        label="Figure"
        sentence="One number with its verdict."
        sizes={{ small: { columns: 3, rows: 2 }, medium: { columns: 4, rows: 2 } }}
        start="small"
        defaultOptions={{ name: "Orders" as keyof typeof FIGURES }}
        title={(options) => options.name}
        form={({ options, change }) => (
          <FormField label="Figure">
            <Select value={options.name} onChange={(event) => change({ name: event.target.value as keyof typeof FIGURES })}>
              {Object.keys(FIGURES).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </Select>
          </FormField>
        )}
      >
        {({ options }) => <Kz {...FIGURES[options.name]} />}
      </WidgetType>
      <WidgetType
        name="trend"
        label="Trend"
        sentence="A figure over the last weeks."
        sizes={{ wide: { columns: 4, rows: 4 }, large: { columns: 8, rows: 4 } }}
        start="wide"
        defaultOptions={{ name: "Orders" as keyof typeof TREND }}
        title={(options) => `${options.name} trend`}
      >
        {({ options, size }) => <TrendChart data={TREND[options.name].now} previous={size === "large" ? TREND[options.name].before : undefined} />}
      </WidgetType>
      <WidgetType name="alerts" label="Open alerts" sentence="What needs attention now." sizes={{ tall: { columns: 4, rows: 4 } }} start="tall" defaultOptions={{}}>
        {() => <Rows rows={ALERTS} />}
      </WidgetType>
      <WidgetType name="orders" label="Orders" sentence="The work in hand." sizes={{ wide: { columns: 8, rows: 4 }, full: { columns: 12, rows: 4 } }} start="wide" defaultOptions={{}}>
        {() => <DataTable head={["No.", "Customer", "Qty", "Status"]} numeric={[2]} rows={ORDERS} />}
      </WidgetType>
    </Dashboard>
  );
}
