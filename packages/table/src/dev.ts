/* Warnings in development, silent in a production build.

   Development mode by the rule in `@umriss-ui/core`'s `lib/dev.ts`. A warning
   appears once per reason - a table renders often, and nobody reads a console
   full of repetitions. */

declare const process: { env: Record<string, string | undefined> };

function detectDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

export const DEV: boolean = detectDev();

const warned = new Set<string>();

export function warnOnce(reason: string, message: string): void {
  if (!DEV || warned.has(reason)) return;
  warned.add(reason);
  console.warn(`@umriss-ui/table: ${message}`);
}

const NO_ROWS: readonly never[] = [];

/** Rows as umriss reads them: an array, or none. `undefined` and `null` are rows still loading and say nothing;
    anything else that is not an array warns once per `place`, naming what arrived. */
export function asRows<Z>(value: readonly Z[] | null | undefined, place: string): readonly Z[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return NO_ROWS;
  if (DEV) {
    const typed = ArrayBuffer.isView(value) ? (value as object).constructor.name : null;
    const arrived = typed ?? (typeof value === "object" ? `an object with the keys ${Object.keys(value).slice(0, 3).join(", ")}` : `a ${typeof value}`);
    warnOnce(
      `rows:${place}:${arrived}`,
      `${place} got ${arrived}, which is not an array; it is read as no rows. umriss reads one object per row - \`Array.from\` makes rows of an Arrow table or a typed array.`,
    );
  }
  return NO_ROWS;
}
