/* The browser suite's ports and the marker a preview server answers with.
   Each package's server is UMRISS_PORT_BASE (default 4173) plus its offset, so
   two checkouts on different bases never meet. A preview sends the checkout's
   path in CHECKOUT_HEADER; whoever would reuse a running server compares it
   with its own. */
import { execFileSync } from "node:child_process";

export const PACKAGES = ["core", "charts", "table", "schedule", "calculation", "dashboard", "alarms"] as const;
export const CHECKOUT_HEADER = "x-umriss-checkout";

export function portOf(pkg: string, env: Record<string, string | undefined> = process.env): number {
  const offset = (PACKAGES as readonly string[]).indexOf(pkg);
  if (offset < 0) throw new Error(`ports: unknown package ${pkg}`);
  const base = env.UMRISS_PORT_BASE === undefined || env.UMRISS_PORT_BASE === "" ? 4173 : Number(env.UMRISS_PORT_BASE);
  if (!Number.isInteger(base) || base < 1024 || base + PACKAGES.length > 65535) {
    throw new Error(`UMRISS_PORT_BASE must be a port from 1024 up, got "${env.UMRISS_PORT_BASE}"`);
  }
  return base + offset;
}

/* Whose server answers on the port: undefined when nothing does, "" when a
   server without the marker does, else the checkout path it names. */
export function servedBy(port: number): string | undefined {
  try {
    const head = execFileSync("curl", ["-sI", "--max-time", "2", `http://localhost:${port}/`], { encoding: "utf8" });
    const line = head.split(/\r?\n/).find((l) => l.toLowerCase().startsWith(`${CHECKOUT_HEADER}:`));
    return line ? line.slice(line.indexOf(":") + 1).trim() : "";
  } catch {
    return undefined;
  }
}

/* Reuse a running server only when it serves `root`; refuse one that serves
   another checkout (or none we know) instead of testing the wrong build. */
export function reusable(port: number, root: string): boolean {
  const by = servedBy(port);
  if (by === undefined) return false;
  if (by === root) return true;
  throw new Error(
    `port ${port} is served by ${by || "a server without a checkout marker"}, this checkout is ${root}; ` +
      `set UMRISS_PORT_BASE to ports of its own`,
  );
}
