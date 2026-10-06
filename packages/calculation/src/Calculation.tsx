/* <Calculation> - reads its children, evaluates them, and shows the
   derivation as a statement (ADR-0027, ADR-0028). Because the package performs
   every operation it shows, what stands on the screen cannot disagree with the
   number.

   A statement on a surface of its own, in fixed columns - label, names,
   operator, number, unit, assessment. The outermost statement stands as on
   paper and closes on the Result as its last row, and a chain in view stands
   open, its interims beneath their lines. Every tree below that is folded,
   and a derivation opens BENEATH the row that was clicked - the row never
   moves - as one group with it, closing with "= label", so that it says whose
   it is twice: attached, and by name.

   A nested list: every quantity is an item, its derivation a list inside it.
   Each row is drawn for the eye and read as one sentence; the drawn parts are
   hidden from assistive technology and the sentence from the eye.

   With metrics (ADR-0038) every row carries a number per metric, each in its
   own column under a head that names the metric and its unit. The unit stands
   again only where a result closes. Where the figures leave the label less
   than 10 rem - measured, since it depends on how many metrics and digits -
   each row puts its figures on a line beneath its label. */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { AngleGlyph, Badge, Tooltip, VisuallyHidden, useFormats, useFreshness, useWording, verdictWeight } from "@umriss-ui/core";
import type { BadgeTone, FreshnessAges, Verdict } from "@umriss-ui/core";
import { evaluate } from "./evaluate";
import type { Metric } from "./elements";
import type { Evaluation } from "./evaluate";
import { perMetric, readCalculation } from "./model";
import type { Quantity } from "./model";
import { lineText, metricsSentence, operatorText, positionOf, verdictWord } from "./present";
import type { LineText, Position } from "./present";
import styles from "./Calculation.module.css";

/** `className` and `style` size and place the surface; every other attribute -
    `aria-label` first of all - lands on the list the surface holds. */
export interface CalculationProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
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
}

/** What the label keeps at least beside the figures before they move to a
    line of their own. */
const LABEL_MIN_REM = 10;

/* The grid lines of a metric's number and unit, as the stylesheet lays out
   the tracks: label, names, operator, then number and unit per metric, then
   the assessment - which therefore stands where a further metric's number
   would. */
const amountLine = (metric: number) => 4 + 2 * metric;
const unitLine = (metric: number) => 5 + 2 * metric;

