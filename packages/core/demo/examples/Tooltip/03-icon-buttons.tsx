import { Button, Stack, Tooltip } from "../../../src";

export const title = "Name icon buttons";
export const lead = "A button with only a glyph gets its name from `aria-label`; the tooltip shows the same words to a sighted reader.";

const TOOLS = [
  { glyph: "↻", label: "Refresh the tours" },
  { glyph: "⇅", label: "Sort by departure" },
  { glyph: "⤓", label: "Export the tour list" },
];

export default function IconButtons() {
  return (
    <Stack direction="row" gap={1}>
      {TOOLS.map((tool) => (
        <Tooltip key={tool.label} content={tool.label}>
          <Button size="sm" variant="ghost" aria-label={tool.label}>
            <span aria-hidden="true">{tool.glyph}</span>
          </Button>
        </Tooltip>
      ))}
    </Stack>
  );
}
