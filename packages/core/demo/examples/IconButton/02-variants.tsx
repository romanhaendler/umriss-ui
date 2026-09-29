import { CrossGlyph, IconButton, PlusGlyph, Stack } from "../../../src";

export const title = "Variants";
export const lead = "`plain` is the default – quiet and neutral, for a bar or a row. `ghost` is quiet in the accent; the others mean what they mean on a `Button`.";

function Export() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M5 1.5v5M2.8 4.3 5 6.5l2.2-2.2M1.8 8.5h6.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1.8 5.3 4 7.5l4.2-5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Variants() {
  return (
    <Stack direction="row" gap={3} wrap align="center">
      <IconButton aria-label="Export the tour list">
        <Export />
      </IconButton>
      <IconButton variant="ghost" aria-label="Add a stop">
        <PlusGlyph />
      </IconButton>
      <IconButton variant="secondary" aria-label="Export the tour list">
        <Export />
      </IconButton>
      <IconButton variant="primary" aria-label="Release the tour">
        <Check />
      </IconButton>
      <IconButton variant="danger" aria-label="Cancel the tour">
        <CrossGlyph />
      </IconButton>
    </Stack>
  );
}
