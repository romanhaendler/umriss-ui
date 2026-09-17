/* The gate of this demo: `pnpm --filter @umriss-ui/schedule props`. The gate
   itself stands in `@umriss-ui/demo`; a prop without JSDoc that lands in a table
   on some page breaks `dev`, `build:demo` and `typecheck`. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateProps } from "@umriss-ui/demo/tooling/props";
import { OUTLINE } from "./outline.ts";

generateProps({ packageName: join(dirname(fileURLToPath(import.meta.url)), ".."), outline: OUTLINE });
