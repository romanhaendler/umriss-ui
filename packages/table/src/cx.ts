/* Joins class names. Our own two lines instead of an export from
   @umriss-ui/core: a surface does not grow wider for a one-liner. */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");
