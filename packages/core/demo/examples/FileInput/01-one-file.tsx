import { FileInput, FormField } from "../../../src";

export const title = "One file";
export const lead = "Set `accept` for the types you take; it holds for the system's dialog and for a file dropped on the zone.";

export default function OneFile() {
  return (
    <FormField label="Bank statement" hint="The CSV export from online banking." style={{ maxWidth: 420 }}>
      <FileInput accept=".csv" />
    </FormField>
  );
}
