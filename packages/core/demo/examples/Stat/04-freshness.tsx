import { Grid, Stat } from "../../../src";
import type { FreshnessAges, LimitSet } from "../../../src";

export const title = "Freshness is a different axis";

/* An old value keeps its verdict. It does not become "unknown": on a lost
   connection precisely what a person then needs would otherwise be lost - the
   last picture he had. What is missing is not the value but its freshness, and
   those are two axes (ADR-0010).

   `asOf` is WHEN the value was true - not when it was fetched or rendered.
   Without `ages` there is no display: a timestamp without a rule for when it is
   too old is no information.

   The three readings are DISTANCES and not fixed instants. The reference is
   taken once on load: then a person reads something sensible here, and the
   screenshot suite still gets the same picture every time - it freezes the
   page's clock, and `Date.now()` then returns the frozen moment. */

const NOW = Date.now();
const MIN = 60_000;

const AGES: FreshnessAges = { stale: 5 * MIN, lost: 30 * MIN };

const FURNACE: LimitSet = {
  limits: [{ value: 860, side: "upper", severity: "alarm" }],
};

export default function Freshness() {
  return (
    <Grid minItemWidth="200px" gap={4}>
      <Stat
        label="Furnace 1 · current"
        value={871}
        unit="°C"
        limits={FURNACE}
        asOf={NOW - 30_000}
        ages={AGES}
      />
      <Stat
        label="Furnace 1 · stale"
        value={871}
        unit="°C"
        limits={FURNACE}
        asOf={NOW - 12 * MIN}
        ages={AGES}
      />
      <Stat
        label="Furnace 1 · line dead"
        value={871}
        unit="°C"
        limits={FURNACE}
        asOf={NOW - 90 * MIN}
        ages={AGES}
      />
    </Grid>
  );
}
