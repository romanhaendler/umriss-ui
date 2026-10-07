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
import type { FreshnessAges, LimitSet } from "../../src";
import { ControlChart, DataTable, LimitBand, LimitLine, Tooltip, useChart } from "@umriss-ui/charts";
import { AlarmList, alarmModel, isHidden, useTableSelection } from "@umriss-ui/table";
import { useSchedule } from "@umriss-ui/schedule";
import type { Subtask, Task } from "@umriss-ui/schedule";
import { Calculation, Difference, Given, Product, Quotient, Ref } from "@umriss-ui/calculation";

/* Data from the plant world, written out here so the example runs on its own. */

/** An alarm's dead band, as `@umriss-ui/table` reads it. */
interface ReturnBand {
  direction: "upper" | "lower";
  limit: number;
  returnTo: number;
}

/** A kind of alarm, as `@umriss-ui/table` reads it. */
interface AlarmType {
  id: string;
  label: string;
  priority: "high" | "medium" | "low";
  returnBand?: ReturnBand;
}

/** One alarm, as `@umriss-ui/table` reads it. */
interface Alarm {
  id: string;
  type: string;
  lifecycle: "active-unacknowledged" | "active-acknowledged" | "resolved-unacknowledged" | "resolved-acknowledged";
  raised: number;
  resolved?: number;
  acknowledgedAt?: number;
  availability?: "in-service" | "suppressed" | "disabled";
}

/** A small LCG - reproducible across runs and platforms. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** The early shift, 06:00 to 14:00. */
const SHIFT_MINUTES = 480;

/** The kiln's zone 3, in °C: the numbers every part reads it against, once.
    Between the two warnings lies the tolerance - a tile fired outside it is
    scrap; `returnTo` is the alarm's dead band. */
const KILN = { target: 1200, tolerance: [1185, 1215], alarm: 1230, returnTo: 1222 } as const;

/** The same numbers as the limit set the tile and the verdict read. */
const KILN_LIMITS: LimitSet = {
  target: KILN.target,
  limits: [
    { value: KILN.tolerance[1], side: "upper", severity: "warning" },
    { value: KILN.alarm, side: "upper", severity: "alarm" },
    { value: KILN.tolerance[0], side: "lower", severity: "warning" },
  ],
};

/** The kiln fires one tile every quarter of a minute when nothing holds it up -
    the ideal cycle time of the OEE's performance. */
const IDEAL_CYCLE_MINUTES = 0.25;

/** The kiln alarm's condition and its dead band, as the table's model reads them. */
const KILN_RETURN: ReturnBand = { direction: "upper", limit: KILN.alarm, returnTo: KILN.returnTo };

/** What the four measuring points of the line can report. */
const ALARM_TYPES: readonly AlarmType[] = [
  {
    id: "kiln-high",
    label: "Kiln K1 · zone 3 above alarm limit",
    priority: "high",
    /* The dead band: back below `returnTo`, not merely below the limit, or a
       reading riding on the limit would raise an alarm a minute. */
    returnBand: KILN_RETURN,
  },
  { id: "exit-silent", label: "Kiln K1 · exit pyrometer sends nothing", priority: "medium" },
  { id: "belt-empty", label: "Kiln K1 · belt empty", priority: "medium" },
  { id: "dryer-fan", label: "Dryer D1 · fan vibration high", priority: "low" },
];

/** One minute of the line. */
interface Reading {
  /** Minutes since the start of the shift. */
  minute: number;
  /** Zone 3 of the kiln, in °C. */
  kiln: number;
  /** The exit pyrometer, in °C - `null` while it sends nothing. */
  exit: number | null;
  /** Whether the belt runs. */
  running: boolean;
  /** Tiles out of the kiln in this minute. */
  fired: number;
  /** Of them, the ones fired inside the tolerance. */
  good: number;
}

/** A tile taken off the belt and measured - one every ten minutes while it runs. */
interface Sample {
  minute: number;
  /** The tile's length after firing, in mm (nominal 600). */
  length: number;
}

