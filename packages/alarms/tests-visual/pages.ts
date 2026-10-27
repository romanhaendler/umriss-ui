/* What is photographed and checked – derived, not enumerated: the pages from
   the outline, the examples from the files under `demo/examples/`. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exampleAddresses } from "@umriss-ui/demo/checks/pages";
import type { ExampleAddress } from "@umriss-ui/demo/checks/pages";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "demo", "examples");

/** The addresses of every page. */
export const PAGES = ALL_PAGES.map((s) => s.id);

export type { ExampleAddress };

export const EXAMPLE_ADDRESSES: readonly ExampleAddress[] = exampleAddresses(EXAMPLES_DIR);

/** A sample for the accessibility check: every page. */
export const SAMPLE = PAGES;
