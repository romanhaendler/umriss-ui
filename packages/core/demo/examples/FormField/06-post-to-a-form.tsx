import { useState } from "react";
import { Button, Combobox, DatePicker, DateRangePicker, FormField, Grid, MultiSelect, NumberInput, Stack, Text } from "../../../src";

export const title = "Post to a form";
export const lead =
  "Give a field a `name` and a plain `<form>` - or a React 19 `<form action>` - receives its value in `FormData`, as it would from a native control: the Combobox its value and not its label, the dates as `YYYY-MM-DD`, a range as `<name>Start` and `<name>End` unless `startName` and `endName` say otherwise. `formValue` writes the value another way.";

const CENTRES = [
  { value: "CC-1200", label: "CC-1200 Marketing" },
  { value: "CC-2200", label: "CC-2200 Design" },
  { value: "CC-4300", label: "CC-4300 IT" },
];

export default function PostToAForm() {
  const [posted, setPosted] = useState<string[]>([]);

  return (
    <form
      action={(data) => setPosted([...data.entries()].map(([name, value]) => `${name} = ${String(value)}`))}
      style={{ maxWidth: 560 }}
    >
      <Stack gap={4}>
        <Grid minItemWidth="220px" gap={4}>
          <FormField label="Cost centre">
            <Combobox name="centre" options={CENTRES} defaultValue="CC-2200" />
          </FormField>
          <FormField label="Also booked on">
            <MultiSelect name="shared" options={CENTRES} defaultValue={["CC-1200", "CC-4300"]} />
          </FormField>
          <FormField label="Net amount">
            <NumberInput name="amount" defaultValue={4860.5} decimals={2} suffix="€" formValue={(amount) => amount.toFixed(2)} />
          </FormField>
          <FormField label="Due">
            <DatePicker name="due" defaultValue={new Date(2026, 9, 31)} />
          </FormField>
          <FormField label="Period">
            <DateRangePicker startName="periodFrom" endName="periodTo" defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) }} />
          </FormField>
        </Grid>
        <Stack direction="row" gap={3} align="center">
          <Button type="submit" variant="primary" size="sm">
            Send
          </Button>
        </Stack>
        {posted.length > 0 && (
          <Text as="pre" size="sm" data-testid="posted" style={{ margin: 0 }}>
            {posted.join("\n")}
          </Text>
        )}
      </Stack>
    </form>
  );
}
