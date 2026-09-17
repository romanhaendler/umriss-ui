import { Stack, Text } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Sorted by verdict weight – or by the value";

/* A verdict column sorts by how heavily the verdict weighs: ok, unknown,
   warning, alarm. Descending, the worst stands on top - an alarm below the lower
   bound next to the one above the upper, instead of at the other end of the list
   among the small values. Where two weigh the same, the previous order stays.

   `sortBy="value"` sorts by the measured value instead. Both tables here are
   sorted descending by temperature.

   The field names of the limit set stay German: it is the wire format
   @umriss-ui/core and @umriss-ui/charts agree on. */

interface Furnace {
  furnace: string;
  temperature: number | null;
}

const TEMPERATURE: LimitSet = {
  limits: [
    { value: 880, side: "upper", severity: "warning" },
    { value: 900, side: "upper", severity: "alarm" },
    { value: 820, side: "lower", severity: "warning" },
    { value: 800, side: "lower", severity: "alarm" },
  ],
};

const FURNACES: Furnace[] = [
  { furnace: "Furnace 1", temperature: 846 },
  { furnace: "Furnace 2", temperature: 912 },
  { furnace: "Furnace 3", temperature: 781 },
  { furnace: "Furnace 4", temperature: 887 },
  { furnace: "Furnace 5", temperature: null },
];

function Furnaces({ sortBy }: { sortBy: "verdict" | "value" }) {
  const { Table, Column, VerdictColumn } = useTable(FURNACES, {
    rowKey: (f) => f.furnace,
    defaultSort: { column: "temperature", direction: "desc" },
  });
  return (
    <Table ariaLabel={sortBy === "verdict" ? "Furnaces by verdict weight" : "Furnaces by value"}>
      <Column value="furnace" label="Furnace" rowHeader />
      <VerdictColumn value="temperature" label="Temperature (°C)" limits={TEMPERATURE} sortBy={sortBy} />
    </Table>
  );
}

export default function Sorting() {
  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          sortBy=&quot;verdict&quot; (default)
        </Text>
        <Furnaces sortBy="verdict" />
      </Stack>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          sortBy=&quot;value&quot;
        </Text>
        <Furnaces sortBy="value" />
      </Stack>
    </Stack>
  );
}