/** A batch of tiles through the three stations. */
interface Batch {
  id: string;
  name: string;
  /** How many tiles the batch is planned for. */
  tiles: number;
  /** Minutes since the start of the shift, per station. */
  press: readonly [number, number];
  dryer: readonly [number, number];
  kiln: readonly [number, number];
}

interface Plant {
  readings: readonly Reading[];
  samples: readonly Sample[];
  batches: readonly Batch[];
}

/* When the exit pyrometer goes silent, and for how long. Fixed rather than
   seeded, so that a running control room shows its reading turn stale, then
   lost, and come back. */
const SILENT_FROM = 288;
const SILENT_FOR = 50;

/* The dryer's vibration sensor is under maintenance all shift: its alarm is
   active and disabled. */
const DRYER_FAN_RAISED = 20;

/** The shift, from a seed. */
function plant(seed: number): Plant {
  const r = random(seed);

  /* The one excursion: a burner overshoots somewhere between 02:30 and 03:30
     into the shift, for half an hour, peaking near 1242 °C. The operator stops
     the feed twenty-two minutes in, for eighteen minutes. The noise around it
     is too small to reach a warning on its own, so this is the only crossing -
     which is what the tests hold. */
  const surgeFrom = 150 + Math.floor(r() * 60);
  const surgeFor = 30;
  const stopFrom = surgeFrom + 22;
  const stopFor = 18;

  /* The plan: batches through the kiln one after another, each pressed an
     hour and dried half an hour before - the first ones during the night
     shift. Tiles come out of the kiln only while a batch is in it, so the
     OEE's count and the batches' counts are the same tiles. The plan is a
     plan: a stop of the belt does not move it. */
  const batches: Batch[] = [];
  for (let at = 0, i = 0; at < SHIFT_MINUTES; i++) {
    const length = 70 + Math.floor(r() * 25);
    batches.push({
      id: `b-${4121 + i}`,
      name: `B-${4121 + i}`,
      tiles: Math.round(length / IDEAL_CYCLE_MINUTES / 10) * 10,
      press: [at - 60, at - 60 + length],
      dryer: [at - 30, at - 30 + length],
      kiln: [at, at + length],
    });
    at += length + 5;
  }

  const readings: Reading[] = [];
  const samples: Sample[] = [];
  let drift = 0;
  for (let minute = 0; minute < SHIFT_MINUTES; minute++) {
    drift = 0.9 * drift + (r() - 0.5) * 3;
    const into = minute - surgeFrom;
    const surge = into >= 0 && into <= surgeFor ? 42 * Math.sin((Math.PI * into) / surgeFor) : 0;
    const kiln = Math.round((KILN.target + drift + surge) * 10) / 10;

    const running = !(minute >= stopFrom && minute < stopFrom + stopFor);
    const loaded = batches.some((batch) => batch.kiln[0] <= minute && minute < batch.kiln[1]);
    const jam = r() < 0.12;
    const fired = running && loaded ? (jam ? 3 : 4) : 0;
    const inTolerance = kiln >= KILN.tolerance[0] && kiln <= KILN.tolerance[1];
    const silent = minute >= SILENT_FROM && minute < SILENT_FROM + SILENT_FOR;
    const exit = silent ? null : Math.round((kiln - 380 + (r() - 0.5) * 4) * 10) / 10;

    readings.push({ minute, kiln, exit, running, fired, good: inTolerance ? fired : 0 });

    if (running && minute % 10 === 0) {
      /* Hotter shrinks more: the length follows the kiln, so the control
         chart sees the excursion the trend sees. */
      const length = 600 + (KILN.target - kiln) * 0.05 + (r() - 0.5) * 0.6;
      samples.push({ minute, length: Math.round(length * 100) / 100 });
    }
  }

  return { readings, samples, batches };
}

/** The readings up to and including the minute. */
function upTo<T extends { minute: number }>(series: readonly T[], minute: number): readonly T[] {
  return series.filter((one) => one.minute <= minute);
}

/** How long ago the exit pyrometer last reported, in minutes - `0` while it
    reports. What the tile's freshness is told. */
