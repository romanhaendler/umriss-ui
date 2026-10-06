import { Checkbox, ControlSizeProvider, FormField, RadioGroup, SegmentedControl, Select, Stack, Switch } from "../../../src";
import type { ControlSize } from "../../../src";

export const title = "A row of fields";
export const lead =
  "Fields side by side share one line: their labels on one line, their boxes on one height, their words on the line the select's value stands on. A segmented control is as tall as a field; a horizontal radio group is as tall as a control, and so are a checkbox and a switch in a field, so their words stand on that line too - at either size.";

function Row({ size }: { size: ControlSize }) {
  return (
    <Stack role="group" aria-label={size === "sm" ? "Small" : "Medium"} direction="row" gap={3} wrap>
      <FormField label="Caster">
        <Select defaultValue="">
          <option value="">Every caster</option>
          <option>Caster 1</option>
          <option>Caster 2</option>
        </Select>
      </FormField>
      <FormField label="Strand">
        <Select defaultValue="">
          <option value="">Every strand</option>
          <option>Strand 1</option>
          <option>Strand 2</option>
        </Select>
      </FormField>
      <FormField label="State of the data">
        <RadioGroup
          orientation="horizontal"
          defaultValue="raw"
          options={[
            { value: "raw", label: "Raw" },
            { value: "cleaned", label: "Cleaned" },
          ]}
        />
      </FormField>
      <FormField label="Values">
        <SegmentedControl
          defaultValue="measured"
          options={[
            { value: "measured", label: "Measured" },
            { value: "forecast", label: "Forecast" },
          ]}
        />
      </FormField>
      <FormField label="Archive">
        <Checkbox label="Show archived" />
      </FormField>
      <FormField label="Updates">
        <Switch label="Live" defaultChecked />
      </FormField>
    </Stack>
  );
}

export default function ARowOfFields() {
  return (
    <Stack gap={5}>
      <Row size="md" />
      <ControlSizeProvider size="sm">
        <Row size="sm" />
      </ControlSizeProvider>
    </Stack>
  );
}
