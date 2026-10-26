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

const differs = (a: unknown, b: unknown): boolean => {
  if (a instanceof Date && b instanceof Date) return !Object.is(a.getTime(), b.getTime());
  const plain = (v: unknown) => (typeof v !== "object" || v === null) && typeof v !== "function";
  return plain(a) && plain(b) && !Object.is(a, b);
};

/** DEV: an accessor held because its source text equals the new one's is stale when it reads a value from
    outside its row that has changed. Calls both on the first 1,000 rows and warns once per `who` on the
    first difference; primitives compare by `Object.is`, Dates by time, anything else is not compared.
    `arg` turns a row into what the accessor takes (a sort or group function takes the column's value).
    Never changes which function is held. */
export function probeStale(who: string, held: unknown, next: unknown, rows: readonly unknown[], arg?: (row: unknown) => unknown): void {
  const key = `stale:${who}`;
  if (!DEV || held === next || warned.has(key) || typeof held !== "function" || typeof next !== "function") return;
  const way = who === "The rowKey" ? "Carry the value in the rows." : "Carry the value in the rows, or give the column a `key` that changes with it.";
  try {
    for (let i = 0; i < Math.min(rows.length, 1000); i++) {
      const input = arg ? arg(rows[i]) : rows[i];
      if (!differs(held(input, i), next(input, i))) continue;
      warnOnce(
        key,
        `${who}: its function reads a value from outside the row, and that value has changed - ` +
          `a function with the same source text is kept, so the old figures stay. ${way}`,
      );
      return;
    }
  } catch {
    // An accessor that throws on a row is the caller's to find; the probe says nothing.
  }
}
