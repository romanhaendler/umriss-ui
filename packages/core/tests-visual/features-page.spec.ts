/* One page, checked against this demo: code toggle, page toggle, copy button.
   The tests stand with the shell (`@umriss-ui/demo/checks/page.ts`). */

import { checkInstall, checkPage } from "@umriss-ui/demo/checks/page";
import { ALL_PAGES, open, openExample } from "./navigation";

checkInstall({ open, pages: ALL_PAGES, command: "npm install @umriss-ui/core" });

checkPage({
  open,
  openExample,
  pageId: "button",
  examples: ["variants", "sizes", "loading-and-disabled"],
  other: { name: "Tag", pageId: "tag" },
  packageName: "@umriss-ui/core",
  importLine: 'import { Button } from "@umriss-ui/core";',
});
