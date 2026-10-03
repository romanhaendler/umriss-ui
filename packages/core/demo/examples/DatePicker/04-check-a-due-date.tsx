import { useState } from "react";
import { DatePicker, FormField, Grid } from "../../../src";

export const title = "Check a due date";
export const lead = "Compare two pickers' values as plain dates, since both lie at local midnight, and put the result in the `FormField`.";

const DAY = 24 * 60 * 60 * 1000;

export default function CheckADueDate() {
  const [issued, setIssued] = useState<Date | null>(new Date(2026, 2, 2));
  const [due, setDue] = useState<Date | null>(new Date(2026, 1, 27));

  const term = issued && due ? Math.round((due.getTime() - issued.getTime()) / DAY) : null;
  const error = term !== null && term < 0 ? "The due date lies before the invoice date." : undefined;
  const hint = term !== null && term >= 0 ? `Payment term: ${term} days.` : undefined;

  return (
    <Grid minItemWidth="220px" gap={4} style={{ maxWidth: 520 }}>
      <FormField label="Invoice date">
        <DatePicker value={issued} onChange={setIssued} />
      </FormField>
      <FormField label="Due" hint={hint} error={error}>
        <DatePicker value={due} onChange={setDue} />
      </FormField>
    </Grid>
  );
}
