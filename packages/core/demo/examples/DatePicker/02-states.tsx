import { useState } from "react";
import { DatePicker, FormField, Grid } from "../../../src";

export const title = "States";

export default function States() {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [effectiveDate, setEffectiveDate] = useState<Date | null>(new Date(2020, 0, 15));

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Deadline" hint="Compact size (sm).">
        <DatePicker size="sm" value={deadline} onChange={setDeadline} clearable />
      </FormField>
      <FormField label="Effective date" error="The effective date must not lie in the past.">
        <DatePicker value={effectiveDate} onChange={setEffectiveDate} clearable />
      </FormField>
      <FormField label="Billing date" hint="Deactivated.">
        <DatePicker value={null} onChange={() => {}} disabled />
      </FormField>
    </Grid>
  );
}
