/* What is photographed and checked – derived, not enumerated.

   The pages from the outline, the examples from the files under
   `demo/examples/`: the same two sources the demo is made of. A new example is
   a new picture, without anything being added here. The scenarios page stands first:
   the shell is not the unchecked part. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exampleAddresses, scenarioIds } from "@umriss-ui/demo/checks/pages";
import type { ExampleAddress } from "@umriss-ui/demo/checks/pages";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "demo", "examples");

/** The scenarios on the front page, in their order. */
export const SCENARIO_IDS: readonly string[] = scenarioIds(join(dirname(fileURLToPath(import.meta.url)), "..", "demo", "scenarios"));

/** The addresses of every page, the scenarios page first. */
export const PAGES = ["scenarios", ...ALL_PAGES.map((s) => s.id)] as const;

export type { ExampleAddress };

/** The examples that are not photographed, each with the rule that excuses it. */
const NOT_PHOTOGRAPHED: Readonly<Record<string, string>> = {
  benchmark: "the benchmark measures, and a measurement is not a picture.",
};

export const EXAMPLE_ADDRESSES: readonly ExampleAddress[] = exampleAddresses(EXAMPLES_DIR).filter(
  (e) => NOT_PHOTOGRAPHED[e.exampleId] === undefined,
);

/** A sample for the accessibility check (table-demo, Testing Decisions): the
    scenarios page, every page that was once part of the two long pages `Table`
    and `Column` (the demo's features, table-demo-features), the filters with
    their panels, the row actions with their menu and the column menu with its
    dialog. */
export const SAMPLE = [
  "scenarios",
  "first-table",
  "provider",
  "column",
  "formats",
  "width-and-pinning",
  "presets",
  "sorting",
  "pre-filter",
  "selection",
  "row-appearance",
  "view",
  "virtualisation",
  "server-mode",
  "grid-mode",
  "edits",
  "filter",
  "rowactions",
  "columnmenu",
] as const;
