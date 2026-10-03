import { useState } from "react";
import { FormField, Input } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out. Five digits clear it.";

export default function WithAnError() {
  const [postcode, setPostcode] = useState("2041");
  const error = /^\d{5}$/.test(postcode) ? undefined : "A postcode here has five digits.";

  return (
    <FormField label="Postcode" error={error} style={{ maxWidth: 360 }}>
      <Input
        value={postcode}
        onChange={(event) => setPostcode(event.target.value)}
        invalid={error !== undefined}
        inputMode="numeric"
        autoComplete="postal-code"
      />
    </FormField>
  );
}
