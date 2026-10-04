import { Card, CardBody, CardHeader, Grid, Stack, Stat, Text } from "@umriss-ui/core";
import { Legend, Tooltip, useChart } from "../../src";

/* Data from the planning world, written out here so the example runs on its own. */
const at = (day: number, hours = 9, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

interface Person {
  id: string;
  name: string;
  role: "Developer" | "Designer" | "Product manager" | "QA engineer";
  team: "Web" | "Apps";
  /** Hours a week they can be planned for. */
  capacity: number;
}

const PEOPLE: readonly Person[] = [
  { id: "maya", name: "Maya Lindgren", role: "Product manager", team: "Web", capacity: 32 },
  { id: "arjun", name: "Arjun Mehta", role: "Developer", team: "Web", capacity: 40 },
  { id: "chloe", name: "Chloe Durand", role: "Developer", team: "Web", capacity: 40 },
  { id: "noah", name: "Noah Fischer", role: "Designer", team: "Web", capacity: 24 },
  { id: "eva", name: "Eva Novak", role: "QA engineer", team: "Web", capacity: 40 },
  { id: "luis", name: "Luis Moreno", role: "Product manager", team: "Apps", capacity: 40 },
  { id: "hana", name: "Hana Sato", role: "Developer", team: "Apps", capacity: 40 },
  { id: "kofi", name: "Kofi Mensah", role: "Developer", team: "Apps", capacity: 32 },
  { id: "freya", name: "Freya Olsen", role: "Designer", team: "Apps", capacity: 40 },
  { id: "david", name: "David Kowalski", role: "QA engineer", team: "Apps", capacity: 20 },
];

interface Sprint {
  id: string;
  name: string;
  from: number;
  to: number;
  goal: string;
}

/** Two weeks each, Monday 09:00 to the second Friday 17:00. */
const SPRINTS: readonly Sprint[] = [
  { name: "Sprint 12", day: 9 - 28, goal: "Shop checkout on the new design" },
  { name: "Sprint 13", day: 9 - 14, goal: "Booking app in the stores' beta" },
  { name: "Sprint 14", day: 9, goal: "Member portal sign-in and profile" },
  { name: "Sprint 15", day: 23, goal: "Shop search and filters" },
  { name: "Sprint 16", day: 37, goal: "Booking reminders" },
].map(({ name, day, goal }) => ({ id: name.toLowerCase().replace(" ", "-"), name, from: at(day), to: at(day + 11, 17), goal }));

/** A work item, shaped as `@umriss-ui/schedule`'s `Subtask`. */
interface WorkItem {
  id: string;
  /** The project. */
  task: string;
  /** The person. */
  lane: string;
  from: number;
  to: number;
  name: string;
  sprint: string;
  /** Hours, as estimated at planning. */
  estimate: number;
  status: "to do" | "in progress" | "in review" | "done";
}

const item = (id: string, task: string, lane: string, from: number, to: number, name: string, estimate: number, status: WorkItem["status"]): WorkItem =>
  ({ id, task, lane, from, to, name, sprint: "sprint-14", estimate, status });

const WORK: readonly WorkItem[] = [
  item("w-101", "portal", "arjun", at(9), at(11, 17), "Sign-in with e-mail code", 18, "done"),
  item("w-102", "portal", "arjun", at(12), at(17, 17), "Profile page", 26, "in progress"),
  item("w-103", "portal", "chloe", at(9), at(10, 17), "Session handling", 12, "done"),
  item("w-104", "shop", "chloe", at(11), at(13, 17), "Basket keeps items across devices", 20, "in review"),
  item("w-105", "portal", "chloe", at(16), at(19, 17), "Change of address form", 24, "in progress"),
  item("w-106", "portal", "noah", at(9), at(12, 13), "Profile page design", 14, "done"),
  item("w-107", "shop", "noah", at(16), at(18, 17), "Search results layout", 12, "to do"),
  item("w-108", "portal", "eva", at(12), at(13, 17), "Test plan for sign-in", 10, "done"),
  item("w-109", "portal", "eva", at(17), at(20, 17), "Regression run", 20, "to do"),
  item("w-110", "booking", "hana", at(9), at(13, 17), "Reminder scheduling service", 32, "done"),
  item("w-111", "booking", "hana", at(16), at(20, 17), "Push notifications", 30, "in progress"),
  item("w-112", "booking", "kofi", at(10), at(12, 17), "Calendar sync", 18, "done"),
  item("w-113", "intranet", "kofi", at(16), at(18, 17), "News feed", 16, "in progress"),
  item("w-114", "booking", "freya", at(9), at(11, 17), "Reminder settings screen", 16, "done"),
  item("w-115", "booking", "freya", at(18), at(20, 17), "Store screenshots", 12, "to do"),
  item("w-116", "booking", "david", at(16), at(19, 13), "Device test matrix", 14, "to do"),
];

interface BurndownPoint {
  /** The working day, at 17:00. */
  t: number;
  /** Where the line would be, burning evenly. */
  ideal: number;
  /** Hours left, `null` for the days still to come. */
  remaining: number | null;
}

/** Sprint 14's ten working days. The team fell behind in the first week, when
    two were away, and is catching up. */
const BURNDOWN: readonly BurndownPoint[] = (() => {
  const total = WORK.reduce((sum, one) => sum + one.estimate, 0);
  const days = [9, 10, 11, 12, 13, 16, 17, 18, 19, 20];
  const burnt = [0, 22, 38, 60, 71, 98];
  return days.map((day, i) => ({
    t: at(day, 17),
    ideal: Math.round(total * (1 - i / (days.length - 1))),
    remaining: burnt[i] === undefined ? null : total - burnt[i]!,
  }));
})();


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

function SprintBurnDown() {
  const { Chart, XAxis, YAxis, Line } = useChart(BURNDOWN);
  return (
    <Chart height={280} ariaLabel={`${SPRINT.name}: hours left per working day against an even pace`}>
      <XAxis
        value={(_d, i) => i}
        ticks={BURNDOWN.map((_, i) => i)}
        tickFormat={day}
        label="Working day"
      />
      <YAxis label="Hours left" domain={[0, BURNDOWN[0]!.ideal]} />
      <Line value="ideal" name="Even pace" color="var(--uc-color-text)" dash={[4, 4]} strokeWidth={1} />
      <Line value="remaining" name="Left" markers="always" strokeWidth={2} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}

function OpenPerPerson() {
  const { Chart, XAxis, YAxis, Bar } = useChart(HOLDERS);
  return (
    <Chart height={200} ariaLabel="Estimated hours of unfinished items per person">
      <XAxis
        value={(_d, i) => i}
        ticks={HOLDERS.map((_, i) => i)}
        tickFormat={(v) => HOLDERS[v]?.name ?? ""}
      />
      <YAxis label="h" tickCount={4} />
      <Bar value="open" name="Estimate" barWidth={0.6} />
      <Tooltip mode="x" />
    </Chart>
  );
}

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
            <SprintBurnDown />
            <Text size="sm" tone="muted">
              Ten working days, {day(0)} to {day(BURNDOWN.length - 1)}; the weekend between them is left out.
            </Text>
          </Stack>
        </CardBody>
      </Card>
      <Card data-callout="4">
        <CardHeader title="Unfinished items per person" />
        <CardBody>
          <OpenPerPerson />
        </CardBody>
      </Card>
    </Stack>
  );
}
