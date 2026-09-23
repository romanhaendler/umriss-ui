/* What is photographed and checked – derived, not enumerated.

   The pages from the outline, the examples from the files under
   `demo/examples/`: the same two sources the demo is made of. A new example is
   a new picture, without anything being added here. The overview stands first:
   the shell is not the unchecked part. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exampleAddresses } from "@umriss-ui/demo/checks/pages";
import type { ExampleAddress } from "@umriss-ui/demo/checks/pages";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "demo", "examples");

/** The addresses of every page, the overview first. */
export const PAGES = ["overview", ...ALL_PAGES.map((s) => s.id)] as const;

export type { ExampleAddress };

export const EXAMPLE_ADDRESSES: readonly ExampleAddress[] = exampleAddresses(EXAMPLES_DIR);

/** A sample for the accessibility check: every page - there are three. */
export const SAMPLE = PAGES;
