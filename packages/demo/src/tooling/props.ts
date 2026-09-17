/* The gate: generates a demo's `demo/.generated/props.json` and stops at a
   prop without JSDoc.

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

import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import type { Rubric } from "../outline.ts";
import { readProps } from "./propsReader.ts";
import type { TypeEntry } from "./propsReader.ts";

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

export interface PropsJob {
  /** The package's directory; `src/` is read, `demo/.generated/` written. */
  packageName: string;
  outline: readonly Rubric[];
}

export function generateProps({ packageName, outline }: PropsJob): void {
  const target = join(packageName, "demo", ".generated", "props.json");
  const { types: types, gaps: gaps } = readProps(
    sourceFiles(join(packageName, "src")),
    requiredTypes(outline),
  );

  if (gaps.length > 0) {
    /* All of them, not the first: finding a hundred and fifty missing
       comments in a hundred and fifty runs is not a workflow. */
    const lines = gaps.map(
      (l) => `  ${relative(packageName, l.file)}:${l.line}  ${l.type}.${l.prop}`,
    );
    process.stderr.write(
      `${gaps.length} prop${gaps.length === 1 ? "" : "s"} without JSDoc:\n${lines.join("\n")}\n` +
        `\nEvery prop that lands in a table explains itself.\n`,
    );
    process.exit(1);
  }

  mkdirSync(dirname(target), { recursive: true });
  /* A fixed indent and a closing newline: two runs yield the same file, byte
     for byte. */
  const output: Record<string, TypeEntry> = types;
  writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  process.stdout.write(`props.json: ${Object.keys(output).length} types.\n`);
}
