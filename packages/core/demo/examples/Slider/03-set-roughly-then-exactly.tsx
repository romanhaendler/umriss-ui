import { useState } from "react";
import { FormField, NumberInput, Slider, Stack } from "../../../src";

export const title = "Set roughly, then exactly";
export const lead = "Control it with `value` and `onChange` and put a `NumberInput` beside it on the same state for the exact figure.";

export default function SetRoughlyThenExactly() {
  const [hours, setHours] = useState(32);

  return (
    <Stack gap={3} style={{ maxWidth: 420 }}>
      <FormField label="Weekly capacity, Kofi Mensah">
        <Slider
          min={0}
          max={48}
          value={hours}
          onChange={setHours}
          showValue={false}
          format={(v) => `${v} h`}
          marks={[{ value: 0, label: "0" }, { value: 40, label: "Full time" }, { value: 48, label: "48" }]}
        />
      </FormField>
      <FormField label="Exact hours">
        <NumberInput value={hours} onChange={(v) => setHours(v ?? 0)} min={0} max={48} decimals={0} suffix="h" />
      </FormField>
    </Stack>
  );
}
