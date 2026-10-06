/* What a line says, as text: its number, its two formulas, its target and its
   accessible sentence. Pure - formats and wording come in as values. */

import type { Formats, Verdict, Wording } from "@umriss-ui/core";
import type { Absence, Evaluation } from "./evaluate";
import { shownOf } from "./evaluate";
import type { Metric } from "./elements";
import type { CalculationModel, Operator, Quantity } from "./model";

export interface LineText {
  /** The number as shown, without its unit, or the absent-value mark -
      unsigned where the line stands as its contribution. */
  amount: string;
  /** The quantity's own number, always with its sign: where its derivation
      closes. */
  ownAmount: string;
  /** The unit as shown - "%" for a percentage - where there is one and a
      number to stand beside. */
  unit?: string;
  /** "= Error requests ÷ Total requests", or "15 operands" where there
      are more than can be written out; absent on a given or reference. */
  names?: string;
  /** "below target 85 %", where a target is set and the number known. */
  target?: string;
  /** Why there is no number. */
  reason?: string;
  /** The line read as one sentence. */
  sentence: string;
  /** The formula in names as spoken, where the quantity is derived. */
  spokenNames?: string;
  /** The number as spoken, with its unit and, where approximated, the word
      for it. */
  spokenNumber: string;
}

/** Above this many operands a line shows how many, not a formula of them
    all: the operands stand beside it anyway (ADR-0028). */
export const OPERANDS_WRITTEN_OUT = 4;

/** Where a line stands in its parent: the operator drawn before it, and
    whether that operator is a minus. A line that adds or takes away is drawn
    as its contribution (ADR-0049): `unsigned` then says that its numbers
    stand without their sign, the direction being the operator's. */
export interface Position {
  operator: Operator;
  negated: boolean;
  unsigned?: boolean;
}

/**
 * Where the operand at `index` of `parent` stands, from its numbers as shown -
 * one per metric, one without metrics. A line that adds or takes away shows its
 * contribution: the direction as its operator, its numbers unsigned - where
 * every value that is neither zero nor absent points the same way. Otherwise,
 * and on a factor, the operator as written. The first operand has none, unless
 * it lowers a sum; the interim before, in a chain, is not drawn here at all.
 */
export function positionOf(parent: Quantity, index: number, values: readonly (number | null)[]): Position | undefined {
  const operand = parent.operands[index]!;
  if (operand.previous) return undefined;
  const operator = parent.operator!;
  const first = index === 0;
  if (operator !== "sum" && operator !== "difference") return first ? undefined : { operator, negated: false };
  const written = operator === "difference" ? !first : operand.negated === true;
  const signs = new Set(values.filter((v): v is number => v !== null && v !== 0).map(Math.sign));
  const position: Position =
    signs.size === 1
      ? { operator: "sum", negated: written !== signs.has(-1), unsigned: true }
      : { operator: "sum", negated: written };
  return first && !position.negated ? undefined : position;
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
  /** Where each of the quantity's own operands stands, for its formula. */
  operandPosition: (index: number) => Position | undefined = () => undefined,
): LineText {
  const quantity = model.quantities.get(key)!;
  const own = results.get(key)!;
  /** The number as shown - without its sign where the line stands as its
      contribution. */
  const shownAt = (e: Evaluation, at?: Position) => (e.shown !== null && at?.unsigned ? Math.abs(e.shown) : e.shown);
  const number = (q: Quantity, e: Evaluation, spoken: boolean, at?: Position) => {
    const shown = shownAt(e, at);
    return shown === null
      ? spoken
        ? wording.verdictUnknown
        : wording.statAbsentValue
      : withUnit(q, shown, formats, spoken ? wording.calculationPercent : "%");
  };

  const formula = (spoken: boolean): { names?: string; numbers?: string } => {
    if (reference || !quantity.operator) return {};
    if (quantity.operands.length === 0) return { names: wording.calculationNoOperands };
    /* The count stands on the line only; the sentence keeps the formula. */
    if (!spoken && quantity.operands.length > OPERANDS_WRITTEN_OUT) {
      return { names: wording.calculationOperandCount(quantity.operands.length) };
    }
    const terms = (text: (q: Quantity, at?: Position) => string) =>
      quantity.operands
        .map((o, i) => {
          const q = model.quantities.get(o.key)!;
          const at = operandPosition(i);
          return at ? `${operatorText(at, spoken, wording)} ${text(q, at)}` : text(q);
        })
        .join(" ");
    return {
      names: terms((q) => q.label),
      numbers: terms((q, at) => number(q, results.get(q.key)!, spoken, at)),
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
  const names =
    shownNames === undefined || quantity.operands.length === 0 || quantity.operands.length > OPERANDS_WRITTEN_OUT
      ? shownNames
      : `= ${shownNames}`;
  const spoken = formula(true);
  const reason = own.absence ? reasonText(own.absence, wording) : undefined;
  const equals = ` ${wording.calculationEquals} `;
  const result = own.approximate
    ? `${wording.calculationApproximately} ${number(quantity, own, true, position)}`
    : number(quantity, own, true, position);
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
  const amountOf = (shown: number | null) => (shown === null ? wording.statAbsentValue : formats.number(shown, quantity.decimals));
  return { amount: amountOf(shownAt(own, position)), ownAmount: amountOf(own.shown), unit, names, target: target(false), reason, sentence, spokenNames: spoken.names, spokenNumber: result };
}

/** A line of a calculation with metrics, read as one sentence: its formula in
    names once, then each metric's number, and the reason where one is
    missing (ADR-0038). The formula in numbers is left out - the operand lines
    read their own. */
export function metricsSentence(
  label: string,
  texts: readonly LineText[],
  metrics: readonly Metric[],
  wording: Wording,
  position?: Position,
): string {
  const prefix = position ? `${operatorText(position, true, wording)} ` : "";
  const names = texts[0]!.spokenNames;
  const head = prefix + label + (names === undefined ? "" : ` ${wording.calculationEquals} ${names}`);
  const figures = metrics.map((metric, i) =>
    [`${metric.label} ${texts[i]!.spokenNumber}`, texts[i]!.reason].filter(Boolean).join(", "),
  );
  return `${head}: ${figures.join("; ")}`;
}
