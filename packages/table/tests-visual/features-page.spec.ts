/* One page, checked against this demo: code toggle, page toggle, copy button.
   The tests stand with the shell (`@umriss-ui/demo/checks/page.ts`) and run
   against every demo that uses the shell. */

import { checkPage } from "@umriss-ui/demo/checks/page";
import { open, openExample } from "./navigation";

checkPage({
  open,
  openExample,
  pageId: "manual-mode",
  examples: ["only-pages", "sort-and-search", "filter-options"],
  other: { name: "Column", pageId: "column" },
  packageName: "@umriss-ui/table",
  importLine: 'import { useTable } from "@umriss-ui/table";',
});
