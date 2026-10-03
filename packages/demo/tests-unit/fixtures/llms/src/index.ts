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

/* For the API index: a type without a table, a component without a page, a
   hook with its tags, a deprecated constant. */

/** What the needle says. */
export type GaugeTone = "neutral" | "alarm";

/** The needle alone, for a gauge of your own. */
export function GaugeNeedle({ angle }: { angle: number }): null {
  void angle;
  return null;
}

/** Follows a value as it moves.
    @param initial The value it starts at.
    @returns The value now, and what the needle says of it. */
export function useGauge(initial: number): { value: number; tone: GaugeTone } {
  return { value: initial, tone: "neutral" };
}

/** The old name of the range.
    @deprecated Read `GAUGE_RANGE` instead. */
export const RANGE = GAUGE_RANGE;
