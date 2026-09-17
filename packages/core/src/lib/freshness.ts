/* Freshness: the second axis a value has (ADR-0010).

   A value carries an AS-OF TIME - the moment at which it was true. Not the one
   at which it was fetched, and not the one at which it was drawn: a query that
   immediately returns a measurement five minutes old is not fresh, and that is
   exactly what the naive version stamps as fresh.

   Freshness and verdict are TWO SEPARATE AXES. A stale value keeps its
   verdict. This module knows no verdict, takes none and returns none - it
   knows nothing of `unknown`. That is the one reason the file exists:
   whoever merges the axes while drawing greys away the last picture the
   operator had, at exactly the moment he needs it most.

   The reference time is a parameter. No clock is read here; the cadence
   belongs to `useFreshness`. */

/** How much a value can be relied on right now - independently of how it is judged. */
export type Freshness = "fresh" | "stale" | "lost";

/**
 * The two ages at which a value changes its state, in milliseconds. Both
 * bounds belong to the older state: exactly five minutes old is already
 * `stale`.
 *
 * `alt <= lost` is the sensible order. Stated the other way round, the
 * harder statement still wins - the middle state simply falls away.
 */
export interface FreshnessAges {
  /** From this age on the value counts as stale, but keeps its verdict. */
  stale: number;
  /** From this age on the connection counts as disconnected. */
  lost: number;
}

/** What may come in as an as-of time or a reference time. */
type Instant = Date | number | null | undefined;

/** Milliseconds since the epoch, or `null` where none can be made of it. */
function asMilliseconds(instant: Instant): number | null {
  if (instant === null || instant === undefined) return null;
  const ms = instant instanceof Date ? instant.getTime() : instant;
  return Number.isFinite(ms) ? ms : null;
}

/* The slowest and the fastest cadence, and the fraction of the smaller age by
   which a change of state may appear late at most. */
const CADENCE_SLOWEST = 60_000;
const CADENCE_FASTEST = 1_000;
const CADENCE_DIVISOR = 10;

/**
 * The age of an as-of time at the reference time, in milliseconds.
 *
 * Never negative: an as-of time in the future is real - the clocks of machine
 * and panel drift apart - and does not mean that a value is about to become
 * true, but that it is true right now. It counts as zero old.
 *
 * `null` where there is no computable age: without an as-of time there is
 * none.
 */
export function age(asOf: Instant, now: Instant): number | null {
  const asOfMs = asMilliseconds(asOf);
  const nowMs = asMilliseconds(now);
  if (asOfMs === null || nowMs === null) return null;
  return Math.max(0, nowMs - asOfMs);
}

/**
 * The freshness of a value: its as-of time, measured against a reference time,
 * placed against the two ages.
 *
 * A missing as-of time yields `lost`, and that is decided rather than
 * computed: `stale` presupposes that we know the age. Where we do not know it,
 * nothing covers the value, and that is the same statement as a broken
 * connection. The check therefore stands before any arithmetic and not inside
 * it.
 *
 * What the value means - good, critical, whatever - is not at issue here and
 * is not touched by this function.
 */
export function freshness(
  asOf: Instant,
  now: Instant,
  ages: FreshnessAges,
): Freshness {
  const since = age(asOf, now);
  if (since === null) return "lost";
  if (since >= ages.lost) return "lost";
  if (since >= ages.stale) return "stale";
  return "fresh";
}

/**
 * The cadence at which a display has to re-judge itself, in milliseconds -
 * derived from the ages, not from a fixed second. A tile that goes stale after
 * five minutes must not look sixty times a minute.
 *
 * A tenth of the smaller age: the change then appears late by at most ten per
 * cent of that age. Clamped to at most once a second and at least once a
 * minute.
 *
 * Where no age ever takes effect - infinite, not a number - or where both took
 * effect at once, the state no longer changes by itself; the slowest cadence
 * is then enough.
 */
export function cadence(ages: FreshnessAges): number {
  const effective = [ages.stale, ages.lost].filter(
    (schwelle) => Number.isFinite(schwelle) && schwelle > 0,
  );
  if (effective.length === 0) return CADENCE_SLOWEST;
  const smallest = Math.min(...effective);
  const derived = Math.round(smallest / CADENCE_DIVISOR);
  return Math.min(CADENCE_SLOWEST, Math.max(CADENCE_FASTEST, derived));
}
