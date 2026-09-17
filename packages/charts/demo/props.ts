/* The gate of this demo: `pnpm --filter @umriss-ui/charts props`.

   The gate itself stands in `@umriss-ui/demo`; what comes in here is only what
   makes this demo the one it is - its package and its outline. A prop without
   JSDoc that lands in a table on some page breaks `dev`, `build:demo` and
   `typecheck`.

   What has to be documented is said by the outline and by no second list: a
   prop is public when it stands in a table on some page. The `*Config`
   interfaces behind the components are registration shapes the chart passes
   among its own parts; they reach no table and need no comments. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateProps } from "@umriss-ui/demo/tooling/props";
import { OUTLINE } from "./outline.ts";

generateProps({ packageName: join(dirname(fileURLToPath(import.meta.url)), ".."), outline: OUTLINE });