function exitSilence(p: Plant, minute: number): number {
  for (let m = minute; m >= 0; m--) {
    if (p.readings[m]?.exit !== null) return minute - m;
  }
  return minute;
}

/** When a condition held, as spans of minutes: `[from, to)`, `to` absent while
    it still holds at the minute. */
function spans(
  readings: readonly Reading[],
  minute: number,
  raise: (one: Reading) => boolean,
  clear: (one: Reading) => boolean,
): { from: number; to?: number }[] {
  const found: { from: number; to?: number }[] = [];
  let open: { from: number; to?: number } | null = null;
  for (const one of readings) {
    if (one.minute > minute) break;
    if (open === null && raise(one)) {
      open = { from: one.minute };
      found.push(open);
    } else if (open !== null && clear(one)) {
      open.to = one.minute;
      open = null;
    }
  }
  return found;
}

/**
 * The alarms of the shift as they stand at the minute: raised, resolved - and
 * acknowledged where the operator did, at the instant he did.
 *
 * `start` is the instant the shift began; the alarms carry instants because the
 * table's model does.
 */
function alarmsAt(
  p: Plant,
  minute: number,
  start: number,
  acknowledged: ReadonlyMap<string, number> = new Map(),
): Alarm[] {
  const instant = (m: number) => start + m * 60_000;
  const alarms: Alarm[] = [];

  const add = (
    type: string,
    span: { from: number; to?: number },
    extra: { availability?: "suppressed" | "disabled" } = {},
  ) => {
    alarms.push({
      id: `${type}-${span.from}`,
      type,
      lifecycle: span.to === undefined ? "active-unacknowledged" : "resolved-unacknowledged",
      raised: instant(span.from),
      ...(span.to === undefined ? {} : { resolved: instant(span.to) }),
      ...extra,
    });
  };

  for (const span of spans(p.readings, minute, (one) => one.kiln > KILN_RETURN.limit, (one) => one.kiln <= KILN_RETURN.returnTo)) {
    add("kiln-high", span);
  }
  for (const span of spans(p.readings, minute, (one) => one.exit === null, (one) => one.exit !== null)) {
    add("exit-silent", span);
  }
  /* The belt runs empty because the operator stopped the feed: the plant's
     logic knows it, so the alarm is suppressed - there, and neutral. */
  for (const span of spans(p.readings, minute, (one) => !one.running, (one) => one.running)) {
    add("belt-empty", span, { availability: "suppressed" });
  }
  if (minute >= DRYER_FAN_RAISED) {
    add("dryer-fan", { from: DRYER_FAN_RAISED }, { availability: "disabled" });
  }

  return alarms.map((alarm) => {
    const at = acknowledged.get(alarm.id);
    if (at === undefined) return alarm;
    const lifecycle = alarm.resolved === undefined ? "active-acknowledged" : "resolved-acknowledged";
    return { ...alarm, lifecycle, acknowledgedAt: at };
  });
}

/** The shift's figures for the OEE, up to and including the minute. */
interface ShiftCount {
  /** Minutes of the shift so far. */
  planned: number;
  /** Minutes the belt stood. */
  downtime: number;
  /** Tiles out of the kiln. */
  total: number;
  /** Of them, inside the tolerance. */
  good: number;
}

function countAt(p: Plant, minute: number): ShiftCount {
  const so = upTo(p.readings, minute);
  return {
    planned: so.length,
    downtime: so.filter((one) => !one.running).length,
    total: so.reduce((sum, one) => sum + one.fired, 0),
    good: so.reduce((sum, one) => sum + one.good, 0),
  };
}

export const title = "Watch a kiln line over a shift";

export const lead =
  "A line lead at Brenholt Tile Works keeps this control room open through the shift to see the kiln, its alarms, the plan and the OEE at once.";

