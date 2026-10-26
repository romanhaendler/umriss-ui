import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Stack, Text } from "../../src";
import { LimitBand, LimitLine, Tooltip, useChart } from "@umriss-ui/charts";
import type { ChartRange } from "@umriss-ui/charts";
import { rowFilter, useTable } from "@umriss-ui/table";

/* Data from the plant world, written out here so the example runs on its own. */

/** The early shift begins at 06:00 on a day of its own, so the page is the same on every run. */
const START = new Date(2026, 2, 17, 6, 0).getTime();
const MIN = 60_000;
const at = (minute: number) => START + minute * MIN;
const SHIFT_MINUTES = 480;

/** One alarm of the shift. */
export interface Alarm {
  id: string;
  /** The instant it was raised, in milliseconds. */
  raised: number;
  priority: "high" | "medium" | "low";
  message: string;
}

const ALARMS: readonly Alarm[] = [
  { id: "a-1", raised: at(12), priority: "low", message: "Dryer D1 · fan vibration high" },
  { id: "a-2", raised: at(48), priority: "medium", message: "Kiln K1 · belt empty" },
  { id: "a-3", raised: at(95), priority: "medium", message: "Kiln K1 · exit pyrometer sends nothing" },
  { id: "a-4", raised: at(150), priority: "high", message: "Kiln K1 · zone 3 above alarm limit" },
  { id: "a-5", raised: at(172), priority: "medium", message: "Kiln K1 · belt empty" },
  { id: "a-6", raised: at(205), priority: "low", message: "Dryer D1 · fan vibration high" },
  { id: "a-7", raised: at(250), priority: "high", message: "Kiln K1 · zone 3 above alarm limit" },
  { id: "a-8", raised: at(288), priority: "medium", message: "Kiln K1 · exit pyrometer sends nothing" },
  { id: "a-9", raised: at(340), priority: "low", message: "Dryer D1 · fan vibration high" },
  { id: "a-10", raised: at(401), priority: "medium", message: "Kiln K1 · belt empty" },
  { id: "a-11", raised: at(455), priority: "high", message: "Kiln K1 · zone 3 above alarm limit" },
];

/** Zone 3 of the kiln every five minutes, in °C; it runs hot around the high alarms of the shift. */
const TREND = Array.from({ length: SHIFT_MINUTES / 5 + 1 }, (_, i) => {
  const near = ALARMS.some((alarm) => alarm.priority === "high" && Math.abs(alarm.raised - at(i * 5)) <= 15 * MIN);
  return { t: at(i * 5), kiln: Math.round((1200 + 6 * Math.sin(i / 3) + (near ? 24 : 0)) * 10) / 10 };
});

/** A stretch of the shift, in milliseconds. */
export type Stretch = Pick<ChartRange<number>, "from" | "to">;

/** Whether the instant lies in the stretch; both ends belong to it. */
export function within(instant: number, stretch: Stretch): boolean {
  return stretch.from <= instant && instant <= stretch.to;
}

/** The alarms the stretch holds; no stretch holds them all. */
export function alarmsIn(alarms: readonly Alarm[], stretch: Stretch | null): readonly Alarm[] {
  return stretch === null ? alarms : alarms.filter((alarm) => within(alarm.raised, stretch));
}

/* A condition from outside the table: the table keeps the stretch like a
   filter of its own and shows only the rows it admits. */
const IN_STRETCH = rowFilter<Alarm, Stretch>({
  id: "stretch",
  label: "Stretch",
  matches: (alarm, stretch) => within(alarm.raised, stretch),
});

const clock = (instant: number) => new Date(instant).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export const title = "Mark a stretch of the shift";

export const lead =
  "A line lead looks at the kiln's trend over the shift, marks the stretch where it ran hot, and the table below shows the alarms of that stretch.";

export const callouts = [
  "A drag over the trend marks a stretch, and so do Space, a walk with the arrow keys and Space again once the trend has focus. The chart reports the stretch once, when the reader lets go.",
  "The table shows only the alarms raised inside the stretch, both ends included.",
  "The count says how many of the shift's alarms the stretch holds and from when to when.",
  "Clear the stretch brings every alarm back. The chart and the table know nothing of each other: the stretch is one value in this scenario's state, and the band in the trend is drawn from it.",
];

export const builtFrom = [
  { name: "Line", page: "@umriss-ui/charts#line" },
  { name: "LimitBand", page: "@umriss-ui/charts#limitline" },
  { name: "Table", page: "@umriss-ui/table#first-table" },
];

export default function MarkAStretch() {
  const [stretch, setStretch] = useState<Stretch | null>(null);
  const t = useTable(ALARMS, { rowKey: (a) => a.id, rowFilters: [IN_STRETCH] });
  const { Table, Column } = t;

  const mark = (next: Stretch | null) => {
    setStretch(next);
    t.setFilter(IN_STRETCH, next);
  };
  const trend = useChart(TREND, { onRange: ({ from, to }) => mark({ from, to }) });

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={4} align="center" wrap>
        <Text data-callout="3">
          {stretch === null
            ? `All ${ALARMS.length} alarms of the shift`
            : `${alarmsIn(ALARMS, stretch).length} of ${ALARMS.length} alarms between ${clock(stretch.from)} and ${clock(stretch.to)}`}
        </Text>
        <Button size="sm" data-callout="4" disabled={stretch === null} onClick={() => mark(null)}>
          Clear the stretch
        </Button>
      </Stack>

      <Card data-callout="1">
        <CardHeader title="Kiln trend" />
        <CardBody>
          <trend.Chart height={240} aria-label="Kiln K1, zone 3, over the shift">
            <trend.XAxis value="t" domain={[at(0), at(SHIFT_MINUTES)]} time />
            <trend.YAxis domain={[1180, 1250]} label="°C" />
            <LimitLine value={1215} severity="warning" label="Warning limit" />
            {stretch !== null && <LimitBand orientation="x" from={stretch.from} to={stretch.to} label="Stretch" />}
            <trend.Line value="kiln" name="Zone 3" format={(v) => `${v.toFixed(1)} °C`} />
            <Tooltip mode="x" />
          </trend.Chart>
        </CardBody>
      </Card>

      <Card data-callout="2">
        <CardHeader title="Alarms" />
        <CardBody>
          <Table aria-label="Alarms of the early shift">
            <Column value="raised" label="Raised" numeric>
              {(raised) => clock(raised)}
            </Column>
            <Column value="priority" label="Priority">
              {(priority) => <Badge tone={priority === "high" ? "danger" : priority === "medium" ? "warning" : "neutral"}>{priority}</Badge>}
            </Column>
            <Column value="message" label="Alarm" rowHeader />
          </Table>
        </CardBody>
      </Card>
    </Stack>
  );
}
