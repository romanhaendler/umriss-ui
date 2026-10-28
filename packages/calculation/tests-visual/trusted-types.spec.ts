/* Every page under `require-trusted-types-for 'script'`: an HTML sink in the
   library fails the page. The check stands with the shell
   (`@umriss-ui/demo/checks/trustedTypes.ts`). */

import { checkTrustedTypes } from "@umriss-ui/demo/checks/trustedTypes";
import { open } from "./navigation";
import { PAGES } from "./pages";

checkTrustedTypes({
  open,
  pages: PAGES,
});
