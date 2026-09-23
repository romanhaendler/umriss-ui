/* Evaluation: from the model to a number per quantity. Pure.

   Full precision throughout; rounding happens only in presentation, and the
   one place presentation reaches back in here is the approximation mark: the
   operands as they will be shown, computed with the operator and rounded as
   the result is shown, against the result as shown. Where the two differ, the
   reader redoing the line would not arrive at the number on the screen, and
   the line says so.

   An absent operand makes the quantity absent, naming the given at the root
   of it; a quotient by zero is absent with its own reason. Nothing is ever
   carried on as zero. */

import { assess, verdictWeight } from "@umriss-ui/core";
import type { Assessment, Verdict } from "@umriss-ui/core";
import type { CalculationModel, Operator, Quantity } from "./model";

/** Why a quantity has no number: a given is missing, or a divisor is zero. */
export type Absence = { kind: "missing"; label: string } | { kind: "zero"; label: string };

export interface Evaluation {
  /** The number in full precision, or `null`. */
  value: number | null;
  absence?: Absence;
  /** The number as it is shown - in per cent for a percentage - rounded to
      the places it is shown with. `null` where absent. */
  shown: number | null;
  /** The operands as shown do not give the result as shown. */
  approximate: boolean;
  /** Where a target or limits are set. */
  assessment?: Assessment;
  /** The verdict the line shows: with limits, or `unknown` when absent. */
  verdict?: Verdict;
  /** The worst verdict inside the derivation, the quantity's own excluded. */
  worst?: Verdict;
}

/** The fraction digits a quantity is shown with at most: as the caller says,
    else one for a percentage, two for a derived number, and a given as given. */
export function placesOf(quantity: Quantity): number | undefined {
  if (quantity.decimals !== undefined) return quantity.decimals;
  if (quantity.format === "percent") return 1;
  return quantity.given ? undefined : 2;
}

/** Rounds half away from zero on the exact decimal value, as the formats do. */
function round(value: number, places: number | undefined): number {
  if (places === undefined) return value;
  return Math.sign(value) * Number(Math.abs(value).toFixed(places));
}

/** The number as shown: in per cent for a percentage, rounded. */
export function shownOf(quantity: Quantity, value: number): number {
  return round(quantity.format === "percent" ? value * 100 : value, placesOf(quantity));
}

/** The shown number back as the ratio the operator works on. */
const asOperand = (quantity: Quantity, shown: number) => (quantity.format === "percent" ? shown / 100 : shown);

/** The operator over the operands in order; in a sum, a negated operand (a
    chain's `Minus`) is taken away. */
function apply(operator: Operator, values: readonly number[], negated: readonly boolean[]): number {
  const [first, ...rest] = values as [number, ...number[]];
  switch (operator) {
    case "sum":
      return rest.reduce((a, b, i) => (negated[i + 1] ? a - b : a + b), first);
    case "difference":
      return rest.reduce((a, b) => a - b, first);
    case "product":
      return rest.reduce((a, b) => a * b, first);
    case "quotient":
      return first / rest[0]!;
  }
}

const worse = (a: Verdict | undefined, b: Verdict | undefined): Verdict | undefined =>
  b === undefined || (a !== undefined && verdictWeight(a) >= verdictWeight(b)) ? a : b;

/** Every quantity of the model, evaluated. */
export function evaluate(model: CalculationModel): ReadonlyMap<string, Evaluation> {
  const results = new Map<string, Evaluation>();

  const run = (key: string): Evaluation => {
    const known = results.get(key);
    if (known) return known;
    const quantity = model.quantities.get(key)!;

    let value: number | null = null;
    let absence: Absence | undefined;
    let approximate = false;
    let worst: Verdict | undefined;

    if (quantity.given) {
      const given = quantity.given.value;
      if (typeof given === "number" && Number.isFinite(given)) value = given;
      else absence = { kind: "missing", label: quantity.label };
    } else {
      const operands = quantity.operands.map((operand) => ({ operand, ...run(operand.key) }));
      for (const { operand, verdict, worst: inside } of operands) {
        const here = operand.reference ? verdict : worse(verdict, inside);
        worst = worse(worst, here);
      }
      absence = operands.find((o) => o.absence)?.absence;
      const divisor = operands[1];
      if (!absence && quantity.operator === "quotient" && divisor!.value === 0) {
        absence = { kind: "zero", label: model.quantities.get(divisor!.operand.key)!.label };
      }
      if (!absence) {
        const negated = quantity.operands.map((o) => o.negated === true);
        value = apply(quantity.operator!, operands.map((o) => o.value!), negated);
        const fromShown = apply(
          quantity.operator!,
          operands.map((o) => asOperand(model.quantities.get(o.operand.key)!, o.shown!)),
          negated,
        );
        approximate = shownOf(quantity, fromShown) !== shownOf(quantity, value);
      }
    }

    const set = { target: quantity.target, limits: quantity.limits };
    const assessment =
      quantity.target !== undefined || (quantity.limits?.length ?? 0) > 0 ? assess(value, set) : undefined;
    const verdict = (quantity.limits?.length ?? 0) > 0 ? assessment!.verdict : value === null ? "unknown" : undefined;

    const evaluation: Evaluation = {
      value,
      absence,
      shown: value === null ? null : shownOf(quantity, value),
      approximate,
      assessment,
      verdict,
      worst,
    };
    results.set(key, evaluation);
    return evaluation;
  };

  for (const key of model.quantities.keys()) run(key);
  return results;
}
