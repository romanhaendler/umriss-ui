import { useState } from "react";
import { DateRangePicker, FormField, Grid } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "States";
export const lead = "`size=\"sm\"` suits dense forms; errors come from the `FormField`, and `disabled` locks field and calendar.";

export default function States() {
  const [training, setTraining] = useState<DateRange | null>({ from: new Date(2026, 3, 13), to: new Date(2026, 3, 14) });
  const [leave, setLeave] = useState<DateRange | null>({ from: new Date(2026, 2, 16), to: new Date(2026, 2, 27) });

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Training" hint="Small size.">
        <DateRangePicker size="sm" value={training} onChange={setTraining} clearable />
      </FormField>
      <FormField label="Leave" error="Chloe Durand is already on leave from 23 March.">
        <DateRangePicker value={leave} onChange={setLeave} clearable />
      </FormField>
      <FormField label="Sprint 14" hint="Set by the sprint plan.">
        <DateRangePicker value={{ from: new Date(2026, 2, 9), to: new Date(2026, 2, 20) }} onChange={() => {}} disabled />
      </FormField>
    </Grid>
  );
}
