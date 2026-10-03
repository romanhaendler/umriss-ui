import { useState } from "react";
import { FormField, Select } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out.";

export default function WithAnError() {
  /* The supplier invoices from Austria, so only reverse charge is right. */
  const [rate, setRate] = useState("19");
  const error = rate === "0" ? undefined : "Invoices from abroad are booked with reverse charge.";

  return (
    <FormField label="VAT rate, Alpenholz GmbH (Austria)" error={error} style={{ maxWidth: 360 }}>
      <Select value={rate} onChange={(event) => setRate(event.target.value)} invalid={error !== undefined}>
        <option value="19">19 %</option>
        <option value="7">7 %</option>
        <option value="0">Reverse charge</option>
      </Select>
    </FormField>
  );
}
