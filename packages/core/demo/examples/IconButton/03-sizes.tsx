import { Button, IconButton, Stack } from "../../../src";

export const title = "Sizes";
export const lead = "The heights of `Button`, and the same icon size beside a label and alone: 14 px at `md`, 12 px at `sm`, in header bars and table rows.";

function Export() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M5 1.5v5M2.8 4.3 5 6.5l2.2-2.2M1.8 8.5h6.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sizes() {
  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center">
        <Button>
          <Export />
          Export
        </Button>
        <IconButton variant="secondary" aria-label="Export the tour list">
          <Export />
        </IconButton>
      </Stack>
      <Stack direction="row" gap={2} align="center">
        <Button size="sm">
          <Export />
          Export
        </Button>
        <IconButton size="sm" variant="secondary" aria-label="Export the tour list">
          <Export />
        </IconButton>
      </Stack>
    </Stack>
  );
}
