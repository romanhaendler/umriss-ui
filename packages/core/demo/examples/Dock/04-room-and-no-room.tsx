/* `data-dock` names the two hosts for the screenshot and interaction suites:
   `spacious` has room for an upright dock, `flat` has not. */

import { useState } from "react";
import type { ReactNode } from "react";
import { CrossGlyph, Dock, GridGlyph, MeasureGlyph, MinusGlyph, PlusGlyph, Stack, Text } from "../../../src";
import type { DockPlace, DockTool } from "../../../src";
import { metrics } from "@umriss-ui/demo/worlds/operations";

export const title = "Move the dock, and where it does not fit";
export const lead = "Above a latency chart the dock reaches all four edges; on a flat chart the two side edges refuse and show why.";

const TOOLS: readonly DockTool[] = [
  { id: "zoom-in", label: "Zoom in", icon: <PlusGlyph /> },
  { id: "zoom-out", label: "Zoom out", icon: <MinusGlyph />, disabled: true },
  { id: "grid", label: "Grid", icon: <GridGlyph /> },
  { id: "measure", label: "Measure", icon: <MeasureGlyph /> },
  { id: "clear", label: "Clear the selection", icon: <CrossGlyph /> },
];

/** Which tools are modes is the application's knowledge, not the dock's. */
const MODES = new Set(["grid", "measure"]);

/* Checkout's p95 today, scaled into a 400 × 100 box: the chart the tools
   would act on, drawn as a plain line. */
const P95 = metrics("checkout").map((point) => point.p95);
const TOP = Math.max(...P95) * 1.1;
const POINTS = P95.map((value, i) => `${((i / (P95.length - 1)) * 400).toFixed(1)},${(100 - (value / TOP) * 100).toFixed(1)}`).join(" ");

function Chart({ height, children }: { height: number; children: ReactNode }) {
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
        role="img"
        aria-label="Checkout, p95 latency today"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <polyline
          points={POINTS}
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
        <Chart height={320}>
          <Dock
            tools={TOOLS}
            place={place}
            onPlaceChange={setPlace}
            mode={mode}
            onModeChange={(id) => {
              if (MODES.has(id)) setMode(id);
            }}
            onUse={setLast}
          />
        </Chart>
      </div>
      <Text size="xs" tone="muted">
        Resting place: <code>{place}</code>, mode: <code>{mode}</code>, last used: <code>{last ?? "none"}</code>
      </Text>

      <Text size="sm" weight="medium">
        A flat chart, where the side edges refuse
      </Text>
      <div data-dock="flat">
        <Chart height={140}>
          <Dock tools={TOOLS} defaultPlace="bottom" mode="grid" />
        </Chart>
      </div>
    </Stack>
  );
}
