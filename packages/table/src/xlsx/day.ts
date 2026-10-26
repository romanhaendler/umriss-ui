/* What the CSV and the XLSX writer share about a day: a date at local midnight.
   Stands apart from the table so that the XLSX entry imports it alone. */

/** Whether a date lies at local midnight. */
export const isDay = (d: Date): boolean => d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds() === 0;

/** Whether every date among the values lies at local midnight; other values and
    absent ones do not count. */
export const allDays = (values: Iterable<unknown>): boolean => {
  for (const v of values) if (v instanceof Date && !isDay(v)) return false;
  return true;
};

/** The local day as `YYYY-MM-DD`, from the wall-clock fields. */
export const dayText = (d: Date): string =>
  `${String(d.getFullYear()).padStart(4, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
