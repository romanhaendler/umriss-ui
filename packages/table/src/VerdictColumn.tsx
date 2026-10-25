/* The verdict column: a numeric value and a limit set, read
   with `assess` from @umriss-ui/core.

   It is built with nothing a caller of @umriss-ui/table would not have as well:
   a `Column` from the hook, `assess`, `verdictWeight`, the formats and the
   wording; it imports only @umriss-ui/core and React.

   - Sorting is by the weight of the verdict (ascending ok, unknown, warning,
     alarm), so the worst stands at one end; `sortBy="value"` sorts by the
     value instead. With equal weight the existing order stays (stable sort).
   - The export carries the value, not the verdict, which is a function of
     value and limit set.
   - An unknown verdict is a verdict (glossary: Verdict), not an absent value:
     the column's value is never absent - it is the pair of measured value and
     assessment - and `children` is called for `null` and `NaN` as well. */

import { VisuallyHidden, assess, verdictWeight, useFormats, useWording, writeNumber } from "@umriss-ui/core";
import type { Assessment, LimitSet, NumberFormat, Verdict, Wording } from "@umriss-ui/core";
import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import styles from "./VerdictColumn.module.css";

interface Reading {
  measured: number | null;
  assessment: Assessment;
}

export interface VerdictColumnProps {
  id?: string;
  value: string | ((row: never) => number | null | undefined);
  label: string;
  limits: LimitSet;
  format?: NumberFormat;
  sortBy?: "verdict" | "value";
  width?: number;
  resizable?: boolean;
  pin?: "start" | "end";
  aggregate?: "worst";
}

const verdictWord = (verdict: Verdict, wording: Wording): string =>
  verdict === "alarm"
    ? wording.verdictAlarm
    : verdict === "warning"
      ? wording.verdictWarning
      : verdict === "unknown"
        ? wording.verdictUnknown
        : wording.verdictOk;

/* The shape carries the verdict even without colour: a tick, a question mark, a
   triangle, a square - four outlines that differ in greyscale. */
const GLYPHS: Record<Verdict, string> = {
  ok: "✓",
  unknown: "?",
  warning: "▲",
  alarm: "■",
};

function VerdictCell({ reading, format }: { reading: Reading; format: NumberFormat | undefined }) {
  const formats = useFormats();
  const wording = useWording();
  const { measured, assessment } = reading;
  const word = verdictWord(assessment.verdict, wording);
  return (
    <span className={styles.verdict} data-verdict={assessment.verdict} title={word}>
      <span aria-hidden="true" className={styles.glyph}>
        {GLYPHS[assessment.verdict]}
      </span>
      <span className={styles.value}>{measured === null ? wording.statAbsentValue : writeNumber(formats, measured, format)}</span>
      {assessment.excess !== undefined && (
        <span className={styles.excess}>+{writeNumber(formats, assessment.excess, format)}</span>
      )}
      <VisuallyHidden>{word}</VisuallyHidden>
    </span>
  );
}

/** Builds the verdict column on top of a hook's `Column`. */
const onlyTheValue = (reading: Reading) => reading.measured;

/* The worst verdict among the readings; with equal weight the first. */
const worst = (readings: readonly Reading[]): Reading | undefined =>
  readings.reduce<Reading | undefined>(
    (found, r) => (!found || verdictWeight(r.assessment.verdict) > verdictWeight(found.assessment.verdict) ? r : found),
    undefined,
  );

export function buildVerdictColumn(
  Column: (props: {
    /* If the id is missing on a computed value, `Column` reports that in
       development - the types at the call site require it anyway. */
    id: string | undefined;
    label: string;
    value: (row: never) => Reading;
    numeric: boolean;
    width?: number;
    resizable?: boolean;
    pin?: "start" | "end";
    sortValue: (reading: Reading) => number | null;
    exportValue: (reading: Reading) => number | null;
    children: (reading: Reading) => ReactNode;
    aggregate?: (readings: readonly Reading[]) => Reading | undefined;
  }) => ReactNode,
) {
  return function VerdictColumn({ id, value, label, limits, format, sortBy = "verdict", width, resizable, pin, aggregate }: VerdictColumnProps) {
    /* The functions stay stable as long as field, limits and sort kind are:
       a new value function on every render would make the table recalculate
       its model every time. The limits are compared as text, because a set
       usually stands as a literal at the call site. */
    const limitsKey = JSON.stringify(limits);
    const read = useMemo(() => {
      const set = JSON.parse(limitsKey) as LimitSet;
      return (row: never): Reading => {
        const raw =
          typeof value === "string"
            ? ((row as Record<string, unknown> | null)?.[value] as number | null | undefined)
            : value(row);
        return {
          measured: typeof raw === "number" && Number.isFinite(raw) ? raw : null,
          assessment: assess(raw, set),
        };
      };
    }, [value, limitsKey]);
    const sortValueOf = useCallback(
      (reading: Reading) => (sortBy === "value" ? reading.measured : verdictWeight(reading.assessment.verdict)),
      [sortBy],
    );
    return (
      <Column
        id={id ?? (typeof value === "string" ? value : undefined)}
        label={label}
        numeric
        width={width}
        resizable={resizable}
        pin={pin}
        value={read}
        sortValue={sortValueOf}
        exportValue={onlyTheValue}
        aggregate={aggregate === "worst" ? worst : undefined}
      >
        {(reading) => <VerdictCell reading={reading} format={format} />}
      </Column>
    );
  };
}
