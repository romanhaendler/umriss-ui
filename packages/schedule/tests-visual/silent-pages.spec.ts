/* Every page against the silent-page rule: a stage that takes Tab needs a
   Keyboard section, one that announces an Accessibility section. The check and
   its exceptions stand with the shell (`@umriss-ui/demo/checks/silentPages.ts`). */

import { checkSilentPages } from "@umriss-ui/demo/checks/silentPages";
import { open } from "./navigation";
import { PAGES } from "./pages";

checkSilentPages({
  open,
  pages: PAGES.filter((pageId) => pageId !== "scenarios"),
});
