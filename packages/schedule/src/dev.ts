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
  console.warn(`@umriss-ui/schedule: ${message}`);
}

/** The one wording of a renamed name that still works. */
export const warnDeprecated = (old: string, replacement: string): void =>
  warnOnce(`deprecated:${old}`, `${old} is deprecated and goes in the next minor release; use ${replacement}.`);
