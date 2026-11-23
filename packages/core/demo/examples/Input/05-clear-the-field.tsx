import { useState } from "react";
import { FormField, Grid, Input } from "../../../src";

export const title = "Clear the field";
export const lead = "Set `clearable` on a field; the cross clears it, reports through `onValueChange`, and appears only while there is content.";

export default function ClearTheField() {
  const [tracking, setTracking] = useState("FP-4471-2026-0317");
  const [search, setSearch] = useState("");

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Tracking number">
        <Input
          clearable
          value={tracking}
          onValueChange={setTracking}
        />
      </FormField>
      <FormField label="Search shipments" hint="Still empty, so no cross.">
        <Input
          clearable
          placeholder="Name, street or number"
          value={search}
          onValueChange={setSearch}
        />
      </FormField>
    </Grid>
  );
}
