import { Badge, Card, CardBody, CardHeader, Stack, Text } from "@umriss-ui/core";
import {
  Chart,
  ControlChart,
  LimitBand,
  LimitLine,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  controlLimits,
  violations,
  type RuleName,
} from "../../src";
import { KILN, SHIFT_MINUTES, plant, type Reading, type Sample } from "@umriss-ui/demo/worlds/plant";

export const title = "Hold the tile length in control";

export const lead =
  "A quality engineer at the tile works reviews the early shift: whether the fired tiles kept their length, and what the kiln did when they did not.";

export const callouts = [
  "The specification, 600 ± 1.5 mm, is chosen and drawn dashed; the control limits are calculated from the first two hours, when the kiln ran steady.",
  "Samples that break a rule are marked on the chart and listed here, with the time and the rules, for the shift report.",
  "The kiln's zone 3 on the same minutes, with its tolerance and alarm limit: the tiles shrank while the kiln ran hot. Both charts share one pointer, so a marked sample and the kiln reading of its minute are read together.",
];

export const builtFrom = [
  "controlchart",
  "limitline",
  "line",
  "tooltip",
  { name: "Badge", page: "@umriss-ui/core#badge" },
  { name: "Card", page: "@umriss-ui/core#card" },
];

const SHIFT = plant(17);
const SPEC = { nominal: 600, tolerance: 1.5 };
/* Twelve samples, one every ten minutes: the first two hours. */
const REFERENCE = { kind: "referenceWindow", from: 0, to: 12 } as const;
const DOMAIN: readonly [number, number] = [0, SHIFT_MINUTES];
const HOURS = Array.from({ length: SHIFT_MINUTES / 60 + 1 }, (_, i) => i * 60);

const RULES: Record<RuleName, string> = {
  outlier: "Beyond a control limit",
  run: "Run on one side of the centre",
  trend: "Steady rise or fall",
  twoOfThree: "Two of three near a limit",
};

const lengths = SHIFT.samples.map((one) => one.length);
const BROKEN = violations(lengths, controlLimits(lengths, REFERENCE));
/* One line per sample, naming every rule it broke. */
const FOUND = [...new Set(BROKEN.flatMap((one) => one.indices))]
  .sort((a, b) => a - b)
  .map((index) => ({
    sample: SHIFT.samples[index]!,
    rules: BROKEN.filter((one) => one.indices.includes(index)).map((one) => RULES[one.rule]),
  }));

/* The early shift begins at 06:00. */
const clock = (minute: number) => {
  const m = Math.round(minute) + 6 * 60;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export default function TileLength() {
  return (
    <Stack gap={4}>
      <Card data-callout="1">
        <CardHeader title="Tile length after firing" eyebrow="Kiln K1 · early shift" />
        <CardBody>
          <Chart data={SHIFT.samples} height={280} syncId="tiles" ariaLabel="Control chart of the tile length over the early shift">
            <XAxis accessor={(d: Sample) => d.minute} domain={DOMAIN} ticks={HOURS} tickFormat={clock} />
            <YAxis accessor={(d: Sample) => d.length} label="mm" />
            <LimitLine value={SPEC.nominal + SPEC.tolerance} severity="alarm" label="USL" inExtent />
            <LimitLine value={SPEC.nominal - SPEC.tolerance} severity="alarm" label="LSL" inExtent />
            <ControlChart
              accessor={(d: Sample) => d.length}
              data={SHIFT.samples}
              origin={REFERENCE}
              name="Length"
              labelUpper="UCL"
              labelLower="LCL"
              violationName="Length - rule broken"
            />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
      <Card data-callout="2">
        <CardHeader title="Samples out of control" actions={<Badge tone={FOUND.length > 0 ? "warning" : "success"}>{FOUND.length}</Badge>} />
        <CardBody>
          <Stack gap={1}>
            {FOUND.length === 0 && <Text size="sm">No sample broke a rule this shift.</Text>}
            {FOUND.map(({ sample, rules }) => (
              <Text key={sample.minute} size="sm">
                <Text as="span" mono>
                  {clock(sample.minute)}
                </Text>{" "}
                {sample.length.toFixed(2)} mm · {rules.join(", ")}
              </Text>
            ))}
          </Stack>
        </CardBody>
      </Card>
      <Card data-callout="3">
        <CardHeader title="Kiln zone 3" />
        <CardBody>
          <Chart data={SHIFT.readings} height={200} syncId="tiles" ariaLabel="Kiln zone 3 temperature over the early shift">
            <XAxis accessor={(d: Reading) => d.minute} domain={DOMAIN} ticks={HOURS} tickFormat={clock} />
            <YAxis accessor={(d: Reading) => d.kiln} label="°C" tickCount={4} />
            <LimitBand from={KILN.tolerance[0]} to={KILN.tolerance[1]} severity="warning" label="Tolerance" />
            <LimitLine value={KILN.alarm} severity="alarm" label="Alarm limit" inExtent />
            <Line accessor={(d: Reading) => d.kiln} name="Zone 3" />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
    </Stack>
  );
}
