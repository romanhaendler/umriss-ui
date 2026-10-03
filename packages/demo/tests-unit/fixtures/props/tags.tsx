/* Fixture for the props reader: the two JSDoc tags it reads, `@deprecated`
   and `@default`, beside the ones it drops. Never rendered and never executed. */

export interface FixtureTaggedProps {
  /** How many rows a page holds.
      @default 10 */
  pageSize?: number;
  /** How large the control is.
      @default the size of a `SizeProvider`, else `"md"` */
  size?: "sm" | "md";
  /** The tone the control takes.
      @default "neutral" */
  tone?: "neutral" | "alarm";
  /** The old name of `filter`.
      @deprecated Is called `filter` now;
      the old name goes with the next minor version. */
  match?: (row: string) => boolean;
  /** Which rows the table has.
      @remarks Never part of the view.
      @since 0.3 */
  filter?: (row: string) => boolean;
}

export function FixtureTagged({ tone = "neutral" }: FixtureTaggedProps) {
  return tone;
}

/* A prop renamed: the arm that forbids the old name beside the new one does
   not carry the tag, the arm that still takes it does. */
export type FixtureRenamed =
  | {
      /** What a group's foot shows. */
      aggregate?: string;
      /** The old name of `aggregate`. */
      footer?: never;
    }
  | {
      /** @deprecated Is called `aggregate` now. */
      footer?: string;
    };

export interface FixtureConflictProps {
  /** How many rows a page holds.
      @default 10 */
  pageSize?: number;
}

export function FixtureConflict({ pageSize = 20 }: FixtureConflictProps) {
  return pageSize;
}
