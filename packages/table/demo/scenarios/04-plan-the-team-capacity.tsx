import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Badge, Grid, Stack, Stat, Text } from "@umriss-ui/core";
import { useTable } from "../../src";

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

interface Leave {
  id: string;
  person: string;
  from: number;
  to: number;
  reason: "Holiday" | "Sick" | "Training";
}

/** When people are away: blocked time on their lane. */
const LEAVE: readonly Leave[] = [
  { id: "l-1", person: "noah", from: at(13, 0, 0), to: at(14, 0, 0), reason: "Sick" },
  { id: "l-2", person: "arjun", from: at(18, 0, 0), to: at(21, 0, 0), reason: "Holiday" },
  { id: "l-3", person: "kofi", from: at(13, 0, 0), to: at(14, 0, 0), reason: "Training" },
  { id: "l-4", person: "freya", from: at(16, 0, 0), to: at(18, 0, 0), reason: "Holiday" },
  { id: "l-5", person: "david", from: at(9, 0, 0), to: at(14, 0, 0), reason: "Holiday" },
  { id: "l-6", person: "maya", from: at(19, 13, 0), to: at(20, 17, 0), reason: "Training" },
];

export const title = "Plan the team's capacity";

export const lead =
  "Tidewell's delivery lead fills in the hours each person is booked for the next three weeks, and sees at once who is booked beyond what they have.";

export const callouts = [
  "How many hours both teams still have free this week, and how many people are booked beyond their capacity.",
  "The table is a grid: one tab stop, arrows walk the cells. Enter, F2 or typing edits a week or a capacity; Enter keeps it, Escape drops it.",
  "Leave takes days out of the week: Arjun's holiday leaves him 16 hours, and the free column says by how much he is overbooked.",
  "The table reports each edit and changes nothing itself; the application writes it into its rows, and the sums follow.",
];

export const builtFrom = [
  "first-table",
  "column",
  "grouping",
  "aggregate",
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
];

const WEEK = [16, 17, 18, 19, 20];

/** Working days of this week a person is away. */
const awayDays = (person: string) =>
  WEEK.filter((day) => {
    const noon = new Date(2026, 2, day, 12).getTime();
    return LEAVE.some((l) => l.person === person && l.from <= noon && noon < l.to);
  }).length;

/** Hours booked for the weeks of 16, 23 and 30 March. */
const BOOKED: Record<string, [number, number, number]> = {
  maya: [24, 28, 30],
  arjun: [32, 36, 38],
  chloe: [38, 40, 36],
  noah: [20, 22, 18],
  eva: [34, 36, 40],
  luis: [30, 32, 32],
  hana: [40, 38, 36],
  kofi: [28, 30, 24],
  freya: [20, 36, 38],
  david: [18, 20, 16],
};

interface Row {
  id: string;
  name: string;
  role: string;
  team: string;
  /** Hours a week. */
  capacity: number;
  away: number;
  week16: number;
  week23: number;
  week30: number;
}

const START: Row[] = PEOPLE.map((p) => {
  const [week16, week23, week30] = BOOKED[p.id]!;
  return { id: p.id, name: p.name, role: p.role, team: p.team, capacity: p.capacity, away: awayDays(p.id), week16, week23, week30 };
});

const free = (r: Row) => (r.capacity * (5 - r.away)) / 5 - r.week16;

const hours = (value: number | null) => (value === null || value < 0 || value > 60 ? "Between 0 and 60 hours" : undefined);

/* A pinned column needs room beside it: on a phone it covers half the table.
   So the column sticks only where the place the screen stands in is at least
   640 px wide - measured on the place itself, not on the window, which knows
   nothing of a sidebar or a split view. Narrower, the table scrolls whole. */
function useWide(): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(true);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWide(element.getBoundingClientRect().width >= 640));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, wide];
}

export default function PlanTheTeamCapacity() {
  const [rows, setRows] = useState(START);
  const [last, setLast] = useState("No change yet.");
  const [place, wide] = useWide();
  const { Table, Column } = useTable(rows, { rowKey: (r) => r.id, defaultGrouping: "team" });

  return (
    <Stack ref={place} gap={4}>
      <div data-callout="1">
        <Grid minItemWidth="180px" gap={3}>
          <Stat label="Free this week" value={rows.reduce((s, r) => s + Math.max(0, free(r)), 0)} unit="h" decimals={0} />
          <Stat label="Overbooked this week" value={rows.filter((r) => free(r) < 0).length} />
        </Grid>
      </div>

      <div data-callout="2">
        <Table
          grid
          ariaLabel="Booked hours per person and week"
          onCellEdit={({ rowKey, columnId, value, row }) => {
            setRows((all) => all.map((r) => (r.id === rowKey ? { ...r, [columnId]: value } : r)));
            setLast(`${row.name}, ${columnId === "capacity" ? "capacity" : `week of ${columnId.slice(4)} March`}: ${String(value)} h`);
          }}
        >
          <Column value="team" label="Team" />
          <Column value="name" label="Person" rowHeader pin={wide ? "start" : undefined} />
          <Column value="role" label="Role" />
          <Column value="capacity" label="Capacity (h)" edit="number" validate={hours} aggregate="sum" share={false} />
          <Column value="away" label="Away (days)" aggregate="sum" share={false} />
          <Column id="free" label="Free this week (h)" value={free} format={{ decimals: 0 }}>
            {(value, r) => {
              const cell = value < 0 ? <Badge tone="danger">{`${Math.round(-value)} over`}</Badge> : Math.round(value);
              return r.id === "arjun" ? <span data-callout="3">{cell}</span> : cell;
            }}
          </Column>
          <Column value="week16" label="16 Mar (h)" edit="number" validate={hours} aggregate="sum" share={false} />
          <Column value="week23" label="23 Mar (h)" edit="number" validate={hours} aggregate="sum" share={false} />
          <Column value="week30" label="30 Mar (h)" edit="number" validate={hours} aggregate="sum" share={false} />
        </Table>
      </div>

      <span data-callout="4">
        <Text size="sm" tone="secondary" role="status">
          {last}
        </Text>
      </span>
    </Stack>
  );
}
