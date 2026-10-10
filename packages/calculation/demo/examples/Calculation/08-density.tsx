import { Stack, Text, UmrissProvider } from "@umriss-ui/core";
import { Calculation, Given, Sum } from "../../../src";

export const title = "Density";
export const lead =
  "`density=\"compact\"` sets one calculation as close as a compact table; an application that wants it dense everywhere says so once at the `UmrissProvider`, and a calculation's own `density` wins over it.";

function Downtime({ caption, density }: { caption: string; density?: "regular" | "compact" }) {
  return (
    <Stack gap={2}>
      <Text size="xs" tone="muted">
        {caption}
      </Text>
      <Calculation density={density} aria-label={`Downtime of Checkout in March, ${caption}`}>
        <Sum label="Downtime" unit="min" target={45}>
          <Sum label="Unplanned outages" unit="min">
            <Given label="Database failover" value={11} unit="min" />
            <Given label="Failed deployment" value={18} unit="min" />
          </Sum>
          <Given label="Maintenance window" value={24} unit="min" limits={[{ value: 20, side: "upper", severity: "warning" }]} />
          <Given label="Certificate renewal" value={12} unit="min" />
        </Sum>
      </Calculation>
    </Stack>
  );
}

export default function Density() {
  return (
    <Stack gap={5}>
      <Downtime caption="Without a statement: regular" />
      <Downtime caption='density="compact"' density="compact" />
      <UmrissProvider density="compact">
        <Downtime caption="From the UmrissProvider: compact" />
        <Downtime caption='density="regular" under that provider: regular' density="regular" />
      </UmrissProvider>
    </Stack>
  );
}
