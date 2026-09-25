import { useState } from "react";
import { Sparkline } from "@umriss-ui/core";
import { Calculation, Given, Quotient } from "../../../src";

export const title = "Say where a number came from";
export const lead = "`source`, `asOf` and `ages` give a given its origin and freshness; `explanation` and `aside` stand beside a line without taking part.";

const AGES = { stale: 15 * 60_000, lost: 60 * 60_000 };

export default function WhereItCameFrom() {
  const [now] = useState(() => Date.now());
  return (
    <Calculation aria-label="Error rate of Checkout, last five minutes">
      <Quotient
        label="Error rate, Checkout"
        format="percent"
        decimals={2}
        limits={[{ value: 0.01, side: "upper", severity: "warning" }]}
        explanation="Failed requests over every request in the last five minutes."
        aside={<Sparkline data={[0.0012, 0.0015, 0.0011, 0.0019, 0.0264, 0.0287]} aria-hidden="true" />}
      >
        <Given label="Failed requests" value={118} unit="requests" source="Load balancer logs" asOf={now - 4 * 60_000} ages={AGES} />
        <Given label="Requests" value={4390} unit="requests" source="Request counter" asOf={now - 22 * 60_000} ages={AGES} />
      </Quotient>
    </Calculation>
  );
}
