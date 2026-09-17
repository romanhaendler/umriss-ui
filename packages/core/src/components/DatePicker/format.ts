/* How this product writes date and time.

   The formats themselves have lain in `lib/language/formats.ts` since the
   formatting seam, together with number, percent and text collation. What
   stands here are only the names under which the pickers know them, so that
   their import paths and the test coverage stay unchanged.

   These pass-throughs carry the default setting, not the application's
   configuration: they are module constants and can read no context. Every
   component now reads `useFormats()` and thereby follows an override; what
   stands here only keeps the old names open - for the calendar module, which
   passes them on, and for the characterisation tests, which deliberately stay
   unchanged. */

import { DEFAULT_FORMATS } from "../../lib/language/formats";

interface Writer {
  format: (d: Date) => string;
}

export const displayFormat: Writer = { format: DEFAULT_FORMATS.date };

export const shortFormat: Writer = { format: DEFAULT_FORMATS.dateShort };

export const monthFormat: Writer = { format: DEFAULT_FORMATS.month };

export const longFormat: Writer = { format: DEFAULT_FORMATS.dateLong };

/* Both variants are built once and not anew on every call - the pickers call
   these functions during rendering. */
const timeWriters: Record<"without" | "with", Writer> = {
  without: { format: (d) => DEFAULT_FORMATS.time(d, false) },
  with: { format: (d) => DEFAULT_FORMATS.time(d, true) },
};

const dateTimeWriters: Record<"without" | "with", Writer> = {
  without: { format: (d) => DEFAULT_FORMATS.dateTime(d, false) },
  with: { format: (d) => DEFAULT_FORMATS.dateTime(d, true) },
};

/** The time format, optionally with seconds. */
export const timeFormat = (withSeconds: boolean): Writer =>
  withSeconds ? timeWriters.with : timeWriters.without;

/** Date and time together, optionally with seconds. */
export const dateTimeFormat = (withSeconds: boolean): Writer =>
  withSeconds ? dateTimeWriters.with : dateTimeWriters.without;
