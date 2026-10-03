import { useState } from "react";
import { Combobox, FormField } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out.";

const VEHICLES = [
  { value: "v1", label: "FP 214 K, van, North depot" },
  { value: "v2", label: "FP 377 K, e-van, North depot" },
  { value: "v4", label: "FP 402 R, van, Riverside depot" },
];

export default function WithAnError() {
  const [vehicle, setVehicle] = useState<string | null>(null);
  const error = vehicle === null ? "Tour T-04 needs a vehicle before it can be released." : undefined;

  return (
    <FormField label="Vehicle" error={error} style={{ maxWidth: 360 }}>
      <Combobox
        value={vehicle}
        onChange={setVehicle}
        options={VEHICLES}
        placeholder="Choose a vehicle"
        invalid={error !== undefined}
      />
    </FormField>
  );
}
