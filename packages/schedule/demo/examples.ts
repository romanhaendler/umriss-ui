/* This demo, as the shell receives it. The globs stand here and not in the
   shell: `import.meta.glob` resolves relative to the file that calls it. */

import { buildDemo } from "@umriss-ui/demo";
import manifest from "../package.json";
import props from "./.generated/props.json";
import { ADDRESSES, EVENTS_APART } from "./outline";

export const DEMO = buildDemo({
  manifest,
  addresses: ADDRESSES,
  scenarios: import.meta.glob<Record<string, unknown>>("./scenarios/*.tsx", { eager: true }),
  examples: import.meta.glob<Record<string, unknown>>("./examples/*/*.tsx", { eager: true }),
  sources: import.meta.glob<string>(["./examples/*/*.tsx", "./scenarios/*.tsx"], { eager: true, query: "?raw", import: "default" }),
  props,
  eventsApart: EVENTS_APART,
});
