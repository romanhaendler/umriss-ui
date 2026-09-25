import { useState } from "react";
import { DatePicker, FormField, Grid } from "../../../src";

export const title = "States";
export const lead = "`size=\"sm\"` suits dense forms; errors come from the `FormField`, and `disabled` locks field and calendar.";

export default function States() {
  const [pickUp, setPickUp] = useState<Date | null>(new Date(2026, 2, 18));
  const [delivery, setDelivery] = useState<Date | null>(new Date(2026, 2, 16));

  return (
    <Grid minItemWidth="220px" gap={4}>
      <FormField label="Pick-up" hint="Small size.">
        <DatePicker size="sm" value={pickUp} onChange={setPickUp} clearable />
      </FormField>
      <FormField label="Delivery" error="The delivery date cannot lie before today.">
        <DatePicker value={delivery} onChange={setDelivery} clearable />
      </FormField>
      <FormField label="Delivered on" hint="Set by the driver's scan.">
        <DatePicker value={null} onChange={() => {}} disabled />
      </FormField>
      <FormField label="Return by" hint="Empty, with its own placeholder.">
        <DatePicker value={null} onChange={() => {}} placeholder="No return planned" />
      </FormField>
    </Grid>
  );
}
