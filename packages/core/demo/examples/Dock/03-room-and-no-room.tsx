/* Two surfaces, because the component has two things to show.

   Above, a roomy stand-in surface: there all four resting places are
   reachable, with the handle and with the arrow keys. It carries a grid so that
   the translucent material has anything at all to shine through - without a
   background nothing of ADR-0012 would be visible.

   Below, a flat one: there is no room there for a standing dock, and the two
   side edges refuse visibly (ticket 05). That is not a mistake anybody made - a
   wide, flat chart simply has no room for an upright strip - and that is why the
   refusal does not look like a warning either.

   What counts as a mode is the caller's decision and not the library's: here
   "Grid" and "Measure" are modes, "Zoom in" and "Clear the selection" are not.
   A dock that set itself a mode would have made a statement about the state of
   the application that it is in no position to make.

   The `data-dock` attribute names the two hosts for the screenshot and
   interaction suites: `spacious` has room for a standing dock, `flat` has not,
   which is what makes a refusal visible at all. Both were German until the
   places were, and a selector nobody can read is worth no more than a name
   nobody can read. */

import { useState } from "react";
import {
  Dock,
  CrossGlyph,
  MeasureGlyph,
  MinusGlyph,
  PlusGlyph,
  GridGlyph,
  Stack,
  Text,
} from "../../../src";
import type { DockPlace, DockTool } from "../../../src";

export const title = "Move the dock, and where it does not fit";

export const lead =
  "Drag the handle or press an arrow key on it; on a flat surface the two side edges refuse and show why.";

const TOOLS: readonly DockTool[] = [
  { id: "zoom-in", label: "Zoom in", icon: <PlusGlyph /> },
  /* At the stop - and with it the proof that a disabled tool stays visible and
     is passed over by the roving tab stop. */
  { id: "zoom-out", label: "Zoom out", icon: <MinusGlyph />, disabled: true },
  { id: "grid", label: "Grid", icon: <GridGlyph /> },
  { id: "measure", label: "Measure", icon: <MeasureGlyph /> },
  { id: "clear", label: "Clear the selection", icon: <CrossGlyph /> },
];

/** Which of the tools are modes at all. The library does not know that. */
const MODES = new Set(["grid", "measure"]);

/* A stand-in surface: a grid and a fixed polyline. No random numbers and no
   clock - it gets photographed (R-6.2). */
function Surface({ height, children }: { height: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        height: `${height}px`,
        borderRadius: "var(--u-radius-lg)",
        overflow: "hidden",
        background:
          "repeating-linear-gradient(0deg, var(--u-hairline-strong) 0 1px, transparent 1px 24px)," +
          "repeating-linear-gradient(90deg, var(--u-hairline-strong) 0 1px, transparent 1px 24px)," +
          "var(--u-color-surface-sunken)",
        boxShadow: "var(--u-edge)",
      }}
    >
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <polyline
          points="0,74 40,62 80,68 120,44 160,50 200,28 240,36 280,20 320,30 360,12 400,18"
          fill="none"
          stroke="var(--u-color-accent)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {children}
    </div>
  );
}

export default function RoomAndNoRoom() {
  const [place, setPlace] = useState<DockPlace>("bottom");
  const [mode, setMode] = useState("grid");
  const [last, setLast] = useState<string | null>(null);

  return (
    <Stack gap={4}>
        <div data-dock="spacious">
          <Surface height={320}>
            <Dock
              tools={TOOLS}
              place={place}
              onPlaceChange={setPlace}
              /* The resting place is controlled here because the example
                 displays it. Uncontrolled would work just as well - then the
                 dock carries it itself, and the library still does not remember
                 it beyond the life of the component. */
              mode={mode}
              onModeChange={(id) => {
                if (MODES.has(id)) setMode(id);
              }}
              onUse={setLast}
            />
          </Surface>
        </div>

        <Text size="sm" tone="secondary">
          The strip lies above the surface and takes no line away from it. The handle moves
          it: dragging snaps into the edge whose zone the pointer reaches, and the four arrow
          keys on the handle are the four resting places - absolute, not relative. Nothing
          floats in between. Resting place: <code>{place}</code>, mode: <code>{mode}</code>
          {last !== null && (
            <>
              , last used: <code>{last}</code>
            </>
          )}
          .
        </Text>

        <Text size="sm" weight="medium">
          A place that does not fit says so
        </Text>
        <div data-dock="flat">
          <Surface height={140}>
            <Dock tools={TOOLS} defaultPlace="bottom" mode="grid" />
          </Surface>
        </div>
        <Text size="sm" tone="secondary">
          The same five tools on a flat surface. Upright they would need more height than there
          is here, so the left and the right zone refuse and while doing so show the outline the
          dock would have there. No overflow menu, no shrinking - and no warning colour, because
          nothing has gone wrong here.
        </Text>
    </Stack>
  );
}
