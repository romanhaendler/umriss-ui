import { Gauge } from "../../src";
import { SERVICES } from "@umriss-ui/demo/worlds/operations";

export const title = "Watch a service's latency";

export const lead = "An on-call engineer keeps it open beside the incident channel.";

export const callouts = [
  "The needle: latency, in ms.",
  "Red above the limit, as the SLA says: 300 ms.",
];

export const builtFrom = ["gauge", { name: "Trend", page: "@umriss-ui/charts#trend" }];

export default function WatchLatency() {
  return <Gauge data-callout="1" value={SERVICES[0]!.latency} />;
}
