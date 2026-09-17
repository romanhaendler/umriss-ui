import { UmrissProvider, Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Density: at the table or at the provider";

/* `density` sets one table. An application that wants it dense everywhere says
   so once at the `UmrissProvider` - and the alarm list then gets the same
   default.

   The order: the table's prop before the provider, the provider before
   "regular".

   The provider's prop is `density`; it belongs to @umriss-ui/core. */

interface Station {
  station: string;
  line: string;
  pieces: number;
}

const STATIONS: Station[] = [
  { station: "Saw 1", line: "Line 1", pieces: 412 },
  { station: "Mill 2", line: "Line 1", pieces: 388 },
  { station: "Lathe 1", line: "Line 2", pieces: 405 },
];

function Stations({ caption, density }: { caption: string; density?: "regular" | "compact" }) {
  const { Table, Column } = useTable(STATIONS, { rowKey: (s) => s.station });
  return (
    <Stack gap={2}>
      <Text size="xs" tone="muted">
        {caption}
      </Text>
      <Table density={density} ariaLabel={`Stations, ${caption}`}>
        <Column value="station" label="Station" rowHeader />
        <Column value="line" label="Line" />
        <Column value="pieces" label="Pieces" />
      </Table>
    </Stack>
  );
}

export default function Density() {
  return (
    <Stack gap={5}>
      <Stations caption="Without a statement: regular" />
      <Stations caption='density="compact"' density="compact" />
      <UmrissProvider density="compact">
        <Stations caption="From the UmrissProvider: compact" />
      </UmrissProvider>
    </Stack>
  );
}
