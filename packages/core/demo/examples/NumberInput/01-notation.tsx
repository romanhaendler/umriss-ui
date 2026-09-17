import { useState } from "react";
import { FormField, Grid, NumberInput } from "../../../src";

export const title = "German notation";

/* A comma as the decimal separator, dots as thousands separators. The dots are
   set on leaving the field and tolerated while typing - whoever enters a number
   should not have to type against the formatting.

   The notation follows the shipped formats, and those are German until the
   library ships a second wording (english-and-umriss-ui 13).

   `prefix` and `suffix` stand inside the field and not beside it: a unit that
   stands far from its number gets lost in the reading. */
export default function Notation() {
  const [budget, setBudget] = useState<number | null>(128500);
  const [deviation, setDeviation] = useState<number | null>(-2.75);

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Budget" hint="Whole numbers, step 500.">
        <NumberInput value={budget} onChange={setBudget} min={0} decimals={0} step={500} suffix="€" />
      </FormField>
      <FormField label="Deviation" hint="Negative allowed, two decimal places.">
        <NumberInput
          value={deviation}
          onChange={setDeviation}
          decimals={2}
          step={0.25}
          prefix="±"
          suffix="%"
        />
      </FormField>
    </Grid>
  );
}
