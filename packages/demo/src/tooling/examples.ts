/* The examples - out of the files, out of nothing else.

   There is no written list of examples and no place where a new one would be
   registered. `import.meta.glob` reads a demo's directory (`demo/examples.ts`
   there), the number in the file name orders the run, and the rest of the name
   is the anchor. A new example is a new file and nothing else.

   That is the same rule the outline sets up for the pages, applied one level
   further down: two lists that mean the same thing drift apart.

   The folder is named like the page, only in the component's spelling:
   `Button` -> `#/button`, `Stack-and-Grid` -> `#/stack-and-grid`. One rule -
   lower-cased, the folder name is the address - and a folder belonging to no
   page is noticed at load time instead of vanishing quietly.

   Two globs over the same files: one fetches the running component, one the
   source. So the code shown is the code that ran.

   Both are `eager`, so every example lands in the demo's bundle. That is the
   price of the file being the list, and it is fine for a demo. Should the
   bundle ever become a problem, the answer is a lazy import of the components
   with the source still eager - not a hand-kept list. */

import type { ComponentType } from "react";
import type { Page } from "../outline";
import { byRank, parseFileName } from "./fileName";
import { displaySource } from "./source";

export interface Example {
  /** The page it stands on - the id from the outline. */
  pageId: string;
  /** The anchor: the name part after the number. */
  id: string;
  /** What it is called - from the file's `title` export. */
  title: string;
  /** The number in the file name; it orders the run and nothing else. */
  rank: number;
  /** What is rendered. */
  Component: ComponentType;
  /** What stands in the code block: the file, without its title, with the package name. */
  source: string;
  /** A demonstration stands last and is labelled as such. */
  demonstration: boolean;
}

export interface ExampleModule {
  default?: unknown;
  title?: unknown;
}

export function readExamples(
  module: Record<string, ExampleModule>,
  sources: Record<string, string>,
  { pages, packageName }: { pages: readonly Page[]; packageName: string },
): readonly Example[] {
  const found: Example[] = [];

  for (const [path, mod] of Object.entries(module)) {
    const { pageId, rank, id, demonstration } = parseFileName(path);
    if (!pages.some((s) => s.id === pageId)) {
      throw new Error(`\`${path}\` is in a folder for which there is no page \`${pageId}\`.`);
    }

    const title = mod.title;
    if (typeof title !== "string" || title === "") {
      throw new Error(`\`${path}\` exports no \`title\` – without one the example has no name.`);
    }
    const Component = mod.default;
    if (typeof Component !== "function") {
      throw new Error(`\`${path}\` has no default export that could be rendered.`);
    }

    const raw = sources[path];
    if (typeof raw !== "string") {
      throw new Error(`\`${path}\` has no source text.`);
    }

    found.push({
      pageId,
      id,
      title,
      rank,
      Component: Component as ComponentType,
      source: displaySource(raw, packageName),
      demonstration,
    });
  }

  return found.sort(byRank);
}

/** A page's examples, in their order - the demonstration last.

    It stands at the end because it is the summary and not the way in: whoever
    saw it first would read six hundred lines before having seen thirty. */
export function examplesOf(examples: readonly Example[], pageId: string): readonly Example[] {
  return examples
    .filter((b) => b.pageId === pageId)
    .sort((a, b) => Number(a.demonstration) - Number(b.demonstration));
}
