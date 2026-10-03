/* Fixture for the gate's default in prose: descriptions that state a default
   in words and have none in the column - and the same props written right,
   with a value, a phrase, "no default" and a destructuring default. Never
   rendered and never executed. */

export interface FixtureProseProps {
  /** How many rows a page holds. Default 10. */
  pageSize?: number;
  /** Whether rows wrap; by default they do not. */
  wrap?: boolean;
  /** The defaultValue of the field and the defaults of the rows - neither is
      the word on its own. */
  seed?: string;
}

export interface FixtureTaggedDefaultProps {
  /** How many rows a page holds. Default 10.
      @default 10 */
  pageSize?: number;
  /** Whether rows wrap; by default they do not.
      @default no default */
  wrap?: boolean;
  /** The default tone. */
  tone?: "neutral" | "alarm";
}

export function FixtureTaggedDefault({ tone = "neutral" }: FixtureTaggedDefaultProps) {
  return tone;
}
