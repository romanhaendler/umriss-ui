import { Button, Stack } from "../../../src";

export const title = "Add an icon";
export const lead = "Put an SVG before the label as a child and hide it from screen readers; with no label at all, give the button an `aria-label`.";

function Download() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M8 2v8m0 0 3-3m-3 3L5 7M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WithAnIcon() {
  return (
    <Stack direction="row" gap={3} wrap align="center">
      <Button>
        <Download />
        Export CSV
      </Button>
      <Button size="sm" variant="ghost" aria-label="Export CSV">
        <Download />
      </Button>
    </Stack>
  );
}
