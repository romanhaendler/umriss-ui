import { useState } from "react";
import { FormField, Stack, Text, TimeInput } from "../../../src";

export const title = "With seconds and the state";
export const lead = "`withSeconds` adds the third field; the value is the text `HH:mm:ss`, `null` while nothing is set.";

export default function WithSecondsAndTheState() {
  const [time, setTime] = useState<string | null>(null);
  return (
    <Stack gap={3}>
      <FormField label="Sample taken at">
        <TimeInput withSeconds value={time} onValueChange={setTime} />
      </FormField>
      <Text size="sm">{time ?? "Not set"}</Text>
    </Stack>
  );
}
