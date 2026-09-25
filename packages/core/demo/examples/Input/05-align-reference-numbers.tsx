import { FormField, Input, Stack } from "../../../src";

export const title = "Align reference numbers";
export const lead = "Set `numeric` where codes are compared digit by digit; the text stands right-aligned in tabular figures.";

export default function AlignReferenceNumbers() {
  return (
    <Stack gap={3} style={{ maxWidth: 280 }}>
      <FormField label="Shipment">
        <Input numeric defaultValue="100829" />
      </FormField>
      <FormField label="Return shipment">
        <Input numeric defaultValue="1011487" />
      </FormField>
    </Stack>
  );
}
