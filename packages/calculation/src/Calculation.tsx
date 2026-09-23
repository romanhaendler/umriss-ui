/* <Calculation> - reads its children, evaluates them, and shows the
   derivation top to bottom (ADR-0027). Because the package performs every
   operation it shows, what stands on the screen cannot disagree with the
   number.

   A nested list: one line per quantity, the operands under it. Each line is
   drawn for the eye and read as one sentence; the drawn parts are hidden from
   assistive technology and the sentence is hidden from the eye, so neither
   has to make do with the other's form. */

import { useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { AngleGlyph, VisuallyHidden, useFormats, useFreshness, useWording, verdictWeight } from "@umriss-ui/core";
import type { FreshnessAges, Verdict } from "@umriss-ui/core";
import { evaluate } from "./evaluate";
import { readCalculation } from "./model";
import { lineText, verdictWord } from "./present";
import styles from "./Calculation.module.css";

export interface CalculationProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  /** The result: exactly one quantity, with its derivation nested inside -
      `<Sum>`, `<Difference>`, `<Product>`, `<Quotient>` with their operands,
      `<Given>` as leaves, `<Ref>` for a quantity defined elsewhere. */
  children: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/** Freshness beside a given: its own component, because it owns the cadence. */
function FreshnessNote({ asOf, ages }: { asOf: Date | number; ages: FreshnessAges }) {
  const formats = useFormats();
  const wording = useWording();
  const reading = useFreshness(asOf, ages);
  const word =
    reading.freshness === "lost"
      ? wording.freshnessDisconnected
      : reading.freshness === "stale"
        ? wording.freshnessStale
        : wording.freshnessFresh;
  return (
    <span className={styles.freshness} data-freshness={reading.freshness}>
      {word}
      {reading.age !== null && ` · ${formats.relative(reading.age)}`}
    </span>
  );
}

export function Calculation({ children, className, ...rest }: CalculationProps) {
  const formats = useFormats();
  const wording = useWording();
  const uid = useId();
  const model = readCalculation(children);
  const results = evaluate(model);
  /* The component's own, and never touched by data: initially the result is
     open and everything below it folded. */
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set([model.result]));
  const [marked, setMarked] = useState<string | null>(null);

  const toggle = (key: string) =>
    setOpen((before) => {
      const next = new Set(before);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  const line = (key: string, reference: boolean, parent: string | null, index: number): ReactNode => {
    const quantity = model.quantities.get(key)!;
    const own = results.get(key)!;
    const text = lineText(model, results, key, reference, formats, wording);
    const derived = quantity.operator !== undefined && !reference;
    const isOpen = derived && open.has(key);
    const listId = `${uid}-${key}`;
    const worst: Verdict | undefined =
      derived && !isOpen && own.worst !== undefined && verdictWeight(own.worst) > verdictWeight(own.verdict ?? "ok")
        ? own.worst
        : undefined;
    const given = reference ? undefined : quantity.given;

    return (
      <li key={`${key}-${index}`} className={styles.item}>
        <div
          className={styles.line}
          data-reference={reference ? "" : undefined}
          data-mark={marked === null ? undefined : key === marked ? "use" : parent === marked ? "operand" : undefined}
          onPointerEnter={() => setMarked(key)}
          onPointerLeave={() => setMarked(null)}
          onFocus={() => setMarked(key)}
          onBlur={() => setMarked(null)}
        >
          {derived ? (
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={isOpen}
              aria-controls={listId}
              aria-label={(isOpen ? wording.calculationHideDerivation : wording.calculationShowDerivation)(quantity.label)}
              onClick={() => toggle(key)}
            >
              <AngleGlyph data-open={isOpen ? "" : undefined} />
            </button>
          ) : (
            <span className={styles.toggle} aria-hidden="true" />
          )}
          <VisuallyHidden>{text.sentence}</VisuallyHidden>
          <span className={styles.text} aria-hidden="true">
            <span className={styles.label}>{quantity.label}</span>
            {text.names !== undefined && <span className={styles.formula}>= {text.names}</span>}
            {text.numbers !== undefined && <span className={styles.formula}>= {text.numbers}</span>}
          </span>
          <span className={styles.result} aria-hidden="true" data-verdict={own.verdict}>
            {own.approximate && <span className={styles.approximate}>≈ </span>}
            {text.number}
          </span>
          <span className={styles.assessment} aria-hidden="true">
            {own.verdict !== undefined && (
              <span className={styles.verdict} data-verdict={own.verdict}>
                {verdictWord(own.verdict, wording)}
              </span>
            )}
            {text.target !== undefined && <span>{text.target}</span>}
          </span>
          {worst !== undefined && (
            <span className={styles.worst} data-verdict={worst}>
              {wording.calculationWorstInside(verdictWord(worst, wording))}
            </span>
          )}
        </div>
        {(text.reason !== undefined ||
          own.approximate ||
          (!reference && (quantity.explanation !== undefined || quantity.aside !== undefined)) ||
          given?.source !== undefined ||
          given?.asOf !== undefined) && (
          <div className={styles.notes}>
            {/* Both already stand in the sentence. */}
            {text.reason !== undefined && (
              <span className={styles.reason} aria-hidden="true">
                {text.reason}
              </span>
            )}
            {own.approximate && <span aria-hidden="true">≈ {wording.calculationApproximateNote}</span>}
            {!reference && quantity.explanation !== undefined && <span>{quantity.explanation}</span>}
            {given?.source !== undefined && <span>{wording.calculationSource(given.source)}</span>}
            {given?.asOf !== undefined &&
              (given.ages !== undefined ? (
                <FreshnessNote asOf={given.asOf} ages={given.ages} />
              ) : (
                <span>{wording.asOfAgo(formats.dateTime(new Date(given.asOf), false))}</span>
              ))}
            {!reference && quantity.aside !== undefined && <span>{quantity.aside}</span>}
          </div>
        )}
        {derived && (
          <ul id={listId} className={styles.list} hidden={!isOpen}>
            {quantity.operands.map((operand, i) => line(operand.key, operand.reference, key, i))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul className={cx(styles.calculation, className)} {...rest}>
      {line(model.result, false, null, 0)}
    </ul>
  );
}
