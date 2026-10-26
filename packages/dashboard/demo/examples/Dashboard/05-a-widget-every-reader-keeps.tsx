import { useState } from "react";
import { FormField, Select, Stack, Text } from "@umriss-ui/core";
import { useDashboard } from "../../../src";
import type { DashboardView, WidgetSize } from "../../../src";

export const title = "A widget every reader keeps";
export const lead = "The application marks a widget of the default view as locked. In the editing mode the reader moves it like any other, but cannot remove it, resize it or change its options, and its menu says why. A lock lives in the view, so an arrangement a reader kept before the lock lacks it. The library does not merge the lock in: only the application knows whether a widget a kept view lacks was removed before the lock or must come back. Its function below sets the lock and puts a missing widget back at the start. A size the reader chose before the lock stays, since a lock keeps a size and does not choose one.";

const SUMMARY = "safety";

/* The figure type, declared once: a summary the kept view lacks starts with the type's starting size and default options. */
const FIGURE_DEFAULTS = { name: "Figure", value: "0", note: "" };
const FIGURE = { start: "small" as WidgetSize, defaultOptions: FIGURE_DEFAULTS };

const VIEW: DashboardView = {
  widgets: [
    { id: SUMMARY, type: "figure", size: "wide", options: { name: "Safety", value: "0 incidents", note: "Last 30 days" }, locked: true },
    { id: "orders", type: "figure", size: "small", options: { name: "Orders", value: "128", note: "Today" } },
    { id: "late", type: "figure", size: "small", options: { name: "Late tours", value: "3", note: "Of 41" } },
  ],
};

/* Kept before the lock: the summary is there, unlocked, at a small size, between the other two. */
const KEPT_BEFORE_LOCK: DashboardView = {
  widgets: [
    { id: "orders", type: "figure", size: "small", options: { name: "Orders", value: "128", note: "Today" } },
    { id: SUMMARY, type: "figure", size: "small", options: { name: "Safety", value: "0 incidents", note: "Last 30 days" } },
    { id: "late", type: "figure", size: "small", options: { name: "Late tours", value: "3", note: "Of 41" } },
  ],
};

/* Kept without the summary at all: it was removed before the lock. */
const KEPT_WITHOUT_SUMMARY: DashboardView = {
  widgets: [
    { id: "orders", type: "figure", size: "small", options: { name: "Orders", value: "128", note: "Today" } },
    { id: "late", type: "figure", size: "small", options: { name: "Late tours", value: "3", note: "Of 41" } },
  ],
};

const KEPT = { "The default view": VIEW, "Kept before the lock": KEPT_BEFORE_LOCK, "Kept without the summary": KEPT_WITHOUT_SUMMARY };
type Kept = keyof typeof KEPT;

/* The application's function, run before `initialView`: the summary is locked wherever the kept view has it, and a view that lacks it gets it back at the start. */
function withLock(kept: DashboardView): DashboardView {
  const widgets = kept.widgets.map((widget) => (widget.id === SUMMARY ? { ...widget, locked: true } : widget));
  if (widgets.some((widget) => widget.id === SUMMARY)) return { widgets };
  return { widgets: [{ id: SUMMARY, type: "figure", size: FIGURE.start, options: FIGURE.defaultOptions, locked: true }, ...widgets] };
}

/* A new dashboard per kept arrangement: `initialView` is read once, so the choice remounts it. */
function Start({ kept }: { kept: DashboardView }) {
  const { Dashboard, WidgetType, view } = useDashboard({ defaultView: VIEW, initialView: withLock(kept) });
  const summary = view.widgets.find((widget) => widget.id === SUMMARY);
  return (
    <Stack gap={2}>
      <Dashboard aria-label="Start">
        <WidgetType
          name="figure"
          label="Figure"
          sentence="One number with a note."
          sizes={{ small: { columns: 3, rows: 2 }, wide: { columns: 6, rows: 2 } }}
          start={FIGURE.start}
          defaultOptions={FIGURE.defaultOptions}
          title={(options: { name: string }) => options.name}
        >
          {({ options }: { options: { value: string; note: string } }) => (
            <Stack gap={1}>
              <Text as="div" size="2xl" weight="semibold">{options.value}</Text>
              <Text size="sm" tone="secondary">{options.note}</Text>
            </Stack>
          )}
        </WidgetType>
      </Dashboard>
      <Text size="sm" tone="secondary">{summary?.locked ? "The summary is locked." : "The summary is not locked."}</Text>
    </Stack>
  );
}

export default function Locked() {
  const [choice, setChoice] = useState<Kept>("The default view");
  return (
    <Stack gap={4}>
      <FormField label="The arrangement the reader kept">
        <Select value={choice} onChange={(event) => setChoice(event.target.value as Kept)}>
          {(Object.keys(KEPT) as Kept[]).map((name) => (
            <option key={name}>{name}</option>
          ))}
        </Select>
      </FormField>
      <Start key={choice} kept={KEPT[choice]} />
    </Stack>
  );
}
