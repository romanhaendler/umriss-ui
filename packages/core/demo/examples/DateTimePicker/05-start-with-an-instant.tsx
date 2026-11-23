import { DateTimePicker, FormField } from "../../../src";

export const title = "Start with an instant";
export const lead = "`defaultValue` is the instant an uncontrolled picker starts with; add `name` to post it with a form.";

export default function StartWithAnInstant() {
  return (
    <FormField label="Maintenance starts" style={{ maxWidth: 320 }}>
      <DateTimePicker name="starts" defaultValue={new Date(2026, 2, 17, 22, 0)} clearable />
    </FormField>
  );
}
