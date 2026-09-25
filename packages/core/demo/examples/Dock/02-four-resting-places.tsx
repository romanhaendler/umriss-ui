import { useState } from "react";
import { Dock, GridGlyph, MeasureGlyph, PlusGlyph, Stack, Text } from "../../../src";
import type { DockPlace, DockTool } from "../../../src";

export const title = "Four resting places";
export const lead = "Drag the handle or press an arrow on it to move the dock; control `place` with `onPlaceChange` to keep it in the user's settings.";

const TOOLS: readonly DockTool[] = [
  { id: "zoom-in", label: "Zoom in", icon: <PlusGlyph /> },
  { id: "grid", label: "Grid", icon: <GridGlyph /> },
  { id: "measure", label: "Measure", icon: <MeasureGlyph /> },
];

export default function FourRestingPlaces() {
  const [place, setPlace] = useState<DockPlace>("top");

  return (
    <Stack gap={2}>
      <div
        style={{
          position: "relative",
          height: 260,
          borderRadius: "var(--u-radius-lg)",
          background: "var(--u-color-surface-sunken)",
          boxShadow: "var(--u-edge)",
        }}
      >
        <Dock tools={TOOLS} place={place} onPlaceChange={setPlace} />
      </div>
      <Text size="xs" tone="muted">
        Resting place: <code>{place}</code>
      </Text>
    </Stack>
  );
}
