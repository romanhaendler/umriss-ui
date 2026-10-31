import { useState } from "react";
import { FormField, Grid, Input } from "../../../src";

export const title = "Units in the frame";
export const lead = "`start` and `end` put a unit inside the field's frame, before or after the value; the text is read with the field.";

export default function UnitsInTheFrame() {
  const [weight, setWeight] = useState("12.5");
  const [share, setShare] = useState("40");

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Net weight">
        <Input chars={10} end="kg" value={weight} onValueChange={setWeight} />
      </FormField>
      <FormField label="Share of the batch">
        <Input chars={10} end="%" value={share} onValueChange={setShare} />
      </FormField>
      <FormField label="Route">
        <Input start="via" placeholder="Hub or depot" />
      </FormField>
    </Grid>
  );
}
