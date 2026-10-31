import type { ReactElement } from "react";
import { zoneFields } from "./zone";

/** A field that has no native control to post its value: its `name`, and how one posted value is written. */
export interface FormPostProps<V> {
  /** Posts the value under this name in a `<form>` (a hidden input), as a native control would; empty posts `""`. */
  name?: string;
  /** Replaces the default text a value is posted as. It is called with each value that is set - for a
      `MultiSelect` once per entry, for a range picker once per end - never for an empty field. */
  formValue?: (value: V) => string;
}

/** Hidden inputs for the entries of a field; none without a name. A disabled field posts nothing, as a native one does. */
export function FormPost({ entries, disabled }: { entries: readonly (readonly [name: string | undefined, text: string])[]; disabled?: boolean }): ReactElement | null {
  const named = entries.filter(([name]) => name !== undefined);
  if (named.length === 0) return null;
  return (
    <>
      {named.map(([name, text], index) => (
        <input key={index} type="hidden" name={name} value={text} disabled={disabled} />
      ))}
    </>
  );
}

/** The form participation of a range picker: two entries, `<name>Start` and `<name>End` unless named. */
export interface FormPostRangeProps extends FormPostProps<Date> {
  /** The name the start is posted under.
      @default `${name}Start` */
  startName?: string;
  /** The name the end is posted under.
      @default `${name}End` */
  endName?: string;
}

/** The two entries of a range: each end as `write` makes it, or `""` for no range. */
export function rangeEntries(
  props: { name?: string; startName?: string; endName?: string; formValue?: (value: Date) => string },
  range: { from: Date; to: Date } | null,
  write: (value: Date) => string,
): [string | undefined, string][] {
  const { name, startName = name === undefined ? undefined : `${name}Start`, endName = name === undefined ? undefined : `${name}End`, formValue } = props;
  return [
    [startName, posted(range?.from, write, formValue)],
    [endName, posted(range?.to, write, formValue)],
  ];
}

const pad = (n: number, width = 2) => String(Math.abs(n)).padStart(width, "0");

/** `YYYY-MM-DD` of the day an instant falls on in the zone (`undefined` is the reader's). */
export function isoDay(instant: Date, timeZone: string | undefined): string {
  const f = zoneFields(instant, timeZone);
  return `${pad(f.year, 4)}-${pad(f.month + 1)}-${pad(f.day)}`;
}

/** `YYYY-MM-DDTHH:mm:ss+01:00`: the zone's wall clock with its offset at that instant. */
export function isoWithOffset(instant: Date, timeZone: string | undefined): string {
  const f = zoneFields(instant, timeZone);
  const wall = Date.UTC(f.year, f.month, f.day, f.hours, f.minutes, f.seconds);
  const minutes = Math.round((wall - Math.floor(instant.getTime() / 1000) * 1000) / 60_000);
  const sign = minutes < 0 ? "-" : "+";
  return `${isoDay(instant, timeZone)}T${pad(f.hours)}:${pad(f.minutes)}:${pad(f.seconds)}${sign}${pad(Math.floor(Math.abs(minutes) / 60))}:${pad(Math.abs(minutes) % 60)}`;
}

/** The text one value is posted as: `""` when empty, else `formValue` or the default `write`. */
export const posted = <V,>(value: V | null | undefined, write: (value: V) => string, formValue?: (value: V) => string): string =>
  value == null ? "" : (formValue ?? write)(value);
