import { FormField, TimeInput } from "../../../src";

export const title = "TimeInput";
export const lead = "Use a time input for a time of day alone, without a date; hours and minutes type themselves onwards and the arrow keys count.";

export default function AStartTime() {
  return (
    <FormField label="Shift starts" hint="24-hour clock.">
      <TimeInput defaultValue="06:00" />
    </FormField>
  );
}
