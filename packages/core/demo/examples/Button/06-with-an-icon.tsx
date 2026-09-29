import { Button, Stack } from "../../../src";

export const title = "Add an icon";
export const lead = "Put the icon before the label and hide it from screen readers; the button sets its size. A button with no label at all is an `IconButton`.";

function Download() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
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
      <Button size="sm" variant="ghost">
        <Download />
        Export CSV
      </Button>
    </Stack>
  );
}
