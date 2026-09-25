import { FormField, Grid, Textarea } from "../../../src";

export const title = "States";
export const lead = "Errors come from the `FormField`; `size=\"sm\"` suits dense forms, and `disabled` text stays readable but fixed.";

export default function States() {
  return (
    <Grid minItemWidth="260px" gap={4}>
      <FormField label="Customer impact" hint="Fixed height, draggable downwards.">
        <Textarea
          rows={4}
          defaultValue={"Checkout answered slowly from 09:40 to 10:10.\nAbout one payment in twelve timed out and was retried by the customer."}
        />
      </FormField>
      <FormField label="Next update" hint="Small size.">
        <Textarea size="sm" rows={2} placeholder="When and where the next update goes out" />
      </FormField>
      <FormField label="Root cause" error="Give the root cause in at least ten characters.">
        <Textarea rows={2} defaultValue="Unknown" />
      </FormField>
      <FormField label="Timeline" hint="Written by the incident bot.">
        <Textarea rows={2} disabled defaultValue="09:41 Alert fired: Checkout p95 above 300 ms." />
      </FormField>
    </Grid>
  );
}
