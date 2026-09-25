import { FormField, Grid, Input } from "../../../src";

export const title = "Show an error";
export const lead = "Pass `error` once a value fails your check; it replaces the hint and marks the field invalid.";

export default function ShowAnError() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Cost centre" hint="As on the budget sheet, for example CC-2100.">
        <Input defaultValue="CC-2100" />
      </FormField>
      <FormField
        label="Cost centre"
        hint="As on the budget sheet, for example CC-2100."
        error="CC-2700 is not on the budget sheet."
      >
        <Input defaultValue="CC-2700" />
      </FormField>
      <FormField
        label="Reason for the overspend, as the budget owner will read it in the monthly review"
        error="Give a reason of at least ten characters, so the review can follow the decision without asking again."
      >
        <Input defaultValue="Events" />
      </FormField>
    </Grid>
  );
}
