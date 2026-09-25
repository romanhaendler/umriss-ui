/* What is photographed and checked – derived, not counted.

   The two sources are the same ones the demo itself is made of: the outline
   names the pages, the files under `demo/examples/` name the examples. A third
   list here would drift apart at some point – a new example would be rendered
   but not photographed, and the difference would only show up when somebody
   counts.

   The directory is read and not the demo's module: `examples.ts` hangs on
   `import.meta.glob`, and that does not exist in Playwright's Node process. Two
   ways to the same files – but only ONE opinion about what they are called:
   that stands in `fileName.ts`, and both fetch it from there.

   The scenarios page stands first: it is itself a page, so that the shell is not the
   only unchecked part of the demo. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exampleAddresses, scenarioIds } from "@umriss-ui/demo/checks/pages";
import type { ExampleAddress } from "@umriss-ui/demo/checks/pages";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "demo", "examples");

/** The scenarios on the front page, in their order. */
export const SCENARIO_IDS: readonly string[] = scenarioIds(join(dirname(fileURLToPath(import.meta.url)), "..", "demo", "scenarios"));

/** The addresses of all pages, the scenarios page first. */
export const PAGES = ["scenarios", ...ALL_PAGES.map((p) => p.id)] as const;

export type { ExampleAddress };

export const EXAMPLE_ADDRESSES: readonly ExampleAddress[] = exampleAddresses(EXAMPLES_DIR);

/** A sample for the accessibility check.

    Every page in both themes would mean two axe runs per page; that is minutes
    for an answer that rarely differs between two pages of the same sort. What
    is taken is therefore, per rubric, the one that carries the most
    interaction, plus the scenarios page. */
export const SAMPLE = [
  "scenarios",
  "button",
  "alert",
  "card",
  "input",
  "formfield",
  "multiselect",
  "daterangepicker",
  "tabs",
  "modal",
  "commandpalette",
  "treeview",
  "dock",
  "stat",
  /* The six foundations, each with its page (core-foundations). */
  "switch",
  "slider",
  "drawer",
  "progressbar",
  "accordion",
  "breadcrumb",
  /* The layout tier after them, each with its page (core-layout-extras). */
  "splitter",
  "stepper",
  "fileinput",
  /* Every package on one page (control-room-demo). */
  "control-room",
] as const;
