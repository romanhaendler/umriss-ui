/* The gate of this demo: `pnpm --filter @umriss-ui/calculation props`. The gate
   itself stands in `@umriss-ui/demo`; a prop without JSDoc that lands in a table
   on some page breaks `dev`, `build:demo` and `typecheck`. */

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
