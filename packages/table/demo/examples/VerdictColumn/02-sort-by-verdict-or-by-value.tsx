import { Stack, Text } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Sort by verdict or by value";

export const lead = "A verdict column sorts by the verdict's weight, so both overloaded and idle vans stand on top; `sortBy=\"value\"` sorts by the number.";

interface Tour {
  tour: string;
  load: number | null;
}

/* The share of the vehicle's capacity a tour loads, in per cent. */
const LOAD: LimitSet = {
  limits: [
    { value: 90, side: "upper", severity: "warning" },
    { value: 100, side: "upper", severity: "alarm" },
    { value: 40, side: "lower", severity: "warning" },
    { value: 25, side: "lower", severity: "alarm" },
  ],
};

const TOURS: Tour[] = [
  { tour: "T-01", load: 72 },
  { tour: "T-02", load: 104 },
  { tour: "T-03", load: 18 },
  { tour: "T-04", load: 93 },
  { tour: "T-05", load: null },
];

function Tours({ sortBy }: { sortBy: "verdict" | "value" }) {
  const { Table, Column, VerdictColumn } = useTable(TOURS, {
    rowKey: (t) => t.tour,
    defaultSort: { column: "load", direction: "desc" },
  });
  return (
    <Table ariaLabel={sortBy === "verdict" ? "Tours by verdict" : "Tours by load"}>
      <Column value="tour" label="Tour" rowHeader />
      <VerdictColumn value="load" label="Load (%)" limits={LOAD} sortBy={sortBy} />
    </Table>
  );
}

export default function SortByVerdictOrByValue() {
  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          By verdict (the default)
        </Text>
        <Tours sortBy="verdict" />
      </Stack>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          By value
        </Text>
        <Tours sortBy="value" />
      </Stack>
    </Stack>
  );
}
