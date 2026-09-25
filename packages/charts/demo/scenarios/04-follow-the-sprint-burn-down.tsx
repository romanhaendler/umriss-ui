import { Card, CardBody, CardHeader, Grid, Stack, Stat, Text } from "@umriss-ui/core";
import { Bar, Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../src";
import { BURNDOWN, PEOPLE, SPRINTS, WORK, type BurndownPoint, type WorkItem } from "@umriss-ui/demo/worlds/planning";

export const title = "Follow the sprint's burn-down";

export const lead =
  "A team lead opens this at the stand-up: how many hours of the sprint are left, how that compares with an even pace, and who holds them.";

export const callouts = [
  "The hours of estimated work not yet done, as booked at the end of yesterday.",
  "The pace the remaining days would need, beside the pace so far: the gap between the two is the conversation of the stand-up.",
  "The even pace burns to zero on the last day; the team's line stops at the last day booked and lies well above it. The x axis counts working days, so the weekend takes no room.",
  "The items not yet done, per person, at their planned estimate: where help or a cut in scope would land.",
];

export const builtFrom = [
  "line",
  "bar",
  "axis",
  "tooltip",
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Card", page: "@umriss-ui/core#card" },
];

const SPRINT = SPRINTS.find((one) => one.id === "sprint-14")!;
const BOOKED = BURNDOWN.filter((one) => one.remaining !== null);
const LEFT = BOOKED.at(-1)!.remaining!;
const BURNT = BURNDOWN[0]!.remaining! - LEFT;
/* The first point is the sprint's start; each later one closes a working day. */
const DAYS_DONE = BOOKED.length - 1;
const DAYS_LEFT = BURNDOWN.length - BOOKED.length;

const DAY_NAMES = BURNDOWN.map((one) => new Date(one.t).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }));
const day = (i: number) => DAY_NAMES[i] ?? "";

interface Holder {
  name: string;
  open: number;
}

const HOLDERS: readonly Holder[] = PEOPLE.map((person) => ({
  name: person.name.split(" ")[0]!,
  open: WORK.filter((one: WorkItem) => one.lane === person.id && one.status !== "done").reduce((sum, one) => sum + one.estimate, 0),
})).filter((one) => one.open > 0);

export default function BurnDown() {
  return (
    <Stack gap={4}>
      <Grid minItemWidth="11rem" gap={3}>
        <Stat label="Hours left" value={LEFT} unit="h" decimals={0} data-callout="1" />
        <Stat label="Burnt per day so far" value={BURNT / DAYS_DONE} unit="h" decimals={1} />
        <Stat label="Needed per day from here" value={LEFT / DAYS_LEFT} unit="h" decimals={1} data-callout="2" />
      </Grid>
      <Card data-callout="3">
        <CardHeader eyebrow={SPRINT.goal} title={`${SPRINT.name} burn-down`} />
        <CardBody>
          <Stack gap={2}>
            <Chart data={BURNDOWN} height={280} ariaLabel={`${SPRINT.name}: hours left per working day against an even pace`}>
              <XAxis
                accessor={(_d: BurndownPoint, i: number) => i}
                ticks={BURNDOWN.map((_, i) => i)}
                tickFormat={day}
                label="Working day"
              />
              <YAxis accessor={(d: BurndownPoint) => d.ideal} label="Hours left" domain={[0, BURNDOWN[0]!.ideal]} />
              <Line accessor={(d: BurndownPoint) => d.ideal} name="Even pace" color="var(--uc-color-text)" dash={[4, 4]} strokeWidth={1} />
              <Line accessor={(d: BurndownPoint) => d.remaining} name="Left" markers="always" strokeWidth={2} />
              <Legend placement="top" />
              <Tooltip mode="x" />
            </Chart>
            <Text size="sm" tone="muted">
              Ten working days, {day(0)} to {day(BURNDOWN.length - 1)}; the weekend between them is left out.
            </Text>
          </Stack>
        </CardBody>
      </Card>
      <Card data-callout="4">
        <CardHeader title="Unfinished items per person" />
        <CardBody>
          <Chart data={HOLDERS} height={200} ariaLabel="Estimated hours of unfinished items per person">
            <XAxis
              accessor={(_d: Holder, i: number) => i}
              ticks={HOLDERS.map((_, i) => i)}
              tickFormat={(v) => HOLDERS[v]?.name ?? ""}
            />
            <YAxis accessor={(d: Holder) => d.open} label="h" tickCount={4} />
            <Bar accessor={(d: Holder) => d.open} name="Estimate" barWidth={0.6} />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
    </Stack>
  );
}
