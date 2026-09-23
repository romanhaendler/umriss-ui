/* <Calculation> - reads its children, evaluates them, and shows the
   derivation as a statement (ADR-0027, ADR-0028). Because the package performs
   every operation it shows, what stands on the screen cannot disagree with the
   number.

   The look of a statement of account, for tree and chain alike, in fixed
   columns - label, operator, number, unit. The outermost statement stands as
   on paper: a tree's operands, a rule, the Result above a double rule; a
   chain's interims one under another. Everything else is folded, and the label
   is the disclosure: a derivation opens BENEATH the line that was clicked -
   the line never moves - as a nested calculation on the sunken surface with a
   bar that hangs from the line, and it closes with "= label", so that it
   says whose it is twice: attached, and by name.

   A nested list: every quantity is an item, its derivation a list inside it.
   Each line is drawn for the eye and read as one sentence; the drawn parts are
   hidden from assistive technology and the sentence from the eye. */

import { useId, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { AngleGlyph, VisuallyHidden, useFormats, useFreshness, useWording, verdictWeight } from "@umriss-ui/core";
import type { FreshnessAges, Verdict } from "@umriss-ui/core";
import { evaluate } from "./evaluate";
import { readCalculation } from "./model";
import type { Operand, Quantity } from "./model";
import { lineText, operatorText, verdictWord } from "./present";
import type { Position } from "./present";
import styles from "./Calculation.module.css";

export interface CalculationProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  /** The result: exactly one quantity - a tree (`<Sum>`, `<Difference>`,
      `<Product>`, `<Quotient>` with their operands, `<Given>` as leaves) or a
      `<Chain>`, the two mixing freely; `<Ref>` for a quantity defined
      elsewhere. */
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

/** Where a quantity is drawn: how deep, whether it is an interim of a chain in
    view (`flat`: the interims before it stand beside it, not inside it),
    which quantity it is an operand of, and with which operator. */
interface Place {
  depth: number;
  flat: boolean;
  parent: string | null;
  position?: Position;
}

export function Calculation({ children, className, ...rest }: CalculationProps) {
  const formats = useFormats();
  const wording = useWording();
  const uid = useId();
  const model = readCalculation(children);
  const results = evaluate(model);
  /* The component's own, and never touched by data. Everything starts folded:
     the outermost statement is what a reader sees first (ADR-0028). */
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const [marked, setMarked] = useState<string | null>(null);

  const toggle = (key: string) =>
    setOpen((before) => {
      const next = new Set(before);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  const positionIn = (parent: Quantity, operand: Operand, index: number): Position | undefined =>
    index === 0 || operand.previous ? undefined : { operator: parent.operator!, negated: operand.negated === true };

  const markOf = (key: string, parent: string | null) =>
    marked === null ? undefined : key === marked ? "use" : parent === marked ? "operand" : undefined;

  /** The items of one quantity: for an interim of a chain in view, the
      interims before it
      first, then its own item - its line, and beneath it its derivation. */
  const items = (key: string, reference: boolean, place: Place, slot: string): ReactNode[] => {
    const quantity = model.quantities.get(key)!;
    const own = results.get(key)!;
    const text = lineText(model, results, key, reference, formats, wording, place.position);
    const derived = quantity.operator !== undefined && !reference;
    const isResult = key === model.result && !reference;
    /* The outermost tree stands open for good: its operands above it, as on
       paper. Everything else folds. */
    const statement = isResult && derived && !quantity.interim;
    const foldable = derived && !statement;
    const isOpen = foldable && open.has(key);
    const listId = `${uid}-${key}`;
    const inner: Place = { depth: statement ? place.depth : place.depth + 1, flat: false, parent: key };
    const previous = derived ? quantity.operands.find((o) => o.previous) : undefined;
    const beside = previous && place.flat ? items(previous.key, false, { ...place, parent: key, position: undefined }, `${slot}-c`) : [];
    /* Inside the derivation, a chain's value before stands first: as one line
       where the interims of the chain are already in view, or as those
       interims themselves where they are not (a chain that is an operand in a
       tree). */
    const opening = previous
      ? place.flat
        ? items(previous.key, true, inner, `${slot}-c`)
        : items(previous.key, false, { ...inner, flat: true }, `${slot}-c`)
      : [];
    const operands = derived
      ? quantity.operands.map((operand, index) =>
          operand.previous
            ? null
            : items(operand.key, operand.reference, { ...inner, position: positionIn(quantity, operand, index) }, `${slot}-${index}`),
        )
      : [];
    /* In a chain in view, the interims before have lines of their own;
       elsewhere the fold hides the whole chain. */
    const inside = previous && place.flat ? own.worstSince : own.worst;
    const worst: Verdict | undefined =
      foldable && !isOpen && inside !== undefined && verdictWeight(inside) > verdictWeight(own.verdict ?? "ok")
        ? inside
        : undefined;
    const given = reference ? undefined : quantity.given;
    const operator = place.position ? operatorText(place.position, false, wording) : undefined;
    const notes = [
      foldable && !isOpen && text.names !== undefined && <span key="names">{text.names}</span>,
      text.reason !== undefined && (
        /* It stands in the sentence already. */
        <span key="reason" className={styles.reason} aria-hidden="true">
          {text.reason}
        </span>
      ),
      worst !== undefined && (
        <span key="worst" className={styles.worst} data-verdict={worst}>
          {wording.calculationWorstInside(verdictWord(worst, wording))}
        </span>
      ),
      own.approximate && !reference && (
        <span key="approximate" aria-hidden="true">
          ≈ {wording.calculationApproximateNote}
        </span>
      ),
      !reference && quantity.explanation !== undefined && <span key="explanation">{quantity.explanation}</span>,
      given?.source !== undefined && <span key="source">{wording.calculationSource(given.source)}</span>,
      given?.asOf !== undefined &&
        (given.ages !== undefined ? (
          <FreshnessNote key="asOf" asOf={given.asOf} ages={given.ages} />
        ) : (
          <span key="asOf">{wording.asOfAgo(formats.dateTime(new Date(given.asOf), false))}</span>
        )),
      !reference && quantity.aside !== undefined && <span key="aside">{quantity.aside}</span>,
    ].filter(Boolean);
    const assessment = own.verdict !== undefined || text.target !== undefined;
    const line = (
      <div
        className={styles.line}
        style={{ "--depth": place.depth } as CSSProperties}
        data-inner={place.depth > 0 ? "" : undefined}
        data-kind={isResult ? "result" : derived ? "derived" : undefined}
        data-rule={statement ? "" : undefined}
        data-open={isOpen ? "" : undefined}
        data-reference={reference ? "" : undefined}
        data-mark={markOf(key, place.parent)}
        onPointerEnter={() => setMarked(key)}
        onPointerLeave={() => setMarked(null)}
        onFocus={() => setMarked(key)}
        onBlur={() => setMarked(null)}
      >
        <VisuallyHidden>{text.sentence}</VisuallyHidden>
        <span className={styles.labelCell}>
          {foldable ? (
            <button
              type="button"
              className={styles.label}
              aria-expanded={isOpen}
              aria-controls={listId}
              aria-label={(isOpen ? wording.calculationHideDerivation : wording.calculationShowDerivation)(quantity.label)}
              onClick={() => toggle(key)}
            >
              {quantity.label}
              <AngleGlyph className={styles.disclosure} data-open={isOpen ? "" : undefined} />
            </button>
          ) : (
            <span className={styles.label} aria-hidden="true">
              {quantity.label}
            </span>
          )}
        </span>
        <span className={styles.operator} aria-hidden="true">
          {operator ?? (own.approximate ? "≈" : "")}
        </span>
        <span className={styles.amount} aria-hidden="true" data-verdict={own.verdict}>
          {operator !== undefined && own.approximate && "≈ "}
          {text.amount}
        </span>
        <span className={styles.unit} aria-hidden="true">
          {text.unit}
        </span>
        {(notes.length > 0 || assessment) && (
          <>
            <span className={styles.notes}>{notes}</span>
            <span className={styles.assessment} aria-hidden="true">
              {own.verdict !== undefined && (
                <span className={styles.verdict} data-verdict={own.verdict}>
                  {verdictWord(own.verdict, wording)}
                </span>
              )}
              {text.target !== undefined && <span>{text.target}</span>}
            </span>
          </>
        )}
      </div>
    );

    if (statement) {
      return [
        <li key={slot} className={styles.item}>
          <ul className={styles.list}>{operands}</ul>
          {line}
        </li>,
      ];
    }

    return [
      ...beside,
      <li key={slot} className={styles.item}>
        {line}
        {foldable && (
          <ul
            id={listId}
            className={styles.derivation}
            style={{ "--depth": inner.depth } as CSSProperties}
            hidden={!isOpen}
          >
            {opening}
            {operands}
            {/* The derivation closes on the quantity it derives - by name, so
                that it says whose it is. Its sentence stands on the line above. */}
            <li className={styles.item} aria-hidden="true">
              <div
                className={styles.line}
                style={{ "--depth": inner.depth } as CSSProperties}
                data-inner=""
                data-rule=""
                data-closing=""
                data-mark={markOf(key, place.parent)}
              >
                <span className={styles.labelCell}>
                  <span className={styles.label}>= {quantity.label}</span>
                </span>
                <span className={styles.operator}>{own.approximate ? "≈" : ""}</span>
                <span className={styles.amount} data-verdict={own.verdict}>
                  {text.amount}
                </span>
                <span className={styles.unit}>{text.unit}</span>
              </div>
            </li>
          </ul>
        )}
      </li>,
    ];
  };

  return (
    <ul className={cx(styles.calculation, className)} {...rest}>
      {items(model.result, false, { depth: 0, flat: true, parent: null }, "r")}
    </ul>
  );
}
