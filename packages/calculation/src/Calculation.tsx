/* <Calculation> - reads its children, evaluates them, and shows the
   derivation as a statement (ADR-0027, ADR-0028). Because the package performs
   every operation it shows, what stands on the screen cannot disagree with the
   number.

   A statement on a surface of its own, in fixed columns - label, names,
   operator, number, unit, assessment. The outermost statement stands as on
   paper and closes on the Result as its last row; everything else is folded,
   and a derivation opens BENEATH the row that was clicked - the row never
   moves - as one group with it, closing with "= label", so that it says whose
   it is twice: attached, and by name.

   A nested list: every quantity is an item, its derivation a list inside it.
   Each row is drawn for the eye and read as one sentence; the drawn parts are
   hidden from assistive technology and the sentence from the eye. */

import { useId, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { AngleGlyph, Badge, Tooltip, VisuallyHidden, useFormats, useFreshness, useWording, verdictWeight } from "@umriss-ui/core";
import type { BadgeTone, FreshnessAges, Verdict } from "@umriss-ui/core";
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

/** The tone of a verdict's badge - a word beside it always (core's Badge). */
const TONE: Record<Verdict, BadgeTone> = { ok: "success", unknown: "neutral", warning: "warning", alarm: "danger" };

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
    /* Beneath the label only what a given or a quantity says about itself;
       everything else keeps to the row, so that rows keep one height. */
    const notes = [
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
    const kind = isResult ? "result" : quantity.interim && !reference ? "interim" : undefined;

    const line = (
      <div
        className={styles.line}
        style={{ "--depth": place.depth } as CSSProperties}
        data-inner={place.depth > 0 ? "" : undefined}
        data-kind={kind}
        data-foldable={foldable ? "" : undefined}
        data-reference={reference ? "" : undefined}
        data-mark={markOf(key, place.parent)}
        onPointerEnter={() => setMarked(key)}
        onPointerLeave={() => setMarked(null)}
        onFocus={() => setMarked(key)}
        onBlur={() => setMarked(null)}
        /* The whole row opens it for the pointer; the button is what the
           keyboard and a screen reader reach, and its click arrives here. */
        onClick={
          foldable
            ? () => {
                /* Selecting a figure to copy it is not asking for its derivation. */
                if (window.getSelection()?.toString()) return;
                toggle(key);
              }
            : undefined
        }
      >
        <VisuallyHidden>
          {[
            text.sentence,
            own.approximate && wording.calculationApproximateNote,
            worst !== undefined && wording.calculationWorstInside(verdictWord(worst, wording)),
          ]
            .filter(Boolean)
            .join(". ")}
        </VisuallyHidden>
        <span className={styles.labelCell}>
          {foldable ? (
            <button
              type="button"
              className={styles.disclosure}
              aria-expanded={isOpen}
              aria-controls={listId}
              aria-label={(isOpen ? wording.calculationHideDerivation : wording.calculationShowDerivation)(quantity.label)}
            >
              <AngleGlyph data-open={isOpen ? "" : undefined} />
            </button>
          ) : (
            <span className={styles.disclosure} aria-hidden="true" />
          )}
          <span className={styles.label} aria-hidden="true">
            {quantity.label}
          </span>
        </span>
        <span className={styles.names} aria-hidden="true">
          {foldable && !isOpen ? text.names : undefined}
        </span>
        <span className={styles.operator} aria-hidden="true">
          {operator}
        </span>
        <span className={styles.amount} aria-hidden="true" data-verdict={own.verdict}>
          {own.approximate && (
            <Tooltip content={wording.calculationApproximateNote}>
              <span className={styles.approximate}>≈</span>
            </Tooltip>
          )}
          {text.amount}
        </span>
        <span className={styles.unit} aria-hidden="true">
          {text.unit}
        </span>
        <span className={styles.assessment} aria-hidden="true">
          {text.reason !== undefined ? (
            <Badge>{text.reason}</Badge>
          ) : (
            own.verdict !== undefined && <Badge tone={TONE[own.verdict]}>{verdictWord(own.verdict, wording)}</Badge>
          )}
          {text.target !== undefined && <span className={styles.target}>{text.target}</span>}
          {worst !== undefined && (
            <span className={styles.worst} data-verdict={worst}>
              {wording.calculationWorstInside(verdictWord(worst, wording))}
            </span>
          )}
        </span>
        {notes.length > 0 && (
          /* A click here - on a link in the aside, on a sparkline - is the
             caller's, not a fold. */
          <span className={styles.notes} onClick={(event) => event.stopPropagation()}>
            {notes}
          </span>
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
      <li key={slot} className={styles.item} data-open={isOpen ? "" : undefined} style={{ "--depth": place.depth } as CSSProperties}>
        {line}
        {foldable && (
          <ul id={listId} className={styles.derivation} hidden={!isOpen}>
            {opening}
            {operands}
            {/* The derivation closes on the quantity it derives - by name, so
                that it says whose it is. Its sentence stands on the line above. */}
            <li className={styles.item} aria-hidden="true">
              <div
                className={styles.line}
                style={{ "--depth": inner.depth } as CSSProperties}
                data-inner=""
                data-closing=""
                data-mark={markOf(key, place.parent)}
              >
                <span className={styles.labelCell}>
                  <span className={styles.disclosure} />
                  <span className={styles.label}>= {quantity.label}</span>
                </span>
                <span className={styles.names} />
                <span className={styles.operator} />
                <span className={styles.amount} data-verdict={own.verdict}>
                  {own.approximate && (
                    <Tooltip content={wording.calculationApproximateNote}>
                      <span className={styles.approximate}>≈</span>
                    </Tooltip>
                  )}
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
