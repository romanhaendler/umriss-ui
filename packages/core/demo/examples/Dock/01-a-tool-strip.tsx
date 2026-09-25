import { Dock, GridGlyph, MeasureGlyph } from "../../../src";
import type { DockTool } from "../../../src";

export const title = "A tool strip";
export const lead = "Put the dock inside a positioned surface and give it `tools`; it lies above the surface and takes no room from it.";

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
