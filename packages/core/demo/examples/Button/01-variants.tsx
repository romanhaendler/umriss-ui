import { Button, Stack } from "../../../src";

export const title = "Variants";

/* Four volumes. `primary` stands exactly once on a surface - two main actions
   side by side are no longer a main action. */
export default function Variants() {
  return (
    <Stack direction="row" gap={3} wrap align="center">
      <Button variant="primary">Save changes</Button>
      <Button>Export</Button>
      <Button variant="ghost">Reset</Button>
      <Button variant="danger">Delete</Button>
    </Stack>
  );
}
