import { useState } from "react";
import { CrossGlyph, Dock, GridGlyph, MeasureGlyph, MinusGlyph, PlusGlyph, Stack, Text } from "../../../src";
import type { DockTool } from "../../../src";

export const title = "Modes and actions";
export const lead = "Set `mode` for the tool the surface stands in and let `onUse` report the rest; a `disabled` tool stays in its place.";

const TOOLS: readonly DockTool[] = [
  { id: "zoom-in", label: "Zoom in", icon: <PlusGlyph /> },
  { id: "zoom-out", label: "Zoom out", icon: <MinusGlyph />, disabled: true },
  { id: "grid", label: "Grid", icon: <GridGlyph /> },
  { id: "measure", label: "Measure", icon: <MeasureGlyph /> },
  { id: "clear", label: "Clear the selection", icon: <CrossGlyph /> },
];

/** Which tools are modes is the application's knowledge, not the dock's. */
const MODES = new Set(["grid", "measure"]);

export default function ModesAndActions() {
  const [mode, setMode] = useState("grid");
  const [last, setLast] = useState<string | null>(null);

  return (
    <Stack gap={2}>
      <div
        style={{
          position: "relative",
          height: 220,
          borderRadius: "var(--u-radius-lg)",
          background: "var(--u-color-surface-sunken)",
          boxShadow: "var(--u-edge)",
        }}
      >
        <Dock
          tools={TOOLS}
          defaultPlace="bottom"
          mode={mode}
          onModeChange={(id) => {
            if (MODES.has(id)) setMode(id);
          }}
          onUse={setLast}
        />
      </div>
      <Text size="xs" tone="muted">
        Mode: <code>{mode}</code>, last used: <code>{last ?? "none"}</code>
      </Text>
    </Stack>
  );
}
