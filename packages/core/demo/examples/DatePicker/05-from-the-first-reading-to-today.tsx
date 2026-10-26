import { useState } from "react";
import { DatePicker, FormField } from "../../../src";

export const title = "From the first reading to today";
export const lead = "`min` and `max` are inclusive, by day: the year list, the month list, the arrows, the grid, Today and the typed date all keep to them.";

export default function FromTheFirstReadingToToday() {
  const [day, setDay] = useState<Date | null>(null);

  return (
    <div style={{ maxWidth: 320 }}>
      <FormField label="Reading" hint="From 1 March 2020 to today.">
        <DatePicker value={day} onChange={setDay} min={new Date(2020, 2, 1)} max={new Date()} clearable />
      </FormField>
    </div>
  );
}
