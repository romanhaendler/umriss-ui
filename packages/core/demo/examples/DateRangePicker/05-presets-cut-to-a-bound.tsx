import { useState } from "react";
import { DateRangePicker, FormField } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "Presets cut to a bound";
export const lead = "A preset that overlaps `min` or `max` is cut to the range, and one wholly outside is disabled: with `max` today, \"This month\" ends today and \"Yesterday\" stays.";

export default function PresetsCutToABound() {
  const [report, setReport] = useState<DateRange | null>(null);

  return (
    <div style={{ maxWidth: 320 }}>
      <FormField label="Report" hint="Up to today.">
        <DateRangePicker value={report} onChange={setReport} max={new Date()} clearable />
      </FormField>
    </div>
  );
}
