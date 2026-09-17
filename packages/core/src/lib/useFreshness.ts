/* The cadence for the rule in ./freshness.

   The rule is pure and reads no clock; somebody still has to ask it while a
   tile stands open and ages. That is this hook: the thin React shell over a
   pure module, as everywhere in this package. The timer is thereby one
   decision in one place instead of one per tile - and its interval comes from
   the ages, not from a fixed second (see `cadence`).

   What the hook does NOT do: fetch, poll, reconnect. It is told when a value
   was true. And it touches no verdict. */

import { useEffect, useMemo, useState } from "react";
import { freshness, age, cadence } from "./freshness";
import type { Freshness, FreshnessAges } from "./freshness";

export interface FreshnessReading {
  /** `fresh`, `stale` or `lost` - never a verdict. */
  freshness: Freshness;
  /** Age in milliseconds, never negative; `null` without an as-of time. For the wording. */
  age: number | null;
  /** The reference time of this reading, in milliseconds since the epoch. */
  now: number;
}

/**
 * Judges a value's as-of time continuously and causes a redraw when it changes
 * state.
 *
 * The caller gives the ages; there is deliberately no default, because "stale"
 * at a furnace controller means something other than "stale" on a shift
 * overview.
 */
export function useFreshness(
  asOf: Date | number | null | undefined,
  ages: FreshnessAges,
): FreshnessReading {
  /* Bring it down to simple values before any of it lands in a dependency
     list: a `Date` is a new object on every render, and a `NaN` would never
     equal itself - either would set the effect up again on every render. */
  const raw = asOf instanceof Date ? asOf.getTime() : asOf;
  const asOfMs = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
  const { stale: staleAge, lost: lostAge } = ages;

  const cadenceMs = cadence({ stale: staleAge, lost: lostAge });

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    /* The cadence is the only dependency: a new as-of time needs no new
       interval. The reference time is then at most one cadence old, and that
       is exactly how precise the reading is, per `cadence`. */
    const nummer = setInterval(() => setNow(Date.now()), cadenceMs);
    return () => clearInterval(nummer);
  }, [cadenceMs]);

  return useMemo(
    () => ({
      freshness: freshness(asOfMs, now, {
        stale: staleAge,
        lost: lostAge,
      }),
      age: age(asOfMs, now),
      now,
    }),
    [asOfMs, now, staleAge, lostAge],
  );
}
