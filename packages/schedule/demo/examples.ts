/* This demo, as the shell receives it. The globs stand here and not in the
   shell: `import.meta.glob` resolves relative to the file that calls it. */

import { buildDemo } from "@umriss-ui/demo";
import props from "./.generated/props.json";
import { ADDRESSES } from "./outline";

export const DEMO = buildDemo({
  packageName: "@umriss-ui/schedule",
  addresses: ADDRESSES,
  scenarios: import.meta.glob<Record<string, unknown>>("./scenarios/*.tsx", { eager: true }),
  examples: import.meta.glob<Record<string, unknown>>("./examples/*/*.tsx", { eager: true }),
  sources: import.meta.glob<string>(["./examples/*/*.tsx", "./scenarios/*.tsx"], { eager: true, query: "?raw", import: "default" }),
  worlds: import.meta.glob<string>("../../demo/src/worlds/*.ts", { eager: true, query: "?raw", import: "default" }),
  /* What an example may name in `shows`: the demo's own files beside the
     examples - here, the plan the scenario is built on. */
  beside: import.meta.glob<string>("./*.ts", { eager: true, query: "?raw", import: "default" }),
  props,
  eventsApart: true,
});
