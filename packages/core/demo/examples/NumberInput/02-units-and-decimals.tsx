import { useState } from "react";
import { FormField, Grid, NumberInput } from "../../../src";

export const title = "Units and decimals";
export const lead = "Put the unit in `prefix` or `suffix`, inside the field, and fix the places with `decimals`.";

export default function UnitsAndDecimals() {
  const [budget, setBudget] = useState<number | null>(68000);
  const [discount, setDiscount] = useState<number | null>(2.5);
  const [variance, setVariance] = useState<number | null>(-4.25);

  return (
    <Grid minItemWidth="200px" gap={4}>
      <FormField label="Monthly budget" hint="Whole euros, step 500.">
        <NumberInput value={budget} onChange={setBudget} min={0} decimals={0} step={500} suffix="€" />
      </FormField>
      <FormField label="Early payment discount" hint="One decimal place.">
        <NumberInput value={discount} onChange={setDiscount} min={0} max={10} decimals={1} step={0.5} suffix="%" />
      </FormField>
      <FormField label="Forecast variance" hint="Negative allowed.">
        <NumberInput value={variance} onChange={setVariance} decimals={2} step={0.25} prefix="±" suffix="%" />
      </FormField>
    </Grid>
  );
}
