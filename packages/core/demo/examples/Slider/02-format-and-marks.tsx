import { FormField, Grid, Slider } from "../../../src";

export const title = "Its unit, and marks on the track";

/* `format` writes the value as text - once for the readout and once for the
   screen reader, which hears "75 %" rather than "75". Marks show a value on
   the track; a mark with a `label` writes its word beneath. They show, they
   do not catch the thumb: the step does that.

   Disabled dims the whole slider - marks and readout with it - and takes no
   key. Dimmed words fall below the contrast a reader needs, which is right
   for a control that is not there now, so the locked one here shows its
   marks without words and says its value in the hint. */
export default function FormatAndMarks() {
  return (
    <Grid minItemWidth="260px" gap={6}>
      <FormField label="Conveyor speed">
        <Slider
          defaultValue={75}
          step={5}
          format={(v) => `${v} %`}
          showValue
          marks={[0, 25, 50, { value: 75, label: "Rated" }, 100]}
        />
      </FormField>
      <FormField label="Fill quantity" hint="500 ml - locked while the batch runs.">
        <Slider min={450} max={550} defaultValue={500} format={(v) => `${v} ml`} disabled marks={[450, 500, 550]} />
      </FormField>
    </Grid>
  );
}
