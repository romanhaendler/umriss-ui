import { Dock, GridGlyph, MeasureGlyph } from "../../../src";
import type { DockTool } from "../../../src";

export const title = "A tool strip";

/* A dock at its resting place with two tools. It lies ABOVE one surface and
   takes no line away from it - that is what distinguishes it from a toolbar,
   which would be a row in the layout.

   The surface is a plain host here; in an application it is the chart, the plan
   or the drawing the tools act on. */

const TOOLS: readonly DockTool[] = [
  { id: "grid", label: "Grid", icon: <GridGlyph /> },
  { id: "measure", label: "Measure", icon: <MeasureGlyph /> },
];

export default function AToolStrip() {
  return (
    <div
      style={{
        position: "relative",
        height: 200,
        borderRadius: "var(--u-radius-lg)",
        background: "var(--u-color-surface-sunken)",
        boxShadow: "var(--u-edge)",
      }}
    >
      <Dock tools={TOOLS} defaultPlace="bottom" />
    </div>
  );
}
