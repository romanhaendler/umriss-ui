import { FormField, Grid, Select } from "../../../src";

export const title = "States";
export const lead = "`selectSize=\"sm\"` suits dense forms; errors come from the `FormField`, and a long option is cut at the field's edge.";

export default function States() {
  return (
    <Grid minItemWidth="220px" gap={4}>
      <FormField label="Month" hint="Small size.">
        <Select selectSize="sm" defaultValue="2026-03">
          <option value="2026-01">January 2026</option>
          <option value="2026-02">February 2026</option>
          <option value="2026-03">March 2026</option>
        </Select>
      </FormField>
      <FormField label="VAT rate" error="Invoices from abroad are booked with reverse charge.">
        <Select defaultValue="19">
          <option value="19">19 %</option>
          <option value="7">7 %</option>
          <option value="0">Reverse charge</option>
        </Select>
      </FormField>
      <FormField label="Approver" hint="Set by the cost centre.">
        <Select disabled defaultValue="rafael">
          <option value="rafael">Rafael Ortiz</option>
        </Select>
      </FormField>
      <FormField label="Booking text">
        <Select defaultValue="long">
          <option value="long">Accrual for the annual audit fee, split over twelve months and released in December</option>
          <option value="short">Audit fee</option>
        </Select>
      </FormField>
    </Grid>
  );
}
