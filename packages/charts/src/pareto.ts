/* Pareto: the arithmetic behind "which three reasons cost us the most".

   Sort, accumulate, find the cutoff crossing, collect the long tail into a
   remainder. No more: the categories are indices on the numeric x axis
   (ADR-0002) - category n lies at x = n, the labelling comes through
   `tickFormat` - and the cumulative line sits on a second y axis that the caller
   stacks. This module knows no axes.

   Deliberately free of the DOM and of the scene, like bars.ts. */

import { invariant } from "./dev";

/** An item, the way the caller counts it. */
export interface ParetoItem {
  readonly name: string;
  readonly value: number;
}

/** An item, the way it is drawn. */
export interface ParetoEntry {
  readonly name: string;
  readonly value: number;
  /** Category and at the same time x value: category n lies at x = n
      (ADR-0002). */
  readonly index: number;
  /** Share of the total, 0…1. */
  readonly share: number;
  /** Cumulative share up to and including this entry, 0…1. Exactly 1 at the
      last entry. */
  readonly cumulative: number;
  /** The collected tail. Exactly one entry can be this, and it always stands
      last. */
  readonly remainder: boolean;
}

export interface ParetoResult {
  readonly entries: readonly ParetoEntry[];
  /** Total of the drawn entries - after collecting, the same as before. */
  readonly total: number;
  /** Index of the first entry whose cumulative share reaches the cutoff; -1
      when it is never reached. */
  readonly cutoffIndex: number;
}

export interface ParetoOptions {
  /** The share whose crossing is sought. Whoever lands exactly on it counts as
      the crossing: the question is "which reasons make up eighty per cent", and
      whoever reaches eighty exactly belongs to them. */
  readonly cutoff: number;
  /** How many items stay on their own. Everything behind that becomes a single
      entry. Beyond the number of items no remainder arises at all - not an empty
      one. Default: infinity, so no collecting. */
  readonly collectRank: number;
  /** Name of the collected remainder. `@umriss-ui/charts` has no wording module
      - every string it draws comes from the caller - and no module is introduced
      for a single label. Hence no default either: until library-audit 03 the
      default here was "Sonstige", the one German word the package brought along
      itself. */
  readonly remainderName?: string;
}

/** What a call may specify: a collect rank only together with the name of the
    remainder it creates. */
export type ParetoSettings = { readonly cutoff?: number } & (
  | { readonly collectRank?: undefined; readonly remainderName?: undefined }
  | { readonly collectRank: number; readonly remainderName: string }
);

export const defaultOptions: Omit<ParetoOptions, "remainderName"> = {
  cutoff: 0.8,
  collectRank: Number.POSITIVE_INFINITY,
};

/** Sorts descending, accumulates, collects the tail and finds the cutoff
    crossing.

    Ties keep the input order - explicitly through the input index, not in
    reliance on a stable sort - so that two reasons with the same count do not
    swap places between two frames.

    The remainder stands last, independently of its value. Two hundred small
    reasons regularly yield a remainder larger than the third real bar; sorted
    into place, the chart would claim there is a fault reason called "other"
    which is the third biggest problem. */
export function pareto(
  items: readonly ParetoItem[],
  options: ParetoSettings = {},
): ParetoResult {
  const o: ParetoOptions = { ...defaultOptions, ...options };
  invariant(
    !Number.isFinite(o.collectRank) || o.remainderName !== undefined,
    "pareto: a collect rank needs `remainderName` - the package brings no name for the remainder.",
  );

  const sorted = items
    .map((item, inputIndex) => ({ item, inputIndex }))
    .sort((a, b) => b.item.value - a.item.value || a.inputIndex - b.inputIndex)
    .map(({ item }) => item);

  const rank = Math.max(0, Math.min(sorted.length, Math.floor(o.collectRank)));
  const head = sorted.slice(0, rank);
  const tail = sorted.slice(rank);

  // The remainder is the total of what it replaces. If nothing is left over
  // there is no remainder - not one with the value zero either.
  const drawn: ParetoItem[] =
    tail.length === 0
      ? head
      : [...head, { name: o.remainderName ?? "", value: tail.reduce((s, p) => s + p.value, 0) }];

  // The total is summed over the drawn entries in their order: only that way is
  // the running sum at the last entry bit-identical to the grand total and the
  // cumulative share there exactly 1.
  const total = drawn.reduce((s, p) => s + p.value, 0);

  const entries: ParetoEntry[] = [];
  let running = 0;
  for (let i = 0; i < drawn.length; i++) {
    const p = drawn[i] as ParetoItem;
    running += p.value;
    entries.push({
      name: p.name,
      value: p.value,
      index: i,
      share: total === 0 ? 0 : p.value / total,
      cumulative: total === 0 ? 0 : running / total,
      remainder: tail.length > 0 && i === drawn.length - 1,
    });
  }

  // Tolerance against floating point noise: a total that hits the cutoff exactly
  // by hand must not fail on 0.7999999999999999.
  const tolerance = Math.abs(o.cutoff) * 1e-12;
  const cutoffIndex = entries.findIndex((e) => e.cumulative >= o.cutoff - tolerance);

  return { entries, total, cutoffIndex };
}
