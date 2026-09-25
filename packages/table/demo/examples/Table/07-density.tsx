import { UmrissProvider, Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Density";
export const lead = "`density=\"compact\"` sets one table; an application that wants it dense everywhere says so once at the `UmrissProvider`.";

interface Service {
  name: string;
  team: string;
  p95: number;
}

const SERVICES: Service[] = [
  { name: "Checkout", team: "Payments", p95: 412 },
  { name: "Billing", team: "Payments", p95: 238 },
  { name: "Sign-in", team: "Identity", p95: 141 },
];

function Services({ caption, density }: { caption: string; density?: "regular" | "compact" }) {
  const { Table, Column } = useTable(SERVICES, { rowKey: (s) => s.name });
  return (
    <Stack gap={2}>
      <Text size="xs" tone="muted">
        {caption}
      </Text>
      <Table density={density} ariaLabel={`Services, ${caption}`}>
        <Column value="name" label="Service" rowHeader />
        <Column value="team" label="Team" />
        <Column value="p95" label="p95 latency (ms)" />
      </Table>
    </Stack>
  );
}

export default function Density() {
  return (
    <Stack gap={5}>
      <Services caption="Without a statement: regular" />
      <Services caption='density="compact"' density="compact" />
      <UmrissProvider density="compact">
        <Services caption="From the UmrissProvider: compact" />
      </UmrissProvider>
    </Stack>
  );
}
