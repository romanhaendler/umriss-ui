/* Development mode: `process.env.NODE_ENV` is not "production". The expression
   is written literally so that a bundler replaces it (Vite does in a dev
   server, webpack and Next in a build) and Node and Jest read it as it is. Where
   neither happens there is no `process`, the read throws, and the answer is
   production. In production the invariants are silent. */

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
