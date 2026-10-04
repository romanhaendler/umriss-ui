/* A value named as a field or given as a function (ADR-0048).

   The scene compares functions by their source text (scene.ts, `fnEqual`), and
   every field reader reads the same text. So a field name comes to one reader
   per name, held for good, and a reader is compared by identity - which is to
   say by its name. */

const readers = new Map<string, (d: unknown) => unknown>();
const fieldReaders = new WeakSet<object>();

/** The function a value comes to: a field name's reader, or the function as
    it was given. */
export function readerOf<F>(value: string | F): F;
export function readerOf<F>(value: string | F | undefined): F | undefined;
export function readerOf<F>(value: string | F | undefined): F | undefined {
  if (typeof value !== "string") return value;
  let reader = readers.get(value);
  if (reader === undefined) {
    reader = (d) => (d as Record<string, unknown>)[value];
    readers.set(value, reader);
    fieldReaders.add(reader);
  }
  return reader as F;
}

/** Was this function made from a field name? */
export const isFieldReader = (fn: unknown): boolean => typeof fn === "function" && fieldReaders.has(fn);
