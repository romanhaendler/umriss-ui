import { ProgressBar, Stack } from "../../../src";

export const title = "How far a task has come";

/* The first step: a share from 0 to 1, and a name that says what is
   progressing. The percentage beside the bar is optional; a screen reader
   hears it either way. Values outside 0 to 1 are clamped. */
export default function HowFar() {
  return (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <ProgressBar value={0.42} label="Import of the batch records" showLabel />
      <ProgressBar value={1} label="Export of the shift report" showLabel />
    </Stack>
  );
}
