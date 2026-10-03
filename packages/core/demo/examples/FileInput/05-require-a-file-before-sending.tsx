import { useState } from "react";
import type { FormEvent } from "react";
import { Button, FileInput, FormField, Stack, Text } from "../../../src";

export const title = "Require a file before sending";
export const lead = "Hold the files with `value` and `onChange`, and turn an empty choice into the field's error on submit.";

export default function RequireAFileBeforeSending() {
  const [files, setFiles] = useState<File[]>([]);
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const send = (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    if (files.length === 0) return;
    setSent(files.map((f) => f.name).join(", "));
  };

  return (
    <form onSubmit={send} noValidate style={{ maxWidth: 420 }}>
      <Stack gap={3}>
        <FormField label="Receipts" required error={tried && files.length === 0 ? "Attach at least one receipt." : undefined}>
          <FileInput multiple accept=".pdf,image/*" value={files} onChange={setFiles} name="receipts" />
        </FormField>
        <Stack direction="row" gap={3} align="center">
          <Button type="submit" size="sm" variant="primary">
            Submit expenses
          </Button>
          {sent && (
            <Text size="sm" tone="muted">
              Would send: {sent}
            </Text>
          )}
        </Stack>
      </Stack>
    </form>
  );
}
