import { Checkbox, FormField, FormFieldBoundary, Stack } from "../../../src";

export const title = "A panel with its own fields";
export const lead = "Fields inside a `FormFieldBoundary` do not take the surrounding field's id: a click on their label stays with them.";

export default function APanelWithItsOwnFields() {
  return (
    <FormField label="Notify teams" style={{ maxWidth: 360 }}>
      <FormFieldBoundary>
        <Stack gap={1}>
          <Checkbox label="Payments" defaultChecked />
          <Checkbox label="Identity" />
        </Stack>
      </FormFieldBoundary>
    </FormField>
  );
}
