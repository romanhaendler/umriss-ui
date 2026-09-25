import { Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Keep the header and the names in view";
export const lead = "`stickyHeader` holds the header row while the rows scroll, `stickyRowHeader` the name column while the days scroll sideways.";

/* `width` is an initial width: a table over the full width shares out the
   space it has, so the minimum width that makes it scroll comes from the
   application's stylesheet. */
const STYLE = `
.week-table table {
  min-width: 1400px;
}
`;

const DAYS = ["Mon 16", "Tue 17", "Wed 18", "Thu 19", "Fri 20", "Mon 23", "Tue 24", "Wed 25", "Thu 26", "Fri 27"];

interface Person {
  id: string;
  name: string;
  team: string;
  role: string;
  hours: number[];
}

const PEOPLE: Person[] = [
  ["Maya Lindgren", "Web", "Product manager"],
  ["Arjun Mehta", "Web", "Developer"],
  ["Chloe Durand", "Web", "Developer"],
  ["Noah Fischer", "Web", "Designer"],
  ["Eva Novak", "Web", "QA engineer"],
  ["Luis Moreno", "Apps", "Product manager"],
  ["Hana Sato", "Apps", "Developer"],
  ["Kofi Mensah", "Apps", "Developer"],
  ["Freya Olsen", "Apps", "Designer"],
  ["David Kowalski", "Apps", "QA engineer"],
].map(([name, team, role], i) => ({
  id: `p${i + 1}`,
  name: name!,
  team: team!,
  role: role!,
  hours: DAYS.map((_, d) => 4 + ((i * 5 + d * 3) % 5)),
}));

export default function StickyParts() {
  const { Table, Column, RowDetail } = useTable(PEOPLE, { rowKey: (p) => p.id });

  return (
    <>
      <style>{STYLE}</style>
      <Table className="week-table" selectable stickyHeader stickyRowHeader maxHeight="300px" ariaLabel="Planned hours per day">
        <Column value="team" label="Team" width={96} />
        <Column value="name" label="Person" rowHeader width={160} />
        {DAYS.map((day, d) => (
          <Column key={day} id={day} label={day} value={(p) => p.hours[d]} width={96} />
        ))}
        <RowDetail>
          {(p) => (
            <Text size="sm">
              {p.name}, {p.role}, team {p.team}
            </Text>
          )}
        </RowDetail>
      </Table>
    </>
  );
}
