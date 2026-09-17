import { useState } from "react";
import { DateTimePicker, FormField, Grid } from "../../../src";

export const title = "With seconds, and the states";

/* `withSeconds` adds a third time field. It is not a display question: a
   measurement instant without seconds is a different value from one with. */
export default function WithSeconds() {
  const [measuredAt, setMeasuredAt] = useState<Date | null>(null);
  const [compact, setCompact] = useState<Date | null>(null);

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Measurement instant" hint="With seconds.">
        <DateTimePicker value={measuredAt} onChange={setMeasuredAt} withSeconds />
      </FormField>
      <FormField label="Compact" hint="Compact size (sm).">
        <DateTimePicker size="sm" value={compact} onChange={setCompact} clearable />
      </FormField>
      <FormField label="Disabled" hint="Deactivated.">
        <DateTimePicker value={null} onChange={() => {}} disabled />
      </FormField>
    </Grid>
  );
}
