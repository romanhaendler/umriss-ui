/* The gate: generates a demo's `demo/.generated/props.json` and stops at a
   prop without JSDoc, at an export of the entry or a subpath without one
   (`exportDocs.ts`), and at an internal reference in a reader's text - a
   requirement number, a source path, an ADR number no file answers
   (`references.ts`).

   What is generated is not checked in - `demo/.generated/` is ignored. A
   checked-in generation drifts away from its source, and this whole mechanism
   is built against exactly that.

   What has to be documented is said by the outline and by no second list: a
   prop is public when it stands in a table on some page. That is why
   `Kalender` and `BereichsTrigger` stay undocumented in @umriss-ui/core - they
   are internals of the pickers and have no page.

   It is called by each demo's own `demo/props.ts`, which passes in its package
   directory and its outline. Run:
   `pnpm --filter @umriss-ui/core props`, `pnpm --filter @umriss-ui/table props`;
   `prebuild:demo` does it before every build of the demo, `predev` before
   every start. */

import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import type { Rubric } from "../outline.ts";
import { readProps } from "./propsReader.ts";
import type { PropEntry, Reading, TypeEntry } from "./propsReader.ts";
import { undocumentedExports } from "./exportDocs.ts";
import { adrLinksOf, internalReferences, linkAdrs, pageTexts, type AdrLinks } from "./references.ts";

/** Every `.ts`/`.tsx` under a directory, sorted.

    Sorted so that two runs yield the same file: the order the file system
    reads in is not a promise. */
export function sourceFiles(root: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) found.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name)) found.push(path);
  }
  return found.sort();
}

/** The types that land in a table - in the order of the pages. */
export function requiredTypes(outline: readonly Rubric[]): string[] {
  return outline.flatMap((rubric) => rubric.pages.flatMap((page) => [...page.types]));
}

/** The repository's ADRs by number, read from `docs/adr/` as it stands. */
export function adrLinks(): Record<string, string> {
  return adrLinksOf(readdirSync(fileURLToPath(new URL("../../../../docs/adr/", import.meta.url))));
}

/** An internal reference in an outline's texts, with its line in the
    outline's source. */
export interface OutlineFlag {
  line: number;
  /** The rubric's or the page's id. */
  where: string;
  found: readonly string[];
}

/** The outline's texts that carry an internal reference. The line is found by
    the text as the source writes it, else by what was found in it. */
export function outlineFlags(outline: readonly Rubric[], source: string, links: AdrLinks): OutlineFlag[] {
  const flags: OutlineFlag[] = [];
  const note = (where: string) => (text: string) => {
    const found = internalReferences(text, links);
    if (found.length > 0) {
      const at = [JSON.stringify(text).slice(1, -1), ...found].map((needle) => source.indexOf(needle)).find((i) => i >= 0) ?? 0;
      flags.push({ line: source.slice(0, at).split("\n").length, where, found });
    }
    return text;
  };
  for (const rubric of outline) {
    note(rubric.id)(rubric.sentence);
    for (const page of rubric.pages) pageTexts(page, note(page.id));
  }
  return flags;
}

/** The tables with every ADR number in their rows' texts as a link - what
    both writers show. */
export function linkedTables(types: Readonly<Record<string, TypeEntry>>, links: AdrLinks): Record<string, TypeEntry> {
  const link = (text: string) => linkAdrs(text, links);
  const linked = (prop: PropEntry): PropEntry => ({
    ...prop,
    description: link(prop.description),
    ...(prop.deprecated === undefined ? {} : { deprecated: link(prop.deprecated) }),
    ...(prop.defaultIsPhrase === true ? { defaultValue: link(prop.defaultValue!) } : {}),
  });
  return Object.fromEntries(
    Object.entries(types).map(([name, entry]) => [
      name,
      {
        ...entry,
        props: entry.props.map(linked),
        ...(entry.definition === undefined ? {} : { definition: { ...entry.definition, description: link(entry.definition.description) } }),
      },
    ]),
  );
}

