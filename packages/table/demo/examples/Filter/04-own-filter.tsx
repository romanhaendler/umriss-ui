import { RadioGroup } from "@umriss-ui/core";
import { columnFilter, useTable } from "../../../src";

export const title = "A filter of one's own with columnFilter";

/* What a filter asks is not always the table's decision. `columnFilter` takes
   three things: `matches` checks a value against the condition, `Input` stands
   in the panel, and `describe` names the condition in the table toolbar. The
   panel with "Reset" and "Done", the counting, the way back and the view belong
   to the table - for this filter as for the list filter, which goes through the
   same door.

   The filter is bound to a value type, not to a table:
   `columnFilter<number, …>` is accepted by the compiler at every number column
   and not at a text column. An absent value satisfies no condition of one's own,
   and `matches` never gets to see it. */

type Level = "low" | "empty";

const LEVELS = [
  { value: "low", label: "Low – under 20" },
  { value: "empty", label: "Empty" },
] as const;

const stockLevel = columnFilter<number, Level>({
  matches: (value, level) => (level === "empty" ? value === 0 : value < 20),
  Input: ({ condition, setCondition, column }) => (
    <RadioGroup
      aria-label={column.label}
      size="sm"
      options={LEVELS}
      value={condition}
      onChange={(level) => setCondition(level)}
    />
  ),
  describe: (level) => (level === "empty" ? "empty" : "low"),
});

interface Part {
  number: string;
  description: string;
  stock: number | null;
}

const PARTS: Part[] = [
  { number: "T-1180", description: "Flange DN 50", stock: 240 },
  { number: "T-1204", description: "Shaft Ø 32 × 410", stock: 12 },
  { number: "T-1311", description: "Bearing cap", stock: 0 },
  { number: "T-1320", description: "Flange DN 80", stock: null },
  { number: "T-1402", description: "Sealing ring 40 × 3", stock: 1065 },
  { number: "T-1415", description: "Key 8 × 7", stock: 7 },
];

export default function OwnFilter() {
  const { Table, Column } = useTable(PARTS, { rowKey: (p) => p.number });

  return (
    <Table ariaLabel="Stores">
      <Column value="number" label="Part" rowHeader />
      <Column value="description" label="Description" />
      <Column value="stock" label="Stock" filter={stockLevel} />
    </Table>
  );
}
