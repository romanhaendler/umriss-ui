import { useState } from "react";
import { Combobox, FormField, Stack, Text } from "../../../src";

export const title = "Typing filters, choosing happens once";

/* The value is exactly one or `null`. What is typed is a term and not yet a
   value: `onChange` runs on choosing and on clearing, not on every keystroke.

   The list keeps its natural order and does not re-sort - a list that reorders
   itself as one types is one you lose sight of. */

const PEOPLE = [
  { value: "mw", label: "M. Weber" },
  { value: "jf", label: "J. Fontaine" },
  { value: "an", label: "A. Novak" },
  { value: "sl", label: "S. Lindgren" },
  { value: "kt", label: "K. Tanaka" },
  { value: "lb", label: "L. Baumann" },
];

export default function TypingFilters() {
  const [owner, setOwner] = useState<string | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: "320px" }}>
      <FormField label="Owner" hint="Typing filters the list.">
        <Combobox value={owner} onChange={setOwner} clearable options={PEOPLE} />
      </FormField>
      <Text size="xs" tone="muted">
        Value: {owner === null ? "null" : owner}
      </Text>
    </Stack>
  );
}
