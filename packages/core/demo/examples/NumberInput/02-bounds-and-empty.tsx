import { useState } from "react";
import { FormField, Grid, NumberInput, Text } from "../../../src";

export const title = "Bounds, step and emptiness";

/* `min` and `max` clamp on leaving the field, not while typing: whoever wants
   to enter "100" types "1" first, and that must not jump to the minimum at
   once.

   Arrow keys count, Shift multiplies by ten, holding repeats.

   `null` is not zero. An empty field means "no figure given", and a quantity
   that was not measured is not a quantity of zero - which is why the value has
   this third state and not only numbers. */
export default function BoundsAndEmpty() {
  const [target, setTarget] = useState<number | null>(82.5);
  const [hours, setHours] = useState<number | null>(null);

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Target utilisation" hint="One decimal place, clamped to 0-100.">
        <NumberInput value={target} onChange={setTarget} min={0} max={100} decimals={1} suffix="%" />
      </FormField>
      <FormField label="Weekly hours" hint="Empty means: no figure given.">
        <Text size="xs" tone="muted">
          Value: {hours === null ? "null" : hours}
        </Text>
        <NumberInput
          size="sm"
          value={hours}
          onChange={setHours}
          min={0}
          max={48}
          decimals={0}
          suffix="h"
        />
      </FormField>
      <FormField label="Fixed value" hint="Deactivated.">
        <NumberInput value={100} onChange={() => {}} disabled suffix="%" />
      </FormField>
    </Grid>
  );
}
