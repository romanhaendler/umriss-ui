import { useId, useState } from "react";
import { FileInput, Stack, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the zone invalid by itself. Without one, set `invalid` and tie your message to the input with `aria-describedby`.";

export default function WithAnError() {
  const [files, setFiles] = useState<File[]>([]);
  const messageId = useId();
  const error = files.length === 0 ? "Attach the postmortem before closing INC-1048." : undefined;

  return (
    <Stack gap={1} style={{ maxWidth: 420 }}>
      <FileInput
        aria-label="Postmortem"
        accept=".pdf,.md"
        value={files}
        onChange={setFiles}
        invalid={error !== undefined}
        aria-describedby={error ? messageId : undefined}
      />
      {error && (
        <Text id={messageId} size="xs" style={{ color: "var(--u-color-danger-text)" }}>
          {error}
        </Text>
      )}
    </Stack>
  );
}
