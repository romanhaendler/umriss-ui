/* Fixture for the props reader: named aliases in a type cell - which of them
   show their values under their name, and which do not. Never rendered and
   never executed. */

import type { FixtureControlSize } from "./aliasBase";

/** A button's heights - the controls'. */
export type FixtureButtonSize = FixtureControlSize;

/** A step of the spacing scale. */
type FixtureStep = 1 | 2 | 3;

/** A shape with members. */
export interface FixtureShape {
  /** What it is. */
  kind: string;
}

/** The shape under another name. */
export type FixtureShapeAlias = FixtureShape;

/** A name or a number of decimals. */
type FixtureMixed = "percent" | { decimals: number };

export interface FixtureAliasProps {
  /** Two hops to a literal union. */
  size?: FixtureButtonSize;
  /** An array of a literal union. */
  steps?: FixtureStep[];
  /** An alias to an interface. */
  shape?: FixtureShapeAlias;
  /** A literal union written inline. */
  tone?: "quiet" | "loud";
  /** A union with a member that is no literal. */
  format?: FixtureMixed;
}
