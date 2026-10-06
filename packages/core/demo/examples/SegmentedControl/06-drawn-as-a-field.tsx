import { ControlSizeProvider, FormField, SegmentedControl, Select, Stack } from "../../../src";
import type { ControlSize } from "../../../src";

export const title = "Drawn as a field";
export const lead =
  "`variant=\"field\"` gives it a field's edge and fills the choice with ink, for a row whose fields it should match box for box. Inset or a field, it is a control's height and its words stand on the select's line - at either size.";

function Row({ size }: { size: ControlSize }) {
  return (
    <Stack role="group" aria-label={size === "sm" ? "Small" : "Medium"} direction="row" gap={3} wrap>
      <FormField label="Caster">
        <Select defaultValue="">
          <option value="">Every caster</option>
          <option>Caster 1</option>
        </Select>
      </FormField>
      <FormField label="Values">
        <SegmentedControl
          variant="field"
          defaultValue="measured"
          options={[
            { value: "measured", label: "Measured" },
            { value: "forecast", label: "Forecast" },
          ]}
        />
      </FormField>
    </Stack>
  );
}

export default function DrawnAsAField() {
  return (
    <Stack gap={5}>
      <Row size="md" />
      <ControlSizeProvider size="sm">
        <Row size="sm" />
      </ControlSizeProvider>
    </Stack>
  );
}
