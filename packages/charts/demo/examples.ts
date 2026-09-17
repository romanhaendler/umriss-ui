/* This demo, as the shell receives it.

   The globs stand here and not in the shell: `import.meta.glob` resolves
   relative to the file that calls it, and the directory belongs to this demo.
   What they find goes unchanged to `@umriss-ui/demo`.

   The title export is `title`, the same word the other two demos' examples use;
   the shell accepts that one spelling and no other. */

import { buildDemo } from "@umriss-ui/demo";
import props from "./.generated/props.json";
import { ADDRESSES } from "./outline";

export const DEMO = buildDemo({
  packageName: "@umriss-ui/charts",
  addresses: ADDRESSES,
  examples: import.meta.glob<{ default?: unknown; title?: unknown; shows?: unknown }>("./examples/*/*.tsx", { eager: true }),
  sources: import.meta.glob<string>("./examples/*/*.tsx", { eager: true, query: "?raw", import: "default" }),
  /* What an example may name in `shows`: the demo's own files beside the
     examples. Every example here draws one course out of `data.ts`, and shows
     it as a second tab so that what stands there can be copied and run. */
  beside: import.meta.glob<string>("./*.ts", { eager: true, query: "?raw", import: "default" }),
  why: import.meta.glob<{ default?: unknown }>("./why/*.tsx", { eager: true }),
  props,
});
