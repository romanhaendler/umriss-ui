/* A demo, as the shell receives it.

   The shell is the same for all four packages (ADR-0020); what makes a demo a
   particular one comes in here: the outline, the examples, the
   generated tables, the "Warum so" texts and the package name a reader takes
   the package under.

   `import.meta.glob` resolves relative to the file that calls it. The globs
   therefore stand in the demo itself (`demo/examples.ts`), and only what they
   found arrives here. */

import { createElement } from "react";
import type { ComponentType, ReactNode } from "react";
import type { Addresses } from "./outline";
import { readExamples } from "./tooling/examples";
import type { Example, ExampleModule } from "./tooling/examples";
import type { TypeEntry } from "./tooling/propsReader";

export interface Demo {
  /** The package name a reader takes the package under: `"@umriss-ui/core"`. */
  packageName: string;
  addresses: Addresses;
  examples: readonly Example[];
  /** The generated props tables (`demo/.generated/props.json`). */
  tables: Readonly<Record<string, TypeEntry>>;
  /** "Warum so" per page, where there is one. */
  why: ReadonlyMap<string, ReactNode>;
}

export interface DemoSources {
  packageName: string;
  addresses: Addresses;
  /** `import.meta.glob("./examples/*\/*.tsx", { eager: true })` */
  examples: Record<string, ExampleModule>;
  /** The same glob with `query: "?raw", import: "default"`. */
  sources: Record<string, string>;
  /** The source of the files an example may show BESIDE itself - a raw glob
      over whatever a demo allows to be named in `shows`. Left out where no
      example shows anything. */
  beside?: Record<string, string>;
  /** `import.meta.glob("./warum/*.tsx", { eager: true })` */
  why: Record<string, { default?: unknown }>;
  /** The generated `props.json`. */
  props: unknown;
}

const WHY_NAME = /\/why\/([^/]+)\.tsx$/;

/* "Warum so" - where there is one.

   The section appears where there really was a decision to explain, and
   otherwise not at all. A section that is always there carries no information
   any more. So no list here either: a file `warum/<page>.tsx` either exists or
   it does not.

   Finished elements and not components: a component fetched from a map only at
   render time is, to React, indistinguishable from one created afresh on every
   pass. */
function readWhy(module: Record<string, { default?: unknown }>): ReadonlyMap<string, ReactNode> {
  const why = new Map<string, ReactNode>();
  for (const [path, mod] of Object.entries(module)) {
    const match = WHY_NAME.exec(path);
    if (match === null) continue;
    if (typeof mod.default !== "function") {
      throw new Error(`\`${path}\` has no default export that could be rendered.`);
    }
    why.set(match[1]!, createElement(mod.default as ComponentType));
  }
  return why;
}

export function buildDemo(sources: DemoSources): Demo {
  return {
    packageName: sources.packageName,
    addresses: sources.addresses,
    examples: readExamples(sources.examples, sources.sources, {
      pages: sources.addresses.ALL_PAGES,
      packageName: sources.packageName,
      beside: sources.beside,
    }),
    /* The JSON file is generated; its literal type says nothing the
       generating type does not say better. */
    tables: sources.props as Record<string, TypeEntry>,
    why: readWhy(sources.why),
  };
}
