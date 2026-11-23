import { FileInput, FormField } from "../../../src";

export const title = "Start with files";
export const lead = "`defaultValue` lists the files an uncontrolled field starts with; a form reset returns to them.";

const ATTACHED = [new File([new Uint8Array(96_000)], "invoice-2026-0412.pdf", { type: "application/pdf" })];

export default function StartWithFiles() {
  return (
    <FormField label="Invoice" hint="Replace it by choosing another file." style={{ maxWidth: 420 }}>
      <FileInput accept=".pdf" defaultValue={ATTACHED} />
    </FormField>
  );
}
