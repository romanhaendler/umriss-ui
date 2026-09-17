/* The gate of this demo: `pnpm --filter @umriss-ui/table props`.

   The gate itself stands in `@umriss-ui/demo`; what comes in here is only what
   makes this demo the one it is - its package and its outline. A prop without
   JSDoc that lands in a table on some page breaks `dev`, `build:demo` and
   `typecheck`.

   `outline` is the field name of `PropsJob` in `@umriss-ui/demo`, which the demo
   of @umriss-ui/core passes as well; the two move together. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateProps } from "@umriss-ui/demo/tooling/props";
import { OUTLINE } from "./outline.ts";

generateProps({ packageName: join(dirname(fileURLToPath(import.meta.url)), ".."), outline: OUTLINE });
