/* Development mode: `process.env.NODE_ENV` is not "production". The expression
   is written literally so that a bundler replaces it (Vite does in a dev
   server, webpack and Next in a build) and Node and Jest read it as it is. Where
   neither happens there is no `process`, the read throws, and the answer is
   production. */

declare const process: { env: Record<string, string | undefined> };

export function isDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

const warned = new Set<string>();

/** One development console warning per reason; silent in production. */
export function warnOnce(reason: string, message: string): void {
  if (!isDev() || warned.has(reason)) return;
  warned.add(reason);
  console.warn(`@umriss-ui/core: ${message}`);
}

/** The one wording of a renamed name that still works. */
export const warnDeprecated = (old: string, replacement: string): void =>
  warnOnce(`deprecated:${old}`, `${old} is deprecated and goes in the next minor release; use ${replacement}.`);
