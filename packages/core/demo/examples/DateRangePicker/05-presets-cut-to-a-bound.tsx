import { useState } from "react";
import { DateRangePicker, FormField } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "Presets cut to a bound";
export const lead = "A preset that overlaps `min` or `max` is cut to the range, and one wholly outside is disabled: with `min` the first of this month and `max` today, \"Previous month\" is disabled and \"This month\" ends today.";

export default function PresetsCutToABound() {
  const [report, setReport] = useState<DateRange | null>(null);
  const today = new Date();

  return (
    <div style={{ maxWidth: 320 }}>
      <FormField label="Report" hint="This month, up to today.">
        <DateRangePicker value={report} onChange={setReport} min={new Date(today.getFullYear(), today.getMonth(), 1)} max={today} clearable />
      </FormField>
    </div>
  );
}
