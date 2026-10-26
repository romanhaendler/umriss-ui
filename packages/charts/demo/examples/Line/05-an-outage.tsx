import { Text } from "@umriss-ui/core";
import { MINUTE, Tooltip, useChart } from "../../../src";

/* A historian logs a temperature every minute; it sent nothing from 10:12 to 10:47. */
const at = (hours: number, minutes: number) => new Date(2026, 2, 17, hours, minutes).getTime();
const READINGS: { t: number; temperature: number }[] = [];
for (let t = at(9, 30); t <= at(11, 30); t += MINUTE) {
  if (t > at(10, 12) && t < at(10, 47)) continue;
  READINGS.push({ t, temperature: Math.round((74 + 4 * Math.sin(t / (9 * MINUTE)) + (t > at(10, 47) ? 3 : 0)) * 10) / 10 });
}

export const title = "A silence is a gap";
export const lead = "`maxGap` is the longest step a line is drawn through; the half hour the historian sent nothing is a hole, not a steady climb.";

function Bridged() {
  const { Chart, XAxis, YAxis, Line } = useChart(READINGS);
  return (
    <Chart height={200} aria-label="Reactor temperature, the outage bridged by a straight stroke">
      <XAxis value="t" time />
      <YAxis label="°C" domain={[68, 84]} />
      <Line value="temperature" name="Temperature" markers="never" />
      <Tooltip />
    </Chart>
  );
}

function Broken() {
  const { Chart, XAxis, YAxis, Line } = useChart(READINGS);
  return (
    <Chart height={200} aria-label="Reactor temperature, the outage left as a gap">
      <XAxis value="t" time />
      <YAxis label="°C" domain={[68, 84]} />
      <Line value="temperature" name="Temperature" markers="never" maxGap={5 * MINUTE} />
      <Tooltip />
    </Chart>
  );
}

function Filled() {
  const { Chart, XAxis, YAxis, Area } = useChart(READINGS);
  return (
    <Chart height={200} aria-label="Reactor temperature as an area, closed on both sides of the outage">
      <XAxis value="t" time />
      <YAxis label="°C" domain={[60, 84]} />
      <Area value="temperature" name="Temperature" maxGap={5 * MINUTE} />
      <Tooltip />
    </Chart>
  );
}

export default function Outage() {
  return (
    <>
      <Text as="p">Without maxGap</Text>
      <Bridged />
      <Text as="p">With maxGap of five minutes</Text>
      <Broken />
      <Text as="p">An area closes on both sides of the gap</Text>
      <Filled />
    </>
  );
}
