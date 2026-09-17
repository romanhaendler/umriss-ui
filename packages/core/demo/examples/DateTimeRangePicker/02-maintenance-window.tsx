import { useState } from "react";
import { DateTimeRangePicker, FormField, Grid } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "With seconds, without presets";

/* The footer counts along live: days while the days are being chosen, the exact
   duration as soon as both times stand. For a maintenance window that is
   precisely the number it is all about. */
export default function MaintenanceWindow() {
  const [maintenance, setMaintenance] = useState<DateRange | null>(null);

  return (
    <Grid minItemWidth="280px" gap={4}>
      <FormField label="Maintenance window" hint="With seconds; the duration runs along in the footer.">
        <DateTimeRangePicker
          value={maintenance}
          onChange={setMaintenance}
          withSeconds
          clearable
          presets={[]}
        />
      </FormField>
      <FormField label="Disabled" hint="Deactivated.">
        <DateTimeRangePicker value={null} onChange={() => {}} disabled />
      </FormField>
    </Grid>
  );
}
