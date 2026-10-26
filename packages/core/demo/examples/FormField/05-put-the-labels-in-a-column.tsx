import { useState } from "react";
import { Checkbox, FormField, Input, NumberInput, Select, Stack, Switch } from "../../../src";

export const title = "Put the labels in a column";
export const lead =
  "Set `labelPlacement=\"start\"` on each field of a property panel; the labels stand in a column as wide as `--u-label-width`, and a narrow place puts each field under its label.";

export default function PutTheLabelsInAColumn() {
  const [budget, setBudget] = useState<number | null>(0);
  return (
    <Stack gap={3} style={{ maxWidth: 560 }}>
      <FormField label="Name" labelPlacement="start" required>
        <Input defaultValue="Invoice review" />
      </FormField>
      <FormField label="Cost centre" labelPlacement="start" hint="As on the budget sheet, for example CC-2100.">
        <Input defaultValue="CC-2100" />
      </FormField>
      <FormField label="Budget" labelPlacement="start" error="The budget must be above zero.">
        <NumberInput value={budget} onChange={setBudget} />
      </FormField>
      <FormField label="Owner" labelPlacement="start">
        <Select defaultValue="finance">
          <option value="finance">Finance</option>
          <option value="sales">Sales</option>
        </Select>
      </FormField>
      <FormField label="Archived" labelPlacement="start">
        <Switch label="Hide from the overview" />
      </FormField>
      <FormField label="Approval" labelPlacement="start">
        <Checkbox label="Checked by a second person" />
      </FormField>
    </Stack>
  );
}
