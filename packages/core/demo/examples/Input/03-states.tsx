import { FormField, Grid, Input } from "../../../src";

export const title = "States";
export const lead = "An `error` on the `FormField` marks the field invalid; `disabled` and `readOnly` behave as on the native input.";

export default function States() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Street" required>
        <Input placeholder="Street and number" autoComplete="street-address" />
      </FormField>
      <FormField label="Postcode" error="A postcode here has five digits.">
        <Input defaultValue="2041" />
      </FormField>
      <FormField label="Depot" hint="Set by the tour, not editable.">
        <Input value="North depot" readOnly />
      </FormField>
      <FormField label="Vehicle" hint="Disabled until a tour is chosen.">
        <Input disabled placeholder="FP 000 X" />
      </FormField>
      <FormField label="Delivery instructions" hint="A long value scrolls inside the field.">
        <Input defaultValue="Holloway Garden Supplies, goods entrance at the rear, ring twice, ask for the warehouse lead on duty" />
      </FormField>
    </Grid>
  );
}
