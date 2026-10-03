/* The page that installs and a first example, checked against this demo. The
   tests stand with the shell (`@umriss-ui/demo/checks/page.ts`). */

import { checkFirstExample, checkInstall } from "@umriss-ui/demo/checks/page";
import { ALL_PAGES, open } from "./navigation";

checkInstall({ open, pages: ALL_PAGES, command: "npm install @umriss-ui/calculation @umriss-ui/core" });

checkFirstExample({ open, pageId: "installation", title: "The availability of a service" });
