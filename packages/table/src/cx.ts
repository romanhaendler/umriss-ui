/* Joins class names. Our own two lines instead of an export from
   @umriss-ui/core: a surface does not grow wider for a one-liner
   (umriss-table 04). */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");
