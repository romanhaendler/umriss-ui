import { useState } from "react";
import { AngleGlyph, Button, CommandPalette, GridGlyph, Stack, Text, type CommandPaletteItem } from "../../../src";

export const title = "Search hundreds of pages";
export const lead = "A row's `icon` tells a page from an example. `searchedGroup` searches only “Inputs” of “core · Inputs”, so typing “core” does not find every candidate, and `maxFinds` draws the first fifty finds and says how many more there are - type “s” to see the line.";

const PAGES: Record<string, string[]> = {
  "core · Inputs": ["Button", "Input", "Textarea", "Select", "Combobox", "MultiSelect", "Checkbox", "Switch", "Slider", "NumberInput"],
  "core · Overlays": ["Modal", "Drawer", "Popover", "Tooltip", "Menu", "Toast", "CommandPalette"],
  "core · Layout": ["Stack", "Grid", "Card", "Splitter", "Tabs", "Accordion", "Divider"],
  "charts · Series": ["Line", "Area", "Bar", "Scatter", "BoxPlot", "Matrix"],
  "table · Features": ["Sorting", "Filter", "Grouping", "Selection", "Pagination", "Export"],
};
const EXAMPLES = ["A first one", "Sizes", "States", "With an error", "In a form"];

/* Every page and five examples each: some two hundred candidates. */
const ITEMS = Object.entries(PAGES).flatMap(([group, pages]) => {
  const searchedGroup = group.slice(group.indexOf(" · ") + 3);
  return pages.flatMap((page): CommandPaletteItem[] => [
    { id: page, label: page, group, searchedGroup, icon: <GridGlyph /> },
    ...EXAMPLES.map((example) => ({ id: `${page}/${example}`, label: `${page}: ${example}`, group, searchedGroup, icon: <AngleGlyph /> })),
  ]);
});

export default function SearchHundredsOfPages() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("-");

  return (
    <Stack gap={3} align="flex-start">
      <Button onClick={() => setOpen(true)}>Search the docs</Button>
      <Text size="xs" tone="muted">
        {ITEMS.length} candidates · last opened: {last}
      </Text>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        items={ITEMS}
        maxFinds={50}
        onChoose={(id) => {
          setOpen(false);
          setLast(id);
        }}
      />
    </Stack>
  );
}
