/* Tick algorithm (R-4.1): the classical 1-2-5 grid.
   Step ∈ {1, 2, 5}·10ⁿ, ticks lie on multiples of the step, domain boundaries
   widened to ticks under "nice".
   Purely functional and free of the DOM - fully unit tested (R-7.3). */

/** Normalise −0 to +0 (arises from Math.ceil(-0.4)). */
function normalizeZero(v: number): number {
  return Object.is(v, -0) ? 0 : v;
}

/** Step for a span at an intended tick count. */
export function tickStep(span: number, count: number): number {
  if (!Number.isFinite(span) || span <= 0) return 1;
  const target = Math.max(1, Math.floor(count));
  const raw = span / target;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / magnitude;
  // Epsilon against floating point noise: 0.001/5 yields 2.0000000000000004 in
  // binary, and without a tolerance that would wrongly become the step 5 and
  // not 2.
  const eps = 1e-9;
  const factor =
    normalized <= 1 + eps ? 1 : normalized <= 2 + eps ? 2 : normalized <= 5 + eps ? 5 : 10;
  return factor * magnitude;
}

/** Decimal places a step calls for (0.25 → 2, R-4.1). */
export function decimalsForStep(step: number): number {
  const magnitude = Math.abs(step);
  if (!Number.isFinite(magnitude) || magnitude === 0) return 0;
  const exponent = Math.floor(Math.log10(magnitude));
  let digits = exponent < 0 ? -exponent : 0;
  const tolerance = magnitude * 1e-9;
  while (digits < 12 && Math.abs(Number(magnitude.toFixed(digits)) - magnitude) > tolerance) {
    digits++;
  }
  return digits;
}

/** Rounds floating point artefacts out of i·step. */
function roundTo(v: number, digits: number): number {
  if (digits <= 0 || !Number.isFinite(v) || Math.abs(v) >= 1e21) return normalizeZero(v);
  return normalizeZero(Number(v.toFixed(Math.min(20, digits))));
}

/** Domain widened to nice boundaries. Constant series → ±1 (R-4.3). */
export function niceDomain(
  min: number,
  max: number,
  count: number,
): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  const step = tickStep(max - min, count);
  const digits = decimalsForStep(step);
  return [
    roundTo(Math.floor(min / step) * step, digits),
    roundTo(Math.ceil(max / step) * step, digits),
  ];
}

/** Exact domain from the data; constant series → ±1 (R-4.3). */
export function dataDomain(min: number, max: number): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  return [min, max];
}

/** Tick values within the domain (multiples of the step). */
export function ticksFor(min: number, max: number, count: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [normalizeZero(min)];
  const [from, to] = min < max ? [min, max] : [max, min];
  const step = tickStep(to - from, count);
  const digits = decimalsForStep(step);
  // Tolerance against floating point noise at the domain boundaries.
  const tolerance = step * 1e-9;
  const first = Math.ceil((from - tolerance) / step);
  const last = Math.floor((to + tolerance) / step);
  if (!Number.isFinite(first) || !Number.isFinite(last)) return [];
  const values: number[] = [];
  for (let i = first; i <= last; i++) {
    values.push(roundTo(i * step, digits));
  }
  return values;
}
