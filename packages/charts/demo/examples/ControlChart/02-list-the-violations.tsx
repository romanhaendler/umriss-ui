import { Chart, ControlChart, Tooltip, XAxis, YAxis, controlLimits, violations } from "../../../src";
import type { RuleName } from "../../../src";
import { plant, type Sample } from "@umriss-ui/demo/worlds/plant";

export const title = "List the rule violations";
export const lead = "In the plant: `controlLimits` and `violations` are plain functions, so the same verdict the chart marks can stand beside it as text.";

const SAMPLES = plant(7).samples;
const REFERENCE_WINDOW = { kind: "referenceWindow", from: 0, to: 15 } as const;

const LIMITS = controlLimits(SAMPLES.map((s) => s.length), REFERENCE_WINDOW);
const FOUND = violations(SAMPLES.map((s) => s.length), LIMITS);

const RULES: Record<RuleName, string> = {
  outlier: "Beyond a control limit",
  run: "A run on one side of the centre",
  trend: "A steady climb or fall",
  twoOfThree: "Two of three near a limit",
};

const clock = (minute: number) => {
  const total = 6 * 60 + minute;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export default function ListTheViolations() {
  return (
    <div className="side-by-side">
      <div style={{ flex: "1 1 320px" }}>
        <Chart data={SAMPLES} height={240} ariaLabel="Control chart of the tile length, its violations listed beside it">
          <XAxis accessor={(d: Sample) => d.minute} label="Minute of the shift" />
          <YAxis accessor={(d: Sample) => d.length} label="mm" />
          <ControlChart accessor={(d: Sample) => d.length} data={SAMPLES} origin={REFERENCE_WINDOW} name="Tile length" />
          <Tooltip mode="x" />
        </Chart>
      </div>
      <ul className="side-note">
        {FOUND.length === 0 ? (
          <li>No rule violated.</li>
        ) : (
          FOUND.map((v) => (
            <li key={v.rule}>
              <strong>{RULES[v.rule]}</strong>: {v.indices.map((i) => clock(SAMPLES[i]!.minute)).join(", ")}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
