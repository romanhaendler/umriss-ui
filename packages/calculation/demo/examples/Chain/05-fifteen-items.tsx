import { Calculation, Chain, Given, Interim, Plus } from "../../../src";

export const title = "Build the lines from data";
export const lead = "`.map` inside a chain makes each item a `Plus`, and all stand in view above their interim.";

const ITEMS = [
  ["Compute, booking API", 4128.4],
  ["Compute, search", 2864.1],
  ["Compute, workers", 1741.9],
  ["Database, primary", 2310],
  ["Database, replicas", 1540],
  ["Object storage", 386.2],
  ["Block storage", 512.8],
  ["Data transfer out", 948.6],
  ["Load balancers", 264],
  ["Queues", 118.3],
  ["Cache cluster", 690],
  ["Log storage", 431.7],
  ["Metrics and traces", 822.5],
  ["Backups", 207.4],
  ["Support plan", 1200],
] as const;

export default function FifteenItems() {
  const [[firstName, firstAmount], ...rest] = ITEMS;
  return (
    <Calculation aria-label="Cloud bill, March">
      <Chain>
        <Given label={firstName} value={firstAmount} unit="€" decimals={2} />
        {rest.map(([name, amount]) => (
          <Plus key={name} label={name} value={amount} unit="€" decimals={2} />
        ))}
        <Interim label="Cloud bill, March" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
