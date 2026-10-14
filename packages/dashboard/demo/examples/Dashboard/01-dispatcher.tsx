import { useState } from "react";
import { Badge, Stack, Text } from "@umriss-ui/core";
import { useDashboard } from "../../../src";
import type { DashboardView } from "../../../src";

export const title = "The start screen of a dispatcher";
export const lead = "Declare each widget type once, hand over the arrangement for the role: the widgets stand in that order, each at its size.";

const FIGURES = {
  Orders: { value: "1,284", note: "+3.1% on last week", tone: "success" },
  Utilisation: { value: "87.4%", note: "on target", tone: "success" },
  Complaints: { value: "2.9%", note: "just above target", tone: "warning" },
  Backlog: { value: "38", note: "target missed", tone: "danger" },
} as const;

const TREND = {
  Orders: [1180, 1210, 1195, 1240, 1262, 1250, 1284],
  Backlog: [22, 25, 31, 29, 34, 36, 38],
} as const;

const ALERTS = ["Tour 14 is 25 min late", "Dock 3 is out of service", "Customer call: Oakridge Pharmacy"];

const ORDERS = [
  ["A-2041", "Holloway Garden Supplies", "Packed"],
  ["A-2042", "Marlow & Finch Books", "Picking"],
  ["A-2043", "Brixley Cycles", "Late"],
];

const VIEW: DashboardView = {
  widgets: [
    { id: "f1", type: "figure", size: "small", options: { name: "Orders" } },
    { id: "f2", type: "figure", size: "small", options: { name: "Utilisation" } },
    { id: "f3", type: "figure", size: "small", options: { name: "Complaints" } },
    { id: "f4", type: "figure", size: "small", options: { name: "Backlog" } },
    { id: "t1", type: "trend", size: "large", options: { name: "Orders" } },
    { id: "a1", type: "alerts", size: "tall", options: {} },
    { id: "t2", type: "trend", size: "wide", options: { name: "Backlog" } },
    { id: "o1", type: "orders", size: "full", options: {} },
  ],
};

/** A line over its values, drawn to the frame it is in. */
function Line({ values }: { values: readonly number[] }) {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - low) / (high - low || 1)) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" style={{ flex: "1 1 0", minHeight: 0 }} aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

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
    <Dashboard aria-label="Dispatch, today" data-draft={open || undefined} data-kept={kept}>
      <WidgetType
        name="figure"
        label="Figure"
        sentence="One number with its verdict."
        sizes={{ small: { columns: 3, rows: 2 }, medium: { columns: 4, rows: 2 } }}
        start="small"
        defaultOptions={{ name: "Orders" as keyof typeof FIGURES }}
        title={(options) => options.name}
      >
        {({ options, size }) => (
          <Stack gap={1}>
            <Text size={size === "small" ? "xl" : "2xl"} weight="semibold">{FIGURES[options.name].value}</Text>
            <Badge tone={FIGURES[options.name].tone}>{FIGURES[options.name].note}</Badge>
          </Stack>
        )}
      </WidgetType>
      <WidgetType
        name="trend"
        label="Trend"
        sentence="A figure over the last seven days."
        sizes={{ wide: { columns: 6, rows: 4 }, large: { columns: 8, rows: 4 } }}
        start="wide"
        defaultOptions={{ name: "Orders" as keyof typeof TREND }}
        title={(options) => `${options.name}, last 7 days`}
      >
        {({ options, size }) => (
          <Stack gap={2} style={{ height: "100%" }}>
            <Text tone="secondary" size="sm">{size === "large" ? `${options.name}, daily` : options.name}</Text>
            <Line values={TREND[options.name]} />
          </Stack>
        )}
      </WidgetType>
      <WidgetType name="alerts" label="Open alerts" sentence="What needs attention now." sizes={{ tall: { columns: 4, rows: 6 } }} start="tall" defaultOptions={{}}>
        {() => (
          <Stack gap={2}>
            {ALERTS.map((alert) => (
              <Text key={alert} size="sm">{alert}</Text>
            ))}
          </Stack>
        )}
      </WidgetType>
      <WidgetType name="orders" label="Orders" sentence="The work in hand." sizes={{ full: { columns: 12, rows: 4 } }} start="full" defaultOptions={{}}>
        {() => (
          <Stack gap={2}>
            {ORDERS.map(([id, customer, state]) => (
              <Text key={id} size="sm">{`${id}  ${customer}  ${state}`}</Text>
            ))}
          </Stack>
        )}
      </WidgetType>
    </Dashboard>
  );
}
