import { useState } from "react";
import { FileInput, FormField, Grid } from "../../../src";

export const title = "Several files";
export const lead = "Set `multiple` to take several at once; pass `value` to start from files a record already carries.";

const ATTACHED = [
  new File([new Uint8Array(184_000)], "damaged-corner.jpg", { type: "image/jpeg" }),
  new File([new Uint8Array(1_320_000)], "delivery-note-100829-signed-by-the-consignee-at-the-rear-entrance.pdf", {
    type: "application/pdf",
  }),
];

export default function SeveralFiles() {
  const [attached, setAttached] = useState<File[]>(ATTACHED);

  return (
    <Grid minItemWidth="300px" gap={6}>
      <FormField label="Proof of delivery" hint="Photos or PDF.">
        <FileInput multiple accept="image/*,.pdf" />
      </FormField>
      <FormField label="Attachments" hint="Shipment 100829, failed attempt.">
        <FileInput multiple accept="image/*,.pdf" value={attached} onChange={setAttached} />
      </FormField>
    </Grid>
  );
}
