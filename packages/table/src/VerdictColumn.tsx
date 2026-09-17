/* The verdict column (umriss-table 12): a numeric value and a limit set, read
   with `assess` from @umriss-ui/core.

   It is built with NOTHING a caller of @umriss-ui/table would not have as well:
   a `Column` from the hook, `assess`, `verdictWeight`, the formats and the
   wording. Therein lies its second purpose - it proves that the plant layer
   needs nothing private. That is why this file imports only @umriss-ui/core and
   React.

   Decided:

   - **Sorting is by the weight of the verdict** (ascending ok, unknown,
     warning, alarm), and `sortBy="value"` sorts by the value instead. By
     weight the worst stands at one end - one more click, and it stands on top;
     by value an alarm below a lower limit would stand among the small values,
     far away from the alarm above the upper one. With equal weight the
     existing order stays, because the sort is stable. By weight AND value in
     one level would mean pressing two numbers into one sort value - over a
     range of values nobody knows.
   - **The export carries the value, not the verdict.** The verdict is a
     function of value and limit set; whoever needs it in the spreadsheet has
     the set. A second field per column would need a second header row that
     nobody ordered.
   - **An unknown verdict is a verdict**, not an absent value (glossary:
     Verdict). The column's value is therefore never absent - it is the pair of
     measured value and assessment - and `children` is called for `null` and
     `NaN` as well. */

import { VisuallyHidden, assess, verdictWeight, useFormats, useWording } from "@umriss-ui/core";
import type { Assessment, Formats, LimitSet, Verdict, Wording } from "@umriss-ui/core";
import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import styles from "./VerdictColumn.module.css";

interface Reading {
  measured: number | null;
  assessment: Assessment;
}

type NumberFormat = "percent" | "count" | { decimals: number };

export interface VerdictColumnProps {
  id?: string;
  value: string | ((row: never) => number | null | undefined);
  label: string;
  limits: LimitSet;
  format?: NumberFormat;
  sortBy?: "verdict" | "value";
  width?: number;
  resizable?: boolean;
}

const write = (number: number, format: NumberFormat | undefined, formats: Formats): string =>
  format === "percent"
    ? formats.percent(number)
    : format === "count"
      ? formats.count(number)
      : formats.number(number, typeof format === "object" ? format.decimals : undefined);

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
      <span className={styles.value}>{measured === null ? wording.statAbsentValue : write(measured, format, formats)}</span>
      {assessment.excess !== undefined && (
        <span className={styles.excess}>+{write(assessment.excess, format, formats)}</span>
      )}
      <VisuallyHidden>{word}</VisuallyHidden>
    </span>
  );
}

/** Builds the verdict column on top of a hook's `Column`. */
const onlyTheValue = (reading: Reading) => reading.measured;

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
    sortValue: (reading: Reading) => number | null;
    exportValue: (reading: Reading) => number | null;
    children: (reading: Reading) => ReactNode;
  }) => ReactNode,
) {
  return function VerdictColumn({ id, value, label, limits, format, sortBy = "verdict", width, resizable }: VerdictColumnProps) {
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
        value={read}
        sortValue={sortValueOf}
        exportValue={onlyTheValue}
      >
        {(reading) => <VerdictCell reading={reading} format={format} />}
      </Column>
    );
  };
}
