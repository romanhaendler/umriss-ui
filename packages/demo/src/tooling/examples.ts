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

   An example may also SHOW a file beside itself - `export const shows = [...]`,
   paths relative to the example, one further tab of the code view each. It is
   the one exception to "an example is one file", and it exists for the one
   case that cannot be otherwise: a demonstration built on a plant of its own,
   whose ninety lines of data a reader would never see and could never copy.
   Every other example carries its own few lines in the file, and a check makes
   sure of it (`@umriss-ui/demo/checks/ownData`).

   Both are `eager`, so every example lands in the demo's bundle. That is the
   price of the file being the list, and it is fine for a demo. Should the
   bundle ever become a problem, the answer is a lazy import of the components
   with the source still eager - not a hand-kept list. */

import type { ComponentType } from "react";
import type { Page } from "../outline";
import { byRank, parseFileName } from "./fileName";
import { asPackage, displaySource } from "./source";

/** One tab of an example's code view. The first is the example itself. */
export interface ExampleFile {
  /** What the tab is called: the file's name, as the example named it. */
  name: string;
  /** What stands in the block - and what Copy takes while it is in front. */
  source: string;
}

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
  /** What stands in the code block: the file, without its title, with the
      package name. */
  source: string;
  /** The code view's tabs: this example first, then whatever it shows beside
      itself. One entry means no tabs are drawn at all. */
  files: readonly ExampleFile[];
  /** A demonstration stands last and is labelled as such. */
  demonstration: boolean;
}

export interface ExampleModule {
  default?: unknown;
  title?: unknown;
  /** Files beside this one to show, as paths relative to the example. */
  shows?: unknown;
}

/** A path relative to an example, resolved against the glob's keys - which are
    relative to the demo's own directory and start with `./`. */
function beside(examplePath: string, relative: string): string {
  const parts = examplePath.split("/").slice(0, -1).concat(relative.split("/"));
  const out: string[] = [];
  for (const part of parts) {
    if (part === "." || part === "") continue;
    if (part === ".." && out.length > 0 && out[out.length - 1] !== "..") out.pop();
    else out.push(part);
  }
  return `./${out.join("/")}`;
}

/** The name a shown file's tab carries: the file's own name. */
function tabName(path: string): string {
  return path.split("/").pop() ?? path;
}

export function readExamples(
  module: Record<string, ExampleModule>,
  sources: Record<string, string>,
  { pages, packageName, beside: shown = {} }: { pages: readonly Page[]; packageName: string; beside?: Record<string, string> },
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

    const source = displaySource(raw, packageName);
    const files: ExampleFile[] = [{ name: tabName(path), source }];
    for (const relative of readShows(path, mod.shows)) {
      const key = beside(path, relative);
      const text = shown[key];
      if (typeof text !== "string") {
        throw new Error(`\`${path}\` shows \`${relative}\`, which is not among the files the demo reads.`);
      }
      files.push({ name: tabName(key), source: asPackage(text, packageName) });
    }

    found.push({
      pageId,
      id,
      title,
      rank,
      Component: Component as ComponentType,
      source,
      files,
      demonstration,
    });
  }

  return found.sort(byRank);
}

/** What an example says it shows beside itself, checked at load time: a typo
    here would otherwise be a tab that quietly never appears. */
function readShows(path: string, shows: unknown): readonly string[] {
  if (shows === undefined) return [];
  if (!Array.isArray(shows) || shows.some((one) => typeof one !== "string")) {
    throw new Error(`\`${path}\` exports \`shows\`, which must be an array of paths relative to the example.`);
  }
  return shows as readonly string[];
}

/** A page's examples, in their order - the demonstration last.

    It stands at the end because it is the summary and not the way in: whoever
    saw it first would read six hundred lines before having seen thirty. */
export function examplesOf(examples: readonly Example[], pageId: string): readonly Example[] {
  return examples
    .filter((b) => b.pageId === pageId)
    .sort((a, b) => Number(a.demonstration) - Number(b.demonstration));
}
