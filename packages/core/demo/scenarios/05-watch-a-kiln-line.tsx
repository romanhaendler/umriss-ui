import { useEffect, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Drawer,
  Grid,
  Link,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ProgressBar,
  Stack,
  Stat,
  Text,
} from "../../src";
import type { FreshnessAges } from "../../src";
import { Chart, ControlChart, DataTable, LimitBand, LimitLine, Line, Tooltip, XAxis, YAxis } from "@umriss-ui/charts";
import { AlarmList, alarmModel, isHiddenFromOperation, useTableSelection } from "@umriss-ui/table";
import { Lane, Schedule, Subtasks } from "@umriss-ui/schedule";
import type { Subtask, Task } from "@umriss-ui/schedule";
import { Calculation, Difference, Given, Product, Quotient, Ref } from "@umriss-ui/calculation";
import {
  ALARM_TYPES,
  IDEAL_CYCLE_MINUTES,
  KILN,
  KILN_LIMITS,
  SHIFT_MINUTES,
  alarmsAt,
  countAt,
  exitSilence,
  plant,
  upTo,
} from "../plant";
import type { Batch, Sample } from "../plant";

export const title = "Watch a kiln line over a shift";

export const lead =
  "A line lead keeps this screen open through the shift: the trend, the alarms, the plan and the OEE read the same minute.";

export const callouts = [];

export const builtFrom = ["stat", "drawer", "progressbar", { name: "Line", page: "@umriss-ui/charts#line" }, { name: "ControlChart", page: "@umriss-ui/charts#controlchart" }, { name: "AlarmList", page: "@umriss-ui/table#alarmlist" }, { name: "Schedule", page: "@umriss-ui/schedule#schedule" }, { name: "Calculation", page: "@umriss-ui/calculation#calculation" }];

/* The plant stands in the second tab: one shift, and every part below reads
   from it. */
export const shows = ["../plant.ts"];

/* Every package on one page, fed by one plant. The kiln's excursion is the
   line above the limit in the trend, the alarm in the list, the scrap in the
   OEE and the points the control chart marks - because each reads the same
   minute, and none is told about the others.

   The shift runs: one plant minute per second, from a few minutes after the
   kiln crossed its alarm limit, while the alarm stands. It stands still under
   `prefers-reduced-motion`, and Pause stops it for everybody else - a page
   that updates on its own for minutes owes its reader a way to stop it.
   The clock advances by what the wall clock says has passed, so a page whose
   clock is frozen (the screenshot suite freezes it) stands still there and
   is the same picture on every run.

   Every part keeps its own keyboard model; the page adds a landmark per
   region and a row of skip links to reach each one. */

const SHIFT = plant(17);
const CROSSING = SHIFT.readings.find((one) => one.kiln > KILN.alarm)!.minute;
const LAST = SHIFT_MINUTES - 1;
const SECOND = 1000;
const MIN = 60_000;
/* The shift begins at 06:00 today; everything below counts from there. */
const START = new Date(new Date().setHours(6, 0, 0, 0)).getTime();
const at = (minute: number) => START + minute * MIN;

const AGES: FreshnessAges = { stale: 5 * MIN, lost: 30 * MIN };

const OEE_TARGET = 0.85;

/* The OEE is read against its own rule: a target, and two limits below it. */
const OEE_LIMITS = {
  target: OEE_TARGET * 100,
  limits: [
    { value: 75, side: "lower", severity: "warning" },
    { value: 65, side: "lower", severity: "alarm" },
  ],
} as const;

/* The tile's length after firing is specified at 600 ± 1.5 mm; the control
   limits come out of the first two hours, when the kiln demonstrably ran in
   control. */
const REFERENCE = { kind: "referenceWindow", from: 0, to: 12 } as const;

const LANES = [
  { id: "press", label: "Press P1" },
  { id: "dryer", label: "Dryer D1" },
  { id: "kiln", label: "Kiln K1" },
] as const;

/* Batches are drawn in one neutral colour: they differ by name, not by a hue
   that would have to mean something (ISA-101). */
const TASKS: readonly Task[] = SHIFT.batches.map((batch) => ({
  id: batch.id,
  name: batch.name,
  color: "var(--u-color-text-secondary)",
}));

