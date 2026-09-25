import { Button, Stack } from "../../../src";

export const title = "Variants";
export const lead = "Use `primary` once per surface – two main actions side by side are no longer a main action; `danger` only for what cannot be undone.";

export default function Variants() {
  return (
    <Stack direction="row" gap={3} wrap align="center">
      <Button variant="primary">Approve invoice</Button>
      <Button>Send back</Button>
      <Button variant="ghost">Add a note</Button>
      <Button variant="danger">Reject</Button>
    </Stack>
  );
}
