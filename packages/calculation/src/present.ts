/* What a line says, as text: its number, its two formulas, its target and its
   accessible sentence. Pure - formats and wording come in as values. */

import type { Formats, Verdict, Wording } from "@umriss-ui/core";
import type { Absence, Evaluation } from "./evaluate";
import { shownOf } from "./evaluate";
import type { CalculationModel, Operator, Quantity } from "./model";

export interface LineText {
  /** The number with its unit as shown, or the absent-value mark. */
  number: string;
  /** "Run time ÷ Planned production time"; absent on a given or reference. */
  names?: string;
  /** "412 min ÷ 450 min". */
  numbers?: string;
  /** "below target 85 %", where a target is set and the number known. */
  target?: string;
  /** Why there is no number. */
  reason?: string;
  /** The line read as one sentence. */
  sentence: string;
}

const SYMBOL: Record<Operator, keyof Wording> = {
  sum: "calculationSumSymbol",
  difference: "calculationDifferenceSymbol",
  product: "calculationProductSymbol",
  quotient: "calculationQuotientSymbol",
};

const WORD: Record<Operator, keyof Wording> = {
  sum: "calculationSumWord",
  difference: "calculationDifferenceWord",
  product: "calculationProductWord",
  quotient: "calculationQuotientWord",
};

export function verdictWord(verdict: Verdict, wording: Wording): string {
  switch (verdict) {
    case "alarm":
      return wording.verdictAlarm;
    case "warning":
      return wording.verdictWarning;
    case "unknown":
      return wording.verdictUnknown;
    default:
      return wording.verdictOk;
  }
}

export function reasonText(absence: Absence, wording: Wording): string {
  return absence.kind === "missing"
    ? wording.calculationMissing(absence.label)
    : wording.calculationDivisionByZero(absence.label);
}

/** A number of this quantity with its unit - "91.6 %" shown, "91.6 percent"
    spoken. Padded only where the caller fixed the places. */
function withUnit(quantity: Quantity, shown: number, formats: Formats, percent: string): string {
  const unit = quantity.format === "percent" ? percent : quantity.unit;
  const text = formats.number(shown, quantity.decimals);
  return unit ? `${text} ${unit}` : text;
}

/** Everything a line says about one quantity. A reference says only its
    label and number; its derivation stands where it is defined. */
export function lineText(
  model: CalculationModel,
  results: ReadonlyMap<string, Evaluation>,
  key: string,
  reference: boolean,
  formats: Formats,
  wording: Wording,
): LineText {
  const quantity = model.quantities.get(key)!;
  const own = results.get(key)!;
  const number = (q: Quantity, e: Evaluation, spoken: boolean) =>
    e.shown === null
      ? spoken
        ? wording.verdictUnknown
        : wording.statAbsentValue
      : withUnit(q, e.shown, formats, spoken ? wording.calculationPercent : "%");

  const formula = (spoken: boolean) => {
    if (reference || !quantity.operator) return {};
    const join = ` ${wording[(spoken ? WORD : SYMBOL)[quantity.operator]] as string} `;
    const operands = quantity.operands.map((o) => model.quantities.get(o.key)!);
    return {
      names: operands.map((q) => q.label).join(join),
      numbers: operands.map((q) => number(q, results.get(q.key)!, spoken)).join(join),
    };
  };

  const target = (spoken: boolean) => {
    const deviation = own.assessment?.deviation;
    if (deviation === undefined || quantity.target === undefined) return undefined;
    const text = withUnit(quantity, shownOf(quantity, quantity.target), formats, spoken ? wording.calculationPercent : "%");
    if (deviation > 0) return wording.calculationAboveTarget(text);
    if (deviation < 0) return wording.calculationBelowTarget(text);
    return wording.calculationOnTarget(text);
  };

  const shown = formula(false);
  const spoken = formula(true);
  const reason = own.absence ? reasonText(own.absence, wording) : undefined;
  const equals = ` ${wording.calculationEquals} `;
  const result = own.approximate
    ? `${wording.calculationApproximately} ${number(quantity, own, true)}`
    : number(quantity, own, true);
  const sentence = [
    quantity.label + equals + [spoken.names, spoken.numbers, result].filter(Boolean).join(`,${equals}`),
    own.verdict !== undefined && own.verdict !== "unknown" ? verdictWord(own.verdict, wording) : undefined,
    target(true),
    reason,
  ]
    .filter(Boolean)
    .join(", ");

  return { number: number(quantity, own, false), ...shown, target: target(false), reason, sentence };
}
