/* Fixture for the props reader. Never rendered and never executed - it exists
   so that the reader can be checked against a handful of lines rather than
   against half the library. */

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export interface FixtureButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** How loud the button is. */
  variant?: "primary" | "secondary";
  /** Blocks and shows an indicator. */
  loading?: boolean;
}

export function FixtureButton({ variant = "secondary", loading = false }: FixtureButtonProps) {
  return { variant, loading };
}

export interface FixtureTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The columns - generic over the row type. */
  columns: readonly FixtureColumn<T>[];
  /** What stands in a cell. */
  cell: (row: T) => ReactNode;
}

export interface FixtureColumn<T> {
  /** The column's identifier. */
  id: string;
  /** How the value comes out of the row. */
  value: (row: T) => unknown;
}

export interface FixtureSplitProps extends Omit<FixtureButtonProps, "variant"> {
  /** The menu's entries. */
  menu: ReactNode;
}
