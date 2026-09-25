import { Checkbox, FormField, Grid, Stack } from "../../../src";

export const title = "States";
export const lead = "Unchecked, checked and mixed, each also `disabled`; an `error` on the surrounding `FormField` marks the box invalid.";

export default function States() {
  return (
    <Grid minItemWidth="240px" gap={5}>
      <Stack gap={3}>
        <Checkbox label="Leave at the door" />
        <Checkbox label="Fragile" defaultChecked />
        <Checkbox label="All parcels of the tour" indeterminate />
      </Stack>
      <Stack gap={3}>
        <Checkbox label="Cash on delivery" disabled />
        <Checkbox label="Proof of delivery photo" disabled defaultChecked />
        <Checkbox label="Hazardous goods" disabled indeterminate />
      </Stack>
      <Stack gap={3}>
        <FormField label="Terms" error="Accept the carrier terms to book the pick-up.">
          <Checkbox label="I accept the carrier terms" />
        </FormField>
        <Checkbox label="Call the consignee thirty minutes before arrival, and again from the kerb if nobody answers the door on the first ring" />
      </Stack>
    </Grid>
  );
}
