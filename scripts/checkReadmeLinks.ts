/* The README a package ships must not link to a file npm does not ship.

   A relative link is resolved from the package directory. It is dead on npm
   and in `node_modules` unless it names a file the manifest's `files` ships,
   or one npm always adds (README, LICENSE, package.json). Absolute URLs,
   mailto links and same-page anchors are not read. Fenced code is skipped.

   Run from a package directory: `node --experimental-strip-types
   ../../scripts/checkReadmeLinks.ts` - `check:site` does it for every package. */

import { readFileSync } from "node:fs";
import { posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ALWAYS_SHIPPED = ["README.md", "LICENSE", "package.json"];

const INLINE = /\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
const DEFINITION = /^ {0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s|$)/;

/** The relative link targets of a README that the shipped files do not hold. */
export function deadLinks(readme: string, files: readonly string[]): string[] {
  const shipped = [...ALWAYS_SHIPPED, ...files].map((path) => posix.normalize(path).replace(/\/$/, ""));
  const dead: string[] = [];
  let fenced = false;
  for (const line of readme.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const targets = [...line.matchAll(INLINE)].map((m) => m[1] as string);
    const definition = DEFINITION.exec(line);
    if (definition) targets.push(definition[1] as string);
    for (const target of targets) {
      if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) continue;
      const file = target.split("#")[0] as string;
      const path = posix.normalize(file);
      const isShipped = shipped.some((ship) => path === ship || path.startsWith(`${ship}/`));
      if (!isShipped && !dead.includes(file)) dead.push(file);
    }
  }
  return dead;
}

function run(): void {
  const readme = readFileSync("README.md", "utf8");
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as { files?: string[] };
  const dead = deadLinks(readme, manifest.files ?? []);
  if (dead.length === 0) return;
  console.error(`README.md links to files the package does not ship: ${dead.join(", ")}`);
  console.error("Point them at https://github.com/romanhaendler/umriss-ui (branch main) instead.");
  process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) run();
