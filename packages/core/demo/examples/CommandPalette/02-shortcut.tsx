import { useCallback, useState } from "react";
import { CommandPalette, Input, Stack, Text, useCommandPaletteShortcut } from "../../../src";

export const title = "The shortcut: useCommandPaletteShortcut";

/* Cmd-K / Ctrl-K as everywhere, "/" as in every piece of documentation -
   including the rule that "/" inside a text field stays a slash. That rule
   once stood by hand in the shell of this demo; it belongs to the shortcut and
   now travels with it.

   Try it: click into the field below and type "/". */

const PLACES = [
  { id: "hall-1", label: "Hall 1", group: "North works" },
  { id: "hall-2", label: "Hall 2", group: "North works" },
  { id: "lab", label: "Laboratory", group: "South works" },
];

export default function Shortcut() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  useCommandPaletteShortcut(useCallback(() => setOpen(true), []));

  return (
    <Stack gap={3} align="flex-start">
      <Text size="sm" tone="secondary">
        Cmd-K or "/" opens the palette - in the field beside it, "/" stays a slash.
      </Text>
      <Input
        size="sm"
        aria-label="Here a slash stays a slash"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={'Type "/" here'}
      />
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        items={PLACES}
        onChoose={() => setOpen(false)}
      />
    </Stack>
  );
}
