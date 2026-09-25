import { FormField, Input } from "../../../src";

export const title = "Label and hint";
export const lead = "Give every field a `label`; a `hint` below it says what the field expects and is read out with it.";

export default function LabelAndHint() {
  return (
    <FormField label="Cost centre" hint="As on the budget sheet, for example CC-2100." style={{ maxWidth: 360 }}>
      <Input placeholder="CC-0000" />
    </FormField>
  );
}
