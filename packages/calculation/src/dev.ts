/* Warnings in development, silent in a production build.

   Development mode by the rule in `@umriss-ui/core`'s `lib/dev.ts`. A warning
   appears once per reason - a calculation renders often, and nobody reads a console
   full of repetitions. */

import { warnOnce as warnOnceFor } from "@umriss-ui/core";

declare const process: { env: Record<string, string | undefined> };

function detectDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

export const DEV: boolean = detectDev();

const PACKAGE = "@umriss-ui/calculation";

export const warnOnce = (reason: string, message: string): void => warnOnceFor(PACKAGE, reason, message);
