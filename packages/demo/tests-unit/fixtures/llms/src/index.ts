/* Fixture: the package the examples import, so that they typecheck as the
   real ones do. Never rendered. */

export interface GaugeProps {
  /** The value the needle points at. */
  value: number;
  /** Draws the gauge at half size. */
  compact?: boolean;
}

export function Gauge({ value, compact = false }: GaugeProps): null {
  void value;
  void compact;
  return null;
}

/** The range every gauge spans - exported, and named on no page. */
export const GAUGE_RANGE = [0, 100] as const;

/** Where the needle stands, as a fraction of the range. */
export function fraction(value: number): number {
  return (value - GAUGE_RANGE[0]) / (GAUGE_RANGE[1] - GAUGE_RANGE[0]);
}
