import { RadioGroup } from "@umriss-ui/core";
import { columnFilter, useTable } from "../../../src";

export const title = "Offer the values that occur";
export const lead = "The `Input` of a filter of your own receives `values`, the column's values each once and in order, so it offers only thresholds some row meets.";

const atLeast = columnFilter<number, number>({
  matches: (hours, least) => hours >= least,
  Input: ({ condition, setCondition, values, column }) => (
    <RadioGroup
      aria-label={column.label}
      size="sm"
      options={values.map((hours) => ({ value: String(hours), label: `${hours} h and more` }))}
      value={condition === null ? null : String(condition)}
      onChange={(hours) => setCondition(Number(hours))}
    />
  ),
  describe: (least) => `${least} h and more`,
});

interface Person {
  id: string;
  name: string;
  role: string;
  capacity: number;
}

const PEOPLE: Person[] = [
  { id: "maya", name: "Maya Lindgren", role: "Product manager", capacity: 32 },
  { id: "arjun", name: "Arjun Mehta", role: "Developer", capacity: 40 },
  { id: "noah", name: "Noah Fischer", role: "Designer", capacity: 24 },
  { id: "kofi", name: "Kofi Mensah", role: "Developer", capacity: 32 },
  { id: "david", name: "David Kowalski", role: "QA engineer", capacity: 20 },
];

export default function OfferTheValuesThatOccur() {
  const { Table, Column } = useTable(PEOPLE, { rowKey: (p) => p.id });

  return (
    <Table ariaLabel="Team">
      <Column value="name" label="Person" rowHeader />
      <Column value="role" label="Role" />
      <Column value="capacity" label="Hours a week" filter={atLeast} />
    </Table>
  );
}
