import { useState } from "react";
import { Combobox, FormField, Stack, Text } from "../../../src";

export const title = "A value that is new";
export const lead = "`creatable` offers typed text that fits no option as an `Add \"…\"` row; `onCreate` lets you add it to `options`.";

export default function ANewValue() {
  const [tags, setTags] = useState(["Frozen", "Fragile", "Express"]);
  const [tag, setTag] = useState<string | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Load tag">
        <Combobox
          creatable
          clearable
          value={tag}
          onValueChange={setTag}
          onCreate={(text) => setTags((all) => [...all, text])}
          options={tags.map((label) => ({ value: label, label }))}
          placeholder="Pick a tag or type a new one"
        />
      </FormField>
      <Text size="xs" tone="muted" mono>
        value: {tag === null ? "null" : `"${tag}"`}
      </Text>
    </Stack>
  );
}
