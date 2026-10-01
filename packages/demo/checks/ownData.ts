/* An example runs as it is copied (schedule-lane-groups 04).

   The promise a demo makes is that the code shown is the code that ran. A demo
   keeps half of it by showing the file it rendered; the other half is that a
   reader can paste the file and see the thing. An example that imports a
   fixture from two directories up breaks that half silently: the reader copies
   thirty lines that cannot compile, and nothing in the demo says so.

   So an example - and a scenario, whose code is shown the same way - may
   import from exactly two places:

   1. **The package's own source** - `../../../src` (`../../src` from a
      scenario) and its subpaths, which the code view rewrites to the package
      name a reader would install.
   2. **npm** - a bare specifier: `react`, `@umriss-ui/core`, and any subpath of
      one. A reader has those or can get them.

   Anything relative that is not the package is a fixture, and a fixture is
   what this check exists to catch. `@umriss-ui/demo` is one too, bare as it
   looks: it is never published, so its worlds cannot be imported - an example
   playing in a world carries the part of it it uses, written out in the file.

   It stands once and runs against every demo, as the shell's and the page's
   checks do: their `own-data.spec.ts` calls `checkOwnData` with their
   directory. It needs no browser - it reads the files - but it lives with the
   other checks because it is the same kind of promise about the same files. */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { EXAMPLE_PATTERN } from "../src/tooling/fileName";

export interface OwnDataProbes {
  /** The demo's `examples/` directory. */
  examplesDir: string;
}

/** Every import specifier in a source file - `from "…"` and a bare
    `import "…"`, in either quote. Type-only imports count: a type from a
    fixture is a dependency on the fixture. */
const IMPORT = /(?:\bfrom|^[ \t]*import)\s*(["'])([^"']+)\1/gm;

function specifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT)].map((match) => match[2]!);
}

/** Whether a specifier is one an example may have. */
function allowed(specifier: string): boolean {
  /* The demo shell: private, so no reader can install it. */
  if (specifier === "@umriss-ui/demo" || specifier.startsWith("@umriss-ui/demo/")) return false;
  /* npm: anything that is not a path at all. */
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) return true;
  /* The package's own source, and its subpaths. */
  return /^(\.\.\/)+src(\/|$)/.test(specifier);
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

/** Every scenario of a demo, as `scenarios/<file>` - beside `examples/`. */
function scenarioFiles(examplesDir: string): { name: string; path: string }[] {
  const dir = join(examplesDir, "..", "scenarios");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".tsx"))
    .sort()
    .map((file) => ({ name: `scenarios/${file}`, path: join(dir, file) }));
}

export function checkOwnData({ examplesDir }: OwnDataProbes): void {
  test("every example and scenario imports the package and npm, and nothing else", () => {
    const examples = exampleFiles(examplesDir);
    /* A directory that reads empty would let this check pass without having
       checked anything - the one failure a check must never have. */
    expect(examples.length).toBeGreaterThan(0);
    const files = [...examples, ...scenarioFiles(examplesDir)];

    const offenders: string[] = [];
    for (const { name, path } of files) {
      const source = readFileSync(path, "utf8");
      for (const specifier of specifiersOf(source)) {
        if (allowed(specifier)) continue;
        offenders.push(`${name} › ${specifier}`);
      }
    }

    /* Named, so that the file to repair can be found from the output - and
       repaired by giving the example its own data, in the file. */
    expect(offenders).toEqual([]);
  });
}
