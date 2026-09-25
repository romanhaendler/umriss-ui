import { FileInput, FormField } from "../../../src";

export const title = "One file";

/* The first step: one file, of one type. The key is the platform's file
   input - Tab reaches it, Space or Enter opens the system's dialog, and a
   click on the label does too. A file dragged onto the zone is taken as
   well; `accept` holds for the drop as it holds in the dialog. The chosen
   file stands beneath the key with its size, and the cross takes it away. */
export default function OneFile() {
  return (
    <FormField label="Recipe file" hint="A CSV export from the recipe editor." style={{ maxWidth: 420 }}>
      <FileInput accept=".csv" />
    </FormField>
  );
}