/** The package's own compiler options, from its `tsconfig.json` - the paths
    to its neighbours' source above all, so that a type from core reads as it
    is written and not as `any` from a dist that was never built. Empty where
    the package has none. */
export function compilerOptionsOf(packageDir: string): ts.CompilerOptions {
  const configPath = join(packageDir, "tsconfig.json");
  if (!existsSync(configPath)) return {};
  return ts.getParsedCommandLineOfConfigFile(configPath, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} })?.options ?? {};
}

/** A package's tables and the definitions they need, read as `generateProps`
    reads them; `check` as for `readProps`. */
export function readPackage(packageDir: string, outline: readonly Rubric[], check?: (text: string) => readonly string[]): Reading {
  return readProps(sourceFiles(join(packageDir, "src")), requiredTypes(outline), check, compilerOptionsOf(packageDir));
}

export interface PropsJob {
  /** The package's directory; `src/` is read, `demo/.generated/` written. */
  packageName: string;
  outline: readonly Rubric[];
}

/** Writes the tables and hands them back, for the text that is generated
    from them next (`llms.ts`). Beside them `adrs.json`: the links the shell
    gives the ADR numbers in the outline's texts. */
export function generateProps({ packageName, outline }: PropsJob): Record<string, TypeEntry> {
  const target = join(packageName, "demo", ".generated", "props.json");
  const links = adrLinks();
  const { types: types, gaps: gaps, flags } = readPackage(packageName, outline, (text) => internalReferences(text, links));
  const outlineFile = join(packageName, "demo", "outline.ts");
  /* The outline is handed in; its file only tells the lines. */
  const pageFlags = outlineFlags(outline, existsSync(outlineFile) ? readFileSync(outlineFile, "utf8") : "", links);

  const bareExports = undocumentedExports(packageName);
  if (gaps.length > 0 || bareExports.length > 0 || flags.length > 0 || pageFlags.length > 0) {
    /* All of them, not the first: finding a hundred and fifty missing
       comments in a hundred and fifty runs is not a workflow. */
    if (gaps.length > 0) {
      const lines = gaps.map(
        (l) => `  ${relative(packageName, l.file)}:${l.line}  ${l.type}.${l.prop}`,
      );
      process.stderr.write(
        `${gaps.length} prop${gaps.length === 1 ? "" : "s"} without JSDoc:\n${lines.join("\n")}\n` +
          `\nEvery prop that lands in a table explains itself.\n`,
      );
    }
    if (bareExports.length > 0) {
      const lines = bareExports.map((e) => `  ${relative(packageName, e.file)}:${e.line}  ${e.name}`);
      process.stderr.write(
        `${bareExports.length} export${bareExports.length === 1 ? "" : "s"} without JSDoc:\n${lines.join("\n")}\n` +
          `\nEvery export of the entry and its subpaths says what it is for.\n`,
      );
    }
    if (flags.length > 0 || pageFlags.length > 0) {
      const lines = [
        ...flags.map((f) => `  ${relative(packageName, f.file)}:${f.line}  ${f.type}.${f.prop}: ${f.found.join(", ")}`),
        ...pageFlags.map((f) => `  ${relative(packageName, outlineFile)}:${f.line}  ${f.where}: ${f.found.join(", ")}`),
      ];
      process.stderr.write(
        `${lines.length} text${lines.length === 1 ? "" : "s"} with an internal reference:\n${lines.join("\n")}\n` +
          `\nA reader is sent nowhere they cannot go: a requirement number goes into \`@remarks\`, a source path becomes a link to its page, an ADR number needs its file in docs/adr.\n`,
      );
    }
    process.exit(1);
  }

  mkdirSync(dirname(target), { recursive: true });
  /* A fixed indent and a closing newline: two runs yield the same file, byte
     for byte. */
  const output: Record<string, TypeEntry> = linkedTables(types, links);
  writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  writeFileSync(join(dirname(target), "adrs.json"), `${JSON.stringify(links, null, 2)}\n`, "utf8");
  process.stdout.write(`props.json: ${Object.keys(output).length} types.\n`);
  return output;
}
