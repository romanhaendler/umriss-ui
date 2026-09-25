import { useState } from "react";
import { FormField, Grid, NumberInput, Text } from "../../../src";

export const title = "States";
export const lead = "An empty field reports `null`, not zero; errors come from the `FormField`, and `disabled` holds the figure fixed.";

export default function States() {
  const [actual, setActual] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | null>(0);

  return (
    <Grid minItemWidth="220px" gap={4}>
      <FormField label="Actual, March" hint="Not booked yet.">
        <NumberInput value={actual} onChange={setActual} decimals={0} suffix="€" />
        <Text size="xs" tone="muted" mono>
          value: {actual === null ? "null" : actual}
        </Text>
      </FormField>
      <FormField label="Quantity" error="An invoice line needs at least one unit.">
        <NumberInput value={quantity} onChange={setQuantity} min={0} decimals={0} />
      </FormField>
      <FormField label="VAT rate" hint="Set by the tax code.">
        <NumberInput value={19} onChange={() => {}} disabled suffix="%" />
      </FormField>
      <FormField label="Annual budget, all cost centres" hint="Small size, a long figure.">
        <NumberInput size="sm" value={9_048_000.5} onChange={() => {}} decimals={2} suffix="€" />
      </FormField>
    </Grid>
  );
}
