/* ColumnGroup: a label over the columns it wraps. The head draws a second row
   of cells for it; a `Column` inside reads the group from here and registers
   with it (a spec's `heading`). No DOM of its own. */

import { createContext, useId, useMemo } from "react";
import type { ReactNode } from "react";

export interface Heading {
  id: string;
  label: string;
}

export const HeadingContext = createContext<Heading | null>(null);

/** The props of `ColumnGroup`. */
export interface ColumnGroupProps {
  /** The text over the group's columns. */
  label: string;
  /** The `Column`s of the group; they stay together when columns are reordered. */
  children?: ReactNode;
}

/** Puts a second head row over the `Column`s it wraps: one cell, spanning the
    group's visible columns. */
export function ColumnGroup({ label, children }: ColumnGroupProps): ReactNode {
  const id = useId();
  const heading = useMemo(() => ({ id, label }), [id, label]);
  return <HeadingContext value={heading}>{children}</HeadingContext>;
}

/** The columns with a group boundary on their left: a column whose group
    differs from the one before it. A table without a group has none. A group
    that pinning splits stays one group - its parts have their pin edge. */
export function groupEdges<T extends { spec: { heading?: Heading } }>(columns: readonly T[]): ReadonlySet<T> {
  const edges = new Set<T>();
  if (!columns.some((e) => e.spec.heading)) return edges;
  columns.forEach((e, i) => {
    if (i > 0 && e.spec.heading?.id !== columns[i - 1]!.spec.heading?.id) edges.add(e);
  });
  return edges;
}
