/* <Stat> – the tile that reads its own value (judging-values 05).

   The name is deliberately not `Metric`: this package already exports `Meter`,
   and two exported names one letter apart, both about numbers, both in the
   same import line, are a defect waiting for a tired reader.

   No `tone` prop. The whole point of the tile is that the rule has been pulled
   away from the call site; a tone prop would push it back, and would look like
   flexibility while doing it.

   No trend arrow. A direction taken from two points of a noisy signal is noise
   with an arrowhead, and it gets read as information. Whoever wants the shape
   passes the history and gets the history line, which shows what actually
   happened. Where a target is given, the deviation from it is shown – a fact
   instead of a guess.

   Assessment and freshness are TWO axes. A stale value keeps its verdict
   (ADR-0010); it does not turn into `unknown`, because then a lost
   connection would take away exactly what a person needs at that moment: the
   last picture they had. */

import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { assess, type LimitSet, type Verdict } from "../../lib/limit";
import { useFreshness } from "../../lib/useFreshness";
import type { FreshnessAges } from "../../lib/freshness";
import { useFormats, useWording } from "../../lib/language";
import type { Formats, Wording } from "../../lib/language";
import { Sparkline } from "../DataViz";
import styles from "./Stat.module.css";

export interface StatProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** What is being measured. */
  label: string;
  /** The measured value. Absent or non-finite gives the verdict `unknown` –
      and the tile says so, instead of showing a zero or an empty bar. */
  value: number | null | undefined;
  /** The unit as it stands behind the value – „°C", „%", „Stk". */
  unit?: string;
  /** Fixed number of decimal places. Without it the notation decides; a metric
      whose number of digits jumps reads as a jump in the value. */
  decimals?: number;
  /** The rule the value is read against. Without it the tile is neutral – the
      honest display of a number for which nobody has named a rule. */
  limits?: LimitSet;
  /** Values in chronological order; yields the history line. */
  history?: readonly number[];
  /** When the value was true – not when it was fetched. */
  asOf?: Date | number | null;
  /** Without ages there is no freshness display and no cadence. */
  ages?: FreshnessAges;
}

function verdictWord(verdict: Verdict, wording: Wording): string {
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

function deviationWord(
  deviation: number | undefined,
  decimals: number | undefined,
  formats: Formats,
  wording: Wording,
): string | null {
  if (deviation === undefined) return null;
  const amount = formats.number(Math.abs(deviation), decimals);
  if (deviation === 0) return wording.deviationOnTarget;
  return deviation > 0 ? wording.deviationAbove(amount) : wording.deviationBelow(amount);
}

/** The freshness line. Its own component, because it owns the cadence: a tile
    without an as-of time must not start a timer. */
function FreshnessLine({
  asOf,
  ages,
}: {
  asOf: Date | number | null;
  ages: FreshnessAges;
}) {
  const formats = useFormats();
  const wording = useWording();
  const reading = useFreshness(asOf, ages);
  const word =
    reading.freshness === "lost"
      ? wording.freshnessDisconnected
      : reading.freshness === "stale"
        ? wording.freshnessStale
        : wording.freshnessFresh;
  const age = reading.age;
  return (
    <span className={styles.asOf} data-freshness={reading.freshness}>
      {word}
      {age !== null && <span className={styles.age}>{formats.relative(age)}</span>}
    </span>
  );
}

/** Metric tile: one value, read against its limits. */
export function Stat({
  label,
  value,
  unit,
  decimals,
  limits,
  history,
  asOf,
  ages,
  className,
  ...rest
}: StatProps) {
  const formats = useFormats();
  const wording = useWording();

  const assessment = assess(value, limits);
  const verdict = assessment.verdict;
  const word = verdictWord(verdict, wording);
  const known = verdict !== "unknown";
  /* Without a limit there is no verdict to reach. Writing „in Ordnung" would
     be a claim nobody has made – the tile stays neutral in that case. An
     absent VALUE is untouched by this: it is unknown whether or not anyone
     has named a rule. */
  const hasRule = (limits?.limits?.length ?? 0) > 0;
  const showsVerdict = hasRule || !known;
  const deviation = deviationWord(assessment.deviation, decimals, formats, wording);

  const display = known
    ? formats.number(value as number, decimals)
    : wording.statAbsentValue;

  // The accessible name carries both: what is being measured and how it
  // stands. Colour alone carries no meaning – here it is stated twice,
  // visibly and in the name.
  const name = `${label}: ${known ? `${display}${unit ? ` ${unit}` : ""}` : word}${
    known && showsVerdict && verdict !== "ok" ? `, ${word}` : ""
  }`;

  return (
    <div
      role="group"
      aria-label={name}
      data-verdict={showsVerdict ? verdict : undefined}
      className={cx(styles.stat, className)}
      {...rest}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.valueRow}>
        <span className={styles.value}>{display}</span>
        {known && unit !== undefined && <span className={styles.unit}>{unit}</span>}
      </span>
      {showsVerdict && (
        <span className={styles.verdict} data-verdict={verdict}>
          {word}
        </span>
      )}
      {deviation !== null && known && (
        <span className={styles.deviation}>{deviation}</span>
      )}
      {history !== undefined && history.length >= 2 && (
        <Sparkline data={history} className={styles.history} aria-hidden="true" />
      )}
      {asOf !== undefined && ages !== undefined && (
        <FreshnessLine asOf={asOf ?? null} ages={ages} />
      )}
    </div>
  );
}
