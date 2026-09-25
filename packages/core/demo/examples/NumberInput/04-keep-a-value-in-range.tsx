import { useState } from "react";
import { FormField, Grid, NumberInput } from "../../../src";

export const title = "Keep a value in range";
export const lead = "Set `min` and `max`: what `onChange` reports is always clamped, and the text follows when the field is left.";

export default function KeepAValueInRange() {
  const [capacity, setCapacity] = useState<number | null>(32);
  const [focus, setFocus] = useState<number | null>(60);

  return (
    <Grid minItemWidth="220px" gap={4}>
      <FormField label="Capacity, Kofi Mensah" hint="0 to 48 hours a week; arrows count, Shift ×10.">
        <NumberInput value={capacity} onChange={setCapacity} min={0} max={48} decimals={0} suffix="h" />
      </FormField>
      <FormField label="Share for project work" hint="0 to 100 %, step 5.">
        <NumberInput value={focus} onChange={setFocus} min={0} max={100} step={5} decimals={0} suffix="%" />
      </FormField>
    </Grid>
  );
}
