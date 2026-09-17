/* This demo's gate: `pnpm --filter @umriss-ui/core props`.

   The gate itself stands in `@umriss-ui/demo`; what comes in here is only what
   makes this demo this one - its package and its outline.

   The `outline` key is the shell's field name. What is still German behind it
   is `propsReader.ts`'s own field names, which english-and-umriss-ui 05 recorded
   as its one open deviation. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateProps } from "@umriss-ui/demo/tooling/props";
import { OUTLINE } from "./outline.ts";

generateProps({ packageName: join(dirname(fileURLToPath(import.meta.url)), ".."), outline: OUTLINE });
