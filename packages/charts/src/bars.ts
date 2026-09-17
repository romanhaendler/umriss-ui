/* Bar geometry (ADR-0002).

   Bars sit on the numeric x axis, not on a band scale. Their width therefore
   comes out of the step - the smallest distance between two consecutive x
   values - and is mapped by the same affine scale as every other mark.

   Deliberately free of the DOM and of the scene: this is the one new piece of
   arithmetic in this work behind which there is no pictorial intuition, and half
   a bar out of place does not show up on a canvas.

   The file is called after the bars and not after the `Bar` component: on a file
   system that does not distinguish upper and lower case, `bar.ts` and `Bar.tsx`
   resolve to one another, and an import of `./Bar` would find this module. See
   the note in CONTEXT.md on module names. */

import type { SeriesKind } from "./types";

/** Smallest distance between two consecutive x values, in domain units.
    Assumes ascending x values (R-2.6). 0 where there is no distance: with a
    single point, and with nothing but equal x values. */
export function measureStep(x: Float64Array, n: number): number {
  let smallest = Number.POSITIVE_INFINITY;
  for (let i = 1; i < n; i++) {
    const d = (x[i] as number) - (x[i - 1] as number);
    if (d > 0 && d < smallest) smallest = d;
  }
  return Number.isFinite(smallest) ? smallest : 0;
}

/** The step actually calculated with: the measured one, and where none can be
    measured, the width of the axis' extent. A single data point thereby gets a
    visible bar instead of one of width zero. */
export function effectiveStep(measured: number, domainSpan: number): number {
  return measured > 0 ? measured : domainSpan;
}

/** Where a bar lies relative to its x value, in domain units. */
export interface BarPlacement {
  /** Distance of the left edge from the x value; negative, because it lies to
      the left of it. */
  offset: number;
  width: number;
}

/** The group as a whole is centred on the x value, not its first member:
    otherwise, with two bar series, every bar would sit half a step to the right
    of its own mark - and that would look plausible. */
export function barPlacement(
  step: number,
  fraction: number,
  groupIndex: number,
  groupSize: number,
): BarPlacement {
  const total = step * fraction;
  const width = total / groupSize;
  return { offset: -total / 2 + groupIndex * width, width };
}

/** A series, as far as the grouping needs to know it. */
export interface BarCandidate {
  order: number;
  kind: SeriesKind;
  xAxisId: string;
  /** Measured step of this series; 0 where none can be measured. */
  step: number;
  /** Width fraction of this series. */
  fraction: number;
}

export interface BarGroup {
  index: number;
  size: number;
  /** Step of the whole group: the smallest measurable one of its members. */
  step: number;
  /** Width fraction of the whole group: that of the first member. */
  fraction: number;
}

/** Bars on the same x axis share one step. Every bar series learns here how
    many of them there are and which one it is - in registration order, so that
    the arrangement matches the order of the legend. Series that are not bars do
    not appear in the map.

    Step and width fraction hold for the group as a whole, not per member:
    barPlacement() derives the offsets from the group width, and if every member
    calculated with its own values they would drift apart and lie on top of one
    another. Members may carry series-own data of differing density - which is
    why the smallest measurable step applies, because only it guarantees that
    neighbouring x positions do not touch. A step of 0 means "not measurable"
    and not "tiny"; it does not count. */
export function barGroups(
  series: readonly BarCandidate[],
): Map<number, BarGroup> {
  const members = new Map<string, BarCandidate[]>();
  for (const entry of series) {
    if (entry.kind !== "bar") continue;
    const list = members.get(entry.xAxisId);
    if (list === undefined) members.set(entry.xAxisId, [entry]);
    else list.push(entry);
  }
  const result = new Map<number, BarGroup>();
  for (const list of members.values()) {
    let smallest = Number.POSITIVE_INFINITY;
    for (const m of list) {
      if (m.step > 0 && m.step < smallest) smallest = m.step;
    }
    const shared = Number.isFinite(smallest) ? smallest : 0;
    const fraction = (list[0] as BarCandidate).fraction;
    list.forEach((m, index) => {
      result.set(m.order, {
        index,
        size: list.length,
        step: shared,
        fraction,
      });
    });
  }
  return result;
}
