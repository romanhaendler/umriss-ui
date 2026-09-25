import { Stack, Text } from "@umriss-ui/core";
import { BlockedTimes, Dependencies, Lane, Schedule, Subtasks, findings } from "../../../src";
import type { BlockedTime, Dependency, Subtask, Task } from "../../../src";

export const title = "List the findings";

export const lead = "`findings` returns what the schedule marks - overlaps, violated dependencies, work in blocked time - as data for a list beside it.";

const day = (d: number, hours = 9) => new Date(2026, 2, d, hours).getTime();

const PROJECTS: readonly Task[] = [
  { id: "shop", name: "Online shop relaunch", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "portal", name: "Member portal", color: "light-dark(#7c3aed, #a98bfa)" },
];

const WORK: readonly Subtask[] = [
  { id: "design", task: "shop", lane: "noah", from: day(16), to: day(17, 17), name: "Search results layout" },
  { id: "build", task: "shop", lane: "chloe", from: day(17), to: day(19, 17), name: "Search results page" },
  { id: "address", task: "portal", lane: "chloe", from: day(18), to: day(19, 17), name: "Change of address form" },
  { id: "profile", task: "portal", lane: "arjun", from: day(17), to: day(19, 17), name: "Profile page" },
];

/* The build may start only a morning after the design is done. */
const HANDOVERS: readonly Dependency[] = [{ id: "design-to-build", from: "design", to: "build", lag: 4 * 60 * 60_000 }];

const LEAVE: readonly BlockedTime[] = [{ id: "arjun-holiday", lane: "arjun", from: day(18, 0), to: day(21, 0), label: "Holiday" }];

const when = (instant: number) => new Date(instant).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });
const hours = (ms: number) => Math.round(ms / 3_600_000);

export default function ListTheFindings() {
  const found = findings(WORK, HANDOVERS, LEAVE);

  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Three people's week with its findings" initialDomain={[day(16, 0), day(21, 0)]} height={184}>
        <Lane id="noah" label="Noah Fischer" />
        <Lane id="chloe" label="Chloe Durand" />
        <Lane id="arjun" label="Arjun Mehta" />
        <BlockedTimes data={LEAVE} />
        <Dependencies data={HANDOVERS} />
        <Subtasks data={WORK} tasks={PROJECTS} />
      </Schedule>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {found.overlaps.map((o) => (
          <Text as="li" size="sm" key={`${o.first}/${o.second}`}>
            Double-booked: {o.lane} has {o.first} and {o.second} from {when(o.from)} to {when(o.to)}
          </Text>
        ))}
        {found.violatedDependencies.map((v) => (
          <Text as="li" size="sm" key={v.dependency}>
            Too early: {v.dependency} is {hours(v.shortBy)} hours short
          </Text>
        ))}
        {found.inBlockedTime.map((b) => (
          <Text as="li" size="sm" key={`${b.subtask}/${b.blocked}`}>
            In leave: {b.subtask} covers {b.blocked} from {when(b.from)} to {when(b.to)}
          </Text>
        ))}
      </ul>
    </Stack>
  );
}
