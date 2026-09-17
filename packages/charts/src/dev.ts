/* DEV detection, robust for Vite consumers, Node/SSR and tests.
   In PROD builds the invariants are silent (R-2.3). */

interface MetaEnv {
  env?: { DEV?: boolean };
}

declare const process:
  | { env?: Record<string, string | undefined> }
  | undefined;

function detectDev(): boolean {
  const meta = import.meta as unknown as MetaEnv;
  if (typeof meta.env?.DEV === "boolean") return meta.env.DEV;
  if (typeof process !== "undefined" && process?.env) {
    return process.env.NODE_ENV !== "production";
  }
  return false;
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
