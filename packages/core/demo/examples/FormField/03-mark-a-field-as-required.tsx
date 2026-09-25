import { Checkbox, FormField, Grid, Input } from "../../../src";

export const title = "Mark a field as required";
export const lead = "Set `required` for the mark on the label and `aria-required` on the field; checking the value stays yours.";

export default function MarkAFieldAsRequired() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Invoice number" required>
        <Input placeholder="INV-0000" />
      </FormField>
      <FormField label="Purchase order" hint="Optional.">
        <Input placeholder="PO-0000" />
      </FormField>
      <FormField label="Approval" required>
        <Checkbox label="I checked the amounts against the delivery note" />
      </FormField>
    </Grid>
  );
}
