import { FormField, Input } from "../../../src";

export const title = "Text field";
export const lead = "Wrap the field in a `FormField` for its label; the field takes every attribute of the native input.";

export default function TextField() {
  return (
    <FormField label="Consignee" style={{ maxWidth: 360 }}>
      <Input placeholder="Company or person" autoComplete="organization" />
    </FormField>
  );
}
