import { CrossGlyph, IconButton, Stack } from "../../../src";

export const title = "Bring your own icons";
export const lead = "A glyph of the set, an SVG drawn for 24 px as lucide and Font Awesome ship theirs, a character the way an icon font sets it – the button gives each the same size.";

/* Drawn on a 24 grid with its own width and height, as icon sets ship them. */
function Printer() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

export default function BringYourOwnIcons() {
  return (
    <Stack direction="row" gap={3} align="center">
      <IconButton variant="secondary" aria-label="Remove the filter">
        <CrossGlyph />
      </IconButton>
      <IconButton variant="secondary" aria-label="Print the delivery notes">
        <Printer />
      </IconButton>
      <IconButton variant="secondary" aria-label="Sort by departure">
        <span aria-hidden="true">⇅</span>
      </IconButton>
    </Stack>
  );
}
