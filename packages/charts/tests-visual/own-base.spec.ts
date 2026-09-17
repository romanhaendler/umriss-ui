/* Every example against what a component must carry itself (ADR-0021). The
   checks stand with the shell (`@umriss-ui/demo/checks/ownBase.ts`). */

import { checkOwnBase } from "@umriss-ui/demo/checks/ownBase";
import { open } from "./navigation";
import { PAGES } from "./pages";

checkOwnBase({
  open,
  pages: PAGES.filter((pageId) => pageId !== "overview"),
});
