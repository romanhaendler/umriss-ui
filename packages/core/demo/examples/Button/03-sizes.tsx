import { Button, Stack } from "../../../src";

export const title = "Sizes";
export const lead = "Use `sm` in header bars and table rows, the default `md` everywhere else.";

export default function Sizes() {
  return (
    <Stack direction="row" gap={3} wrap align="center">
      <Button variant="primary">Plan tour</Button>
      <Button>Print labels</Button>
      <Button size="sm" variant="primary">
        Plan tour
      </Button>
      <Button size="sm">Print labels</Button>
    </Stack>
  );
}
