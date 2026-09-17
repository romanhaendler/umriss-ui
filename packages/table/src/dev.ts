/* Warnings in development, silent in a production build.

   As in @umriss-ui/charts: `import.meta.env.DEV` where a bundler sets it,
   otherwise NODE_ENV. A warning appears once per reason - a table renders
   often, and nobody reads a console full of repetitions. */

interface MetaEnv {
  env?: { DEV?: boolean };
}

declare const process: { env?: Record<string, string | undefined> } | undefined;

function detectDev(): boolean {
  const meta = import.meta as unknown as MetaEnv;
  if (typeof meta.env?.DEV === "boolean") return meta.env.DEV;
  if (typeof process !== "undefined" && process?.env) return process.env.NODE_ENV !== "production";
  return false;
}

export const DEV: boolean = detectDev();

const warned = new Set<string>();

export function warnOnce(reason: string, message: string): void {
  if (!DEV || warned.has(reason)) return;
  warned.add(reason);
  console.warn(`@umriss-ui/table: ${message}`);
}
