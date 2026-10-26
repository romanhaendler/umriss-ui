import { Badge, CrossGlyph, Meter, Text } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "A bar, a scale, an icon and a limit";
export const lead = "Four presentations of a cell, each in `children` beside the value: a bar, a colour scale, a badge and a verdict. Each one also says the value in a word or a number, so the colour is never the only sign.";

interface Service {
  name: string;
  utilisation: number;
  errorRate: number;
  state: "Healthy" | "Down";
  p95: number;
}

const SERVICES: Service[] = [
  { name: "Checkout", utilisation: 0.86, errorRate: 0.012, state: "Healthy", p95: 271 },
  { name: "Billing", utilisation: 0.34, errorRate: 0.001, state: "Healthy", p95: 118 },
  { name: "Webhooks", utilisation: 0.58, errorRate: 0.046, state: "Down", p95: 346 },
  { name: "Search", utilisation: 0.91, errorRate: 0.004, state: "Healthy", p95: 205 },
];

const OBJECTIVE: LimitSet = {
  limits: [
    { value: 250, side: "upper", severity: "warning" },
    { value: 300, side: "upper", severity: "alarm" },
  ],
};

/* The colour mixes the danger token into the surface: a higher rate, a
   stronger tone, capped so the figure stays legible on it. */
const scale = (rate: number) => `color-mix(in srgb, var(--u-color-danger) ${Math.min(40, rate * 800)}%, var(--u-color-surface))`;

export default function ConditionalFormatting() {
  const { Table, Column, VerdictColumn } = useTable(SERVICES, { rowKey: (s) => s.name });

  return (
    <Table aria-label="Services with their utilisation, error rate, state and latency">
      <Column value="name" label="Service" rowHeader />
      <Column value="utilisation" label="Utilisation" width={180}>
        {(share, service) => (
          <Meter value={share} tone={share > 0.8 ? "warning" : "accent"} label={`Utilisation, ${service.name}`} />
        )}
      </Column>
      <Column value="errorRate" label="Error rate" width={120}>
        {(rate) => (
          <span style={{ display: "inline-block", padding: "0 6px", background: scale(rate) }}>
            <Text as="span" mono>{`${(rate * 100).toFixed(1)} %`}</Text>
          </span>
        )}
      </Column>
      <Column value="state" label="State" width={120}>
        {(state) => (
          <Badge tone={state === "Down" ? "danger" : "success"}>
            {state === "Down" && <CrossGlyph size={10} />} {state}
          </Badge>
        )}
      </Column>
      <VerdictColumn value="p95" label="p95 latency (ms)" limits={OBJECTIVE} />
    </Table>
  );
}
