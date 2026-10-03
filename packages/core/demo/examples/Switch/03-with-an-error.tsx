import { useState } from "react";
import { FormField, Switch } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the switch turns red and reads the reason out.";

export default function WithAnError() {
  const [paging, setPaging] = useState(false);
  const error = paging ? undefined : "A tier 1 service has to page its on-call engineer.";

  return (
    <FormField label="Paging, Checkout (tier 1)" error={error}>
      <Switch
        label="Page on-call"
        checked={paging}
        onChange={(event) => setPaging(event.target.checked)}
        invalid={error !== undefined}
      />
    </FormField>
  );
}
