import { useCallback, useState } from "react";
import { CommandPalette, Input, Stack, Switch, Text, useCommandPaletteShortcut } from "../../../src";

export const title = "Open it with a shortcut";
export const lead = "`useCommandPaletteShortcut` binds Cmd-K or Ctrl-K and “/” – except inside a text field, where a slash stays a slash. An application setting turns the single-key “/” off (WCAG 2.1.4).";

const PROJECTS = [
  { id: "shop", label: "Online shop relaunch", group: "Pembury Home" },
  { id: "booking", label: "Booking app", group: "Saltmarsh Clinics" },
  { id: "portal", label: "Member portal", group: "Rowan Credit Union" },
  { id: "intranet", label: "Intranet", group: "Tidewell (internal)" },
];

export default function Shortcut() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [project, setProject] = useState("-");
  const [slash, setSlash] = useState(true);

  useCommandPaletteShortcut(useCallback(() => setOpen(true), []), { slash });

  return (
    <Stack gap={3} align="flex-start">
      <Text size="sm" tone="secondary">
        Press Cmd-K, Ctrl-K or “/” to jump to a project. Current: {project}
      </Text>
      <Switch label="“/” opens the palette" checked={slash} onChange={(event) => setSlash(event.target.checked)} />
      <Input
        size="sm"
        aria-label="Here a slash stays a slash"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type “/” here"
      />
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        items={PROJECTS}
        onChoose={(id) => {
          setOpen(false);
          setProject(PROJECTS.find((p) => p.id === id)?.label ?? id);
        }}
      />
    </Stack>
  );
}
