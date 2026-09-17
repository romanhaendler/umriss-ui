import { FormField, Grid, Textarea } from "../../../src";

export const title = "States and a fixed height";

/* Without `autoGrow` the field has the height `rows` says, and a handle to drag
   - vertically only, because a text surface dragged horizontally pulls apart the
   grid beside it. */
export default function States() {
  return (
    <Grid minItemWidth="260px" gap={4}>
      <FormField label="Reason" hint="Fixed height, draggable by hand.">
        <Textarea
          rows={4}
          defaultValue={"Utilisation has been above the target mark for three weeks.\nA redistribution has been requested."}
        />
      </FormField>
      <FormField label="Short note" hint="Compact size (sm).">
        <Textarea size="sm" rows={2} placeholder="Short and to the point" />
      </FormField>
      <FormField label="Remark" error="Please give at least ten characters.">
        <Textarea rows={2} defaultValue="too short" />
      </FormField>
      <FormField label="Log" hint="Deactivated.">
        <Textarea rows={2} disabled defaultValue="Generated automatically, not editable." />
      </FormField>
    </Grid>
  );
}
