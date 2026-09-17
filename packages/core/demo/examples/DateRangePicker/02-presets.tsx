import { useState } from "react";
import { DateRangePicker, FormField, Grid } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "Your own presets - and none";

/* Without anything given, the default presets stand on the left. `presets`
   replaces them; an empty array hides the column. Both are intended: which
   periods are usual in a plant only the caller knows.

   A preset carries a `range` - the field a caller writes its own presets
   against, which is exactly why it no longer carries a German name. */
export default function Presets() {
  const [sprint, setSprint] = useState<DateRange | null>(null);
  const [leave, setLeave] = useState<DateRange | null>(null);

  return (
    <Grid minItemWidth="260px" gap={4}>
      <FormField label="Sprint" hint="Your own presets through `presets`.">
        <DateRangePicker
          value={sprint}
          onChange={setSprint}
          clearable
          placeholder="Choose a sprint"
          presets={[
            {
              label: "Next 2 weeks",
              range: () => {
                const today = new Date();
                const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                return {
                  from,
                  to: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 13),
                };
              },
            },
            {
              label: "Rest of the month",
              range: () => {
                const today = new Date();
                return {
                  from: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                  to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
                };
              },
            },
          ]}
        />
      </FormField>
      <FormField label="Leave" hint="Without presets (presets empty), compact size.">
        <DateRangePicker size="sm" value={leave} onChange={setLeave} presets={[]} />
      </FormField>
      <FormField label="Billing period" hint="Deactivated.">
        <DateRangePicker value={null} onChange={() => {}} disabled />
      </FormField>
    </Grid>
  );
}
