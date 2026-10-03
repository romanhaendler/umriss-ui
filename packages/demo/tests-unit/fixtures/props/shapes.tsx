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

/* `aggregate` and its old name `footer` in @umriss-ui/table: a union whose
   arms forbid each other's member with `never`, one arm taking a type that has
   a table of its own, the whole reached through a helper's parameters. */
export interface FixtureTotals<W> {
  /** What the values come to. */
  total?: (values: readonly W[]) => W;
}

type FixtureRenamed<W> =
  | (FixtureTotals<W> & {
      /** The old name of `total` – not together with it. */
      sum?: never;
      /** Gone in every arm. */
      legacy?: never;
    })
  | {
      /** Not together with `sum`, its old name. */
      total?: never;
      sum?: FixtureFormat<W>;
      /** Gone in every arm. */
      legacy?: never;
    };

/* Not exported: a helper whose parameters the table must not show. */
interface FixtureDraft<W, Z> {
  /** Checks a draft. */
  validate?: (value: W, row: Z) => string;
}

export type FixtureMeasure<Z, K extends keyof Z = keyof Z> = {
  /** A field of the row. */
  value: K;
} & FixtureRenamed<Z[K]> &
  FixtureDraft<Z[K], Z>;

/* The helper taken with one argument too few: its `Z` stands in the table
   unreplaced, and no header introduces it. */
// @ts-expect-error -- the reader must report the `Z` this leaves behind
export interface FixtureLoose<T> extends FixtureDraft<T> {
  /** A value. */
  value: T;
}