/** What one metric says of one line: its evaluation and its text. */
interface Reading {
  own: Evaluation;
  text: LineText;
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

/** A derivation the package works out itself and shows as a statement, from
    the givens up to the result: one quantity as its child, written with
    `Given`, the operators, `Chain` and `Ref`. Because it performs every
    operation it shows, the number cannot disagree with the lines above it.
    Every tree below the outermost statement starts folded and opens beneath
    the row that is clicked. */
export function Calculation({ children, className, style, metrics, ...rest }: CalculationProps) {
  const formats = useFormats();
  const wording = useWording();
  const uid = useId();
  const model = readCalculation(children, metrics);
  /* One view of the model and its evaluation per metric; without metrics,
     one. */
  const byMetric = perMetric(model).map((view) => ({ view, results: evaluate(view) }));
  /* The component's own, and never touched by data. Every tree below the
     outermost statement starts folded (ADR-0028). */
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const [marked, setMarked] = useState<string | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);
  const [twoLines, setTwoLines] = useState(false);
  const count = metrics?.length ?? 0;
  /* Two lines where the room the figures leave is less than the labels need -
     their longest, from its indent - and less than 10 rem, below which a
     label may no longer wrap. The resolved tracks give what the figures take:
     the operator column and every metric's number and unit. A label's width is
     measured over all its line boxes, so it is the same on one line or two,
     and the answer does not flip once it is taken. */
  const measure = useCallback(() => {
    const frame = frameRef.current;
    const tracks = frame && count > 0 ? getComputedStyle(frame.firstElementChild!).gridTemplateColumns.split(" ").map(parseFloat) : [];
    /* From the operator's track up to the assessment's; tracks count from 0,
       grid lines from 1. Unresolved tracks (no layout, as in a test) keep one
       line. */
    const end = amountLine(count) - 1;
    if (!frame || tracks.length <= end || tracks.some((track) => !Number.isFinite(track))) {
      setTwoLines(false);
      return;
    }
    const figures = tracks.slice(2, end).reduce((sum, track) => sum + track, 0);
    let needed = 0;
    const range = document.createRange();
    for (const label of frame.querySelectorAll<HTMLElement>(`.${styles.label}`)) {
      range.selectNodeContents(label);
      const text = [...range.getClientRects()].reduce((sum, box) => sum + box.width, 0);
      if (text === 0) continue;
      const cell = label.parentElement!;
      const from = label.getBoundingClientRect().left - cell.getBoundingClientRect().left;
      needed = Math.max(needed, from + text + parseFloat(getComputedStyle(cell).paddingRight));
    }
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    setTwoLines(frame.clientWidth - figures < Math.min(needed, LABEL_MIN_REM * rem));
  }, [count]);
  /* After every commit - other numbers, other widths - and on every change of
     the place; the state changes only when the answer does. */
  useLayoutEffect(() => measure());
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || count === 0) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(frame);
    return () => observer.disconnect();
  }, [measure, count]);

  const toggle = (key: string) =>
    setOpen((before) => {
      const next = new Set(before);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  /** Where the operand at `index` stands, from its number as shown in every
      metric - a line that rounds to zero has no direction. */
  const positionIn = (parent: Quantity, index: number): Position | undefined =>
    positionOf(
      parent,
      index,
      byMetric.map(({ results }) => results.get(parent.operands[index]!.key)!.shown),
    );

  /* Whether anything can fold at all: where nothing can, the disclosure's
     column is not kept free, and the labels start at the surface's edge. */
  let folds = false;

  /** Each metric's number and unit - one pair without metrics - drawn for
      the eye; the line's sentence reads them. With metrics, the unit stands
      only where a result closes. */
  const figures = (readings: readonly Reading[], closes: boolean) =>
    readings.map(({ own, text }, i) => [
      <span
        key={`amount-${i}`}
        className={styles.amount}
        aria-hidden="true"
        data-verdict={own.verdict}
        data-later={i > 0 ? "" : undefined}
        style={metrics ? ({ "--column": amountLine(i) } as CSSProperties) : undefined}
      >
        {own.approximate && (
          <Tooltip content={wording.calculationApproximateNote}>
            <span className={styles.approximate}>≈</span>
          </Tooltip>
        )}
        {closes ? text.ownAmount : text.amount}
      </span>,
      <span
        key={`unit-${i}`}
        className={styles.unit}
        aria-hidden="true"
        style={metrics ? ({ "--column": unitLine(i) } as CSSProperties) : undefined}
        data-last={metrics && i === readings.length - 1 ? "" : undefined}
      >
        {metrics && !closes ? undefined : text.unit}
      </span>,
    ]);

  const markOf = (key: string, parent: string | null) =>
    marked === null ? undefined : key === marked ? "use" : parent === marked ? "operand" : undefined;

  /** The items of one quantity: for an interim of a chain in view, the
      interims before it
      first, then its own item - its line, and beneath it its derivation. */
  const items = (key: string, reference: boolean, place: Place, slot: string): ReactNode[] => {
    const quantity = model.quantities.get(key)!;
    const readings: Reading[] = byMetric.map(({ view, results }) => ({
      own: results.get(key)!,
      text: lineText(view, results, key, reference, formats, wording, place.position, (index) => positionIn(quantity, index)),
    }));
    /* With metrics nothing is assessed, and an absence always reaches the
       row itself: what the first metric says of verdicts holds for the row. */
    const { own, text } = readings[0]!;
    const derived = quantity.operator !== undefined && !reference;
    const isResult = key === model.result && !reference;
    /* What stands open for good, its operands above it as on paper: the
       outermost tree, and every interim of a chain in view - a chain is the
       working itself, and folding it would take away what it is for. Trees in
       its lines fold, and so does a chain that is an operand. */
    /* An empty sum has nothing to stand above it, as a statement or folded;
       its line says so instead. */
    const statement = derived && quantity.operands.length > 0 && (quantity.interim ? place.flat : isResult);
    const foldable = derived && !statement && quantity.operands.length > 0;
    const isOpen = foldable && open.has(key);
    folds ||= foldable;
    const listId = `${uid}-${key}`;
    const inner: Place = { depth: statement ? place.depth : place.depth + 1, flat: false, parent: key };
    const previous = derived ? quantity.operands.find((o) => o.previous) : undefined;
    const beside = previous && place.flat ? items(previous.key, false, { ...place, parent: key, position: undefined }, `${slot}-c`) : [];
    /* A chain that is an operand opens whole: the interims before its last
       stand first in its derivation, open as in any chain in view. */
    const opening = previous && !place.flat ? items(previous.key, false, { ...inner, flat: true }, `${slot}-c`) : [];
    const operands = derived
      ? quantity.operands.map((operand, index) =>
          operand.previous
            ? null
            : items(operand.key, operand.reference, { ...inner, position: positionIn(quantity, index) }, `${slot}-${index}`),
        )
      : [];
    const worst: Verdict | undefined =
      foldable && !isOpen && own.worst !== undefined && verdictWeight(own.worst) > verdictWeight(own.verdict ?? "ok")
        ? own.worst
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
    /* An interim closes the lines above it only where its chain is in view; the
       folded head of a chain that is an operand has nothing above to close. */
    const kind = isResult ? "result" : quantity.interim && !reference && place.flat ? "interim" : undefined;

    const line = (
      <div
        className={styles.line}
        style={{ "--depth": place.depth } as CSSProperties}
        data-inner={place.depth > 0 ? "" : undefined}
        data-kind={kind}
        data-foldable={foldable ? "" : undefined}
        data-reference={reference ? "" : undefined}
        data-emphasis={reference ? undefined : quantity.emphasis}
        data-rule={!reference && quantity.rule ? "" : undefined}
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
            metrics
              ? metricsSentence(quantity.label, readings.map((reading) => reading.text), metrics, wording, place.position)
              : text.sentence,
            readings.some((reading) => reading.own.approximate) && wording.calculationApproximateNote,
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
          {derived && !statement && !isOpen ? text.names : undefined}
        </span>
        <span className={styles.operator} aria-hidden="true">
          {operator}
        </span>
        {figures(readings, kind !== undefined)}
        <span className={styles.assessment} aria-hidden="true">
          {metrics ? (
            /* Short: which metric. The sentence carries the full reason. */
            metrics.map(
              (metric, i) =>
                readings[i]!.own.absence && <Badge key={metric.id}>{wording.calculationMissing(metric.unit ?? metric.label)}</Badge>,
            )
          ) : text.reason !== undefined ? (
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
        ...beside,
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
                /* Only where its own quantity is meant: as an operand's, the
                   band would jump from the row to the end of its derivation. */
                data-mark={marked === key ? "use" : undefined}
              >
                <span className={styles.labelCell}>
                  <span className={styles.disclosure} />
                  <span className={styles.label}>= {quantity.label}</span>
                </span>
                <span className={styles.names} />
                <span className={styles.operator} />
                {figures(readings, true)}
              </div>
            </li>
          </ul>
        )}
      </li>,
    ];
  };

  const statement = items(model.result, false, { depth: 0, flat: true, parent: null }, "r");

  return (
    /* The frame is the surface and the container the layout measures itself
       against; the list inside it is the statement. */
    <div
      ref={frameRef}
      className={cx(styles.frame, className)}
      style={
        metrics
          ? ({
              "--figure-tracks": Array(count * 2).fill("auto").join(" "),
              "--figures-end": amountLine(count),
              "--assessment-column": amountLine(count),
              ...style,
            } as CSSProperties)
          : style
      }
      data-still={folds ? undefined : ""}
      data-metrics={metrics ? count : undefined}
      data-two-lines={twoLines ? "" : undefined}
    >
      <ul className={styles.calculation} {...rest}>
        {metrics && (
          /* The head names each metric and its unit above its column. Every
             row's sentence names them too, so the head is for the eye. */
          <li className={styles.item} aria-hidden="true">
            <div className={styles.head}>
              {metrics.map((metric, i) => (
                <span
                  key={metric.id}
                  className={styles.headCell}
                  data-unit={metric.unit === undefined ? undefined : ""}
                  style={{ "--column": amountLine(i) } as CSSProperties}
                >
                  <span className={styles.headLabel}>{metric.label}</span>
                  {metric.unit !== undefined && <span className={styles.headUnit}>{metric.unit}</span>}
                </span>
              ))}
            </div>
          </li>
        )}
        {statement}
      </ul>
    </div>
  );
}
