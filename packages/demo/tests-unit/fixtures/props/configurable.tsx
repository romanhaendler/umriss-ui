/* Fixture for the configurator: one prop of every kind a control can be made
   of, and the kinds it cannot. Never rendered and never executed. */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { FixtureControlSize } from "./aliasBase";

/** How loud the button is. */
type FixtureVariant = "primary" | "secondary" | "ghost";

/** A colour of the palette. */
type FixtureHue = "red" | "orange" | "yellow" | "green" | "blue" | "violet";

export interface FixtureConfigurableProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** How loud the button is.
      @default "secondary" */
  variant?: FixtureVariant;
  /** Its colour.
      @default "blue" */
  hue?: FixtureHue;
  /** How large it is.
      @default the size of a `SizeProvider` around it, else `"md"` */
  size?: FixtureControlSize;
  /** Locks the button.
      @default false */
  loading?: boolean;
  /** Marks it wrong; no default. */
  invalid?: boolean;
  /** How many there are. */
  count?: number;
  /** What it is called for a screen reader. */
  label: string;
  /** Runs when it is pressed. */
  onPress?: () => void;
  /** What stands beside it. */
  extra?: ReactNode;
  /** How wide it is, e.g. "60%" or 120.
      @default "100%" */
  span?: string | number;
  /** What it reads; `null` while unknown. */
  reading?: number | null;
  /** How wide its line is, or "fill".
      @default 96 */
  width?: number | "fill";
}

export function FixtureConfigurable({ variant = "secondary", loading = false }: FixtureConfigurableProps) {
  return [variant, loading];
}
