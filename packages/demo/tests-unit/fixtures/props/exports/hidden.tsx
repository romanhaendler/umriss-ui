/* Fixture for the gate's unexported type: a cell, a definition's declaration
   and a header's constraint that name a type the entry does not export, a
   table the entry does not export - and a table that names only what the
   entry exports. Never rendered and never executed. */

/** A shape the entry exports. */
export interface FixtureOpenShape {
  /** What kind it is. */
  kind: string;
}

/** A shape the entry leaves out. */
export interface FixtureHiddenShape {
  /** What kind it is. */
  kind: string;
}

/** A key the entry leaves out. */
export type FixtureHiddenKey = "a" | "b";

/** A union the entry exports, of one shape it does not. */
export type FixtureOpenUnion = FixtureOpenShape | FixtureHiddenShape;

export interface FixtureHiddenProps<K extends FixtureHiddenKey = "a"> {
  /** The shape it draws. */
  shape?: FixtureHiddenShape;
  /** The shapes it may draw. */
  either?: FixtureOpenUnion;
  /** The key it reads. */
  key?: K;
}

export interface FixtureUnlistedProps {
  /** The shape it draws. */
  shape?: FixtureOpenShape;
}

export interface FixtureOpenProps {
  /** The shape it draws. */
  shape?: FixtureOpenShape;
}
