import { useState } from "react";
import { Card, CardBody, CardHeader, Stack, Text } from "../../src";
import { LimitBand, LimitLine, Tooltip, useChart } from "@umriss-ui/charts";
import { useTable } from "@umriss-ui/table";
import { useSchedule } from "@umriss-ui/schedule";
import type { Subtask, Task } from "@umriss-ui/schedule";

/* Data from the plant world, written out here so the example runs on its own. */

/** The early shift begins at 06:00 on a day of its own, so the page is the same on every run. */
const START = new Date(2026, 2, 17, 6, 0).getTime();
const MIN = 60_000;
const at = (minute: number) => START + minute * MIN;
const SHIFT_MINUTES = 480;

/** A batch of tiles through the kiln. */
export interface Batch {
  id: string;
  name: string;
  product: string;
  tiles: number;
  /** Instants, in milliseconds. */
  from: number;
  to: number;
}

const BATCHES: readonly Batch[] = [
  { id: "b-4121", name: "B-4121", product: "Floor tile, grey", tiles: 280, from: at(0), to: at(75) },
  { id: "b-4122", name: "B-4122", product: "Floor tile, sand", tiles: 300, from: at(80), to: at(150) },
  { id: "b-4123", name: "B-4123", product: "Wall tile, white", tiles: 320, from: at(155), to: at(235) },
  { id: "b-4124", name: "B-4124", product: "Floor tile, grey", tiles: 260, from: at(245), to: at(310) },
  { id: "b-4125", name: "B-4125", product: "Wall tile, white", tiles: 320, from: at(315), to: at(395) },
  { id: "b-4126", name: "B-4126", product: "Floor tile, sand", tiles: 300, from: at(400), to: at(475) },
];

/** The batch that ran at the instant: both ends belong to it, a gap between two batches to none. */
export function batchAt(batches: readonly Batch[], instant: number): Batch | undefined {
  return batches.find((batch) => batch.from <= instant && instant <= batch.to);
}

const clock = (instant: number) => new Date(instant).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/** Zone 3 of the kiln every five minutes, in °C: it holds near 1200 while a batch is in and cools between batches. */
const TREND = Array.from({ length: SHIFT_MINUTES / 5 }, (_, i) => {
  const t = at(i * 5);
  const loaded = batchAt(BATCHES, t) !== undefined;
  return { t, kiln: Math.round((loaded ? 1200 + 9 * Math.sin(i / 3) : 1176 + 4 * Math.sin(i / 2)) * 10) / 10 };
});

const TASKS: readonly Task[] = BATCHES.map((batch) => ({ id: batch.id, name: batch.name, color: "var(--u-color-text-secondary)" }));
const STEPS: readonly Subtask[] = BATCHES.map((batch) => ({ id: `${batch.id}-kiln`, task: batch.id, lane: "kiln", from: batch.from, to: batch.to }));

export const title = "Trace a batch through the shift";

export const lead =
  "A line lead looks into one batch: choose it in the list, in the plan or in the kiln's trend, and the other two show the same batch.";

export const callouts = [
  "Enter on a batch's name chooses it, as a click anywhere on its row does. The table marks the row it was told is current and keeps nothing itself.",
  "The plan selects the same batch. Choosing a bar there moves the table's mark and the band in the trend.",
  "The trend draws the batch's stretch as a band of its own; choosing a point of the trend (a click, or Enter on the Active point) chooses the batch that ran at that instant.",
  "The batch is one value in this scenario's state. Each view takes it by a prop it has and hands it back by a handler it has; no view knows the others.",
];

export const builtFrom = [
  { name: "Table", page: "@umriss-ui/table#first-table" },
  { name: "Schedule", page: "@umriss-ui/schedule#schedule" },
  { name: "Line", page: "@umriss-ui/charts#line" },
  { name: "LimitLine", page: "@umriss-ui/charts#limitline" },
  { name: "LimitBand", page: "@umriss-ui/charts#limitline" },
];

/* The key is the batch id, and only this state holds it. */
export default function TraceABatch() {
  const [batch, setBatch] = useState<string | null>(null);
  const chosen = BATCHES.find((one) => one.id === batch);

  const { Table, Column } = useTable(BATCHES, { rowKey: (b) => b.id });
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: [at(-10), at(SHIFT_MINUTES + 10)] } });
  const trend = useChart(TREND, {
    onSelect: (hit) => {
      const found = batchAt(BATCHES, hit.xValue);
      if (found !== undefined) setBatch(found.id);
    },
  });

  return (
    <Stack gap={4}>
      <Text data-callout="4">{chosen === undefined ? "No batch chosen" : `Batch ${chosen.name}, ${clock(chosen.from)} to ${clock(chosen.to)}`}</Text>

      <Card data-callout="1">
        <CardHeader title="Batches of the shift" />
        <CardBody>
          <Table aria-label="Batches of the early shift" currentRow={batch} onCurrentRowChange={(key) => setBatch(key)}>
            <Column value="name" label="Batch" rowHeader />
            <Column value="product" label="Product" />
            <Column value="tiles" label="Tiles" numeric />
            <Column id="kiln" label="In the kiln" value={(b) => b.from}>
              {(_, b) => `${clock(b.from)} - ${clock(b.to)}`}
            </Column>
          </Table>
        </CardBody>
      </Card>

      <Card data-callout="2">
        <CardHeader title="Plan" />
        <CardBody>
          <Schedule
            aria-label="Plan of the early shift: the kiln"
            height={120}
            selectedTask={batch}
            onSelectedTaskChange={(task) => setBatch(task)}
            label={(subtask) => BATCHES.find((one) => one.id === subtask.task)?.name ?? subtask.task}
          >
            <Lane id="kiln" label="Kiln K1" />
            <Subtasks data={STEPS} tasks={TASKS} />
          </Schedule>
        </CardBody>
      </Card>

      <Card data-callout="3">
        <CardHeader title="Kiln trend" />
        <CardBody>
          <trend.Chart height={240} aria-label="Kiln K1, zone 3, over the shift">
            <trend.XAxis value="t" domain={[at(0), at(SHIFT_MINUTES)]} time />
            <trend.YAxis domain={[1160, 1220]} label="°C" />
            <LimitLine value={1200} severity="warning" label="Target" />
            {chosen !== undefined && <LimitBand orientation="x" from={chosen.from} to={chosen.to} label={chosen.name} />}
            <trend.Line value="kiln" name="Zone 3" format={(v) => `${v.toFixed(1)} °C`} />
            <Tooltip mode="x" />
          </trend.Chart>
        </CardBody>
      </Card>
    </Stack>
  );
}
