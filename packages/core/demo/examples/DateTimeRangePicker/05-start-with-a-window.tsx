import { DateTimeRangePicker, FormField } from "../../../src";

export const title = "Start with a window";
export const lead = "`defaultValue` is the window an uncontrolled picker starts with; `startName` and `endName` post both ends with a form.";

export default function StartWithAWindow() {
  return (
    <FormField label="Planned downtime" style={{ maxWidth: 360 }}>
      <DateTimeRangePicker
        startName="downtimeFrom"
        endName="downtimeTo"
        defaultValue={{ from: new Date(2026, 2, 17, 22, 0), to: new Date(2026, 2, 18, 2, 0) }}
        clearable
      />
    </FormField>
  );
}
