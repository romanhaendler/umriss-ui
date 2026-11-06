import { ColorPicker, FormField, Grid } from "../../../src";

export const title = "States";
export const lead = "`size=\"sm\"` suits dense forms, `defaultValue` starts an uncontrolled field, `chars` fixes the width, errors come from the `FormField` (or `invalid` by hand), and `disabled` locks field and panel.";

export default function States() {
  return (
    <Grid minItemWidth="220px" gap={4}>
      <FormField label="Tag" hint="Small size, uncontrolled.">
        <ColorPicker size="sm" defaultValue="#7c3aed" />
      </FormField>
      <FormField label="Line" error="This colour cannot be read on the dark theme.">
        <ColorPicker defaultValue="#161618" />
      </FormField>
      <FormField label="Set by the theme" hint="Locked.">
        <ColorPicker value="#059669" onValueChange={() => {}} disabled />
      </FormField>
      <FormField label="Accent" hint="Empty, with its own placeholder, ten characters wide.">
        <ColorPicker placeholder="Theme colour" chars={10} />
      </FormField>
      <FormField label="Border">
        <ColorPicker aria-label="Border colour" invalid />
      </FormField>
    </Grid>
  );
}
