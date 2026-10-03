/* A demo, as the shell receives it.

   The shell is the same for all five packages (ADR-0020); what makes a demo a
   particular one comes in here: the outline, the scenarios, the examples, the
   generated tables and the manifest: the package name a reader takes the
   package under, and the peers its install command names.

   `import.meta.glob` resolves relative to the file that calls it. The globs
   therefore stand in the demo itself (`demo/examples.ts`), and only what they
   found arrives here. */

import { addresses, type Addresses } from "./outline";
import { linkAdrs, outlineTexts, type AdrLinks } from "./tooling/references";
import { installCommand, type InstallManifest } from "./tooling/install";
import type { TitleManifest } from "./tooling/title";
import { readExamples, readScenarios } from "./tooling/examples";
import type { Example, ExampleModule, Scenario, ScenarioModule } from "./tooling/examples";
import type { TypeEntry } from "./tooling/propsReader";
import type { ReferenceTable } from "./tooling/referenceTable";

export interface Demo {
  /** The package name a reader takes the package under: `"@umriss-ui/core"`. */
  packageName: string;
  /** What the package is, as its manifest says: the scenarios page's title
      (`tooling/title.ts`). */
  description: string;
  /** The command that installs it, peers and all (`tooling/install.ts`). */
  install: string;
  addresses: Addresses;
  scenarios: readonly Scenario[];
  examples: readonly Example[];
  /** The generated props tables (`demo/.generated/props.json`). */
  tables: Readonly<Record<string, TypeEntry>>;
  /** The reference tables a page carries after its examples, by page id
      (`demo/.generated/references.json`). */
  references: Readonly<Record<string, readonly ReferenceTable[]>>;
}

export interface DemoSources {
  /** The package's `package.json`. */
  manifest: InstallManifest & TitleManifest;
  addresses: Addresses;
  /** `import.meta.glob("./scenarios/*.tsx", { eager: true })` */
  scenarios: Record<string, ScenarioModule>;
  /** `import.meta.glob("./examples/*\/*.tsx", { eager: true })` */
  examples: Record<string, ExampleModule>;
  /** Both globs again with `query: "?raw", import: "default"`. */
  sources: Record<string, string>;
  /** The generated `props.json`. */
  props: unknown;
  /** The generated `adrs.json`: the link of every ADR number a text names. */
  adrs: AdrLinks;
  /** The generated `references.json`, where the demo has one. */
  references?: unknown;
}

export function buildDemo(sources: DemoSources): Demo {
  const options = {
    pages: sources.addresses.ALL_PAGES,
    packageName: sources.manifest.name,
  };
  /* The texts' ADR numbers become links here, once, as the generator links
     them in the llms text and the tables (`tooling/references.ts`). */
  const link = (text: string) => linkAdrs(text, sources.adrs);
  return {
    packageName: sources.manifest.name,
    description: sources.manifest.description,
    install: installCommand(sources.manifest),
    addresses: addresses(outlineTexts(sources.addresses.OUTLINE, link), sources.addresses.MOVED),
    scenarios: readScenarios(sources.scenarios, sources.sources, options).map((scenario) => ({
      ...scenario,
      lead: link(scenario.lead),
      callouts: scenario.callouts.map(link),
    })),
    examples: readExamples(sources.examples, sources.sources, options).map((example) =>
      example.lead === undefined ? example : { ...example, lead: link(example.lead) },
    ),
    /* The JSON file is generated; its literal type says nothing the
       generating type does not say better. */
    tables: sources.props as Record<string, TypeEntry>,
    references: (sources.references ?? {}) as Record<string, readonly ReferenceTable[]>,
  };
}
