/* This demo, as the shell receives it.

   The globs stand here and not in the shell: `import.meta.glob` resolves
   relative to the file that calls it, and the directory belongs to this demo.
   What they find goes unchanged to `@umriss-ui/demo`. */

import { buildDemo } from "@umriss-ui/demo";
import props from "./.generated/props.json";
import { ADDRESSES } from "./outline";

export const DEMO = buildDemo({
  packageName: "@umriss-ui/core",
  addresses: ADDRESSES,
  examples: import.meta.glob<{ default?: unknown; title?: unknown }>("./examples/*/*.tsx", { eager: true }),
  sources: import.meta.glob<string>("./examples/*/*.tsx", { eager: true, query: "?raw", import: "default" }),
  /* What an example may name in `shows`: the control room's plant, the one
     file here an example draws from and shows beside itself. */
  beside: import.meta.glob<string>("./plant.ts", { eager: true, query: "?raw", import: "default" }),
  why: import.meta.glob<{ default?: unknown }>("./why/*.tsx", { eager: true }),
  props,
});
