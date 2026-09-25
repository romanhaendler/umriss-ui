/* One page, checked against this demo: code toggle, page toggle, copy button.
   The tests stand with the shell (`@umriss-ui/demo/checks/page.ts`) and run
   against every demo that uses the shell. */

import { checkPage } from "@umriss-ui/demo/checks/page";
import { open, openExample } from "./navigation";

checkPage({
  open,
  openExample,
  pageId: "table",
  examples: ["first-table", "sort-by-several-columns", "search"],
  other: { name: "Column", pageId: "column" },
  packageName: "@umriss-ui/table",
  importLine: 'import { useTable } from "@umriss-ui/table";',
});
