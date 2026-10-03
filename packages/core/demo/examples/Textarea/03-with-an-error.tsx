import { useState } from "react";
import { FormField, Textarea } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out.";

export default function WithAnError() {
  const [rootCause, setRootCause] = useState("Unknown");
  const error = rootCause.trim().length < 10 ? "Give the root cause in at least ten characters." : undefined;

  return (
    <FormField label="Root cause" error={error} style={{ maxWidth: 420 }}>
      <Textarea
        rows={3}
        value={rootCause}
        onChange={(event) => setRootCause(event.target.value)}
        invalid={error !== undefined}
      />
    </FormField>
  );
}
