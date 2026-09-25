import { useState } from "react";
import type { FormEvent } from "react";
import { Button, FileInput, FormField, Stack, Text } from "../../../src";

export const title = "Controlled, in a form";

/* The files belong to the caller here: `value` and `onChange`, with the
   files already filtered by `accept`. The form checks them on sending - an
   empty choice becomes the field's error, which the zone shows in the
   danger colour and a screen reader hears as the field's description.

   Nothing is uploaded: what happens to the files is the application's. Here
   it only says what it would send. */
export default function ControlledInAForm() {
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
        <FormField label="Shift log" required error={tried && files.length === 0 ? "Choose the log to send." : undefined}>
          <FileInput accept=".csv,.txt" value={files} onChange={setFiles} name="log" />
        </FormField>
        <Stack direction="row" gap={3} align="center">
          <Button type="submit" size="sm" variant="primary">
            Send
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
