/* What is photographed and checked - derived, not enumerated.

   The pages from the outline, the examples from the files under
   `demo/examples/`: the same two sources the demo is made of. A new example is
   a new picture, without anything being added here. */

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

export const EXAMPLE_ADDRESSES: readonly ExampleAddress[] = exampleAddresses(EXAMPLES_DIR);

/** A sample for the accessibility check: the scenarios page with its
    context menu, the first schedule, the lanes with their headers in markup,
    the lane groups with the only buttons the schedule puts into the tab
    order, and the findings listed as text. */
export const SAMPLE = ["scenarios", "schedule", "lane", "lane-groups", "findings"] as const;
