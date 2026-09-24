/* This demo's gate: `pnpm --filter @umriss-ui/core props`.

   The gate itself stands in `@umriss-ui/demo`; what comes in here is only what
   makes this demo this one - its package and its outline.

   The `outline` key is the shell's field name. What is still German behind it
   is `propsReader.ts`'s own field names, which english-and-umriss-ui 05 recorded
   as its one open deviation. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateLlms } from "@umriss-ui/demo/tooling/llms";
import { generateProps } from "@umriss-ui/demo/tooling/props";
import { OUTLINE } from "./outline.ts";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");
/* The text for coding agents comes from the same tables, right after them:
   `llms.txt` beside the demo, `docs/llms-full.md` into the npm package
   (.scratch/ai-readable-docs). */
generateLlms({ packageDir, outline: OUTLINE, tables: generateProps({ packageName: packageDir, outline: OUTLINE }) });
