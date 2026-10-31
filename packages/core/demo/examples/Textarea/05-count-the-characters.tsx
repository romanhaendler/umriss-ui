import { useState } from "react";
import { FormField, Grid, Textarea } from "../../../src";

export const title = "Count the characters";
export const lead = "Set `showCount` with a `maxLength` where a text goes somewhere short, such as a status page or a text message.";

export default function CountTheCharacters() {
  const [status, setStatus] = useState("Payments are slower than usual. We are on it.");
  const [sms, setSms] = useState(
    "Checkout is degraded since 09:40; release 4.18 rolled back, error rate falling, next update at 11:00 on the status page.",
  );

  return (
    <Grid minItemWidth="260px" gap={4}>
      <FormField label="Status page headline">
        <Textarea showCount maxLength={80} rows={2} value={status} onValueChange={setStatus} />
      </FormField>
      <FormField label="Text message to on-call" hint="Set from outside, past the limit.">
        <Textarea showCount maxLength={100} rows={3} value={sms} onValueChange={setSms} />
      </FormField>
    </Grid>
  );
}
