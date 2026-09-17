/* An example runs as it is copied (schedule-lane-groups 04).

   The promise a demo makes is that the code shown is the code that ran. A demo
   keeps half of it by showing the file it rendered; the other half is that a
   reader can paste the file and see the thing. An example that imports a
   fixture from two directories up breaks that half silently: the reader copies
   thirty lines that cannot compile, and nothing in the demo says so.

   So an example may import from exactly two places:

   1. **The package's own source** - `../../../src` and its subpaths, which the
      code view rewrites to the package name a reader would install.
   2. **npm** - a bare specifier: `react`, `@umriss-ui/core`, and any subpath of
      one. A reader has those or can get them.

   Anything relative that is not the package is a fixture, and a fixture is
   what this check exists to catch.

   The one exception is named by the example itself. `export const shows = [...]`
   puts a file beside the example as a further tab of the code view, so a reader
   sees it and can copy it too. It exists for the case that cannot be otherwise -
   a demonstration built on a whole plant - and it is an exception precisely
   because it is declared, at the example, in the file that depends on it.

   It stands once and runs against every demo, as the shell's and the page's
   checks do: their `own-data.spec.ts` calls `checkOwnData` with their
   directory. It needs no browser - it reads the files - but it lives with the
   other checks because it is the same kind of promise about the same files. */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { EXAMPLE_PATTERN } from "../src/tooling/fileName";
import { LIBRARY_PATH } from "../src/tooling/source";

export interface OwnDataProbes {
  /** The demo's `examples/` directory. */
  examplesDir: string;
}

/** Every import specifier in a source file - `from "…"` and a bare
    `import "…"`, in either quote. Type-only imports count: a type from a
    fixture is a dependency on the fixture. */
const IMPORT = /(?:\bfrom|^[ \t]*import)\s*(["'])([^"']+)\1/gm;

/** The `shows` export, as the file writes it - read from the text and not from
    the module, because this check never runs the example. */
const SHOWS = /^export const shows\s*=\s*\[([^\]]*)\]/m;
const STRING = /(["'])([^"']+)\1/g;

function specifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT)].map((match) => match[2]!);
}

function showsOf(source: string): string[] {
  const block = SHOWS.exec(source);
  return block === null ? [] : [...block[1]!.matchAll(STRING)].map((match) => match[2]!);
}

/** Whether a specifier is one an example may have. */
function allowed(specifier: string, shows: readonly string[]): boolean {
  /* npm: anything that is not a path at all. */
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) return true;
  /* The package's own source, and its subpaths. */
  if (specifier === LIBRARY_PATH || specifier.startsWith(`${LIBRARY_PATH}/`)) return true;
  /* A file the example shows beside itself, with or without its extension -
     an import writes `../../data`, the `shows` entry names `../../data.ts`. */
  return shows.some((shown) => shown === specifier || shown.replace(/\.tsx?$/, "") === specifier);
}

/** Every example file of a demo, as `<folder>/<file>`. */
function exampleFiles(examplesDir: string): { name: string; path: string }[] {
  const found: { name: string; path: string }[] = [];
  for (const folder of readdirSync(examplesDir, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    for (const file of readdirSync(join(examplesDir, folder.name))) {
      const path = join(examplesDir, folder.name, file);
      if (EXAMPLE_PATTERN.test(`/examples/${folder.name}/${file}`)) found.push({ name: `${folder.name}/${file}`, path });
    }
  }
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

export function checkOwnData({ examplesDir }: OwnDataProbes): void {
  test("every example imports the package and npm, and nothing else", () => {
    const files = exampleFiles(examplesDir);
    /* A directory that reads empty would let this check pass without having
       checked anything - the one failure a check must never have. */
    expect(files.length).toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const { name, path } of files) {
      const source = readFileSync(path, "utf8");
      const shows = showsOf(source);
      for (const specifier of specifiersOf(source)) {
        if (allowed(specifier, shows)) continue;
        offenders.push(`${name} › ${specifier}`);
      }
    }

    /* Named, so that the file to repair can be found from the output - and
       repaired by giving the example its own few lines of data, or by having it
       SHOW the file it needs. */
    expect(offenders).toEqual([]);
  });
}
