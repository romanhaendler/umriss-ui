/* The page that installs, checked against this demo. The test stands with the
   shell (`@umriss-ui/demo/checks/page.ts`). */

import { checkInstall } from "@umriss-ui/demo/checks/page";
import { ALL_PAGES, open } from "./navigation";

checkInstall({ open, pages: ALL_PAGES, command: "npm install @umriss-ui/charts" });
