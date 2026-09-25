/* What gets photographed - derived, not counted.

   A demo's examples come from the files under its `demo/examples/`, the same
   ones the demo itself is made of. A list kept in the suite would drift apart
   eventually - a new example would be rendered but not photographed.

   The directory is read rather than the demo's module: `examples.ts` hangs on
   `import.meta.glob`, and that does not exist in Playwright's Node process. Two
   ways to the same files - but only ONE opinion about what they are called:
   that one lives in `fileName.ts`, and both take it from there. */

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { byRank, parseFileName, parseScenarioName } from "../src/tooling/fileName.ts";

export interface ExampleAddress {
  pageId: string;
  exampleId: string;
  /** The name of the image file - unique across pages. */
  name: string;
}

export function exampleAddresses(folder: string): ExampleAddress[] {
  const found = readdirSync(folder, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((sub) =>
      readdirSync(join(folder, sub.name))
        .filter((file) => file.endsWith(".tsx"))
        .map((file) => parseFileName(`/examples/${sub.name}/${file}`)),
    );
  return found
    .sort((a, b) => a.pageId.localeCompare(b.pageId) || byRank(a, b))
    .map((b) => ({ pageId: b.pageId, exampleId: b.id, name: `${b.pageId}--${b.id}` }));
}

/** The first example of every page - the simplest, the component at rest.
    What each demo photographs a second time under forced colours
    (forced-colors 02, 03): every example twice over would double the suite
    for pictures that differ only where a forced-colours rule stands, and
    those states get pictures of their own. */
export function firstExamples(addresses: readonly ExampleAddress[]): ExampleAddress[] {
  const seen = new Set<string>();
  return addresses.filter((address) => !seen.has(address.pageId) && seen.add(address.pageId));
}

/** The scenarios' anchors, in their order - from `demo/scenarios/`, which a
    demo without scenarios does not have yet. */
export function scenarioIds(folder: string): string[] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => parseScenarioName(`/scenarios/${file}`))
    .sort(byRank)
    .map((one) => one.id);
}
