/* One page, checked against this demo: code toggle, page toggle, copy button.
   The tests stand with the shell (`@umriss-ui/demo/checks/page.ts`). */

import { checkPage } from "@umriss-ui/demo/checks/page";
import { open, openExample } from "./navigation";

checkPage({
  open,
  openExample,
  pageId: "button",
  examples: ["variants", "sizes", "loading-and-disabled"],
  other: { name: "Tag", pageId: "tag" },
  packageName: "@umriss-ui/core",
  importLine: 'import { Button } from "@umriss-ui/core";',
});
