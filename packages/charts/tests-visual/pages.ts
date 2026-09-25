/* What is photographed and checked - derived, not enumerated.

   The pages from the outline, the examples from the files under
   `demo/examples/`: the same two sources the demo is made of. A new example is
   a new picture, without anything being added here. The scenarios page stands first:
   the shell is not the unchecked part. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exampleAddresses } from "@umriss-ui/demo/checks/pages";
import type { ExampleAddress } from "@umriss-ui/demo/checks/pages";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "demo", "examples");

/** The addresses of every page, the scenarios page first. */
export const PAGES = ["scenarios", ...ALL_PAGES.map((s) => s.id)] as const;

export type { ExampleAddress };

/** A named exception (CONTEXT.md, **Named exception**), and the only gap in a
    derived list in this repository.

    The benchmark is not photographed: it measures the moment it exists, and a
    picture of it would compare one machine's run against another's. R-5.1 says
    so, and it said so when the list was still kept by hand. An undocumented gap
    in a derived list is exactly what the derivation is meant to prevent - so
    the gap carries the rule that makes it. */
const NOT_PHOTOGRAPHED: Readonly<Record<string, string>> = {
  benchmark: "R-5.1: the benchmark measures, and a measurement is not a picture.",
  "a-week-of-seconds": "R-5.1: it measures the series draw, as the benchmark does.",
};

export const EXAMPLE_ADDRESSES: readonly ExampleAddress[] = exampleAddresses(EXAMPLES_DIR).filter(
  (e) => NOT_PHOTOGRAPHED[e.exampleId] === undefined,
);

/** A sample for the accessibility check: the scenarios page, the page with the
    densest chart, the one with two charts beside each other, the instrument
    with the most text and the page whose examples carry a custom tooltip. */
export const SAMPLE = ["scenarios", "limitline", "matrix", "controlchart", "axis"] as const;
