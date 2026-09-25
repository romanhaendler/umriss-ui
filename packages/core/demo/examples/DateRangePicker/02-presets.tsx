import { useState } from "react";
import { DateRangePicker, FormField, Grid } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "Presets";
export const lead = "Pass `presets` for the spans your users pick most; an empty list hides the column, and none gives the defaults.";

const fromToday = (days: number): DateRange => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return { from, to: new Date(from.getFullYear(), from.getMonth(), from.getDate() + days - 1) };
};

export default function Presets() {
  const [sprint, setSprint] = useState<DateRange | null>(null);
  const [workshop, setWorkshop] = useState<DateRange | null>(null);
  const [report, setReport] = useState<DateRange | null>(null);

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Sprint" hint="Presets of your own.">
        <DateRangePicker
          value={sprint}
          onChange={setSprint}
          clearable
          placeholder="Choose a sprint"
          presets={[
            { label: "Next 2 weeks", range: () => fromToday(14) },
            { label: "Next 3 weeks", range: () => fromToday(21) },
          ]}
        />
      </FormField>
      <FormField label="Workshop" hint="No presets.">
        <DateRangePicker value={workshop} onChange={setWorkshop} presets={[]} />
      </FormField>
      <FormField label="Report" hint="The default presets.">
        <DateRangePicker value={report} onChange={setReport} />
      </FormField>
    </Grid>
  );
}
