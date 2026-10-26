/* What the pickers say of the formats' time zone: its name once in the
   panel's foot (and in the trigger's description), and, in development, a
   warning, where a zone is named, for a day value that is not on its midnight. */

import { useEffect, useId } from "react";
import { warnOnce } from "../../lib/dev";
import { useFormats, useTimeZoneLabel } from "../../lib/language";
import styles from "./DatePicker.module.css";
import { onMidnight } from "./zoned";

/** The zone's name, where the reader's zone is another; nothing otherwise. */
export function ZoneNote() {
  const label = useTimeZoneLabel();
  return label === null ? null : <span className={styles.footNote}>{label}</span>;
}

/** Warns once per picker, in development, that a day value is not the instant
    of the zone's midnight. */
export function useMidnightWarning(values: readonly (Date | null | undefined)[]) {
  const id = useId();
  const { timeZone } = useFormats();
  const off = timeZone !== undefined && values.some((v) => v && !onMidnight(v, timeZone));
  useEffect(() => {
    if (!off) return;
    warnOnce(
      `midnight:${id}`,
      `a date picker's value is a day: the instant of midnight in the formats' zone (${timeZone}). This value is not on that midnight.`,
    );
  }, [off, id, timeZone]);
}
