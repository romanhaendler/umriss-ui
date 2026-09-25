import { useState } from "react";
import { FormField, NumberInput } from "../../../src";

export const title = "Number field";
export const lead = "The value is a number or `null`; the field writes it in the formats' notation and reads it back.";

export default function NumberField() {
  const [weight, setWeight] = useState<number | null>(18.5);

  return (
    <FormField label="Parcel weight" style={{ maxWidth: 240 }}>
      <NumberInput value={weight} onChange={setWeight} min={0} decimals={1} suffix="kg" />
    </FormField>
  );
}
