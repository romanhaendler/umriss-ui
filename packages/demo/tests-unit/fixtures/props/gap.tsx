/* Fixture: a prop without JSDoc. The gate has to be able to point at it - with
   file, line and name. */

export interface FixtureGapProps {
  /** The one that is explained. */
  explained?: string;
  bar?: number;
}
