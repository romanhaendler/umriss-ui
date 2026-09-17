/* The README's component table against the package's exports.

   The table had lost five components - TreeView, AlarmList, Stat,
   CommandPalette, Popover - and nothing had noticed (library-audit 08). A list
   maintained beside the code runs away from it; that is the same observation
   `props.ts` arose from, and the same place.

   One direction is checked: every exported component stands in the first column
   of a row. A component is an exported VALUE whose name begins upper case and is
   not all upper case - functions and constants (`asCsv`, `DEFAULT_WORDING`) are
   welcome in the table, but not required.

   The heading it searches for is the shipped README's own: `## Components`.
   Ticket 14 translated that heading and this line in one commit - they move
   together, or this check finds no section and reports every component as
   missing.

   Run: `pnpm --filter @umriss-ui/core readme`; `pretypecheck` does it before
   every type check, after `props`. */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE = join(HERE, "..", "..");

/** Exports that begin upper case and still need no row of their own - each with
    its reason. */
export const WITHOUT_ROW: Readonly<Record<string, string>> = {};

/** The names in the first column of the component table. */
export function namesInTheTable(readme: string): Set<string> {
  const start = readme.indexOf("## Components");
  const end = readme.indexOf("\n## ", start + 1);
  const section = readme.slice(start, end === -1 ? undefined : end);
  const names = new Set<string>();
  for (const line of section.split("\n")) {
    if (!line.startsWith("| `")) continue;
    const firstColumn = line.split("|")[1] ?? "";
    for (const [, name] of firstColumn.matchAll(/`([^`]+)`/g)) names.add(name as string);
  }
  return names;
}

/** The exported components of `src/index.ts`, resolved through the compiler -
    `export *` cannot be read with a pattern. */
export function exportedComponents(entry: string): string[] {
  const program = ts.createProgram([entry], {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    allowJs: false,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error(`${entry} is not a module`);
  return checker
    .getExportsOfModule(moduleSymbol)
    .filter((symbol) => {
      const real = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      return (real.flags & ts.SymbolFlags.Value) !== 0;
    })
    .map((symbol) => symbol.name)
    .filter((name) => /^[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name))
    .sort();
}

export function missingRows(readme: string, components: readonly string[]): string[] {
  const inTheTable = namesInTheTable(readme);
  return components.filter((name) => !inTheTable.has(name) && !(name in WITHOUT_ROW));
}

function run(): void {
  const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
  const missing = missingRows(readme, exportedComponents(join(PACKAGE, "src", "index.ts")));
  if (missing.length > 0) {
    process.stderr.write(
      `README.md: ${missing.length} exported component${missing.length === 1 ? "" : "s"} without a row in the table:\n` +
        missing.map((name) => `  ${name}`).join("\n") +
        `\n\nEvery component the package exports stands in the table - or in WITHOUT_ROW, with a reason.\n`,
    );
    process.exit(1);
  }
  process.stdout.write("README.md: every component has a row.\n");
}

const asScript =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (asScript) run();
