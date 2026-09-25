import { useState } from "react";
import { DateTimeRangePicker, FormField, Grid } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "States";
export const lead = "`size=\"sm\"` suits dense forms; errors come from the `FormField`, and `disabled` locks field and panel.";

export default function States() {
  const [freeze, setFreeze] = useState<DateRange | null>(null);
  const [downtime, setDowntime] = useState<DateRange | null>({
    from: new Date(2026, 2, 21, 2, 0),
    to: new Date(2026, 2, 21, 6, 0),
  });

  return (
    <Grid minItemWidth="260px" gap={4}>
      <FormField label="Release freeze" hint="Small size.">
        <DateTimeRangePicker size="sm" value={freeze} onChange={setFreeze} clearable />
      </FormField>
      <FormField label="Planned downtime, Search" error="Overlaps the downtime of Checkout, 03:00 to 04:00.">
        <DateTimeRangePicker value={downtime} onChange={setDowntime} clearable />
      </FormField>
      <FormField label="Downtime, last quarter" hint="Closed.">
        <DateTimeRangePicker
          value={{ from: new Date(2025, 11, 6, 1, 0), to: new Date(2025, 11, 6, 3, 30) }}
          onChange={() => {}}
          disabled
        />
      </FormField>
    </Grid>
  );
}
