/* Scales (R-2.14, R-2.15).
   The Scale interface is fixed; V0 implements only LinearScale.

   The drawing code assumes no concrete class, but it does assume affinity: it
   reads m and b off the scale and computes px = v·m + b inline in the point
   loop, instead of calling toPx() per point. That is why both coefficients stand
   in the interface and not only here (ADR-0001). Time and category scales are
   later implementations of the same interface; a log scale is affine in log(v)
   and not in v, so it would need a pre-transformed channel out of
   materialisation - the ADR says why that is more than swapping a scale.

   The domain→pixel transformation runs exclusively here; zoom and pan would
   later be possible by exchanging the domain alone. */

import { ticksFor } from "./ticks";
import type { Scale } from "./types";

export class LinearScale implements Scale {
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
  /** Pre-computed line equation px = v·m + b - the draw loop uses it directly. */
  readonly m: number;
  readonly b: number;

  constructor(domain: readonly [number, number], range: readonly [number, number]) {
    this.domain = domain;
    this.range = range;
    const span = domain[1] - domain[0];
    if (span === 0 || !Number.isFinite(span)) {
      // Degenerate domain: map everything onto the middle of the range.
      this.m = 0;
      this.b = (range[0] + range[1]) / 2;
    } else {
      this.m = (range[1] - range[0]) / span;
      this.b = range[0] - domain[0] * this.m;
    }
  }

  toPx(v: number): number {
    return v * this.m + this.b;
  }

  fromPx(px: number): number {
    if (this.m === 0) return this.domain[0];
    return (px - this.b) / this.m;
  }

  ticks(n: number): number[] {
    return ticksFor(this.domain[0], this.domain[1], n);
  }
}
