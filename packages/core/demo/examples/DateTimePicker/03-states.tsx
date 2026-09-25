import { useState } from "react";
import { DateTimePicker, FormField, Grid } from "../../../src";

export const title = "States";
export const lead = "`size=\"sm\"` suits dense forms; errors come from the `FormField`, and `disabled` locks field and panel.";

export default function States() {
  const [acknowledged, setAcknowledged] = useState<Date | null>(new Date(2026, 2, 17, 9, 46));
  const [resolved, setResolved] = useState<Date | null>(new Date(2026, 2, 17, 9, 30));

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Acknowledged" hint="Small size.">
        <DateTimePicker size="sm" value={acknowledged} onChange={setAcknowledged} clearable />
      </FormField>
      <FormField label="Resolved" error="Resolved lies before the incident was opened at 09:42.">
        <DateTimePicker value={resolved} onChange={setResolved} clearable />
      </FormField>
      <FormField label="Opened" hint="Set by the alert.">
        <DateTimePicker value={new Date(2026, 2, 17, 9, 42)} onChange={() => {}} disabled />
      </FormField>
    </Grid>
  );
}
