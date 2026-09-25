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
   paths relative to the example, one further tab of the code view each. The
   demos' shared data needs no such line: an import of
   `@umriss-ui/demo/worlds/<world>` brings the world's file as a tab by itself,
   and the code view imports it from `./<world>`. Every other example carries
   its own few lines in the file, and a check makes sure of it
   (`@umriss-ui/demo/checks/ownData`).

   A scenario is read the same way from `demo/scenarios/NN-<anchor>.tsx`: a
   composed screen with its job as `title`, who uses it as `lead`, the
   numbered `callouts` and the pages it is `builtFrom`.

   Both are `eager`, so every example lands in the demo's bundle. That is the
   price of the file being the list, and it is fine for a demo. Should the
   bundle ever become a problem, the answer is a lazy import of the components
   with the source still eager - not a hand-kept list. */

import type { ComponentType } from "react";
import type { Page } from "../outline";
import { byRank, parseFileName, parseScenarioName } from "./fileName";
import { asPackage, displaySource, worldsOf } from "./source";

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
  /** The one visible sentence above it: the situation and the prop - from
      the file's `lead` export, where it has one. */
  lead?: string;
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
}

export interface ExampleModule {
  default?: unknown;
  title?: unknown;
  lead?: unknown;
  /** Files beside this one to show, as paths relative to the example. */
  shows?: unknown;
}

/** A page this demo does not have: a component of a neighbouring package,
    linked into that package's demo. */
export interface ForeignPage {
  name: string;
  /** `"@umriss-ui/charts#trend"` - the package and the page's address. */
  page: string;
}

/** A composed screen on the scenarios page. */
export interface Scenario {
  /** The anchor: the name part after the number. */
  id: string;
  rank: number;
  /** The user's job, as its heading. */
  title: string;
  /** Who uses the screen, and for what. */
  lead: string;
  /** What the numbered marks on the screen point at, in their order. The
      screen marks a spot with `data-callout="1"`, and so on. */
  callouts: readonly string[];
  /** The pages it is made of: an id of this demo, or a neighbour's page. */
  builtFrom: readonly (string | ForeignPage)[];
  Component: ComponentType;
  files: readonly ExampleFile[];
}

export interface ScenarioModule extends ExampleModule {
  callouts?: unknown;
  builtFrom?: unknown;
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

interface ReadOptions {
  packageName: string;
  /** The raw glob over what `shows` may name. */
  beside?: Record<string, string>;
  /** The raw glob over `packages/demo/src/worlds/*.ts`. */
  worlds?: Record<string, string>;
}

/** What an example and a scenario have in common: a title, maybe a lead, a
    component, and the tabs of the code view. */
function readModule(
  path: string,
  mod: ExampleModule,
  sources: Record<string, string>,
  { packageName, beside: shown = {}, worlds = {} }: ReadOptions,
): { title: string; lead?: string; Component: ComponentType; files: ExampleFile[] } {
  const title = mod.title;
  if (typeof title !== "string" || title === "") {
    throw new Error(`\`${path}\` exports no \`title\` – without one it has no name.`);
  }
  const lead = mod.lead;
  if (lead !== undefined && (typeof lead !== "string" || lead === "")) {
    throw new Error(`\`${path}\` exports a \`lead\` that is not a sentence.`);
  }
  const Component = mod.default;
  if (typeof Component !== "function") {
    throw new Error(`\`${path}\` has no default export that could be rendered.`);
  }
  const raw = sources[path];
  if (typeof raw !== "string") {
    throw new Error(`\`${path}\` has no source text.`);
  }

  const files: ExampleFile[] = [{ name: tabName(path), source: displaySource(raw, packageName) }];
  for (const relative of readShows(path, mod.shows)) {
    const key = beside(path, relative);
    const text = shown[key];
    if (typeof text !== "string") {
      throw new Error(`\`${path}\` shows \`${relative}\`, which is not among the files the demo reads.`);
    }
    files.push({ name: tabName(key), source: asPackage(text, packageName) });
  }
  for (const world of worldsOf(raw)) {
    const key = Object.keys(worlds).find((one) => tabName(one) === `${world}.ts`);
    if (key === undefined) {
      throw new Error(`\`${path}\` imports the world \`${world}\`, which the demo does not read.`);
    }
    files.push({ name: `${world}.ts`, source: worlds[key]! });
  }
  return { title, ...(typeof lead === "string" ? { lead } : {}), Component: Component as ComponentType, files };
}

export function readExamples(
  module: Record<string, ExampleModule>,
  sources: Record<string, string>,
  { pages, ...options }: ReadOptions & { pages: readonly Page[] },
): readonly Example[] {
  const found: Example[] = [];

  for (const [path, mod] of Object.entries(module)) {
    const { pageId, rank, id } = parseFileName(path);
    if (!pages.some((s) => s.id === pageId)) {
      throw new Error(`\`${path}\` is in a folder for which there is no page \`${pageId}\`.`);
    }
    const { title, lead, Component, files } = readModule(path, mod, sources, options);
    found.push({ pageId, id, title, ...(lead === undefined ? {} : { lead }), rank, Component, source: files[0]!.source, files });
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

/** A page's examples, in their order. */
export function examplesOf(examples: readonly Example[], pageId: string): readonly Example[] {
  return examples.filter((b) => b.pageId === pageId);
}

/** The scenarios, in their order - checked at load time: a callout list that
    is not strings, or a page that does not exist, would otherwise be a dead
    mark or a dead link. */
export function readScenarios(
  module: Record<string, ScenarioModule>,
  sources: Record<string, string>,
  { pages, ...options }: ReadOptions & { pages: readonly Page[] },
): readonly Scenario[] {
  const found: Scenario[] = [];
  for (const [path, mod] of Object.entries(module)) {
    const { rank, id } = parseScenarioName(path);
    const { title, lead, Component, files } = readModule(path, mod, sources, options);
    if (lead === undefined) throw new Error(`\`${path}\` exports no \`lead\` – a scenario says who uses the screen.`);
    const callouts = mod.callouts ?? [];
    if (!Array.isArray(callouts) || callouts.some((one) => typeof one !== "string")) {
      throw new Error(`\`${path}\` exports \`callouts\`, which must be an array of sentences.`);
    }
    const builtFrom = mod.builtFrom;
    if (!Array.isArray(builtFrom) || builtFrom.length === 0) {
      throw new Error(`\`${path}\` exports no \`builtFrom\` – a scenario names the pages it is made of.`);
    }
    for (const one of builtFrom as unknown[]) {
      if (typeof one === "string" ? !pages.some((page) => page.id === one) : !isForeign(one)) {
        throw new Error(`\`${path}\` is built from \`${JSON.stringify(one)}\`, which is no page of this demo and no \`{ name, page }\`.`);
      }
    }
    found.push({ id, rank, title, lead, callouts: callouts as string[], builtFrom: builtFrom as (string | ForeignPage)[], Component, files });
  }
  return found.sort(byRank);
}

function isForeign(value: unknown): value is ForeignPage {
  if (typeof value !== "object" || value === null) return false;
  const { name, page } = value as Record<string, unknown>;
  return typeof name === "string" && typeof page === "string" && /^@[\w-]+\/[\w-]+#[\w-]+$/.test(page);
}