const STEPS: readonly Subtask[] = SHIFT.batches.flatMap((batch) =>
  LANES.map((lane) => ({
    id: `${batch.id}-${lane.id}`,
    task: batch.id,
    lane: lane.id,
    from: at(batch[lane.id][0]),
    to: at(batch[lane.id][1]),
  })),
);

/* The batch number written into every bar, as the schedule's "Bar labels"
   example writes the order. */
const BATCH_NAMES = new Map(SHIFT.batches.map((batch) => [batch.id, batch.name]));

const PLAN_DOMAIN: readonly [number, number] = [at(-75), at(SHIFT_MINUTES + 30)];

type Point = { t: number; kiln: number };
type Measured = Sample & { t: number };

const inKiln = (minute: number): Batch | undefined =>
  SHIFT.batches.find((batch) => batch.kiln[0] <= minute && minute < batch.kiln[1]);

/* The room opens six minutes or so after the crossing, at the first minute a
   batch is in the kiln: the alarm stands, and there is a batch to look at. */
const FROM = SHIFT.readings.find((one) => one.minute >= CROSSING + 6 && inKiln(one.minute) !== undefined)!.minute;

/** The plant's clock: a minute per second while it runs, never past the end
    of the shift, and never on its own when the wall clock stands still. */
function usePlantMinute(): { minute: number; wall: number; running: boolean; setRunning: (running: boolean) => void } {
  /* The minute and the wall-clock instant it was reached at, together: a
     reading taken now is as old as the wall says, not as the plant does.
     Paused, no reading comes in, and the tiles age on the wall as they would
     at a plant whose data stopped. */
  const [{ minute, wall }, setClock] = useState(() => ({ minute: FROM, wall: Date.now() }));
  const [running, setRunning] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (!running) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const steps = Math.floor((Date.now() - last) / SECOND);
      if (steps === 0) return;
      last += steps * SECOND;
      const reached = last;
      setClock((clock) => ({ minute: Math.min(LAST, clock.minute + steps), wall: reached }));
    }, SECOND / 4);
    return () => clearInterval(timer);
  }, [running]);

  return { minute, wall, running: running && minute < LAST, setRunning };
}

/** A region of the room: a landmark with its name, and the place a skip link
    lands. `quiet` keeps the name for the landmark and leaves the header out,
    where the content shows a heading of its own. */
function Region({
  id,
  title,
  quiet = false,
  actions,
  children,
}: {
  id: string;
  title: string;
  quiet?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) {
  /* Where a skip link landed shows the library's ring, over the card's own
     shadow - a card has no focus style of its own, being no control. */
  const [landed, setLanded] = useState(false);
  return (
    <Card
      id={id}
      aria-labelledby={quiet ? undefined : `${id}-title`}
      aria-label={quiet ? title : undefined}
      tabIndex={-1}
      onFocus={(event) => setLanded(event.target === event.currentTarget)}
      onBlur={() => setLanded(false)}
      style={{ outline: "none", boxShadow: landed ? "var(--u-focus-ring), var(--u-shadow-card)" : undefined }}
    >
      {!quiet && <CardHeader title={<span id={`${id}-title`}>{title}</span>} actions={actions} />}
      <CardBody>{children}</CardBody>
    </Card>
  );
}

const REGIONS = [
  { id: "room-status", title: "Line status" },
  { id: "room-trend", title: "Kiln trend" },
  { id: "room-alarms", title: "Alarms" },
  { id: "room-quality", title: "Tile length" },
  { id: "room-plan", title: "Plan" },
  { id: "room-oee", title: "OEE so far" },
] as const;

/* A skip link moves the focus and not the address: the demo keeps its page in
   the address, and a fragment there would leave it. */
function skipTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  const region = document.getElementById(id);
  region?.focus();
  region?.scrollIntoView({ block: "start" });
}

