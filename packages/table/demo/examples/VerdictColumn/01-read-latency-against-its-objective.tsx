import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Read latency against its objective";

export const lead = "Give a `VerdictColumn` the value and a `limits` set; each cell shows ok, warning, alarm or unknown, and how far past the limit.";

interface Endpoint {
  path: string;
  p95: number | null;
}

/* Checkout's latency objective: the 95th percentile stays below 300 ms. */
const OBJECTIVE: LimitSet = {
  limits: [
    { value: 250, side: "upper", severity: "warning" },
    { value: 300, side: "upper", severity: "alarm" },
  ],
};

const ENDPOINTS: Endpoint[] = [
  { path: "/cart", p95: 182 },
  { path: "/payment", p95: 271 },
  { path: "/payment/confirm", p95: 346 },
  { path: "/receipt", p95: null },
];

export default function ReadLatency() {
  const { Table, Column, VerdictColumn } = useTable(ENDPOINTS, { rowKey: (e) => e.path });

  return (
    <Table ariaLabel="Checkout endpoints">
      <Column value="path" label="Endpoint" rowHeader />
      <VerdictColumn value="p95" label="p95 latency (ms)" limits={OBJECTIVE} />
    </Table>
  );
}
