/* A demo, as the shell receives it.

   The shell is the same for all five packages (ADR-0020); what makes a demo a
   particular one comes in here: the outline, the scenarios, the examples, the
   generated tables and the package name a reader takes the package under.

   `import.meta.glob` resolves relative to the file that calls it. The globs
   therefore stand in the demo itself (`demo/examples.ts`), and only what they
   found arrives here. */

import type { Addresses } from "./outline";
import { readExamples, readScenarios } from "./tooling/examples";
import type { Example, ExampleModule, Scenario, ScenarioModule } from "./tooling/examples";
import type { TypeEntry } from "./tooling/propsReader";

export interface Demo {
  /** The package name a reader takes the package under: `"@umriss-ui/core"`. */
  packageName: string;
  addresses: Addresses;
  scenarios: readonly Scenario[];
  examples: readonly Example[];
  /** The generated props tables (`demo/.generated/props.json`). */
  tables: Readonly<Record<string, TypeEntry>>;
  /** Whether the API tables list the `on…` props in a table of their own. */
  eventsApart: boolean;
}

export interface DemoSources {
  packageName: string;
  addresses: Addresses;
  /** `import.meta.glob("./scenarios/*.tsx", { eager: true })` */
  scenarios: Record<string, ScenarioModule>;
  /** `import.meta.glob("./examples/*\/*.tsx", { eager: true })` */
  examples: Record<string, ExampleModule>;
  /** Both globs again with `query: "?raw", import: "default"`. */
  sources: Record<string, string>;
  /** The source of the files an example may show BESIDE itself - a raw glob
      over whatever a demo allows to be named in `shows`. Left out where no
      example shows anything. */
  beside?: Record<string, string>;
  /** `import.meta.glob("../../demo/src/worlds/*.ts", { query: "?raw", … })`:
      the worlds an example or scenario imports, shown beside it. */
  worlds?: Record<string, string>;
  /** The generated `props.json`. */
  props: unknown;
  /** The events in a table of their own - for the table and the schedule,
      whose callbacks are a subject apart. */
  eventsApart?: boolean;
}

export function buildDemo(sources: DemoSources): Demo {
  const options = {
    pages: sources.addresses.ALL_PAGES,
    packageName: sources.packageName,
    beside: sources.beside,
    worlds: sources.worlds,
  };
  return {
    packageName: sources.packageName,
    addresses: sources.addresses,
    scenarios: readScenarios(sources.scenarios, sources.sources, options),
    examples: readExamples(sources.examples, sources.sources, options),
    /* The JSON file is generated; its literal type says nothing the
       generating type does not say better. */
    tables: sources.props as Record<string, TypeEntry>,
    eventsApart: sources.eventsApart ?? false,
  };
}
