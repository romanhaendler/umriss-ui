/* Fixture for the gate's internal references: a requirement number and a
   source path in a description, an ADR number no file answers - and the same
   props written right. Never rendered and never executed. */

export interface FixtureLeakyProps {
  /** Binding to a y axis (R-4.12). */
  yAxisId?: string;
  /** Formats and wording. See `lib/language`. */
  language?: string;
  /** Where the rule is argued (ADR-9999). */
  rule?: string;
}

export interface FixtureCleanProps {
  /** Binding to a y axis.
      @remarks R-4.12 */
  yAxisId?: string;
  /** Formats and wording - see [Language](#/language). */
  language?: string;
  /** Where the rule is argued (ADR-0001), imported as `@umriss-ui/core/styles.css`. */
  rule?: string;
}
