/* Fixture for the props reader: the shapes in which @umriss-ui/table declares
   its interface - a type alias as an intersection, a conditional helper type, a
   discriminated union and an interface of call signatures. Never rendered and
   never executed. */

import type { ReactNode } from "react";

export interface FixtureBase {
  /** Names the column. */
  label: string;
  /** Right aligned. */
  numeric?: boolean;
}

export interface FixturePaths<W> {
  /** What is sorted by. */
  sortValue?: (value: W) => number;
}

/* Not exported, without a page of its own: a mechanism. */
interface FixtureHelperBase {
  /** The width in pixels. */
  width?: number;
}

type FixtureFormat<W> = W extends number ? "percent" : never;

type FixtureChildren<W, Z> = W extends string
  ? {
      /** How the value appears. */
      children?: (value: W, row: Z) => ReactNode;
    }
  : { children: (value: W, row: Z) => ReactNode };

export type FixtureFieldColumn<Z, K extends keyof Z> = FixtureBase &
  FixturePaths<Z[K]> & {
    /** A field of the row. */
    value: K;
    /** A standard presentation. */
    format?: FixtureFormat<Z[K]>;
  } & FixtureHelperBase &
  FixtureChildren<Z[K], Z>;

interface FixtureActionBase {
  /** The label. */
  children: string;
}

export type FixtureAction<Z> =
  | (FixtureActionBase & {
      bulk?: false;
      /** Is handed the row. */
      onSelect: (row: Z) => void;
    })
  | (FixtureActionBase & {
      /** Acts on a list. */
      bulk: true;
      onSelect: (rows: readonly Z[]) => void;
    });

export interface FixtureComponent<Z> {
  <K extends keyof Z>(props: FixtureFieldColumn<Z, K>): ReactNode;
  (props: { id: string; value: (row: Z) => unknown }): ReactNode;
}
