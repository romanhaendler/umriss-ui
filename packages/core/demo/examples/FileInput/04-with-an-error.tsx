import { useState } from "react";
import { FileInput, FormField } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the zone turns red and reads the reason out.";

export default function WithAnError() {
  const [files, setFiles] = useState<File[]>([]);
  const error = files.length === 0 ? "Attach the postmortem before closing INC-1048." : undefined;

  return (
    <FormField label="Postmortem" error={error} style={{ maxWidth: 420 }}>
      <FileInput accept=".pdf,.md" value={files} onChange={setFiles} invalid={error !== undefined} />
    </FormField>
  );
}
