import { Button, Stack } from "../../../src";

export const title = "Sizes";

/* `sm` belongs in header bars and table rows, `md` everywhere else. Put side
   by side so that the difference is visible - on its own, every size looks
   right. */
export default function Sizes() {
  return (
    <Stack direction="row" gap={3} wrap align="center">
      <Button size="md" variant="primary">
        Normal size
      </Button>
      <Button size="sm" variant="primary">
        Compact
      </Button>
      <Button size="md">Normal size</Button>
      <Button size="sm">Compact</Button>
    </Stack>
  );
}
