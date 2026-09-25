import { useState } from "react";
import { FileInput, FormField, Grid } from "../../../src";

export const title = "Several files";

/* `multiple` takes several files at once - from the dialog or in one drop -
   and lists each with its size. A dropped file `accept` does not take is
   named beneath the list rather than dropped in silence; the dialog filters
   by the same rule before a file can be chosen.

   The second input starts with the files a work order already carries: the
   list is the caller's (`value`), and each cross takes one away. */

const ATTACHED = [
  new File([new Uint8Array(184_000)], "bearing-photo.jpg", { type: "image/jpeg" }),
  new File([new Uint8Array(1_320_000)], "vibration-report.pdf", { type: "application/pdf" }),
];

export default function SeveralFiles() {
  const [attached, setAttached] = useState<File[]>(ATTACHED);

  return (
    <Grid minItemWidth="300px" gap={6}>
      <FormField label="Photos and reports" hint="Images or PDF.">
        <FileInput multiple accept="image/*,.pdf" />
      </FormField>
      <FormField label="Attachments" hint="Work order 2231.">
        <FileInput multiple accept="image/*,.pdf" value={attached} onChange={setAttached} />
      </FormField>
    </Grid>
  );
}
