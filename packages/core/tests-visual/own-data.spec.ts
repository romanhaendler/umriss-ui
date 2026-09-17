/* Every example runs as it is copied: it imports the package and npm, and
   whatever else it needs it SHOWS beside itself. The check stands with the
   shell (`@umriss-ui/demo/checks/ownData.ts`). */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkOwnData } from "@umriss-ui/demo/checks/ownData";

checkOwnData({ examplesDir: join(dirname(fileURLToPath(import.meta.url)), "..", "demo", "examples") });
