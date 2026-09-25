/* Stacking (charts-stacking K1-K3, K5).

   Series of one stack are summed per x in registration order: each member's
   baseline is the sum of the members below it, its top that sum plus its own
   value. The result goes into the channels a filled mark already has - the
   top into y, the baseline into y0 (ADR-0011) -, so a stacked bar or area is
   drawn, hit and downsampled by the code that draws every other one.

   A gap stacks as zero for the members above it - the stack stays closed -
   and stays a gap in its own member: not drawn, never hit (K3). Positive and
   negative values stack apart, each from zero outwards, so that a negative
   member never cuts into the positive ones (the common convention).

   Members are matched by equal x, not by index: a member with data of its own
   stacks where its x meets the others', and counts as zero where it has no
   reading. Pure and free of the DOM, so that it can be tested. */

/** A stack member as far as stacking reads it: its own values. */
export interface StackInput {
  x: Float64Array;
  y: Float64Array;
  length: number;
}

export interface Stacked {
  /** The upper edge (where the value is negative: the lower one); NaN at a
      gap. */
  top: Float64Array;
  /** The edge it stands on - the sum of the members below; NaN at a gap. */
  bottom: Float64Array;
  /** What the member shows as its value: its own, or its share in percent in
      a normalised stack. NaN at a gap. */
  value: Float64Array;
  /** The stack's total at each of the member's points: every member's own
      value at that x summed, gaps as zero. */
  total: Float64Array;
}

/** The members stacked in the order given. `normalize` makes every x sum to
    100 (K5): each value becomes its share of the x' absolute sum, so
    positives and negatives together span 100. */
export function stackSeries(members: readonly StackInput[], normalize = false): Stacked[] {
  // ponytail: one Map lookup per point keyed by x; members that share one x
  // channel could stack by index instead, should a stack of millions show in
  // the materialisation time.
  const sums = new Map<number, { net: number; abs: number; up: number; down: number }>();
  for (const m of members) {
    for (let i = 0; i < m.length; i++) {
      const v = m.y[i] as number;
      if (Number.isNaN(v)) continue;
      const x = m.x[i] as number;
      const s = sums.get(x);
      if (s === undefined) sums.set(x, { net: v, abs: Math.abs(v), up: 0, down: 0 });
      else {
        s.net += v;
        s.abs += Math.abs(v);
      }
    }
  }
  return members.map((m) => {
    const out: Stacked = {
      top: new Float64Array(m.length),
      bottom: new Float64Array(m.length),
      value: new Float64Array(m.length),
      total: new Float64Array(m.length),
    };
    for (let i = 0; i < m.length; i++) {
      const v = m.y[i] as number;
      const s = sums.get(m.x[i] as number);
      out.total[i] = s === undefined ? Number.NaN : s.net;
      if (Number.isNaN(v) || s === undefined) {
        out.top[i] = Number.NaN;
        out.bottom[i] = Number.NaN;
        out.value[i] = Number.NaN;
        continue;
      }
      // The edges are summed in readings and only then scaled: summed shares
      // land a hair beside 100 - above it, a "nice" axis goes on to 150. An x
      // whose every value is zero has no shares: each is zero.
      out.value[i] = scaled(v, s.abs, normalize);
      const from = v >= 0 ? s.up : s.down;
      const to = from + v;
      if (v >= 0) s.up = to;
      else s.down = to;
      out.bottom[i] = scaled(from, s.abs, normalize);
      out.top[i] = scaled(to, s.abs, normalize);
    }
    return out;
  });
}

function scaled(u: number, abs: number, normalize: boolean): number {
  return !normalize ? u : abs === 0 ? 0 : (u / abs) * 100;
}
