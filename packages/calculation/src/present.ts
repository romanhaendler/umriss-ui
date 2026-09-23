/* What a line says, as text: its number, its two formulas, its target and its
   accessible sentence. Pure - formats and wording come in as values. */

import type { Formats, Verdict, Wording } from "@umriss-ui/core";
import type { Absence, Evaluation } from "./evaluate";
import { shownOf } from "./evaluate";
import type { CalculationModel, Operator, Quantity } from "./model";

export interface LineText {
  /** The number as shown, without its unit, or the absent-value mark. */
  amount: string;
  /** The unit as shown - "%" for a percentage - where there is one and a
      number to stand beside. */
  unit?: string;
  /** "= Run time ÷ Planned production time", or "15 operands" where there
      are more than can be written out; absent on a given or reference. */
  names?: string;
  /** "below target 85 %", where a target is set and the number known. */
  target?: string;
  /** Why there is no number. */
  reason?: string;
  /** The line read as one sentence. */
  sentence: string;
}

/** Above this many operands a line shows how many, not a formula of them
    all: the operands stand beside it anyway (ADR-0028). */
export const OPERANDS_WRITTEN_OUT = 4;

/** Where a line stands in its parent: the parent's operator, and whether it is
    taken away. The first operand stands without one. */
export interface Position {
  operator: Operator;
  negated: boolean;
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

/** The operator a line carries in its parent, as symbol or as word. */
export function operatorText(position: Position, spoken: boolean, wording: Wording): string {
  const operator = position.negated ? "difference" : position.operator;
  return wording[(spoken ? WORD : SYMBOL)[operator]] as string;
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
  position?: Position,
): LineText {
  const quantity = model.quantities.get(key)!;
  const own = results.get(key)!;
  const number = (q: Quantity, e: Evaluation, spoken: boolean) =>
    e.shown === null
      ? spoken
        ? wording.verdictUnknown
        : wording.statAbsentValue
      : withUnit(q, e.shown, formats, spoken ? wording.calculationPercent : "%");

  const formula = (spoken: boolean): { names?: string; numbers?: string } => {
    if (reference || !quantity.operator) return {};
    /* The count stands on the line only; the sentence keeps the formula. */
    if (!spoken && quantity.operands.length > OPERANDS_WRITTEN_OUT) {
      return { names: wording.calculationOperandCount(quantity.operands.length) };
    }
    const terms = (text: (q: Quantity) => string) =>
      quantity.operands
        .map((o, i) => {
          const q = model.quantities.get(o.key)!;
          if (i === 0) return text(q);
          const operator = operatorText({ operator: quantity.operator!, negated: o.negated === true }, spoken, wording);
          return `${operator} ${text(q)}`;
        })
        .join(" ");
    return {
      names: terms((q) => q.label),
      numbers: terms((q) => number(q, results.get(q.key)!, spoken)),
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

  const shownNames = formula(false).names;
  const names = shownNames === undefined || quantity.operands.length > OPERANDS_WRITTEN_OUT ? shownNames : `= ${shownNames}`;
  const spoken = formula(true);
  const reason = own.absence ? reasonText(own.absence, wording) : undefined;
  const equals = ` ${wording.calculationEquals} `;
  const result = own.approximate
    ? `${wording.calculationApproximately} ${number(quantity, own, true)}`
    : number(quantity, own, true);
  const prefix = position ? `${operatorText(position, true, wording)} ` : "";
  const sentence = [
    prefix + quantity.label + equals + [spoken.names, spoken.numbers, result].filter(Boolean).join(`,${equals}`),
    own.verdict !== undefined && own.verdict !== "unknown" ? verdictWord(own.verdict, wording) : undefined,
    target(true),
    reason,
  ]
    .filter(Boolean)
    .join(", ");

  const unit = own.shown === null ? undefined : quantity.format === "percent" ? "%" : quantity.unit;
  const amount = own.shown === null ? wording.statAbsentValue : formats.number(own.shown, quantity.decimals);
  return { amount, unit, names, target: target(false), reason, sentence };
}
