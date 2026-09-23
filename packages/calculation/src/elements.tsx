/* The elements a calculation is written in (ADR-0027).

   None of them renders anything: `<Calculation>` reads their props before it
   renders and draws the lines itself. They exist so that the caller writes the
   derivation as it will be shown, and so that the props tables have a type to
   stand on. */

import type { ReactNode } from "react";
import type { FreshnessAges, Limit } from "@umriss-ui/core";

/** What every quantity - given or derived - can say about itself. */
export interface QuantityProps {
  /** What the quantity is called. It stands on its line, wherever it is an
      operand, and in the accessible sentence. */
  label: string;
  /** Makes the quantity referable: `<Ref to>` stands for it elsewhere. Needed
      only for a quantity used more than once. */
  id?: string;
  /** A label written after the number - "min", "pcs", "€". Never converted
      and never checked; the calculation does no unit algebra. */
  unit?: string;
  /** `percent` presents a plain ratio as per cent: 0.916 is shown as 91.6 %.
      The quantity stays a ratio in every operation. */
  format?: "percent";
  /** Fixed number of fraction digits as shown. Rounding happens only in
      presentation; every operation uses the full value. Without it: one digit
      for a percentage, at most two for a derived number, and a given as it
      was given. */
  decimals?: number;
  /** The value this quantity is meant to reach - missed, never violated. */
  target?: number;
  /** Bounds the quantity is assessed against, through core's `assess()`. */
  limits?: readonly Limit[];
  /** A sentence of plain text beside the line: why the quantity is here, or
      what it means. */
  explanation?: string;
  /** Content of the caller's own beside the line - a sparkline, a link. It
      never takes part in the calculation. */
  aside?: ReactNode;
}

export interface GivenProps extends QuantityProps {
  /** The number the calculation starts from. Absent (`null`, `undefined`,
      not finite) makes every quantity that depends on it absent, with the
      reason - never zero. */
  value: number | null | undefined;
  /** Where the number came from: a system, a report, a person. */
  source?: string;
  /** When the number was true - not when it was fetched. */
  asOf?: Date | number;
  /** The ages at which `asOf` turns stale and lost. With both, the given
      carries a freshness through core; with `asOf` alone, only the time. */
  ages?: FreshnessAges;
}

export interface OperatorProps extends QuantityProps {
  /** The operands, in order: quantities, givens and references. */
  children?: ReactNode;
}

export interface RefProps {
  /** The `id` of the quantity this reference stands for. */
  to: string;
}

/** A number the calculation does not derive. */
export const Given: (props: GivenProps) => null = () => null;

/** The sum of two or more operands. */
export const Sum: (props: OperatorProps) => null = () => null;

/** The first operand minus every other: a − b − c. */
export const Difference: (props: OperatorProps) => null = () => null;

/** The product of two or more operands. */
export const Product: (props: OperatorProps) => null = () => null;

/** Exactly two operands: the first divided by the second. */
export const Quotient: (props: OperatorProps) => null = () => null;

/** A quantity defined elsewhere in the calculation, standing as an operand. */
export const Ref: (props: RefProps) => null = () => null;

/* The chain (ADR-0028): read top to bottom, each operand worked into the value
   before it, strictly in order, ended by an interim. */

export interface ChainProps {
  /** The operands, top to bottom: a first quantity with no operator, then
      `Plus`, `Minus`, `Times` and `DividedBy` with their operands and
      `Interim`s naming the value where they stand. The last line is an
      `Interim`; a `Times` or `DividedBy` stands alone between two named
      values. */
  children?: ReactNode;
}

export interface ChainOperandProps extends Omit<GivenProps, "label" | "value"> {
  /** The operand's name, where the line is a given written in place. Left
      out where the line holds a quantity as its child. */
  label?: string;
  /** The operand's number, where the line is a given written in place.
      Absent as for a `Given`: the line and every interim after it are
      absent, with the reason. */
  value?: number | null;
  /** Instead of `label` and `value`: exactly one quantity - a tree, a
      `<Ref>` or a `<Chain>`. */
  children?: ReactNode;
}

/** A calculation read top to bottom, as on paper. */
export const Chain: (props: ChainProps) => null = () => null;

/** Adds its operand to the value before it. */
export const Plus: (props: ChainOperandProps) => null = () => null;

/** Takes its operand from the value before it. */
export const Minus: (props: ChainOperandProps) => null = () => null;

/** Multiplies the named value before it by its operand. */
export const Times: (props: ChainOperandProps) => null = () => null;

/** Divides the named value before it by its operand. */
export const DividedBy: (props: ChainOperandProps) => null = () => null;

/** Names the value of a chain where it stands. */
export const Interim: (props: QuantityProps) => null = () => null;