export const callouts = [
  "The shift runs a minute per second; Pause stops it, and under reduced motion it starts stopped. The skip links reach each region by keyboard.",
  "The tile reads zone 3 against its limits and says the verdict in a word. The minute the kiln crosses its alarm limit is the same minute in the trend and in the alarm list.",
  "The trend draws the limits the tile reads, and its table view holds every reading for a screen reader.",
  "The alarm the kiln raised stands in the list; acknowledging it records who knew when and changes nothing else on the screen.",
  "Choosing a batch in the plan and opening its details shows what the kiln has fired of it so far, in a drawer.",
  "The OEE shows its working, down to the counts it is made of, so the scrap from the excursion can be traced back.",
];

export const builtFrom = ["stat", "card", "progressbar", "drawer", { name: "Line", page: "@umriss-ui/charts#line" }, { name: "ControlChart", page: "@umriss-ui/charts#controlchart" }, { name: "AlarmList", page: "@umriss-ui/table#alarmlist" }, { name: "Schedule", page: "@umriss-ui/schedule#schedule" }, { name: "Calculation", page: "@umriss-ui/calculation#calculation" }];

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
  callout,
  children,
}: {
  id: string;
  title: string;
  quiet?: boolean;
  /** The numbered mark the scenarios page lays over the region. */
  callout?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  /* Where a skip link landed shows the library's ring, over the card's own
     shadow - a card has no focus style of its own, being no control. */
  const [landed, setLanded] = useState(false);
  return (
    <Card
      id={id}
      data-callout={callout}
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
  { id: "room-plan", title: "Plan" },
  { id: "room-quality", title: "Tile length" },
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
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: PLAN_DOMAIN } });
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
  const kilnTrend = useChart(trend);
  const tileLength = useChart(measured);
  const alarms = useMemo(
    () =>
      alarmModel(
        { alarms: alarmsAt(SHIFT, minute, START, acknowledged), types: ALARM_TYPES, asOf: now },
        hiddenOnly ? { filter: (row) => isHidden(row.availability) } : {},
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
        <Button size="sm" data-callout="1" disabled={minute === LAST} onClick={() => setRunning(!running)}>
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
            data-callout="2"
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

      <Region id="room-trend" title="Kiln trend" callout="3">
        <kilnTrend.Chart height={240} ariaLabel="Kiln K1, zone 3, over the shift">
          <kilnTrend.XAxis value="t" domain={[at(0), at(LAST)]} time />
          <kilnTrend.YAxis domain={[1170, 1250]} label="°C" />
          <LimitBand from={KILN.tolerance[0]} to={KILN.tolerance[1]} severity="warning" label="Tolerance" />
          <LimitLine value={KILN.alarm} severity="alarm" label="Alarm limit" />
          <kilnTrend.Line value="kiln" name="Zone 3" format={(v) => `${v.toFixed(1)} °C`} />
          <Tooltip mode="x" />
          <DataTable />
        </kilnTrend.Chart>
      </Region>

      <Region id="room-alarms" title="Alarms" quiet callout="4">
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

      <Region
        id="room-plan"
        title="Plan"
        callout="5"
        actions={
          <Button size="sm" disabled={chosen === undefined} onClick={() => setDetails(true)}>
            {chosen === undefined ? "Choose a batch" : `Details of ${chosen.name}`}
          </Button>
        }
      >
        <Schedule
          ariaLabel="Plan of the early shift: press, dryer and kiln"
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

      <Grid columns={2} gap={4}>
        <Region id="room-quality" title="Tile length">
          <tileLength.Chart ariaLabel="Tile length after firing, individuals chart">
            <tileLength.XAxis value="t" domain={[at(0), at(LAST)]} time />
            <tileLength.YAxis domain={[597, 602]} label="mm" />
            <LimitLine value={601.5} severity="alarm" label="USL" />
            <LimitLine value={598.5} severity="alarm" label="LSL" />
            <ControlChart
              value="length"
              data={measured}
              origin={REFERENCE}
              name="Length"
              labelUpper="UCL"
              labelLower="LCL"
              violationName="Length - rule violation"
            />
            <Tooltip mode="x" />
          </tileLength.Chart>
        </Region>

        <Region id="room-oee" title="OEE so far" callout="6">
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
      </Grid>

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
