import { useState } from "react";
import { Dock, GridGlyph, MeasureGlyph, PlusGlyph, Stack, Text } from "../../../src";
import type { DockPlace, DockTool } from "../../../src";

export const title = "The four resting places";

/* What makes it a dock rather than a toolbar: it moves, and it moves between
   four named places. Dragging the grip snaps into the edge whose zone the
   pointer reaches, and the four arrow keys on the grip ARE the four places -
   absolute, not relative. Nothing floats in between (ADR-0013).

   The resting place is controlled here because the example displays it.
   Uncontrolled works just as well; the library then carries it and still does
   not remember it beyond the life of the component. */

const TOOLS: readonly DockTool[] = [
  { id: "zoom-in", label: "Zoom in", icon: <PlusGlyph /> },
  { id: "grid", label: "Grid", icon: <GridGlyph /> },
  { id: "measure", label: "Measure", icon: <MeasureGlyph /> },
];

export default function TheFourPlaces() {
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
