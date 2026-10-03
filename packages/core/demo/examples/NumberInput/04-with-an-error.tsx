import { useState } from "react";
import { FormField, NumberInput } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out.";

export default function WithAnError() {
  const [quantity, setQuantity] = useState<number | null>(0);
  const error = quantity === null || quantity < 1 ? "An invoice line needs at least one unit." : undefined;

  return (
    <FormField label="Quantity" error={error} style={{ maxWidth: 280 }}>
      <NumberInput value={quantity} onChange={setQuantity} min={0} decimals={0} invalid={error !== undefined} />
    </FormField>
  );
}
