/* The exports without JSDoc - the gate's second class beside the props
   (.scratch/api-index, ADR-0044).

   What counts as an export is what the package builds: the entries its
   `vite.config.ts` hands to `build.lib.entry`, the main one and every subpath
   (`wording/de`). No second list of entries, so a new subpath is checked the
   day it is built. An export counts as explained when one of its declarations
   carries a JSDoc comment; a plain block comment for maintainers does not. */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

/** An export without JSDoc, where it is declared. */
export interface UndocumentedExport {
  /** The name a caller imports. */
  name: string;
  file: string;
  line: number;
}

/** The source files `vite.config.ts` builds as library entries.

    ponytail: read as text, not run - a config that computes its entries
    instead of naming them as string literals has to be run here instead. */
export function entriesOf(packageDir: string): string[] {
  const config = readFileSync(join(packageDir, "vite.config.ts"), "utf8");
  const entry = /\bentry:\s*("[^"]*"|\{[^}]*\})/.exec(config)?.[1];
  const files = [...(entry ?? "").matchAll(/"([^"]+\.tsx?)"/g)].map((match) => join(packageDir, match[1]!));
  if (files.length === 0) throw new Error(`\`${join(packageDir, "vite.config.ts")}\` names no library entry the gate can read.`);
  return files;
}

/** Every export of the package's entries without JSDoc, in the order the
    entries name them, re-exports followed to their declaration. */
export function undocumentedExports(packageDir: string): UndocumentedExport[] {
  const entries = entriesOf(packageDir);
  const program = ts.createProgram(entries, {
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    allowImportingTsExtensions: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  return entries.flatMap((entry) => {
    const module = checker.getSymbolAtLocation(program.getSourceFile(entry)!);
    if (module === undefined) throw new Error(`\`${entry}\` is not a module the compiler can read.`);
    return checker.getExportsOfModule(module).flatMap((exported) => {
      const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const declarations = target.declarations ?? [];
      if (declarations.some((one) => ts.getJSDocCommentsAndTags(one).some((doc) => ts.isJSDoc(doc)))) return [];
      const first = declarations[0];
      if (first === undefined) return [{ name: exported.name, file: entry, line: 1 }];
      const file = first.getSourceFile();
      return [{ name: exported.name, file: file.fileName, line: file.getLineAndCharacterOfPosition(first.getStart()).line + 1 }];
    });
  });
}
