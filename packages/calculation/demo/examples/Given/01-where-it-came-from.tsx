import { useState } from "react";
import { Sparkline } from "@umriss-ui/core";
import { Calculation, Given, Quotient } from "../../../src";

export const title = "Where a number came from";

/* A given can say where it came from and when it was true. With `ages` it
   carries a freshness, as a Stat does: fresh, stale or lost - beside the
   number, never instead of its verdict. `explanation` is a sentence of plain
   text, and `aside` holds content of your own - here the last shifts'
   scrap as a sparkline. Neither takes part in the calculation. */

const AGES = { stale: 15 * 60_000, lost: 60 * 60_000 };

export default function WhereItCameFrom() {
  const [now] = useState(() => Date.now());
  return (
    <Calculation aria-label="Scrap rate, press 3">
      <Quotient
        label="Scrap rate"
        format="percent"
        limits={[{ value: 0.03, side: "upper", severity: "warning" }]}
        explanation="Scrapped parts over every part the press made."
        aside={<Sparkline data={[0.021, 0.024, 0.019, 0.028, 0.033, 0.036]} aria-hidden="true" />}
      >
        <Given label="Scrapped parts" value={18} unit="pcs" source="Quality station QS-2" asOf={now - 4 * 60_000} ages={AGES} />
        <Given label="Parts made" value={512} unit="pcs" source="Press counter" asOf={now - 22 * 60_000} ages={AGES} />
      </Quotient>
    </Calculation>
  );
}
