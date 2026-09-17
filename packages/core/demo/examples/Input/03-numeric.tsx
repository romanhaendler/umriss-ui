import { useState } from "react";
import { FormField, Grid, Input } from "../../../src";

export const title = "Numeric notation";

/* `numeric` is not a number input - `NumberInput` exists for that. It is the
   type: Geist Mono with tabular figures, right-aligned. References and document
   numbers then really do stand underneath one another. */
export default function Numeric() {
  const [reference, setReference] = useState("A-2041");
  const [documentNo, setDocumentNo] = useState("100829");

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="Reference">
        <Input numeric value={reference} onChange={(event) => setReference(event.target.value)} />
      </FormField>
      <FormField label="Document number">
        <Input numeric value={documentNo} onChange={(event) => setDocumentNo(event.target.value)} />
      </FormField>
    </Grid>
  );
}
