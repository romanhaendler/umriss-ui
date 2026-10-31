import { useState } from "react";
import { FormField, RangeSlider, Stack, Text } from "../../../src";

export const title = "Units and the state";
export const lead = "`format` writes both ends for the readout and the screen reader; `value` and `onValueChange` hand the pair to the application.";

export default function UnitsAndTheState() {
  const [band, setBand] = useState<readonly [number, number]>([2.5, 4]);
  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <FormField label="Pressure window">
        <RangeSlider min={0} max={6} step={0.1} value={band} onValueChange={setBand} format={(v) => `${v.toFixed(1)} bar`} />
      </FormField>
      <Text size="sm">
        Alarm below {band[0]} bar and above {band[1]} bar.
      </Text>
    </Stack>
  );
}
