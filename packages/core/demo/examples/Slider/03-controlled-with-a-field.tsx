import { useState } from "react";
import { FormField, NumberInput, Slider, Stack } from "../../../src";

export const title = "Controlled, beside a number field";

/* The slider sets the value roughly, the number field exactly - both show one
   state the caller holds. `onChange` reports a number that is already on the
   step and inside the bounds, by pointer and by key alike. */
export default function ControlledWithAField() {
  const [pressure, setPressure] = useState(4.2);

  return (
    <Stack gap={3} style={{ maxWidth: 420 }}>
      <FormField label="Line pressure">
        <Slider
          min={0}
          max={10}
          step={0.1}
          value={pressure}
          onChange={setPressure}
          format={(v) => `${v.toFixed(1)} bar`}
          marks={[{ value: 0, label: "0" }, { value: 6, label: "Max. operating" }, { value: 10, label: "10" }]}
        />
      </FormField>
      <FormField label="Exact value">
        <NumberInput
          value={pressure}
          onChange={(v) => setPressure(v ?? 0)}
          min={0}
          max={10}
          step={0.1}
          decimals={1}
          suffix="bar"
        />
      </FormField>
    </Stack>
  );
}
