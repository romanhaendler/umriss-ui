/* <Calculation> reads its children into a model and hands it to the view
   (ADR-0027, ADR-0028).

   This module and the elements call no hook and import nothing from
   @umriss-ui/core at runtime: on a server, every export of core is a client
   reference, and the reader must run there, in the graph where the tree is
   written. The model holds only what React can serialise (strings, numbers,
   Dates, plain objects, a Map, JSX); evaluation, which calls core's
   `assess`, stays with the view. */

import type { HTMLAttributes, ReactNode } from "react";
import type { RefProp } from "@umriss-ui/core";
import type { Metric } from "./elements";
import { readCalculation } from "./model";
import { CalculationView } from "./Calculation";

/** A composite: `ref`, `className`, `style` and every other attribute reach the
    surface; `aria-label`, `aria-labelledby` and `aria-describedby` reach the
    list it holds, which carries the role they name. */
export interface CalculationProps extends Omit<HTMLAttributes<HTMLDivElement>, "children">, RefProp<HTMLDivElement> {
  /** The result: exactly one quantity - a tree (`<Sum>`, `<Difference>`,
      `<Product>`, `<Quotient>` with their operands, `<Given>` as leaves) or a
      `<Chain>`, the two mixing freely; `<Ref>` for a quantity defined
      elsewhere. */
  children: ReactNode;
  /** Several numbers per quantity, side by side - headcount and full-time
      equivalents of the same teams (ADR-0038). Every `value` is then an
      object with a number for each metric id; unit and places are the
      metric's. A calculation with metrics only adds and subtracts, and
      assesses no target or limits. */
  metrics?: readonly Metric[];
  /** `"compact"` sets the lines as close as a compact table's rows: smaller
      type and less room above and below, under a finger still tall enough to
      tap. Columns, folding and wording stay as they are.
      @default the density of the `UmrissProvider`, else `"regular"` */
  density?: "regular" | "compact";
}

/** A derivation the package works out itself and shows as a statement, from
    the givens up to the result: one quantity as its child, written with
    `Given`, the operators, `Chain` and `Ref`. Because it performs every
    operation it shows, the number cannot disagree with the lines above it.
    Every tree below the outermost statement starts folded and opens beneath
    the row that is clicked. */
export function Calculation({ children, metrics, ...rest }: CalculationProps) {
  return <CalculationView model={readCalculation(children, metrics)} {...rest} />;
}