export default function ControlRoom() {
  const { minute, wall, running, setRunning } = usePlantMinute();
  const now = at(minute);
  const reading = SHIFT.readings[minute]!;

  const [acknowledged, setAcknowledged] = useState<ReadonlyMap<string, number>>(new Map());
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [batch, setBatch] = useState<string | null>(() => inKiln(FROM)?.id ?? null);
  const [details, setDetails] = useState(false);

  const trend = useMemo<Point[]>(
    () => upTo(SHIFT.readings, minute).map((one) => ({ t: at(one.minute), kiln: one.kiln })),
    [minute],
  );
  const measured = useMemo<Measured[]>(
    () => upTo(SHIFT.samples, minute).map((one) => ({ ...one, t: at(one.minute) })),
    [minute],
  );
  const alarms = useMemo(
    () =>
      alarmModel(
        { alarms: alarmsAt(SHIFT, minute, START, acknowledged), types: ALARM_TYPES, asOf: now },
        hiddenOnly ? { filter: (row) => isHiddenFromOperation(row.availability) } : {},
      ),
    [minute, now, acknowledged, hiddenOnly],
  );
  const selection = useTableSelection(alarms.filtered.map((row) => row.id));

  const count = countAt(SHIFT, minute);
  const oee = (IDEAL_CYCLE_MINUTES * count.good) / count.planned;
  const current = inKiln(minute);
  const inTheKiln = current === undefined ? "No batch in the kiln" : `${current.name} through the kiln`;
  const chosen = SHIFT.batches.find((one) => one.id === batch);

  /* The tile's freshness is told the plant's age of the reading, as the
     instant it was true on the wall clock: the plant's minutes run faster
     than the wall's, and a tile judges age against the wall. */
  const silence = exitSilence(SHIFT, minute);
  const exit = SHIFT.readings[minute - silence]?.exit ?? null;

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={4} align="center" wrap>
        <Text mono>
          {new Date(now).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </Text>
        <Button size="sm" disabled={minute === LAST} onClick={() => setRunning(!running)}>
          {running ? "Pause the shift" : "Run the shift"}
        </Button>
        <Text as="nav" size="sm" aria-label="Regions of the control room">
          <Stack direction="row" gap={3} wrap>
            {REGIONS.map((region) => (
              <Link key={region.id} size="sm" href={`#${region.id}`} onClick={(event) => skipTo(event, region.id)}>
                {region.title}
              </Link>
            ))}
          </Stack>
        </Text>
      </Stack>

      <Region id="room-status" title="Line status">
        <Grid minItemWidth="200px" gap={4}>
          <Stat
            label="Kiln K1 · zone 3"
            value={reading.kiln}
            unit="°C"
            decimals={1}
            limits={KILN_LIMITS}
            history={trend.slice(-30).map((one) => one.kiln)}
            asOf={wall}
            ages={AGES}
          />
          <Stat
            label="Kiln K1 · exit"
            value={exit}
            unit="°C"
            decimals={1}
            asOf={wall - silence * MIN}
            ages={AGES}
          />
          <Stat label="OEE so far" value={oee * 100} unit="%" decimals={1} limits={OEE_LIMITS} />
          <Stack gap={2}>
            <Text size="sm" tone="muted">
              {inTheKiln}
            </Text>
            <ProgressBar
              label={inTheKiln}
              value={current === undefined ? 0 : (minute - current.kiln[0]) / (current.kiln[1] - current.kiln[0])}
              showLabel
            />
            <Text size="sm" tone="muted">
              The early shift, 06:00 to 14:00
            </Text>
            <ProgressBar label="The early shift" value={(minute + 1) / SHIFT_MINUTES} showLabel />
          </Stack>
        </Grid>
      </Region>

      <Region id="room-trend" title="Kiln trend">
        <Chart data={trend} height={240} ariaLabel="Kiln K1, zone 3, over the shift">
          <XAxis accessor={(d: Point) => d.t} domain={[at(0), at(LAST)]} time />
          <YAxis accessor={(d: Point) => d.kiln} domain={[1170, 1250]} label="°C" />
          <LimitBand from={KILN.tolerance[0]} to={KILN.tolerance[1]} severity="warning" label="Tolerance" />
          <LimitLine value={KILN.alarm} severity="alarm" label="Alarm limit" />
          <Line accessor={(d: Point) => d.kiln} name="Zone 3" format={(v) => `${v.toFixed(1)} °C`} />
          <Tooltip mode="x" />
          <DataTable />
        </Chart>
      </Region>

      <Region id="room-alarms" title="Alarms" quiet>
        <AlarmList
          view={alarms}
          selection={selection}
          density="compact"
          hiddenOnly={hiddenOnly}
          onHiddenOnlyChange={setHiddenOnly}
          onAcknowledge={(ids) => {
            setAcknowledged((before) => new Map([...before, ...ids.map((id) => [id, now] as const)]));
            selection.clear();
          }}
        />
      </Region>

      <Region id="room-quality" title="Tile length">
        <Chart data={measured} height={220} ariaLabel="Tile length after firing, individuals chart">
          <XAxis accessor={(d: Measured) => d.t} domain={[at(0), at(LAST)]} time />
          <YAxis accessor={(d: Measured) => d.length} domain={[597, 602]} label="mm" />
          <LimitLine value={601.5} severity="alarm" label="USL" />
          <LimitLine value={598.5} severity="alarm" label="LSL" />
          <ControlChart
            accessor={(d: Measured) => d.length}
            data={measured}
            origin={REFERENCE}
            name="Length"
            labelUpper="UCL"
            labelLower="LCL"
            violationName="Length - rule violation"
          />
          <Tooltip mode="x" />
        </Chart>
      </Region>

      <Region
        id="room-plan"
        title="Plan"
        actions={
          <Button size="sm" disabled={chosen === undefined} onClick={() => setDetails(true)}>
            {chosen === undefined ? "Choose a batch" : `Details of ${chosen.name}`}
          </Button>
        }
      >
        <Schedule
          ariaLabel="Plan of the early shift: press, dryer and kiln"
          initialDomain={PLAN_DOMAIN}
          height={196}
          now={now}
          selectedTask={batch}
          onSelectedTaskChange={(task) => setBatch(task)}
          label={(subtask) => BATCH_NAMES.get(subtask.task) ?? subtask.task}
        >
          {LANES.map((lane) => (
            <Lane key={lane.id} id={lane.id} label={lane.label} />
          ))}
          <Subtasks data={STEPS} tasks={TASKS} />
        </Schedule>
      </Region>

      <Region id="room-oee" title="OEE so far">
        <Calculation aria-label="OEE of the shift so far">
          <Product label="OEE" format="percent" target={OEE_TARGET}>
            <Quotient label="Availability" format="percent">
              <Difference id="runtime" label="Run time" unit="min">
                <Given id="planned" label="Planned production time" value={count.planned} unit="min" />
                <Given label="Downtime" value={count.downtime} unit="min" />
              </Difference>
              <Ref to="planned" />
            </Quotient>
            <Quotient label="Performance" format="percent">
              <Product label="Ideal run time" unit="min">
                <Given label="Ideal cycle time" value={IDEAL_CYCLE_MINUTES} unit="min/pc" />
                <Given id="total" label="Total count" value={count.total} unit="pcs" />
              </Product>
              <Ref to="runtime" />
            </Quotient>
            <Quotient label="Quality" format="percent">
              <Given label="Good count" value={count.good} unit="pcs" />
              <Ref to="total" />
            </Quotient>
          </Product>
        </Calculation>
      </Region>

      <Drawer open={details} onClose={() => setDetails(false)}>
        {chosen !== undefined && <BatchDetails batch={chosen} minute={minute} onClose={() => setDetails(false)} />}
      </Drawer>
    </Stack>
  );
}

/** A batch, as far as the kiln has fired it. */
function BatchDetails({ batch, minute, onClose }: { batch: Batch; minute: number; onClose: () => void }) {
  const fired = upTo(SHIFT.readings, minute).filter((one) => batch.kiln[0] <= one.minute && one.minute < batch.kiln[1]);
  const total = fired.reduce((sum, one) => sum + one.fired, 0);
  const good = fired.reduce((sum, one) => sum + one.good, 0);
  const time = (m: number) => new Date(at(m)).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <ModalHeader
        title={`Batch ${batch.name}`}
        description={`In the kiln from ${time(batch.kiln[0])} to ${time(batch.kiln[1])}, ${batch.tiles} tiles planned.`}
      />
      <ModalBody>
        <Stack gap={3}>
          <ProgressBar label="Tiles fired" value={total / batch.tiles} showLabel />
          <Text>
            {total} fired, {good} inside the tolerance, {total - good} scrap.
          </Text>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </>
  );
}
