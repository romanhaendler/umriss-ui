import { useState } from "react";
import { Button, FormField, Stack, Textarea } from "../../../src";

export const title = "Grow with the text";
export const lead = "Set `autoGrow` so the field grows with its text, and `maxRows` where it should start to scroll instead.";

const LONG = Array.from({ length: 12 }, (_, i) => `10:${String(10 + i * 2).padStart(2, "0")} Update ${i + 1}: error rate back under 1 %.`).join("\n");

export default function GrowWithTheText() {
  const [notes, setNotes] = useState("09:41 Alert fired.\n09:44 Priya Raman acknowledged.\n09:52 Rolled back release 4.18.");

  return (
    <FormField label="Responder notes" hint="Grows to at most eight lines." style={{ maxWidth: 520 }}>
      <Stack gap={2}>
        <Textarea autoGrow maxRows={8} value={notes} onChange={(event) => setNotes(event.target.value)} />
        <Stack direction="row" gap={2}>
          <Button size="sm" onClick={() => setNotes(LONG)}>
            Paste a long log
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setNotes("")}>
            Clear
          </Button>
        </Stack>
      </Stack>
    </FormField>
  );
}
