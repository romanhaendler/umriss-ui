/* Development mode by the rule in `@umriss-ui/core`'s `lib/dev.ts`. In production the invariants are silent. */

declare const process: { env: Record<string, string | undefined> };

function detectDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

export const DEV: boolean = detectDev();

/** Throws a comprehensible error in DEV, does nothing in PROD. */
export function invariant(condition: unknown, message: string): void {
  if (DEV && !condition) {
    throw new Error(`@umriss-ui/charts: ${message}`);
  }
}

/** A single DEV console warning per key. */
const warned = new Set<string>();
export function warnOnce(key: string, message: string): void {
  if (!DEV || warned.has(key)) return;
  warned.add(key);
  console.warn(`@umriss-ui/charts: ${message}`);
}

/** The one wording of a renamed name that still works. */
export const warnDeprecated = (old: string, replacement: string): void =>
  warnOnce(`deprecated:${old}`, `${old} is deprecated and goes in the next minor release; use ${replacement}.`);
